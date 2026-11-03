#!/usr/bin/env node
/**
 * AK research tooling — deterministic-search total-order verifier.
 *
 * Independent gate for the unapplied `202611020001_search_ranking.sql` RPC: builds AC's real schema in in-memory
 * PGlite, loads a 4,016-published-row corpus whose tie groups are deliberately large (400 rows sharing
 * title + ts_rank + created_at, 80 sharing a second title) with the fixture ids inserted in DESCENDING order, then
 * compares the shipped RPC against an independent full-scan oracle (no candidate CTE, no window, no LIMIT) on
 * totals, complete candidate/matched sets and ordered pages — plus 84-page and 34-page walks run twice, adjacency,
 * deep/tail/beyond offsets, page_size/offset clamps, facet combos, draft exclusion, anon/authenticated RLS and
 * table-intact assertions. It also builds parent/pre-fix and rejected-v2 variants in the same session to measure the
 * cost of determinism and to check order-equivalence of the narrow variants.
 *
 * Local only: nothing is applied to hosted Supabase and no network access is used.
 *
 * Usage — ESM resolves `node_modules` from **this file's directory**, not from cwd, so run it from inside a
 * working copy of the app under review (which has `@electric-sql/pglite` as a dev dependency):
 *   cp verify-search-ordering.mjs /path/to/target-tree/scripts/ak-verify.mjs
 *   cd /path/to/target-tree && npm ci
 *   AC_TREE=. PARENT_TREE=/path/to/parent-tree node scripts/ak-verify.mjs
 * (Alternatively, symlink the app's node_modules next to this file. Nothing here touches a hosted database.)
 */
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
const ROOT = process.env.AC_TREE ?? ".";   // a checkout of the commit under review
const PARENT = process.env.PARENT_TREE ?? ROOT; // a checkout of its parent (for the A/B control)
const T = ROOT, P = PARENT;
const out = (...a) => console.log(...a);
const fail = [];
const check = (cond, label, extra = "") => { if (!cond) { fail.push(label); out(`  FAIL ${label} ${extra}`); } };

const db = new PGlite();
const execSafe = async (sql) => { try { await db.exec(sql); } catch (e) { console.log("SQL FAILED:", String(e.message).split("\n")[0].slice(0, 200), "\n", (e.query ?? sql).slice(0, 0)); process.exit(1); } };
await db.exec(`create role anon nologin; create role authenticated nologin; create schema auth;
  create table auth.users(id uuid primary key);
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub','')::uuid $$;
  grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated;
  grant usage on schema public to anon, authenticated;`);
for (const f of [`${T}/supabase/migrations/202611010001_catalog.sql`, `${T}/supabase/seed.sql`,
                `${T}/supabase/migrations/202611010002_least_privilege_catalog_grants.sql`, `${T}/supabase/seed.test-fixtures.sql`]) await db.exec(readFileSync(f, "utf8"));

const target = readFileSync(`${T}/supabase/migrations/202611020001_search_ranking.sql`, "utf8");
await execSafe(target);
const rxHead = /(\n\s*select f\.\*, )row_number\(\) over \(\n(\s*)order by\n/;
const rxTail = /\n\s*\) as rn\n\s*from filtered f\n\s*order by rn\n/;
const rxAgg = /\) order by o\.rn\) from ordered o\)/;
for (const [name, rx] of [["window head", rxHead], ["window tail", rxTail], ["aggregate order", rxAgg]]) if (!rx.test(target)) throw new Error("anchor missing: " + name);
const variant = (name, transform) => {
    let t = target.replaceAll("public.search_catalog(", `public.${name}(`);
  const t2 = transform(t);
  if (t2 === t) throw new Error(`variant ${name}: transform was a no-op`);
  return t2;
};
await execSafe(readFileSync(`${P}/supabase/migrations/202611020001_search_ranking.sql`, "utf8").replaceAll("public.search_catalog(", "public.sc_parent("));
await execSafe(variant("sc_nowin", t => t.replace(rxHead, "\n    select f.*\n    from filtered f\n$2order by\n").replace(rxTail, "\n").replace(rxAgg, ")) from ordered o)")));
await execSafe(variant("sc_mat", t => t.replace("filtered as (", "filtered as materialized (")));
check(!readFileSync(`${P}/supabase/migrations/202611020001_search_ranking.sql`, "utf8").includes("f.id asc"), "parent has no uuid tie-break (A/B sanity)");
check(target.includes("f.id asc"), "target adds the uuid tie-break");
check(!target.includes("materialized"), "target ships no v2 materialisation (item 7)");
check(/row_number\(\) over/.test(target), "target keeps the row_number() window (item 7)");

