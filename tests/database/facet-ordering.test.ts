import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const database = new PGlite();
let n = 0;
const db = {
  exec: (sql: string) => database.exec(sql),
  query: async <T = Record<string, unknown>>(sql: string, params?: unknown[]) => database.query<T>(`${sql} /* facet_test_${++n} */`, params),
  close: () => database.close(),
};
before(async () => {
  await db.exec(`create role anon nologin; create role authenticated nologin; create schema auth; create table auth.users(id uuid primary key); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub','')::uuid $$; grant usage on schema auth to anon, authenticated; grant execute on function auth.uid() to anon, authenticated; grant usage on schema public to anon, authenticated;`);
  await db.exec(await readFile("supabase/migrations/202611010001_catalog.sql", "utf8"));
  await db.exec(await readFile("supabase/seed.sql", "utf8"));
  await db.exec(await readFile("supabase/migrations/202611010002_least_privilege_catalog_grants.sql", "utf8"));
  await db.exec(await readFile("supabase/seed.test-fixtures.sql", "utf8"));
  await db.exec(await readFile("supabase/migrations/202611040001_facet_ordering.sql", "utf8"));
});
after(async () => { await db.close(); });

async function facets() {
  return (await db.query<{ result: { subjects: { id: string; name: string; slug: string }[]; courses: { id: string; name: string; slug: string }[] } }>(
    "select public.get_catalog_facets() as result",
  )).rows[0].result;
}

test("facet ordering breaks subject name ties on primary key", async () => {
  // Insert subjects with duplicate names in REVERSE id order. Without the
  // s.id tie-break, jsonb_agg ORDER BY s.name is non-deterministic for ties;
  // with it, the order is deterministic by (name, id).
  await db.exec(`insert into public.subjects(id, name, slug) values
    ('22222222-2222-4222-8222-222222222222', 'Tie Subject', 'tie-subject-b'),
    ('11111111-1111-4111-8111-111111111111', 'Tie Subject', 'tie-subject-a'),
    ('33333333-3333-4333-8333-333333333333', 'Alpha Subject', 'alpha-subject');`);
  // Each subject needs a published document to appear in the facets.
  await db.exec(`insert into public.documents(slug, title, description, original_url, platform, subject_id, topic, document_type, publication_status) values
    ('tie-subject-b-doc', 'Doc B', 'A published document for tie subject B.', 'https://example.com/b', 'Other', '22222222-2222-4222-8222-222222222222', 'Tie Topic', 'Notes', 'published'),
    ('tie-subject-a-doc', 'Doc A', 'A published document for tie subject A.', 'https://example.com/a', 'Other', '11111111-1111-4111-8111-111111111111', 'Tie Topic', 'Notes', 'published'),
    ('alpha-subject-doc', 'Doc Alpha', 'A published document for alpha subject.', 'https://example.com/alpha', 'Other', '33333333-3333-4333-8333-333333333333', 'Alpha Topic', 'Notes', 'published');`);

  const result = await facets();
  const testSubjects = result.subjects.filter((s) => s.slug === "tie-subject-a" || s.slug === "tie-subject-b" || s.slug === "alpha-subject");

  // Alpha Subject sorts first (alphabetical by name).
  assert.equal(testSubjects[0].name, "Alpha Subject");

  // The two Tie Subjects must be ordered by id ascending, not insertion order.
  const tieSubjects = testSubjects.filter((s) => s.name === "Tie Subject");
  assert.equal(tieSubjects.length, 2);
  assert.deepEqual(tieSubjects.map((s) => s.id), [
    "11111111-1111-4111-8111-111111111111",
    "22222222-2222-4222-8222-222222222222",
  ]);
});

test("facet ordering breaks course name ties on primary key", async () => {
  // Reuse the alpha-subject from the previous test as the documents' subject.
  const subjectId = (await db.query<{ id: string }>("select id from public.subjects where slug='alpha-subject'")).rows[0].id;

  await db.exec(`insert into public.courses(id, name, slug) values
    ('44444444-4444-4444-8444-444444444444', 'Tie Course', 'tie-course-b'),
    ('55555555-5555-4555-8555-555555555555', 'Tie Course', 'tie-course-a'),
    ('66666666-6666-4666-8666-666666666666', 'Alpha Course', 'alpha-course');`);
  await db.exec(`insert into public.documents(slug, title, description, original_url, platform, subject_id, course_id, topic, document_type, publication_status) values
    ('tie-course-b-doc', 'Doc B', 'A published document for tie course B.', 'https://example.com/b', 'Other', '${subjectId}', '44444444-4444-4444-8444-444444444444', 'Tie Topic', 'Notes', 'published'),
    ('tie-course-a-doc', 'Doc A', 'A published document for tie course A.', 'https://example.com/a', 'Other', '${subjectId}', '55555555-5555-4555-8555-555555555555', 'Tie Topic', 'Notes', 'published'),
    ('alpha-course-doc', 'Doc Alpha', 'A published document for alpha course.', 'https://example.com/alpha', 'Other', '${subjectId}', '66666666-6666-4666-8666-666666666666', 'Alpha Topic', 'Notes', 'published');`);

  const result = await facets();
  const testCourses = result.courses.filter((c) => c.slug === "tie-course-a" || c.slug === "tie-course-b" || c.slug === "alpha-course");

  // Alpha Course sorts first (alphabetical by name).
  assert.equal(testCourses[0].name, "Alpha Course");

  // The two Tie Courses must be ordered by id ascending, not insertion order.
  const tieCourses = testCourses.filter((c) => c.name === "Tie Course");
  assert.equal(tieCourses.length, 2);
  assert.deepEqual(tieCourses.map((c) => c.id), [
    "44444444-4444-4444-8444-444444444444",
    "55555555-5555-4555-8555-555555555555",
  ]);
});

test("facet ordering migration is idempotent", async () => {
  // Re-applying the migration must not fail and must preserve the tie-break.
  await db.exec(await readFile("supabase/migrations/202611040001_facet_ordering.sql", "utf8"));
  const definition = await db.query<{ definition: string }>(
    "select pg_get_functiondef('public.get_catalog_facets()'::regprocedure) as definition",
  );
  assert.match(definition.rows[0].definition, /order by s\.name, s\.id/);
  assert.match(definition.rows[0].definition, /order by c\.name, c\.id/);
});

test("facet ordering migration fails closed when function does not exist", async () => {
  const freshDb = new PGlite();
  try {
    await assert.rejects(
      freshDb.exec(await readFile("supabase/migrations/202611040001_facet_ordering.sql", "utf8")),
      /get_catalog_facets\(\) must exist/,
    );
  } finally {
    await freshDb.close();
  }
});
