import legacyData from "@/data/presentations.json";
import type { Presentation } from "@/types/presentation";
import type { CatalogFacets, CatalogMode, EducationalDocument, PublicationStatus } from "@/types/document";
import { DOCUMENT_TYPES, PLATFORMS } from "@/types/document";
import { detectPlatform, safeExternalUrl, slugify } from "./urls";
import { filterDocuments, searchDocuments, PAGE_SIZE, type LibraryFilters } from "./search";
import { getPublicClient } from "./supabase/public";

export class CatalogUnavailableError extends Error {
  constructor() { super("The resource library is temporarily unavailable. Please try again shortly."); this.name = "CatalogUnavailableError"; }
}

export function getCatalogMode(): CatalogMode { return getPublicClient() ? "supabase" : "compatibility"; }

function normalizeLegacy(record: Presentation): EducationalDocument {
  const originalUrl = safeExternalUrl(record.url);
  if (!originalUrl) throw new Error(`Invalid original URL for legacy resource ${record.id}`);
  return {
    id: record.id, slug: record.id, title: record.title, description: record.description, originalUrl,
    platform: detectPlatform(originalUrl), subject: record.subject, subjectSlug: slugify(record.subject), subjectId: null,
    // This is explicitly present in the original class-12 tag, not an invented course.
    course: record.tags.includes("class-12") ? "Class 12" : null,
    courseSlug: record.tags.includes("class-12") ? "class-12" : null, courseId: null,
    semester: null, topic: record.topic, documentType: "Presentation", thumbnailUrl: null,
    keywords: record.tags, tags: record.tags, isFeatured: Boolean(record.pinned), publicationStatus: "published",
    createdAt: null, updatedAt: null,
    presentationUrl: record.presentUrl ? safeExternalUrl(record.presentUrl) : null,
    embedUrl: record.embedUrl ? safeExternalUrl(record.embedUrl) : null,
    backupLinks: (record.backupLinks ?? []).flatMap(link => {
      const url = safeExternalUrl(link.url);
      return url ? [{ ...link, url, platform: detectPlatform(url) }] : [];
    }),
  };
}

export const compatibilityDocuments = (legacyData.presentations as Presentation[]).map(normalizeLegacy);
const documentSelect = "*, subjects(id,name,slug), courses(id,name,slug)";

type Row = Record<string, unknown> & { subjects?: { id: string; name: string; slug: string } | null; courses?: { id: string; name: string; slug: string } | null };
function normalizeRow(row: Row): EducationalDocument {
  const string = (key: string) => typeof row[key] === "string" ? row[key] as string : "";
  const optional = (key: string) => typeof row[key] === "string" && row[key] ? row[key] as string : null;
  const strings = (key: string) => Array.isArray(row[key]) ? (row[key] as unknown[]).filter((x): x is string => typeof x === "string") : [];
  const originalUrl = safeExternalUrl(string("original_url"));
  if (!originalUrl || !row.subjects) throw new Error("Invalid resource record");
  const backups = Array.isArray(row.backup_links) ? row.backup_links as Record<string, unknown>[] : [];
  return {
    id: string("id"), slug: string("slug"), title: string("title"), description: string("description"), originalUrl,
    platform: PLATFORMS.includes(row.platform as typeof PLATFORMS[number]) ? row.platform as typeof PLATFORMS[number] : "Other",
    subject: row.subjects.name, subjectSlug: row.subjects.slug, subjectId: row.subjects.id,
    course: row.courses?.name ?? null, courseSlug: row.courses?.slug ?? null, courseId: row.courses?.id ?? null,
    semester: optional("semester"), topic: string("topic"),
    documentType: DOCUMENT_TYPES.includes(row.document_type as typeof DOCUMENT_TYPES[number]) ? row.document_type as typeof DOCUMENT_TYPES[number] : "Other",
    thumbnailUrl: optional("thumbnail_url") ? safeExternalUrl(string("thumbnail_url")) : null,
    keywords: strings("keywords"), tags: strings("tags"), isFeatured: row.is_featured === true,
    publicationStatus: ["draft", "published", "archived"].includes(string("publication_status")) ? string("publication_status") as PublicationStatus : "draft",
    createdAt: optional("created_at"), updatedAt: optional("updated_at"),
    presentationUrl: optional("presentation_url") ? safeExternalUrl(string("presentation_url")) : null,
    embedUrl: optional("embed_url") ? safeExternalUrl(string("embed_url")) : null,
    backupLinks: backups.flatMap(link => {
      if (typeof link.url !== "string" || typeof link.label !== "string") return [];
      const url = safeExternalUrl(link.url);
      if (!url) return [];
      return [{ url, label: link.label, platform: PLATFORMS.includes(link.platform as typeof PLATFORMS[number]) ? link.platform as typeof PLATFORMS[number] : detectPlatform(url), description: typeof link.description === "string" ? link.description : undefined }];
    }),
  };
}

