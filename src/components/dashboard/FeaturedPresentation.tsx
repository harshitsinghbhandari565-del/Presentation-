import type { EducationalDocument } from "@/types/document";
import DocumentCard from "@/components/documents/DocumentCard";
/** Legacy entry point retained; rendering now uses the shared real-result card. */
export default function FeaturedPresentation({ document }: { document: EducationalDocument }) {
  return <DocumentCard document={document} />;
}