// ---------- corpus (mine): 4,000 rows; 400 share title+rank+timestamp; ids deliberately DESCENDING ----------
const S = (await db.query("select id, slug from public.subjects order by slug")).rows;
const C = (await db.query("select id, slug from public.courses order by slug")).rows;
const subj = S.find(r => r.slug === "fixture-mathematics").id, subj2 = S.find(r => r.slug !== "fixture-mathematics").id;
const crs = C.find(r => r.slug === "fixture-class-10").id, crs2 = C.find(r => r.slug !== "fixture-class-10").id;
const TYPES = ["Worksheet", "Notes", "Reference", "Practice questions", "Presentation", "Other"];
const rows = [];
for (let i = 1; i <= 4000; i++) {
  const title = i <= 400 ? "Tied identical title" : i <= 480 ? "Equal" : `Scale resource ${String(i).padStart(5, "0")}`;
  const desc = i <= 400 ? "Synthetic body with graviton and zephyrq terms for filler probing."
    : i === 481 || i === 482 ? "akzephyr body only graviton" : `Body filler ${i} graviton zephyrq sem text.`;
  const uuid = `${(0x12000000 + (4001 - i) * 7919).toString(16).padStart(8, "0")}-0000-4000-8000-${(4001 - i).toString(16).padStart(12, "0")}`;
  rows.push(`('${uuid}', 'ak-${i}', '${title}', '${desc}', 'https://example.com/ak/${i}',
    ${i % 4 === 0 ? "'Google Drive'" : "'Other'"}, '${i % 2 ? subj : subj2}', '${i % 3 ? crs : crs2}',
    ${i % 3 === 0 ? "'Sem 1'" : "'Sem 2'"}, 'Scale', '${TYPES[i % TYPES.length]}',
    array['filler', 'kw${i % 90}'], array['aktag'], ${i % 7 === 0}, 'published',
    ${i <= 400 ? "'2024-01-01'::timestamptz" : i <= 482 ? "'2024-02-01'::timestamptz" : `'2024-03-01'::timestamptz + ((${i} % 4) * interval '1 day')`})`);
}
for (let i = 0; i < rows.length; i += 500) await db.exec(`insert into public.documents (id, slug, title, description, original_url, platform, subject_id, course_id, semester, topic, document_type, keywords, tags, is_featured, publication_status, created_at) values ${rows.slice(i, i + 500).join(",")}`);
await db.exec(`insert into public.documents (slug,title,description,original_url,platform,subject_id,course_id,topic,document_type,publication_status)
  values ('ak-draft','Tied identical title','Synthetic body with graviton and zephyrq terms for filler probing.','https://example.com/ak/draft','Other','${subj}','${crs}','Scale','Notes','draft')`);
await db.exec(`analyze public.documents`);
const counts = (await db.query(`select count(*)::int total, count(*) filter (where publication_status='published')::int published from public.documents`)).rows[0];
out(`CORPUS ${JSON.stringify(counts)} (4,000 mine + 16 fixtures published, 1 draft)`);
const desc0 = (await db.query(`select count(*)::int c from (select id, lag(id) over (order by cast(substring(slug,4) as int)) prev from public.documents where slug ~ '^ak-[0-9]+$' and cast(substring(slug,4) as int) <= 400) t where prev is not null and id > prev`)).rows[0].c;
out(`ANTI-VACUITY: tie ids descend along insertion order (rows where id > predecessor: ${desc0}, expect 0) → physical order cannot accidentally equal ascending-uuid order`);

// ---------- oracle: independent, no candidate CTE, no window, no limit/offset ----------
const WE = `setweight(to_tsvector('simple', d.title), 'A') ||
  setweight(to_tsvector('simple', coalesce(d.topic,'') || ' ' || public.document_terms(d.keywords) || ' ' || public.document_terms(d.tags)), 'B') ||
  setweight(to_tsvector('simple', s.name || ' ' || coalesce(c.name,'') || ' ' || coalesce(d.semester,'') || ' ' || d.document_type || ' ' || d.platform), 'C') ||
  setweight(to_tsvector('simple', coalesce(d.description,'')), 'D')`;
