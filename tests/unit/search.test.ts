import test from "node:test";
import assert from "node:assert/strict";
import { compatibilityDocuments, deriveFacets } from "../../src/lib/catalog";
import { searchDocuments, filterDocuments, DEFAULT_FILTERS, parseFilters, libraryHref, normalizeSearch } from "../../src/lib/search";
import { sampleDocument } from "../fixtures/sample-document";
const docs = [sampleDocument];
test("compatibility catalog remains empty and tests use synthetic data", () => {
  assert.deepEqual(compatibilityDocuments, []);
  assert.equal(docs.length, 1);
  assert.equal(docs[0].slug, "english-lost-spring-mcqs");
  assert.equal(docs[0].course, "Class 12");
  assert.equal(docs[0].createdAt, null);
  assert.equal(docs[0].originalUrl.includes("ouid="), true);
});
test("search matches titles, descriptions, normalized topics and case-insensitive tags", () => {
  for (const q of ["MCQs", "practice", "lost spring", "ENGLISH", "class-12", "chapter", "well"]) {
    if (q === "well") assert.equal(searchDocuments(docs,q).length,0);
    else assert.equal(searchDocuments(docs,q).length,1,q);
  }
  assert.equal(searchDocuments(docs,"English Chapter 2").length,1);
  assert.equal(searchDocuments(docs,"nonexistent-resource").length,0);
  assert.equal(normalizeSearch("Ch 2 – The Lost Spring"), "ch 2 the lost spring");
});
test("filters compose and return real empty results", () => {
  assert.equal(filterDocuments(docs,{...DEFAULT_FILTERS,subject:"english",course:"class-12",platform:"Google Slides",type:"Presentation",featured:true}).length,1);
  assert.equal(filterDocuments(docs,{...DEFAULT_FILTERS,subject:"english",semester:"Semester 9"}).length,0);
  assert.equal(filterDocuments(docs,{...DEFAULT_FILTERS,q:"missing"}).length,0);
});
test("URL state is bounded and shareable; changing filters resets pagination", () => {
  const filters = parseFilters({q:"  notes  ",sort:"invalid",page:"-4",subject:["a","b"],featured:"true"});
  assert.equal(filters.q,"notes"); assert.equal(filters.sort,"relevance"); assert.equal(filters.page,1); assert.equal(filters.subject,""); assert.equal(filters.featured,true);
  assert.equal(libraryHref({...DEFAULT_FILTERS,subject:"english",page:4}),"/library?subject=english");
  assert.equal(libraryHref({...DEFAULT_FILTERS,subject:"english",page:2},false),"/library?subject=english&page=2");
});
test("subject facets derive from actual content", () => {
  const facets=deriveFacets(docs); assert.deepEqual(facets.subjects.map(s=>s.slug),["english"]); assert.deepEqual(facets.semesters,[]);
});
