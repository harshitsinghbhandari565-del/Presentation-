import { Play, Download } from "lucide-react";
import { mathPaperDownload } from "@/lib/math-papers";
import type { EducationalDocument } from "@/types/document";
import ExternalLink from "@/components/documents/ExternalLink";
import CopyLink from "@/components/documents/CopyLink";
import ShareCitationBar from "@/components/documents/ShareCitationBar";

export default function BackupLinks({ document }: { document: EducationalDocument }) {
  const paper = mathPaperDownload(document);
  if (paper) return <div className="document-actions"><a className="button button-primary" href={paper.downloadUrl} download={paper.filename} aria-label={`Download ${document.title} as PDF`}><Download size={15} />Download PDF</a></div>;
  return (
    <div className="document-actions">
      <ExternalLink href={document.originalUrl} label={`Open document: ${document.title}`}>
        Open Document
      </ExternalLink>
      {document.presentationUrl && (
        <ExternalLink
          href={document.presentationUrl}
          className="button button-secondary"
          label={`Start presentation: ${document.title}`}
        >
          <Play size={15} />
          Present
        </ExternalLink>
      )}
      <CopyLink url={document.originalUrl} />
      <ShareCitationBar
        title={document.title}
        subject={document.subject}
        course={document.course}
        documentType={document.documentType}
        platform={document.platform}
        originalUrl={document.originalUrl}
      />
    </div>
  );
}
