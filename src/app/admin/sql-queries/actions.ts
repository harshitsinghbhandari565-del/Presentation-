"use server";
import { requireAdministrator } from "@/lib/admin/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
const fields = z.object({
  title: z.string().trim().min(1).max(120), description: z.string().max(1000),
  sql_text: z.string().trim().min(1).max(100000),
  dialect: z.enum(["sqlite", "postgresql", "mysql"]),
  publication_status: z.enum(["draft", "published", "archived"]),
});
const uuid = z.string().uuid();
export async function saveSharedQuery(form: FormData) {
  const { client } = await requireAdministrator();
  const parsed = fields.safeParse(Object.fromEntries(["title", "description", "sql_text", "dialect", "publication_status"].map(key => [key, form.get(key)])));
  const id = form.get("id");
  if (!parsed.success || (id && !uuid.safeParse(id).success)) redirect("/admin/sql-queries?error=validation");
  // Publishing is explicit; the form must acknowledge the public disclosure.
  if (parsed.data.publication_status === "published" && form.get("confirm_public") !== "yes") redirect("/admin/sql-queries?error=confirm");
  const request = typeof id === "string" && id ? client.from("shared_sql_queries").update(parsed.data).eq("id", id).select("id") : client.from("shared_sql_queries").insert(parsed.data).select("id");
  const { data, error } = await request;
  if (error || !data?.length) redirect("/admin/sql-queries?error=save");
  revalidatePath("/sql-workbench/library"); revalidatePath("/admin/sql-queries");
  redirect(`/admin/sql-queries/${data[0].id}?saved=1`);
}
export async function restoreSharedQuery(form: FormData) {
  const { client } = await requireAdministrator();
  const id = form.get("id"), versionId = form.get("version_id");
  if (typeof id !== "string" || !uuid.safeParse(id).success || typeof versionId !== "string" || !/^\d{1,15}$/.test(versionId)) redirect("/admin/sql-queries?error=validation");
  const { data: version, error } = await client.from("shared_sql_query_versions").select("title,description,sql_text,dialect").eq("id", versionId).eq("query_id", id).maybeSingle();
  if (error || !version) redirect(`/admin/sql-queries/${id}?error=restore`);
  // Restores are always drafts and create a new version; nothing is republished automatically.
  const result = await client.from("shared_sql_queries").update({ ...version, publication_status: "draft" }).eq("id", id).select("id");
  if (result.error || !result.data?.length) redirect(`/admin/sql-queries/${id}?error=restore`);
  revalidatePath("/sql-workbench/library"); revalidatePath("/admin/sql-queries");
  redirect(`/admin/sql-queries/${id}?restored=1`);
}
