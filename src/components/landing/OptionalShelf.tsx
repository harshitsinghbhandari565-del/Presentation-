"use client";
import { useEffect, useRef, useState } from "react";
import { Boxes, LoaderCircle } from "lucide-react";

/**
 * One optional 3D moment. Three.js is imported only after explicit intent and
 * never belongs to the critical landing bundle. A static CSS shelf is the
 * fallback for mobile, reduced-motion, WebGL failure or loading error.
 */
export default function OptionalShelf({ subjects }: { subjects: { name: string; count: number }[] }) {
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "fallback">("idle");
  const cleanup = useRef<(() => void) | undefined>(undefined);
  useEffect(() => () => { cleanup.current?.(); }, []);
  const load = async () => {
    if (state === "loading" || state === "ready") return;
    setState("loading");
    try {
      const { mountShelf } = await import("./shelf-scene");
      if (!host.current) throw new Error("missing host");
      cleanup.current?.();
      cleanup.current = mountShelf(host.current, subjects);
      setState(cleanup.current ? "ready" : "fallback");
    } catch {
      setState("fallback");
    }
  };
  return <div className="optional-shelf">
    <div className="optional-shelf-copy">
      <div className="eyebrow"><Boxes size={14} />A DIFFERENT POINT OF VIEW</div>
      <h3>See the shelf <em>take shape.</em></h3>
      <p>An optional 3D sketch of how subjects sit together. The library itself stays fast, flat and keyboard-first.</p>
      <button type="button" className="button button-secondary" onClick={load} disabled={state === "loading" || state === "ready"} aria-expanded={state === "ready"} aria-controls="optional-shelf-stage">
        {state === "loading" ? <><LoaderCircle size={16} className="spin" />Loading 3D shelf…</> : state === "ready" ? "3D shelf loaded" : "View optional 3D shelf"}
      </button>
      <p className="fine-print" role="status" aria-live="polite">{state === "fallback" ? "3D is unavailable here. The static shelf below shows the same subjects." : state === "ready" ? "Drag to rotate. This scene is decorative; subject links remain in the library." : "Loaded only when you ask. Never required for search or navigation."}</p>
    </div>
    <div id="optional-shelf-stage" className="optional-shelf-stage" data-state={state} ref={host} aria-hidden={state !== "ready"}>
      {state !== "ready" && <div className="static-shelf" aria-hidden="true">{(subjects.length ? subjects : [{ name: "English", count: 1 }]).slice(0, 5).map((s, i) => <span key={s.name} style={{ "--i": i } as React.CSSProperties}><strong>{s.name}</strong><small>{s.count} resource{s.count !== 1 ? "s" : ""}</small></span>)}</div>}
    </div>
  </div>;
}
