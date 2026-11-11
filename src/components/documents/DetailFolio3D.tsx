"use client";
import { useRef, useState, type ReactNode } from "react";
import { Rotate3d, ShieldCheck, Layers3 } from "lucide-react";
import type { EducationalDocument } from "@/types/document";
import { displayHost } from "@/lib/urls";
import { canRun3DMotion } from "@/components/layout/motion-state";

interface DetailFolio3DProps {
  document: EducationalDocument;
  children: ReactNode;
}

export default function DetailFolio3D({ document, children }: DetailFolio3DProps) {
  const [flipped, setFlipped] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ down: false, startX: 0, startY: 0, travel: 0 });

  const updateTilt = (clientX: number, clientY: number) => {
    const el = stageRef.current;
    if (!el || !canRun3DMotion()) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const nx = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width - 0.5) * 2));
    const ny = Math.max(-1, Math.min(1, ((clientY - rect.top) / rect.height - 0.5) * 2));
    el.style.setProperty("--folio-rx", `${(-ny * 13).toFixed(2)}deg`);
    el.style.setProperty("--folio-ry", `${(nx * 16).toFixed(2)}deg`);
    el.style.setProperty("--folio-gx", `${((nx * 0.5 + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty("--folio-gy", `${((ny * 0.5 + 0.5) * 100).toFixed(1)}%`);
    el.dataset.tilting = "true";
  };

  const resetTilt = () => {
    const el = stageRef.current;
    if (!el) return;
    el.style.setProperty("--folio-rx", "0deg");
    el.style.setProperty("--folio-ry", "0deg");
    delete el.dataset.tilting;
  };

  return (
    <div className="detail-folio-3d">
      <div
        ref={stageRef}
        className="detail-folio-stage"
        data-flipped={flipped ? "true" : "false"}
        onPointerMove={e => updateTilt(e.clientX, e.clientY)}
        onPointerLeave={() => {
          dragRef.current.down = false;
          resetTilt();
        }}
        onPointerDown={e => {
          dragRef.current = { down: true, startX: e.clientX, startY: e.clientY, travel: 0 };
        }}
        onPointerUp={e => {
          if (dragRef.current.down) {
            const moved = Math.hypot(e.clientX - dragRef.current.startX, e.clientY - dragRef.current.startY);
            dragRef.current.down = false;
            if (moved < 8) {
              setFlipped(v => !v);
            }
          }
          resetTilt();
        }}
      >
        <div className="detail-folio-rig">
          {/* Stacked 3D slide depth sheets */}
          <div className="detail-folio-sheet sheet-back-2" aria-hidden="true" />
          <div className="detail-folio-sheet sheet-back-1" aria-hidden="true" />

          {/* Front 3D face: real DocumentCover */}
          <div className="detail-folio-face detail-folio-front" aria-hidden={flipped || undefined}>
            {children}
            <div className="detail-folio-glint" aria-hidden="true" />
          </div>

          {/* Back 3D face: Archival Index Card */}
          <div className="detail-folio-face detail-folio-back" aria-hidden={!flipped || undefined}>
            <div className="folio-back-top">
              <span className="folio-back-eyebrow">
                <Layers3 size={12} aria-hidden="true" />
                ARCHIVAL FOLIO
              </span>
              <span className="folio-back-type">{document.documentType}</span>
            </div>
            <div className="folio-back-body">
              <strong>{document.title}</strong>
              <p>
                {document.subject}
                {document.course ? ` · ${document.course}` : ""}
                {document.semester ? ` · ${document.semester}` : ""}
              </p>
              {document.tags.length > 0 && (
                <div className="folio-back-tags">
                  {document.tags.slice(0, 4).map(t => (
                    <span key={t}>#{t}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="folio-back-footer">
              <span>
                <ShieldCheck size={13} aria-hidden="true" />
                {displayHost(document.originalUrl)}
              </span>
              <span>{document.platform}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="detail-folio-bar">
        <span className="detail-folio-hint" aria-hidden="true">
          Tilt or tap card to inspect
        </span>
        <button
          type="button"
          className="detail-folio-flip-btn"
          aria-pressed={flipped}
          onClick={() => setFlipped(v => !v)}
        >
          <Rotate3d size={14} aria-hidden="true" />
          {flipped ? "Show cover" : "Flip 3D card"}
        </button>
      </div>
    </div>
  );
}