const ORACLE = `with v as (
  select d.id, d.title, d.created_at, d.is_featured, d.subject_id, d.course_id, d.semester, d.topic, d.document_type, d.platform,
    ${WE} as vector
  from public.documents d join public.subjects s on s.id = d.subject_id left join public.courses c on c.id = d.course_id
  where d.publication_status = 'published'
), ranked as (
  select v.*, ts_rank(v.vector, websearch_to_tsquery('simple', left(btrim(coalesce($1,'')), 200))) as rank
  from v
  where (btrim(coalesce($1,'')) = '' or v.vector @@ websearch_to_tsquery('simple', left(btrim(coalesce($1,'')), 200)))
    and ($2::uuid is null or v.subject_id = $2) and ($3::uuid is null or v.course_id = $3)
    and ($4::text is null or v.semester = $4) and ($5::text is null or v.topic = $5)
    and ($6::text is null or v.document_type = $6) and ($7::text is null or v.platform = $7)
    and (not coalesce($8::boolean, false) or v.is_featured)
)
select id, rank from ranked order by
  case when coalesce($9,'relevance') = 'title' then title end asc,
  case when coalesce($9,'relevance') = 'newest' then created_at end desc nulls last,
  case when coalesce($9,'relevance') not in ('title','newest') and btrim(coalesce($1,'')) <> '' then rank end desc,
  case when coalesce($9,'relevance') not in ('title','newest') and btrim(coalesce($1,'')) = '' then is_featured end desc,
  title asc, id asc`;
const oracle = async p => (await db.query(ORACLE, p.slice(0, 9))).rows;
const X = (q, sort = "relevance", size = null, offset = null, e = {}) =>
  [q, e.subject ?? null, e.course ?? null, e.semester ?? null, e.topic ?? null, e.type ?? null, e.platform ?? null, e.featured ?? false, sort, size, offset];
const call = async (fn, p) => {
  const r = await db.query(`select public.${fn}(query_text=>$1,subject_id_filter=>$2,course_id_filter=>$3,semester_filter=>$4,
    topic_filter=>$5,document_type_filter=>$6,platform_filter=>$7,featured_filter=>$8,sort_option=>$9,page_size=>$10,page_offset=>$11) res`, p);
  const d = r.rows[0].res; return typeof d === "string" ? JSON.parse(d) : d;
};
const ids = a => JSON.stringify(a.map(d => d.id));
const cmpId = (a, b) => (a < b ? -1 : 1);

const sv = await call("sc_nowin", X("Tied identical title", "relevance", 12, 0));
check(sv.documents.length === 12, "sc_nowin variant executes after data load");
out("\n=== A. candidate completeness + totals + ordered pages vs my own oracle ===");
const CASES = [
  ["akzephyr graviton", "relevance", null, null, {}], ["akzephyr graviton scale worksheet", "relevance", 12, 0, {}],
  ["1", "relevance", 12, 0, {}], ["10", "relevance", 12, 0, {}], ["481", "relevance", 12, 0, {}],
  ["Sem 1", "relevance", 48, 0, {}], ["Class 10", "relevance", 48, 0, {}], ["Class 1", "relevance", 48, 0, {}],
  ["Worksheet", "relevance", 48, 0, {}], ["Google Drive", "relevance", 48, 0, {}], ["Scale", "relevance", 48, 0, {}],
  ["\"intro boundary\"", "relevance", null, null, {}], ["filler OR aktag", "relevance", 48, 0, {}],
  ["graviton -title", "relevance", 48, 0, {}], ["-title", "relevance", 48, 0, {}],
  ["", "relevance", null, null, {}], ["\t ", "relevance", null, null, {}],
  ["\"unterminated", "relevance", null, null, {}], ["!!!", "relevance", null, null, {}],
  ["'); drop table public.documents; --", "relevance", null, null, {}], ["a".repeat(300), "relevance", null, null, {}],
  ["it's", "relevance", null, null, {}], ["nosuchternever", "relevance", null, null, {}],
  ["filler", "title", 48, 0, {}], ["filler", "newest", 48, 0, {}], ["filler", "relevance", 48, 0, {}],
  ["Tied identical title", "relevance", 48, 0, {}], ["Tied identical title", "title", 12, 0, {}],
  ["Tied identical title", "newest", 12, 0, {}], ["Equal", "relevance", null, null, {}], ["Equal", "title", 12, 0, {}],
  ["filler", "relevance", null, null, { subject: subj }], ["filler", "relevance", null, null, { subject: subj, course: crs, topic: "Scale" }],
  ["filler", "relevance", null, null, { subject: subj2, semester: "Sem 1", type: "Worksheet", platform: "Google Drive" }],
  ["filler", "relevance", null, null, { featured: true }], ["filler", "relevance", null, null, { subject: subj, course: crs2 }],
];
let nOk = 0;
for (const [q, sort, size, offset, e] of CASES) {
  const p = X(q, sort, size, offset, e);
  const exp = await oracle(p);
  const got = await call("search_catalog", p);
  const want = exp.map(r => r.id).slice(offset ?? 0, (offset ?? 0) + (size ?? 12));
  const ok = got.total === exp.length && ids(got.documents) === JSON.stringify(want);
  if (ok) nOk++; else out(`  FAIL ${JSON.stringify(q).slice(0, 28)}/${sort}: total ${got.total} vs ${exp.length}, page ${ids(got.documents) === JSON.stringify(want) ? "ok" : "MISMATCH"}`);
}
check(nOk === CASES.length, "oracle cases all pass", `${nOk}/${CASES.length}`);
out(`  oracle cases passed: ${nOk}/${CASES.length}`);

