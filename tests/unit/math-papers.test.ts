import test from "node:test";
import assert from "node:assert/strict";
import { mathPaperDownload, mathPaperForSlug } from "../../src/lib/math-papers";

test("all 22 papers map to distinct, pinned PDF downloads", () => {
  const papers = Array.from({ length: 22 }, (_, i) => mathPaperForSlug(`maths-paper-${String(i + 1).padStart(2, "0")}`)!);
  assert.equal(new Set(papers.map(p => p.filename)).size, 22);
  for (const paper of papers) {
    assert.match(paper.originalUrl, /\/raw\/[a-f0-9]{40}\/extracted_papers\/Paper_\d{2}\.pdf$/);
    assert.match(paper.fetchUrl, /ref=[a-f0-9]{40}$/);
    assert.match(paper.downloadUrl, /^\/api\/download\/maths-paper-\d{2}$/);
  }
});

test("invalid slugs, changed sources and unpublished papers never expose downloads", () => {
  for (const slug of ["maths-paper-00", "maths-paper-23", "maths-paper-1", "../maths-paper-01", "maths-paper-01.pdf"]) assert.equal(mathPaperForSlug(slug), null);
  const slug = "maths-paper-01";
  const originalUrl = mathPaperForSlug(slug)!.originalUrl;
  assert.ok(mathPaperDownload({ slug, originalUrl, publicationStatus: "published" }));
  assert.equal(mathPaperDownload({ slug, originalUrl, publicationStatus: "draft" }), null);
  assert.equal(mathPaperDownload({ slug, originalUrl: "https://example.com/other.pdf", publicationStatus: "published" }), null);
});

import { respondWithMathPaper } from "../../src/lib/math-paper-response";

test("downloads stream an attachment and reject deleted, mismatched and invalid resources", async () => {
  const slug = "maths-paper-01";
  const paper = mathPaperForSlug(slug)!;
  const doc = { slug, originalUrl: paper.originalUrl, publicationStatus: "published" };
  let calls = 0;
  const fetcher: typeof fetch = async input => {
    calls++;
    assert.equal(input, paper.cdnUrl);
    return new Response("%PDF-1.7\nexample", { headers: { "Content-Type": "application/octet-stream" } });
  };
  const response = await respondWithMathPaper(slug, async () => doc, fetcher);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "application/pdf");
  assert.equal(response.headers.get("content-disposition"), 'attachment; filename="Paper_01.pdf"');
  assert.equal(await response.text(), "%PDF-1.7\nexample");
  assert.equal((await respondWithMathPaper(slug, async () => null, fetcher)).status, 404);
  assert.equal((await respondWithMathPaper("../bad", async () => doc, fetcher)).status, 404);
  assert.equal((await respondWithMathPaper(slug, async () => ({ ...doc, originalUrl: "https://example.com/evil" }), fetcher)).status, 404);
  assert.equal(calls, 1);
});

test("download falls back to the API and handles upstream errors without returning HTML as a PDF", async () => {
  const slug = "maths-paper-22";
  const paper = mathPaperForSlug(slug)!;
  const lookup = async () => ({ slug, originalUrl: paper.originalUrl, publicationStatus: "published" });
  const fetcher: typeof fetch = async input => input === paper.cdnUrl
    ? new Response("not found", { status: 404 })
    : new Response("%PDF-1.7", { headers: { "Content-Type": "application/vnd.github.raw+json" } });
  assert.equal((await respondWithMathPaper(slug, lookup, fetcher)).status, 200);
  assert.equal((await respondWithMathPaper(slug, lookup, async () => new Response("error", { headers: { "Content-Type": "text/html" } }))).status, 502);
  assert.equal((await respondWithMathPaper(slug, async () => { throw new Error("offline"); }, fetcher)).status, 503);
});
