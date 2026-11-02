# Independent review — AC's approved-frontend implementation

**Reviewer:** AK (independent senior-frontend read of AC's diff; no edits to AC's branch) · **Date:** 2026-11-02
**Reviewed commit:** `681800f894b2cf17021bb540e177a68c05e8f72e` on `arena/c9d0d599-presentation`
**Reconciliation reference:** `71d6fb912f97693f9dded837fdbaeafb5b90e9b0` — **confirmed to be the direct parent** of the reviewed commit (`git ls-remote` + `api.github.com` commit metadata: `parents: [71d6fb91…]`, 34 files, **+1,038 / −104**)
**Audited against:** `APPROVED_DESIGN_IMPLEMENTATION_SPEC.md` (D-AK1…D-AK4) and `APPROVED_DESIGN_ACCEPTANCE_CHECKLIST.md` (rows A1–F3)

| Verification status of this review | |
|---|---|
| `[MEASURED-AK]` | AK executed it: production build of AC's tree, per-route gzip sums, chunk inspection, AC's own `scripts/measure-bundle.mjs`, `tsc --noEmit`, `eslint .`, `npm run test:unit`, `npm run test:db`, `npm audit`, esbuild size probes, and four PGlite probes against AC's real migrations (including an 4,016-row scale probe) |
| `[REPORTED-AC]` | Stated in `FRONTEND_IMPLEMENTATION.md` / AC's handover and **not reproducible in AK's sandbox** (no browser binary, no GPU, Playwright CDN off the allowlist): the 17/17 Chromium E2E pass and the screenshots in `/home/user/audit/` |
| `[UNVERIFIED]` | Everything about rendering, feel, GPU cost, AT output, real-device behaviour |

AC's tree was read from a **codeload tarball of the exact sha, extracted to `/home/user/scratch/`**; the repo, `arena/c9d0d599-presentation` and every app file were untouched. `main@4307a68`, `AC-Branch@cac9c7f` and AK's own `e407ac0` were verified unchanged before and after.

---

## 1. Files and code paths examined

`package.json` · `package-lock.json` · `scripts/measure-bundle.mjs` (new) · `src/app/globals.css` (full 88/17 diff) · `src/app/layout.tsx` · `src/app/page.tsx` · `src/app/library/loading.tsx` · `src/components/layout/{Reveal,AmbientBackground,AmbientGL,ambient-shader}.tsx/.ts` · `src/components/landing/{StoryIndex,OptionalShelf,shelf-scene,HeroVisual}.ts(x)` · `src/components/documents/DocumentCard.tsx` · `src/components/library/LibraryControls.tsx` · `src/lib/{catalog,search}.ts` · `supabase/migrations/202611010001_catalog.sql` (for index/column ground truth) · `202611010002_least_privilege_catalog_grants.sql` · **`202611020001_search_ranking.sql`** · `supabase/seed.test-fixtures.sql` · `tests/unit/{search-ranking,search}.test.ts` · `tests/database/{search-ranking,least-privilege-grants,policies}.test.ts` · `tests/e2e/{frontend,public}.spec.ts` · `playwright.config.ts` · `src/data/presentations.json` · `FRONTEND_IMPLEMENTATION.md`, `DECISIONS.md` (D18), `KNOWN_ISSUES.md`, `AC_HANDOVER.md`.
Not modified: anything. `next.config.ts`, PostCSS, `supabase/seed.sql`, the applied migrations, Auth/admin code and all AK-relevant config are byte-identical to `71d6fb9` except where the diff above lists them.

## 2. Headline judgement

**ACCEPT WITH CONDITIONS.** This is a disciplined implementation: the approved design is recognisably there, the numbers hold up under independent re-measurement, the dependency story is honest, and the accessibility work is *better* than my spec asked in two places (transform-only reveals so content can never be hidden; a real chapter `nav` instead of a decorative rail). The blocking issues are all in one place — the **unapplied search migration** — plus three small, cheap fixes in the visual layer. Nothing here requires re-architecture, and nothing about the app's initial load regressed.

---

## 3. The four discrepancies AO asked me to audit

### 3.1 Motion — AC removed `framer-motion` instead of adopting `framer-motion/mini`

**Verdict: AC's decision is correct, and my pack's recommendation was wrong. Accept the removal; correct the pack.**