out("\n=== B. whitespace-only == blank browse; NULL/unknown sort == relevance ===");
{
  const blank = await call("search_catalog", X("", "relevance", 12, 0));
  const wsSpace = await call("search_catalog", X("   ", "relevance", 12, 0));
  const wsTab = await call("search_catalog", X(" \t ", "relevance", 12, 0));
  check(wsSpace.total === blank.total && ids(wsSpace.documents) === ids(blank.documents), "three spaces == blank browse");
  check(wsTab.total === blank.total && ids(wsTab.documents) === ids(blank.documents), "tab+spaces == blank browse (btrim covers \\t)");
  check(blank.documents.every(d => d.is_featured === true), "blank browse still featured-first");
  const punctOracle = await oracle(X("!!!", "relevance", null, null, {}));
  const punctRpc = await call("search_catalog", X("!!!", "relevance", 12, 0));
  check(punctRpc.total === punctOracle.length && punctRpc.total === 0, "punctuation-only query: 0 rows in BOTH paths (parity, no error)");
  const nul = await call("search_catalog", X("filler", null, 12, 0));
  const unk = await call("search_catalog", X("filler", "unknown", 12, 0));
  const rel = await call("search_catalog", X("filler", "relevance", 12, 0));
  check(ids(nul.documents) === ids(rel.documents), "explicit NULL sort == relevance");
  check(ids(unk.documents) === ids(rel.documents), "unknown sort value == relevance (no error)");
}

