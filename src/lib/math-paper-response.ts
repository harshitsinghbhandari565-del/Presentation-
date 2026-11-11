import { mathPaperDownload, mathPaperForSlug } from "./math-papers";

type PaperDocument = { slug: string; originalUrl: string; publicationStatus: string };
type Lookup = (slug: string) => Promise<PaperDocument | null>;

/** Lookup gates access and the fixed URL mapping prevents an open proxy. */
export async function respondWithMathPaper(slug: string, lookup: Lookup, fetcher: typeof fetch = fetch): Promise<Response> {
  if (!mathPaperForSlug(slug)) return new Response("Paper not found.", { status: 404 });
  try {
    const document = await lookup(slug);
    const paper = document && mathPaperDownload(document);
    if (!paper) return new Response("Paper not found.", { status: 404 });
    let upstream: Response | null = null;
    try {
      const cdn = await fetcher(paper.cdnUrl, { cache: "no-store", signal: AbortSignal.timeout(30000) });
      if (cdn.ok && cdn.body && /^(application\/(pdf|octet-stream))\b/i.test(cdn.headers.get("content-type") ?? "")) upstream = cdn;
    } catch { /* The API below is a fallback if the CDN is unavailable. */ }
    if (!upstream) {
      const api = await fetcher(paper.fetchUrl, {
        headers: { Accept: "application/vnd.github.raw+json", "X-GitHub-Api-Version": "2022-11-28" },
        cache: "no-store", signal: AbortSignal.timeout(30000),
      });
      if (api.ok && api.body && api.headers.get("content-type")?.startsWith("application/vnd.github.raw")) upstream = api;
    }
    if (!upstream?.body) return new Response("The PDF is temporarily unavailable. Please try again.", { status: 502 });
    return new Response(upstream.body, { headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${paper.filename}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    } });
  } catch {
    return new Response("The PDF is temporarily unavailable. Please try again.", { status: 503 });
  }
}
