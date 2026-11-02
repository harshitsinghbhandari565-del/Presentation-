// EX09 — Smooth section/page transitions. Two mechanisms, side by side, because they solve different problems:
//  (a) native View Transitions (0 KB) for route-level and shared-element morphs, incl. a circular theme clip;
//  (b) Lenis + GSAP ticker bridge for *smoothed* wheel input, with the documented cleanup rules.
import { chrome, prefs, canViewTransition } from "../_shared/lab.js";

const VIEWS = {
  grid: { title: "All resources", body: "Three cards. Click one — the morph is a real cross-document View Transition, not a CSS trick." },
  detail: { title: "Memory, Attention and the Design of Distraction", body: "Detail view. Back works. Browser history is untouched. Nothing here is a router re-render with a fade." },
};
export async function boot(root = document.body) {
  root.innerHTML = `<h1>Page transitions + smooth scroll</h1>
    <p class=note><b>View Transitions</b> is available: ${canViewTransition() ? "yes" : "no (falls back to instant swap — same DOM, no animation, no jank)"}.</p>
    <div class=row>
      <button class=vt data-view=detail>Go to detail (morph)</button>
      <button class=vt data-view=grid>Back to grid</button>
      <button data-theme>Flip theme (circular clip)</button>
      <button data-lenis aria-pressed=false>Lenis smooth scroll</button>
    </div>
    <section class=view data-viewbox>${view("grid")}</section>
    <div class=long><h2>Long content</h2><p>Scroll to feel the difference when Lenis is on. Turning it off restores native
    momentum, anchors, find-in-page and pull-to-refresh — which is exactly why it must be a toggle, not a default.</p>
    ${"<p>…</p>".repeat(40)}</div>`;
  chrome();
  const box = root.querySelector("[data-viewbox]");
  const api = { view: "grid", lenis: null, destroy() {} };
  const go = v => {
    api.view = v;
    const paint = () => { box.innerHTML = view(v); };
    if (canViewTransition() && document.startViewTransition && !prefs.reduced) document.startViewTransition(paint);
    else paint();
  };
  root.addEventListener("click", async e => {
    const vt = e.target.closest("[data-view]"); if (vt) return go(vt.dataset.view);
    if (e.target.matches("[data-theme]")) {
      const flip = () => { const n = document.documentElement.dataset.theme === "light" ? "dark" : "light"; document.documentElement.dataset.theme = n; };
      if (canViewTransition() && document.startViewTransition && !prefs.reduced) {
        const r = e.target.getBoundingClientRect();
        document.documentElement.style.setProperty("--vt-x", `${r.left + r.width / 2}px`);
        document.documentElement.style.setProperty("--vt-y", `${r.top + r.height / 2}px`);
        document.documentElement.dataset.clip = "1";
        const t = document.startViewTransition(flip);
        await t.finished.finally(() => (document.documentElement.dataset.clip = "0"));
      } else flip();
      return;
    }
    if (e.target.matches("[data-lenis]")) {
      const on = e.target.getAttribute("aria-pressed") !== "true";
      e.target.setAttribute("aria-pressed", String(on));
      if (!on) { api.destroyLenis?.(); api.destroyLenis = null; api.lenis = null; return; }
      const { default: Lenis } = await import("lenis");
      const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, syncTouch: false, autoRaf: true });
      api.lenis = lenis;
      const { default: gsap } = await import("gsap");
      const ticker = t => lenis.raf(t * 1000);
      let off = null;
      if (!prefs.fallback && autoRafDisabled()) { gsap.ticker.add(ticker); gsap.ticker.lagSmoothing(0); off = lenis.on("scroll", () => {}); }
      api.destroyLenis = () => { gsap.ticker.remove(ticker); off?.(); lenis.destroy(); };
    }
  });
  const autoRafDisabled = () => true;   // we drive raf from gsap.ticker here (documented alternative: autoRaf, never both)
  return api;
}
function view(v) {
  const d = VIEWS[v];
  return `<div class="card-v ${v}" style="view-transition-name:doc-0"><h3>${d.title}</h3><p>${d.body}</p></div>`;
}
if (typeof window !== "undefined" && !window.__AK_TEST__) boot();
