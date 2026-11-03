import type { getServerClient } from "@/lib/supabase/server";
import type { EducationalDocument } from "@/types/document";
export type AdminClient = NonNullable<Awaited<ReturnType<typeof getServerClient>>>;
export interface Category { id: string; name: string; slug: string; }
export interface AdminRow {
  id: string; title: string; slug: string; publication_status: EducationalDocument["publicationStatus"]; is_featured: boolean;
  updated_at: string; subjects: { name: string } | null;
}
export async function getCategories(client: AdminClient) {
  const [subjects, courses] = await Promise.all([client.from("subjects").select("id,name,slug").order("name").order("id"), client.from("courses").select("id,name,slug").order("name").order("id")]);
  if (subjects.error || courses.error) throw new Error("Categories could not be loaded. Please try again.");
  return { subjects: subjects.data as Category[], courses: courses.data as Category[] };
}
export async function getAdminDocuments(client: AdminClient, query = "", status = "", page = 1) {
  let request = client.from("documents").select("id,title,slug,publication_status,is_featured,updated_at,subjects(name)", { count: "exact" });
  if (query) request = request.textSearch("search_vector", query.slice(0, 200), { type: "websearch", config: "simple" });
  if (["draft", "published", "archived"].includes(status)) request = request.eq("publication_status", status);
  const from = (page - 1) * 20;
  const { data, error, count } = await request.order("updated_at", { ascending: false }).order("id").range(from, from + 19);
  if (error) throw new Error("The admin library could not be loaded. Please try again.");
  return { documents: data as unknown as AdminRow[], total: count ?? 0, page, pageCount: Math.max(1, Math.ceil((count ?? 0) / 20)) };
}
export async function getEditableDocument(client: AdminClient, id: string) {
  const { data, error } = await client.from("documents").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("This resource could not be loaded.");
  return data as Record<string, unknown> | null;
}
export function databasePayload(input: import("@/lib/document-validation").DocumentInput) {
  const split = (value: string) => [...new Set(value.split(",").map(term => term.trim()).filter(Boolean))];
  return {
    title: input.title, slug: input.slug, description: input.description, original_url: input.original_url, platform: input.platform,
    subject_id: input.subject_id, course_id: input.course_id || null, semester: input.semester || null, topic: input.topic,
    document_type: input.document_type, thumbnail_url: input.thumbnail_url || null, keywords: split(input.keywords), tags: split(input.tags),
    is_featured: input.is_featured, publication_status: input.publication_status, presentation_url: input.presentation_url || null,
    embed_url: input.embed_url || null, backup_links: input.backup_links,
  };
}