export async function getPublishedDocuments(): Promise<EducationalDocument[]> {
  const client = getPublicClient();
  if (!client) return compatibilityDocuments;
  // Sitemap/export only. Keyset-like bounded batches avoid silently truncating
  // the catalog; discovery pages use counts, facets and limited queries instead.
  const documents: EducationalDocument[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await client.from("documents").select(documentSelect).eq("publication_status", "published").order("id").range(offset, offset + 499);
    if (error) { console.error("Catalog read failed", error.code); throw new CatalogUnavailableError(); }
    documents.push(...data.map(row => normalizeRow(row as Row)));
    if (data.length < 500) return documents;
  }
}

export async function getDocumentBySlug(slug: string): Promise<EducationalDocument | null> {
  const client = getPublicClient();
  if (!client) return compatibilityDocuments.find(document => document.slug === slug) ?? null;
  const { data, error } = await client.from("documents").select(documentSelect).eq("slug", slug).eq("publication_status", "published").maybeSingle();
  if (error) { console.error("Document read failed", error.code); throw new CatalogUnavailableError(); }
  return data ? normalizeRow(data as Row) : null;
}

export async function getFacets(): Promise<CatalogFacets> {
  const client = getPublicClient();
  if (!client) return deriveFacets(compatibilityDocuments);
  const { data, error } = await client.rpc("get_catalog_facets");
  if (error) { console.error("Facet read failed", error.code); throw new CatalogUnavailableError(); }
  return data as CatalogFacets;
}

export function deriveFacets(documents: EducationalDocument[]): CatalogFacets {
  const unique = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b));
  return {
    subjects: documents.map(d => ({ id: d.subjectId, name: d.subject, slug: d.subjectSlug })).filter((s, i, all) => all.findIndex(x => x.slug === s.slug) === i).sort((a, b) => a.name.localeCompare(b.name)).map(subject => ({ ...subject, count: documents.filter(d => d.subjectSlug === subject.slug).length, topics: unique(documents.filter(d => d.subjectSlug === subject.slug).map(d => d.topic)) })),
    courses: documents.flatMap(d => d.course && d.courseSlug ? [{ id: d.courseId, name: d.course, slug: d.courseSlug }] : []).filter((s, i, all) => all.findIndex(x => x.slug === s.slug) === i).sort((a, b) => a.name.localeCompare(b.name)),
    semesters: unique(documents.flatMap(d => d.semester ? [d.semester] : [])),
    topics: unique(documents.map(d => d.topic)), types: unique(documents.map(d => d.documentType)), platforms: unique(documents.map(d => d.platform)),
  };
}

