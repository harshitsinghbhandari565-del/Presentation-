import type { EducationalDocument } from "../../src/types/document";

/** Synthetic test-only record; never used as public catalog content. */
export const sampleDocument: EducationalDocument = {
  id: "english-lost-spring-mcqs", slug: "english-lost-spring-mcqs", title: "MCQs Practice",
  description: "MCQs practice presentation for English Chapter 2, The Lost Spring.",
  originalUrl: "https://example.com/fixture/document?ouid=test", platform: "Google Slides",
  subject: "English", subjectSlug: "english", subjectId: null,
  course: "Class 12", courseSlug: "class-12", courseId: null, semester: null,
  topic: "Ch 2 – The Lost Spring", documentType: "Presentation", thumbnailUrl: null,
  keywords: ["english", "the-lost-spring", "mcqs", "class-12"], tags: ["english", "the-lost-spring", "mcqs", "class-12"],
  isFeatured: true, publicationStatus: "published", createdAt: null, updatedAt: null,
  presentationUrl: "https://example.com/fixture/present", embedUrl: "https://docs.google.com/presentation/d/fixture/embed", backupLinks: [],
};
