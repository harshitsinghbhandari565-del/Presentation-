"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, FileText, Move3d, Pause, Play, Sparkles } from "lucide-react";
import type { EducationalDocument } from "@/types/document";
import { canRun3DMotion, subscribeMotionPaused, toggleMotionPaused, useMotionStatus } from "@/components/layout/motion-state";
import { subscribeToProjectorMode, useProjectorMode } from "@/components/projector/ProjectorModeToggle";

/**
 * Interactive 3D Hero Studio Stage.
 * Dynamically loads the Three.js PBR presentation monolith scene after first
 * paint so SSR HTML and initial JS stay fast, while crossfading seamlessly
 * from a layered perspective fallback stack.
 */
export default function HeroScene({ document: resource }: { document?: EducationalDocument }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"fallback" | "ready">("fallback");
  const motionStatus = useMotionStatus();
  const projectorMode = useProjectorMode();

  useEffect(() => {
    const host = stageRef.current;
    if (!host) return;
    const media = window.matchMedia("(prefers-reduced-motion: no-preference)");
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    let revision = 0;

    const allowed = () => !cancelled && canRun3DMotion();

    const stop = () => {
      revision += 1;
      cleanup?.();
      cleanup = undefined;
      setState("fallback");
    };

    const start = async () => {
      stop();
      const current = revision;
      if (!allowed()) return;
      try {
        const { mountHeroStage } = await import("./hero-stage-3d");
        if (!allowed() || current !== revision) return;
        const dispose = mountHeroStage(host, resource, () => {
          if (current === revision) {
            cleanup = undefined;
            setState("fallback");
          }
        });
        cleanup = dispose;
        setState(dispose ? "ready" : "fallback");
      } catch {
        if (current === revision) setState("fallback");
      }
    };

    const handle = window.setTimeout(() => { void start(); }, 40);
    const onChange = () => { void start(); };
    media.addEventListener("change", onChange);
    const unsubMotion = subscribeMotionPaused(() => {
      if (canRun3DMotion() && !cleanup) {
        void start();
      } else if (!canRun3DMotion() && cleanup) {
        stop();
      }
    });

    const themeObserver = new MutationObserver(() => { void start(); });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const unsubProjector = subscribeToProjectorMode(onChange);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
      media.removeEventListener("change", onChange);
      unsubMotion();
      themeObserver.disconnect();
      unsubProjector();
      stop();
    };
  }, [resource]);

  const visibleState = projectorMode ? "fallback" : state;

  return (
    <div className="hero-visual" data-scene-state={visibleState}>
      <div
        className="hero-scene-3d"
        ref={stageRef}
        data-state={visibleState}
        aria-hidden="true"
      >
        <div className="hero-stage-aura" />
        <div className="hero-card-fallback">
          <div className="hero-fallback-back" />
          <div className="hero-fallback-mid">
            <span>Structured for clarity.</span>
          </div>
          <div className="hero-card">
            <div className="visual-document-header">
              <span className="visual-file-icon">
                <FileText size={21} strokeWidth={1.5} />
              </span>
              <span>
                {resource?.platform ?? "Google Slides"}
                <small>Made for your next study session</small>
              </span>
              <span className="visual-file-menu">•••</span>
            </div>
            <div className="visual-document-content">
              <span className="visual-eyebrow">{resource?.subject ?? "English"}</span>
              <h2>{resource?.title ?? "MCQs Practice"}</h2>
              <p>{resource?.topic ?? "Good resources. All together."}</p>
              <div className="visual-content-lines"><i /><i /><i /></div>
              <div className="visual-note">
                <Sparkles size={14} />
                <span>Direct classroom access — zero detours.</span>
              </div>
            </div>
            <div className="visual-document-footer">
              <span><span className="tiny-dot" />Ready when you are</span>
              <ArrowUpRight size={16} />
            </div>
          </div>
        </div>
      </div>

      {!projectorMode && (
        <div className="hero-stage-hud">
          {visibleState === "ready" && motionStatus === "active" && (
            <span className="hero-hud-hint" aria-hidden="true">
              <Move3d size={13} />
              Tap to 360° spin • Drag to orbit
            </span>
          )}
          <button
            type="button"
            className={motionStatus === "os-blocked" ? "hero-motion-toggle hero-motion-alert" : "hero-motion-toggle"}
            onClick={() => toggleMotionPaused()}
            aria-pressed={motionStatus !== "active"}
          >
            {motionStatus !== "active" ? <Play size={12} /> : <Pause size={12} />}
            <span>
              {motionStatus === "os-blocked"
                ? "OS Reduced Motion On — Tap to Enable 3D"
                : motionStatus === "paused"
                  ? "Resume 3D motion"
                  : "Pause motion"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
