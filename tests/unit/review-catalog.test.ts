import test from "node:test";
import assert from "node:assert/strict";
import { loadReviewDocuments } from "../../src/lib/review-catalog";
import { getReviewDocuments } from "../../src/lib/catalog";

async function withEnvironment<T>(value: string, run: () => Promise<T>): Promise<T> {
  const original = process.env.NODE_ENV;
  Object.assign(process.env, { NODE_ENV: value });
  try { return await run(); }
  finally { if (original === undefined) Reflect.deleteProperty(process.env, "NODE_ENV"); else Object.assign(process.env, { NODE_ENV: original }); }
}

test("development fixtures provide multi/one/empty published views and requested edge cases", async () => {
  await withEnvironment("development", async () => {
    const multi = await loadReviewDocuments("1");
    assert.equal(multi?.length, 15);
    assert.equal((await loadReviewDocuments("one"))?.length, 1);
    assert.deepEqual(await loadReviewDocuments("empty"), []);
    assert.ok(multi?.every(document => document.publicationStatus === "published" && document.slug.startsWith("fixture-")));
    assert.ok(multi?.some(document => document.description === ""));
    assert.ok(multi?.some(document => document.title.length === 150));
    assert.ok(multi?.some(document => document.platform === "Dropbox" && document.originalUrl.startsWith("https://www.dropbox.com/")));
    assert.ok(new Set(multi?.map(document => document.documentType)).size >= 5);
  });
});
test("production and invalid switches cannot load fixtures, even through the catalog wrapper", async () => {
  await withEnvironment("production", async () => {
    assert.equal(await loadReviewDocuments("1"), null);
    assert.equal(await getReviewDocuments("1"), null);
    assert.equal(await getReviewDocuments("empty"), null);
  });
  await withEnvironment("development", async () => { assert.equal(await getReviewDocuments("anything-else"), null); });
});
