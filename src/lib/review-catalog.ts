import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { DOCUMENT_TYPES, PLATFORMS, PUBLICATION_STATUSES } from "@/types/document";
import { safeExternalUrl } from "./urls";

// This module is dynamically imported only by catalog.ts's development guard.
// The JSON is outside public/: Next cannot serve it as a static asset.
const nullableText = z.string().nullable();
const fixtureSchema = z.object({
  id: z.uuid(),
  slug: z.string().regex(/^fixture-[a-z0-9-]+$/),
  title: z.string().min(3).max(160),
  description: z.string().max(3000), // Empty descriptions are a browser-only edge case.
  originalUrl: z.string().refine(value => safeExternalUrl(value) !== null),
  platform: z.enum(PLATFORMS),
  subject: z.string().min(2), subjectSlug: z.string().min(2), subjectId: z.uuid(),
  course: nullableText, courseSlug: nullableText, courseId: z.uuid().nullable(),
  semester: nullableText, topic: z.string().min(2), documentType: z.enum(DOCUMENT_TYPES),
  thumbnailUrl: z.null(), keywords: z.array(z.string()).max(20), tags: z.array(z.string()).max(20),
  isFeatured: z.boolean(), publicationStatus: z.enum(PUBLICATION_STATUSES),
  createdAt: z.null(), updatedAt: z.null(), presentationUrl: z.null(), embedUrl: z.null(),
  backupLinks: z.array(z.never()).max(0),
}).strict();
const collectionSchema = z.array(fixtureSchema).length(16).refine(items => new Set(items.map(item => item.slug)).size === 16);

export async function loadReviewDocuments(fixture: string) {
  // Defence in depth: even a direct server-side caller cannot select fixtures
  // in a production build. Never replace this with a NEXT_PUBLIC feature flag.
  if (process.env.NODE_ENV !== "development") return null;
  if (!["1", "multi", "one", "empty"].includes(fixture)) return null;
  const source: unknown = JSON.parse(await readFile(join(process.cwd(), "fixtures", "review-catalog.json"), "utf8"));
  const documents = collectionSchema.parse(source).filter(document => document.publicationStatus === "published");
  if (fixture === "empty") return [];
  if (fixture === "one") return documents.slice(0, 1);
  return documents;
}
