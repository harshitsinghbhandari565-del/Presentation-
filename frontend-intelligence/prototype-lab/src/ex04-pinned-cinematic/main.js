// EX04 — Cinematic pinned scroll (the reference implementation of a "chapter").
// Desktop: ScrollTrigger pin + scrub across 4 panels. Mobile / reduced-motion / narrow: the SAME content
// becomes a stacked, native-scroll reading list. Demonstrates the degrade path, not just the wow path.
import { chrome, prefs } from "../_shared/lab.js";

const PANELS = [
  ["Find it once", "Subjects, courses, semesters and topics as filters that live in the URL — so the link you paste in the group chat is the filter you used."],
  ["Open where it lives", "Google Slides, Docs, Drive and Dropbox keep the file. We keep the metadata, the preview and the backup links."],
  ["Send one address", "Every document has one canonical address, with fallbacks a student can actually use when the embed is blocked."],
  ["Project it", "Projector mode re-types the page for the back row — bigger type, harder borders, no ambient motion."],
];

export async function boot(root = document.body) {
  root.innerHTML = `<h1>Cinematic pinned chapter</h1>
    <p class=note>Desktop: pinned + scrubbed, index driven by scroll. <b>Resize below 900 px or press R</b> to see the same
    section as a plain stacked list — the content contract is identical, only the choreography changes.</p>
    <section class="chapter" data-chapter>
      <div class="chapter-sticky">
        <div class="chapter-index"><b data-index>01</b><span>/ 04</span></div>
        <h2 class="chapter-title" data-title>${PANELS[0][0]}</h2>
        <div class="chapter-track" data-track>${PANELS.map(([t], i) => `<p class="chapter-line" data-line="${i}">${t}</p>`).join("")}</div>
      </div>
      <div class="chapter-steps">${PANELS.map(([t, b], i) => `<article class="chapter-step" data-step="${i}"><h3>${t}</h3><p>${b}</p></article>`).join("")}</div>
    </section>
    <section class="after-note"><p>Scroll length: ~2.4× viewport. Nothing here blocks reading; the steps stay in the DOM in order.</p></section>`;
  chrome();
  const api = { mode: "stack", destroy() {}, active: 0 };
  const el = root.querySelector("[data-chapter]");
  const idx = el.querySelector("[data-index]");
  const title = el.querySelector("[data-title]");
  const lines = [...el.querySelectorAll("[data-line]")];
  const setActive = i => {
    api.active = i;
    idx.textContent = String(i + 1).padStart(2, "0");
    title.textContent = PANELS[i][0];
    lines.forEach((l, n) => l.dataset.on = String(n === i));
  };

  const usePin = matchMedia("(min-width: 900px)").matches && !prefs.reduced && !prefs.fallback;
  if (!usePin) {
    setActive(0);
    if (typeof IntersectionObserver !== "undefined") {
      const io = new IntersectionObserver(es => { const e = es.filter(x => x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0]; if (e) setActive(+e.target.dataset.step); }, { threshold: [0.35, 0.6] });
      el.querySelectorAll("[data-step]").forEach(s => io.observe(s));
      api.destroy = () => io.disconnect();
    }
    return api;
  }

  const { default: gsap } = await import("gsap");
  const { ScrollTrigger } = await import("gsap/ScrollTrigger");
  gsap.registerPlugin(ScrollTrigger);
  const ctx = gsap.context(() => {
    const st = ScrollTrigger.create({
      trigger: el, start: "top top", end: `+=${innerHeight * 1.4}`, pin: ".chapter-sticky", anticipatePin: 1,
      invalidateOnRefresh: true, scrub: 0.6,
      onUpdate: self => setActive(Math.min(PANELS.length - 1, Math.floor(self.progress * PANELS.length))),
    });
    gsap.from(".chapter-step", { opacity: 0.15, y: 22, stagger: 0.12,
      scrollTrigger: { trigger: el, start: "top 60%", end: "bottom 60%", scrub: 0.5 } });
    api.destroy = () => { st.kill(); ctx.revert(); };
  }, el);
  api.mode = "pinned";
  return api;
}
if (typeof window !== "undefined" && !window.__AK_TEST__) boot();
