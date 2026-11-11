import { getDocumentBySlug } from "@/lib/catalog";
import { respondWithMathPaper } from "@/lib/math-paper-response";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  return respondWithMathPaper((await params).slug, getDocumentBySlug);
}
