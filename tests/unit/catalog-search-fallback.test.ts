import test from "node:test";
import assert from "node:assert/strict";
import { CatalogUnavailableError, queryCatalog, searchCatalog, deriveFacets } from "../../src/lib/catalog";
import { DEFAULT_FILTERS } from "../../src/lib/search";
import type { EducationalDocument } from "../../src/types/document";
import fixtureData from "../../fixtures/review-catalog.json";

const documents = fixtureData as EducationalDocument[];
const document = documents[0];
const row = {
  id: document.id, slug: document.slug, title: document.title, description: document.description,
  original_url: document.originalUrl, platform: document.platform,
  subject_id: document.subjectId, course_id: document.courseId, semester: document.semester,
  topic: document.topic, document_type: document.documentType, thumbnail_url: null,
  keywords: document.keywords, tags: document.tags, is_featured: document.isFeatured,
  publication_status: "published", created_at: null, updated_at: null,
  presentation_url: null, embed_url: null, backup_links: [],
  subjects: { id: document.subjectId, name: document.subject, slug: document.subjectSlug },
  courses: { id: document.courseId, name: document.course, slug: document.courseSlug },
};
async function exercise(code: string | null, run: (requests: string[]) => Promise<void>) {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const originalFetch = globalThis.fetch;
  const requests: string[] = [];
  Object.assign(process.env, { NEXT_PUBLIC_SUPABASE_URL: "https://unit-test.invalid", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_TESTONLY12345678901234567890" });
  globalThis.fetch = async input => {
    const url = String(input instanceof Request ? input.url : input);
    requests.push(url);
    const headers = { "content-type": "application/json", "content-range": "0-0/1" };
    if (url.includes("/rpc/get_catalog_facets")) return new Response(JSON.stringify(deriveFacets(documents)), { status: 200, headers });
    if (url.includes("/rpc/search_catalog")) return new Response(JSON.stringify(code ? { code, message: "Synthetic failure" } : { total: 1, documents: [row] }), { status: code ? 404 : 200, headers });
    if (url.includes("/documents")) return new Response(JSON.stringify([row]), { status: 200, headers });
    throw new Error(`Unexpected request ${url}`);
  };
  try { await run(requests); }
  finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY; else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalKey;
  }
}

test("successful RPC preserves scalar subject/course normalization and relevance", async () => {
  await exercise(null, async requests => {
    const result = await queryCatalog({ ...DEFAULT_FILTERS, q: "algebra" });
    assert.equal(result.documents[0].subject, document.subject);
    assert.equal(result.documents[0].course, document.course);
    assert.equal(result.searchLimitation, undefined);
    assert.equal(requests.some(url => url.includes("/documents")), false);
  });
});
test("only the explicit missing-RPC response uses the disclosed document-field/title fallback", async () => {
  await exercise("PGRST202", async requests => {
    const result = await queryCatalog({ ...DEFAULT_FILTERS, q: "mathematics" });
    assert.equal(result.searchLimitation, "document-fields-fallback");
    assert.ok(requests.some(url => url.includes("/documents") && new URL(url).searchParams.get("order") === "title.asc,id.asc"));
    const command = await searchCatalog("mathematics");
    assert.equal(command.documents[0].slug, document.slug);
    assert.equal(command.searchLimited, true);
  });
});
test("unexpected RPC failures do not return misleading narrower results", async () => {
  await exercise("XX000", async requests => {
    const errors: unknown[] = [];
    const original = console.error;
    console.error = (...args: unknown[]) => { errors.push(args); };
    try {
      await assert.rejects(queryCatalog({ ...DEFAULT_FILTERS, q: "mathematics" }), CatalogUnavailableError);
      await assert.rejects(searchCatalog("mathematics"), CatalogUnavailableError);
    } finally { console.error = original; }
    assert.equal(requests.some(url => url.includes("/documents")), false);
    assert.equal(errors.length, 2);
  });
});

test("unknown taxonomy slugs never widen a ranked query", async () => {
  await exercise(null, async requests => {
    const result = await queryCatalog({ ...DEFAULT_FILTERS, q: "algebra", subject: "missing-subject" });
    assert.equal(result.total, 0);
    assert.equal(requests.some(url => url.includes("/rpc/search_catalog")), false);
  });
});
test("explicit sort still uses the full-coverage RPC for searches", async () => {
  await exercise(null, async requests => {
    const result = await queryCatalog({ ...DEFAULT_FILTERS, q: "algebra", sort: "title" });
    assert.equal(result.documents.length, 1);
    assert.equal(requests.some(url => url.includes("/rpc/search_catalog")), true);
    assert.equal(requests.some(url => url.includes("/documents")), false);
  });
});
