# Responsive Guidelines

**AK · 2026-11-01 · Domain J.** Audience reality: Indian college students, mostly **Android phones on 4G, mid-range chipsets, one hand, thumbs, shared Wi-Fi in hostels/classrooms**, plus projector screens in lecture halls and laptops in libraries. The mobile+projector experience is the product; the desktop site is the showcase.

---

## 1. Current state (facts)

Breakpoint usage in `src/`: `md:` ×19, `lg:` ×6, `sm:` ×4, **no `xl:`/`2xl:`** `[VERIFIED-FILE]` — the layout is effectively **two-column-minded with three stated sizes**, and the 12-col bento (`col-span-8` featured + stacked 4-col cards `[VERIFIED-FILE page.tsx]`) is the only grid intelligence. The featured card already carries `::before` (1 px top highlight) and `::after` (200 % radial ambient) `[VERIFIED-FILE globals.css]` — good bones to scale, not to rewrite.

## 2. Breakpoints (Tailwind v4 defaults kept; semantics assigned)

| Name | Width | Meaning for this product | Layout |
|---|---|---|---|
| base | 320–639 | **primary target** | 1 col, sticky compact header, full-bleed hero, cards stacked, filters → sheet |
| `sm` | ≥ 640 | large phones / foldables | 2-col card grid, sheet stays |
| `md` | ≥ 768 | tablets, portrait | 2–3 col, sidebar *appears* at `lg` only; projector mode default |
| `lg` | ≥ 1024 | laptops, classroom screens | 12-col bento, sticky facets sidebar, scroll scenes enabled, **Lenis eligible** |
| `xl` | ≥ 1280 | desktop | max content width 1240 px, ambient + 3D garnish allowed |
| `2xl` | ≥ 1536 | large/TV/projector | do not scale type further; increase *space*, cap line length at 72 ch |

Rules: content max-width `72rem` for the grid + `68ch` for reading text; `padding-inline: clamp(1rem, 4vw, 3rem)` (no magic `px-6` everywhere); **one** grid definition per breakpoint, never nested flex-hacks to fake columns.

## 3. Touch and pointer

- Hit targets ≥ **44 × 44 px** with ≥ 8 px gaps; the card's *whole surface* is the link (today the card wraps a `Link` `[VERIFIED-FILE]` — keep) but every secondary action (copy link, open backup) is its own ≥ 44 px button, spaced ≥ 8 px apart.
- `touch-action: manipulation` on interactive elements; keep the existing `-webkit-tap-highlight-color` / `touch-callout` normalisation `[VERIFIED-FILE globals.css]`.
- **Hover-only affordances must have a touch equivalent** (spotlight ring → static ring on the featured card; magnetic pull → off; tilt → off). Detect with `@media (hover: hover) and (pointer: fine)`, never with JS UA sniffing.
- Scroll: no scroll-jacking on touch; pinned sections become stacked or snap-scroll carousels (`scroll-snap-type: x mandatory`, `-webkit-overflow-scrolling: auto` + native momentum). Lenis `syncTouch: false` (documented cause of "jumping" and browser-UI glitches `[VERIFIED-DOC lenis README]`).
- Sheets: bottom sheet for filters (CSS transform + `overscroll-behavior: contain` + `data-lenis-prevent`), drag-to-dismiss optional and only if it never traps focus; safe areas via `env(safe-area-inset-*)` on iOS notch devices.
- Pull-to-refresh must stay functional: never `overflow:hidden` the root scroller — another reason Lenis goes on `body`/its own root, not on a wrapper that swallows `overscroll`.

## 4. Per-section responsive contract

