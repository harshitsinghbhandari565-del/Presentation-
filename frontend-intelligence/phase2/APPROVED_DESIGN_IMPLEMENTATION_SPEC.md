# Approved design specification — implementation document

**Mission:** turn the approved design direction into a specification AC can implement and AO can
review. Nothing in this file is an invention: every clause below either (a) restates a decision
PO approved, (b) preserves something the app already does, or (c) resolves a research finding into
an instruction with a measured number attached.

| Field | Value |
|---|---|
| Approved direction (PO, 2026-11-02) | 1. Geist + Newsreader · 2. pinned storytelling + one optional 3D scene · 3. GLSL ambient background with CSS fallback |
| Authored by | AK, reporting to AO |
| Verification branch | `arena/9d055deb-presentation` |
| Application ground truth | AC's active branch `arena/c9d0d599-presentation` at `71d6fb9` (`AC-Branch@cac9c7f` is stale — see `AC_BRANCH_DELTA.md`) |
| Spec reference implementation | `../prototype-lab/src/ex11-approved-spec/` (dist → `http://127.0.0.1:8123/ex11-approved-spec/index.html`) |
| Passes with | `APPROVED_DESIGN_ACCEPTANCE_CHECKLIST.md` — this file says what to build, the checklist says how AO and AC prove it |
| Explicitly not | a production diff, a redesign, or a licence approval. No file here touches `src/`, `package.json`, `supabase/`, or deploy settings |

**Evidence labels.** `[MEASURED]` AK ran the command or read the committed file / built artifact ·
`[REPORTED]` a source stated it · `[UNVERIFIED]` no browser, GPU, AT or real network here ·
`[PROPOSED]` an AK recommendation, not yet approved. Decision numbers are prefixed **D-AK** because
AC's own `DECISIONS.md` already uses D1–D7 for *different* decisions — do not merge the two lists.

---

## 0. The budget this spec has to live inside `[MEASURED]`

AC's `71d6fb9` tree installed, built and measured outside the repo (`AC_APP_MEASURED.md`):

| | value |
|---|---|
| Build | `npx next build` → exit 0, **Next.js 16.4.3** (Turbopack), compiled in 10.6 s, TypeScript passed, 11 static pages, `/` prerendered ISR `revalidate: 60` |
| Runtime | React **19.2.6** / react-dom 19.2.6, `framer-motion@^12.43.0`, `next@16.4.3`, drizzle 0.45.2, zod 4.6.7, `@supabase/ssr@0.12.7`, `lucide-react@^1.28.0` |
| Fonts | `next/font/local` **pointing into** `@fontsource-variable/geist@5.3.0` + `@fontsource-variable/newsreader@5.3.0` woff2 files (`layout.tsx:9-10`) |
| Theme mechanism | inline script in `layout.tsx` sets `<html data-theme>` from `localStorage["presentation-hub-theme"]` (supports `system`) and toggles a `dark` class; projector mode toggles `class="projector-mode"` on `<html>` (`ProjectorModeToggle.tsx:18`) |
| Landing First Load JS | **240.9 KB** gzipped |
| Shared runtime (`rootMainFiles`) | 128.8 KB gz |
| Landing CSS | 12.8 KB gz |
| Fonts | 91.7 KB gz (2 woff2) |
| Motion already on `/` | `framer-motion@12.43.0` (root), `Reveal` `whileInView`, 55 px hero parallax |
| Motion budget headroom | ~59 KB under the "<300 KB" target |

Therefore the whole approved design must be additive within that envelope, and the only affordable
additions are the ones measured at §2/§3 below. Everything the app ships today for motion is already
counted in the 240.9 KB.

---

## 1. Typography — D-AK1 (extend, never replace)

