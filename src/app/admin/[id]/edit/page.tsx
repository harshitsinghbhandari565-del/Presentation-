import { notFound } from "next/navigation";
import { requireAdministrator } from "@/lib/admin/auth";
import { getCategories, getEditableDocument } from "@/lib/admin/repository";
import DocumentEditor from "@/components/admin/DocumentEditor";
export const dynamic = "force-dynamic";
export default async function EditResourcePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { client } = await requireAdministrator();
  const [record, categories, query] = await Promise.all([getEditableDocument(client, id), getCategories(client), searchParams]);
  if (!record) notFound();
  return <DocumentEditor id={id} record={record} subjects={categories.subjects} courses={categories.courses} saved={query.saved === "1"} />;
}
