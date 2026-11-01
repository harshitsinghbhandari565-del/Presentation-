# Premium UI/UX & Visual Design Engineering

**AK · 2026-11-01 · Domain C**

## 1. What "premium" actually decomposes into

Across 2026 award-winning and high-end SaaS work `[REPORTED S8/S9/S10]`, "premium" is not one style. It is six measurable decisions:

| Decision | Specifics | Our current state `[VERIFIED-FILE]` |
|---|---|---|
| **Type contrast** | A display face at 3–6× the body size, tight tracking, generous leading; body ≤17 px | ✅ Strong already: Newsreader italic 6xl vs Geist body, `tracking-tight`, `leading-[1.1]` |
| **Restraint in palette** | 1 accent + 1 support + neutrals; saturation spent in one place | ✅ Indigo `#6366f1` + emerald `#34d399` on `#050505`. **Do not add a third accent** |
| **Layered, low-alpha surfaces** | Depth via 1px borders + inset highlights + soft glow, not heavy shadows | ✅ `.glass-card` inset top highlight + 60px accent glow — genuinely good |
| **Motion at low amplitude** | 4–16 px travel, 150–400 ms, one easing curve everywhere, subtle stagger | ✅ Already `y: 8`, `0.4s`, `staggerChildren: 0.06` in `page.tsx` — **this is exactly right; keep the numbers** |
| **Whitespace rhythm** | 4/8-based spacing with a large section gap; alignment to a visible grid | ⚠️ Grid is 12-col with `gap-5 md:gap-6`; sections lack vertical rhythm between the grid and footer |
| **Micro-typography of data** | Metadata as a designed system (chips, dots, dividers, tabular numerals) | ✅ Partial: chips + `·` separators; `font-variant-numeric: tabular-nums` missing on counts |

**Read:** the project is *already* ~70% of the way to premium. The mission's real opportunity is **completing the system** (rhythm, states, transitions) rather than re-skinning it. `[AK-RECOMMENDATION]`

## 2. Bento grids — how to do them properly

Bento = asymmetric tiles on a shared grid where **tile size encodes importance**.

Rules that make bento look designed instead of random:
1. **One row template, fixed spans** — e.g. `lg:grid-cols-12` with `col-span-8/4`, `4/4/4`, `6/3/3`. Our featured(8)+sidebar(4) **is already a bento row** `[VERIFIED-FILE]`.
2. **Fixed row heights** (`auto-rows-[minmax(9rem,auto)]`) so tiles align on all edges — the #1 tell of an unfinished bento.
3. **2 densities max**: hero tile (p-8/p-10) vs utility tile (p-4/p-5). We already model this via `.glass-card` vs `.glass-card-utility` — **use those variants instead of inline padding**.
4. **Tiles may be interactive; the whole tile is the target** (`<a>` wrapping, `group-hover` inside), with the accessible name on the tile, not on a nested "read more".
5. **Motion belongs to the tile, not the grid** — a tile lifts ≤2 px, its internal content parallaxes ≤6 px.
6. **Empty tiles get designed states, not "No featured presentation available."** (that literal string exists today `[VERIFIED-FILE]` — it should be a designed empty tile.)
7. `grid-auto-flow: dense` for filtered sets so holes close up; animate the closing with GSAP `Flip`.

**Reference:** `codebucks27`-style tutorial bento sites are plentiful but license-free (no LICENSE file); the better references are the token systems in `shadcn-ui/ui` (★127,119, MIT `[VERIFIED-API]`) and `DavidHDev/react-bits` (★50,952, license `NOASSERTION` → **do not copy source**, read for technique `[VERIFIED-API]`).

## 3. Glassmorphism — engineering constraints (this is where premium dies)

Our glass = `backdrop-filter: blur(20px) saturate(180%)` on `rgba(255,255,255,.02)` + `border: 1px solid rgba(255,255,255,.06)`.

