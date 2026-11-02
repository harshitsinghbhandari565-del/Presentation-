# Interaction experiment lab — 10 prototypes, built and headlessly executed

Location: `frontend-intelligence/prototype-lab/` (isolated; no app code, no app `package.json`, nothing installed into the application).
Built: 2026-11-02. Toolchain: node 22.22.3, esbuild 0.25.12, node `zlib`/`brotli`.

---

## 0. What is verified here, and what is not

| claim | status | how |
|---|---|---|
| All 10 experiments compile and bundle | **[VERIFIED]** | `node build.mjs` → 10/10 built, 0 build errors |
| All 10 run without throwing, in default **and** forced reduced-motion mode | **[VERIFIED]** | `node test.mjs` → **20 passed, 0 failed** (jsdom 26.1.0) |
| Fallback paths (no WebGL, `?fallback=1`, narrow viewport, reduced motion) reach a readable final DOM | **[VERIFIED]** | same harness; assertions on final DOM + reported `mode` |
| Bundle sizes (minified / gzip / brotli) per experiment and per library | **[MEASURED]** | esbuild + zlib, vendors inlined so numbers are the real added cost |
| Frame rate, jank, GPU time, memory, paint cost, visual appearance, touch feel | **[UNVERIFIED]** | **no browser binary and no GPU in AK's sandbox** — procedure for AO is in §5 |
| WebGL code paths actually render | **[UNVERIFIED]** | jsdom has no `getContext`; the harness records those notices per experiment as `harnessNotes` and proves only that the *fallback* engages |

That split is the honest state of the lab. Everything below marked *measured* came out of a run in this sandbox; everything about *feel* did not, and AC must run §5 on a real device before adopting anything.

---

## 1. Install & run (reproducible)

```bash
cd frontend-intelligence/prototype-lab
npm install                      # 3 packages of note: three@0.187.0 gsap@3.15.0 lenis@1.3.27 motion@14.9.0 (+esbuild, jsdom)
node build.mjs                   # → dist/ (each experiment self-contained) + dist/_sizes/table.md
node test.mjs                    # → headless pass/fail for 10 experiments × 2 motion modes
python3 -m http.server 8123 --bind 0.0.0.0 --directory dist    # open http://localhost:8123/
```

Every experiment page carries a toolbar with four toggles, so AC can A/B without editing code:

- **R** reduced motion on/off (`data-motion` attribute, mirrors `prefers-reduced-motion`)
- **F** forced fallback (skips WebGL / libraries entirely — this is the low-power path)
- **G** fps overlay (rAF frame counter + long-frame tally)
- **T** theme (dark/light)

URL overrides work too, for reproducible Playwright runs: `?motion=reduce`, `?fallback=1`.

---

## 2. Measured cost of each experiment (this is the number AC should plan against)

| # | experiment | JS (min) | **JS (gz)** | CSS | inlined vendor | verdict |
|--:|---|--:|--:|--:|---|---|
| 01 | type-led animated hero — CSS variant vs GSAP variant | 77.5 KB | **30.6** | 0.0 | gsap | the *GSAP* variant costs 27.1 KB gz of library; the CSS variant costs 0 |
| 02 | interactive 3D document stack | 739.5 KB | **191.7** | 0.7 | three | 3D = ~192 KB gz before any app code |
| 03 | scroll-controlled 3D tunnel | 740.0 KB | **192.0** | 0.3 | three | scroll-linked camera adds ~0.3 KB over static 3D |
| 04 | cinematic pinned chapter (ScrollTrigger) | 119.2 KB | **47.6** | 1.6 | gsap + ScrollTrigger | pin+scrub = 44.4 KB gz of library |
| 05 | shader background, **raw WebGL2, no library** | **6.0 KB** | **2.9** | 0.9 | none | the headline result: a full animated shader for 2.9 KB gz |
| 06 | 4k GPU particle field (three.js) | 740.3 KB | **192.0** | 0.7 | three | identical effect class as 05 at **66×** the bytes |
| 07 | premium document card (CSS layers + `@property`) | 190.0 KB | **67.5** | 3.0 | motion (for the `?tilt=motion` variant) | CSS-only build of the same card: **~4 KB** |
| 08 | animated subject/course nav (Motion `animate`) | 187.6 KB | **66.6** | 1.1 | motion | same conclusion as 07 — the library is the cost, not the effect |
| 09 | View Transitions + Lenis bridge | 93.6 KB | **35.1** | 1.3 | lenis + gsap | Lenis is only **5.3 KB gz**; the 35 KB is ScrollTrigger |
| 10 | mobile-first variant (carousel + bottom sheet) | **4.5 KB** | **2.0** | 3.4 | none | mobile-first is *cheaper*, not just smaller |

