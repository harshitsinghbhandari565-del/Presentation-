import { ArrowUpRight, Check, FileText, Link2, Sparkles, Star } from "lucide-react";
import type { EducationalDocument } from "@/types/document";

/** Decorative hero stack. A guarded CSS view() rule translates the stack; no JS animation. */
export default function HeroVisual({ document }: { document?: EducationalDocument }) {
  return <div className="hero-visual" aria-hidden="true">
    <div className="hero-orbit hero-orbit-one" /><div className="hero-orbit hero-orbit-two" />
    <span className="visual-spark spark-one"><Sparkles size={21} /></span><span className="visual-spark spark-two">+</span>
    <div className="hero-document-stack">
      <div className="stack-sheet sheet-back"><span>STUDY BETTER</span></div>
      <div className="stack-sheet sheet-middle"><div className="sheet-tab" /><span>One place.<br />So much to learn.</span></div>
      <div className="stack-sheet sheet-front">
        <div className="visual-document-header"><span className="visual-file-icon"><FileText size={23} strokeWidth={1.5} /></span><span>{document?.platform ?? "Your resources"}<small>Made for your next study session</small></span><span className="visual-file-menu">•••</span></div>
        <div className="visual-document-content"><span className="visual-eyebrow">{document?.subject ?? "A little more organized"}</span><h2>{document?.title ?? "Your next great idea starts here."}</h2><p>{document?.topic ?? "Good resources. All together."}</p><div className="visual-content-lines"><i /><i /><i /></div><div className="visual-note"><Sparkles size={15} /><span>A clearer path to understanding.</span></div></div>
        <div className="visual-document-footer"><span><span className="tiny-dot" />Ready when you are</span><ArrowUpRight size={17} /></div>
      </div>
    </div>
    <div className="floating-chip floating-chip-top"><span className="chip-check"><Check size={14} /></span><span>Less clutter.<strong>More clarity.</strong></span></div>
    <div className="floating-chip floating-chip-bottom"><span className="chip-link"><Link2 size={18} /></span><span>One click away<strong>From your next aha.</strong></span><Star size={15} className="chip-star" /></div>
    <span className="visual-caption">A home for your learning essentials.</span>
  </div>;
}