out("\n=== C. the tie contract: uuid ASC is the FINAL key and never an override ===");
{
  const exp = (await oracle(X("Tied identical title", "relevance", null, null, {}))).map(r => r.id);
  check(exp.length === 400, "400 published rows share title+rank+timestamp (draft excluded)", `${exp.length}`);
  const asc = [...exp].sort(cmpId);
  check(ids((await call("search_catalog", X("Tied identical title", "relevance", 48, 0))).documents) === JSON.stringify(asc.slice(0, 48)), "page 1 == ascending-uuid prefix of the tie set");
  for (const size of [12, 48]) {
    for (const pass of [1, 2]) {
      const joined = []; let totalBad = 0;
      for (let off = 0; off < exp.length; off += size) {
        const pg = await call("search_catalog", X("Tied identical title", "relevance", size, off));
        if (pg.total !== exp.length) totalBad++;
        joined.push(...pg.documents.map(d => d.id));
      }
      const label = `ties size ${size} x ${Math.ceil(exp.length / size)} pages, pass ${pass}`;
      check(totalBad === 0, `${label}: total stable`);
      check(new Set(joined).size === joined.length, `${label}: no duplicates`);
      check(JSON.stringify(joined) === JSON.stringify(asc), `${label}: concatenation == total order`);
    }
  }
  const p1 = await call("search_catalog", X("Tied identical title", "relevance", 12, 12));
  const p2 = await call("search_catalog", X("Tied identical title", "relevance", 12, 24));
  check(p1.documents[11].id < p2.documents[0].id, "adjacent pages strictly ascend, no overlap");
  check(JSON.stringify(p2.documents.map(d => d.id)) === JSON.stringify(asc.slice(24, 36)), "adjacent page content exact");
  const prec = await oracle(X("akzephyr", "relevance", null, null, {}));
  const first = await call("search_catalog", X("akzephyr", "relevance", 12, 0));
  check(prec.length >= 2, "precedence probe exists", `${prec.length}`);
  check(first.documents[0].title === "akzephyr body only graviton" || first.documents[0].id === prec[0].id, "relevance order preserved against the uuid tail (no override)", ids(first.documents.slice(0, 2)));
  const nm = await call("search_catalog", X("filler", "newest", 12, 0));
  const dts = nm.documents.map(d => d.created_at);
  check(dts.every((v, i) => i === 0 || dts[i - 1] >= v), "newest: created_at desc still dominates the uuid tail");
  const tm = await call("search_catalog", X("Equal", "title", 12, 0));
  check(tm.documents.every(d => d.title === "Equal"), "title mode: 80 'Equal' rows only", `${tm.total}`);
  check(JSON.stringify(tm.documents.map(d => d.id)) === JSON.stringify(tm.documents.map(d => d.id).sort(cmpId)), "title-mode ties ascend by uuid after title");
  const blank = await call("search_catalog", X("", "relevance", 48, 0));
  check(blank.documents.every(d => d.is_featured === true), "blank browse: featured block precedes, uuid breaks its ties");
  const bf = (await oracle(X("", "relevance", null, null, {}))).map(r => r.id);
  check(ids(blank.documents) === JSON.stringify(bf.slice(0, 48)), "blank browse page 1 == oracle total order over 4,016 rows");
}

out("\n=== D. parent RPC (pre-fix) on the SAME data — is the defect real here? ===");
{
  const asc = (await oracle(X("Tied identical title", "relevance", null, null, {}))).map(r => r.id).sort(cmpId);
  const seen = [], parentFirst = [];
  for (let off = 0; off < 400; off += 12) { const pg = await call("sc_parent", X("Tied identical title", "relevance", 12, off)); parentFirst.push(pg.documents[0]?.id); seen.push(...pg.documents.map(d => d.id)); }
  const dupes = seen.length - new Set(seen).size;
  const diffPos = seen.filter((v, i) => v !== asc[i]).length;
  out(`  parent: 34 pages, ids differing from the uuid total order = ${diffPos}, cross-page duplicates = ${dupes}`);
  const tp = await call("search_catalog", X("Tied identical title", "relevance", 12, 0));
  const pp = await call("sc_parent", X("Tied identical title", "relevance", 12, 0));
  out(`  target page1 ids: ${tp.documents.slice(0, 3).map(d => d.id.slice(0, 13)).join(" ")}`);
  out(`  parent page1 ids: ${pp.documents.slice(0, 3).map(d => d.id.slice(0, 13)).join(" ")}`);
  out(`  parent first-of-page varies across pages: ${new Set(parentFirst).size === parentFirst.length ? "all distinct (no repeat)" : "repeat observed"} — instability across *requests* is what the fix removes; local ordering also diverges from a total order by ${diffPos} positions`);
}

out("\n=== E. all pages of the 4,000-row result (84 pages of 48), twice ===");
{
  const p = X("filler", "relevance", null, null, {});
  const exp = (await oracle(p)).map(r => r.id);
  check(exp.length === 4000, "filler matches 4,000 rows", `${exp.length}`);
  for (const pass of [1, 2]) {
    const joined = []; let totalBad = 0;
    for (let off = 0; off < exp.length; off += 48) {
      const pg = await call("search_catalog", X("filler", "relevance", 48, off));
      if (pg.total !== exp.length) totalBad++;
      joined.push(...pg.documents.map(d => d.id));
    }
    check(totalBad === 0, `pass ${pass}: total stable over 84 pages`);
    check(new Set(joined).size === joined.length, `pass ${pass}: zero duplicate ids over 84 pages`, `${joined.length - new Set(joined).size} dupes`);
    check(JSON.stringify(joined) === JSON.stringify(exp), `pass ${pass}: 84-page concatenation equals the unpaginated total order`);
    out(`  pass ${pass}: rows ${joined.length}, pages ${Math.ceil(exp.length / 48)}, dupes ${joined.length - new Set(joined).size}, exact-order ${JSON.stringify(joined) === JSON.stringify(exp) ? "yes" : "NO"}`);
  }
  const tail = await call("search_catalog", X("filler", "relevance", 48, 3990));
  check(tail.documents.length === 10 && JSON.stringify(tail.documents.map(d => d.id)) === JSON.stringify(exp.slice(3990, 4000)), "tail page at offset 3,990 exact");
  const beyond = await call("search_catalog", X("filler", "relevance", 48, 99999));
  check(beyond.documents.length === 0 && beyond.total === 4000, "beyond-end page empty, total preserved");
}

