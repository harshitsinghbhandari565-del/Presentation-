import Link from "next/link";
import { ArrowUpRight, Download } from "lucide-react";
import type { EducationalDocument } from "@/types/document";
import DocumentCover from "./DocumentCover";
import { displayHost } from "@/lib/urls";
import { mathPaperDownload } from "@/lib/math-papers";

/** Editorial card: type → title → subject/course → semester/topic → source host. */
export default function DocumentCard({ document }: { document: EducationalDocument }) {
  const paper = mathPaperDownload(document);
  const context = [document.semester, document.topic].filter(Boolean).join(" · ");
  return <article className="resource-card">
    <DocumentCover document={document} />
    <div className="resource-card-body">
      <p className="resource-type">{document.documentType}</p>
      <h3><Link href={`/resources/${document.slug}`}>{document.title}<ArrowUpRight size={18} aria-hidden="true" /></Link></h3>
      <p className="resource-meta-line">{document.subject}{document.course ? <> <span className="meta-dot" /> {document.course}</> : null}</p>
      {context && <p className="resource-topic">{context}</p>}
      <p className="resource-description">{document.description}</p>
      <div className="resource-card-footer">
        {paper ? <a href={paper.downloadUrl} download={paper.filename} aria-label={`Download ${document.title} as PDF`}><Download size={14} aria-hidden="true" /> Download PDF</a> : <span className="resource-host">{displayHost(document.originalUrl)}</span>}
        <Link href={`/resources/${document.slug}`} aria-label={`View ${document.title}`}>View resource <ArrowUpRight size={14} aria-hidden="true" /></Link>
      </div>
    </div>
  </article>;
}
