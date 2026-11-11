import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

// Real PostgreSQL semantics in WASM. This tests the migration, not hosted Auth.
const database = new PGlite();
let queryNumber = 0;
// PGlite reuses prepared plans across SET ROLE. Unique statements model the
// separate Supabase request sessions and avoid cached RLS initplans in WASM.
const db = {
  exec: (sql: string) => database.exec(sql),
  query: async <T = Record<string, unknown>>(sql: string, params?: unknown[]) => {
    return database.query<T>(`${sql} /* test_${++queryNumber} */`, params);
  },
  close: () => database.close(),
};
const adminId = "00000000-0000-0000-0000-000000000001";
const studentId = "00000000-0000-0000-0000-000000000002";
// Local fixture only: mirrors the owner-approved UUID without creating a hosted Auth user.
const approvedId = "978a7ac3-7385-4d3d-8b83-51855c8eb25a";
async function actor(id: string | null) {
  // Fixed test-only UUIDs: use simple SQL, not prepared statements, for session
  // setup. PGlite caches initplans across SET ROLE on reused prepared queries.
  await db.exec(`reset role; set request.jwt.claims = '${id ? JSON.stringify({ sub: id }) : "{}"}'; set role ${id ? "authenticated" : "anon"};`);
}

before(async () => {
  await db.exec(`create role anon nologin; create role authenticated nologin; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub','')::uuid $$; grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated; grant usage on schema public to anon, authenticated; insert into auth.users values ('${adminId}'),('${studentId}'),('${approvedId}');`);
  await db.exec(await readFile("supabase/migrations/202611010001_catalog.sql", "utf8"));
  await db.exec(await readFile("tests/fixtures/catalog-seed.sql", "utf8"));
  await db.exec(`insert into public.administrators(user_id) values ('${adminId}');`);
});
after(async () => { await db.close(); });