out("\n=== F. facets / draft / bounds / roles / integrity ===");
{
  for (const [label, q, e] of [["semester", "filler", { semester: "Sem 1" }], ["type", "filler", { type: "Worksheet" }],
      ["platform", "filler", { platform: "Google Drive" }], ["topic", "Scale", { topic: "Scale" }], ["subject", "filler", { subject: subj }],
      ["course", "filler", { course: crs }], ["featured", "filler", { featured: true }], ["unknown subject id", "filler", { subject: "00000000-0000-4000-8000-000000000000" }],
      ["subject+semester+type", "filler", { subject: subj, semester: "Sem 2", type: "Notes" }]]) {
    const p = X(q, "relevance", null, null, e); const exp = await oracle(p); const got = await call("search_catalog", p);
    check(got.total === exp.length, `facet ${label} total`, `got ${got.total} want ${exp.length}`);
  }
  check((await call("search_catalog", X("ak-draft", "relevance", 12, 0))).total === 0, "draft invisible to a query that matches its title exactly");
  check((await call("search_catalog", X("Tied identical title", "relevance", 48, 0))).documents.every(d => d.publication_status === "published"), "payload contains only published rows");
  for (const [sz, want] of [[0, 1], [-5, 1], [9999, 48], [null, 12], [1, 1], [48, 48], [49, 48]]) {
    const r = await call("search_catalog", X("filler", "relevance", sz, 0));
    check(r.documents.length === want, `page_size ${sz} → ${want}`, `got ${r.documents.length}`);
  }
  for (const off of [-5, null]) {
    const r = await call("search_catalog", X("filler", "relevance", 12, off));
    check(r.documents.length === 12 && ids(r.documents) === JSON.stringify((await oracle(X("filler", "relevance", 12, 0))).map(x => x.id).slice(0, 12)), `offset ${off} clamped to 0`);
  }
  await db.exec("set role anon; set request.jwt.claims='{}';");
  check((await call("search_catalog", X("", "relevance", 12, 0))).total === 4016, "anon sees 4,016 published on blank browse");
  check((await call("search_catalog", X("filler", "relevance", 12, 0))).total === 4000, "anon 'filler' total 4,000");
  check((await call("search_catalog", X("ak-draft", "relevance", 12, 0))).total === 0, "anon cannot see the draft");
  let denied = ""; try { await db.query("insert into public.subjects(name,slug) values ('AK deny','ak-deny')"); } catch (e) { denied = e.code ?? "none"; }
  check(denied === "42501", "anon direct write denied 42501", denied);
  await db.exec("reset role; set role authenticated; set request.jwt.claims='{\"role\":\"authenticated\"}';");
  check((await call("search_catalog", X("ak-draft", "relevance", 12, 0))).total === 0, "authenticated (no user claim) cannot see the draft");
  check((await call("search_catalog", X("", "relevance", 12, 0))).total === 4016, "authenticated blank browse total unchanged");
  await db.exec("reset role; set request.jwt.claims='';");
  const after = (await db.query("select count(*)::int c from public.documents")).rows[0].c;
  check(after === counts.total, "documents table intact after every probe", `${after} vs ${counts.total}`);
}

out("\n=== G. order-equivalence of the rejected v2 shapes on this data ===");
{
  const set = [["ties page1", X("Tied identical title", "relevance", 48, 0)], ["ties page3", X("Tied identical title", "relevance", 48, 96)],
    ["filler page1", X("filler", "relevance", 48, 0)], ["filler newest page2", X("filler", "newest", 48, 48)],
    ["filler title page2", X("filler", "title", 48, 48)], ["blank browse", X("", "relevance", 48, 0)],
    ["Equal title page1", X("Equal", "title", 12, 0)]];
  for (const [label, p] of set) {
    const t = await call("search_catalog", p);
    for (const [vn, fn] of [["sc_nowin", "sc_nowin"], ["sc_mat", "sc_mat"]]) {
      const v = await call(fn, p);
      check(ids(t.documents) === ids(v.documents) && t.total === v.total, `${vn} equals target (${label})`);
    }
  }
  out("  (window-free and materialised variants return byte-identical id sequences here; AC's rejection of v2 was based on their own reconstruction's ordering gate)");
}

