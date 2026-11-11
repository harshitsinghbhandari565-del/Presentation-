"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { canRun3DMotion, subscribeMotionPaused, syncForceDataset } from "./motion-state";

const SCROLL_3D_SELECTOR = [
  ".section-heading",
  ".resource-card",
  ".featured-editorial",
  ".subject-preview",
  ".subject-coming",
  ".optional-shelf",
  ".how-intro",
  ".how-step",
  ".final-cta",
  ".source-strip",
  ".page-intro",
  ".library-search-form",
  ".results-toolbar",
  ".subject-card",
  ".course-list > a",
  ".about-principles > article",
  ".about-note",
  ".empty-state",
  ".detail-title",
  ".source-panel",
  ".detail-sidebar > .document-cover",
  ".resource-facts",
  ".optional-preview",
  ".backup-row",
].join(", ");

const PLATFORM_BADGE_SELECTOR = ".compatibility .platform-list > span";

/**
 * Full-website 60fps spring-damped 3D scroll choreography & cursor spotlight engine.
 * Continuously drives every UI component across X/Y/Z translation and 3-axis
 * perspective rotation (rotateX, rotateY, rotateZ) + inner child parallax while
 * scrolling on both mobile and desktop, standing down cleanly for reduced-motion,
 * projector-mode, or paused motion.
 */
