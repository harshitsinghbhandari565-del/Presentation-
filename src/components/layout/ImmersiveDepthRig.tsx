"use client";
import { useEffect } from "react";
import { isMotionPaused, subscribeMotionPaused } from "./motion-state";

/**
 * Coordinates subtle scroll-depth CSS custom properties and tactile 3D
 * card spotlight/micro-tilt across the landing and catalog surfaces.
 * Automatically stands down for reduced-motion, projector-mode, or paused motion.
 */
export default function ImmersiveDepthRig() {
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px) and (prefers-reduced-motion: no-preference) and (hover: hover)");
    let raf = 0;
    let activeCard: HTMLElement | null = null;

    const clearCard = (card: HTMLElement | null) => {
      if (!card) return;
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
      card.style.removeProperty("--spot-x");
      card.style.removeProperty("--spot-y");
      card.removeAttribute("data-tilting");
    };

    const canAnimate = () =>
      media.matches &&
      !document.documentElement.classList.contains("projector-mode") &&
      !isMotionPaused();

    const updateScroll = () => {
      raf = 0;
      const root = document.documentElement;
      const maxScroll = Math.max(1, root.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      const heroDepth = Math.min(1, Math.max(0, window.scrollY / 680));
      root.style.setProperty("--scroll-progress", progress.toFixed(4));
      root.style.setProperty("--hero-scroll", canAnimate() ? heroDepth.toFixed(4) : "0");
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(updateScroll);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!canAnimate()) {
        if (activeCard) {
          clearCard(activeCard);
          activeCard = null;
        }
        return;
      }
      const target = (event.target as Element | null)?.closest<HTMLElement>(
        ".resource-card, .subject-preview, .subject-card, .how-step, .featured-editorial",
      );
      if (target !== activeCard) {
        clearCard(activeCard);
        activeCard = target ?? null;
      }
      if (!activeCard) return;
      const rect = activeCard.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = (event.clientY - rect.top) / rect.height;
      const tiltX = ((0.5 - ny) * 4.5).toFixed(2);
      const tiltY = ((nx - 0.5) * 5.5).toFixed(2);
      activeCard.dataset.tilting = "true";
      activeCard.style.setProperty("--spot-x", `${(nx * 100).toFixed(1)}%`);
      activeCard.style.setProperty("--spot-y", `${(ny * 100).toFixed(1)}%`);
      activeCard.style.setProperty("--tilt-x", `${tiltX}deg`);
      activeCard.style.setProperty("--tilt-y", `${tiltY}deg`);
    };

    const onPointerLeave = () => {
      clearCard(activeCard);
      activeCard = null;
    };

    updateScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", onPointerLeave);

    const unsubPause = subscribeMotionPaused(() => {
      if (!canAnimate()) {
        clearCard(activeCard);
        activeCard = null;
      }
      updateScroll();
    });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      clearCard(activeCard);
      unsubPause();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", onPointerLeave);
    };
  }, []);

  return <div className="scroll-progress-bar" aria-hidden="true" />;
}
