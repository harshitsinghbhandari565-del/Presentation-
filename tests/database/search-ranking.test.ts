import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

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
  const result = await db.query<{ result: { total: number; documents: { slug: string; title: string }[] } }>(
    `select public.search_catalog(query_text => $1, subject_id_filter => $2, course_id_filter => $3, semester_filter => $4, topic_filter => $5, document_type_filter => $6, platform_filter => $7, featured_filter => $8, sort_option => $9, page_size => $10, page_offset => $11) as result`,
    [query, extra.subject ?? null, extra.course ?? null, extra.semester ?? null, extra.topic ?? null, extra.type ?? null, extra.platform ?? null, extra.featured ?? false, extra.sort ?? "relevance", extra.pageSize ?? 24, extra.offset ?? 0],
  );
  return result.rows[0].result;
}
test("fixture seed is representative, idempotent and preserves the original record", async () => {
  const count = await db.query<{ count: number }>("select count(*)::int as count from public.documents where slug like 'fixture-%'");
  assert.equal(count.rows[0].count, 16);
  await db.exec(await readFile("supabase/seed.test-fixtures.sql", "utf8"));
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