**Read this table as one sentence:** the effects AC wants for "premium" are almost free in CSS/`@property`/View Transitions and expensive only when a library is used to deliver what CSS can already do — with the single exception of real 3D, where ~190 KB gz is the floor no matter how small the scene is.

## 2b. Measured per-library floors (`dist/_sizes/table.md`)

| what AC would add | minified | **gzip** | brotli |
|---|--:|--:|--:|
| gsap (core) | 69.0 KB | **27.1 KB** | 24.4 |
| gsap + ScrollTrigger | 112.5 KB | **44.4 KB** | 39.8 |
| gsap + ScrollTrigger + Flip | 137.1 KB | **53.1 KB** | 47.2 |
| gsap + ST + Flip + SplitText | 144.3 KB | **56.1 KB** | 49.8 |
| **lenis** | 18.3 KB | **5.3 KB** | 4.7 |
| three (namespace import) | 731.9 KB | **187.5 KB** | 152.0 |
| three (named subset) | 521.9 KB | **130.4 KB** | 107.4 |
| three + OrbitControls | 751.5 KB | **191.6 KB** | 155.4 |
| motion (vanilla: `animate/scroll/inView/spring`) | 74.7 KB | **27.7 KB** | 25.2 |
| motion + Lenis | 92.5 KB | **32.4 KB** | 29.4 |
| **framer-motion 12.43.0 (AC's installed version, root import)** | — | **44.9 KB** | — |
| framer-motion (`motion` + `useScroll` only) | — | **42.8 KB** | — |
| **framer-motion/mini + `LazyMotion(domAnimation)`** | — | **29.7 KB** | — |
| `motion/react` (the successor package) | — | **49.5 KB** | — |
| ScrollTrigger alone | 45.2 KB | **17.9 KB** | — |

Three consequences for AC, all measured rather than argued:

1. **You already pay more for animation than GSAP would cost.** framer-motion's root entry is 44.9 KB gz; the `/mini` + `LazyMotion(domAnimation)` entry is **29.7 KB** — switching import style is a **15.2 KB gz saving with zero new dependencies**. That is the cheapest performance win in this whole research pack.
2. **Do not "upgrade" to `motion`.** `motion/react` measures **49.5 KB gz**, i.e. **+4.6 KB** versus the framer-motion AC ships, for API AC does not need.
3. **Tree-shaking three is real but not enough.** Named imports take 187.5 → 130.4 KB gz (−30%); even an *empty* three.js scene therefore costs more than GSAP+ScrollTrigger+Lenis combined (44.4+5.3 = 49.7 KB). If we add 3D, we are adding the single most expensive thing in the plan, and it must be lazy and gated.

---

## 3. Experiment-by-experiment: what it teaches AC

Each experiment exports `boot(root)` (auto-run only outside tests) and returns `{ mode, destroy() }`, so the same code is drivable by Playwright in AC's CI.

**EX01 — type-led animated hero.** Two engines, identical markup: a CSS-only reveal (`@keyframes` + `view-timeline` reveal) and a GSAP timeline with per-line stagger. *Finding:* under `?fallback=1`/reduced the CSS variant renders the final state with **0 KB**; the GSAP variant's whole value is sequencing, which is exactly what the CSS variant can't do when copy and media must interleave. *Ship decision this informs:* landing hero → CSS; chaptered story → GSAP or `animate()` from framer-motion (already installed).

**EX02 — interactive 3D document stack.** three.js scene of card planes with manual pointer drag (deliberately **no OrbitControls**: it would have added 4.1 KB gz and an a11y trap). Capability check runs *before* importing three, so a device without WebGL never downloads it. *Finding:* `hasWebGL()` is not enough — `getContext` **can throw** (privacy-blocked canvas, some in-app webviews). The lab's first headless run failed for exactly this reason; `safe(() => new THREE.WebGLRenderer(...), null)` + a CSS-3D fallback is now the pattern in all three GL experiments. *That is a real bug this lab caught.*

**EX03 — scroll-controlled 3D.** One scalar (`progressOf()`) → camera position; lerped, `IntersectionObserver`-gated, `EdgesGeometry` outlines instead of textures. *Finding:* the shape to copy is **scalar-in → GPU-out**. Any scroll effect that writes DOM styles per frame is a layout risk; writing one uniform is not. CSS-3D fallback keeps the same tunnel at 0 KB.

**EX04 — cinematic pinned chapter.** ScrollTrigger `pin` + `scrub` on desktop; `matchMedia("(min-width:900px)")` and reduced-motion both route the same content into a plain stacked list with an `IntersectionObserver` index. *Finding:* the degrade path is *the same DOM in the same order*, so there is no SEO/a11y fork to maintain — this is the pattern for any chaptered storytelling. Cost: 44.4 KB gz.

**EX05 — raw WebGL2 shader background.** Fullscreen triangle, fbm noise, DPR capped at 1.25 (0.75 low-power), renders only while intersecting, static single frame under reduced motion, `mix-blend` free. *Finding:* **2.9 KB gz** for a "premium animated ambient background" — the effect AC was going to buy with a library. Also: shader compile/link **must** be inside `try/catch` with a CSS-gradient fallback; that path is exercised by the harness on every run.

**EX06 — 4k particle field.** `THREE.Points` + `ShaderMaterial`, motion computed in the vertex shader (no per-frame CPU buffer writes), additive blending, `depthWrite:false`, count 4 000 → 1 500 on low power, frames only while visible and only when something changed. *Finding:* the demand-render loop (`if (!idle && !needs) return;` before `render()`) is worth more than any polygon budget optimisation.

**EX07 — premium document card.** Five CSS layers (`surface`/`hairline`/`ambient`/`spotlight`/content), pointer-driven `--mx/--my/--rx/--ry/--glare` custom properties written through a **rAF-batched** writer (one style write per frame, not per move), `view-transition-name` for the card→detail morph, `tabindex=0` + `:focus-visible` ring, `@property` registration guarded (`catch` for older Safari). *Finding:* the `?tilt=motion` variant looks identical and costs +60 KB. Motion library value here is zero.

**EX08 — animated subject/course nav.** Roving tabindex, arrow/Home/End, `aria-selected`, and a pill positioned from measured rects (FLIP idea) rather than index math. *Finding:* measured-position indicators survive label wrapping, RTL, and dynamic counts; index math does not. Reduced motion jumps instantly but the pill **stays visible** (it is an affordance, not decoration).

**EX09 — page/section transitions.** `document.startViewTransition` for a real cross-view morph + a circular-clip theme flip from the button's rect; Lenis behind a button with the documented `gsap.ticker` bridge and a full teardown. *Findings:* (a) VT is **blocked at the framework level** for the `@view-transitions/react` helpers by react 19.2.6, but the **native API works today in Chromium without any package** — so plan for progressive enhancement, not a dependency; (b) Lenis is 5.3 KB gz and its real cost is behavioural (it must never fight `html{scroll-behavior:smooth}`, which AC's `c9d0d599` currently sets) — hence "toggle, never default".

