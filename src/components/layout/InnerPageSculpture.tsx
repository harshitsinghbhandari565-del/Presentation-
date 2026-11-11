"use client";
import { useRef, useState } from "react";
import { BookOpen, Layers3, Search, ShieldCheck, Sparkles, Compass } from "lucide-react";
import { canRun3DMotion } from "./motion-state";

interface InnerPageSculptureProps {
  variant: "library" | "subjects" | "subject-detail" | "about";
  statPrimary?: string;
  statLabel?: string;
  badgeText?: string;
}

export default function InnerPageSculpture({
  variant,
  statPrimary = "01",
  statLabel = "Curated shelf",
  badgeText = "STUDIO 3D",
}: InnerPageSculptureProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [spins, setSpins] = useState(0);

  const onMove = (clientX: number, clientY: number) => {
    const el = hostRef.current;
    if (!el || !canRun3DMotion()) return;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return;
    const nx = Math.max(-1, Math.min(1, ((clientX - r.left) / r.width - 0.5) * 2));
    const ny = Math.max(-1, Math.min(1, ((clientY - r.top) / r.height - 0.5) * 2));
    el.style.setProperty("--sculp-rx", `${(-ny * 15).toFixed(2)}deg`);
    el.style.setProperty("--sculp-ry", `${(nx * 20).toFixed(2)}deg`);
  };

  const onLeave = () => {
    const el = hostRef.current;
    if (!el) return;
    el.style.setProperty("--sculp-rx", "0deg");
    el.style.setProperty("--sculp-ry", "0deg");
  };

  return (
    <div
      ref={hostRef}
      className={`inner-sculpture inner-sculpture-${variant}`}
      aria-hidden="true"
      style={{ ["--sculp-spin" as string]: `${spins * 360}deg` }}
      onPointerMove={e => onMove(e.clientX, e.clientY)}
      onPointerLeave={onLeave}
      onClick={() => {
        if (canRun3DMotion()) setSpins(s => s + 1);
      }}
    >
      <div className="inner-sculpture-aura" />
      <div className="inner-sculpture-rig">
        <div className="sculp-orbit sculp-orbit-a" />
        <div className="sculp-orbit sculp-orbit-b" />

        {variant === "library" && (
          <>
            <div className="sculp-plate sculp-plate-back">
              <span><ShieldCheck size={12} /> DIRECT CLOUD</span>
              <strong>Original Links ↗</strong>
            </div>
            <div className="sculp-plate sculp-plate-mid">
              <span><Search size={12} /> INSTANT INDEX</span>
              <strong>⌘K + 6 Filters</strong>
            </div>
            <div className="sculp-plate sculp-plate-front">
              <span><Layers3 size={12} /> {badgeText}</span>
              <strong>{statPrimary}</strong>
              <small>{statLabel}</small>
            </div>
          </>
        )}

        {variant === "subjects" && (
          <>
            <div className="sculp-plate sculp-plate-back">
              <span><Sparkles size={12} /> CURATED</span>
              <strong>Course Shelves</strong>
            </div>
            <div className="sculp-plate sculp-plate-mid">
              <span><Compass size={12} /> TAXONOMY</span>
              <strong>Topic Mapped</strong>
            </div>
            <div className="sculp-plate sculp-plate-front">
              <span><BookOpen size={12} /> {badgeText}</span>
              <strong>{statPrimary}</strong>
              <small>{statLabel}</small>
            </div>
          </>
        )}

        {variant === "subject-detail" && (
          <>
            <div className="sculp-plate sculp-plate-back">
              <span><ShieldCheck size={12} /> VERIFIED</span>
              <strong>Source Intact</strong>
            </div>
            <div className="sculp-plate sculp-plate-mid">
              <span><Layers3 size={12} /> CHAPTERS</span>
              <strong>Study Ready</strong>
            </div>
            <div className="sculp-plate sculp-plate-front">
              <span><BookOpen size={12} /> {badgeText}</span>
              <strong>{statPrimary}</strong>
              <small>{statLabel}</small>
            </div>
          </>
        )}

        {variant === "about" && (
          <>
            <div className="sculp-plate sculp-plate-back">
              <span><ShieldCheck size={12} /> 03 • OWNER VAULT</span>
              <strong>Drive · Dropbox</strong>
            </div>
            <div className="sculp-plate sculp-plate-mid">
              <span><Layers3 size={12} /> 02 • ZERO COPY</span>
              <strong>Metadata Only</strong>
            </div>
            <div className="sculp-plate sculp-plate-front">
              <span><Sparkles size={12} /> 01 • STUDENT FIRST</span>
              <strong>No Sign-Up</strong>
              <small>Direct classroom flow</small>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