The approved pair is **already wired**: `layout.tsx:9-10` calls `localFont()` twice — `geist` (from the
fontsource package's `geist-latin-wght-normal.woff2`, `weight:"100 900"`) → `--font-geist`, and
`editorial` (from `newsreader-latin-wght-italic.woff2`, `weight:"200 800"`, **`style:"italic"`**) →
`--font-editorial`; `globals.css:3-6` maps both into `@theme`. The hero renders
`Less searching. / More <em>learning.</em>` and `globals.css` has `em { font-family: var(--font-editorial), Georgia, serif; font-weight: 400; color: var(--accent) }`
plus `.hero h1 em{font-size:1.14em;letter-spacing:-.045em}` and `.page-intro h1 em{font-size:1.14em}`.
So the editorial face is **not** scoped to the hero: it rides on every `<em>` in the app — 13 of them
across 6 route files `[MEASURED]`. That is the identity, and the spec keeps it, but it makes the
`em` selector the one place a size rule can slip.

```css
/* 1. Fix the token, don't change the voice. The declaration below replaces the self-referencing
      pair in AC's `@theme` block (--font-sans: var(--font-geist), … / --font-editorial: var(--font-editorial), …)
      which today only renders because next/font's unlayered class wins the cascade. A rename in
      next/font.config.ts, a Tailwind upgrade, or moving the @theme block would silently drop the
      newspaper face (delta A1, found by building). */
@theme {
  --font-sans: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
  --font-editorial: var(--font-editorial), "Newsreader", Georgia, ui-serif, serif;
}
```

**Rules.**
- **Roles, stated as the app already behaves:** Geist Sans carries UI, navigation, buttons, metadata.
  Newsreader carries *italic emphasis only*. Every editorial site in the built CSS `[MEASURED, 6 groups]`:
  `em` (all 13 occurrences sit inside `h1`/`h2`/`h3` — never in small copy), `.sheet-middle > span` 20px,
  `.visual-caption` 15px, `.step-number` 24px, `.filter-note p` 21px, `.detail-aside-note p` 21px; the
  last five each declare `font-style: italic` explicitly. **Never** for labels, counts, table cells, code.
- **`.step-number` is already the design system's editorial device** (24px italic serif in the three-step
  section). The pinned rail and ex11's `01/02/03` inherit from it — PR2 must not restyle it.
- **The one measured exception:** `.visual-caption` uses the serif at **15px**, under this spec's own
  18px floor. It is decorative (rotated `-3deg`, under the hero visual), so AO decides: keep it as the
  single documented exception, or move it to 17–18px. Do not let it become a precedent for captions
  elsewhere.
- **Scale** (tokens, `clamp()`, no `vw` in app code outside a clamp): `--step--1 ≈ 12.5→13px` metadata ·
  `--step-0 15→16px` body · `--step-1 18→21px` lede · `--step-2 23→33px` section title ·
  `--step-3 48→73px` hero (the hero keeps its existing `clamp(48px, 5.2vw, 73px)`, tracked `-0.055em`,
  weight 550; the `em` inside stays `1.14em`).
- **Editorial size rule:** Newsreader looks small at a matched px size, hence the 1.14em bump the app
  already applies at two selectors. Keep the bump, and if `em` is ever used inside text below 18 px,
  that context gets an explicit `font-size` guard rather than a new selector.
- **Italic-only is the design, so write it down.** Only the italic variable file is loaded
  (`layout.tsx:10`, `style:"italic"`), and every editorial rule except bare `em` declares
  `font-style: italic`. Two consequences: (a) a non-italic editorial use silently renders the italic
  file at normal metrics, so a new rule must state `font-style: italic` — `[PROPOSED]` add it to the
  bare `em` rule too, so the intent survives a `font-style: normal` reset; (b) if PO later wants roman
  emphasis, that is a third file and +~30 KB gz of fonts, not a one-line change.
- **Metrics:** next/font emitted `size-adjust: 89.08%` + ascent/descent overrides for both fallback faces
  `[MEASURED]`, so swap-induced CLS is already mitigated. Any new face must carry the same treatment,
  otherwise the shift lands on the hero — the LCP element.
- **Font count stays at 2 families / 2 files = 91.7 KB gz `[MEASURED]`.** AK explicitly **withdraws**
  the earlier "ship the roman file too" suggestion: read against the actual CSS, italic-only is coherent
  (see the two bullets above), and adding a file to buy a face nobody asked for is the wrong kind of
  polish. The deliverable is a comment in `globals.css` next to `@theme`, not a third woff2.

