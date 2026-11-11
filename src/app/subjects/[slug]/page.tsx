import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { compatibilityDocuments, getFacets, queryCatalog } from "@/lib/catalog";
import { DEFAULT_FILTERS, PAGE_SIZE } from "@/lib/search";
import DocumentCard from "@/components/documents/DocumentCard";
import InnerPageSculpture from "@/components/layout/InnerPageSculpture";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateStaticParams() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  return [...new Set(compatibilityDocuments.map(d => d.subjectSlug))].map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const subject = (await getFacets()).subjects.find(s => s.slug === slug);
  return {
    title: subject ? `${subject.name} resources` : "Subject not found",
    description: subject
      ? `Explore ${subject.name} presentations, notes and study resources, organized by topic and course.`
      : undefined,
    alternates: { canonical: `/subjects/${slug}` },
    robots: subject ? undefined : { index: false },
  };
}

export default async function SubjectPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const requestedPage = Number(typeof query.page === "string" ? query.page : 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, 10000) : 1;
  const [facets, result] = await Promise.all([
    getFacets(),
    queryCatalog({ ...DEFAULT_FILTERS, subject: slug, page }),
  ]);
  const subject = facets.subjects.find(s => s.slug === slug);
  if (!subject || !result.total) notFound();
  const currentPage = Math.min(page, result.pageCount);
  const current =
    currentPage !== page ? await queryCatalog({ ...DEFAULT_FILTERS, subject: slug, page: currentPage }) : result;
  const href = (p: number) => `/subjects/${slug}${p > 1 ? `?page=${p}` : ""}`;

  return (
    <div className="container inner-page">
      <Link href="/subjects" className="text-link">
        <ArrowLeft size={15} />
        All subjects
      </Link>

      <div className="page-intro-split">
        <div className="page-intro">
          <div className="eyebrow">
            <BookOpen size={15} />
            THE {subject.name.toUpperCase()} SHELF
          </div>
          <h1>
            A little deeper
            <br />
            into <em>{subject.name}.</em>
          </h1>
          <p>
            {result.total} thoughtfully organized resource{result.total !== 1 ? "s" : ""}. Find the one that fits your
            next study session.
          </p>
          {subject.topics.length > 0 && (
            <div className="subject-quick-topics" aria-label="Filter by chapter or topic">
              <span className="subject-quick-label">
                <Sparkles size={12} aria-hidden="true" />
                Topics:
              </span>
              {subject.topics.slice(0, 6).map(topic => (
                <Link
                  key={topic}
                  href={`/library?subject=${encodeURIComponent(slug)}&topic=${encodeURIComponent(topic)}`}
                  className="subject-quick-pill"
                >
                  {topic}
                </Link>
              ))}
            </div>
          )}
        </div>

        <InnerPageSculpture
          variant="subject-detail"
          statPrimary={result.total.toString().padStart(2, "0")}
          statLabel={`${subject.name} resource${result.total !== 1 ? "s" : ""}`}
          badgeText={subject.name.toUpperCase()}
        />
      </div>

      <div className="resource-grid">
        {current.documents.map(document => (
          <DocumentCard key={document.id} document={document} />
        ))}
      </div>

      {result.pageCount > 1 && (
        <nav className="pagination" aria-label="Subject pages">
          {currentPage > 1 && (
            <Link href={href(currentPage - 1)} className="button button-secondary">
              <ArrowLeft size={16} />
              Previous
            </Link>
          )}
          <span>
            Page {currentPage} of {result.pageCount}
          </span>
          {currentPage < result.pageCount && (
            <Link href={href(currentPage + 1)} className="button button-secondary">
              Next
              <ArrowRight size={16} />
            </Link>
          )}
        </nav>
      )}

      <div className="library-bottom-note">
        <Link href={`/library?subject=${slug}`} className="text-link">
          Search and filter {subject.name} resources <ArrowRight size={15} />
        </Link>
        <span className="fine-print">{PAGE_SIZE} resources per page</span>
      </div>
    </div>
  );
}
