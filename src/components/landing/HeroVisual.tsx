import { ArrowUpRight, FileText } from "lucide-react";
import type { EducationalDocument } from "@/types/document";

/** Clean, static hero preview card. No 3D, no animation — just a flat document preview. */
export default function HeroVisual({ document }: { document?: EducationalDocument }) {
  return <div className="hero-visual" aria-hidden="true">
    <div className="hero-card">
      <div className="visual-document-header">
        <span className="visual-file-icon"><FileText size={23} strokeWidth={1.5} /></span>
        <span>{document?.platform ?? "Your resources"}<small>Made for your next study session</small></span>
        <span className="visual-file-menu">•••</span>
      </div>
      <div className="visual-document-content">
        <span className="visual-eyebrow">{document?.subject ?? "A little more organized"}</span>
        <h2>{document?.title ?? "Your next great idea starts here."}</h2>
        <p>{document?.topic ?? "Good resources. All together."}</p>
        <div className="visual-content-lines"><i /><i /><i /></div>
      </div>
      <div className="visual-document-footer">
        <span><span className="tiny-dot" />Ready when you are</span>
        <ArrowUpRight size={17} />
      </div>
    </div>
  </div>;
}
