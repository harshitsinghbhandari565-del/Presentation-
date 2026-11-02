// EX10 — Mobile-first variant of EX04 + EX07: the pinned chapter becomes a snap-scroll carousel, the card grid
// becomes a thumb-reachable list with a filter sheet. Same content, same DOM order — different physics.
import { chrome, prefs } from "../_shared/lab.js";
const PANELS = [["Find it once","Filters in the URL."],["Open where it lives","Slides, Docs, Drive, Dropbox."],["Send one address","One canonical link + backups."],["Project it","Back-row legibility."]];
export function boot(root = document.body) {
  root.innerHTML = `<div class=device><div class=screen>
    <header class=mh><strong>Hub</strong><button class=sheet-open data-sheet aria-expanded=false>Filters <b>2</b></button></header>
    <main>
      <section class=carousel aria-label="How it works" tabindex=0>
        ${PANELS.map(([t,b],i)=>`<article class=slide><span class=no>${String(i+1).padStart(2,"0")}</span><h3>${t}</h3><p>${b}</p></article>`).join("")}
      </section>
      <section class=list>${[0,1,2].map(i=>`<a class=mcard href=#><span class=strip></span><span class=txt><b>${["Memory and attention","Eigenvalues, worked","Amendment notes"][i]}</b><small>${["Psychology · 24 pages","Mathematics · 12 pages","Pol. Science · 40 pages"][i]}</small></span><span class=chev>›</span></a>`).join("")}</section>
    </main>
    <div class="backdrop" hidden></div>
    <div class=sheet role=dialog aria-modal=true aria-label="Filters" hidden>
      <div class=grip></div><h2>Filters</h2>
      ${["Subject","Course","Semester","Type"].map(k=>`<fieldset><legend>${k}</legend><div class=opts><button aria-pressed=true>All</button><button>Option A</button><button>Option B</button></div></fieldset>`).join("")}
      <div class=actions><button data-close>Close</button><button class=primary data-close>Show 128 results</button></div>
    </div>
  </div></div>
  <p class=note>44 px targets, 8 px gaps, safe-area padding, snap carousel instead of a pin, sheet instead of a sidebar,
  and every control works with the keyboard. Reduced motion removes the sheet slide, never the sheet.</p>`;
  chrome();
  const sheet = root.querySelector(".sheet"), backdrop = root.querySelector(".backdrop"), open = root.querySelector("[data-sheet]");
  const api = { open: false, destroy() {} };
  const set = v => {
    api.open = v; sheet.hidden = !v; backdrop.hidden = !v; open.setAttribute("aria-expanded", String(v));
    if (v) { sheet.querySelector("button").focus(); document.body.dataset.lock = "1"; }
    else { open.focus(); delete document.body.dataset.lock; }
  };
  root.addEventListener("click", e => { if (e.target.closest("[data-sheet]")) set(true); if (e.target.closest("[data-close]") || e.target === backdrop) set(false);
    if (e.target.matches(".opts button")) { [...e.target.parentElement.children].forEach(b => b.setAttribute("aria-pressed", "false")); e.target.setAttribute("aria-pressed", "true"); } });
  addEventListener("keydown", e => { if (e.key === "Escape" && api.open) set(false); });
  return api;
}
if (typeof window !== "undefined" && !window.__AK_TEST__) boot();
