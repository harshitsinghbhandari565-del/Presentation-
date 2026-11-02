# AC app, measured — production build run by AK

**AK · 2026-11-02 · `[MEASURED]`** — the pack's first real, app-level numbers instead of bundler estimates.

## 0. Method (so the numbers can be reproduced or disputed)

| step | detail |
|---|---|
| source | `codeload.github.com/…/tar.gz/refs/heads/AC-Branch` → tip `cac9c7f145abe99bd12a8831cc371e370fbe35d5`, extracted to `/home/user/scratch/Presentation--AC-Branch` (1.0 MB) — **outside the repo; the repo working tree and AC's branch were never touched** `[VERIFIED-ENV]` |
| install | `npm ci` from AC's committed lockfile → 424 packages, 16 s |
| build | `npx next build` → **Next.js 16.4.3 (Turbopack)**, compiled in **10.6 s**, TypeScript passed, 11 static pages generated, **exit 0** `[MEASURED]` |
| env | no `.env*`, so `getPublicClient()` → null → the **"compatibility" catalog mode** (1 legacy record) is what prerendered; Supabase-mode pages were not exercised |
| JS accounting | for every prerendered route HTML under `.next/server/app/**`, summed the gzip of each `/_next/...` asset it references (this is Next's own "First Load JS" definition, computed independently) |
| caveat | CSS/JS are **gzip, not brotli** — a brotli transfer would read ~15–20 % lower; the relative comparisons and the headroom arithmetic are unaffected |

## 1. First Load JS per route (the number that changes decisions)

| route | assets | disk | **gzip** |
|---|--:|--:|--:|
| `/` (landing) | 12 | 785.9 KB | **240.9 KB** |
| `/resources/[slug]` | 12 | 778.0 KB | **238.1 KB** |
| `/subjects` | 11 | 759.7 KB | **231.1 KB** |
| `/about` | 10 | 643.1 KB | 193.2 KB |
| `/_not-found` | 10 | 643.1 KB | 193.2 KB |
| `/presentation/[slug]` (legacy) | 6 | 543.1 KB | **167.2 KB** |
| shared runtime (`rootMainFiles`, 5 files) | 5 | 433.1 KB | **128.8 KB** |
| **all client JS in the build** | 21 | 1,053.2 KB | 323.0 KB |
| CSS (`03o2mpyuufqhr.css`) | 1 | 61.1 KB | **12.8 KB** (~7 KB brotli) |
| fonts (2 woff2, self-hosted) | 2 | 91.7 KB | (woff2 is already compressed) |

**Read this before spending any motion budget.** The pack's Phase-1 guidance was "target < 300 KB gz total JS". Landing is **already at 240.9 KB**. The remaining headroom is **~59 KB**, i.e.

| addition (measured in `prototype-lab/measurements.json`) | size | verdict at 240.9 KB base |
|---|--:|---|
| `framer-motion/mini` + `LazyMotion` instead of the root import | **−15.2 KB** | ✅ pays for itself before anything else is added |
| Lenis | +5.3 KB | ✅ trivial |
| GSAP core + ScrollTrigger | +44.4 KB | ⚠️ fits (≈ 285 KB) **only if** the mini swap or another trim lands first |
| GSAP + ScrollTrigger + Flip + SplitText | +56.1 KB | ⚠️ ≈ 297 KB — at the ceiling, not over it, but no room for anything else |
| three + R3F (the ex06 particle field chunk) | +192.2 KB as a *separate* chunk | ❌ as first-load; ✅ **acceptable as a dynamic-imported, gated chunk** — it stays out of First Load JS, but costs ~1.5–3 s of extra download on slow 4G and a real parse/compile hit, which is exactly why the blueprint gates it behind `lg` + capability + `no-preference` |
| `@react-three/postprocessing` | not measured (rejected on cost) | ❌ |

**Consequence for `PERFORMANCE_BUDGETS.md`:** the 300 KB target is no longer a wish — it is a *measured* ceiling with 59 KB of slack, and the pack should treat "Tier 0 only" as the state that keeps the app inside it.

## 2. What the build proves about AC's architecture (all `[MEASURED]` + `[VERIFIED-FILE]`)

| observation | evidence | meaning for the pack |
|---|---|---|
| `/` prerenders as **ISR with `revalidate: 1m`**, and its HTML already contains `<h1>Less searching.<br/>More <em>learning.</em></h1>` | build route table + prerendered HTML | **R1 is fully shipped.** LCP is a text element in the initial HTML; there is **no `<img>` on the landing page at all** → the LCP risk is font swap + hero-visual layout, not image weight. Phase 1's "client-fetched landing page" premise is closed |
| `/resources/[slug]` is SSG from `generateStaticParams`; `/robots.txt` + `/sitemap.xml` exist; middleware proxy present | build route table | share/SEO surface is real → the blueprint's "detail page must render without JS" requirement is met by construction |
| Dynamic routes for admin (`ƒ /admin*`) + `access-denied` + `logout-error` | build route table | the **`/admin` surface is 7 route files** — the design-system gap I flagged in `AC_BRANCH_DELTA.md` §4 step 7 is confirmed by the build graph |
| `html { scroll-behavior: smooth; scroll-padding-top: 105px }` at globals.css:60, plus `@media (prefers-reduced-motion: reduce)` that sets `scroll-behavior: auto`, `.01ms` durations, kills `.floating-chip`, and disables `transform` on `:hover` — and a separate `@media (hover: none)` block | `[VERIFIED-FILE]` lines 60, 359, 360 | AC's reduced-motion handling is **better than most of what the pack assumed**: the Lenis/`scroll-behavior` conflict is already guarded for `reduce`, and hover effects are already disabled on touch. Two pack lines need softening (see §4) |
| Fonts: `@font-face` families emitted are `editorial`, `editorial Fallback`, `geist`, `geist Fallback`, with `size-adjust: 89.08%` + ascent/descent overrides, `display: swap`; `.wW1iHW_variable{--font-editorial:"editorial","editorial Fallback"}` | the 61 KB built CSS | metric-adjusted fallbacks **are** in place → the CLS-on-font-swap worry from Phase 1 §5.5 is largely answered. Note only the **italic** Newsreader file ships (63 KB) and no roman → any non-italic editorial use selects the italic face (e.g. `.visual-caption`) |
| Landing HTML: `aria-live` count **0**, no skeleton markup, skip-link present, `--font-*` not inline-styled | prerendered HTML | **R7/R8 remain unimplemented** (live regions for result counts; skeleton states) — these are the two concrete a11y items left for AC that AK can point at with file evidence |

## 3. New measured baseline AO can quote

| metric | status |
|---|---|
| Build health | ✅ `next build` exit 0, TS clean, 11 pages prerendered, 10.6 s compile |
| First Load JS, landing | **240.9 KB gz** (budget: ≤ 300 KB) → **19 KB of slack after any Tier-1 add-on must be re-checked** |
| CSS | 12.8 KB gz for a 61 KB stylesheet (single file, no per-route splitting) |
| Fonts | 91.7 KB in 2 files, self-hosted, `swap` + adjusted fallback metrics |
| Rendered motion today | 2 `@keyframes` (`float`, chip), 3 `backdrop-filter`, 0 `animation-timeline`, **0 `<canvas>`**, 0 JS scroll libraries |
| Data | Supabase catalog = **3 seeded documents** (`supabase/seed.sql`, 3 inserts); compatibility fallback = **1** (`src/data/presentations.json`) |
| Not measurable here | Lighthouse/LCP/INP/CLS values, fps, GPU, memory — no browser binary, no network to Vercel, and the app needs Supabase env vars to exercise its real data path |

## 4. Corrections to what AK wrote earlier today (same session, same evidence)

| was | now | why |
|---|---|---|
| `AC_BRANCH_DELTA.md` §2 **A1**: "the editorial face is not applied anywhere" (severity: high) | **downgraded to fragility/dead-code, not a live typography bug.** next/font's generated `.wW1iHW_variable` rule (unlayered) defines `--font-editorial` on `<html>`, so descendants inherit a valid value; the `@theme` self-reference is a no-op override that only becomes dangerous if the `variable:` name ever changes. Fix stays one line (`--font-editorial: "editorial", Georgia, serif` or reference the fontsource variable) and it also documents intent | built CSS inspection (§2 row 5). This is the first time the pack could check it, because the built artifact exists only after a real `next build` |
| **A4**: "`supabase/seed.sql` contains 0 insert rows ⇒ the empty state is the default screen" | **wrong count — 3 inserts.** Correct claim: the collection is **3 documents in Supabase mode, 1 in the compatibility fallback**, so a design review still cannot exercise faceting, pagination or the grid, but the app does not open on an empty DB | my first grep counted only lines starting with `(`; the file uses `insert into … values (…)` |
| Phase 1 `animation-guidelines.md` §5 / `interaction-breakdowns.md` §1: "reduced-motion block strips animations at 0.01 ms; the curtain must not be visible by default; `scroll-behavior:smooth` must be deleted when Lenis lands" | AC already ships **`scroll-behavior: auto` under `reduce`** and a `hover: none` block, so the Lenis conflict is *partially* pre-mitigated — the remaining requirement is the **non-reduced** desktop path (Lenis + `html{scroll-behavior:smooth}` still coexist) | `[VERIFIED-FILE globals.css:359]` |
| "target < 300 KB gz" (a wish) | a **measured** ceiling with 59 KB of slack, itemised in §1 | this file |

## 5. What AC should do first, now that sizes are known

1. **`framer-motion/mini` + `LazyMotion({features: domAnimation})`** — measured −15.2 KB, no new dependency, buys back most of the headroom for everything else.
2. **A2 (search weighting) + the 3→12-row seed** — design review of a grid against 1–3 records is not review.
3. **`aria-live` on result counts + skeleton blocks** (§2 last row) — the only accessibility items the built HTML proves are missing.
4. Then Tier-0 motion (tokens, reveals, `@supports`-guarded scroll-driven), then decide D3/D4 with the arithmetic in §1 in front of you.

*Machine evidence lives in this file only — the build output was in `/home/user/scratch/` (scratch, not persisted as a deliverable). AO/AC can reproduce it in three commands, listed in §0.*
