"use client";
import { useEffect, useRef } from "react";

/**
 * Cinematic WebGL volumetric light & aurora layer.
 * Lazy-imported after idle so initial paint stays instant; re-syncs
 * automatically on theme switches and projector-mode changes.
 */
export default function AmbientGL() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const media = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    let revision = 0;

    const allowed = () => !cancelled && media.matches && !document.documentElement.classList.contains("projector-mode");
    const stop = () => {
      revision += 1;
      cleanup?.();
      cleanup = undefined;
      canvas.dataset.state = "fallback";
    };

    const start = async () => {
      stop();
      const current = revision;
      if (!allowed()) return;
      try {
        const { mountAmbient } = await import("./ambient-shader");
        if (!allowed() || current !== revision) return;
        cleanup = mountAmbient(canvas);
        canvas.dataset.state = cleanup ? "ready" : "fallback";
      } catch {
        if (current === revision) canvas.dataset.state = "fallback";
      }
    };

    const idle = window.requestIdleCallback ?? ((fn: IdleRequestCallback) => window.setTimeout(() => fn({ didTimeout: false, timeRemaining: () => 0 }), 120));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(() => { void start(); });

    const onChange = () => { void start(); };
    media.addEventListener("change", onChange);
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });

    return () => {
      cancelled = true;
      cancelIdle(handle);
      media.removeEventListener("change", onChange);
      observer.disconnect();
      stop();
    };
  }, []);

  return <canvas ref={ref} className="ambient-canvas" data-state="fallback" aria-hidden="true" />;
}
