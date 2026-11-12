import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
const admin = "00000000-0000-0000-0000-000000000001";
const student = "00000000-0000-0000-0000-000000000002";
let serial = 0;
async function actor(id?: string) {
  await db.exec(`reset role; set request.jwt.claims = '${id ? JSON.stringify({ sub: id }) : "{}"}'; set role ${id ? "authenticated" : "anon"};`);
}
const query = (sql: string, args?: unknown[]) => db.query(`${sql} /* ${++serial} */`, args);
before(async () => {
  await db.exec(`create role anon nologin; create role authenticated nologin; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub','')::uuid $$; grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated; grant usage on schema public to anon, authenticated; insert into auth.users values ('${admin}'),('${student}');`);
  await db.exec(await readFile("supabase/migrations/202611010001_catalog.sql", "utf8"));
  await db.exec(`insert into public.administrators(user_id) values ('${admin}');`);
  await db.exec(await readFile("supabase/migrations/20261112131627_sql_workbench_shared_queries.sql", "utf8"));
});
after(async () => db.close());
test("shared queries: anonymous cannot write or read drafts or version history", async () => {
  await actor(admin);
  await query("insert into public.shared_sql_queries(title,description,sql_text,dialect) values ('Private draft','private','select 1','sqlite')");
  await query("insert into public.shared_sql_queries(title,description,sql_text,dialect,publication_status) values ('Public query','public','select 2','sqlite','published')");
  await actor();
  const rows = await query("select title from public.shared_sql_queries order by title");
  assert.deepEqual(rows.rows, [{ title: "Public query" }]);
  await assert.rejects(query("select * from public.shared_sql_query_versions"));
  await assert.rejects(query("select created_by from public.shared_sql_queries"));
  await assert.rejects(query("insert into public.shared_sql_queries(title,sql_text,dialect) values ('bad','select 1','sqlite')"));
  await assert.rejects(query("update public.shared_sql_queries set title='bad'"));
});
test("signed-in non-admin cannot edit, create or inspect versions", async () => {
  await actor(student);
  assert.equal((await query("update public.shared_sql_queries set title='bad' returning id")).rows.length, 0);
  await assert.rejects(query("insert into public.shared_sql_queries(title,sql_text,dialect) values ('bad','select 1','sqlite')"));
  assert.equal((await query("select * from public.shared_sql_query_versions")).rows.length, 0);
});
test("admin changes create append-only private versions; archive hides public query", async () => {
  await actor(admin);
  await query("update public.shared_sql_queries set sql_text='select 3', publication_status='archived' where title='Public query'");
  const versions = await query("select sql_text,publication_status from public.shared_sql_query_versions where title='Public query' order by id");
  assert.deepEqual(versions.rows, [{sql_text:"select 2",publication_status:"published"},{sql_text:"select 3",publication_status:"archived"}]);
  await assert.rejects(query("update public.shared_sql_query_versions set sql_text='altered'"));
  await assert.rejects(query("delete from public.shared_sql_query_versions"));
  await assert.rejects(query("insert into public.shared_sql_query_versions(query_id,title,description,sql_text,dialect,publication_status,changed_by) select id,title,description,sql_text,dialect,publication_status,created_by from public.shared_sql_queries limit 1"));
  await actor(); assert.equal((await query("select id,title from public.shared_sql_queries")).rows.length, 0);
});
