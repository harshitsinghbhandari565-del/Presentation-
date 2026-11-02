import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { filterDocuments, DEFAULT_FILTERS } from "../../src/lib/search";
import type { EducationalDocument } from "../../src/types/document";
import fixtureData from "../../fixtures/review-catalog.json";
import { compatibilityDocuments } from "../../src/lib/catalog";

const database = new PGlite();
let n = 0;
const db = {
  exec: (sql: string) => database.exec(sql),
  query: async <T = Record<string, unknown>>(sql: string, params?: unknown[]) => database.query<T>(`${sql} /* rank_test_${++n} */`, params),
  close: () => database.close(),
};
before(async () => {
  await db.exec(`create role anon nologin; create role authenticated nologin; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub','')::uuid $$; grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated; grant usage on schema public to anon, authenticated;`);
  await db.exec(await readFile("supabase/migrations/202611010001_catalog.sql", "utf8"));
  await db.exec(await readFile("supabase/seed.sql", "utf8"));
  await db.exec(await readFile("supabase/migrations/202611010002_least_privilege_catalog_grants.sql", "utf8"));
  await db.exec(await readFile("supabase/seed.test-fixtures.sql", "utf8"));
  await db.exec(await readFile("supabase/migrations/202611020001_search_ranking.sql", "utf8"));
});
after(async () => { await db.close(); });

async function search(query: string, extra: Record<string, unknown> = {}) {
  const result = await db.query<{ result: { total: number; documents: ({ slug: string; title: string } & Record<string, unknown>)[] } }>(
    `select public.search_catalog(query_text => $1, subject_id_filter => $2, course_id_filter => $3, semester_filter => $4, topic_filter => $5, document_type_filter => $6, platform_filter => $7, featured_filter => $8, sort_option => $9, page_size => $10, page_offset => $11) as result`,
    [query, extra.subject ?? null, extra.course ?? null, extra.semester ?? null, extra.topic ?? null, extra.type ?? null, extra.platform ?? null, extra.featured ?? false, extra.sort ?? "relevance", "pageSize" in extra ? extra.pageSize : 24, "offset" in extra ? extra.offset : 0],
  );
  return result.rows[0].result;
}
test("fixture seed is representative, idempotent and preserves the original record", async () => {
  const count = await db.query<{ count: number }>("select count(*)::int as count from public.documents where slug like 'fixture-%'");
  assert.equal(count.rows[0].count, 16);
  const beforeOriginal = await db.query<{ json: string }>("select row_to_json(d)::text as json from public.documents d where slug='english-lost-spring-mcqs'");
  await db.exec(await readFile("supabase/seed.test-fixtures.sql", "utf8"));
  const afterOriginal = await db.query<{ json: string }>("select row_to_json(d)::text as json from public.documents d where slug='english-lost-spring-mcqs'");
  assert.equal(afterOriginal.rows[0].json, beforeOriginal.rows[0].json);
  const again = await db.query<{ count: number }>("select count(*)::int as count from public.documents where slug like 'fixture-%'");
  assert.equal(again.rows[0].count, 16);
  const original = await db.query<{ title: string }>("select title from public.documents where slug='english-lost-spring-mcqs'");
  assert.equal(original.rows[0].title, "MCQs Practice");
});
test("setweight/ts_rank ranks title above description and tags; featured does not override query relevance", async () => {
  const result = await search("algebra");
  assert.ok(result.total >= 3);
  assert.equal(result.documents[0].slug, "fixture-algebra-title");
  const slugs = result.documents.map(d => d.slug);
  assert.ok(slugs.indexOf("fixture-algebra-title") < slugs.indexOf("fixture-algebra-body"));
  assert.ok(slugs.indexOf("fixture-algebra-title") < slugs.indexOf("fixture-algebra-tag"));
});
test("search excludes drafts, respects filters and keeps explicit title/newest sorts", async () => {
  const draft = await search("draft");
  assert.equal(draft.documents.some(d => d.slug === "fixture-draft-hidden"), false);
  const math = await search("", { subject: (await db.query<{ id: string }>("select id from public.subjects where slug='fixture-mathematics'")).rows[0].id });
  assert.ok(math.documents.every(d => d.slug.startsWith("fixture-") || d.slug === "english-lost-spring-mcqs"));
  const title = await search("fixture", { sort: "title", pageSize: 48 });
  const titles = title.documents.map(d => d.title);
  assert.deepEqual(titles, [...titles].sort((a, b) => a.localeCompare(b)));
});
test("anonymous callers can execute the security-invoker ranking RPC but cannot write", async () => {
  await db.exec(`reset role; set request.jwt.claims = '{}'; set role anon;`);
  const result = await db.query<{ result: { total: number } }>("select public.search_catalog(query_text => 'photosynthesis') as result");
  assert.ok(result.rows[0].result.total >= 2);
  await assert.rejects(db.query("insert into public.subjects(name,slug) values ('Denied','denied-rank')"));
  await db.exec("reset role;");
});