Hard limits to document for AC:
- **Cost is per-element, per-frame.** Each blurred surface is a separate backdrop read. 3–4 on screen = fine; 24 card-blurs on a mid Android = scroll jank. **Cap simultaneous blurred surfaces ≤ 4**; give the rest a solid `--color-surface`. `[AK-RECOMMENDATION]`
- **Never animate `backdrop-filter`** (no hover "focus the glass" effects) and never animate blur on scroll.
- **Glass inside a pinned/transformed ancestor loses its backdrop** (transform creates a containing block → the sampled backdrop changes). Pinned hero scenes must use solid surfaces.
- **Light mode glass is a different material.** The current light overrides replace it with `rgba(255,255,255,.85)` + a hairline `#e2e8f0` and *reduce* mesh opacity to `.4` `[VERIFIED-FILE]` — good instinct; formalize as a `--glass-*` token pair.
- **Text on glass must clear 4.5:1 against the *worst* backdrop**, not the average. Test over a white slide thumbnail behind a translucent card.
- `@supports not (backdrop-filter: blur(1px))` → solid fallback (still needed for older in-app webviews).

## 4. Gradients, glows, grain — the layering recipe we should keep using

The existing `AmbientBackground` (3 radial blobs + vignette + 1.2 %-opacity `feTurbulence` noise `[VERIFIED-FILE]`) is a correct implementation of the 2024-2026 "aurora mesh" idiom. Improvements, in order of value:

1. **Register `--angle`/`--position` with `@property`** so gradient stops can animate on the compositor instead of repainting a whole gradient (Firefox 128+/Safari 16.4+ `[VERIFIED-DOC MDN]`).
2. **Move blobs with `translate` on a `will-change: transform` wrapper**, not `background-position`; add pointer parallax at ±12 px.
3. **Conic "spotlight border" on the featured card only** (rotating conic-gradient masked to the 1px border ring) — the single highest perceived-value trick in premium SaaS card design, and it is pure CSS.
4. **Keep grain at ≤2 % opacity, `background-size: 150px`, no animation** — animated grain is a repaint on the whole viewport.
5. **Theme-aware glow:** in light mode convert glows to `box-shadow: 0 8px 32px rgba(99,102,241,.08)` (they already do this via overrides; tokenise it).
6. Avoid: noise+gradient+blur+shadow stacked on the same element (muddies text), and any `mix-blend-mode: screen/overlay` over text in light mode.

## 5. Interactive navigation

| Pattern | Verdict | Notes |
|---|---|---|
| Sticky header with blur (current) | ✅ keep; add **scroll-progress underline** and a "compacted on scroll" state (`borderless → hairline`, height 64→56 px) | Cheap, big polish signal |
| ⌘K palette (current, custom-built) | ✅ keep, upgrade | Already has arrow/Enter/Esc + recent views `[VERIFIED-FILE]`. Add `role="dialog" aria-modal`, focus trap, and result-count `aria-live`. Consider `dip/cmdk` (★13,057, MIT `[VERIFIED-API]`) only if focus bugs appear — **not** as a style change |
| Scroll-spy section rail (right edge, 2 px ticks + labels on hover) | ✅ for the landing narrative | Pure CSS `animation-timeline: scroll()` + IO for active state |
| Mega-menu with animated preview | ❌ | No nav volume to justify it (2 routes `[VERIFIED-FILE]`) |
| View Transitions on route change | ✅ **the** nav upgrade | See `motion-design.md` §3 |
| Cursor-following nav pill (`layoutId` shared highlight) | ✅ | Motion `layoutId="nav-pill"` — 3 lines, feels expensive |
| Full-page menu overlay | ❌ | 2 links; would be theatre |
| Projector-mode-aware header (larger hit targets) | ✅ exists (`min-height: 48px` in projector `[VERIFIED-FILE]`) | Ensure any new nav control inherits it |

## 6. Advanced card design — the "document card" spec

`[AK-RECOMMENDATION]` A reusable `.doc-card` composed of 5 layers:

```
layer 0  solid surface (no backdrop-filter) + 1px border
layer 1  1px conic spotlight ring, opacity 0 → 1 on hover/focus-visible (400ms)
layer 2  content: subject chip · title (Newsreader 20/26) · topic line · meta row
         (tabular-nums) semester/type badges · platform icon · updated date
layer 3  preview band: 16:9 area — gradient placeholder derived from `accent`,
         or real <img> when embedUrl thumbnails exist
layer 4  action bar revealed on hover/focus: [Present ↗] [Copy] [Backup]
```
Behaviour: whole card is a link (title carries the accessible name); hover = `translateY(-2px)` + shadow, **no tilt on touch**; `:active` = `translateY(0) scale(.995)`; keyboard = `Enter` opens, `Space` copies; entering the grid staggers 40 ms/item capped at 6 items; filtering uses GSAP `Flip`.

