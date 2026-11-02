"use client";
import { useEffect, useRef } from "react";

/**
 * Lazy raw-WebGL ambient layer. The CSS fallback remains visible unless a frame
 * renders successfully. No continuous rendering while hidden/reduced-motion.
 */
export default function AmbientGL() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const media = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const stop = () => { cleanup?.(); cleanup = undefined; canvas.dataset.state = "fallback"; };
    const start = async () => {
      stop();
      if (cancelled || !media.matches || document.documentElement.classList.contains("projector-mode")) return;
      try {
        const { mountAmbient } = await import("./ambient-shader");
        if (cancelled || !media.matches) return;
        cleanup = mountAmbient(canvas);
        canvas.dataset.state = cleanup ? "ready" : "fallback";
      } catch {
        canvas.dataset.state = "fallback";
      }
    };
    const idle = window.requestIdleCallback ?? ((fn: IdleRequestCallback) => window.setTimeout(() => fn({ didTimeout: false, timeRemaining: () => 0 }), 200));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(() => { void start(); });
    const onChange = () => { void start(); };
    media.addEventListener("change", onChange);
    const observer = new MutationObserver(onChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
    return () => { cancelled = true; cancelIdle(handle); media.removeEventListener("change", onChange); observer.disconnect(); stop(); };
  }, []);
  return <canvas ref={ref} className="ambient-canvas" data-state="fallback" />;
}