out("\n=== H. controlled A/B timings, same session, alternating, median of 7 ===");
{
  const med = async (fn, p, runs = 7) => { const s = []; for (let i = 0; i < runs; i++) { const t0 = performance.now(); await call(fn, p); s.push(performance.now() - t0); } s.sort((a, b) => a - b); return { med: +s[3].toFixed(1), min: +s[0].toFixed(1), max: +s[6].toFixed(1) }; };
  const FNS = [["target (with uuid tie-break)", "search_catalog"], ["parent (no tie-break)", "sc_parent"], ["target minus window", "sc_nowin"], ["target + materialised", "sc_mat"]];
  const cases = [["filler /48 (4,000 matches)", X("filler", "relevance", 48, 0)], ["ties /48 (400, all equal)", X("Tied identical title", "relevance", 48, 0)],
    ["filler deep /48 (off 1,980)", X("filler", "relevance", 48, 1980)], ["kw7 selective (~44)", X("kw7", "relevance", 48, 0)],
    ["blank browse /48 (4,016)", X("", "relevance", 48, 0)]];
  for (const [label, p] of cases) {
    const parts = [];
    for (const [lname, fn] of FNS) { const r = await med(fn, p); parts.push(`${lname}: ${r.med} ms`); }
    out(`  ${label.padEnd(28)} ${parts.join(" | ")}`);
  }
}

out("\n=== I. plans: eligibility vs planner choice vs the window node ===");
{
  const planText = async (sql, params = []) => (await db.query(`explain (analyze, buffers, format json) ${sql}`, params)).rows[0]["QUERY PLAN"][0];
  const nodes = pl => { const a = []; const walk = n => { a.push(n["Node Type"] + (n["Index Name"] ? ` ${n["Index Name"]}` : "")); (n.Plans ?? []).forEach(walk); }; walk(pl.Plan); return a; };
  for (const [label, term, pub] of [["predicate 'filler' + published", "filler", true], ["predicate 'kw7' + published", "kw7", true], ["predicate 'kw7' no pub filter", "kw7", false]]) {
    const where = `d.search_vector @@ websearch_to_tsquery('simple', $1)${pub ? " and d.publication_status = 'published'" : ""}`;
    const nat = await planText(`select d.id from public.documents d where ${where}`, [term]);
    out(`  ${label.padEnd(30)} natural:    ${nodes(nat).slice(0, 2).join(" → ")} | ${nat["Execution Time"].toFixed(2)} ms`);
    await db.exec("set enable_seqscan = off");
    const f = await planText(`select d.id from public.documents d where ${where}`, [term]);
    out(`${" ".repeat(34)}forced off: ${nodes(f).slice(0, 3).join(" → ")} | ${f["Execution Time"].toFixed(2)} ms`);
    await db.exec("reset enable_seqscan");
  }
  let body = target.slice(bodyStart, bodyEnd)
    .replaceAll("query_text", "'Tied identical title'::text").replaceAll("subject_id_filter", "null::uuid").replaceAll("course_id_filter", "null::uuid")
    .replaceAll("semester_filter", "null::text").replaceAll("topic_filter", "null::text").replaceAll("document_type_filter", "null::text")
    .replaceAll("platform_filter", "null::text").replaceAll("featured_filter", "false").replaceAll("sort_option", "'relevance'::text")
    .replaceAll("page_size", "48").replaceAll("page_offset", "0");
  const pb = await planText(body);
  out(`  full V1 body, literal inputs: ${nodes(pb.Plan).join(" → ")} | ${pb["Execution Time"].toFixed(2)} ms`);
  out(`  (EXPLAIN of the function call itself shows only a Result node — planned separately: not informative)`);
}

out("\n=== SUMMARY ===");
out(`  failed checks: ${fail.length}${fail.length ? " → " + fail.join(" | ") : " — all passed"}`);
await db.close();
