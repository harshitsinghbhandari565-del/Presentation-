import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, SearchX, ArrowLeft, ArrowRight, Layers3 } from "lucide-react";
import { getCatalogMode, getFacets, queryCatalog } from "@/lib/catalog";
import { libraryHref, parseFilters, countActiveFilters } from "@/lib/search";
import LibraryControls from "@/components/library/LibraryControls";
import DocumentCard from "@/components/documents/DocumentCard";
export const revalidate = 60;
export const metadata: Metadata = { title: "Resource library", description: "Find educational presentations, notes and practice resources. Search by title, topic and keyword, then filter by subject, course, semester and source.", alternates: { canonical: "/library" } };
export default async function LibraryPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseFilters(await searchParams);
  const [result, facets] = await Promise.all([queryCatalog(filters), getFacets()]);
  return <div className="container inner-page library-page"><div className="page-intro"><div className="eyebrow"><BookOpen size={14} />THE RESOURCE LIBRARY</div><h1>Your next read<br />starts <em>here.</em></h1><p>A thoughtfully organized shelf of learning essentials.<br className="desktop-break" /> Find what you need. Get straight to the source.</p></div>
    <LibraryControls filters={filters} facets={facets} total={result.total}>
      {result.documents.length ? <div className="resource-grid">{result.documents.map(document => <DocumentCard key={document.id} document={document} />)}</div> : <div className="empty-state library-empty"><SearchX size={35} strokeWidth={1.3} /><h2>No resources on this shelf. Yet.</h2><p>{countActiveFilters(filters) || filters.q ? "Try a broader keyword or clear a filter to see more of the collection." : "An administrator hasn’t published any resources. Check back soon."}</p>{(countActiveFilters(filters) > 0 || filters.q) && <Link href="/library" className="button button-secondary">Clear search & filters <ArrowRight size={16} /></Link>}</div>}
      {result.pageCount > 1 && <nav className="pagination" aria-label="Library pages">{result.page > 1 && <Link href={libraryHref({ ...filters, page: result.page - 1 }, false)} className="button button-secondary"><ArrowLeft size={16} />Previous</Link>}<span>Page {result.page} of {result.pageCount}</span>{result.page < result.pageCount && <Link href={libraryHref({ ...filters, page: result.page + 1 }, false)} className="button button-secondary">Next<ArrowRight size={16} /></Link>}</nav>}
      {filters.sort === "newest" && getCatalogMode() === "compatibility" && <p className="fine-print">The original collection has no publication timestamps. Resources without a date are ordered by title.</p>}
    </LibraryControls>
    <div className="library-bottom-note"><Layers3 size={17} /><p>Your files stay where they belong. We simply make them easier to find.</p></div>
  </div>;
}
