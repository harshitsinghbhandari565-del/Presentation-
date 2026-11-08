"use client";
import { useEffect, useRef, useState } from "react";
import { Boxes, LoaderCircle } from "lucide-react";
import { subscribeToProjectorMode, useProjectorMode } from "@/components/projector/ProjectorModeToggle";

/**
 * One optional, demand-rendered 3D moment, imported only after explicit intent.
 * Mobile and reduced-motion users may request it too; the poster remains until
 * success and returns on failure/context loss. Projector mode keeps it static.
 */
export default function OptionalShelf({ subjects }: { subjects: { name: string; count: number }[] }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "fallback">("idle");
  const [interrupted, setInterrupted] = useState(false);
  const cleanup = useRef<(() => void) | undefined>(undefined);
  const mounted = useRef(true);
  const attempt = useRef(0);
  const projectorMode = useProjectorMode();
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; attempt.current += 1; cleanup.current?.(); cleanup.current = undefined; };
  }, []);
  useEffect(() => subscribeToProjectorMode(() => {
    // Both enable and disable leave a static poster. Disabling never auto-loads.
    attempt.current += 1;
    cleanup.current?.();
    cleanup.current = undefined;
    setInterrupted(false);
    setState("fallback");
  }), []);
  const load = async () => {
    if (projectorMode || state === "loading" || state === "ready") return;
    const current = ++attempt.current;
    setState("loading");
    setInterrupted(false);
    try {
      const { mountShelf } = await import("./shelf-scene");
      if (!mounted.current || current !== attempt.current || projectorMode || !host.current) return;
      cleanup.current?.();
      let lost = false;
      const dispose = mountShelf(host.current, subjects, () => {
        if (!mounted.current || current !== attempt.current) return;
        lost = true;
        cleanup.current = undefined;
        setInterrupted(true);
        setState("fallback");
      });
      cleanup.current = dispose;
      setState(dispose && !lost ? "ready" : "fallback");
    } catch {
      if (mounted.current && current === attempt.current) {
        cleanup.current?.();
        cleanup.current = undefined;
        setState("fallback");
      }
    }
  };
  const visibleState = projectorMode ? "fallback" : state;
  const status = projectorMode
    ? "Projector mode keeps the static shelf visible. Page scrolling stays unchanged."
    : visibleState === "fallback"
      ? interrupted ? "The 3D view was interrupted. The static shelf is back; you can try again." : "3D is unavailable here. The static shelf below shows the same subjects."
      : visibleState === "ready"
        ? "Drag to rotate. Vertical touch scrolling remains available. This scene is decorative."
        : "Loads about 129 KB only when you ask. Never required for search or navigation.";
  return <div className="optional-shelf" data-state={visibleState}>
    <div className="optional-shelf-copy">
      <div className="eyebrow"><Boxes size={14} />A DIFFERENT POINT OF VIEW</div>
      <h3>See the shelf <em>take shape.</em></h3>
      <p>An optional 3D sketch of how subjects sit together. The library itself stays fast, flat and keyboard-first.</p>
      <button type="button" className="button button-secondary" onClick={load} disabled={projectorMode || state === "loading" || state === "ready"} aria-expanded={visibleState === "ready"} aria-controls="optional-shelf-stage">
        {visibleState === "loading" ? <><LoaderCircle size={16} className="spin" />Loading 3D shelf…</> : visibleState === "ready" ? "3D shelf loaded" : visibleState === "fallback" ? "Try optional 3D shelf again" : "View optional 3D shelf"}
      </button>
      <p className="fine-print" role="status" aria-live="polite" aria-atomic="true">{status}</p>
    </div>
    <div id="optional-shelf-stage" className="optional-shelf-stage" data-state={visibleState} ref={host} aria-hidden={visibleState !== "ready"}>
      {visibleState !== "ready" && <div className="static-shelf" aria-hidden="true">{(subjects.length ? subjects : [{ name: "English", count: 1 }]).slice(0, 5).map((s, i) => <span key={s.name} style={{ "--i": i } as React.CSSProperties}><strong>{s.name}</strong><small>{s.count} resource{s.count !== 1 ? "s" : ""}</small></span>)}</div>}
    </div>
  </div>;
}
