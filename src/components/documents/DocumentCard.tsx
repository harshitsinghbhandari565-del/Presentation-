import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import type { EducationalDocument } from "@/types/document";
import DocumentCover from "./DocumentCover";
import { displayHost } from "@/lib/urls";
export default function DocumentCard({ document }: { document: EducationalDocument }) {
  return <article className="resource-card group">
    <Link href={`/resources/${document.slug}`} className="resource-cover-link" tabIndex={-1} aria-hidden="true"><DocumentCover document={document} /></Link>
    <div className="resource-card-body"><div className="resource-meta"><span>{document.subject}</span><span className="meta-dot" />{document.course ?? document.documentType}</div>
      <h3><Link href={`/resources/${document.slug}`}>{document.title}<ArrowUpRight size={19} aria-hidden="true" /></Link></h3>
      <p className="resource-topic">{document.topic}</p><p className="resource-description">{document.description}</p>
      <div className="resource-card-footer"><span>{displayHost(document.originalUrl)}</span><Link href={`/resources/${document.slug}`} aria-label={`View ${document.title}`}>View resource <ArrowRight size={14} /></Link></div>
    </div>
  </article>;
}