## 2. Motion — D-AK2 (pinned storytelling first, GSAP not yet)

**The hard constraint:** GSAP's Webflow licence may be approved, but **no new GSAP recommendation is
allowed without a separate licence review**. This spec therefore pins storytelling *without* GSAP.
`[PROPOSED]` AC keeps its existing `framer-motion@12.43.0` (already paid for at 44.9 KB) and adds
nothing; `[PROPOSED]` the licence review decides later whether motion moves to `motion@14.9.0`
(the MIT successor — same import surface, one dependency line, not a rename) and whether
`gsap@3.15.1` + ScrollTrigger is worth +44.4 KB gz `[MEASURED]` in the lab, +56.1 KB with
Flip/SplitText.

**Pinned section, CSS-first (the approved ex10 shape, implemented in ex11):**
- One pinned storytelling section per landing page. Not two. Not one per category.
- Structure: sticky text column + scrolling step column; steps are real `<li>` items in reading order;
  the rail (01/02/03) reflects progress, it never *is* the content.
- Implementation: `position: sticky` + `animation-timeline: view()` + `@keyframes` on the steps,
  wrapped in `@supports (animation-timeline: view())`. Outside the `@supports` block the section is an
  ordinary stacked list — that is the fallback, not an animation with a missing trigger.
- **Not Baseline** (per the pack's live scan): Firefox/Safari-older users must get the stacked version.
  Never gate on a UA string.
- Where to pin: the existing **`#how-it-works` → `.how-section`** block: `.how-intro` (h2 + copy) beside
  `.how-steps`, whose three `<article class="how-step">` items carry `.step-number` "01/02/03" + icon +
  `h3` + `p` + `ArrowRight` `[MEASURED]`. The copy is already "Find your next resource / Get the context
  first / Go straight to the source", so the pin adds no new content to review, and `.step-number`'s
  "01/02/03" is already the rail — ex11 reuses it verbatim.
- **One motion system per element.** Each step is wrapped in `<Reveal key delay={index*0.05}>`
  `[MEASURED]`. Inside a pinned section the scroll-driven keyframes *replace* that reveal: drop the
  `Reveal` wrapper for the three steps (or set `once` + no transform there). Two systems driving the
  same `transform` is how this kind of section ends up janky or half-faded.
- Under `prefers-reduced-motion` and below 1024 px: **no pinning, no transform** — plain stacked flow.
  The app already keeps `<MotionConfig reducedMotion="user">`; that covers framer-motion only, so the
  CSS block needs its own `@media (prefers-reduced-motion: reduce)` guard (AC already has one).
- The hero parallax (`HeroVisual`, `useScroll` + `useTransform`, 55 px) stays. AK **retracts** the
  earlier "unguarded scroll math" defect: AC's `HeroVisual.tsx` reads
  `matchMedia("(prefers-reduced-motion: reduce)")` and returns 0 progress. `[MEASURED]`
- Scrollbar/`scroll-behavior: smooth` stays in CSS (AC has it on `html`). `[PROPOSED]` Lenis is
  *not* required by this spec; if a later milestone wants smoothed wheel/trackpad scroll,
  `lenis@1.3.27` costs **+5.3 KB** gz `[MEASURED]`, needs `lenis.on('scroll', …)` +
  `gsap.ticker.add(t => lenis.raf(t*1000))` + `gsap.ticker.lagSmoothing(0)` (or `autoRaf: true`, never
  both) **and removal of `html{scroll-behavior:smooth}`**, `data-lenis-prevent` on nested scrollers, no
  `syncTouch: true`, one root instance.
- Vocabulary: `--motion-fast 180ms` / `--motion-base 300ms` / `--motion-slow 450ms`,
  `--ease-out-soft cubic-bezier(.22,1,.36,1)` (already the `Reveal` easing), `--move-sm 8px` /
  `--move-md 14px` — ex11 uses exactly these. The app has **zero** motion tokens today; this is
  2 lines of CSS.
- **Do not convert the type ladder in the same PR.** AC's responsiveness is a hand-tuned px-override
  ladder inside three `@media` blocks (e.g. `.hero h1{font-size:59px}` at ≤1024, `47px` at ≤768,
  `clamp(47px,11.8vw,65px)` at ≤480 `[MEASURED]`), ~120 declarations. `[PROPOSED]` PR1 introduces the
  tokens and uses them for **new** rules + the two largest headings only; a blanket clamp migration is a
  different, riskier change and would blow up the design diff for no user-visible gain.

## 3. Ambient background — D-AK3 (GLSL with a CSS fallback)

Today: one `.ambient-background` div — `radial-gradient(ellipse at 80% 25%, rgba(94,99,192,.055),
transparent 50%)` — plus a masked 80 px grid at `opacity:.13`, in a band `height: 920px`,
`z-index:-1`, `pointer-events:none`. `[MEASURED]` The landing page contains **0 `<canvas>` elements**.

**Spec:**
1. Replace the gradient div with one fixed `<canvas>` behind content (same band, same `z-index:-1`,
   `aria-hidden="true"`, `pointer-events:none`); keep the grid exactly as-is — the grid is a CSS layer
   in both modes, so the shader never has to reproduce it.
2. **Raw WebGL2, no library.** The ex11/ex05 shader is 3.1 KB gz `[MEASURED]`; the three.js route
   measured **192.2 KB** gz for an inlined namespace import `[MEASURED]` — 62× the whole current
   landing JS payload for one background. `ogl` is not an alternative here (see `RECOMMENDED_STACK.md`).
3. Uniforms read the CSS custom properties (`--accent`, `--bg`), so the ambient layer follows the theme
   instead of duplicating it. The app has **0 `dark:` utilities** `[MEASURED]` — theme switching is pure
   `[data-theme]` token reassignment set by the inline script in `layout.tsx` (with a `system` option and
   a `dark` class on `<html>`) — so the shader must re-read colours when `data-theme` changes: a
   `MutationObserver(documentElement, {attributeFilter:["data-theme","class"]})` is enough, or just read
   the computed value once per draw (fine at this shader's cost). Never cache the parsed colour at module
   scope: ex11 caches per-draw, not per-session, for exactly this reason.
4. DPR cap **1.5** (1.0 on low-power), one oversized triangle, one draw call, 4-octave fBm, and the
   animation amplitude eased from 0 on mount (no flash on first frame).
5. **Kill switches, all three required:** off-screen (`IntersectionObserver` on the band) → stop the
   loop; `document.hidden` → stop; context loss → `preventDefault()` + fall to CSS. ex11 additionally
   refuses to restore twice: a device that lost the context once stays on CSS.
6. Fallback = **exactly what the app does today** (gradient + grid). Never a black rectangle, never a
   layout gap: the `<canvas>` is additive inside `.ambient-background`, and the fallback path removes
   it (`display:none`) rather than hiding the CSS behind it.
7. Reduced motion: shader draws **one still frame** (`u_amp` mid-value) and never loops; AC may ship
   the CSS-only branch for these users instead — both are acceptable, silence is not.
8. Light mode: the wash must be re-tuned (the app's light value is `rgba(94,99,192,.11)`, 2× the
   dark alpha), otherwise the shader looks broken on `#f8f9fc`. ex11 handles this with `u_lightmode`.

## 4. The one 3D scene — D-AK4 (optional by construction)

Approved as *optional*; the mission's rule is **it must not block initial content**. So the deliverable
AC implements is the gate, not the geometry:

```
blocked if: prefers-reduced-motion · forced fallback flag · pointer:coarse · innerWidth < 1024
            · deviceMemory ≤ 4 · hardwareConcurrency ≤ 2 · saveData · projector-mode · no usable WebGL
```
`[PROPOSED]` (the predicates are ex02/ex11's `sceneGate()`; each one is an existing, testable signal.)

> **[SUPERSEDED by the implementation audit, 2026-11-02 — C16.]** That list was written for a scene that
> *auto-loads and animates continuously*. AC's shelf is different in the only way that matters: it is
> **demand-rendered** (it draws on `resize` and on drag, never on a `requestAnimationFrame` loop), so there
> is no continuous motion to protect reduced-motion users from and no sustained GPU cost to protect weak
> hardware from. The gates that survive are **explicit intent + no usable WebGL + projector-mode**, and one
> that my original list was missing: **`failIfMajor`**, because software WebGL is exactly the case where a
> "weak device" heuristic earns its keep. `pointer:coarse` / `innerWidth` / `deviceMemory` /
> `hardwareConcurrency` / `saveData` are **dropped** (they would deny a static object to people who asked
> for it, while adding untestable branches); `saveData` becomes a disclosure on the button ("≈129 KB")
> rather than a block. `ex11`'s `sceneGate()` is revised to match, and AC's shipped behaviour is the
> reference — see `AC_IMPLEMENTATION_INDEPENDENT_REVIEW.md` §3.2.

- Delivery: `next/dynamic(() => import(...), { ssr: false })` mounted only after the trigger is in
  view *and* the main thread is idle. Zero bytes on first load — the 192.2 KB `[MEASURED]` chunk is
  fetched on demand, or not at all.
- **A visible control is not optional.** `[PROPOSED]` for AO: a "Load the 3D scene" button (ex11 has
  one) so the gate can be demonstrated without a device farm; and the gate reason is printed in the
  status line so a reviewer can tell *why* it stayed off.
- One canvas for the whole page, max — never a second canvas alongside the ambient layer. If both are
  enabled, the 3D scene sits *in* the content column, not behind it, and the ambient layer stops
  drawing while the scene is visible (single GPU producer at a time).
- The `projector-mode` predicate is not invented: AC already ships it (`<html class="projector-mode">`,
  `font-size:18px`, `.projector-mode .resource-card:hover{transform:none}` `[MEASURED]`), i.e. the app
  already has a "this is being projected to a room" concept and already suppresses motion inside it.
  Reusing that flag is the cheapest possible gate.
- Scene rules: `frameloop="demand"`-style (redraw on interaction only), ≤1 draw call for the hero
  object, no post-processing chain, no text-in-texture (see §7), a static poster/screenshot underneath
  so a failed load is a picture, not a hole.
- If the 3D work is cut, the page must still read as complete — that is the PO's stated preference.

## 5. Interaction budget (from the 100+ experience corpus)

From the 168 inspected website experiences `[MEASURED — count]` (see `WEBSITE_ATLAS.md`) and the
pack's guardrail that motion must never obstruct finding a resource:

| Interaction | Verdict | Rule |
|---|---|---|
| Card hover: `translateY(-5px)` + border + shadow at `.2s`, with `.cover-paper` rotating `-3deg / translateY(12px)` | adopt, unchanged | already the app's `.resource-card:hover` `[MEASURED]`; keep the paper tilt — it is the one playful gesture the design owns. Do **not** add `will-change`; it is unnecessary at one transform and it costs memory per card |
| Cursor-following spotlight / tilt inside cards | **reject for the app** | `ex07` is 67.5 KB gz *because of* the `motion` vendor import for its `?tilt=motion` variant; the CSS-only build of the same card is **~4 KB** `[MEASURED]`. Lesson: ship the CSS version, and even that only on `.resource-card`, never on a dense results grid where it competes with the links |
| Animated nav pill | adopt the technique, not the dependency | `ex08` = 66.6 KB gz, of which ~all is `motion`; the app's active state is already `.mobile-navigation > a.active` + `--accent-soft` `[MEASURED]`. A CSS-animated indicator on the desktop nav is the 0-dependency version |
| Page transitions | hold | View Transitions need the `next/experimental/view-transition` route + React 19.3; AC has React 19.2.6 → **unavailable**; re-check when AC upgrades |
| Search / results feedback | adopt what exists, add what is missing | **correction while writing this spec:** `LibraryControls.tsx` already ships `<p role="status" aria-live="polite"><strong>{total}</strong> resources for <q>…</q></p>` with `aria-busy` on the results region and a proper combobox in the ⌘K palette `[MEASURED]`. AK's earlier note ("live regions remain unimplemented") was inferred from the prerendered landing HTML and was wrong — see `AC_APP_MEASURED.md` §4. The real gap: **no skeletons and no root `loading.tsx`**, so a pending search is a spinner + `opacity:.65` |
| Magnetic buttons / split-text scramble / horizontal scroll / scroll-jacking | reject | none help a student find a PDF; `ex04` keeps the *pin* shape only |
| `lenis@1.3.27` smooth scroll | optional, needs AO | §2; **+5.3 KB gz** `[MEASURED]`, and it requires deleting `html{scroll-behavior:smooth}` (the app has it at `globals.css:2` `[MEASURED]`) in the same PR — two smooth-scroll systems on one page is the one way this library actually breaks the experience |

## 6. Performance + accessibility budgets (the numbers the checklist audits)

| # | budget | status |
|---|---|---|
| P1 | Landing First Load JS ≤ **300 KB** gz; currently 240.9 → **≤59 KB** for everything in this spec | `[MEASURED]` baseline |
| P2 | The approved features alone must land at ≤ 300 KB: ~~`framer-motion/mini` + `LazyMotion` is **−15.2 KB**~~ **[CORRECTED 2026-11-02, C15: `framer-motion/mini@12.43.0` exports only `useAnimate` — measured 3.1 KB gz — so the −15.2 KB trim was never reachable through that subpath; the 29.7 KB figure belongs to `LazyMotion+domAnimation+m+useScroll` on the *main* entry. AC's actual move, deleting the library, removed 41.5 KB]**; raw-GLSL ambient **+3.1 KB target / 1.5 KB delivered**; 3D chunk **0 KB** on first load ✅ delivered | `[MEASURED]` per-item, `[MEASURED-AK]` correction |
| P3 | No new runtime dependency without an AO-approved line in `package.json`. Approved set = **none new** | rule |
| P4 | First load ≤ 1 canvas, ≤ 1 font swap, 0 external requests, 0 `<img>` on the landing page (it has 0 today) | `[MEASURED]` baseline |
| P5 | Every animation: `transform`/`opacity` only; no `width`/`top`/`filter` on the scroll path | rule |
| P6 | **[ADDED by audit]** font files: this spec said "≤ 2 files"; the shipped state is **3 woff2 / 148.4 KB raw, all preloaded, all with `size-adjust` fallbacks** — accepted, and the budget line amended accordingly (roman Newsreader is load-bearing once headings use it) | `[MEASURED-AK]` |
| A1 | Reduced motion honoured in **all three** places: `<MotionConfig reducedMotion="user">` (exists), the CSS `@media` block (exists — extend it to the new keyframes), the shader/scene gates (new) | `[MEASURED]` 2/3 exist |
| A2 | Any new interactive control: keyboard-operable, visible focus ring, ≥44 px target, name from DOM text (no icon-only) | rule |
| A3 | Pinning must not change reading order or `Tab` order; steps stay `<li>` in a `<ol>` | rule |
| A4 | `forced-colors: active` → canvas/grid hidden, borders from system colours; no `backdrop-filter` reliance for legibility | `[UNVERIFIED]` rendering |
| A5 | Search results region announces count via `role="status" aria-live="polite"`; loading state uses `aria-busy` + skeletons, never a spinner with no name | `[MEASURED]` currently absent |

## 7. Deliberately not in this spec

- **3D text via `troika-three-text`.** The pack's original "3D text" idea is replaced: a text atlas is
  a per-card cost that grows with catalogue size (`20 KB + 3 KB/record` in the blueprint's own maths),
  it breaks selection, translation and screen readers, and it can't render Devanagari reliably.
  **Metadata belongs in DOM, above a card, at real text size.** Catalogue data is 3 rows + 1
  compatibility record today `[MEASURED]`, so the atlas is also unjustifiable on content grounds.
- **R3F rewrite.** `@react-three/fiber@9.x` supports React 19 but excludes the `next` RSC host AC
  uses; reject on cost/complexity, not compatibility.
- `@react-three/postprocessing` (reject on cost), `ogl` (no LICENSE file, last publish 2025-01-27),
  particle libraries, shader frameworks (the app's entire shader need is one fBm).
- Scroll-pinned section-count games, horizontal galleries, `@tanstack/react-virtual@3.14.25`
  (defer until the catalogue is real), `cmdk@1.1.1` (stale 2025-03-14 — pin if adopted for the
  palette).

## 8. Implementation sequence for AC (small, reviewable, reversible)

| PR | Content | Size | Reversibility |
|---|---|---|---|
| 1 | tokens + typography: `@theme` cascade fix, 2 `--font-*`, motion tokens, type scale; hero h1 `minmax`/`clamp` tidy | CSS only | revert one file |
| 2 | CSS-pinned `#how-it-works` (`@supports` + sticky + reduced guard) | CSS + one component | revert one file |
| 3 | ambient canvas (raw WebGL2, gates, CSS fallback) | 1 component + ~60 lines | env/flag: `?ambient=css` |
| 4 | gated 3D slot (dynamic import + button + reason readout) | behind a flag | delete the folder |

PR1 and PR2 need no dependency change, so they can be reviewed while the GSAP licence review is still
open. PR3/PR4 are the only ones that touch rendering.

## 9. Open decisions (AO/PO sign-off required before merge, not before PR1–PR2)

1. Non-italic Newsreader file: ship it, or keep the serif italic-only (§1).
2. Motion package end-state: ~~keep `framer-motion@12.43.0`, narrow to `mini`+`LazyMotion`, or move to
   `motion@14.9.0`~~ — **resolved by AC's implementation: the library is removed outright** and the reveal
   motion is CSS scroll-driven (0 KB, no licence question left to answer). `motion@14.9.0` stays off the
   table until the licence review exists.
3. Lenis in or out (§2).
4. The visible "Load the 3D scene" control: ship it or rely on the automatic gate alone (§4).
5. Light-mode shader wash tuning: `u_lightmode` uniform vs a second preset (§3.8).
6. Data before polish: 3 seed rows / 1 compatibility record cannot show a card grid, a 3-step rail or
   an empty state. AK recommends the mock-data compatibility mode **first**, or the design review will
   be judging a page with one item on it (`AC_APP_MEASURED.md` §5).


---

## 10. Audit outcome — 2026-11-02 (`AC_IMPLEMENTATION_INDEPENDENT_REVIEW.md`)

The design was implemented in `681800f` on `arena/c9d0d599-presentation` (parent `71d6fb9`, 34 files,
+1,038/−104). AK re-measured AC's build independently. Delivered vs specified:

| spec line | specified | delivered | verdict |
|---|---|---|---|
| §0 budget P1 | ≤ 300 KB landing JS | **186.6 KB gz** JS-only (187.0 by AC's own script); **200.4 KB** including CSS, vs 240.9 before → **−40.5 KB** | ✅ |
| §2 motion | mini-swap −15.2 KB | library deleted, −41.5 KB, CSS reveals behind `@supports` + `no-preference` + `min-width:768px` | ✅ (better; see C15) |
| §2 hero parallax | keep, CSS-only | **dropped**, and the code comment still promises it | ❌ D-9 |
| §3 ambient | ≤ 8 KB gz, decorative, pausable, CSS fallback | **1.5 KB gz** chunk; 920 px band; IO/visibility/projector/reduced-motion all wired; DPR 1.25 + ~20 fps throttle | ✅ except the layering bug (grid is covered → D-3) |
| §4 3D | 0 KB first load, gated, DOM metadata, dispose | 128.3 KB chunk, **0 routes reference it**; click-to-load; DOM labels; full `dispose()`; poster fallback | ✅ except post-init context loss leaves dead UI (D-4) |
| §6 P4 | ≤ 2 font files | 3 files / 148.4 KB, preloaded, `size-adjust` 106.28 % + 104.8 % | ◐ budget amended (P6) |
| §1 headings | Geist headings, Newsreader emphasis | **`h1,h2` are Newsreader everywhere** (+ `.optional-shelf h3` opts back in) | ◐ PO ruling (D-5) |
| §5 tokens | `--step-*`, `--motion-*`, `--ease-*` | type/leading/tracking tokens shipped as `--text-*` (adopt AC's names); **0 motion tokens** | ◐ D-6 |
| §8 PR1 data | ≥ 12 records | 16 fixtures, but only in the PGlite path; compat mode still 1 record | ◐ F1 |
