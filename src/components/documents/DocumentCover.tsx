import Image from "next/image";
import { FileText, Presentation, Table2, BookOpen, FileQuestion, Star } from "lucide-react";
import type { EducationalDocument } from "@/types/document";
export default function DocumentCover({ document, compact = false }: { document: EducationalDocument; compact?: boolean }) {
  const Icon = document.documentType === "Presentation" ? Presentation : document.platform === "Google Sheets" ? Table2 : document.documentType === "Practice questions" ? FileQuestion : FileText;
  return <div className={`document-cover cover-${document.subjectSlug.replace(/[^a-z0-9-]/g, "")} ${compact ? "compact" : ""}`}>
    {document.thumbnailUrl ? <Image src={document.thumbnailUrl} alt={`Thumbnail for ${document.title}`} fill sizes="(max-width: 640px) 100vw, 400px" unoptimized className="document-thumbnail" /> : <div className="cover-art" role="img" aria-label={`Decorative ${document.documentType.toLowerCase()} illustration, not a preview of the document`}>
      <div className="cover-orbit orbit-one" /><div className="cover-orbit orbit-two" />
      <div className="cover-paper"><div className="paper-top"><Icon size={19} strokeWidth={1.6} /><span>{document.platform}</span></div><div className="paper-title">{document.title}</div><div className="paper-rule" /><div className="paper-lines"><i /><i /><i /></div><div className="paper-bottom"><BookOpen size={13} /><span>{document.subject}</span><span>01</span></div></div>
      <span className="cover-type"><Icon size={12} />{document.documentType}</span>
    </div>}
    {document.isFeatured && <span className="featured-badge"><Star size={11} fill="currentColor" />Featured</span>}
  </div>;
}
