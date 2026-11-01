# Interaction Breakdowns — 10 interactions, mechanism → code → values

**AK · 2026-11-01 · Domain E/G.** Each breakdown: **Reference → Mechanism → Implementation → Timing values → Accessibility → Mobile → Applied to our sections → Failure modes.**
All mechanisms verified from official docs `[VERIFIED-DOC]` (GSAP 3.15, Motion 14.9, Lenis 1.3.27, Next.js VT guide, MDN scroll-driven animations, R3F v9) or from the exact cited repos `[VERIFIED-API]`. No code is copied from any repo — snippets are AK-authored pseudocode.

---

## 1. Hero reveal curtain (clip-path + mask wipe + blur clear)

**Reference:** studio-site standard (GSAP SOTY-nominee work `[REPORTED S10]`; Codrops mask-transition family `[VERIFIED-LISTING]`).
**Mechanism.** A full-viewport panel (typographic, not image) sits above content; `clip-path`/mask sweeps it away; content underneath does a small `y` + `blur → 0` + `opacity` lift. The blur-to-sharp is the premium cue: the eye reads "focus pulling" as craft.
**Implementation.** Server-safe: render markup normally, animate on mount in a client leaf. Gate on first paint so it never replays on back-navigation (a `sessionStorage` flag, not a cookie).
```
tl = gsap.timeline({ defaults:{ ease:'power3.out' } })
   .to(curtain, { yPercent:-100, duration:0.7, ease:'expo.inOut' })
   .from('.hero-title .line', { yPercent:110, duration:0.8, stagger:0.08 }, '<0.1')
   .from('.hero-sub',         { opacity:0, y:12, filter:'blur(6px)', duration:0.5 }, '-=0.3')
```
**Values.** total ≤ 900 ms · curtain 600–700 ms · line stagger 70–90 ms · `power3.out` / `expo.inOut` · nothing animates after 1.1 s.
**A11y.** `prefers-reduced-motion: no-preference` wrapper (repo already strips animations at 0.01 ms `[VERIFIED-FILE globals.css]` → the curtain panel must **not** be visible by default, or reduced-motion users see a wall). Title lines use a CSS-driven `overflow:hidden` mask, and the real `<h1>` text stays in one node for screen readers and for LCP.
**Mobile.** Drop the blur (it composites a full-screen layer), keep the wipe at 0.5 s; never block scroll during the curtain.
**Our sections.** Hero of `src/app/page.tsx`. **Must not delay the search field's interactivity** — search is the task.
**Failure modes.** ① animating the LCP element's opacity from 0 → LCP +400 ms (audit found no curtain today, so this is our budget to spend carefully); ② replay on every visit → annoying; ③ a `useEffect` gate that also delays data fetching (currently the case: the whole page is `"use client"` with client fetch `[VERIFIED-FILE]` → do the server/leaf split first).

## 2. Card → detail shared-element morph

