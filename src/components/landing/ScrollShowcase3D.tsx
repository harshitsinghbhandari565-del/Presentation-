"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, Layers, Orbit, ShieldCheck, Sparkles } from "lucide-react";
import type { EducationalDocument } from "@/types/document";
import { canRun3DMotion, subscribeMotionPaused } from "@/components/layout/motion-state";
import { subscribeToProjectorMode, useProjectorMode } from "@/components/projector/ProjectorModeToggle";
import type { ShowcaseController } from "./scroll-showcase-3d";

const CHAPTERS = [
  {
    num: "01",
    eyebrow: "THE MONOLITH",
    title: "Every resource, engineered for",
    emphasis: "instant clarity.",
    body: "Scroll to unpack a live presentation deck in 3D space—from cover identity to verified cloud source.",
    icon: Sparkles,
  },
  {
    num: "02",
    eyebrow: "EXPLODED TAXONOMY",
    title: "Four layers of context",
    emphasis: "before you click.",
    body: "Subject, course, chapter topic, and document format separate cleanly so you never play tab roulette.",
    icon: Layers,
  },
  {
    num: "03",
    eyebrow: "360° ARCHITECTURE",
    title: "Orbit the structure,",
    emphasis: "skip the noise.",
    body: "No duplicated PDFs or dead group-chat links—lightweight metadata wraps directly around the real deck.",
    icon: Orbit,
  },
  {
    num: "04",
    eyebrow: "MAGNETIC LOCK-IN",
    title: "Snaps back into one",
    emphasis: "verified launchpad.",
    body: "One click opens the original Google Slides, Docs, Sheets, Drive, or Dropbox file in its owner’s control.",
    icon: ShieldCheck,
  },
];

/**
 * Sticky 290vh scroll-scrubbed 3D Exploded Presentation Theater.
 * Scrubs a Three.js 4-layer beveled 3D deck explosion & 220° orbital camera
 * sweep on both desktop and mobile—backed by a live CSS-3D exploded stack
 * before WebGL mounts so 3D scroll motion works on every device.
 */
