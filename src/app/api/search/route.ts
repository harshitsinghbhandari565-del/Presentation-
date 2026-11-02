import { searchCatalog } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const query = (new URL(request.url).searchParams.get("q") ?? "").slice(0, 200);
  try {
    const { documents, searchLimited } = await searchCatalog(query);
    return Response.json({ searchLimited, documents: documents.map((d: import("@/types/document").EducationalDocument) => ({ id: d.id, slug: d.slug, title: d.title, subject: d.subject, topic: d.topic, platform: d.platform, isFeatured: d.isFeatured })) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Search is temporarily unavailable. Please try again." }, { status: 503 });
  }
}
