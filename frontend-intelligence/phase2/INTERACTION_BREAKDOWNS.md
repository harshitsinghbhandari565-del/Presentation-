# Interaction breakdowns — 14 patterns, from observed effect to code AC can write

Each entry: **what it looks like → what it must do → the mechanism (with the reference that proves it) → our
adaptation → the cost → what breaks it.** Sources are `WEBSITE_ATLAS.md` (observed) and the lab/inspected repos
(mechanism). Implementation labels are only used where a source file or docs page was actually read.

---

## 1. Type-led hero reveal (EX01; Endcap, Enigma, Webdrift, Peaches [VERIFIED-LISTING])
- **Observed:** headline arrives as lines, not as a block; nothing else moves.
- **Requirement:** readable at first frame with motion off; no layout shift while revealing.
- **Mechanism:** server-split lines into `<span class="line">` wrappers; animate `translate3d(0,y,0)` + `clip-path: inset(0 0 110% 0)` per line with `--i` stagger. Variable-font `font-variation-settings` can carry the last 20 % of the motion for free (Peaches-style).
- **Our adaptation:** hero H1 only (≤ 2 lines desktop, ≤ 4 mobile). No word-level splitting on paragraphs.
- **Cost:** 0 KB CSS. GSAP/SplitText variant: +56 KB [MEASURED] — not worth it here.
- **Breaks when:** the split happens in the browser after hydration (CLS) or `overflow:hidden` clips descenders (use `inset()` with breathing room).

## 2. Scroll-linked hero depth (AC's `HeroVisual.tsx` already does a version [VERIFIED-FILE])
- **Mechanism:** `useScroll(["start start","end start"])` → `useTransform` → `y: 0→55`; scale/opacity on the same driver.
- **Our adaptation:** keep it, but drive **one** element, and add `motion-reduce:translate-y-0`. Do not add a second parallax layer (the pile-up rule).
- **Cost:** 0 (framer-motion shipped). **Breaks when:** the parallax element is `position:fixed` inside a transformed ancestor, or when Lenis is added on top (double smoothing = nausea reports).