export default function ScrollShowcase3D({ document: resource }: { document?: EducationalDocument }) {
  const trackRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<ShowcaseController | undefined>(undefined);
  const progressRef = useRef(0);

  const [webglState, setWebglState] = useState<"fallback" | "ready">("fallback");
  const [activeBeat, setActiveBeat] = useState(0);
  const projectorMode = useProjectorMode();

  // Scroll-scrubbed progress tracker (drives both Three.js AND CSS-3D fallback)
  useEffect(() => {
    const track = trackRef.current;
    if (!track || projectorMode) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      if (!canRun3DMotion()) return;
      const rect = track.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      const raw = -rect.top / scrollable;
      const clamped = Math.min(1, Math.max(0, raw));
      progressRef.current = clamped;

      track.style.setProperty("--sc3d-p", clamped.toFixed(4));
      const openIn = Math.min(1, Math.max(0, (clamped - 0.06) / 0.32));
      const closeOut = 1 - Math.min(1, Math.max(0, (clamped - 0.76) / 0.21));
      const explode = openIn * closeOut;
      track.style.setProperty("--sc3d-explode", explode.toFixed(4));

      ctrlRef.current?.setProgress(clamped);

      const nextBeat = Math.min(CHAPTERS.length - 1, Math.floor(clamped * CHAPTERS.length));
      setActiveBeat(prev => (prev === nextBeat ? prev : nextBeat));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    const unsubMotion = subscribeMotionPaused(onScroll);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      unsubMotion();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [projectorMode]);

  // Lazy-mount Three.js 3D Exploded Deck Stage (works on mobile & desktop!)
  useEffect(() => {
    const host = stageRef.current;
    if (!host || projectorMode) return;
    const motionOk = window.matchMedia("(prefers-reduced-motion: no-preference)");
    let cancelled = false;
    let revision = 0;
    let cleanup: (() => void) | undefined;

    const stop = () => {
      revision += 1;
      cleanup?.();
      cleanup = undefined;
      ctrlRef.current = undefined;
      setWebglState("fallback");
    };

    const start = async () => {
      stop();
      const current = revision;
      if (cancelled || !canRun3DMotion()) {
        return;
      }
      try {
        const { mountScrollShowcase } = await import("./scroll-showcase-3d");
        if (cancelled || current !== revision || !canRun3DMotion()) return;
        const ctrl = mountScrollShowcase(host, resource, () => {
          if (current === revision) {
            ctrlRef.current = undefined;
            cleanup = undefined;
            setWebglState("fallback");
          }
        });
        if (ctrl) {
          ctrlRef.current = ctrl;
          cleanup = ctrl.dispose;
          ctrl.setProgress(progressRef.current);
          setWebglState("ready");
        }
      } catch {
        if (current === revision) setWebglState("fallback");
      }
    };

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        entries => {
          if (entries[0]?.isIntersecting) {
            io?.disconnect();
            void start();
          }
        },
        { rootMargin: "420px" },
      );
      io.observe(host);
    } else {
      const t = window.setTimeout(() => { void start(); }, 60);
      return () => window.clearTimeout(t);
    }

    const themeObserver = new MutationObserver(() => {
      if (ctrlRef.current) void start();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const unsubProjector = subscribeToProjectorMode(() => {
      if (document.documentElement.classList.contains("projector-mode")) stop();
    });
    const onMotion = () => { void start(); };
    motionOk.addEventListener("change", onMotion);
    const unsubMotion = subscribeMotionPaused(() => {
      if (canRun3DMotion() && !ctrlRef.current) {
        io?.disconnect();
        void start();
      } else if (!canRun3DMotion() && ctrlRef.current) {
        stop();
      }
    });

    return () => {
      cancelled = true;
      io?.disconnect();
      themeObserver.disconnect();
      unsubProjector();
      unsubMotion();
      motionOk.removeEventListener("change", onMotion);
      stop();
    };
  }, [resource, projectorMode]);

  const current = CHAPTERS[activeBeat] ?? CHAPTERS[0];
  const Icon = current.icon;
  const visibleState = projectorMode ? "fallback" : webglState;

  return (
    <section
      className="scroll-3d-theater"
      ref={trackRef}
      aria-label="Scroll-driven 3D presentation anatomy"
    >
      <div className="scroll-3d-sticky">
        <div
          className="scroll-3d-stage"
          ref={stageRef}
          data-state={visibleState}
          aria-hidden="true"
        >
          <div className="scroll-3d-glow" />
          {/* Pure CSS-3D exploded deck fallback (also scrubs live with scroll!) */}
          <div className="css-exploded-scene">
            <div className="css-exploded-rig">
              <div className="css-deck-layer layer-4">
                <span>LAYER 04 • VERIFIED SOURCE</span>
                <strong>Direct Cloud Link ↗</strong>
              </div>
              <div className="css-deck-layer layer-3">
                <span>LAYER 03 • SLIDE MATRIX</span>
                <strong>Visual Breakdown</strong>
              </div>
              <div className="css-deck-layer layer-2">
                <span>LAYER 02 • CONTEXT</span>
                <strong>{resource?.subject ?? "English"} • {resource?.course ?? "Class 12"}</strong>
              </div>
              <div className="css-deck-layer layer-1">
                <span>LAYER 01 • {resource?.platform ?? "GOOGLE SLIDES"}</span>
                <strong>{resource?.title ?? "MCQs Practice"}</strong>
                <small>{resource?.topic ?? "Ch 2 – The Lost Spring"}</small>
              </div>
            </div>
          </div>
        </div>

        <div className="container scroll-3d-overlay">
          <div className="scroll-3d-hud">
            <div className="scroll-3d-topline">
              <span className="eyebrow">
                <Icon size={14} />
                {current.eyebrow}
              </span>
              <a href="#featured" className="scroll-3d-skip">
                Skip 3D chapter <ArrowDown size={13} />
              </a>
            </div>

            <div className="scroll-3d-copy" key={current.num}>
              <span className="scroll-3d-step-badge">{current.num} / 04</span>
              <h2>
                {current.title}{" "}
                <em>{current.emphasis}</em>
              </h2>
              <p>{current.body}</p>
            </div>

            <div className="scroll-3d-rail" aria-hidden="true">
              <div className="scroll-3d-dots">
                {CHAPTERS.map((ch, idx) => (
                  <span
                    key={ch.num}
                    className={`scroll-3d-dot ${idx === activeBeat ? "active" : idx < activeBeat ? "done" : ""}`}
                  >
                    {ch.num}
                  </span>
                ))}
              </div>
              <div className="scroll-3d-bar-track">
                <div className="scroll-3d-bar-fill" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