- AC's stated reason: *"the installed 12.43.0 `mini` entry exports only `useAnimate`"*. `[MEASURED-AK]` — I unpacked `framer-motion@12.43.0` from the registry: `dist/es/mini.mjs` is literally `export { useAnimateMini as useAnimate } from './animation/hooks/use-animate-style.mjs'`; `./dom/mini` exports `animate`/`animateSequence`. **No `LazyMotion`, no `m`, no `useScroll` in `/mini`.** The claim is exactly right.
- `[MEASURED-AK]` My own probe of the entry shapes (esbuild `--bundle --minify`, react external, gzip 9):

  | import shape | gz |
  |---|--:|
  | `framer-motion/mini` → `useAnimate` | **3.1 KB** |
  | `framer-motion/dom/mini` → `animate` | 3.0 KB |
  | `motion + useScroll + useTransform + useReducedMotion` (AC's old usage) | **43.1 KB** |
  | `LazyMotion + domAnimation + m + useScroll` (main entry) | **29.7 KB** |
- So the pack's row "**framer-motion/mini + LazyMotion(domAnimation) → −15.2 KB**" was **mislabelled**: 29.7 KB is the *main-entry* `LazyMotion` shape, not the `/mini` subpath. The saving was real, the route to it was wrong, and AC found that by reading the file rather than by trusting my table. Recorded as **C15** in `VERIFICATION_LOG.md`; `RECOMMENDED_STACK.md`, the blueprint's motion line and checklist row B3 carry the correction.
- **Outcome vs budget:** `[MEASURED-AK]` removing the library entirely took landing initial JS from **228.1 → 186.6 KB gz** (−41.5 KB on a like-for-like JS-only basis; AC reported −41.7 KB). CSS-only motion costs 0 KB. There is no motion regression I can demonstrate from source: reveals are scroll-driven CSS guarded by `@supports (animation-timeline: view())` *and* `@media (prefers-reduced-motion: no-preference) and (min-width: 768px)` `[MEASURED-AK]` — i.e. Firefox/Safari-without-timeline users get the plain stacked content, which is the behaviour my spec specified.
- **What was lost:** the 55 px hero parallax. `HeroVisual.tsx` is now a plain `<div>`; there is no CSS scroll-driven rule replacing it (I searched the built CSS for `.hero-document-stack` animations: only `inset` overrides exist) `[MEASURED-AK]`, yet the file's own comment claims "Parallax is a CSS scroll-driven enhancement only". Either add the ~6-line `view()` rule to `.hero-visual` or fix the comment (**D-9**). This is not a budget problem — it is a promise/behaviour mismatch.

### 3.2 3D loading — is AC's "explicit intent" gate enough?

**Verdict: for the *load* decision, explicit intent is genuinely sufficient — my device-gate list is over-engineered for a click-to-load scene. For the *pause* decision, two gates still matter and one is missing.**

Reasoning from what the code actually does `[MEASURED-AK]`:

| my spec's gate | needed here? | why |
|---|---|---|
| `prefers-reduced-motion` | **No (as a load gate)** | `mountShelf` has **no animation loop at all**: it renders on `resize` and on pointer-drag only. There is nothing to reduce. Turning the scene into "can't have it" for these users would be gatekeeping for its own sake |
| `pointer: coarse` / `innerWidth < 1024` | **No** | demand-render + `touch-action: pan-y` on the canvas means a touch user can rotate without stealing the page scroll. Cost per interaction is one frame |
| `deviceMemory ≤ 4` / cores ≤ 2 | **No, with one exception** | a static 6-box scene is ~1 draw pass; the exception is **software WebGL**, see below |
| `saveData` | **No, but disclose** | the payload is only fetched after a deliberate click, and the button text says "Loading 3D shelf…". A one-line "(≈129 KB)" hint next to the button is the honest version of this gate |
| `projector-mode` | **Keep** | AC *doesn't* apply it here: `.projector-mode .ambient-canvas{display:none}` exists, but the shelf is unaffected. A projected classroom does not want a drag-to-rotate object. One CSS rule or one `classList.contains` check |
| `no usable WebGL` | **Yes — and it is handled** | `new WebGLRenderer()` throws → `catch` → `return undefined` → `state="fallback"` → CSS poster + status announcement `[MEASURED-AK]` (their null-`getContext` E2E covers exactly this) |
| `failIfMajor` | **Missing on both GL paths — add it** | `[MEASURED-AK]` neither `canvas.getContext("webgl", {…})` (ambient) nor `new WebGLRenderer({…})` (shelf) sets `failIfMajor`. On a VM/RDP/software-GL machine the ambient layer animates in SwiftShader forever at ~20 fps (their own throttle), which is the one case where "low-power device" protection genuinely earns its keep. One option, both call sites |

So: **drop my device-gate list, keep intent + demand-render + poster** (that is what AC built), and add `failIfMajor: true` + the projector check. My ex11 reference implementation should follow AC here, not the other way round — recorded as **C16**.

### 3.3 Bundle measurements — AC vs AK, with the boundary made explicit

The 12.2 KB gap between my old landing number and AC's is **not a disagreement about the app**; it is CSS inclusion.

| | AC's boundary (`scripts/measure-bundle.mjs`) | AK's boundary (`AC_APP_MEASURED.md` §1) |
|---|---|---|
| what is summed | `/_next/static/**.js` referenced by the prerendered HTML, gzip 9 | the same **plus the route's CSS file** (12 assets vs 9 refs) |
| landing, `71d6fb9` | 228.7 KB gz `[REPORTED-AC]` | **240.9 KB gz** `[MEASURED-AK]` |
| arithmetic | — | 240.9 − 12.8 (CSS) = **228.1** ≈ AC's 228.7 (0.6 KB = ref-set/gzip-level drift; the same drift appears on `/about`: 193.2 − 12.8 = 180.4 vs their 180.8) |

On the **new** build I re-ran both tools in the same tree `[MEASURED-AK]`:

| metric | AC reported | AK measured | delta | note |
|---|--:|--:|--:|---|
| landing initial JS | **187.0 KB gz** (9 refs) | **186.6 KB gz** (9 refs) | 0.4 KB | agreement; AC's number is sound |
| landing JS + CSS (my boundary) | — | **200.4 KB gz** (186.6 + 13.8 CSS) | — | vs 240.9 before → **−40.5 KB** |
| `/about` initial JS | 179.9 KB gz (8 refs) | 179.6 KB gz (8 refs) | 0.3 KB | ✓ |
| ambient shader lazy chunk | ~1.5 KB gz | **1.5 KB gz** (`.next/static/chunks/37n7xsxl-0xta.js`, identified by its GLSL markers) | 0 | ✓ |
| three.js shelf chunk | ~128.9 KB gz | **128.3 KB gz** (chunk `1gtgzv_8ud9w2.js`, the only client chunk containing `WebGLRenderer`) | 0.6 KB | ✓ |
| my esbuild floor for AC's exact `three` named-import list | 130.4 KB (pack table, "named subset") | **130.7 KB** today | — | Turbopack emits 128.3 → the import list is already optimally shaken |
| whole client JS corpus | — | **414.8 KB gz / 22 chunks** (was 323.0 / 21) | +91.8 KB | = +128.3 three −44.9 framer-motion + new app code |
| fonts | — | **3 woff2, 148.4 KB raw** (was 2 / 91.7 KB), all `display:swap`, all `<link rel=preload>` in the landing HTML, `size-adjust` 106.28 % (geist) / 104.8 % (editorial) | +56.7 KB | the roman Newsreader is now load-bearing (see D-5) |
| budget check | — | **186.6 KB ≤ 300 KB**, 113 KB of headroom | ✅ | the "<300 KB" line is comfortably met for the first time |

Two things worth flagging for AO's own tooling: AC's script **silently skips `/library`** (it maps that route to `.next/server/app/library.html`, but `/library` is now `ƒ` dynamic so the file doesn't exist) — the route is not measured by either tool; and `next build` in AC's tree printed **no First Load JS column**, which is why their own script exists `[MEASURED-AK]`.

### 3.4 Dependencies — `three` + `@types/three`

`[MEASURED-AK]` `package.json` diff is exactly: `− framer-motion@^12.43.0`, `+ three@0.187.0` (dependency, exact pin), `+ @types/three@0.187.0` (devDependency, exact pin). No other dependency moved; `package-lock.json` is +65/−43 consistent with that swap.

Assessment: **justified, correctly placed, and correctly kept out of the initial bundle** — with one process condition.

- Justified: PO approved "one optional 3D scene"; measured alternatives (raw WebGL for a 3D book shelf, or ex03's `three`-free CSS 3-D) would each cost more AC time than `three` costs bytes, and the bytes only arrive after intent. `three@0.187.0` is MIT, and it is the *same version my lab pinned and measured*, so the pack's numbers transfer directly.
- Correctly placed: `@types/three` is dev-only; the exact pins match the pack's "pin, don't range" rule; `npm audit --omit=dev --audit-level=high` → **0 vulnerabilities** `[MEASURED-AK]`, and the full audit reports **20 moderate dev-toolchain advisories** `[MEASURED-AK]` — AC's claim in both cases.
- Kept out: no prerendered route references the shelf chunk (checked all 7 HTML outputs) and their E2E asserts at the network layer that no `three`/`shelf-scene` script is requested on `/` `[MEASURED-AK]` for the HTML side, `[REPORTED-AC]` for the browser side.
- **Info:** an **SSR copy** of the module is emitted (`.next/server/chunks/ssr/src_components_landing_shelf-scene_ts_*.js`, 528 KB raw / **128.6 KB gz**) `[MEASURED-AK]`. No route fetches it; it is build/serverless weight only. Accept unless Vercel function-size limits appear.
- **Process condition:** my spec (row D3) required an AO-approved `package.json` line before any new dependency. AC added one in the same commit that AO is reviewing. It is *within* the approved scope and it is defensible, but AO should **ratify the line explicitly** rather than let it ride along with the design diff — that keeps the "no dependency without a decision" rule intact for the next contributor.

---

## 4. Checklist results (rows from `APPROVED_DESIGN_ACCEPTANCE_CHECKLIST.md`)

Legend: ✅ PASS (verified in source/build/test) · ❌ FAIL (verified defect) · ◐ PARTIAL · 👁 UNVERIFIED (needs browser/device/GPU/AT) · — N/A.

| row | verdict | evidence / what is still open |
|---|---|---|
| **A1** font token self-reference | ✅ | `@theme { --font-editorial: var(--font-newsreader), Georgia, serif }` — the cycle is gone; built CSS confirms both `editorial` faces declared |
| **A2** editorial = emphasis only | ❌ **by design change** | `h1,h2 { font-family: var(--font-editorial) }` is new, so all 7 headings on `/` (1×h1 + 6×h2) `[MEASURED-AK]` are Newsreader and `.hero h1 em` is now serif-on-serif. Defensible premium choice, **but it is not what the approved spec pinned** → PO must confirm (D-5) |
| **A2b** `.visual-caption` 15px exception | 👁 | still 15px, still serif; needs eyes on a real render |
| **A3** roman Newsreader | ✅ | both files declared (`style:"normal"` + `"italic"`), preloaded, adjusted fallbacks; my pack's "2 files max" line is superseded (C17) |
| **A4** type tokens, no blanket rewrite | ◐ | `--text-*`/`--leading-*`/`--tracking-*` added and consumed by `.hero h1`, `h1,h2`, `.section-heading h2`, `.how-intro h2`, `.page-intro h1`, `.final-cta h2`, `.optional-shelf h3`; the px ladder was *not* rewritten (correct); **no `--motion-*`/`--ease-*` tokens at all** (0 hits `[MEASURED-AK]`) → D-6 |
| **A5** light-mode ambient | 👁 | `[data-theme="light"] .ambient-canvas[data-state="ready"]{opacity:.45}` + shader picks (0.32,0.35,0.78) vs (0.55,0.58,1.0) `[MEASURED-AK]` — logic present, look unverified |
| **B1** pinned story, CSS-only, no dep | ✅ | `@supports (animation-timeline: view())` + `position:sticky` on `.pinned-story .how-intro` (already sticky pre-diff; the new part is `scroll-margin-top` + chapter nav) and no new dependency |
| **B1b** one motion system per element | ❌ | `.reveal` **and** `.pinned-story .how-step` both run `reveal-in` → nested transforms compose (≈2×14 px) `[MEASURED-AK]`. Drop the `Reveal` wrapper for the three steps (D-7) |
| **B2** reduced motion → stacked flow | ✅ | reveal block gated on `no-preference` + `min-width:768px`; `reduce` hides `.ambient-canvas`, stops `skeleton::after`, cancels `data-pending` dim; pre-existing `.01ms` block intact. `[REPORTED-AC]` their reduced-motion E2E asserts `display:none` |
| **B3** evaluate the mini swap | ✅ (superseded) | AC evaluated it, found `/mini` insufficient, and beat it by deleting the library; my −15.2 KB line is corrected (C15) |
| **B4** no GSAP before licence review | ✅ | `gsap` absent from `package.json`, lockfile and every chunk `[MEASURED-AK]` |
| **B5** transform/opacity-only motion | ◐ 👁 | new rules animate `transform`, `opacity` is untouched, `border-color`/`box-shadow` on hover only; paint cost of `box-shadow` transitions needs a trace |
| **B6** Lenis only with `scroll-behavior` removal | — | Lenis not added; `html{scroll-behavior:smooth}` retained (and now also `data-scroll-behavior="smooth"`, which nothing reads → D-9) |
| **C1** one canvas, decorative, in-band | ◐ | 1 `<canvas class="ambient-canvas" data-state="fallback">` in the prerendered HTML, `aria-hidden` + `pointer-events:none` on the parent, 920 px band kept `[MEASURED-AK]`. **But** it paints *over* `.ambient-grid` (opaque context, later sibling, no z-index) → the grid the spec said to preserve disappears whenever GL is ready (D-3) |
| **C2** ≤8 KB gz, no 3D lib for ambient | ✅ | 1.5 KB gz lazy chunk `[MEASURED-AK]`; raw GLSL, zero vendor code |
| **C3** fallback on absent/failed/lost GL | ✅ | null context → `undefined` → `data-state="fallback"`; compile/link failure → `cleanup()`; `webglcontextlost` → `preventDefault()` + cleanup + CSS shows; *no* restore attempt = permanent CSS after a loss (safe, my spec allowed it). `[REPORTED-AC]` null-context E2E |
| **C4** loop stops when off-screen/hidden/reduced | ✅ | `IntersectionObserver` on the canvas + `visibilitychange` + the `no-preference` media query + `~20 fps` throttle (`now-last < 50`) + DPR cap **1.25** `[MEASURED-AK]` — the throttle is a nicety my own reference lacked |
| **C5** uniforms sample the CSS tokens | ◐ | re-reads `data-theme` on every draw via `MutationObserver(class, data-theme)` ✅ — but the **colours are hardcoded literals**, not `--accent`/`--bg` (D-13): a palette change silently desyncs the background |
| **C6** 3D optional, 0 KB on first load | ✅ | dynamic `import("./shelf-scene")` on click; the three chunk (`1gtgzv_8ud9w2.js`, 540,857 raw / **128.3 KB gz**) appears **0 times** in all 5 prerendered route HTML files, and the landing's 9 `<script src>` refs are exactly the 186.6 KB set `[MEASURED-AK]` — AC's own network-level E2E asserts the same thing, though note its regex (`/shelf-scene\|three/`) would not have caught that chunk by its hashed name |
| **C7** observable gate + visible control | ◐ | button + `role="status" aria-live="polite"` line exist and announce loading/ready/unavailable ✅; there is no *reason* string ("blocked because touch/reduced/…"), which is fine because nothing blocks by device — see §3.2 |
| **C8** no 3D text atlas | ✅ | 0 hits for `troika`/text-geometry; metadata stays DOM `[MEASURED-AK]` |
| **C9** one motion producer at a time | ◐ | ambient loop and shelf can be live together; bounded because the shelf is demand-only. Recommended: pause the ambient loop while the stage is on screen (2-line IO) |
| **D1** landing ≤300 KB gz | ✅ | **186.6 KB** JS-only / 200.4 with CSS `[MEASURED-AK]` |
| **D2** approved additions inside headroom | ✅ | shader +1.5 KB, three 0 KB initial, CSS motion +1.0 KB CSS; net −40.5 KB |
| **D3** no new dependency without AO approval | ◐ | `three` + `@types/three` added in the reviewed commit → **AO ratifies** (§3.4) |
| **D4** 0 `<img>`, ≤2 font files, swap+size-adjust | ✅* | 0 `<img>` `[MEASURED-AK]`; **3** font files instead of 2 — justified by A3, so I amend my own budget line rather than fail AC (C17); all 3 preloaded, `swap` + adjusted fallbacks measured |
| **D5** LCP/INP/CLS/long frames | 👁 | not measurable here; AC captured no numbers for these either (their E2E is functional, not performance) |
| **E1** reduced-motion honoured in all layers | ✅ | `<MotionConfig reducedMotion="user">` disappeared **with the library**, and the CSS/JS media queries now own it — a stronger guarantee (no JS needed to be quiet) `[MEASURED-AK]` |
| **E2** keyboard, focus ring, ≥44 px | ✅ | new card CTA `min-height:44px` (was 32), `.story-index a` 44×44, `.resource-card:focus-within{outline:2px solid var(--accent)}` `[MEASURED-AK]`; `[REPORTED-AC]` focus-restoration + tab-past-the-index E2E |
| **E3** pin must not change order; rail decorative | ✅+ | DOM order unchanged, steps are still `<article>`s with ids; the rail became a real `<nav aria-label="How it works chapters">` with `aria-current="step"` — **better than my instruction**, accepted (C18). Note the rail's `aria-current` starts on step 1 before any scroll (cosmetic inaccuracy, JS-free users see step 1 marked "current") |
| **E4** live result count | ✅ | now `aria-atomic="true"` and swaps to "Updating results…" while pending `[MEASURED-AK]` |
| **E4b** skeletons + root `loading.tsx` | ◐ | `/library` skeleton mirrors real geometry (search bar, sidebar, toolbar, 6 cards with cover + 4 lines) + `aria-busy` + `sr-only` status ✅; **still no `src/app/loading.tsx`** and `admin/loading.tsx` is the old spinner `[MEASURED-AK]` |
| **E5** forced colors / zoom / 320 px | ❌👁 | **0** `@media (forced-colors: active)` blocks in the source and built CSS `[MEASURED-AK]`; the ambient canvas and grid have no forced-colors treatment (in that mode the wash simply persists). Their own E2E covers 320/390/768 overflow `[REPORTED-AC]` |
| **F1** ≥12 records for design review | ◐ | 16 fixtures exist, idempotent, with a draft row and 5 document types ✅ — **but they only reach PGlite**; `src/data/presentations.json` is still **1** record, so an ordinary `npm run dev` review still sees one card (their own E2E expects `.resource-card` count 1) `[MEASURED-AK]` |
| **F2** empty/one/overflow reviewed | ◐ | empty state and one-item state exist and are tested; nothing at 12–48 items has been looked at by a human |
| **F3** search ordering + weighting resolved | ❌ | the RPC fixes featured-before-relevance ✅ but **omits the fields the fallback searches** and bypasses the index → **D-1 / D-2**; `embed_url like 'https://docs.google.com/%'` (pack delta A3) is untouched, so Dropbox rows still can never embed `[MEASURED-AK]` |

**Tally:** 22 PASS · 4 FAIL (A2, B1b, E5, F3) · 9 PARTIAL · 3 UNVERIFIED · 1 N/A — and the four fails are worth ≈ 40 lines of change between them.

---

## 5. Confirmed defects

| # | severity | defect | evidence | fix |
|---|---|---|---|---|
| **D-1** | **HIGH** (latent — activates with the migration) | `search_catalog`'s weighted vector covers only title / topic / keywords / tags / description. The app *prefers the RPC whenever it exists*, so after the migration is applied, a query that matches **semester, document_type, platform, subject or course** returns **nothing**, while the same query works in compatibility mode today | `[MEASURED-AK]` PGlite @4,016 published rows: `"Sem 2"` → RPC **0** vs the existing `search_vector` **1,032**; `"Google Drive"` → **0** vs **4,000**; `"Worksheet"` → 4,002 vs 4,003. `src/lib/search.ts` weights a 0.35 group of exactly those fields, so the two modes disagree | add a `C`-weight group (subject/course names via the existing joins, semester, document_type, platform); assert it in `tests/database/search-ranking.test.ts` with one "Sem 1" and one "Worksheet" query |
| **D-2** | **MEDIUM** | the ranking path is not index-backed: it re-tokenises every published row on **every** query, and Postgres will not let you index that expression | `[MEASURED-AK]` **281 ms** per call at 4,016 rows (still 95 ms for a term with **zero** matches); the same predicate against `documents_search_idx` = **1.9 ms**. `create index … using gin ((setweight(…)))` → `42P17 functions in index expression must be marked IMMUTABLE`, with or without an `'A'::"char"` cast, and `… generated always as (setweight(…)) stored` → **also 42P17**. (The `total` sub-select does *not* double the cost — measured 95.4 vs 95.3 ms, so the CTE is reused) | **filter on the indexed column, rank on the weighted expression**: `where d.search_vector @@ q.tsq` then `ts_rank(weighted_expr, q.tsq)` in the ORDER BY only over survivors — measured **1.7 ms** for the same selective term (**57×** faster), and it needs no new index. At today's 17 rows the RPC is 1.9 ms, so this is a scale fix, not an emergency — but it must land before the migration is applied to a real collection |
| **D-3** | MEDIUM (design fidelity) | the GL layer **hides the grid**: `alpha:false` opaque shader output, `.ambient-canvas` after `.ambient-grid` in the DOM, no `z-index`, so when GL is ready the 80 px grid the spec said to keep is covered (15 % bleed-through at `opacity:.85`) | `[MEASURED-AK]` source + built CSS ordering | `.ambient-grid { z-index: 1 }` (or `alpha:true` + drop the base-colour mix). Then PO should say whether "shader replaces the wash" or "shader sits under the wash" is the intended look |
| **D-4** | MEDIUM | **shelf context-loss after a successful load leaves dead UI**: `lost` handler calls `dispose()` and sets `host.dataset.state`, but React state stays `"ready"` → empty 260 px stage, button stuck on "3D shelf loaded"/disabled, status line still says "Drag to rotate", no poster returns | `[MEASURED-AK]` `shelf-scene.ts` (DOM write, no `setState`) vs `OptionalShelf.tsx` (all UI driven by `state`) | pass `onFallback: () => setState("fallback")` into `mountShelf` and call it from `lost`; add the missing E2E case (their current test covers only null-context-at-init) |
| **D-5** | MEDIUM (needs PO) | typography role reversal: **all `h1`/`h2` are now Newsreader** while the approved spec pinned Geist for headings and Newsreader for emphasis. Consequences: the hero's sans/serif tension is gone (h1 and its `em` are both serif), the roman face became load-bearing on every page (fonts 91.7 → 148.4 KB), and `.optional-shelf h3` opts back into serif, so `h3` is sans everywhere except inside the shelf | `[MEASURED-AK]` built CSS `h1,h2{font-family:var(--font-editorial)}` + `.optional-shelf h3{font-family:var(--font-editorial)}` | PO picks one: (a) keep AC's serif-display system and I re-pin the spec (it is a coherent premium choice); or (b) restrict `var(--font-editorial)` to `em`/quotes/`.step-number` as approved and re-tune weights. Either way, unify the `h3` exception |
| **D-6** | LOW | motion vocabulary never landed: 0 `--motion-*` / `--ease-*` / `--move-*` tokens while 20+ rules hardcode `.15s/.18s/.2s/.25s/.6s` and `translateY(14px)`; `.2s` and `.18s` coexist for the same hover family | `[MEASURED-AK]` built-CSS regex counts | 5 lines in `:root`, then point the new rules at them. Do **not** rename AC's `--text-*` to my `--step-*` — the pack adopts AC's names instead (C17) |
| **D-7** | LOW | the stagger is a no-op, and the pinned steps animate twice: `animation-delay` is ignored on a scroll-progress timeline (per spec, `animation-range` is the mechanism), and both `.reveal` and `.how-step` run `reveal-in` | `[MEASURED-AK]` `Reveal.tsx` sets `--reveal-delay`; `.reveal{animation-delay:var(--reveal-delay,0s)}` inside `@supports (animation-timeline:view())` | remove the wrapper `Reveal` for the three steps; if a stagger is wanted, vary `animation-range: entry 5%/15%/25%` per step |
| **D-8** | LOW (WCAG 1.4.3, transient) | `.library-results[data-pending]{opacity:.72}` puts `--text-muted` text at **4.15:1** on `--bg` — under 4.5:1 for normal-size text; the muted colour is used by `.resource-description` (12px) and `.resource-topic` | `[MEASURED-AK]` computed from the tokens; `.75` → 4.44 (still fails), **`.8` → 4.90 passes** | `.8`, or dim only non-text layers, or swap the dim for the existing skeleton + `aria-busy` |
| **D-9** | LOW | comments promise what the code doesn't do: `HeroVisual` claims a CSS parallax that doesn't exist; `data-scroll-behavior="smooth"` is read by nothing; `OptionalShelf`'s comment claims the poster is the fallback "for mobile, reduced-motion" while mobile/reduced users simply get the button too (which is fine — see §3.2) | `[MEASURED-AK]` greps of built CSS + source | fix the three comments, or add the ~6-line parallax rule |
| **D-10** | LOW | no `@media (forced-colors: active)` support for the two decorative layers | `[MEASURED-AK]` 0 hits in source and built CSS | 3 lines: hide `.ambient-canvas`/`.ambient-grid`/`.skeleton::after` in forced-colors |
| **D-11** | LOW | GL paths don't refuse software rendering | `[MEASURED-AK]` no `failIfMajor` in either `getContext`/`WebGLRenderer` options | `failIfMajor: true` (and `powerPreference:"low-power"` is already set on both ✅) |
| **D-12** | INFO | `page_size => null` yields the **48-row clamp**, not the 12 default (`least`/`greatest` skip NULLs); `page_offset => null` → 0 ✅; injection-shaped and unbalanced-quote inputs return 0 rows with no error and no table damage | `[MEASURED-AK]` 8 edge-case probes | `coalesce(page_size,12)` if the default matters; note the NULL-skip behaviour in the function comment |
| **D-13** | LOW | shader colours are duplicated literals, not sampled from `--accent`/`--bg` (spec C5); base is `#050664`-ish (`.02,.025,.045`) rather than `--bg #090b10`, which is a *look* choice, but the duplication is the maintenance risk | `[MEASURED-AK]` `accent()` in `ambient-shader.ts` | read `getComputedStyle(documentElement).getPropertyValue('--accent')` once per theme change (cache it; ex11 has the parse helper) |
| **D-14** | INFO (pre-existing) | 113 font-size declarations < 12px (46 < 10px, **19 ≤ 8px**: `.paper-bottom` 6px, `.compatibility > p` 7px, eyebrows 7–8px); `embed_url` CHECK still forbids Dropbox embeds; `src/db/schema.ts` is still `export {}`; micro-typography is a legibility question the pack already raised | `[MEASURED-AK]` counts from `globals.css`; A3 unchanged from `AC_BRANCH_DELTA.md` | not part of this diff; keep on the AO list so it isn't lost |

**Credit where it's due (measured, not vibes):** transform-only reveals (so a failed animation can never hide content, and axe contrast stays clean); demand-rendered 3D with full `geometry/material/renderer.dispose()`; `~20 fps` throttle + DPR 1.25 + `powerPreference:"low-power"` on the ambient loop; idle-ordered dynamic import for the shader; card CTA raised to 44 px with a `focus-within` outline and a single tab stop per card; skeletons that mirror the real geometry; a `nav` chapter index whose focus behaviour is *tested*; and an E2E assertion that the 3D chunk isn't requested on first load — that last one is exactly the check my spec asked for, written as a test.

---

## 6. Search migration assessment (`202611020001_search_ranking.sql`)

**Do not apply as written. Fix D-1 + D-2 first; everything else about it is good.**

| aspect | finding |
|---|---|
| SQL correctness | ✅ It *runs*: both migrations + both seeds applied cleanly in PGlite in AK's independent harness, and AC's **21/21** DB tests + **35/35** unit tests **pass when AK re-ran them** `[MEASURED-AK]`. Ranking assertions (title beats body/tags, featured does not outrank relevance, drafts excluded, title/newest sorts) are genuine, and 8 hand-run edge probes produced no error, no injection, no table damage |
| Ranking behaviour | ◐ `setweight` A/B/D + `ts_rank` + `websearch_to_tsquery('simple')` is the right shape (quoted/unbalanced input is handled gracefully `[MEASURED-AK]`). Two flaws: the field set omits the searchable facets (**D-1**), and `'simple'` means no stemming — `"searching"` never matches `"search"`, which for a study-resource hub (singular/plural titles) is a visible limitation. Consider keeping `'simple'` for the index and adding `plainto`/`english` only inside `ts_rank`, or a `pg_trgm` fallback for zero-result recovery (the playbook's "zero-result recovery" recipe) |
| Indexes | ❌ the weighted vector can't be indexed at all (**D-2**, `42P17` measured on both the expression-GIN and the generated-column route), so the query is a per-row scan; the *existing* `documents_search_idx` GIN is bypassed even though it covers all the fields AC needs. The "filter indexed, rank weighted" rewrite fixes both problems with no DDL |
| RLS / security | ✅ `security invoker` + `set search_path = ''` + `stable` + fully qualified references; `revoke all … from public` then `grant execute` to `anon, authenticated` only — consistent with `202611010002_least_privilege_catalog_grants.sql`. Verified as `anon` with empty JWT claims: the RPC returns 0 for "draft", never surfaces `fixture-draft-hidden`, and `count(*)` on `documents` as `anon` sees only the 4,016 published rows `[MEASURED-AK]` → no count leak, no draft leak, no privilege widening. No new write path, no policy change, no trigger |
| Hosted-schema compatibility | ◐ depends only on `documents`/`subjects`/`courses` columns that exist in the applied migration ✅, and returns the same `subjects`/`courses` **object** (not array) shape PostgREST gives for to-one relations, so `normalizeRow` maps cleanly ✅. `create or replace` is idempotent, so re-running is safe. It does **not** touch `search_vector`, so the hosted generated column and its GIN stay intact ✅ |
| Rollback | ✅ genuinely easy: `drop function public.search_catalog(text, uuid, uuid, text, text, text, text, boolean, text, integer, integer);`. Because `catalog.ts` treats a missing/erroring RPC as "use the old path" (PostgREST answers `PGRST202`, `ranked.error` is set, the code falls through to `textSearch`), rollback needs no redeploy — that is the strongest part of the design. The page-correction retry (`if (page !== filters.page)`) does mean a rollback mid-session yields one extra round-trip; harmless. There is no `down` file, so state the drop command in the PR description |
| App-side note | ⚠️ the RPC path also **drops the `limit`-clamped palette behaviour's featured-first ordering** in favour of relevance (intended ✅) but on failure it now orders by `title`, i.e. losing featured-first for that request only `[MEASURED-AK]` — acceptable; worth one code comment |
| Test fixtures | ✅ `seed.test-fixtures.sql` is clearly labelled, `on conflict do nothing`, idempotent (AC's test re-applies it and asserts 16), never touches the production seed, and the 16 rows include a draft + five document types. Two gaps: no zero-description row, no 150-char title, no non-Google `original_url` — i.e. the edge cases D-AK's F1 asked for aren't in the fixture set, and the fixtures never reach a browser (`presentations.json` is still 1 record) |

---

## 7. Browser / device testing that is still required

`[UNVERIFIED]` for AO/AC — none of it closable in AK's sandbox (no browser binary, no GPU, no AT, Playwright CDN off the allowlist; AC's own Chromium run is `[REPORTED-AC]`, not reproducible here):

1. **Ambient look, both themes** — is the shader's wash *the* hero light (D-3/D-13)? Does the 20 fps throttle read as alive or as a slow crossfade? `?fallback=1` equivalent: DevTools "Rendering → Emulate vision deficiencies" + disable WebGL.
2. **Pinned story on non-Chromium** — Safari/Firefox have no `animation-timeline: view()`: confirm the stacked fallback is *pleasant*, not broken, and that `.story-index` still scrolls correctly with `scroll-behavior:auto` under reduce.
3. **GPU/thermal on low-end Android** — 10 minutes with the ambient layer on; watch for the software-GL case D-11 addresses.
4. **Forced-colors + 200 % zoom + keyboard-only walk** of the pinned section and the shelf (D-10).
5. **AT pass (NVDA/VoiceOver)** — the chapter `nav` (`aria-current="step"` semantics), the "Updating results…" announcement cadence, and the shelf status line transitions.
6. **Post-context-loss UI** — sleep/wake or `chrome://flags` GPU reset with the shelf open (D-4).
7. **Real Lighthouse/LCP/INP/CLS** on the landing page (D4 row: the roman Newsreader now matters here), and a 12–48-record fixture run in a browser so the card grid, `--text-h3` clamp and footer wrapping get judged on real data (F1/F2).
8. **Axe in the *pending* state** (D-8) — their axe run is on a settled page.

---

## 8. Recommended corrections, in priority order

| # | action | owner | size |
|---|---|---|---|
| 1 | **Gate the migration.** Do not apply `202611020001_search_ranking.sql` until D-1 is fixed (add the C-weight facet group + two DB test assertions). Until then the app runs the fallback path, which is already correct | AC (+AO approval to apply) | ~6 lines SQL + 2 test lines |
| 2 | **Make the ranking query index-backed** — `search_vector @@ tsq` for filtering, `ts_rank(weighted)` for ordering (measured 57× faster, no DDL, and it makes D-1 impossible to re-introduce because the filter uses the shared column) | AC | rewrite of one CTE |
| 3 | **Keep the grid visible / decide the layering** (`.ambient-grid{z-index:1}`) and put PO's eyes on the shader in both themes (D-3) | AC → PO | 1 line + review |
| 4 | **Shelf: fall back on context loss** via `onFallback` + one E2E case (D-4) | AC | ~5 lines |
| 5 | **PO ruling on D-5** (serif headings vs emphasis-only), then unify `.optional-shelf h3` and re-pin my spec's §1 accordingly either way | PO → AO | decision |
| 6 | **`failIfMajor:true`** on both GL call sites; add the `projector-mode` check to the shelf (D-11, §3.2) | AC | 2 lines |
| 7 | **Fix the double-animated steps and the dead stagger** (D-7), and raise `data-pending` opacity to `.8` or dim non-text only (D-8) | AC | ~4 lines |
| 8 | **5 motion tokens** + point the new rules at them; leave the px ladder alone (D-6) | AC | 5 lines + edits |
| 9 | **`@media (forced-colors: active)`** block for the decorative layers (D-10) | AC | 3 lines |
| 10 | **Comment truthfulness** (D-9) — either implement the hero parallax in CSS or delete the claim; drop the unused `data-scroll-behavior` | AC | 3 lines |
| 11 | **Make the design reviewable in a browser**: 16-row fixture set reachable from `src/data/presentations.json` (compat mode) or a `?fixture=1` dev-only switch, plus a root `loading.tsx` (F1, E4b) | AC | small |
| 12 | Keep the pre-existing items on the AO list so they aren't lost with this diff: `embed_url` Dropbox CHECK (pack delta A3), micro-typography ≤8 px (D-14), `src/db/schema.ts` stub | AO | policy |

## 9. What I changed, and what I owe my own documents

I did not touch AC's branch. My pack needs three corrections (recorded in `VERIFICATION_LOG.md` as C15–C18, with the spec/checklist lines amended in place, not deleted):
- **C15** — the "`framer-motion/mini` + `LazyMotion` = −15.2 KB" line was **mislabelled**; `/mini` exports only `useAnimate` (3.1 KB). AC verified this and beat the recommendation by removing the library. `RECOMMENDED_STACK.md`, the blueprint's motion row and checklist B3 get corrected.
- **C16** — my 3D gate list was over-specified for a click-to-load, demand-rendered scene. Explicit intent + null-GL fallback + poster + `failIfMajor` is the right set; `deviceMemory`/`pointer`/width gates are dropped. `ex11`'s `sceneGate()` will be revised to match AC, and the spec's §4 rewritten.
- **C17** — my "≤2 font files" budget line is superseded (3 preloaded files with adjusted fallbacks is the better answer once roman Newsreader is in use), and my `--step-*` naming should adopt AC's `--text-*`.
- **C18** — checklist E3's "rail must be decorative" is replaced by AC's tested, keyboard-operable chapter `nav`; my spec's "steps must not be animated twice" (B1b) is meanwhile **confirmed as a real defect in AC's code** — the warning was right, just in a different direction.

## 10. Acceptance recommendation

**ACCEPT WITH CONDITIONS.**

Conditions to close before the design work is called done: **1, 2, 3, 4** from §8 (migration gating + D-1/D-2 before it lands, ambient layering, shelf context-loss fallback) and **5** (PO ruling on D-5, which changes the spec rather than the code). Items 6–11 are quality work that can ride with the next frontend PR.

**Not accepted as evidence, and correctly not claimed as such by AC:** any visual, GPU, AT or performance assertion. AC's own document says "Verified in headless Chromium only" and lists the same gaps — the self-report matches the artefacts I could inspect (17 E2E tests exist with the claimed names; the before/after route numbers are internally consistent; the audit counts reproduce exactly), which is the behaviour I want to keep rewarding.