**Reference:** Next.js View Transitions guide `[VERIFIED-DOC]`; Codrops Flip-based gallery (2026-07-30) as the pre-native fallback.
**Mechanism.** Both pages render `<ViewTransition name={id} share="morph" default="none">`; the UA snapshot-pairs them across the router transition and animates position/size; `active`/`before/after` pseudo-classes let us crossfade the *contents*.
**Implementation.** Name must be unique and identical on both sides → use the presentation `id` (`presentUrl`/`embedUrl` are per-record `[VERIFIED-FILE]`). Keep the card's DOM structure similar (same inner element order) so the crossfade doesn't jump.
```
<ViewTransition name={`doc-${p.id}`} share="morph" default="none">
  <DocCard .../>
</ViewTransition>
```
**Values.** UA default ≈ 500 ms; tune with `::view-transition-group(*){ animation-duration:420ms; animation-timing-function:cubic-bezier(0.22,1,0.36,1) }`. Content crossfade 200 ms delayed 120 ms.
**A11y.** Zero extra work — history/roles are untouched (unlike JS libraries that re-parent nodes).
**Mobile.** On constrained devices the snapshot can cost a frame; consider disabling with `viewTransition: disabled` at <768 px if FPS drops.
**Our sections.** `document-grid` → `/presentation/[id]`. **Do NOT try to morph the Slides/Dropbox iframe** — the morph is the *cover*, not the document (see `research/document-discovery-ui.md` §5).
**Failure modes.** ① forgetting `default:'none'` silently disables morphing (documented Next footgun); ② `pointer-events` left stuck during the transition (documented fix in the guide's FAQ); ③ React 19.2.6 needs the experimental flag — React 19.3 ships it stable `[VERIFIED-API]`; ④ a `backdrop-blur` card morphing through a blur-heavy parent gets expensive.

## 3. Sticky two-column explainer ("how discovery works")

**Reference:** `research/scroll-animations.md` §4 (MDN + GSAP + Figma Config 2026).
**Mechanism.** Grid row: left `position:sticky; top: calc(var(--header-height) + 1rem)` (the repo's existing pattern `[VERIFIED-FILE globals.css]`), right = tall column of steps; steps activate with `animation-timeline: view()` or ScrollTrigger; the left panel *content* changes via `data-active` + a 200 ms crossfade.
**Values.** activation `start:'top 65%'`; crossfade 200–250 ms; no vertical motion on the left panel.
**A11y.** Sticky is native → keyboard/AT read a normal document; keep every step in the DOM and readable without animation.
**Mobile.** Collapse to a single column, sticky disabled (`position: static` under 1024 px) — sticky + short viewports causes jitter.
**Our sections.** New `how-it-works` section (today the whole page is one bento — a sticky chapter gives the landing page *shape*).
**Failure modes.** ① sticky element with no background → content bleeds through; give it a `--surface-elevated` scrim; ② animating `height` when the step count changes → `Flip` it instead.

## 4. Magnetic button + spotlight ring

**Reference:** `mulkatz/use-magnetic` (1.3 KB, 1★ `[VERIFIED-API]`) — **do not adopt the repo; the technique is 15 lines.**
**Mechanism.** On `pointermove`, translate the button toward the cursor (≤ 8–10 px), counter-translate the label slightly more; a CSS radial-gradient follows via a `pointer: fine` media query.
```
const R = 90;                       // interaction radius
onPointerMove(e){
  const { left, top, width, height } = el.getBoundingClientRect();
  const dx = e.clientX - (left + width/2), dy = e.clientY - (top + height/2);
  const d = Math.hypot(dx, dy) / R;
  if (d < 1) gsap.to(el, { x: dx*(1-d)*0.35, y: dy*(1-d)*0.35, duration:0.4, ease:'power3.out', overwrite:'auto' });
}
onPointerLeave(){ gsap.to(el, { x:0, y:0, duration:0.6, ease:'elastic.out(1, 0.4)' }); }
```
**Values.** pull ≤ 10 px · enter 0.4 s · exit 0.6 s elastic · spotlight `opacity 0 → 1` over 200 ms.
**A11y.** `pointer: fine` only; keyboard users get the existing `focus-visible` ring (already global `[VERIFIED-FILE globals.css]`); never make the *hit area* move out from under the pointer — translate the visual layer, not the button box, or use small pull so the target stays effectively static.
**Mobile.** off (`@media (pointer: coarse) { …: none }`); the repo already has `touch-callout: none` + tap-highlight rules to inherit `[VERIFIED-FILE globals.css]`.
**Our sections.** `Browse presentations` CTA, `Open presentation`, `ThemeToggle`.
**Failure modes.** ① reading `getBoundingClientRect()` inside the move handler → forced layout (cache on enter/leave); ② magnetic + `layout` animation on the same element = jitter (documented Motion layout caveat).

## 5. Text reveal / decode on entry

**Reference:** GSAP SplitText (free from 3.13 `[VERIFIED-DOC]`); `scrambl` (37★ `[VERIFIED-API]`) for decode.
**Mechanism.** Split to lines at render, each line inside an `overflow:hidden` mask, `yPercent:110 → 0` with stagger. Decode = per-character glyph cycling on a `requestAnimationFrame` ticker with a settle threshold.
**Values.** line stagger 60–90 ms · per-line 700–800 ms `power4.inOut` · decode ≤ 1.2 s · **one hero-level element only** · never split body text.
**A11y.** Splitting must not break words for AT: set `aria-label` on the unsplit element (or keep the original text in a visually-hidden node) — SplitText inserts nodes and can fragment speech.
**Mobile.** keep lines, drop scramble (CPU + reflow).
**Our sections.** hero eyebrow or the hero verb line only.
**Failure modes.** ① re-splitting on resize → wrong wrapping; use `SplitText.revert()` before re-measure; ② splitting a long list → hundreds of DOM nodes; ③ animating `opacity` of scrambled chars → illegible; animate weight/color instead.

## 6. Filter chips that reflow the grid (Flip / layout)

**Reference:** Motion 14.1 `layout` `[VERIFIED-DOC changelog]`; GSAP Flip (standard licence `[VERIFIED-DOC]`); edu-UX rules `[REPORTED S12/S13]`.
**Mechanism.** Measure positions → mutate the list → animate deltas. Motion: `LayoutGroup` + `layout` + shared `layoutId` per card, chips crossfade labels.
**Values.** 300–380 ms · `easeOut`/`[0.22,1,0.36,1]` · label swap 150 ms · **no stagger** (a filtered result set must feel instant, not choreographed).
**A11y.** Result count in `aria-live="polite"`; focus returns to the chip after click; `role="group"` + `aria-pressed`.
**Mobile.** keep the FLIP (it prevents jump-scare reflow) but drop `layout` on multi-child subtrees (documented performance caveat).
**Our sections.** `filter-chips` → `document-grid`; the `subject-focus` tile ordering; palette results.
**Failure modes.** ① layout animation + transform-based hover on the same node (documented "don't mix transforms with layout"); ② animating `width` instead of FLIP for chip label change; ③ infinite/animated skeleton while filtering → the anti-pattern the library-UX sources flag; ④ reordering the array on each keystroke → thrash: keep filter state in URL params.

## 7. Pinned scroll scene (chapter with horizontal scroll)

**Reference:** `research/scroll-animations.md` §4.2; GSAP ScrollSmoother docs `[VERIFIED-DOC]`.
**Mechanism.** Pin the section, drive `x: -(panelWidth - viewportWidth)` from a scrubbed timeline, `invalidateOnRefresh:true`, `matchMedia` for mobile.
**Values.** scrub `0.6–1` (never bare `true`) · total scroll length ≤ 2.5× viewport · enter/exit `power2.inOut` · 4–6 panels.
**A11y.** Pins are scroll-driven → all content stays in normal reading order for AT; keyboard scrolling must still traverse it (so don't `overflow:hidden` the panels).
**Mobile.** flatten to a stacked list or a native `overflow-x:auto` snap carousel; **never pin on touch** — `syncTouch` with Lenis causes "jumping" and browser-UI glitches `[VERIFIED-DOC lenis README]`.
**Our sections.** `subject-focus` when subject count exceeds what one bento row can hold.
**Failure modes.** ① pinning + Lenis `autoRaf` + `gsap.ticker.add` = double RAF (documented); ② missing `ScrollTrigger.refresh()` after images/fonts load → wrong pin ends (the audit says there is no `next/font` config `[VERIFIED-FILE]`, so font-swap metrics will move things — load fonts properly first); ③ pinning inside a transformed ancestor.

## 8. Scroll progress as ambient signal (the "wow without cost" move)

**Reference:** MDN scroll-driven animations `[VERIFIED-DOC]`; Awwwards Dev-Award patterns `[REPORTED S10]`.
**Mechanism.** A fixed 2 px bar: `animation-timeline: scroll(root block)` with `scaleX` from 0 → 1 — pure compositor, zero JS. In the hero, one decorative layer gets `view()` parallax with **no** `@supports` fallback.
**Values.** bar `transform-origin:left`; parallax `--range: -60px`; nothing else.
**A11y.** Decorative: `aria-hidden="true"`; `@media (prefers-reduced-motion: reduce){ animation:none }`.
**Mobile.** fine — CSS scroll-driven animations run on Android Chrome 115+ and iOS 26+ `[VERIFIED-FETCH MDN]`.
**Our sections.** global (header hairline) + hero garnish.
**Failure modes.** `overflow:hidden` on an ancestor creating a wrong scroll container (documented); a scroll-linked opacity change on a `position:fixed` header triggering sticky repaint (the audit's header has `backdrop-blur` `[VERIFIED-FILE globals.css]` — keep the bar outside it).

## 9. Command palette (⌘K) upgrade

**Reference:** `dip/cmdk` 13,057★ MIT, last push 2025-10-29 `[VERIFIED-API]`; repo already ships a custom palette `[VERIFIED-FILE]`.
**Mechanism.** Dialog + combobox pattern: input → filtered list with `role="listbox"`, `aria-activedescendant`, arrow nav, group headings, recents.
**Applied to us.** Make the palette the **search entry point**, not just navigation: results = documents + subjects + courses + "open in Slides" actions; each result shows the matched field.
**Values.** open 150–200 ms scale 0.98→1 + fade; backdrop 150 ms; typing → no animation on results (instant).
**A11y.** Real focus trap + return focus + `Esc`; do not render the list inside a scrollable container without `scroll-into-view` handling.
**Failure modes.** ① palette as the only discovery path (library-UX sources: search must be visible, not icon-only `[REPORTED S13]`); ② opening the palette on `/` breaks inputs (guard with target check); ③ if Lenis is present, its scroll must be locked while the dialog is open (`data-lenis-prevent` on the list `[VERIFIED-DOC lenis README]`).

## 10. Theme toggle as a morphing "lamp" (brand-adjacent delight)

**Reference:** `rudrodip/theme-toggle-effect` (817★ `[VERIFIED-API]`) for the circular-clip idea; Motion 14 for `useSpring`.
**Mechanism.** Two candidate implementations — **choose by cost**:
* **(a) CSS View Transition circular clip** (≈ 0 KB, no JS library): wrap the toggle in `<ViewTransition share="reveal">` (Next) or use `document.startViewTransition` + `--vt-clip-*` custom props; animates the root cross-fade as an expanding circle from the button.
* **(b) Motion morph** (current, works today): a lamp icon whose shade rotates/opens and whose light `scale`s into the background wash — the repo already does a `useSpring` light spread + `layoutId` shade `[VERIFIED-FILE]`.
**Recommendation.** Keep (b) — it is *on-brand* (a projector/reading lamp fits a study tool) and already built; **add (a) for the page-level theme cross-fade** so switching themes also transitions content rather than snapping. Do not do both simultaneously in the same transition (double animation).
**Values.** shade 0.5 s `easeOut`; light spread 0.7 s spring (existing config: stiffness 120 / damping 20 `[VERIFIED-FILE]`); page clip 350–450 ms.
**A11y.** `aria-pressed` / label describing the state; respect `prefers-color-scheme` (the repo has a system mode `[VERIFIED-FILE]`); skip the clip under reduced motion but **always** apply the theme.
**Failure modes.** ① FOUC on first paint — keep the inline theme script exactly where it is; ② animating `filter: invert` on `html` (cheap but ugly on images); ③ the existing `!important` dark overrides will keep biting until the token refactor (`technical-guides/implementation-recipes.md` R2).

---

## Cross-cutting rules for all ten

1. One **enter** transition per element; hover = feedback (fast, small); never a second entrance on hover `[REPORTED S4/S10]`.
2. Everything on `transform`/`opacity`/`filter`; `will-change` only while animating; `contain: paint` on card clusters.
3. Every animated section must degrade to **static-but-correct** when: reduced-motion · CSS-scroll-unsupported · WebGL-unsupported · JS-off (SSR) · 3G.
4. Any scroll-driven section gets a documented `end`/`once`; nothing may block reading.
5. Mobile is the default target (students on mid-range Android); desktop is where the garnish appears.
