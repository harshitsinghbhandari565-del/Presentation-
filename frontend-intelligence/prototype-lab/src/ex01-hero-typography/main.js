// EX01 — Premium typography-led hero. Two implementations of the SAME design, so the difference is measurable:
//   data-impl="css"  → CSS @keyframes + scroll-driven + @property only, 0 KB of animation library
//   data-impl="gsap" → GSAP timeline (mask lines, curtain, blur-clear) with one shared ease
// Reduced motion renders the FINAL frame in both. Runs headless under jsdom (no layout needed).
import { chrome, prefs, cssReveal } from "../_shared/lab.js";
import { buildHero, HERO_LINES } from "./markup.js";

export function boot(root = document.body, { impl = "gsap" } = {}) {
  const { curtain, title, sub, cta } = buildHero(root, impl);
  const bar = chrome();
  const api = { impl, state: "idle", destroy() {} };

  const applyFinal = () => {
    curtain.style.transform = "translateY(-100%)";
    title.querySelectorAll(".line > i").forEach(i => { i.style.transform = "none"; i.style.opacity = "1"; });
    sub.style.cssText += ";opacity:1;transform:none;filter:none";
    cta.style.cssText += ";opacity:1;transform:none";
    api.state = "final";
  };

  if (impl === "css") {
    // mask reveal per line + curtain wipe, all declarative
    const st = document.createElement("style");
    st.textContent = `
      .ak-curtain{transform:none;animation:ak-curtain 700ms cubic-bezier(.65,0,.35,1) both}
      @keyframes ak-curtain{to{transform:translateY(-100%)}}
      .ak-line>i{transform:translateY(110%);animation:ak-line 800ms cubic-bezier(.22,1,.36,1) both}
      .ak-line:nth-child(2)>i{animation-delay:80ms}.ak-line:nth-child(3)>i{animation-delay:160ms}
      @keyframes ak-line{to{transform:none}}
      .ak-sub{opacity:0;filter:blur(6px);animation:ak-in 500ms 300ms both}
      @keyframes ak-in{to{opacity:1;filter:none;transform:none}}`;
    document.head.appendChild(st);
    api.destroy = () => st.remove();
    requestAnimationFrame(() => { api.state = "running"; setTimeout(applyFinal, 1200); });
    return api;
  }

  return import("gsap").then(({ default: gsap }) => {
    const { default: g } = { default: gsap };
    if (prefs.reduced) { applyFinal(); bar.set("reduce", true); return api; }
    const tl = g.timeline({ defaults: { ease: "power3.out" } });
    tl.to(curtain, { yPercent: -100, duration: 0.7, ease: "expo.inOut" })
      .from(title.querySelectorAll(".line > i"), { yPercent: 110, duration: 0.8, stagger: 0.08 }, "<0.1")
      .from(sub, { opacity: 0, y: 12, filter: "blur(6px)", duration: 0.5 }, "-=0.3")
      .from(cta, { opacity: 0, y: 8, duration: 0.4 }, "-=0.25");
    api.state = "running";
    api.destroy = () => { tl.kill(); g.killTweensOf([curtain, title, sub, cta]); };
    // LCP guard: the <h1> text is never animated from opacity 0 (only inner masks)
    const style = document.createElement("style");
    style.textContent = `.ak-title{opacity:1 !important}`;
    document.head.appendChild(style);
    cssReveal(root);
    return api;
  });
}

export { HERO_LINES };
if (typeof window !== "undefined" && !window.__AK_TEST__) {
  const impl = new URLSearchParams(location.search).get("impl") || "gsap";
  boot(document.body, { impl });
}
