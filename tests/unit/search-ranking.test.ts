import test from "node:test";
import assert from "node:assert/strict";
import { filterDocuments, DEFAULT_FILTERS, relevanceScore, searchDocuments } from "@/lib/search";
import type { EducationalDocument } from "@/types/document";

function doc(overrides: Partial<EducationalDocument>): EducationalDocument {
  return {
    id: overrides.slug ?? "fixture", slug: overrides.slug ?? "fixture", title: "Fixture", description: "Fixture description.",
    originalUrl: "https://example.com/fixture", platform: "Other", subject: "Fixture", subjectSlug: "fixture", subjectId: null,
    course: null, courseSlug: null, courseId: null, semester: null, topic: "Fixture topic", documentType: "Notes",
    thumbnailUrl: null, keywords: [], tags: [], isFeatured: false, publicationStatus: "published", createdAt: null, updatedAt: null,
    presentationUrl: null, embedUrl: null, backupLinks: [], ...overrides,
  };
}
const titleMatch = doc({ slug: "title", title: "Algebra practice", description: "Notes about cells.", isFeatured: false });
const bodyMatch = doc({ slug: "body", title: "Geometry notes", description: "Algebra equations and practice.", isFeatured: true });
const tagMatch = doc({ slug: "tag", title: "Trigonometry reference", tags: ["algebra"], isFeatured: true });

test("weighted relevance prefers title matches over body/tag matches and featured status", () => {
  assert.ok(relevanceScore(titleMatch, "algebra") > relevanceScore(bodyMatch, "algebra"));
  assert.ok(relevanceScore(titleMatch, "algebra") > relevanceScore(tagMatch, "algebra"));
  const ranked = filterDocuments([tagMatch, bodyMatch, titleMatch], { ...DEFAULT_FILTERS, q: "algebra" });
  assert.equal(ranked[0].slug, "title");
  assert.equal(searchDocuments([bodyMatch, titleMatch], "algebra")[0].slug, "title");
});
test("without a query, featured ordering remains available and non-matches are excluded", () => {
  const ranked = filterDocuments([titleMatch, bodyMatch], DEFAULT_FILTERS);
  assert.equal(ranked[0].slug, "body");
  assert.equal(searchDocuments([titleMatch, bodyMatch], "photosynthesis").length, 0);
});

test("taxonomy facets are searchable without outranking a title match", () => {
  const title = doc({ slug: "taxonomy-title", title: "Sem 1 Worksheet", subject: "Science", course: "Class 10", platform: "Google Drive" });
  const facet = doc({ slug: "taxonomy-facet", title: "Unrelated", subject: "Sem 1 Worksheet Science", course: "Class 10", platform: "Dropbox", isFeatured: true });
  for (const query of ["Sem 1", "Worksheet", "Science", "Class 10", "Google Drive"]) assert.ok(searchDocuments([facet, title], query).some(document => document.slug === "taxonomy-title"), query);
  assert.equal(searchDocuments([facet, title], "Sem 1")[0].slug, "taxonomy-title");
  assert.ok(relevanceScore(title, "Worksheet") > relevanceScore(facet, "Worksheet"));
});

test("numeric search terms do not accidentally match digits in unrelated facets", () => {
  const semesterOne = doc({ slug: "sem-one", semester: "Sem 1", course: "Class 10" });
  const semesterTwo = doc({ slug: "sem-two", semester: "Sem 2", course: "Class 10" });
  assert.deepEqual(searchDocuments([semesterOne, semesterTwo], "Sem 1").map(item => item.slug), ["sem-one"]);
});
