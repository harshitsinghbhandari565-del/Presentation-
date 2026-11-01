# AC_IMPLEMENTATION_PLAYBOOK

### Premium frontend for the Harshit Presentation Hub — the evidence-backed build plan

**Author:** AK (Agent Knowledge) · **Research date: 2026-11-01** · **Repo:** `harshitsinghbhandari565-del/Presentation-` · **Docs root:** `frontend-intelligence/`
**Audience:** AC (coder). This is the only file AC needs to start; everything else is a citation.
**Status:** research + recommendations. **No application code was modified by AK** (branch rules), and nothing here is merged.

> **Evidence tiers used throughout.** `[VERIFIED-FILE]` = a line of this repo, path + content checked on 2026-11-01 · `[VERIFIED-API]` = live npm registry / GitHub API fact of the same date (versions, licences, stars, last push) · `[VERIFIED-DOC]` / `[VERIFIED-FETCH]` = official docs page or fetched listing read directly · `[VERIFIED-README]` = repo file read through the API · `[REPORTED]` = secondary source (blog/roundup) · `[AK-RECOMMENDATION]` = judgement, not fact · `[UNVERIFIED-*]` = asserted but not confirmed — **do not ship on these**.
> Nothing in this pack is copied code: every snippet is AK-authored pseudocode and is `[UNVERIFIED-CODE]` by definition. Verify signatures at install time.

---

## 1. What AC is actually working with (ground truth)

Do not trust the product brief for the stack; trust this table (full detail: `audit/stack-audit.md`).

| Fact | Value | Evidence |
|---|---|---|
| Framework | Next.js **16.2.6** App Router, `next.config.ts` empty, **no lockfile committed** | `[VERIFIED-FILE package.json]` `[VERIFIED-FILE]` |
| React | **19.2.6** | `[VERIFIED-FILE]` |
| Styling | **Tailwind v4.1.17** (`@import "tailwindcss"` + `@theme`), no `tailwind.config.*` | `[VERIFIED-FILE]` |
| Animation | **framer-motion ^12.43.0** only (latest is 14.9.0) | `[VERIFIED-FILE]` `[VERIFIED-API]` |
| 3D / smooth scroll / text split | **none** (no `three`, no `@react-three/fiber`, no `gsap`, no `lenis`) | `[VERIFIED-FILE]` |
| Icons | `lucide-react ^1.28.0` | `[VERIFIED-FILE]` |
| Data | `src/data/presentations.json` = **1 record** (subject `English`); `src/db/schema.ts` = `export {}`; `src/db/index.ts` = `pg` pool on `DATABASE_URL`, **throws if unset** | `[VERIFIED-FILE]` |
| Backend reality | **no Supabase / no admin / no auth anywhere** (grep: 0 hits), no `.env*`, no `.github/` | `[VERIFIED-FILE]` |
| App size | 26 source files, ~1,861 LOC | `[VERIFIED-FILE]` |
| Landing page | `"use client"` + `useEffect` fetch + 12-col bento + Motion stagger `duration: 0.4` | `[VERIFIED-FILE src/app/page.tsx]` |
| Existing a11y | skip-link, global `:focus-visible`, `[tabindex]` ring, reduced-motion kill switch, semantic landmarks | `[VERIFIED-FILE src/app/globals.css]` |
| Document data keys | `id,title,subject,topic,description,platform,url,presentUrl,embedUrl,backupLinks,tags,pinned,accent` — **no semester, no course, no documentType** | `[VERIFIED-FILE src/types/presentation.ts]` |

**Two structural constraints that shape everything below:**

1. **1 record.** A showcase for a collection is impossible until the collection exists. Any design whose value depends on many items must degrade gracefully at N=1 — and the *real* premium signal at N=1 is states, typography and speed, not density.
2. **Faceted discovery needs fields that don't exist.** The mission's feature list (subjects × courses × semesters × topics × doc types) requires `course`, `semester`, `documentType` (+ a real DB or Supabase table). That is **AO decision D1** (schema) and blocks Phase 4 — it is not something frontend polish can substitute for.

## 2. Visual direction (the 12-line version)

Full spec: `design-system/visual-direction.md`.

**A reading room with a projector.** Dark-first `#050505`, Newsreader (editorial) for titles + Geist (UI) for everything else, indigo/emerald accents already tokenised. Premium comes from **type scale, spacing rhythm, elevation via 1 px borders + inset highlights, and timing** — the existing `glass-card` / `glass-card-utility` / `glass-card-featured` (160° gradient wash + `::before` hairline + `::after` radial ambient) and `mesh-blob` (30/35/40 s float) layers are already the right vocabulary; keep and formalise. **Never** neon-gradient SaaS, aurora-everywhere, glass-on-glass, or a purple AI look. Add `@property`-registered spotlight + mask-based reveals for texture (0 KB). Projector mode is the brand: promote it to a third theme.
**Hard prerequisite:** the light theme is currently ~15 `!important` overrides on *arbitrary hex utilities* (`.bg-\[\#050505\]` etc.) `[VERIFIED-FILE globals.css]`, and `--font-editorial` is redefined by the app while `next/font` also owns it (audit §5.5). Fix both first — otherwise every premium layer inherits a fragile base.

