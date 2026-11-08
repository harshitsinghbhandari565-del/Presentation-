"use client";
import { useEffect } from "react";
import { isMotionPaused, subscribeMotionPaused } from "./motion-state";

const SCROLL_3D_SELECTOR =
  ".reveal, .how-step, .subject-preview, .subject-coming, .compatibility";

/**
 * Page-wide 3D scroll choreography & tactile card spotlight engine.
 * Works across mobile & desktop browsers (including iOS Safari where CSS
 * view() timelines don't run) while standing down cleanly for reduced-motion,
 * projector-mode, or paused motion.
 */
export default function ImmersiveDepthRig() {
  useEffect(() => {
    const motionMedia = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const hoverMedia = window.matchMedia("(hover: hover) and (min-width: 768px)");
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

    const resetScrollElements = () => {
      document.querySelectorAll<HTMLElement>("[data-s3d-active]").forEach(el => {
        el.style.removeProperty("--s3d-rx");
        el.style.removeProperty("--s3d-ty");
        el.style.removeProperty("--s3d-scale");
        el.removeAttribute("data-s3d-active");
      });
    };

    const canAnimate = () =>
      motionMedia.matches &&
      !document.documentElement.classList.contains("projector-mode") &&
      !isMotionPaused();

    const updateScroll = () => {
      raf = 0;
      const root = document.documentElement;
      const vh = Math.max(1, window.innerHeight);
      const maxScroll = Math.max(1, root.scrollHeight - vh);
      const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      const heroDepth = Math.min(1, Math.max(0, window.scrollY / 560));

      root.style.setProperty("--scroll-progress", progress.toFixed(4));

      if (!canAnimate()) {
        root.style.setProperty("--hero-scroll", "0");
        resetScrollElements();
        return;
      }

      root.style.setProperty("--hero-scroll", heroDepth.toFixed(4));

      const targets = document.querySelectorAll<HTMLElement>(SCROLL_3D_SELECTOR);
      targets.forEach(el => {
        const rect = el.getBoundingClientRect();
        // Skip elements far outside viewport
        if (rect.top > vh * 1.25 || rect.bottom < -vh * 0.25) return;

        // Entry zone: rect.top moves from vh*1.04 -> vh*0.56
        const entryRaw = (vh * 1.04 - rect.top) / (vh * 0.48);
        const entry = Math.min(1, Math.max(0, entryRaw));
        const easedEntry = 1 - Math.pow(1 - entry, 2.4);

        // Exit zone near top: rect.bottom moves from vh*0.28 -> 0
        const exitRaw = rect.bottom < vh * 0.28 ? 1 - Math.max(0, rect.bottom / (vh * 0.28)) : 0;
        const easedExit = exitRaw * exitRaw;

        const rx = (1 - easedEntry) * 16 - easedExit * 8;
        const ty = (1 - easedEntry) * 38 - easedExit * 14;
        const scale = 1 - (1 - easedEntry) * 0.055 - easedExit * 0.025;

        el.dataset.s3dActive = "true";
        el.style.setProperty("--s3d-rx", `${rx.toFixed(2)}deg`);
        el.style.setProperty("--s3d-ty", `${ty.toFixed(1)}px`);
        el.style.setProperty("--s3d-scale", scale.toFixed(3));
      });
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(updateScroll);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!canAnimate() || !hoverMedia.matches) {
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
      const tiltX = ((0.5 - ny) * 5.5).toFixed(2);
      const tiltY = ((nx - 0.5) * 6.5).toFixed(2);
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
        resetScrollElements();
      }
      updateScroll();
    });

    const onMotionChange = () => updateScroll();
    motionMedia.addEventListener("change", onMotionChange);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      clearCard(activeCard);
      resetScrollElements();
      unsubPause();
      motionMedia.removeEventListener("change", onMotionChange);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", onPointerLeave);
    };
  }, []);

  return <div className="scroll-progress-bar" aria-hidden="true" />;
}
