import { notFound, permanentRedirect } from "next/navigation";
import { compatibilityDocuments, getDocumentBySlug } from "@/lib/catalog";
export async function generateStaticParams() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  return compatibilityDocuments.map(document => ({ id: document.id }));
}
export default async function LegacyPresentationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const document = await getDocumentBySlug(id);
  if (!document) notFound();
  permanentRedirect(`/resources/${document.slug}`);
}
