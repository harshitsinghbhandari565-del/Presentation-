import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, BookOpen, ExternalLink as ExternalIcon, ShieldCheck, Sparkles } from "lucide-react";
import { getDocumentBySlug, compatibilityDocuments, getRelatedDocuments } from "@/lib/catalog";
import { displayHost } from "@/lib/urls";
import { mathPaperDownload } from "@/lib/math-papers";
import DocumentCover from "@/components/documents/DocumentCover";
import DetailFolio3D from "@/components/documents/DetailFolio3D";
import DocumentCard from "@/components/documents/DocumentCard";
import BackupLinks from "@/components/presentation/BackupLinks";
import ExternalLink from "@/components/documents/ExternalLink";
import DocumentPreview from "@/components/documents/DocumentPreview";
import Reveal from "@/components/layout/Reveal";

export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const document = await getDocumentBySlug(slug);
  if (!document) return { title: "Resource not found", robots: { index: false } };
  return {
    title: `${document.title} — ${document.subject}`,
    description: document.description,
    alternates: { canonical: `/resources/${document.slug}` },
    openGraph: {
      title: document.title,
      description: document.description,
      type: "article",
      url: `/resources/${document.slug}`,
    },
  };
}

export async function generateStaticParams() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) return [];
  return compatibilityDocuments.map(document => ({ slug: document.slug }));
}

export default async function DocumentPage({ params }: Props) {
  const { slug } = await params;
  const document = await getDocumentBySlug(slug);
  if (!document) notFound();
  const related = await getRelatedDocuments(document);
  const paper = mathPaperDownload(document);
  const facts = [
    ["Subject", document.subject],
    ["Course", document.course],
    ["Semester", document.semester],
    ["Topic", document.topic],
    ["Document type", document.documentType],
    ...(paper ? [] : [["Original platform", document.platform]]),
  ];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: document.title,
    description: document.description,
    url: process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/resources/${document.slug}`
      : undefined,
    learningResourceType: document.documentType,
    educationalLevel: document.course ?? undefined,
    about: { "@type": "Thing", name: document.subject },
    keywords: document.keywords.join(", "),
    sameAs: paper ? undefined : document.originalUrl,
    isAccessibleForFree: true,
  };

  return (
    <div className="container inner-page detail-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/library">
          <ArrowLeft size={14} />
          Library
        </Link>
        <span>/</span>
        <Link href={`/subjects/${document.subjectSlug}`}>{document.subject}</Link>
        <span>/</span>
        <span aria-current="page">{document.title}</span>
      </nav>

      <div className="detail-grid">
        <div className="detail-main">
          <div className="detail-title">
            <div className="eyebrow">
              {document.isFeatured ? (
                <>
                  <Sparkles size={14} />
                  FROM THE FEATURED COLLECTION
                </>
              ) : (
                <>
                  <BookOpen size={14} />A RESOURCE FOR YOUR NEXT CHAPTER
                </>
              )}
            </div>
            <h1>{document.title}</h1>
            <p className="detail-topic">{document.topic}</p>
            <p className="detail-description">{document.description}</p>
          </div>

          <section className="source-panel">
            <div className="source-panel-heading">
              <span className="source-icon">
                <ExternalIcon size={22} strokeWidth={1.5} />
              </span>
              <div>
                <h2>{paper ? "Ready to practise?" : "Straight to the source."}</h2>
                <p>
                  {paper ? "Download the PDF in one click." : <>Hosted on {document.platform} · {displayHost(document.originalUrl)}</>}
                </p>
              </div>
            </div>
            <BackupLinks document={document} />
            <p className="source-permission">
              <ShieldCheck size={15} />
              {paper ? "Save this paper to study offline." : "Opens the original link. The owner’s sharing permissions apply."}
            </p>
          </section>

          <div className="detail-tags" aria-label="Resource tags">
            {document.tags.map(tag => (
              <Link key={tag} href={`/library?q=${encodeURIComponent(tag)}`}>
                #{tag}
              </Link>
            ))}
          </div>

          {document.embedUrl && <DocumentPreview url={document.embedUrl} title={document.title} />}

          {document.backupLinks.length > 0 && (
            <section className="backup-section">
              <h2>A backup, just in case.</h2>
              <p>Alternative sources supplied for this resource.</p>
              {document.backupLinks.map(backup => (
                <div className="backup-row" key={backup.url}>
                  <div>
                    <h3>
                      {backup.label}
                      <span>{backup.platform}</span>
                    </h3>
                    <p>{backup.description || "An alternative link to this educational resource."}</p>
                  </div>
                  <ExternalLink
                    href={backup.url}
                    className="button button-secondary"
                    label={`Open backup: ${backup.label}`}
                  >
                    Open backup
                  </ExternalLink>
                </div>
              ))}
            </section>
          )}
        </div>

        <aside className="detail-sidebar">
          <DetailFolio3D document={document}>
            <DocumentCover document={document} />
          </DetailFolio3D>
          <div className="resource-facts">
            <h2>The details</h2>
            <dl>
              {facts.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value ?? <span className="not-specified">Not specified</span>}</dd>
                </div>
              ))}
            </dl>
            {document.createdAt && (
              <p className="fine-print">
                Added{" "}
                {new Date(document.createdAt).toLocaleDateString("en", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  timeZone: "UTC",
                })}
              </p>
            )}
          </div>
          <div className="detail-aside-note">
            <BookOpen size={20} strokeWidth={1.4} />
            <p>
              Take what you need.
              <br />
              Learn something new.
            </p>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="section related-section">
          <Reveal>
            <div className="section-heading">
              <div>
                <div className="eyebrow">KEEP YOUR CURIOSITY GOING</div>
                <h2>
                  A little more to <em>explore.</em>
                </h2>
              </div>
              <Link href="/library" className="text-link">
                Back to the library <ArrowUpRight size={16} />
              </Link>
            </div>
          </Reveal>
          <div className="resource-grid">
            {related.map(item => (
              <DocumentCard key={item.id} document={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