## 3. Stack decision (final)

| Layer | Decide | Version (2026-11-01) | Licence | Phase |
|---|---|---|---|---|
| Framework | keep Next App Router, **upgrade `next` 16.2.6 → 16.4.3**, `react`/`react-dom` 19.2.6 → **19.3.1** (stable `<ViewTransition>`, zero config) | `[VERIFIED-API]` | MIT | 0 |
| Styling | keep Tailwind v4; refactor tokens per **R2**; no `tailwind.config.*` | 4.1.17 → optional 4.3.3 | MIT | 0–1 |
| Motion (UI state) | keep **Motion**; upgrade `framer-motion` 12 → **14.9.0** (or adopt `motion` 14.x naming) | `[VERIFIED-API]` | MIT | 1 |
| Scroll (scenes) | add **GSAP 3.15.0 + ScrollTrigger** (same package; `Flip`, `SplitText` also included free since 3.13) + `@gsap/react@2.1.2` `useGSAP` | `[VERIFIED-API]` `[VERIFIED-DOC]` | **Standard "no charge"** (free for internal use; **paid only for client work**) — no `.npmrc`, no `gsap-trial` | 2 |
| Smooth scroll | **Lenis 1.3.27** + `lenis/react`, gated to `lg+` & `no-preference` | `[VERIFIED-API]` `[VERIFIED-DOC]` | MIT, zero deps | 3 |
| Route/element morph | **native View Transitions** (React 19.3) — **no library** | `[VERIFIED-DOC]` | — | 1 |
| Reveals / progress | **CSS scroll-driven** behind `@supports (animation-timeline: view())` | `[VERIFIED-FETCH MDN]` (Chrome/Edge 115, Opera 101, Safari 26, iOS 26, Samsung 23, **Firefox 159**, *not* Baseline) | — | 1 |
| 3D (optional) | `three@0.187.0` + `@react-three/fiber@9.8.2` + **only the drei pieces used**; `WebGLRenderer` (not WebGPU); R3F peer ceiling **`react >=19 <19.4`** | `[VERIFIED-API]` | MIT | 5, needs AO approval **D3** |
| 3D text | `troika-three-text@0.52.5` or `drei/text` | `[VERIFIED-API]` | MIT | 5 |
| Post-processing | **skip** `@react-three/postprocessing@3.2.2` (bundle + no React 19 guarantee); if ever needed `postprocessing@6.39.6` | `[VERIFIED-API]` | Zlib | — |
| Assets/motion design | prefer code; `rive-react` if interactive; **avoid** `@splinetool/react-spline` (no licence, last publish 2025-07-15) and `@theatre/core` (2024) | `[VERIFIED-API]` | MIT / — | 5 |
| Command palette | consider `cmdk@1.x` (13,057★, MIT, last push 2025-10-29) in Phase 3, **not** Phase 1 | `[VERIFIED-API]` | MIT | 3 |

**Do not add:** `react-merge-refs` (dead: last version 2.0.2, 2024-04-09 `[VERIFIED-API]`), `@react-three/drei` wholesale, `@react-three/uikit` (custom licence), `gsap-trial`, `locomotive-scroll`, `smooth-scrollbar`, GSAP `ScrollSmoother` (Club-only), `@view-transitions/react` (**does not exist on npm** `[VERIFIED-API]`), `next-view-transitions` (superseded by native VT, 2,381★ but 2024-era `[VERIFIED-API]`), Spline/Theatre (`RESEARCH_INDEX.md` §6).

## 4. Landing-page section architecture

`src/app/page.tsx` is today a single client bento: hero → stats strip → featured card (`col-span-8`) + subject-focus tile → search bar + filter chips + document grid → "All subjects" tile + quick-links, with `<AmbientBackground/>` behind and a sticky 64 px header (`[VERIFIED-FILE]`). Keep the bento *language*; add rhythm and states.

