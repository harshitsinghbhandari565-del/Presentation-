import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("hosted plan preparation is the exact parameterized V1 body and runs locally without installing the RPC", async () => {
  const migration = await readFile("supabase/migrations/202611020001_search_ranking.sql", "utf8");
  const script = await readFile("docs/hosted-search-plan-review.sql", "utf8");
  let body = migration.slice(migration.indexOf("  with parsed as ("), migration.indexOf("\n$$;"));
  const names = ["query_text", "subject_id_filter", "course_id_filter", "semester_filter", "topic_filter", "document_type_filter", "platform_filter", "featured_filter", "sort_option", "page_size", "page_offset"];
  for (const [i, name] of names.entries()) body = body.replace(new RegExp(`\\b${name}\\b`, "g"), `$${i + 1}`);
  assert.equal(script.slice(script.indexOf("  with parsed as ("), script.indexOf("\n-- Known original")), body);
  assert.match(script, /BEGIN READ ONLY;/);
  assert.match(script, /SET LOCAL ROLE anon;/);
  assert.match(script, /ROLLBACK;/);
  const db = new PGlite();
  try {
    await db.exec(`create role anon nologin; create role authenticated nologin; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub','')::uuid $$; grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated; grant usage on schema public to anon, authenticated;`);
    for (const path of ["supabase/migrations/202611010001_catalog.sql", "supabase/seed.sql", "supabase/migrations/202611010002_least_privilege_catalog_grants.sql"]) await db.exec(await readFile(path, "utf8"));
    const results = await db.exec(script);
    assert.equal(results.filter(r => r.rows.length > 0).length, 4); // three body plans, one predicate plan
    assert.equal((await db.query<{n:number}>("select count(*)::int n from public.documents")).rows[0].n, 1);
    assert.equal((await db.query<{present:boolean}>("select to_regprocedure('public.search_catalog(text,uuid,uuid,text,text,text,text,boolean,text,integer,integer)') is not null as present")).rows[0].present, false);
  } finally { await db.close(); }
});
