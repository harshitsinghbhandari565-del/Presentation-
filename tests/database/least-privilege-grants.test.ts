import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Regression test for the hosted Supabase default-privilege remediation.
// PGlite starts without Supabase's broad default ACLs, so this harness first
// reproduces the unsafe hosted grants, then applies the reviewed grant-only
// migration and verifies the intended least-privilege boundary.
const database = new PGlite();
let queryNumber = 0;
const db = {
  exec: (sql: string) => database.exec(sql),
  query: async <T = Record<string, unknown>>(sql: string, params?: unknown[]) => {
    return database.query<T>(`${sql} /* grant_test_${++queryNumber} */`, params);
  },
  close: () => database.close(),
};
const adminId = "00000000-0000-0000-0000-000000000001";
const studentId = "00000000-0000-0000-0000-000000000002";
const tables = ["subjects", "courses", "documents"] as const;
const remediationPath = "supabase/migrations/202611010002_least_privilege_catalog_grants.sql";

async function actor(id: string | null) {
  await db.exec(`reset role; set request.jwt.claims = '${id ? JSON.stringify({ sub: id }) : "{}"}'; set role ${id ? "authenticated" : "anon"};`);
}

before(async () => {
  await db.exec(`create role anon nologin; create role authenticated nologin; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub','')::uuid $$; grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated; grant usage on schema public to anon, authenticated; insert into auth.users values ('${adminId}'),('${studentId}');`);
  await db.exec(await readFile("supabase/migrations/202611010001_catalog.sql", "utf8"));
  await db.exec(await readFile("tests/fixtures/catalog-seed.sql", "utf8"));
  // Reproduce the unexpected hosted Supabase default grants observed before remediation.
  await db.exec(`grant all on public.subjects, public.courses, public.documents to anon, authenticated;`);
  await db.exec(await readFile(remediationPath, "utf8"));
  await db.exec(`insert into public.administrators(user_id) values ('${adminId}');`);
});
after(async () => { await db.close(); });

test("remediation removes dangerous table privileges and preserves intended grants", async () => {
  await db.exec("reset role;");
  for (const table of tables) {
    const target = `public.${table}`;
    const result = await db.query<{ role: string; can_select: boolean; can_insert: boolean; can_update: boolean; can_delete: boolean; can_truncate: boolean; can_references: boolean; can_trigger: boolean }>(
      `select r.rolname as role,
        has_table_privilege(r.rolname, $1, 'SELECT') as can_select,
        has_table_privilege(r.rolname, $1, 'INSERT') as can_insert,
        has_table_privilege(r.rolname, $1, 'UPDATE') as can_update,
        has_table_privilege(r.rolname, $1, 'DELETE') as can_delete,
        has_table_privilege(r.rolname, $1, 'TRUNCATE') as can_truncate,
        has_table_privilege(r.rolname, $1, 'REFERENCES') as can_references,
        has_table_privilege(r.rolname, $1, 'TRIGGER') as can_trigger
       from pg_roles r where r.rolname in ('anon','authenticated') order by r.rolname`,
      [target],
    );
    assert.equal(result.rows.length, 2);
    for (const row of result.rows) {
      assert.equal(row.can_select, true, `${row.role} should read ${table}`);
      assert.equal(row.can_truncate, false, `${row.role} must not truncate ${table}`);
      assert.equal(row.can_references, false, `${row.role} must not have references on ${table}`);
      assert.equal(row.can_trigger, false, `${row.role} must not have trigger on ${table}`);
      if (row.role === "anon") {
        assert.equal(row.can_insert, false); assert.equal(row.can_update, false); assert.equal(row.can_delete, false);
      } else {
        assert.equal(row.can_insert, true); assert.equal(row.can_update, true); assert.equal(row.can_delete, true);
      }
    }
  }
});

test("remediation is idempotent and does not alter catalog data", async () => {
  await db.exec("reset role;");
  const before = await db.query<{ fingerprint: string }>("select md5(row_to_json(d)::text) as fingerprint from public.documents d where slug='english-lost-spring-mcqs'");
  await db.exec(await readFile(remediationPath, "utf8"));
  const after = await db.query<{ fingerprint: string }>("select md5(row_to_json(d)::text) as fingerprint from public.documents d where slug='english-lost-spring-mcqs'");
  assert.equal(after.rows[0].fingerprint, before.rows[0].fingerprint);
  assert.equal((await db.query<{ count: number }>("select count(*)::int as count from public.documents")).rows[0].count, 1);
});

