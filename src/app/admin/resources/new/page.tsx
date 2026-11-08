import { requireAdministrator } from "@/lib/admin/auth";
import { getCategories } from "@/lib/admin/repository";
import DocumentEditor from "@/components/admin/DocumentEditor";
export const dynamic = "force-dynamic";
export default async function NewResourcePage() {
  const { client } = await requireAdministrator();
  const categories = await getCategories(client);
  return <DocumentEditor subjects={categories.subjects} courses={categories.courses} />;
}