| # | Section | Job | Content / data | Layout | Notes |
|---|---|---|---|---|---|
| 0 | Skip link + sticky header | orientation | logo (existing `font-editorial` wordmark `[VERIFIED-FILE layout.tsx]`), ⌘K trigger, theme, projector | 56 px base / 64 px `lg` | header gets a 2 px scroll-progress hairline *outside* the blur; skip-link must stay visible above it |
| 1 | **Hero** | voice + one action | "Harshit Presentation Hub" as a statement; 1-line value prop; primary CTA *Browse presentations*; secondary *⌘K* | base: text-only, `lg`: 2-col with featured tile | the only place a reveal curtain is allowed (≤ 900 ms, `sessionStorage`-gated) |
| 2 | **Find** (search + facets) | the product's core task | `SearchBar` + `SubjectChips` → expand to `Subject · Course · Semester · Topic · Type` + result count + `Clear` | `lg`: left facet sidebar; base: input + "Filters (n)" → bottom sheet | visible input always (never icon-only `[REPORTED S13]`); multi-select, applied on click, no "Apply" button on desktop |
| 3 | **Featured** | one curated path | existing `FeaturedPresentation` / `pinned` flag `[VERIFIED-FILE]` | `col-span-8`, `--radius-2xl`, spotlight ring | the `::before/::after` ambient already exists — formalise as the "featured" layer, don't add a 4th tier |
| 4 | **Browse grid** | scan + open | `DocCard` list from `filterDocuments` (`src/lib/search.ts`) | 1 → 2 → 3 cols (`col-span-4` at `lg`) | Flip relayout on filter; `aspect-ratio: 16/9` media block; **load-more, not infinite scroll** `[REPORTED S13]` |
| 5 | **Subjects** | wayfinding | existing `SubjectChips`/all-subjects tile → 6 tiles max, count per subject | `md`: 2×3, `lg`: 3×2 bento | each tile = link + count; the *only* place per-record `accent` shows as a tint |
| 6 | **How discovery works** | trust/teaching | 3–4 steps: pick subject → filter to semester → open → share link | `lg`: sticky two-column (left sticky, right steps) | this is the one legitimate *scroll chapter* (CSS `view()` first, ScrollTrigger only if pinning) |
| 7 | **Stats strip** | scale proof | `StatsBar` (Total / Pinned today `[VERIFIED-FILE]`) → `Documents · Subjects · Semesters covered · Shared this week` | 2×2 base, 4 across `lg` | tabular-nums, count-up on view (900 ms, once) |
| 8 | **Share moment** | the promise | "Every document has a link you can send" + `BackupLinks` pattern (copy link, present, embed, dropbox) `[VERIFIED-FILE]` | `md`: 2-col | copy feedback = icon swap, no toast that shifts layout |
| 9 | **For faculty** (optional) | supply side | 3 bullets + "Submit a presentation" (disabled until D1) | `md`: 3-col | only if AO approves the second audience |
| 10 | **Footer** | orientation | theme + projector toggles, ⌘K, legal, `GET /api/health` status (optional) `[VERIFIED-FILE]` | stacked → 3-col | keep `theme-color` meta in sync (currently hardcoded `#050505` `[VERIFIED-FILE layout.tsx]`) |

**Rule:** one choreographed sequence per viewport (§5 of `animation-guidelines.md`), so sections 1, 6 and — if approved — the 3D hero never animate at the same time. **Data honesty:** sections 2, 5, 7 must look right at N=1; skeleton shapes come from the 12-col grid, and the empty state has copy (§4 of `interaction-principles.md`).

## 5. Per-section animation strategy

| Section | Primary technique | Engine | Timing | Reduced-motion / fallback |
|---|---|---|---|---|
| Header | progress hairline `scaleX` | **CSS** `scroll(root block)` | continuous | `animation: none` |
| Hero — reveal | clip-path curtain + `y`+`blur→0` lines | GSAP timeline (mount) | ≤ 900 ms, `power3.out` | panel never shown; final state only |
| Hero — garnish | particle/atmosphere field **or** one retuned mesh blob | R3F `frameloop="demand"` (optional) / CSS | idle 30–40 s | static poster; **no** canvas mount |
| Hero — eyebrow | per-char decode | GSAP (+ no SplitText) | ≤ 1.2 s, once | plain text |
| Find | focus growth + chip press | **CSS** `:focus-visible`, `:active` | 200 / 100 ms | same (no motion needed) |
| Featured | pointer spotlight + `@property` conic ring | CSS custom props + 1 `pointermove` rAF | 200 ms in / 150 out | static ring; `pointer: coarse` off |
| Browse grid — reveal | `view()` mask reveals, stagger ≤ 8 | **CSS**, Motion fallback | 450 ms, 60 ms stagger | visible immediately |
| Browse grid — filter | **Flip** batch (`x,y,scale,opacity`) | GSAP Flip | 340 ms, no stagger | instant, no animation |
| Cards — depth | CSS 3D tilt ≤ 5° + 12 px glare | CSS vars (or Motion `useMotionValue`) | 200 ms settle | tilt off, glare off |
| Subjects | stagger in + label crossfade on hover | CSS / Motion | 40 / 70 ms | static |
| How discovery | sticky column + step activation | CSS `view()` → ScrollTrigger if pinning | scrub 0.6–1 | all steps visible, stacked |
| Stats | count-up on view | Motion `useTransform` or rAF | 900 ms, once | final number |
| Share/copy | icon swap + `scale` 1.06 | Motion | 160 ms | text change only |
| Detail: card→page | **native `<ViewTransition share="morph">`** | React 19.3 | 420 ms | instant nav |
| Detail: embed | none (third-party iframe) | — | — | — |
| Palette | opacity + `scale .98→1` | Motion / CSS | 180 ms | instant |
| Theme | spring lamp **+** VT circular clip | Motion + VT | 500–700 ms / clip 400 ms | state change, no spring |
| Projector | token swap only | CSS | 200 ms | 0 ms |

Full mechanism, code shape and failure modes per interaction: `website-inspiration/interaction-breakdowns.md`. Cross-cutting perf contract: `design-system/animation-guidelines.md` §6.

## 6. Scroll strategy (decision)