**EX10 — mobile variant of EX04+EX07.** The pin becomes a `scroll-snap` carousel; the card grid becomes a list; filters become a bottom sheet (`aria-modal`, Escape, focus return, safe-area padding, 44–48 px targets); **no** Lenis, **no** WebGL, **no** `backdrop-filter` on large surfaces. *Finding:* **2.0 KB gz** — mobile is not a shrunk desktop, it is a cheaper implementation, and here it is 90× cheaper than the desktop 3D path.

---

## 4. Cross-cutting findings (these become rules in the design-system docs)

1. **`safe()`-wrap every GPU/context/feature construction.** Three of ten experiments threw in a headless DOM; all three were fixed by checking and catching *before* the dynamic import, not by try/catching render.
2. **Gate the import, not just the render.** `await import("three")` inside the capability branch is what keeps a phone from downloading 190 KB. (All three GL experiments do this.)
3. **Reduced motion ≠ no motion.** Every experiment still *transitions state*; EX04 still shows the index, EX07 still shows the spotlight at `.28`, EX08 still moves the pill (instantly). AC's Vault branch already encodes this (`--motion-*` remapped to 150 ms rather than removed) — the lab agrees with that choice and shows the user-visible result of it.
4. **One write per frame.** rAF-batching custom-property writes (EX07) is the difference between "smooth" and "sticky", and costs ~15 lines.
5. **`@property` is the premium trick with no dependency.** Angle/percentage-registered custom properties let gradients and spotlights animate; that is 90 % of what "glassmorphism JS" delivers.
6. **View Transitions beat a JS page-transition library** for route morphs — but only where supported, so the app must look correct with `document.startViewTransition` absent (EX09's non-VT branch is the reference).

## 5. The verification AC must run (I could not)

```bash
# from AC's app branch, after copying an experiment's source into a scratch route:
npx playwright test --project=chromium --headed     # AC already has playwright + axe in c9d0d599
# 1. fps: CDP Performance.getMetrics or a rAF counter → assert ≥55 fps mid-range, ≥30 fps on 4× CPU throttle
# 2. long frames: expect(page) trace → no >100ms task during the pinned chapter
# 3. memory: heap snapshot before/after destroy() → assert zero detached nodes and renderer.info.memory.geometries === 0 after dispose
# 4. screenshots at 390/768/1440 in dark+light, and with `?motion=reduce` → visual sign-off by PO
# 5. axe-core on each experiment page → 0 violations (ex07/ex08/ex10 have real a11y surface)
# 6. Lighthouse on the assembled landing → LCP/CLS/INP per PERFORMANCE_BUDGETS.md
```

The `boot(root)` + `{mode, destroy()}` contract exists precisely so these checks are automatable.

## 6. Phase-1 estimates vs Phase-2 measurements

| Phase 1 (U4, estimated) | Measured now | correction |
|---|---|---|
| "three ≈168 KB **raw**, budget 3D ≤150 KB gz" | 187.5 KB **gz** namespace / 130.4 KB gz named | my Phase-1 number was ~4× optimistic because I quoted minified bytes as if they were gzipped. A 150 KB gz 3D budget is only reachable with named imports and no addons. |
| "GSAP core ≈23–30 KB gz; +ScrollTrigger ≈40–45" | 27.1 / 44.4 | confirmed within 3 % |
| "Lenis ≈12 KB gz" | **5.3 KB** | 2.3× smaller than estimated → Lenis's risk is behavioural, never size |
| "Framer Motion ≈32–50 KB gz" (AC already ships it) | 44.9 KB root / **29.7 KB via `/mini`** | confirmed, plus a 15.2 KB saving AC can take today |
| "CSS-only card micro-interaction ≈0 KB" | 4.5–6 KB page incl. CSS | confirmed |
| "View Transitions need React 19.3+" | react pinned 19.2.6 → helper packages unusable; native API usable | confirmed for the npm helpers; the native path is free and works |

---

*Machine evidence: `prototype-lab/headless-results.json` (20 assertions), `prototype-lab/measurements.json` (per-library + per-experiment sizes), `prototype-lab/dist/_sizes/table.md`. Source of truth for behaviour: `prototype-lab/src/exNN-*/main.js`.*
