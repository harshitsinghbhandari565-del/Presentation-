import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("paper import adds 22 published resources, without overwriting existing records", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon nologin; create role authenticated nologin; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub','')::uuid $$;`);
    await db.exec(await readFile("supabase/migrations/202611010001_catalog.sql", "utf8"));
    const sql = await readFile("scripts/imports/math-papers.sql", "utf8");
    await db.exec(sql);
    await db.exec("update public.documents set title = 'Custom title' where slug = 'maths-paper-01'");
    await db.exec(sql);
    const { rows } = await db.query<{ count: number; published: number }>("select count(*)::int as count, count(*) filter (where publication_status = 'published')::int as published from public.documents");
    assert.deepEqual(rows[0], { count: 22, published: 22 });
    const custom = await db.query<{ title: string }>("select title from public.documents where slug = 'maths-paper-01'");
    assert.equal(custom.rows[0].title, "Custom title");
  } finally { await db.close(); }
});