1. **Default = native scroll + CSS scroll-driven.** Reveals via `view()`, progress via `scroll()`, no library. Compositor-side, SSR-safe, and — per MDN `[VERIFIED-FETCH]` — supported in Chrome/Edge/Opera 115+, Safari 26/iOS 26, Samsung 23 and **Firefox 159**, while still flagged **not Baseline** ⇒ every use must be wrapped in `@supports (animation-timeline: view())` with a no-animation default.
2. **Add Lenis (1.3.27, MIT, zero deps) only when a scrubbed/pinned scene ships**, desktop-only, gated on `prefers-reduced-motion: no-preference`, via `<ReactLenis root>` from `lenis/react` `[VERIFIED-README]`. It runs on native scroll, so sticky/anchors/find-in-page keep working `[VERIFIED-DOC]`. **Deleting `html { scroll-behavior: smooth }` is mandatory** — the docs call out the conflict `[VERIFIED-DOC]` and our globals.css has it `[VERIFIED-FILE]`.
3. **Add ScrollTrigger for pin/scrub/snap and text choreography** — the one thing CSS still can't do well `[VERIFIED-DOC]`. Wire it to Lenis with **either** `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker.add(t => lenis.raf(t*1000))` + `lagSmoothing(0)` **or** `autoRaf: true`, never both `[VERIFIED-DOC]`. `useGSAP()` for cleanup (audit §5.4 lists the missing-dispose risk), `ScrollTrigger.refresh()` after fonts/images, `invalidateOnRefresh: true` on pinned scenes.
4. **No scroll-jacking, ever.** `wheelMultiplier: 1`, no `syncTouch` (documented "jumping" + browser-UI glitches `[VERIFIED-DOC]`), no durations > 2 s, one Lenis instance, `destroy()` on unmount, `data-lenis-prevent` on every internal scroller (palette, sheet, carousels).
5. **Mobile:** no pinning, no Lenis, no scroll-linked JS — CSS `view()` ranges at 60 % with reduced amplitude; pinned chapters become stacked sections or native snap carousels.
6. **Layout rules that make scroll trustworthy:** sections get scroll-margin for the sticky header, `contain: paint` on card clusters, no `overflow:hidden` ancestors of a scroll-timeline'd element (documented gotcha `[VERIFIED-DOC MDN]`), and the fix for the `--font-editorial` collision (audit §5.5) so scroll offsets don't shift after swap.

**Kill switch:** each engine sits behind a component boundary (`<MotionProvider>`, `<SmoothScroll>`, `<ScrollScene>`) so AO can delete Lenis, GSAP or 3D in one commit without touching content. That is the "removable engine" rule from `technology-comparison.md` §7.

## 7. 3D opportunities (ranked, all optional)

Full analysis: `research/3d-websites.md`, `research/threejs.md`, `research/react-three-fiber.md`.

| Rank | Idea | Why it earns its bytes | Cost / gate |
|---|---|---|---|
| **1** | **Hero atmosphere: particle field / drifting light** — `<points>` or instanced quads + a custom `ShaderMaterial`, depth + slight pointer parallax | Replaces flat gradient blobs with something that reads as *crafted*; no assets needed; 1 draw call | three + R3F (≈ 150 KB+) — gate behind `lg` + `no-preference` + WebGL probe + `deviceMemory ≥ 4`; `frameloop="demand"`; DPR ≤ 1.5; static poster fallback |
| **2** | **3D card depth via CSS transforms** (not WebGL) | 80 % of the perceived "3D" for 0 KB, keeps text crisp and searchable | free; `perspective: 1000px` + `rotateX/Y ≤ 5deg` + `translateZ` layers |
| **3** | **Scroll-driven image/document tube** (Codrops "Reactive Depth" pattern `[VERIFIED-LISTING]`) — a curved plane of document covers | Turns the collection itself into the 3D subject — meaning, not garnish | R3F + shader texture work; do only with ≥ 12 documents (blocked on D1) |
| **4** | **Subject orb/planet with a flowing ribbon** | One memorable brand asset; doubles as a loader/empty-state mascot | R3F + drei; needs an authored path — expensive, and `use-cannon`/physics is stale (2024-06 `[VERIFIED-API]`) ⇒ no physics |
| **5** | **3D text for stats / "Presentation Hub"** | Only if it must move in 3D; otherwise CSS-3D text + masks does it (Codrops 2025-11-04 `[VERIFIED-LISTING]`) | `troika-three-text`/`drei/text` + SDF; **never** `<Text>` with a system font per instance |
| **6** | 3D avatar for faculty, page-turn, "infinite scroll 3D", model-viewer of a physical book | Cute, costly, off-task | ❌ rejected — rationale in `research/3d-websites.md` |

**Rules for whatever ships:** `<Canvas>` in a `'use client'` leaf under `next/dynamic({ssr:false})`; `frameloop="demand"` + `invalidate()` from scroll/pointer only; canvas wrapper `aria-hidden="true"` and focus never enters; DPR `[1, 1.5]`; no post-processing; single shared renderer for multiple scenes; dispose geometries; pause when `document.hidden` or off-screen; poster fallback that is *better* than the animation. **`WebGLRenderer`, not `WebGPURenderer`** (three `0.187.0` ships `webgpu`/`tsl` exports `[VERIFIED-API]`, but Safari/WebGPU maturity + our mid-range Android audience make it the wrong default for 2026 production garnish `[AK-RECOMMENDATION]`).

## 8. Reusable components (build exactly these six)

From `github-repositories/frontend-components.md` §2, with file targets:

| Component | Path | Responsibility |
|---|---|---|
| `<Reveal>` | `src/components/motion/Reveal.tsx` | CSS-`view()` wrapper + `@supports` fallback + Motion fallback; props `delay/y/as/once` |
| `<DocCard>` | `src/components/dashboard/DocCard.tsx` | the 5-layer card (surface/hairline/ambient/spotlight/content), 16:9 generated cover block, tilt + glare, `data-flip-id`, `<DocMorph>` wrapper; replaces the inline markup in `page.tsx` `[VERIFIED-FILE]` |
| `<SpotlightRing>` | `src/components/ui/SpotlightRing.tsx` | pure-CSS conic/spotlight border via `--mx/--my/--spot-angle` (`@property`) |
| `<FacetSidebar>` / `<FacetSheet>` | `src/components/dashboard/filters/` | one reducer, two presentations; where `course/semester/documentType` land (needs D1) |
| `<DocMorph>` | `src/components/ui/ViewTransitionPair.tsx` | enforces `share="morph"` **with** `default="none"` (documented Next footgun `[VERIFIED-DOC]`) |
| `<MotionProvider>` + `<SmoothScroll>` | `src/components/motion/` | `<MotionConfig reducedMotion="user" isValidProp={…}>`, spring/ease tokens; `ReactLenis` behind the capability gate (R5) |

**Keep and extend, don't rewrite:** `GlassCard` (add the layer contract), `StatusOrb` (become the section-label primitive — it already animates `[VERIFIED-FILE]`), `ThemeToggle` (add the VT clip), `ProjectorModeToggle` (first-class feature), `BackupLinks` (good copy interaction), `AmbientBackground` (2 blobs, `aria-hidden`, no scroll response), `CommandPalette` (swap internals to `cmdk` only in Phase 3), `SearchBar`, `SubjectChips`, `StatsBar`, `loading.tsx`/`not-found.tsx` (already correct editorial states — style them to the new system).
**No component zoo:** 26 files today `[VERIFIED-FILE]`; the target is ~40 with the six above. Every component ships token-only styling (no `bg-[#hex]`, audit §5.2), explicit `aspect-ratio` on media, `aria-live` where state changes silently, and no data fetching inside the component (the R1 lesson).

## 9. Mobile strategy

Full spec: `design-system/responsive-guidelines.md`. Summary AC must obey:

base = **primary target** (Android/4G/one hand): 1 col, 56 px header, text-only hero (no blur, no curtain delay), full-width **visible** search input, "Filters (n)" → bottom sheet (`transform` only, `overscroll-behavior: contain`, `data-lenis-prevent`), cards 1 col with 16:9 media + 1 title line + 1 meta line, **no hover-dependent affordances** (`@media (hover: hover) and (pointer: fine)`), **no tilt, no magnetic, no spotlight, no Lenis, no pinning, no WebGL** (plus `deviceMemory < 4` ⇒ never mount a canvas), hit targets ≥ 44 px with ≥ 8 px gaps, `touch-action: manipulation`, safe-area insets, landscape ≤ 520 px height → 60 vh hero + `max-height: 70vh` embed.
Additive on `lg`: bento density, facet sidebar, spotlight, pinned chapter, 3D garnish.
**Never** hide content behind an animation, never `overflow:hidden` the root scroller (pull-to-refresh + `scroll-behavior`), never lazy-load the first 2 cards (they're the LCP candidates), never use a JS breakpoint where CSS suffices.

## 10. Accessibility requirements

Full spec: `research/performance-accessibility.md` + `implementation-recipes.md` R9.

1. **Reduced motion is a designed state** (animation-guidelines §5): global CSS kill exists `[VERIFIED-FILE]`; **it must never leave content hidden** — every `from({opacity:0})` needs a `gsap.set()` final state under `reduce`; `<MotionConfig reducedMotion="user">`; WebGL → poster; Lenis → off; count-ups → final number.
2. **Keyboard:** every flow operable (search → filter → open → copy); ⌘K + `/` with input guard; `Esc` closes only the topmost layer; focus returns to the trigger; the existing `:focus-visible`/`[tabindex]`/skip-link rules stay and must remain visible above any animated header `[VERIFIED-FILE]`.
3. **Semantics:** `role="listbox"`+`aria-activedescendant` (or `cmdk`) for palette/suggestions; `role="group"`+`aria-pressed` for facets; `aria-live="polite"` result count; `aria-busy` on skeletons; embed `<iframe>` with a real `title`; decorative layers `aria-hidden` (including `<Canvas>`); per-record `accent` never carries meaning alone.
4. **Contrast:** AA minimum in **dark, light and projector** (existing `--color-text-muted #64748b` on `#050505` ≈ 6:1 ✅; verify `#94a3b8` and every new tint); `prefers-contrast: more` → drop blur, raise borders; `forced-colors` → keep 1 px outlines.
5. **Cognition & trust:** ≤ 2 type voices; plain labels ("Open in Google Slides", not "Open ↗"); load-more not infinite scroll; no time pressure; no motion that hides content on JS failure (R8 server-rendered content).
6. **Verification, not vibes:** `axe`/`lighthouse a11y` 100 on the 4 routes + keyboard-only pass + `reduce` pass + zoom-200 %/40-char reflow, using the R9 audit script.

## 11. Performance budgets (measure, don't hope)

| Metric | Budget (p75) | Source | Current risk |
|---|---|---|---|
| **LCP** | ≤ **2.5 s** (design target 1.8–2.0) | `[VERIFIED-DOC web.dev]` | hero type + client-fetched grid; **do not** fade-in the LCP element; no render-blocking 3D |
| **INP** | ≤ **200 ms** | `[VERIFIED-DOC]` | the whole landing page is one client component `[VERIFIED-FILE]` → R1 |
| **CLS** | ≤ **0.1** (target ≤ 0.02 for the grid) | `[VERIFIED-DOC]` | skeletons with real `aspect-ratio`; the `--font-editorial` collision (audit §5.5) |
| **TTFB** | ≤ **0.6 s** | `[VERIFIED-DOC]` | R1 + `revalidate` (and `src/db/index.ts` throws when `DATABASE_URL` is unset `[VERIFIED-FILE]` → wrap + fallback) |
| JS (first load) | < **300 KB gz** target; 3D ≤ 50 KB / any-3D ≤ 150 KB | `technical-guides/recommended-stack.md` §4 | GSAP ~30 KB gz, Lenis ~10 KB, three+R3F ≫ 150 KB ⇒ Phase 5 is approval-gated |
| Long tasks | none > 50 ms during hydration | `[VERIFIED-DOC]` | no heavy `useEffect`; `requestIdleCallback` for non-critical setup |
| Frames | 60 fps scroll; drop to no-reveal at 30 fps | `[VERIFIED-DOC]` | one rAF loop; `contain: paint`; `will-change` transient |
| Images/embeds | LQIP + `loading="lazy"` below fold, `fetchpriority=high` on exactly one element | `[VERIFIED-DOC]` | embeds lazy, never animated (§5 of document-discovery research) |

**Protocol (run before and after each phase):** `npm run build` → `npx lighthouse@latest http://localhost:3000 --preset=desktop` and `--form-factor=mobile` (throttled) → record in `frontend-intelligence/measurement.md` (create it); verify the two "premium" features separately (a static render with animation off, and the animated experience); test the real device class (mid-range Android) not only devtools; `next/bundler` + `@next/bundle-analyzer` for per-route JS; `performance.measure` around GSAP setups.

## 12. Implementation sequence (phased, each phase shippable)

**Phase 0 — ground (0.5–1 day).** `next` → 16.4.3 + `react`/`react-dom` → 19.3.1 (pin the pair, one commit) → add a lockfile → fix tokens (**R2**) → fix the `--font-editorial` collision (audit §5.5) → delete `html{scroll-behavior:smooth}` → **R1** server/client split (blocked on D1: at minimum move the JSON read to a server component and keep the client leaves). *Exit:* light mode needs zero `!important`; landing page renders content with JS disabled; Lighthouse mobile perf baseline recorded.
**Phase 1 — the static design is premium (2–3 days).** Type scale + spacing tokens; `DocCard` with 5 layers + generated cover; `SpotlightRing`; `Reveal` (CSS `@supports`); header progress hairline; projector mode promoted to a third theme; skeletons for every loading state; `theme-color` synced. *Exit:* §15 "static gate" passes with **no** JS animation; both themes + projector AA-verified.
**Phase 2 — motion language (2–3 days).** `<MotionProvider>`; GSAP + `useGSAP` install; hero reveal curtain (one-time, `sessionStorage`) + eyebrow decode; Flip grid relayout (**R4**); native VT card→detail morph (**R3**) + theme VT clip; count-ups; press/hover polish. *Exit:* reduced-motion matrix clean; no leaked ScrollTrigger (`useGSAP` cleanup verified in dev); INP ≤ 200 ms while animating.
**Phase 3 — discovery (2–4 days, needs D1).** Real `semester`/`course`/`documentType` fields → `src/db/schema.ts` + API; **R7** scoring + `?subject=&course=&semester=&type=&q=` URL state; facet sidebar + mobile sheet; facet counts + `search-within-facet-values`; zero-result recovery; `cmdk` migration for the palette. *Exit:* filtering a 20-doc fixture is instant; keyboard + `aria-live` verified; no results animation while typing.
**Phase 4 — scroll direction (2 days, optional).** Lenis gate (**R5**); sticky "How discovery works" chapter via CSS `view()`, upgraded to ScrollTrigger pin only if the pacing demands it; hero pointer parallax ≤ 40 px; `wheelMultiplier: 1`. *Exit:* scroll-jank-free on a 4 GB-RAM heuristic device; anchors, find-in-page, pull-to-refresh intact; `prefers-reduced-motion` and touch users unaffected.
**Phase 5 — 3D garnish (2–3 days, needs D3).** Hero field (**R6**, `frameloop="demand"`, DPR cap, poster) → optional CSS-3D subject orb → *never* more than one canvas. *Exit:* 3D removable in one commit; JS budget within §11; canvas `aria-hidden`; first paint unaffected.
**Phase 6 — hardening (1–2 days).** Perf pass (R8 matrix: reduced motion, no-CSS-support, no-WebGL, no-JS, slow network) → `next.config.ts` `images`/`compress`/headers (currently **empty** `[VERIFIED-FILE]`) → a11y audit (R9) → Lighthouse + `measurement.md` diff → PR description with screenshots of all three themes.

**Sequencing logic:** the design must survive without JS, so JS-only layers (2, 4, 5) come *after* the system (0, 1); discovery (3) is the product's actual job and its schema is the long pole; 3D last because it is the only removable luxury.

## 13. Testing & verification plan

| Test | How | Pass |
|---|---|---|
| Static gate | `prefers-reduced-motion: reduce` + JS disabled, all 4 routes | readable, navigable, no hidden content |
| Theme matrix | dark × light × projector × each route, side-by-side screenshots | AA contrast; no `!important`; no flash (inline theme script stays first `[VERIFIED-FILE layout.tsx]`) |
| Motion timing | DevTools performance recording of hero + filter + scroll | no long task > 50 ms; no dropped frames on scroll |
| Metrics | Lighthouse desktop + throttled mobile, per phase → `measurement.md` | §11 budgets |
| Leak test | mount/unmount landing 20×; `grep -rn "ScrollTrigger" src \| grep -v context` | 0 triggers/contexts left; no listeners on `window` |
| A11y | lighthouse 100 + keyboard-only run of find→open→copy + `Esc`/focus-return + 200 % zoom + `axe` | 0 violations blocking; 3 flows keyboard-completable |
| Scroll sanity | anchors, `⌘F`, sticky header, pull-to-refresh, back-nav with Lenis on/off | all behave natively |
| View Transitions | card→detail→back in Chromium + Safari 26 + Firefox 159 | morphs where supported; plain nav otherwise |
| Device class | real mid-range Android or `deviceMemory`-simulated | 60 fps scroll, 3D never mounted |
| Data honesty | fixture of 1 / 12 / 120 records | grid, facets, empty state, load-more all correct |
| Codegen guard (if agents assist) | "explain each line" review + repo skills (`greensock/gsap-skills` via `npx skills add …` 17,684★ `[VERIFIED-API]`; `vercel-labs/agent-skills --skill vercel-react-view-transitions` `[VERIFIED-DOC]`) | no hallucinated APIs; licence note per added dep |

## 14. Guardrails (do NOT)

1. ❌ Do not copy component code from `DavidHDev/react-bits` (license NOASSERTION `[VERIFIED-API]`), `arihanthcodes/spectrum-ui`, or any Awwwards/Codrops demo — **read, then re-implement with our tokens**. `pmndrs/react-three-next` is **stale since 2024-06** `[VERIFIED-API]`: do not scaffold from it.
2. ❌ No `!important` theme overrides, no raw hex in `className`, no arbitrary-value colour utilities as the theme mechanism (Phase 0 removes them).
3. ❌ No client-only data fetching on landing (R1) and no `useEffect` fetch that gates first paint.
4. ❌ No render-blocking 3D, no `<Canvas>` without a capability probe + `ssr:false` + poster, no post-processing, no physics (stale).
5. ❌ No `@splinetool/react-spline` (no licence file + stale), no `@theatre/core` (2024), no `react-merge-refs`, no `@view-transitions/react` (doesn't exist), no `next/font` re-conflicts.
6. ❌ No GSAP via `.npmrc`/"buying" for internal use, and **no `gsap-trial` imports**; check `gsap/SplitText` in the standard package. Before shipping, AO should still have counsel read the licence page — the "client work" clause is the one legal surface here `[VERIFIED-DOC]`.
7. ❌ No `share="morph"` without `default="none"`; no `layout`+transform on the same node; no `autoRaf` + `gsap.ticker`; no `duration > 2 s` or `syncTouch` in Lenis; no `@theme inline` with baked colours (breaks runtime theming `[VERIFIED-DOC Tailwind v4]`).
8. ❌ No infinite scroll (a11y + conversion `[REPORTED S13]`), no scroll-jacking, no pinned section taller than 2.5× viewport, no cursor trails, no animating the document-preview iframe, no animated skeletons while filtering, no `transition: all`.
9. ❌ No new library that isn't removable behind a boundary, and no dependency added without a licence + last-publish line in the PR description.
10. ❌ Do not touch AC's application branch/working tree from the research branch; do not merge this branch (mission rules).

## 15. Open decisions (AO / Product Owner)

| ID | Question | Options | AK recommendation |
|---|---|---|---|
| **D1** | Where does document data come from — Supabase vs Postgres/Drizzle vs JSON fixture? (brief's Supabase claim is unverified `[VERIFIED-FILE]`) | (a) Supabase+auth (b) existing `pg`+Drizzle (c) typed JSON fixture | **(c) now for Phase 1–2, (b) in Phase 3** — `src/db/*` exists; decide before faceting (blocks §12 Phase 3) |
| **D2** | React 19.3.1 + Next 16.4.3 upgrade in one PR? | yes / later | **yes, Phase 0** — it unlocks zero-config View Transitions and keeps R3F's `<19.4` ceiling `[VERIFIED-API]` |
| **D3** | 3D in scope at all? | no / CSS-3D only / 1 WebGL scene | **CSS-3D in Phase 1, exactly one WebGL scene in Phase 5**, poster-gated |
| **D4** | GSAP (non-MIT "no charge" licence) acceptable? | yes / MIT-only | **yes** — MIT-only fallback documented in `technology-comparison.md` §2 |
| **D5** | Adopt `cmdk` for the palette (replaces working custom code)? | Phase 3 / never | **Phase 3**, with a11y tests, not while styling |
| **D6** | Third font family (e.g. **Geist Serif**, seen live on recent.design `[VERIFIED-FETCH]`) to replace Newsreader? | keep Newsreader / trial | **keep Newsreader** — zero new bytes; revisit after brand review |
| **D7** | Facet model: `semester` as string "2024-25 Sem 3" or normalised `term`+`year` FK? | string / normalised | **normalised** — filtering/counting/URL state all get cheaper |
| **D8** | `content-visibility: auto` on off-screen sections (perf win, print/anchor risks)? | yes / measure | measure in Phase 6, verify projector print |

## 16. References (what to read, in what order)

**If AC reads one file:** this one. **If two:** + `technical-guides/implementation-recipes.md` (R1–R9).

| Need | File |
|---|---|
| Repo ground truth & debt | `audit/stack-audit.md` |
| Every version/licence/star fact + resolved contradictions + limitations | `RESEARCH_INDEX.md` |
| What to install, in what order, with kill switches | `technical-guides/recommended-stack.md` |
| Browser support, inter-library compat, the "what changed since 2024" list | `technical-guides/compatibility-matrix.md` |
| The six required head-to-head comparisons + decision table | `technical-guides/technology-comparison.md` |
| Copy-paste-shaped code patterns (pseudocode) | `technical-guides/implementation-recipes.md` |
| Look, tokens, type, glass, projector | `design-system/visual-direction.md` |
| Motion tokens, per-component table, perf contract | `design-system/animation-guidelines.md` |
| Breakpoints, touch, network classes | `design-system/responsive-guidelines.md` |
| States, feedback, timing, copy | `design-system/interaction-principles.md` |
| Why each library behaves as claimed | `research/gsap-and-scrolltrigger.md`, `research/scroll-animations.md`, `research/motion-design.md` |
| 3D decisions, support reality, perf levers | `research/threejs.md`, `research/react-three-fiber.md`, `research/3d-websites.md` |
| Effect vocabulary (curtain, spotlight, magnetic, mask) | `research/visual-effects.md` |
| Discovery/search/facet design | `research/document-discovery-ui.md` |
| Budgets + a11y bar | `research/performance-accessibility.md` |
| Vetted repos (14-attribute cards) & component decisions | `github-repositories/repository-catalog.md`, `…/3d-projects.md`, `…/animation-projects.md`, `…/scrolling-experiences.md`, `…/frontend-components.md` |
| Site/technique references (with verification tiers) | `website-inspiration/website-gallery.md`, `…/interaction-breakdowns.md` |
| Primary sources | each research file's Sources block; the single most load-bearing: Next.js view-transitions guide, GSAP licence + ScrollTrigger docs, MDN `animation-timeline`, Lenis README, Tailwind v4 theme docs, `web.dev/vitals` |

## 17. Known unknowns (AK's honesty section)

| # | Unknown | Why it matters | Who resolves |
|---|---|---|---|
| U1 | **Supabase/admin does not exist in the repo** — the brief described a Supabase backend; grep found none `[VERIFIED-FILE]` | all data-layer phases | AO (D1) |
| U2 | **N=1 dataset** | "showcase for a collection" cannot be validated | owner supplies ≥ 12 real records |
| U3 | No `semester`/`course`/`documentType` fields | facets, URL state, counts | AO (D1/D7) |
| U4 | **No live 2026 bundle measurement** (can't `npm ci` + profile offline; registry metadata ≠ installed footprint) | every budget claim is a *target*, not a measurement | AC, Phase 0 |
| U5 | Awwwards studio/site URLs marked `[VERIFIED-LISTING]` were **not individually opened** (sandbox network allow-list `[VERIFIED-ENV]`) | reference links quoted to the Product Owner | AC click-verify |
| U6 | `gsap` licence: internal use is free, "client work" clause wording is a legal judgement | procurement | AO/legal |
| U7 | Motion `12 → 14` upgrade path on this codebase (2 majors; `@emotion/is-prop-valid` removal in 13.0.0) | one file uses `transition={{duration:0.4}}` `[VERIFIED-FILE]`; risk is low but unproven | AC in Phase 0 |
| U8 | **Firefox 159** CSS scroll-driven support read from MDN `[VERIFIED-FETCH]` but not browser-tested here | progressive-enhancement fallback quality | AC, Phase 1 |
| U9 | `next.config.ts` empty + no lockfile `[VERIFIED-FILE]` → build output may differ from CI | reproducibility | AC, Phase 0 |
| U10 | No `next/image` usage found (previews are external embeds) | image budget rules may be moot until thumbnails exist | AC |
| U11 | `troika-three-text` 0.52.5 licence field absent in registry `[VERIFIED-API]` | only if 3D text ships | AC, Phase 5 |

---

**Prepared by AK · 2026-11-01 · 31 knowledge files under `frontend-intelligence/` · zero application-code changes · branch not merged (awaiting AO review).**
Handover notes: `AO_HANDOVER.md` (state + decisions) and `AK_HANDOVER.md` (what remains researchable).