## 3. Pinned chapter with a scrubbed index (EX04; Yaas Energy, The Little Match Girl, Codrops 3D-rotation article)
- **Mechanism:** ScrollTrigger `start:"top top"`, `end:"+=140vh"`, `pin`, `scrub:0.6`, `invalidateOnRefresh`, `anticipatePin:1`; `onUpdate` maps `progress → index`; `gsap.context()` for teardown; `matchMedia` gate at 900 px.
- **Our adaptation:** 3–4 chapters max on the landing ("find / open / share"). Mobile = stacked cards (EX04's `stack` mode is the reference; EX10 the mobile build).
- **Cost:** 44.4 KB gz + licence review. **Breaks when:** the pinned element contains a focusable child (pin reparents the DOM) — test `Tab` through it — or when `scroll-behavior:smooth` is set globally.

## 4. Reveal-on-enter with a scroll progress bar (Quynh Folio, Möbius, Study Hall)
- **Mechanism:** CSS `animation-timeline: view()` + `@supports` guard (lab's `cssReveal`), or `whileInView` once-per-element with `viewport={{ once:true }}`.
- **Cost:** 0 KB. **Breaks when:** content is hidden by default (no-JS/in-hydration gap), or `once:true` is missing and items flicker on reverse scroll.

## 5. Card spotlight + glare + tilt (EX07; DavidHDev/react-bits, magicui, Juan Mora Romero '26)
- **Mechanism:** pointer rect → `--mx/--my` (spotlight centre), `--rx/--ry` (perspective tilt), `--glare` (opacity), all rAF-batched; `@property` registration so the numbers interpolate; layers = surface / hairline / ambient / spotlight / content.
- **Cost:** ~4 KB own code; +60 KB if done with a library for the same pixels [MEASURED, EX07 vs `?tilt=motion`].
- **Breaks when:** tilt is applied to a card that also has `backdrop-filter` (raster cost per frame), or when the card is inside `overflow-x:auto` (the 3D transform creates a new containing block).
- **A11y:** `hover:hover and pointer:fine` only; focus shows the ring, not the tilt.

## 6. Measured indicator (nav pill) (EX08; Headless-UI/Radix selection patterns)
- **Mechanism:** `getBoundingClientRect()` deltas → animate `transform+width+height`; `ResizeObserver` re-measures; reduced motion = set, don't animate.
- **Why measured, not index math:** our subject names vary in length and wrap on tablet; index math breaks the moment a chip wraps.
- **Cost:** 0 KB if CSS `transition` on transform/width; framer-motion `animate` for spring feel. **Breaks when:** fonts load after the first measure (re-measure on `document.fonts.ready`) or the container is `position:static` (pill needs a positioned parent).

## 7. Filter/facet interaction (product-specific, not a showcase trick)
- **Observed:** almost none of the award sites have faceted search — this is where a "premium" reference is *not* a reference. Our truth sources are `radix-ui/primitives`, `headlessui` (virtual-combobox), `zag`, `meilisearch`'s facet UX [VERIFIED-FILE/API].
- **Mechanism:** URL as the state source (AC already drives discovery by URL [VERIFIED-FILE `api/search/route.ts`]); each toggle = `router.replace` with `scroll:false`; optimistic checkbox, no spinner on the whole grid; `aria-live` count; skeletons matching card geometry.
- **Motion:** 150 ms opacity/height on the chip list only, `transition: none` on the results grid (re-render, not animation, is the transition).
- **Breaks when:** the animated container animates `height:auto` (jank), or a filter triggers a full-page scroll reset. **Never** let a filter change scroll the viewport to the top on mobile — that's how "nothing obstructs finding resources" gets violated.

## 8. Bottom sheet vs popover vs dialog (EX10; zag/headlessui)
- **Mechanism:** mobile → sheet (`role=dialog`, `aria-modal`, Escape, focus return, safe-area padding, drag-to-dismiss optional but must not hijack scroll); tablet+ → popover anchored to the trigger (Radix collision handling).
- **Cost:** 2 KB. **Breaks when:** focus trap is applied to a non-modal popover, or the sheet's backdrop swallows the `Tab` order; or `overflow:hidden` on body without restoring scroll position.

## 9. Preview on hover / quick-look (ariakit `hoverType` timeout model)
- **Mechanism:** `pointerenter` + 350 ms timer → `popover` with the doc's own metadata + "Open" CTA; cancel on leave within the grace window; **no thumbnail of the document body** (D2 constraint: no proxying) — cover = generated from metadata/type.
- **Breaks when:** the timer keeps running after unmount (leak), or the popover traps pointer events over the card.

## 10. Share/copy-link feedback (product-specific)
- **Mechanism:** button → `navigator.clipboard.writeText(url)` → `animate` checkmark path draw (SVG `stroke-dasharray`, 220 ms) → `role=status` "Link copied" → back to idle after 1.5 s; reduced motion = text change only, no draw.
- **Cost:** 0 KB. **Breaks when:** clipboard permission denied → must show the URL in a `readonly` input to copy manually (an "empty state" for a success path, which is exactly the kind of case Phase 2 keeps coming back to).

## 11. Section transition without a library (Shader.se article's "selective rendering" + `webgl_postprocessing_transition` [VERIFIED-API])
- **Mechanism:** crossfade two layers with `clip-path`/mask driven by scroll progress; in GL, render only the changing region; in DOM, `view-transition-name` on the swapping element pair.
- **Cost:** 0 KB DOM / 2.9 KB GL. **Breaks when:** VT is used on an element whose geometry differs a lot (the morph looks like a glitch — resize-only morphs need `::view-transition-group` easing tuning).

## 12. Circular-clip theme flip (EX09; common on portfolio/minimal sites)
- **Mechanism:** set `--vt-x/--vt-y` from the clicked button's rect → `document.startViewTransition` → animate `clip-path: circle(0 → 150vmax)` on the new snapshot; `@supports`/presence guard, plain swap otherwise; disable under reduced motion.
- **Cost:** 0 KB. **Breaks when:** AC's inline theme script and a CSS transition both write `data-theme` (double paint), or when the `view-transition` layer sits above the UI and eats clicks (`pointer-events:none` on `::view-transition`).

## 13. Skeleton → content without a pop (react-content-loader discipline)
- **Mechanism:** skeleton = final geometry; `@starting-style`/`opacity` 150 ms on swap; no scale animation on data arrival (scale = CLS-adjacent jank).
- **Breaks when:** counts arrive late and the grid re-wraps (reserve the count slot with `min-width: 2ch; tabular-nums`).

## 14. "Nothing obstructs finding resources" as an interaction budget (the product rule)
Every effect above must pass four questions before it ships:
1. Does it delay the first readable frame? (LCP element must not be animated content)
2. Does it move anything the user is trying to click? (no animation on the results grid)
3. Does it hide information when motion is off or JS fails? (`@supports`-guarded reveals only)
4. Does it survive 200 % zoom and 320 px? (mobile = the EX10 implementation, not a squeezed desktop one)

A pattern that fails any question is redesigned or cut — that is the sentence that separates "premium" from "template with animation pile-up".

---

## Cross-reference

| pattern | lab experiment | verified mechanism source | atlas row |
|---|---|---|---|
| 1,2,4 | EX01 | lab CSS + AC `Reveal.tsx`/`HeroVisual.tsx` [VERIFIED-FILE] | A: typography group |
| 3 | EX04 | `greensock/GSAP` README + gsap.com docs; Codrops 3D-rotation article | A2 #1, A #2 |
| 5 | EX07 | `DavidHDev/react-bits`, `magicui` (read-only; licence flags) | B #11, #12 in ranking |
| 6 | EX08 | `radix-ui/primitives`, `zag` | B (radix/zag rows) |
| 7,8 | EX10 | `headlessui` virtual-combobox, `meilisearch` facet shape | B, C |
| 9 | — | `ariakit` hover timeouts | B #15 |
| 10 | — | clipboard + SVG path draw | — |
| 11,12 | EX09 | `webgl_postprocessing_transition` (live), Codrops Shader.se article | C, A2 #2 |
| 13 | — | `danilowoz/react-content-loader` | B #18 |
