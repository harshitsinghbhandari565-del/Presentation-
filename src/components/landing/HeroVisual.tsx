"use client";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight, Check, FileText, Link2, Sparkles, Star } from "lucide-react";
import type { EducationalDocument } from "@/types/document";
export default function HeroVisual({ document }: { document?: EducationalDocument }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const reduced = useReducedMotion();
  const y = useTransform(scrollYProgress, [0, 1], [0, 55]);
  return <div className="hero-visual" ref={ref} aria-label="A decorative organized document collection">
    <div className="hero-orbit hero-orbit-one" /><div className="hero-orbit hero-orbit-two" />
    <span className="visual-spark spark-one"><Sparkles size={21} /></span><span className="visual-spark spark-two">+</span>
    <motion.div className="hero-document-stack" style={{ y: reduced ? 0 : y }}>
      <div className="stack-sheet sheet-back"><span>STUDY BETTER</span></div>
      <div className="stack-sheet sheet-middle"><div className="sheet-tab" /><span>One place.<br />So much to learn.</span></div>
      <div className="stack-sheet sheet-front">
        <div className="visual-document-header"><span className="visual-file-icon"><FileText size={23} strokeWidth={1.5} /></span><span>{document?.platform ?? "Your resources"}<small>Made for your next study session</small></span><span className="visual-file-menu" aria-hidden="true">•••</span></div>
        <div className="visual-document-content"><span className="visual-eyebrow">{document?.subject ?? "A little more organized"}</span><h2>{document?.title ?? "Your next great idea starts here."}</h2><p>{document?.topic ?? "Good resources. All together."}</p><div className="visual-content-lines"><i /><i /><i /></div><div className="visual-note"><Sparkles size={15} /><span>A clearer path to understanding.</span></div></div>
        <div className="visual-document-footer"><span><span className="tiny-dot" />Ready when you are</span><ArrowUpRight size={17} /></div>
      </div>
    </motion.div>
    <div className="floating-chip floating-chip-top"><span className="chip-check"><Check size={14} /></span><span>Less clutter.<strong>More clarity.</strong></span></div>
    <div className="floating-chip floating-chip-bottom"><span className="chip-link"><Link2 size={18} /></span><span>One click away<strong>From your next aha.</strong></span><Star size={15} className="chip-star" /></div>
    <span className="visual-caption">A home for your learning essentials.</span>
  </div>;
}
