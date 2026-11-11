"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Boxes, LoaderCircle, RotateCw } from "lucide-react";
import { canRun3DMotion, subscribeMotionPaused } from "@/components/layout/motion-state";
import { subscribeToProjectorMode, useProjectorMode } from "@/components/projector/ProjectorModeToggle";
import type { ShelfController } from "./shelf-scene";

const UPCOMING_SUBJECTS = ["Physics", "Mathematics", "Computer Science", "Economics"];

/**
 * Interactive 3D Subject Folio Turntable.
 * Auto-mounts when scrolled near view on capable desktop viewports, with
 * subject focus pills that rotate & elevate individual 3D folios on demand.
 */
export default function OptionalShelf({ subjects }: { subjects: { name: string; count: number }[] }) {
  const host = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<ShelfController | undefined>(undefined);
  const mounted = useRef(true);
  const attempt = useRef(0);

  const [state, setState] = useState<"idle" | "loading" | "ready" | "fallback">("idle");
  const [interrupted, setInterrupted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const projectorMode = useProjectorMode();

  const items = useMemo(() => {
    const live = (subjects.length ? subjects : [{ name: "English", count: 1 }])
      .slice(0, 6)
      .map(s => ({ name: s.name, count: s.count, live: true }));
    const seen = new Set(live.map(s => s.name.toLowerCase()));
    for (const name of UPCOMING_SUBJECTS) {
      if (live.length >= 5) break;
      if (!seen.has(name.toLowerCase())) {
        live.push({ name, count: 0, live: false });
      }
    }
    return live;
  }, [subjects]);

  const teardown = useCallback(() => {
    attempt.current += 1;
    controllerRef.current?.dispose();
    controllerRef.current = undefined;
  }, []);

  const load = useCallback(async () => {
    if (document.documentElement.classList.contains("projector-mode")) return;
    if (controllerRef.current) return;
    const current = ++attempt.current;
    setState("loading");
    setInterrupted(false);
    try {
      const { mountShelf } = await import("./shelf-scene");
      if (!mounted.current || current !== attempt.current || !host.current) return;
      if (document.documentElement.classList.contains("projector-mode")) {
        setState("fallback");
        return;
      }
      let lost = false;
      const ctrl = mountShelf(host.current, subjects, () => {
        if (!mounted.current || current !== attempt.current) return;
        lost = true;
        controllerRef.current = undefined;
        setInterrupted(true);
        setState("fallback");
      });
      controllerRef.current = ctrl;
      if (ctrl && !lost) {
        ctrl.setActiveIndex(activeIndexRef.current);
        setState("ready");
      } else {
        setState("fallback");
      }
    } catch {
      if (mounted.current && current === attempt.current) {
        controllerRef.current = undefined;
        setState("fallback");
      }
    }
  }, [subjects]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      teardown();
    };
  }, [teardown]);

  useEffect(() => subscribeToProjectorMode(() => {
    teardown();
    setInterrupted(false);
    setState("fallback");
  }), [teardown]);

  // Auto-activate when scrolled near viewport on both mobile and desktop
  useEffect(() => {
    const el = host.current;
    if (!el || projectorMode) return;

    let io: IntersectionObserver | undefined;
    const arm = () => {
      io?.disconnect();
      if (!canRun3DMotion()) return;
      if (typeof IntersectionObserver === "undefined") {
        window.setTimeout(() => { void load(); }, 0);
        return;
      }
      io = new IntersectionObserver(
        entries => {
          if (entries[0]?.isIntersecting) {
            io?.disconnect();
            void load();
          }
        },
        { rootMargin: "260px" },
      );
      io.observe(el);
    };

    arm();
    const unsubMotion = subscribeMotionPaused(() => {
      if (canRun3DMotion() && !controllerRef.current) arm();
    });
    return () => {
      io?.disconnect();
      unsubMotion();
    };
  }, [load, projectorMode]);

  // Re-mount 3D textures cleanly on theme toggle if already active
  useEffect(() => {
    const observer = new MutationObserver(() => {
      if (!controllerRef.current) return;
      teardown();
      void load();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, [load, teardown]);

  const handleSelectSubject = (index: number) => {
    activeIndexRef.current = index;
    setActiveIndex(index);
    controllerRef.current?.setActiveIndex(index);
  };

  const visibleState = projectorMode ? "fallback" : state;
  const status = projectorMode
    ? "Projector mode keeps the static shelf visible for high-contrast classroom reading."
    : visibleState === "fallback"
      ? interrupted
        ? "The 3D view was interrupted. 3D is unavailable here; the static shelf remains visible."
        : "3D is unavailable here; every subject remains accessible below."
      : visibleState === "ready"
        ? "Interactive 3D turntable active — select a subject folio or drag horizontally to orbit."
        : "Preparing interactive 3D subject shelf…";

  return (
    <div className="optional-shelf" data-state={visibleState}>
      <div className="optional-shelf-copy">
        <div className="eyebrow"><Boxes size={14} />INTERACTIVE 3D ARCHIVE</div>
        <h3>See the shelf <em>take shape.</em></h3>
        <p>
          Explore how live subjects and upcoming study shelves sit together in 3D space.
          Pick any folio below to spotlight it on the turntable, or drag the stage to orbit.
        </p>

        <div className="shelf-inspector-pills" role="group" aria-label="Spotlight subject folio">
          {items.map((item, idx) => (
            <button
              key={item.name}
              type="button"
              className={`shelf-pill ${idx === activeIndex ? "active" : ""}`}
              aria-pressed={idx === activeIndex}
              onClick={() => handleSelectSubject(idx)}
            >
              <span>{item.name}</span>
              <small>{item.live ? `${item.count}` : "Soon"}</small>
            </button>
          ))}
        </div>

        {visibleState !== "ready" && (
          <button
            type="button"
            className="button button-secondary"
            onClick={() => { void load(); }}
            disabled={projectorMode || visibleState === "loading"}
            aria-controls="optional-shelf-stage"
            aria-label="View optional 3D shelf"
          >
            {visibleState === "loading" ? (
              <><LoaderCircle size={16} className="spin" />Loading 3D shelf…</>
            ) : (
              <><RotateCw size={15} />{visibleState === "fallback" ? "Reload 3D shelf" : "View optional 3D shelf"}</>
            )}
          </button>
        )}

        <p className="fine-print" role="status" aria-live="polite" aria-atomic="true">
          {status}
        </p>
      </div>

      <div
        id="optional-shelf-stage"
        className="optional-shelf-stage"
        data-state={visibleState}
        ref={host}
        aria-hidden={visibleState === "ready"}
      >
        {visibleState !== "ready" && (
          <div className="static-shelf static-shelf-grid">
            {items.map((s, idx) => (
              <div
                key={s.name}
                className={`static-shelf-card ${idx === activeIndex ? "selected" : ""}`}
              >
                <strong>{s.name}</strong>
                <small>
                  {s.live ? `${s.count} resource${s.count !== 1 ? "s" : ""}` : "Upcoming shelf"}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
