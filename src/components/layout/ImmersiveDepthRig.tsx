"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { canRun3DMotion, subscribeMotionPaused, syncForceDataset } from "./motion-state";

const SCROLL_3D_SELECTOR = [
  ".section-heading",
  ".resource-card",
  ".featured-editorial",
  ".subject-preview",
  ".subject-coming",
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
  ".about-spec-card",
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

function resolveZoneLabel(progress: number, pathname: string): string {
  if (pathname !== "/") {
    if (pathname.startsWith("/library")) return "LIBRARY";
    if (pathname.startsWith("/subjects")) return "SUBJECTS";
    if (pathname.startsWith("/resources")) return "RESOURCE";
    if (pathname.startsWith("/about")) return "MANIFESTO";
    return "STUDIO";
  }
  if (progress < 0.13) return "01 • HERO";
  if (progress < 0.38) return "02 • 3D DECK";
  if (progress < 0.54) return "03 • FEATURED";
  if (progress < 0.72) return "04 • 3D SHELF";
  if (progress < 0.88) return "05 • WORKFLOW";
  return "06 • LAUNCH";
}

/**
 * Full-website 60fps spring-damped 3D scroll choreography, cursor halo,
 * magnetic CTA engine, live scroll elevation HUD, and 3D back-to-top orb.
 */
export default function ImmersiveDepthRig() {
  const pathname = usePathname();
  const pctRef = useRef<HTMLSpanElement>(null);
  const zoneRef = useRef<HTMLSpanElement>(null);
  const [showTop, setShowTop] = useState(false);
  const showTopRef = useRef(false);

  useEffect(() => {
    const motionMedia = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const hoverMedia = window.matchMedia("(hover: hover) and (min-width: 768px)");
    let raf = 0;
    let activeCard: HTMLElement | null = null;
    let activeMagnet: HTMLElement | null = null;
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

    const clearMagnet = (btn: HTMLElement | null) => {
      if (!btn) return;
      btn.style.removeProperty("--mag-x");
      btn.style.removeProperty("--mag-y");
      btn.removeAttribute("data-magnetic");
    };

    const resetAllScrollTransforms = () => {
      const root = document.documentElement;
      root.removeAttribute("data-s3d-ready");
      root.removeAttribute("data-s3d-moving");
      root.style.setProperty("--hero-scroll", "0");
      root.style.setProperty("--hero-p", "0");
      root.style.setProperty("--hero-vel", "0");
      root.style.setProperty("--scroll-vel", "0");
      root.style.setProperty("--grid-flow", "0px");

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
        el.style.removeProperty("--s3d-focus");
        el.style.removeProperty("--s3d-glint-x");
        el.style.removeProperty("--s3d-glint-y");
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
      const shouldShowTop = rawY > 440;
      if (shouldShowTop !== showTopRef.current) {
        showTopRef.current = shouldShowTop;
        setShowTop(shouldShowTop);
      }

      const maxScroll = Math.max(1, root.scrollHeight - vh);
      const progress = Math.min(1, Math.max(0, rawY / maxScroll));
      root.style.setProperty("--scroll-progress", progress.toFixed(4));

      if (pctRef.current) {
        pctRef.current.textContent = `${Math.round(progress * 100).toString().padStart(2, "0")}%`;
      }
      if (zoneRef.current) {
        zoneRef.current.textContent = resolveZoneLabel(progress, pathname);
      }

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
      smoothY += diff * 0.19;
      const targetVel = Math.max(-1, Math.min(1, diff / 80));
      smoothVel += (targetVel - smoothVel) * 0.25;
      if (Math.abs(diff) < 0.15 && Math.abs(smoothVel) < 0.003) {
        smoothY = rawY;
        smoothVel = 0;
      }

      root.dataset.s3dReady = "true";

      const heroP = Math.min(1, Math.max(0, smoothY / 520));
      root.style.setProperty("--hero-scroll", heroP.toFixed(4));
      root.style.setProperty("--hero-p", heroP.toFixed(4));
      root.style.setProperty("--hero-vel", smoothVel.toFixed(4));
      root.style.setProperty("--scroll-vel", Math.abs(smoothVel).toFixed(4));
      root.style.setProperty("--grid-flow", `${(smoothY * 0.28) % 64}px`);

      // Drive #how-it-works vertical laser spine fill
      const howSteps = document.querySelector<HTMLElement>(".how-steps");
      if (howSteps) {
        const hsRect = howSteps.getBoundingClientRect();
        const hsProg = Math.min(1, Math.max(0, (vh * 0.68 - hsRect.top) / Math.max(1, hsRect.height * 0.88)));
        howSteps.style.setProperty("--steps-progress", hsProg.toFixed(3));
      }

      const lagOffset = (rawY - smoothY) * 0.36;
      const focalY = vh * 0.48;
      const rangeY = vh * 0.56;

      // 1. Platform compatibility strip 5-badge 3D helical wave
      const badges = document.querySelectorAll<HTMLElement>(PLATFORM_BADGE_SELECTOR);
      badges.forEach((badge, idx) => {
        const rect = badge.getBoundingClientRect();
        if (rect.top > vh * 1.35 || rect.bottom < -vh * 0.35) return;
        const centerY = rect.top + rect.height * 0.5 + lagOffset;
        const baseT = Math.max(-1.3, Math.min(1.3, (centerY - focalY) / (vh * 0.5)));
        const slot = idx - (badges.length - 1) / 2;
        const waveT = Math.max(-1.3, Math.min(1.3, baseT + slot * 0.15));
        const absWave = Math.abs(waveT);

        const rx = waveT * 38 + smoothVel * 12;
        const ry = slot * 16 * Math.min(1, absWave * 1.2) - waveT * 18;
        const rz = slot * waveT * 3.0;
        const tx = slot * waveT * (isMobile ? 10 : 20);
        const ty = waveT * 30 + lagOffset * 0.5;
        const tz = (1 - Math.min(1, absWave)) * 38 - absWave * 52;

        badge.dataset.s3dBadge = "true";
        badge.style.setProperty("--s3d-tx", `${tx.toFixed(1)}px`);
        badge.style.setProperty("--s3d-ty", `${ty.toFixed(1)}px`);
        badge.style.setProperty("--s3d-tz", `${tz.toFixed(1)}px`);
        badge.style.setProperty("--s3d-rx", `${rx.toFixed(2)}deg`);
        badge.style.setProperty("--s3d-ry", `${ry.toFixed(2)}deg`);
        badge.style.setProperty("--s3d-rz", `${rz.toFixed(2)}deg`);
      });

      // 2. Page-wide 3D perspective orbit + multi-column wave stagger + mobile specular glint
      const targets = document.querySelectorAll<HTMLElement>(SCROLL_3D_SELECTOR);
      targets.forEach((el, idx) => {
        const rect = el.getBoundingClientRect();
        if (rect.top > vh * 1.48 || rect.bottom < -vh * 0.48) return;

        const isStickyIntro =
          isDesktopSticky &&
          el.classList.contains("how-intro") &&
          Boolean(el.closest(".pinned-story"));

        const wideBlock = rect.width >= vw * 0.72;
        const normX = (rect.left + rect.width * 0.5) / vw;
        const colStagger = wideBlock ? 0 : (normX - 0.5) * 0.18;

        const centerY = rect.top + rect.height * 0.5 + lagOffset;
        const rawT = (centerY - focalY) / rangeY + colStagger;
        const clampedT = Math.max(-1.25, Math.min(1.25, rawT));
        const absT = Math.abs(clampedT);
        const shaped = clampedT * (0.7 + 0.3 * absT);
        const focus = Math.max(0, 1 - absT * 1.65);

        let side: number;
        if (!wideBlock) {
          side = Math.max(-1, Math.min(1, (normX - 0.5) * 2.35));
        } else if (
          el.classList.contains("section-heading") ||
          el.classList.contains("page-intro") ||
          el.classList.contains("detail-title")
        ) {
          side = -0.48;
        } else if (
          el.classList.contains("final-cta") ||
          el.classList.contains("optional-shelf") ||
          el.classList.contains("about-note")
        ) {
          side = 0;
        } else {
          side = idx % 2 === 0 ? -0.82 : 0.82;
        }

        let rx: number;
        let ry: number;
        let rz: number;
        let tx: number;
        let ty: number;
        let tz: number;
        let scale: number;

        if (isStickyIntro) {
          rx = clampedT * 13 + smoothVel * 7.5;
          ry = 11 * Math.max(-1, Math.min(1, clampedT)) - smoothVel * 4.5;
          rz = 0;
          tx = 0;
          ty = 0;
          tz = -absT * 32;
          scale = 1;
        } else {
          rx = shaped * 29 + smoothVel * 9.5;
          ry = -side * shaped * 23;
          rz = side * shaped * 3.1 + side * smoothVel * 1.35;
          tx = side * absT * (isMobile ? 22 : 44);
          ty = shaped * (isMobile ? 40 : 56) + lagOffset;
          tz = -absT * (isMobile ? 98 : 152);
          scale = Math.max(0.88, 1 - absT * 0.072);
        }

        const glintX = 50 - side * clampedT * 36;
        const glintY = 42 - clampedT * 44;

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
        el.style.setProperty("--s3d-focus", focus.toFixed(3));
        el.style.setProperty("--s3d-glint-x", `${glintX.toFixed(1)}%`);
        el.style.setProperty("--s3d-glint-y", `${glintY.toFixed(1)}%`);
      });

      if (Math.abs(rawY - smoothY) > 0.2 || Math.abs(smoothVel) > 0.0035) {
        root.dataset.s3dMoving = "true";
        raf = requestAnimationFrame(stepFrame);
      } else {
        delete root.dataset.s3dMoving;
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
        if (activeMagnet) {
          clearMagnet(activeMagnet);
          activeMagnet = null;
        }
        return;
      }

      // Smooth viewport-wide ambient cursor spotlight coordinates
      const root = document.documentElement;
      root.style.setProperty("--cursor-x", `${event.clientX.toFixed(0)}px`);
      root.style.setProperty("--cursor-y", `${event.clientY.toFixed(0)}px`);

      // Magnetic 3D pull on buttons
      const magnet = (event.target as Element | null)?.closest<HTMLElement>(
        ".button-primary, .button-secondary",
      );
      if (magnet !== activeMagnet) {
        clearMagnet(activeMagnet);
        activeMagnet = magnet ?? null;
      }
      if (activeMagnet) {
        const mRect = activeMagnet.getBoundingClientRect();
        if (mRect.width > 0 && mRect.height > 0) {
          const mx = ((event.clientX - mRect.left) / mRect.width - 0.5) * 10;
          const my = ((event.clientY - mRect.top) / mRect.height - 0.5) * 7;
          activeMagnet.dataset.magnetic = "true";
          activeMagnet.style.setProperty("--mag-x", `${mx.toFixed(1)}px`);
          activeMagnet.style.setProperty("--mag-y", `${my.toFixed(1)}px`);
        }
      }

      // 3D card tilt + cursor spotlight
      const target = (event.target as Element | null)?.closest<HTMLElement>(
        ".resource-card, .subject-preview, .subject-card, .how-step, .featured-editorial, .about-spec-card, .about-principle-card",
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
      const tiltX = ((0.5 - ny) * 9.5).toFixed(2);
      const tiltY = ((nx - 0.5) * 11.5).toFixed(2);
      activeCard.dataset.tilting = "true";
      activeCard.style.setProperty("--spot-x", `${(nx * 100).toFixed(1)}%`);
      activeCard.style.setProperty("--spot-y", `${(ny * 100).toFixed(1)}%`);
      activeCard.style.setProperty("--tilt-x", `${tiltX}deg`);
      activeCard.style.setProperty("--tilt-y", `${tiltY}deg`);
    };

    const onPointerLeave = () => {
      clearCard(activeCard);
      activeCard = null;
      clearMagnet(activeMagnet);
      activeMagnet = null;
    };

    stepFrame();
    window.addEventListener("scroll", scheduleFrame, { passive: true });
    window.addEventListener("resize", scheduleFrame, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", onPointerLeave);

    const mainEl = document.getElementById("main-content");
    let mo: MutationObserver | undefined;
    if (mainEl && typeof MutationObserver !== "undefined") {
      mo = new MutationObserver(() => scheduleFrame());
      mo.observe(mainEl, { childList: true, subtree: true });
    }

    const unsubPause = subscribeMotionPaused(() => {
      if (!canAnimate()) {
        onPointerLeave();
        resetAllScrollTransforms();
      } else {
        scheduleFrame();
      }
    });

    const onMotionChange = () => scheduleFrame();
    motionMedia.addEventListener("change", onMotionChange);

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
      onPointerLeave();
      resetAllScrollTransforms();
      unsubPause();
      motionMedia.removeEventListener("change", onMotionChange);
      window.removeEventListener("scroll", scheduleFrame);
      window.removeEventListener("resize", scheduleFrame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", onPointerLeave);
    };
  }, [pathname]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: canRun3DMotion() ? "smooth" : "auto",
    });
  };

  return (
    <>
      <div className="scroll-progress-bar" aria-hidden="true" />
      <div className="scroll-elevation-hud" aria-hidden="true">
        <span className="scroll-elevation-label" ref={zoneRef}>01 • HERO</span>
        <div className="scroll-elevation-track">
          <div className="scroll-elevation-fill" />
          <div className="scroll-elevation-pip" />
        </div>
        <span className="scroll-elevation-pct" ref={pctRef}>00%</span>
      </div>
      <button
        type="button"
        className={`scroll-top-orb ${showTop ? "visible" : ""}`}
        aria-label="Scroll back to top"
        aria-hidden={!showTop || undefined}
        tabIndex={showTop ? 0 : -1}
        onClick={scrollToTop}
      >
        <svg className="scroll-top-ring" viewBox="0 0 44 44" aria-hidden="true">
          <circle className="scroll-top-ring-bg" cx="22" cy="22" r="19" />
          <circle className="scroll-top-ring-fg" cx="22" cy="22" r="19" />
        </svg>
        <ArrowUp size={16} aria-hidden="true" />
      </button>
    </>
  );
}
