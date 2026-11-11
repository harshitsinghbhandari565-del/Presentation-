import { Play } from "lucide-react";
import type { EducationalDocument } from "@/types/document";
import ExternalLink from "@/components/documents/ExternalLink";
import CopyLink from "@/components/documents/CopyLink";
import ShareCitationBar from "@/components/documents/ShareCitationBar";

export default function BackupLinks({ document }: { document: EducationalDocument }) {
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