export default function ImmersiveDepthRig() {
  const pathname = usePathname();

  useEffect(() => {
    const motionMedia = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const hoverMedia = window.matchMedia("(hover: hover) and (min-width: 768px)");
    let raf = 0;
    let activeCard: HTMLElement | null = null;
    let smoothY = window.scrollY;
    let smoothVel = 0;
    let initialized = false;

    const clearCard = (card: HTMLElement | null) => {
      if (!card) return;
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
      card.style.removeProperty("--spot-x");
      card.style.removeProperty("--spot-y");
      card.removeAttribute("data-tilting");
    };

    const resetAllScrollTransforms = () => {
      const root = document.documentElement;
      root.removeAttribute("data-s3d-ready");
      root.style.setProperty("--hero-scroll", "0");
      root.style.setProperty("--hero-p", "0");
      root.style.setProperty("--hero-vel", "0");

      document.querySelectorAll<HTMLElement>("[data-s3d], [data-s3d-badge]").forEach(el => {
        el.style.removeProperty("--s3d-tx");
        el.style.removeProperty("--s3d-ty");
        el.style.removeProperty("--s3d-tz");
        el.style.removeProperty("--s3d-rx");
        el.style.removeProperty("--s3d-ry");
        el.style.removeProperty("--s3d-rz");
        el.style.removeProperty("--s3d-scale");
        el.style.removeProperty("--s3d-t");
        el.style.removeProperty("--s3d-abs");
        el.removeAttribute("data-s3d");
        el.removeAttribute("data-s3d-badge");
      });
    };

    syncForceDataset();
    const canAnimate = () => canRun3DMotion();

    const stepFrame = () => {
      raf = 0;
      const root = document.documentElement;
      const vw = Math.max(1, window.innerWidth);
      const vh = Math.max(1, window.innerHeight);
      const isMobile = vw < 640;
      const isDesktopSticky = vw >= 768;

      const rawY = window.scrollY;
      const maxScroll = Math.max(1, root.scrollHeight - vh);
      const progress = Math.min(1, Math.max(0, rawY / maxScroll));
      root.style.setProperty("--scroll-progress", progress.toFixed(4));

      if (!canAnimate()) {
        smoothY = rawY;
        smoothVel = 0;
        resetAllScrollTransforms();
        return;
      }

      if (!initialized) {
        smoothY = rawY;
        initialized = true;
      }

      const diff = rawY - smoothY;
      smoothY += diff * 0.2;
      const targetVel = Math.max(-1, Math.min(1, diff / 85));
      smoothVel += (targetVel - smoothVel) * 0.26;
      if (Math.abs(diff) < 0.15 && Math.abs(smoothVel) < 0.003) {
        smoothY = rawY;
        smoothVel = 0;
      }

      root.dataset.s3dReady = "true";

      const heroP = Math.min(1, Math.max(0, smoothY / 540));
      root.style.setProperty("--hero-scroll", heroP.toFixed(4));
      root.style.setProperty("--hero-p", heroP.toFixed(4));
      root.style.setProperty("--hero-vel", smoothVel.toFixed(4));

      // Inertia delta compensates native jump so components glide with physical 3D momentum
      const lagOffset = (rawY - smoothY) * 0.34;
      const focalY = vh * 0.48;
      const rangeY = vh * 0.58;

      // 1. Platform compatibility strip 5-badge 3D helical wave
      const badges = document.querySelectorAll<HTMLElement>(PLATFORM_BADGE_SELECTOR);
      badges.forEach((badge, idx) => {
        const rect = badge.getBoundingClientRect();
        if (rect.top > vh * 1.35 || rect.bottom < -vh * 0.35) return;
        const centerY = rect.top + rect.height * 0.5 + lagOffset;
        const baseT = Math.max(-1.3, Math.min(1.3, (centerY - focalY) / (vh * 0.52)));
        const slot = idx - (badges.length - 1) / 2; // -2 .. +2
        const waveT = Math.max(-1.3, Math.min(1.3, baseT + slot * 0.14));
        const absWave = Math.abs(waveT);

        const rx = waveT * 36 + smoothVel * 11;
        const ry = slot * 14 * Math.min(1, absWave * 1.2) - waveT * 16;
        const rz = slot * waveT * 2.6;
        const tx = slot * waveT * (isMobile ? 9 : 18);
        const ty = waveT * 28 + lagOffset * 0.5;
        const tz = (1 - Math.min(1, absWave)) * 34 - absWave * 48;

        badge.dataset.s3dBadge = "true";
        badge.style.setProperty("--s3d-tx", `${tx.toFixed(1)}px`);
        badge.style.setProperty("--s3d-ty", `${ty.toFixed(1)}px`);
        badge.style.setProperty("--s3d-tz", `${tz.toFixed(1)}px`);
        badge.style.setProperty("--s3d-rx", `${rx.toFixed(2)}deg`);
        badge.style.setProperty("--s3d-ry", `${ry.toFixed(2)}deg`);
        badge.style.setProperty("--s3d-rz", `${rz.toFixed(2)}deg`);
      });

      // 2. Page-wide 3D perspective orbit for all cards, headings, steps & sections
      const targets = document.querySelectorAll<HTMLElement>(SCROLL_3D_SELECTOR);
      targets.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        if (rect.top > vh * 1.45 || rect.bottom < -vh * 0.45) return;

        const isStickyIntro =
          isDesktopSticky &&
          el.classList.contains("how-intro") &&
          Boolean(el.closest(".pinned-story"));

        const centerY = rect.top + rect.height * 0.5 + lagOffset;
        const rawT = (centerY - focalY) / rangeY;
        const clampedT = Math.max(-1.25, Math.min(1.25, rawT));
        const absT = Math.abs(clampedT);
        // Continuous non-zero curve: gentle through eye-level, bold 3D sweep toward top/bottom
        const shaped = clampedT * (0.68 + 0.32 * absT);

        // Determine lateral 3D wing (-1 left .. +1 right)
        const wideBlock = rect.width >= vw * 0.72;
        let side: number;
        if (!wideBlock) {
          const centerX = rect.left + rect.width * 0.5;
          side = Math.max(-1, Math.min(1, ((centerX / vw) - 0.5) * 2.3));
        } else if (
          el.classList.contains("section-heading") ||
          el.classList.contains("page-intro") ||
          el.classList.contains("detail-title")
        ) {
          side = -0.45;
        } else if (
          el.classList.contains("final-cta") ||
          el.classList.contains("optional-shelf") ||
          el.classList.contains("about-note")
        ) {
          side = 0;
        } else {
          // Single-column mobile cards alternate left/right 3D wing sweep!
          side = idx % 2 === 0 ? -0.78 : 0.78;
        }

        let rx: number;
        let ry: number;
        let rz: number;
        let tx: number;
        let ty: number;
        let tz: number;
        let scale: number;

        if (isStickyIntro) {
          // Preserve sticky pin position while tilting in 3D with scroll velocity & depth
          rx = clampedT * 12 + smoothVel * 7;
          ry = 10 * Math.max(-1, Math.min(1, clampedT)) - smoothVel * 4;
          rz = 0;
          tx = 0;
          ty = 0;
          tz = -absT * 30;
          scale = 1;
        } else {
          rx = shaped * 27 + smoothVel * 8.5;
          ry = -side * shaped * 21;
          rz = side * shaped * 2.8 + side * smoothVel * 1.2;
          tx = side * absT * (isMobile ? 20 : 40);
          ty = shaped * (isMobile ? 36 : 52) + lagOffset;
          tz = -absT * (isMobile ? 92 : 140);
          scale = Math.max(0.88, 1 - absT * 0.068);
        }

        el.dataset.s3d = "true";
        el.style.setProperty("--s3d-tx", `${tx.toFixed(1)}px`);
        el.style.setProperty("--s3d-ty", `${ty.toFixed(1)}px`);
        el.style.setProperty("--s3d-tz", `${tz.toFixed(1)}px`);
        el.style.setProperty("--s3d-rx", `${rx.toFixed(2)}deg`);
        el.style.setProperty("--s3d-ry", `${ry.toFixed(2)}deg`);
        el.style.setProperty("--s3d-rz", `${rz.toFixed(2)}deg`);
        el.style.setProperty("--s3d-scale", scale.toFixed(3));
        el.style.setProperty("--s3d-t", clampedT.toFixed(3));
        el.style.setProperty("--s3d-abs", absT.toFixed(3));
      });

      // Continue spring-damping frames until settled, then sleep at 0% CPU
      if (Math.abs(rawY - smoothY) > 0.2 || Math.abs(smoothVel) > 0.0035) {
        raf = requestAnimationFrame(stepFrame);
      }
    };

    const scheduleFrame = () => {
      if (!raf) raf = requestAnimationFrame(stepFrame);
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
      const tiltX = ((0.5 - ny) * 8.5).toFixed(2);
      const tiltY = ((nx - 0.5) * 10.5).toFixed(2);
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

    stepFrame();
    window.addEventListener("scroll", scheduleFrame, { passive: true });
    window.addEventListener("resize", scheduleFrame, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", onPointerLeave);

    // Observe dynamic DOM updates (e.g. Library search/filter changes)
    const mainEl = document.getElementById("main-content");
    let mo: MutationObserver | undefined;
    if (mainEl && typeof MutationObserver !== "undefined") {
      mo = new MutationObserver(() => scheduleFrame());
      mo.observe(mainEl, { childList: true, subtree: true });
    }

    const unsubPause = subscribeMotionPaused(() => {
      if (!canAnimate()) {
        clearCard(activeCard);
        activeCard = null;
        resetAllScrollTransforms();
      } else {
        scheduleFrame();
      }
    });

    const onMotionChange = () => scheduleFrame();
    motionMedia.addEventListener("change", onMotionChange);

    // Watch projector-mode class toggles on <html>
    let rootObserver: MutationObserver | undefined;
    if (typeof MutationObserver !== "undefined") {
      rootObserver = new MutationObserver(() => scheduleFrame());
      rootObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    return () => {
      if (raf) cancelAnimationFrame(raf);
      mo?.disconnect();
      rootObserver?.disconnect();
      clearCard(activeCard);
      resetAllScrollTransforms();
      unsubPause();
      motionMedia.removeEventListener("change", onMotionChange);
      window.removeEventListener("scroll", scheduleFrame);
      window.removeEventListener("resize", scheduleFrame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", onPointerLeave);
    };
  }, [pathname]);

  return <div className="scroll-progress-bar" aria-hidden="true" />;
}