test("anonymous visitors read only the real published resource and public facets", async () => {
  await actor(null);
  const result = await db.query<{ title: string }>("select title from public.documents");
  assert.equal(result.rows.length, 1); assert.equal(result.rows[0].title, "MCQs Practice");
  const facets = await db.query<{ result: { subjects: unknown[]; courses: unknown[] } }>("select public.get_catalog_facets() as result");
  assert.equal(facets.rows[0].result.subjects.length, 1); assert.equal(facets.rows[0].result.courses.length, 1);
});
test("anonymous users cannot write or enumerate administrators", async () => {
  await actor(null);
  await assert.rejects(db.query("update public.documents set title='Unauthorized'"));
  await assert.rejects(db.query("select user_id from public.administrators"));
});
test("signed-in non-administrators do not gain write access", async () => {
  await actor(studentId);
  assert.equal((await db.query("update public.documents set title='Unauthorized' returning id")).rows.length, 0);
  await assert.rejects(db.query("insert into public.subjects(name,slug) values ('Unauthorized','unauthorized')"));
  assert.equal((await db.query("select user_id from public.administrators")).rows.length, 0);
});
test("authorized admin can create a draft invisible to students", async () => {
  await actor(adminId);
  const subject = await db.query<{ id: string }>("select id from public.subjects limit 1");
  await db.query("insert into public.documents(slug,title,description,original_url,platform,subject_id,topic,document_type) values ('test-draft','Test draft','A private draft for policy testing.','https://example.com/document','Other',$1,'Testing','Notes')", [subject.rows[0].id]);
  await actor(null);
  assert.equal((await db.query("select id,slug,title,publication_status from public.documents where slug='test-draft'")).rows.length, 0);
  await actor(studentId);
  assert.equal((await db.query("select id,slug,title,publication_status from public.documents where slug='test-draft'")).rows.length, 0);
  await actor(adminId);
  assert.equal((await db.query("select id,slug,title,publication_status from public.documents where slug='test-draft'")).rows.length, 1);
});
test("admin editing, publication, archive and confirmed metadata deletion work", async () => {
  await actor(adminId);
  const updated = await db.query<{ publication_status: string }>("update public.documents set publication_status='published',title='Edited title' where slug='test-draft' returning publication_status");
  assert.equal(updated.rows[0].publication_status,"published");
  await actor(null);
  assert.equal((await db.query("select id,slug,title,publication_status from public.documents where slug='test-draft'")).rows.length,1);
  await actor(adminId);
  await db.query("update public.documents set publication_status='archived',is_featured=false where slug='test-draft'");
  await actor(null);
  assert.equal((await db.query("select id,slug,title,publication_status from public.documents where slug='test-draft'")).rows.length,0);
  await actor(adminId);
  assert.equal((await db.query("delete from public.documents where slug='test-draft' returning id")).rows.length,1);
});
test("database constraints reject dangerous URLs, duplicate slugs and invalid status even for admins", async () => {
  await actor(adminId);
  const subject = await db.query<{ id: string }>("select id from public.subjects limit 1");
  const base = "insert into public.documents(slug,title,description,original_url,platform,subject_id,topic,document_type,publication_status) values ($1,'Valid title','Valid description for testing.',$2,'Other',$3,'Testing','Notes',$4)";
  await assert.rejects(db.query(base,["unsafe-url","javascript:alert(1)",subject.rows[0].id,"draft"]));
  await assert.rejects(db.query(base,["english-lost-spring-mcqs","https://example.com/file",subject.rows[0].id,"draft"]));
  await assert.rejects(db.query(base,["invalid-status","https://example.com/file",subject.rows[0].id,"private"]));
});
test("referenced categories cannot be deleted; full-text search uses the generated indexable vector", async () => {
  await actor(adminId);
  await assert.rejects(db.query("delete from public.subjects where slug='english'"));
  const found = await db.query("select id from public.documents where search_vector @@ websearch_to_tsquery('simple',$1)",["lost spring"]);
  assert.equal(found.rows.length,1);
});
test("approved membership insertion is idempotent and preserves the Auth UUID foreign key", async () => {
  await db.exec("reset role;");
  const insert = `insert into public.administrators(user_id) values ('${approvedId}') on conflict (user_id) do nothing`;
  await db.query(insert);
  const first = await db.query<{ created_at: string }>("select created_at::text as created_at from public.administrators where user_id=$1", [approvedId]);
  await db.query(insert);
  const result = await db.query<{ total: number; target: number; referenced: number; created_at: string }>(
    `select count(*)::int as total,
       count(*) filter (where a.user_id=$1)::int as target,
       count(u.id)::int as referenced,
       min(a.created_at::text) filter (where a.user_id=$1) as created_at
     from public.administrators a left join auth.users u on u.id=a.user_id`,
    [approvedId],
  );
  assert.equal(result.rows[0].total, 2); // original local fixture admin + approved local fixture
  assert.equal(result.rows[0].target, 1);
  assert.equal(result.rows[0].referenced, 2);
  assert.equal(result.rows[0].created_at, first.rows[0].created_at);
  await assert.rejects(db.query("insert into public.administrators(user_id) values ('00000000-0000-0000-0000-000000000099')"));
});
test("authenticated users cannot grant, alter or revoke administrator membership", async () => {
  await actor(studentId);
  await assert.rejects(db.query(`insert into public.administrators(user_id) values ('${studentId}')`));
  await assert.rejects(db.query(`update public.administrators set user_id='${studentId}' where user_id='${approvedId}'`));
  await assert.rejects(db.query(`delete from public.administrators where user_id='${approvedId}'`));
  assert.equal((await db.query<{ count: number }>("select count(*)::int as count from public.administrators")).rows[0].count, 0);
  assert.equal((await db.query<{ is_administrator: boolean }>("select public.is_administrator() as is_administrator")).rows[0].is_administrator, false);
});
test("seed is idempotent and never overwrites edited metadata", async () => {
  await db.exec("reset role;");
  await db.query("select set_config('request.jwt.claims', '', false)");
  await db.query("update public.documents set description='Owner edited description.' where slug='english-lost-spring-mcqs'");
  await db.exec(await readFile("tests/fixtures/catalog-seed.sql","utf8"));
  const result = await db.query<{ description: string }>("select description from public.documents where slug='english-lost-spring-mcqs'");
  assert.equal(result.rows.length,1); assert.equal(result.rows[0].description,"Owner edited description.");
});
