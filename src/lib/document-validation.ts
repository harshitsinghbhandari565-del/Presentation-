import { z } from "zod";
import { DOCUMENT_TYPES, PLATFORMS, PUBLICATION_STATUSES } from "@/types/document";
import { safeExternalUrl } from "./urls";

const externalUrl = z.string().trim().max(4096).refine(value => safeExternalUrl(value) !== null, "Use a public http:// or https:// sharing link, without embedded credentials.");
const optionalUrl = z.union([externalUrl, z.literal("")]).default("");
const shortText = (max: number) => z.string().trim().max(max);
const uuidOrNull = z.union([z.uuid(), z.literal("")]).default("");

export const documentInputSchema = z.object({
  title: z.string().trim().min(3, "Add a title with at least 3 characters.").max(160),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens."),
  description: z.string().trim().min(10, "Add a helpful description.").max(3000),
  original_url: externalUrl,
  platform: z.enum(PLATFORMS),
  subject_id: z.uuid("Choose a subject."),
  course_id: uuidOrNull,
  semester: shortText(60),
  topic: z.string().trim().min(2, "Add a topic.").max(160),
  document_type: z.enum(DOCUMENT_TYPES),
  thumbnail_url: optionalUrl,
  keywords: shortText(1000),
  tags: shortText(1000),
  is_featured: z.boolean().default(false),
  publication_status: z.enum(PUBLICATION_STATUSES).default("draft"),
  presentation_url: optionalUrl,
  embed_url: optionalUrl,
  backup_links: z.array(z.object({
    label: z.string().trim().min(1).max(80),
    platform: z.enum(PLATFORMS),
    url: externalUrl,
    description: shortText(300).optional(),
  })).max(5).default([]),
}).superRefine((value, ctx) => {
  for (const key of ["keywords", "tags"] as const) {
    const items = value[key].split(",").map(x => x.trim()).filter(Boolean);
    if (items.length > 20 || items.some(x => x.length > 50)) ctx.addIssue({ code: "custom", path: [key], message: "Use up to 20 terms, each at most 50 characters." });
  }
  if (value.embed_url && !value.embed_url.startsWith("https://docs.google.com/")) {
    ctx.addIssue({ code: "custom", path: ["embed_url"], message: "Optional embeds must use a Google Docs viewer URL. Permissions are not bypassed." });
  }
});

export type DocumentInput = z.infer<typeof documentInputSchema>;
export const splitTerms = (value: string) => [...new Set(value.split(",").map(x => x.trim()).filter(Boolean))];
export const categorySchema = z.object({ name: z.string().trim().min(2).max(80), slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) });

export function formDataToDocumentInput(form: FormData) {
  const text = (key: string) => String(form.get(key) ?? "");
  let backupLinks: unknown = [];
  try { backupLinks = JSON.parse(text("backup_links") || "[]"); } catch { backupLinks = null; }
  return documentInputSchema.safeParse({
    title: text("title"), slug: text("slug"), description: text("description"), original_url: text("original_url"), platform: text("platform"),
    subject_id: text("subject_id"), course_id: text("course_id"), semester: text("semester"), topic: text("topic"), document_type: text("document_type"),
    thumbnail_url: text("thumbnail_url"), keywords: text("keywords"), tags: text("tags"), is_featured: form.get("is_featured") === "on",
    publication_status: text("publication_status"), presentation_url: text("presentation_url"), embed_url: text("embed_url"), backup_links: backupLinks,
  });
}