export interface CatalogResult { documents: EducationalDocument[]; total: number; page: number; pageCount: number; }
export async function queryCatalog(filters: LibraryFilters): Promise<CatalogResult> {
  const client = getPublicClient();
  if (!client) {
    const all = filterDocuments(compatibilityDocuments, filters);
    const page = Math.min(filters.page, Math.max(1, Math.ceil(all.length / PAGE_SIZE)));
    return { documents: all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), total: all.length, page, pageCount: Math.max(1, Math.ceil(all.length / PAGE_SIZE)) };
  }
  const facets = await getFacets();
  let query = client.from("documents").select(documentSelect, { count: "exact" }).eq("publication_status", "published");
  if (filters.q) query = query.textSearch("search_vector", filters.q, { type: "websearch", config: "simple" });
  const subject = facets.subjects.find(s => s.slug === filters.subject);
  const course = facets.courses.find(c => c.slug === filters.course);
  if (filters.subject) query = query.eq("subject_id", subject?.id ?? "00000000-0000-0000-0000-000000000000");
  if (filters.course) query = query.eq("course_id", course?.id ?? "00000000-0000-0000-0000-000000000000");
  if (filters.semester) query = query.eq("semester", filters.semester);
  if (filters.topic) query = query.eq("topic", filters.topic);
  if (filters.type) query = query.eq("document_type", filters.type);
  if (filters.platform) query = query.eq("platform", filters.platform);
  if (filters.featured) query = query.eq("is_featured", true);
  if (filters.sort === "title") query = query.order("title");
  else if (filters.sort === "newest") query = query.order("created_at", { ascending: false });
  else query = query.order("is_featured", { ascending: false }).order("title");
  const from = (filters.page - 1) * PAGE_SIZE;
  const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1);
  if (error) { console.error("Catalog query failed", error.code); throw new CatalogUnavailableError(); }
  const total = count ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, pageCount);
  if (page !== filters.page) {
    const corrected = await query.range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    if (corrected.error) throw new CatalogUnavailableError();
    return { documents: corrected.data.map(row => normalizeRow(row as Row)), total, page, pageCount };
  }
  return { documents: data.map(row => normalizeRow(row as Row)), total, page, pageCount };
}

export async function searchCatalog(query: string, limit = 8) {
  const client = getPublicClient();
  if (!client) return searchDocuments(compatibilityDocuments, query).slice(0, limit);
  let request = client.from("documents").select(documentSelect).eq("publication_status", "published").order("is_featured", { ascending: false }).limit(limit);
  if (query.trim()) request = request.textSearch("search_vector", query.trim().slice(0, 200), { type: "websearch", config: "simple" });
  const { data, error } = await request;
  if (error) throw new CatalogUnavailableError();
  return data.map(row => normalizeRow(row as Row));
}

export async function getCatalogHighlights() {
  const client = getPublicClient();
  if (!client) {
    const sortRecent = (a: EducationalDocument, b: EducationalDocument) => (b.createdAt ? Date.parse(b.createdAt) : 0) - (a.createdAt ? Date.parse(a.createdAt) : 0) || a.title.localeCompare(b.title);
    return { total: compatibilityDocuments.length, featured: compatibilityDocuments.filter(d => d.isFeatured).sort((a,b) => a.title.localeCompare(b.title)).slice(0, 3), recent: compatibilityDocuments.filter(d => d.createdAt).sort(sortRecent).slice(0, 3) };
  }
  const base = () => client.from("documents").select(documentSelect).eq("publication_status", "published");
  const [featured, recent, count] = await Promise.all([
    base().eq("is_featured", true).order("title").limit(3),
    base().order("created_at", { ascending: false }).limit(3),
    client.from("documents").select("id", { count: "exact", head: true }).eq("publication_status", "published"),
  ]);
  if (featured.error || recent.error || count.error) throw new CatalogUnavailableError();
  return { total: count.count ?? 0, featured: featured.data.map(row => normalizeRow(row as Row)), recent: recent.data.map(row => normalizeRow(row as Row)) };
}

export async function getRelatedDocuments(document: EducationalDocument) {
  const client = getPublicClient();
  if (!client) {
    const score = (item: EducationalDocument) => Number(item.subject === document.subject) * 3 + Number(item.course === document.course) * 2 + Number(item.topic === document.topic) * 4;
    return compatibilityDocuments.filter(item => item.id !== document.id).sort((a,b) => score(b) - score(a)).slice(0, 3);
  }
  // A bounded candidate window, not a full-table scan. Prefer the same subject;
  // course/topic similarity ranks the small candidate set.
  let request = client.from("documents").select(documentSelect).eq("publication_status", "published").neq("id", document.id);
  if (document.subjectId) request = request.eq("subject_id", document.subjectId);
  else if (document.courseId) request = request.eq("course_id", document.courseId);
  else request = request.eq("topic", document.topic);
  const { data, error } = await request.order("is_featured", { ascending: false }).order("title").limit(12);
  if (error) throw new CatalogUnavailableError();
  const score = (item: EducationalDocument) => Number(item.subject === document.subject) * 3 + Number(item.course === document.course) * 2 + Number(item.topic === document.topic) * 4;
  return data.map(row => normalizeRow(row as Row)).sort((a,b) => score(b) - score(a)).slice(0, 3);
}
