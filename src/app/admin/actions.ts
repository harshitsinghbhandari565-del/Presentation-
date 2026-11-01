"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdministrator } from "@/lib/admin/auth";
import { databasePayload } from "@/lib/admin/repository";
import { categorySchema, formDataToDocumentInput } from "@/lib/document-validation";
import { getServerClient } from "@/lib/supabase/server";

export interface ActionState { error?: string; fields?: Record<string, string>; success?: string; resourceId?: string; deleted?: boolean; }
function revalidateCatalog(slug?: string) {
  revalidatePath("/"); revalidatePath("/library"); revalidatePath("/subjects", "layout"); revalidatePath("/resources", "layout"); revalidatePath("/sitemap.xml"); revalidatePath("/admin");
  if (slug) { revalidatePath(`/resources/${slug}`); revalidatePath(`/presentation/${slug}`); }
}
export async function createDocument(_state: ActionState, form: FormData): Promise<ActionState> {
  const parsed = formDataToDocumentInput(form);
  if (!parsed.success) return { error: "Please review the highlighted information.", fields: Object.fromEntries(parsed.error.issues.map(issue => [String(issue.path[0]), issue.message])) };
  const { client } = await requireAdministrator();
  try {
    const { data, error } = await client.from("documents").insert(databasePayload(parsed.data)).select("id").single();
    if (error) return { error: error.code === "23505" ? "That slug is already used. Choose a unique address." : "The resource could not be saved. Check the categories and your administrator access." };
    revalidateCatalog(parsed.data.slug);
    return { success: "Resource created. Review its details before publishing.", resourceId: data.id };
  } catch (error) { if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error; return { error: "Unable to save the resource. Please try again." }; }
}
export async function updateDocument(id: string, _state: ActionState, form: FormData): Promise<ActionState> {
  const parsed = formDataToDocumentInput(form);
  if (!parsed.success) return { error: "Please review the highlighted information.", fields: Object.fromEntries(parsed.error.issues.map(issue => [String(issue.path[0]), issue.message])) };
  const { client } = await requireAdministrator();
  try {
    const { data: previous } = await client.from("documents").select("slug").eq("id", id).maybeSingle();
    const { data, error } = await client.from("documents").update(databasePayload(parsed.data)).eq("id", id).select("id");
    if (error) return { error: error.code === "23505" ? "That slug is already used. Choose a unique address." : "Changes could not be saved. Your existing resource has not been replaced locally." };
    if (!data?.length) return { error: "Resource not found or you do not have permission to edit it." };
    revalidateCatalog(parsed.data.slug); if (previous?.slug) revalidateCatalog(previous.slug);
    return { success: "Changes saved. The public library will reflect the updated publication status." };
  } catch { return { error: "Unable to save changes. Please try again." }; }
}
export async function archiveDocument(id: string, _state: ActionState, _form: FormData): Promise<ActionState> {
  void _form;
  const { client } = await requireAdministrator();
  try {
    const { data, error } = await client.from("documents").update({ publication_status: "archived", is_featured: false }).eq("id", id).select("slug");
    if (error || !data?.length) return { error: "The resource could not be archived. Please check your access and try again." };
    revalidateCatalog(data[0].slug);
    return { success: "Resource archived. It is hidden from students and can be restored by editing it." };
  } catch { return { error: "The resource could not be archived." }; }
}
export async function permanentlyDeleteDocument(id: string, _state: ActionState, form: FormData): Promise<ActionState> {
  const { client } = await requireAdministrator();
  try {
    const { data: document } = await client.from("documents").select("slug").eq("id", id).maybeSingle();
    if (!document || form.get("confirmation") !== document.slug) return { error: "The confirmation slug did not match. Nothing was deleted." };
    const { data, error } = await client.from("documents").delete().eq("id", id).select("id");
    if (error || !data?.length) return { error: "The resource could not be deleted. Nothing was removed." };
    revalidateCatalog(document.slug);
    return { success: "Resource permanently deleted.", deleted: true };
  } catch (error) { if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error; return { error: "The resource could not be deleted." }; }
}
export async function saveCategory(kind: "subjects" | "courses", _state: ActionState, form: FormData): Promise<ActionState> {
  const parsed = categorySchema.safeParse({ name: form.get("name"), slug: form.get("slug") });
  if (!parsed.success) return { error: "Use a name of 2–80 characters and a lowercase, hyphenated slug." };
  const { client } = await requireAdministrator();
  try {
    const id = form.get("id");
    const request = typeof id === "string" && id ? client.from(kind).update(parsed.data).eq("id", id).select("id") : client.from(kind).insert(parsed.data).select("id");
    const { data, error } = await request;
    if (error) return { error: error.code === "23505" ? "That category slug already exists." : "The category could not be saved. Existing resource associations have not been removed." };
    if (!data?.length) return { error: "Category not found or access denied." };
    revalidateCatalog();
    return { success: "Category saved." };
  } catch { return { error: "The category could not be saved." }; }
}
export async function signOut() {
  const client = await getServerClient();
  if (client) await client.auth.signOut();
  redirect("/admin/login");
}
