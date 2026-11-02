// EX07 — Premium document card. Zero animation libraries: 5 CSS layers, @property spotlight, pointer tilt via
// custom properties (rAF-batched, one write per frame), View Transition name for the card→detail morph.
// Compare with data-tilt="motion" to see the Motion-driven version of the identical card.
import { chrome, prefs, cssReveal } from "../_shared/lab.js";

const DOCS = [
  { title: "Memory, Attention and the Design of Distraction", subject: "Psychology", course: "Class 12 · Term 2", type: "Presentation", pages: 24, host: "docs.google.com", accent: "#a5aaff" },
  { title: "Linear Algebra — Eigenvalues, worked examples", subject: "Mathematics", course: "Semester 3", type: "Worksheet", pages: 12, host: "dropbox.com", accent: "#91d8bd" },
  { title: "Constitutional Amendments — case notes", subject: "Political Science", course: "Semester 1", type: "Notes", pages: 40, host: "drive.google.com", accent: "#e2c58c" },
];
export async function boot(root = document.body, { tilt = "css" } = {}) {
  root.innerHTML = `<h1>Premium document card</h1>
    <p class=note>Same card, two tilt engines — press <kbd>M</kbd> to switch. Both animate only <code>transform</code>,
    <code>opacity</code> and custom properties; the layout never re-flows. Focus a card with <kbd>Tab</kbd>.</p>
    <div class=grid role=list data-engine=${tilt}>${DOCS.map(card).join("")}</div>`;
  const bar = chrome({});
  cssReveal(root);
  const api = { engine: tilt, destroy() {} };
  const grid = root.querySelector(".grid");

  const register = window.CSS?.registerProperty?.bind(window.CSS);
  if (register) {
    [["--mx", "50%"], ["--my", "50%"], ["--rx", "0deg"], ["--ry", "0deg"], ["--glare", "0"]].forEach(([n, i]) => {
      try { register({ name: n, syntax: "<percentage>", initialValue: i, inherits: false }); } catch { /* Safari<16.4 ignores */ }
    });
  }
  let raf = 0, pending = new Map();
  const write = (el, props) => { pending.set(el, { ...pending.get(el), ...props }); if (!raf) raf = requestAnimationFrame(flush); };
  const flush = () => { raf = 0; for (const [el, p] of pending) { for (const k in p) el.style.setProperty(k, p[k]); } pending.clear(); };
  const fine = matchMedia("(hover:hover) and (pointer:fine)").matches;

  if (tilt === "css") {
    for (const card of grid.querySelectorAll(".doc-card")) {
      const onEnter = () => { if (!fine || prefs.reduced) return; card.style.setProperty("--lift", "1"); };
      const onMove = e => {
        if (!fine || prefs.reduced) return;
        const r = card.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
        write(card, { "--mx": `${nx * 100}%`, "--my": `${ny * 100}%`,
          "--rx": `${(0.5 - ny) * 7}deg`, "--ry": `${(nx - 0.5) * 9}deg`, "--glare": "0.75" });
      };
      const onLeave = () => write(card, { "--rx": "0deg", "--ry": "0deg", "--glare": "0", "--lift": "0" });
      card.addEventListener("pointerenter", onEnter); card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", onLeave); card.addEventListener("focus", onEnter); card.addEventListener("blur", onLeave);
      api.destroy = () => { card.removeEventListener("pointerenter", onEnter); card.removeEventListener("pointermove", onMove);
        card.removeEventListener("pointerleave", onLeave); card.removeEventListener("focus", onEnter); card.removeEventListener("blur", onLeave); };
    }
  } else {
    const { animate } = await import("motion");
    for (const card of grid.querySelectorAll(".doc-card")) {
      const rotX = animate(0, 0, { duration: 0 }); const rotY = animate(0, 0, { duration: 0 });
      const onMove = e => {
        if (!fine || prefs.reduced) return;
        const r = card.getBoundingClientRect();
        rotX.speed = 1; rotY.speed = 1;
        animate(card, { rotateX: (0.5 - (e.clientY - r.top) / r.height) * 7, rotateY: ((e.clientX - r.left) / r.width - 0.5) * 9,
          scale: 1.012 }, { duration: 0.28, ease: [0.22, 1, 0.36, 1] });
        card.style.setProperty("--mx", `${((e.clientX - r.left) / r.width) * 100}%`);
        card.style.setProperty("--my", `${((e.clientY - r.top) / r.height) * 100}%`);
      };
      const onLeave = () => animate(card, { rotateX: 0, rotateY: 0, scale: 1 }, { duration: 0.5, ease: [0.22, 1, 0.36, 1] });
      card.addEventListener("pointermove", onMove); card.addEventListener("pointerleave", onLeave);
      rotX.stop(); rotY.stop();
    }
  }
  addEventListener("keydown", e => { if (e.key.toLowerCase() === "m") location.search = `?tilt=${tilt === "css" ? "motion" : "css"}`; });
  return api;
}
function card(d, i) {
  return `<article class=doc-card role=listitem data-reveal tabindex=0 style="--accent:${d.accent};view-transition-name:doc-${i}">
    <span class="layer surface"></span><span class="layer hairline"></span><span class="layer ambient"></span>
    <span class="layer spotlight" aria-hidden=true></span>
    <div class=content>
      <div class=cover aria-hidden=true>
        <span class=cover-type>${d.type}</span>
        <span class=cover-stack><i></i><i></i><i></i></span>
        <span class=cover-pages>${d.pages} pages</span>
      </div>
      <p class=subj>${d.subject} · ${d.course}</p>
      <h3>${d.title}</h3>
      <div class=foot><span class=host>${d.host}</span><a class=open href=#detail>Open <svg width=13 height=13 viewBox="0 0 24 24" aria-hidden=true><path d="M7 17 17 7M9 7h8v8" stroke=currentColor stroke-width=2.4 fill=none stroke-linecap=round/></svg></a></div>
    </div>
  </article>`;
}
if (typeof window !== "undefined" && !window.__AK_TEST__) boot(document.body, { tilt: new URLSearchParams(location.search).get("tilt") || "css" });
