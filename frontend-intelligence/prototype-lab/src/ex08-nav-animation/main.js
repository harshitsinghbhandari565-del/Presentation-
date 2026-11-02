// EX08 — Animated subject/course navigation. Motion (vanilla) + a measured indicator: the moving pill is
// positioned from getBoundingClientRect deltas (FLIP idea), so it works with any DOM order or wrapping,
// and it is keyboard-driven (roving tabindex + arrows). No list is re-rendered to move an underline.
import { chrome, prefs } from "../_shared/lab.js";

const NAV = [
  { label: "All resources", count: 128, key: "all" },
  { label: "Mathematics", count: 34, key: "math" },
  { label: "Psychology", count: 21, key: "psy" },
  { label: "Political Science", count: 18, key: "pol" },
  { label: "Computer Science", count: 40, key: "cs" },
  { label: "Economics", count: 15, key: "eco" },
];
export async function boot(root = document.body) {
  root.innerHTML = `<h1>Animated navigation</h1>
    <p class=note>Arrow keys move the pill; the pill animates from measured geometry, not from a hardcoded offset —
    so it stays correct when labels wrap, when counts change, and in RTL. Reduced motion = instant jump, still visible.</p>
    <nav class=rail aria-label="Subjects" data-nav>
      <span class=pill aria-hidden=true></span>
      ${NAV.map((n, i) => `<a class=navitem href="#${n.key}" data-i="${i}" ${i ? "tabindex=-1" : "tabindex=0"} role=tab aria-selected=${!i}>
        <span>${n.label}</span><b>${n.count}</b></a>`).join("")}
    </nav>
    <div class=panels>${NAV.map((n, i) => `<p role=tabpanel id=${n.key} ${i ? "hidden" : ""}>${n.label} — ${n.count} curated resources.</p>`).join("")}</div>`;
  chrome();
  const nav = root.querySelector("[data-nav]");
  const items = [...nav.querySelectorAll(".navitem")];
  const pill = nav.querySelector(".pill");
  const api = { index: 0, destroy() {} };
  const { animate } = await import("motion");

  const place = (el, first = false) => {
    const r = el.getBoundingClientRect(), p = nav.getBoundingClientRect();
    const style = { transform: `translate(${r.left - p.left}px, ${r.top - p.top}px)`, width: `${r.width}px`, height: `${r.height}px` };
    if (first || prefs.reduced) Object.assign(pill.style, style);
    else animate(pill, style, { duration: 0.36, ease: [0.22, 1, 0.36, 1] });
    items.forEach((x, i) => { x.setAttribute("tabindex", i === api.index ? "0" : "-1"); x.setAttribute("aria-selected", String(i === api.index)); });
    root.querySelectorAll("[role=tabpanel]").forEach((t, i) => (t.hidden = i !== api.index));
  };
  const select = i => { api.index = i; place(items[i]); };
  nav.addEventListener("click", e => { const a = e.target.closest(".navitem"); if (a) { e.preventDefault(); select(+a.dataset.i); } });
  nav.addEventListener("keydown", e => {
    const k = e.key;
    if (k === "ArrowRight" || k === "ArrowDown") { e.preventDefault(); select((api.index + 1) % items.length); items[api.index].focus(); }
    if (k === "ArrowLeft" || k === "ArrowUp") { e.preventDefault(); select((api.index - 1 + items.length) % items.length); items[api.index].focus(); }
    if (k === "Home") { e.preventDefault(); select(0); items[0].focus(); }
    if (k === "End") { e.preventDefault(); select(items.length - 1); items.at(-1).focus(); }
  });
  place(items[0], true);
  const ro = new ResizeObserver(() => place(items[api.index], true));
  ro.observe(nav); addEventListener("resize", () => place(items[api.index], true));
  api.destroy = () => ro.disconnect();
  return api;
}
if (typeof window !== "undefined" && !window.__AK_TEST__) boot();