test("anonymous catalog reads still work after remediation", async () => {
  await actor(null);
  assert.equal((await db.query<{ count: number }>("select count(*)::int as count from public.documents")).rows[0].count, 1);
  assert.equal((await db.query<{ count: number }>("select count(*)::int as count from public.subjects")).rows[0].count, 1);
  assert.equal((await db.query<{ count: number }>("select count(*)::int as count from public.courses")).rows[0].count, 1);
  const facets = await db.query<{ result: { subjects: unknown[]; courses: unknown[] } }>("select public.get_catalog_facets() as result");
  assert.equal(facets.rows[0].result.subjects.length, 1);
  assert.equal(facets.rows[0].result.courses.length, 1);
  const search = await db.query("select id from public.documents where search_vector @@ websearch_to_tsquery('simple',$1)", ["lost spring"]);
  assert.equal(search.rows.length, 1);
});

test("anonymous writes are denied after remediation", async () => {
  await actor(null);
  await assert.rejects(db.query("insert into public.subjects(name,slug) values ('Denied','denied')"));
  await assert.rejects(db.query("update public.documents set title='Denied' where slug='english-lost-spring-mcqs'"));
  await assert.rejects(db.query("delete from public.documents where slug='english-lost-spring-mcqs'"));
  await assert.rejects(db.query("select user_id from public.administrators"));
});

test("authenticated non-administrators remain blocked by RLS after remediation", async () => {
  await actor(studentId);
  assert.equal((await db.query("update public.documents set title='Denied' where slug='english-lost-spring-mcqs' returning id")).rows.length, 0);
  assert.equal((await db.query("delete from public.documents where slug='english-lost-spring-mcqs' returning id")).rows.length, 0);
  await assert.rejects(db.query("insert into public.subjects(name,slug) values ('Denied','denied')"));
  assert.equal((await db.query("select user_id from public.administrators")).rows.length, 0);
  assert.equal((await db.query<{ count: number }>("select count(*)::int as count from public.documents")).rows[0].count, 1);
});

test("original external URLs remain unchanged after remediation", async () => {
  await db.exec("reset role;");
  const result = await db.query<{ original_url: string; presentation_url: string; embed_url: string; backup_links: { url: string }[] }>(
    "select original_url,presentation_url,embed_url,backup_links from public.documents where slug='english-lost-spring-mcqs'",
  );
  assert.equal(result.rows.length, 1);
  assert.equal(result.rows[0].original_url, "https://example.com/fixture/document?ouid=test");
  assert.equal(result.rows[0].presentation_url, "https://example.com/fixture/present");
  assert.equal(result.rows[0].embed_url, "https://docs.google.com/presentation/d/fixture/embed");
  assert.equal(result.rows[0].backup_links[0].url, "https://example.com/fixture/backup");
});

test("authorized administrators retain catalog writes after remediation", async () => {
  await actor(adminId);
  const subject = await db.query<{ id: string }>("select id from public.subjects where slug='english'");
  await db.query("insert into public.documents(slug,title,description,original_url,platform,subject_id,topic,document_type,publication_status) values ('grant-test-draft','Grant test draft','A local regression-test draft.','https://example.com/document','Other',$1,'Testing','Notes','draft')", [subject.rows[0].id]);
  assert.equal((await db.query("update public.documents set title='Grant test edited' where slug='grant-test-draft' returning id")).rows.length, 1);
  assert.equal((await db.query("delete from public.documents where slug='grant-test-draft' returning id")).rows.length, 1);
  await db.query("insert into public.subjects(name,slug) values ('Grant Test','grant-test')");
  assert.equal((await db.query("update public.subjects set name='Grant Test Edited' where slug='grant-test' returning id")).rows.length, 1);
  assert.equal((await db.query("delete from public.subjects where slug='grant-test' returning id")).rows.length, 1);
});