| Section | base | `md` | `lg+` |
|---|---|---|---|
| Header | 56 px, logo + ⌘K-icon → tap target, theme + projector compact | same | 64 px, nav labels, 2 px scroll-progress hairline |
| Hero | text only + 1 blob, title `clamp(2rem,9vw,3rem)`, no curtain blocking input | + subtitle row | 2-col: statement + featured tile; curtain reveal; WebGL layer optional |
| Search / filters | full-width input (visible, not icon-only `[REPORTED S13]`) + count + "Filters (n)" button opening a sheet | same | input + inline multi-select chips + left facet sidebar (collapsible `[REPORTED S12]`) |
| Featured card | `col-span-full`, static ambient ring, no tilt | same | spotlight follows pointer, `::before/::after` ambient as today |
| Doc grid | 1 col, `min-h` from `aspect-ratio: 16/9` media block | 2 col | 3 col (12-col bento retained); cards never wider than 420 px |
| Subject tiles | horizontal snap carousel, 2 visible | 4 | existing 6×2-ish bento |
| Stats strip | 2×2 grid, tabular nums, count-up on view | 4 across | 4 across + optional 3D garnish |
| Detail page | title, meta chips, actions; embed **below the fold** with an explicit "Open" CTA (mobile embeds of Slides are cramped) | split columns | sticky left rail (meta + links), embed in `16/9` frame max-height `calc(100vh - 160px)` |
| Footer | stacked | 2-col | 3-col |

## 5. Typography & density across sizes

`rem`-only sizes with `clamp()` for the two display levels; body `15 px → 16 px`; line-height `1.5` compact (cards) / `1.65` reading (description, meta list). Mobile card: title 1 line, description **1** line (`-webkit-line-clamp: 2` allowed at `md+`), meta row (platform · topic · year) — density comes from *removing* fields, not shrinking type below 14 px. `font-variant-numeric: tabular-nums` for counts so filter-count changes never jiggle.

## 6. Performance by network class (verified budgets: `technical-guides/compatibility-matrix.md` §5)

| Class | Target | How |
|---|---|---|
| Slow 4G (default assumption) | LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1, TTFB ≤ 0.6 s, JS < 300 KB gz `[VERIFIED-DOC web.dev]` | R1 server shell; CSS-only reveals; zero 3D; fonts via `next/font` (fix audit §5.5) |
| Mid-range Android (≤ 4 GB RAM heuristic) | 60 fps on scroll; no jank on filter tap | `deviceMemory` gate for WebGL + Lenis; blobs capped at 2; blur ≤ 2 levels |
| Laptop/desktop (≥ 1024 px, `no-preference`) | showcase | scroll scenes, pinned chapter, WebGL hero field at `frameloop="demand"`, tilt + spotlight |
| Projector / lecture hall | legible from 8 m | existing `projector-mode` `[VERIFIED-FILE globals.css]`: base `18px` → add `clamp` to `1.25rem`, stronger borders, **all idle animation off**, ambient blobs off |

Rules that keep these true: no render-blocking 3D (dynamic `import()` + `ssr:false`), `content-visibility:auto` on off-screen sections, `loading="lazy"` on embeds with an explicit `aspect-ratio`, and **no animation that requires JS to reach a readable state** (R8).

## 7. Orientation, foldables, and short viewports

`@media (orientation: landscape) and (max-height: 520px)` (phones sideways, some tablets): hero loses the curtain and shrinks to 60 vh; sticky facets collapse; embed gets `max-height: 70vh`. Short laptop viewports (`max-height: 700px`): reduce section rhythm from `96px` to `64px` and drop the pinned chapter entirely — a pinned section taller than the viewport is the classic "can't get out" bug `[VERIFIED-DOC GSAP pinning notes]`.

## 8. What "responsive" means for motion (summary)

| Capability | base | `lg+` |
|---|---|---|
| CSS reveals / progress bar | ✅ | ✅ |
| Hover spotlight, magnetic, tilt | ❌ | ✅ |
| Pinned/scrubbed chapter | ❌ | ✅ |
| Lenis smooth scroll | ❌ (never on touch) | ✅ gated |
| WebGL hero field | ❌ | ✅ gated |
| Card→detail VT morph | ✅ (cheap, UA-driven) | ✅ |
| Ambient blobs | 1, ≤ 0.25 opacity | 2 as today |
| Hero curtain reveal | 500 ms, no blur | 900 ms full |

Reduced motion overrides every ✅ above (`design-system/animation-guidelines.md` §5). Mobile-first does **not** mean mobile-only: the desktop tier is what makes the hub feel like a product someone built with care — it just has to be additive.