Anti-cheap tells: no "Learn more →" text links; no rounded corners on one corner only; no identical card heights when content differs (use `line-clamp-2`); no `opacity` transitions longer than 350 ms.

## 7. Hero patterns for 2026 (and which one we use)

Observed in current high-end SaaS/studio work `[REPORTED S8/S10]`: (a) oversized editorial headline with a single motion beat; (b) product-UI-in-context mock; (c) interactive 3D/WebGL centerpiece; (d) split hero with an ambient field; (e) scroll-driven pinned narrative.

**For a document hub with one featured document, (a)+(d) — editorial headline over the existing ambient mesh, with the *search field as the primary CTA*.** That is a UX decision worth more than any effect: a discovery product's hero should let you *search*, not ask you to scroll. `[AK-RECOMMENDATION]`

Concretely: left = eyebrow (StatusOrb), 3-line Newsreader headline, one-sentence subhead, **always-visible search input** + subject chips, meta row ("N documents · M subjects · updated <date>"); right = featured card with spotlight ring and a live-tilt preview. Below the fold, the scroll narrative.

## 8. Editorial layout techniques that survive contact with real students

- **Baseline rhythm:** pick `line-height: 1.6` body at 16/17 px and derive section spacing as multiples (24/48/96).
- **Optical margins:** pull punctuation/heavy glyph overhang with `text-wrap: pretty` (universally supported `[REPORTED]`) + `hyphens: manual`.
- `text-wrap: balance` on headings ≤ 3 lines — prevents orphan words in a 6xl Newsreader line; free, one declaration, big quality signal.
- **Rule lines and dot separators** (already present) — keep one weight (`border-white/[0.06]`).
- **Numbers set in tabular figures** for counts/dates: `font-variant-numeric: tabular-nums`.
- Small-caps eyebrow with `tracking-[0.12em]` (the `StatusOrb` pattern) — reuse as the section-label system.
- **Drop the `italic` on Newsreader for headings** unless it carries meaning: it's currently loaded as `style: ["italic"]` only `[VERIFIED-FILE]` while CSS asks for `font-weight: 600/700` on the *variable* italic axis — verify weight rendering in both themes; synthetic emboldening of an italic variable font is a common premium-site flaw.

## 9. Responsive design system

Breakpoints: our only real ones are `md`/`lg` `[VERIFIED-FILE]`. Recommend a deliberate 4-step scale (see `design-system/responsive-guidelines.md`) plus container queries for the card grid so the card adapts to its *cell*, not the viewport — Tailwind v4 supports `@container`/`@md:` natively `[VERIFIED-DOC Tailwind v4]`, and it is the correct tool for a 12-col bento.

## 10. Dark/light/system — the correct 2026 implementation

Verified Tailwind v4 pattern `[REPORTED S7]`:

```css
@import "tailwindcss";
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
:root            { --canvas: oklch(0.98 .002 250); --ink: oklch(.25 .02 260); --glass: 84%; }
[data-theme="dark"] { --canvas: oklch(0.16 .006 280); --ink: oklch(.97 .005 255); --glass: 2%; }
@theme inline { --color-canvas: var(--canvas); --color-ink: var(--ink); }
```
- `@theme inline` makes utilities read the variable → **runtime swap works**; plain `@theme` bakes values in and breaks switching (`[REPORTED S7]` — the #1 Tailwind v4 dark-mode bug).
- Keep the existing inline pre-paint script and `data-theme` attribute + `color-scheme` (already correct `[VERIFIED-FILE]`); `oklch` gives perceptually matched light/dark pairs.
- Then **delete the ~30 `html[data-theme="light"] … !important` rules** and stop using raw hex classes.
- System theme = `matchMedia` listener (already implemented) + `light-dark()` CSS function for one-line dual values where useful (Baseline since 2024 `[REPORTED S9]`).
- Theme *transition*: same-document View Transition with `::view-transition-new(root){ animation: clip-path circle from the toggle }`, gated off under reduced motion.
- **Projector mode must be treated as a third theme axis** (it currently is: root 18 px, 2 px borders, stronger text `[VERIFIED-FILE]`). Any token refactor keeps `html.projector-mode` working — it is the classroom feature.