const reviewDocuments = [...(fixtureData as EducationalDocument[]).filter(document => document.publicationStatus === "published"), ...compatibilityDocuments];
test("RPC and compatibility agree on semester, type, platform, subject, course and cross-field coverage", async () => {
  for (const query of ["Sem 1", "Worksheet", "Google Drive", "Google Slides", "Dropbox", "Fixture Mathematics", "Fixture Class 10", "mathematics algebra", "algebra geometry", "draft"]) {
    const sql = await search(query, { pageSize: 48 });
    const compatibility = filterDocuments(reviewDocuments, { ...DEFAULT_FILTERS, q: query });
    assert.deepEqual(new Set(sql.documents.map(document => document.slug)), new Set(compatibility.map(document => document.slug)), query);
    assert.equal(sql.total, compatibility.length, query);
    assert.ok(sql.total > 0 || query === "draft", query);
  }
  const filtered = await search("Sem 1", { type: "Worksheet", pageSize: 48 });
  const expected = filterDocuments(reviewDocuments, { ...DEFAULT_FILTERS, q: "Sem 1", type: "Worksheet" });
  assert.deepEqual(new Set(filtered.documents.map(document => document.slug)), new Set(expected.map(document => document.slug)));
  assert.equal(filtered.total, 3);
});
test("explicit NULL paging uses 12/0 defaults; bounds and scalar relation shape are preserved", async () => {
  const defaults = await db.query<{ result: { total: number; documents: Record<string, unknown>[] } }>("select public.search_catalog() as result");
  const nulls = await search("", { pageSize: null, offset: null });
  assert.equal(defaults.rows[0].result.documents.length, 12);
  assert.deepEqual(nulls.documents, defaults.rows[0].result.documents);
  assert.equal((await search("", { pageSize: 0 })).documents.length, 1);
  assert.equal((await search("", { pageSize: 100, offset: -5 })).documents.length, 16);
  const row = nulls.documents[0];
  assert.equal(typeof row.subjects, "object");
  assert.ok(row.subjects && !Array.isArray(row.subjects));
  assert.ok(row.courses === null || (typeof row.courses === "object" && !Array.isArray(row.courses)));
  const shape = await db.query<{ kind: string }>("select jsonb_typeof(public.search_catalog(query_text => 'algebra')->'documents'->0->'subjects') as kind");
  assert.equal(shape.rows[0].kind, "object");
});
test("ranking keeps relevance with taxonomy weights and paginates without gaps", async () => {
  const all = await search("fixture", { sort: "title", pageSize: 48 });
  const page = await search("fixture", { sort: "title", pageSize: 5, offset: 5 });
  assert.deepEqual(page.documents.map(document => document.slug), all.documents.slice(5, 10).map(document => document.slug));
  const ranked = await search("mathematics algebra");
  assert.equal(ranked.documents[0].slug, "fixture-algebra-title");
});
test("candidate filtering retains the existing GIN path; selective scale probe is index-eligible", async () => {
  const definition = await db.query<{ definition: string }>("select pg_get_functiondef('public.search_catalog(text,uuid,uuid,text,text,text,text,boolean,text,integer,integer)'::regprocedure) as definition");
  assert.match(definition.rows[0].definition, /d\.search_vector @@ q\.candidate_tsq/);
  assert.match(definition.rows[0].definition, /from matching_ids m/i);
  await db.exec(`insert into public.documents(slug,title,description,original_url,platform,subject_id,topic,document_type,publication_status)
    select 'fixture-scale-' || i, case when i = 3141 then 'zephyrquartz3141' else 'Scale record ' || i end,
      'Local synthetic scale fixture.', 'https://example.com/fixtures/scale/' || i, 'Other', id, 'Scale', 'Notes', 'published'
    from public.subjects, generate_series(1,4016) i where slug='fixture-mathematics';
    analyze public.documents;`);
  try {
    // Planner cost on this PGlite instance prefers a sequential scan at 4k rows.
    // Force the planner switch only to prove the predicate is GIN-index eligible.
    await db.exec("set enable_seqscan = off;");
    const plan = await db.query<{ plan: unknown }>("explain (format json) select id from public.documents where search_vector @@ websearch_to_tsquery('simple','zephyrquartz3141')");
    assert.match(JSON.stringify(plan.rows[0]), /documents_search_idx/);
    const result = await search("zephyrquartz3141");
    assert.deepEqual(result.documents.map(document => document.slug), ["fixture-scale-3141"]);
    assert.equal((await search("noSuchScaleTermEver")).total, 0);
  } finally {
    await db.exec("reset enable_seqscan;");
    await db.exec("delete from public.documents where slug like 'fixture-scale-%';");
  }
});

test("websearch OR, excluded terms and phrase syntax use the complete query after candidate filtering", async () => {
  const either = await search("algebra OR chemistry", { pageSize: 48 });
  assert.ok(either.documents.some(item => item.slug === "fixture-algebra-title"));
  assert.ok(either.documents.some(item => item.slug === "fixture-science-featured"));
  const notGeometry = await search("algebra -geometry", { pageSize: 48 });
  assert.ok(notGeometry.documents.some(item => item.slug === "fixture-algebra-title"));
  assert.equal(notGeometry.documents.some(item => item.slug === "fixture-algebra-body"), false);
  const onlyNegative = await search("-algebra", { pageSize: 48 });
  assert.equal(onlyNegative.documents.some(item => item.slug === "fixture-algebra-title"), false);
  assert.ok(onlyNegative.total > 0);
  const phrase = await search('"algebra practice"', { pageSize: 48 });
  assert.ok(phrase.documents.some(item => item.slug === "fixture-algebra-title"));
});
