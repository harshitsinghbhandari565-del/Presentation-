# Scroll Animations & Scrolling Architecture

**AK · 2026-11-01 · Domains A/B/H of the brief**

## 1. Four architectures, ranked for this project

| Architecture | Mechanism | Main-thread cost | Where it belongs here |
|---|---|---|---|
| **A. Native CSS scroll-driven** | `animation-timeline: view()/scroll()` — compositor progress | **~0** (no JS, survives main-thread jank) | ✅ Default for every reveal, parallax-lite and progress rail |
| **B. IntersectionObserver → class flip** | IO fires, CSS transition plays | ~0 per frame; cheap | ✅ Fallback where A is missing; also for "has entered once" state |
| **C. ScrollTrigger scrub/pin** | rAF-linked tween, `pinType: transform` | Moderate (JS per frame) | ⚠️ Only for pinned multi-beat scenes the brief calls "cinematic" |
| **D. Smooth-scroll hijack (Lenis / ScrollSmoother)** | rAF lerped scroll position | Continuous rAF; **INP pressure**; breaks `scroll-behavior: smooth` | ❌ Not by default. Optional Phase 5 with AO sign-off |

**The single most useful research conclusion here:** 2026-era scroll craft is dominated by **C** (GSAP/Lenis, "premium studio" sites) while 80% of a *document-discovery* site's needs are met by **A** at zero cost `[VERIFIED-DOC MDN]` + `[REPORTED S8]`. The professional move is A-everywhere, C-in-two-places.

## 2. Verified technique catalog (with the code AC should actually write)

### 2.1 Reveal on enter (replaces most `whileInView`)

```css
@keyframes reveal-up { from { opacity: 0; transform: translateY(1.25rem); } to { opacity: 1; transform: none; } }
@supports (animation-timeline: view()) {
  .reveal { animation: reveal-up linear both; animation-timeline: view(); animation-range: entry 0% entry 60%; }
}
@media (prefers-reduced-motion: reduce) { .reveal { animation: none; opacity: 1; transform: none; } }
```
Gotchas verified from practice guides `[REPORTED S8]`: `animation-duration: auto` (or `linear both`) is mandatory — the default `0s` makes scroll animations invisible; `animation-timeline` is **not** part of the `animation` shorthand; `both` fill prevents pre/post-entry snapping; author the **final state as the default** so no-JS/unsupported = readable content.

### 2.2 Scroll progress rail (the "premium" tell, 3 lines)

```css
.progress { position: fixed; inset: 0 0 auto 0; height: 2px; transform-origin: 0 50%;
  animation: grow linear both; animation-timeline: scroll(root block); }
@keyframes grow { from { transform: scaleX(0) } to { transform: scaleX(1) } }
```
Prefer `scaleX` over `width` (no layout). On this app it doubles as an "am I still in the library" cue under the sticky header.

### 2.3 Pinned section with scrub (ScrollTrigger) — exact safe shape

```ts
const ctx = gsap.context(() => {
  const tl = gsap.timeline({ scrollTrigger: { trigger: ".scene", start: "top top", end: "+=160%", pin: true, scrub: 1, anticipatePin: 1 } });
  tl.to(".pane-a", { autoAlpha: 0, yPercent: -8 }).fromTo(".pane-b", { autoAlpha: 0, yPercent: 8 }, { autoAlpha: 1, yPercent: 0 });
}, ".scene");
return () => ctx.revert();          // ← not optional
```
Rules proven by the Codrops 2026 tutorial set `[REPORTED S8]` and the Lenis README `[VERIFIED-DOC]`: one timeline per scene; overlap beats with `"-=0.6"`; `scrub: true` for 1:1, a number (0.7–2.5) for trailing inertia; drive *direction* from `tl.scrollTrigger.direction`; `ScrollTrigger.refresh()` after any async layout (fonts, images, **and after the search results reflow** — this is the bug AC will actually hit here).

### 2.4 Sticky-first, JS-second

The app's header is already `sticky top-0` `[VERIFIED-FILE]`. Native `position: sticky` + `z-index` layering gives "stacking cards" and "sticky sidebar" for free; ScrollTrigger `pin` should be reserved for full-viewport scenes because it wraps the element in a pin-spacer and mutates layout `[REPORTED S2]`.

### 2.5 Horizontal scroll

Cheapest correct implementation on this project: a `overflow-x: auto` + `scroll-snap-type: x mandatory` rail (`scroll-snap-align: start`) — native, keyboard/wheel/trackpad/touch all work — instead of translating Y-scroll into X-scroll. Reserve scrubbed horizontal for a single optional scene.

### 2.6 Lenis, if (and only if) AO approves

Canonical, verified wiring `[VERIFIED-DOC — lenis README]`:
```ts
const lenis = new Lenis({ lerp: 0.08, wheelMultiplier: 1.4 });     // no autoRaf when GSAP drives it
lenis.on("scroll", ScrollTrigger.update);
const raf = (time: number) => lenis.raf(time * 1000);
gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0);
return () => { gsap.ticker.remove(raf); lenis.destroy(); };          // leak guard (documented trap)
```
Non-negotiables found in the same docs/troubleshooting: `<ReactLenis>` from `lenis/react` is the supported React path with `useLenis()` for programmatic `scrollTo`; **`import 'lenis/dist/lenis.css'` is required**; **remove `html { scroll-behavior: smooth }`** (present today `[VERIFIED-FILE]`); never run `autoRaf: true` *and* the GSAP ticker; one instance per page; avoid `syncTouch: true` (native touch is better; also keeps iOS rubber-banding); `data-lenis-prevent` marks nested scrollers (the palette list!). Failure modes: fixed/sticky elements and `position: fixed` overlays need care; ScrollTrigger must be registered *after* Lenis exists; skip entirely when reduced motion is set.

## 3. Parallax without the cost

| Technique | Cost | Verdict |
|---|---|---|
| `background-attachment: fixed` | repaint on mobile, broken on iOS | ❌ never |
| `yPercent` scrub on a wrapper (GSAP) | per-frame transform | ⚠️ fine for ≤3 elements |
| CSS `animation-timeline: view()` + `translateY` keyframes | compositor | ✅ **use this** (Codrops "Sticky Grid Scroll" uses ±100% `yPercent` wrappers `[REPORTED S8]`) |
| Two-stack depth (duplicate layers, `translateZ(-1px) scale(2)`) | free but fiddly | ⚠️ only in a dedicated 3D-ish hero |
| Mouse-parallax on the ambient blobs | rAF + lerped transform | ✅ cheap, already 80% implemented by `AmbientBackground`'s float keyframes `[VERIFIED-FILE]` — add a `pointer`-driven offset on the same three divs |

## 4. Interaction-pattern observations from 2026 scroll sites `[REPORTED S8, S10]`

1. **Motion is bound to *meaning*, not to position** — Codrops 2026 sets (SVG mask reveals, sticky grids, camera-path galleries) all tie a beat to a content change, not to "you scrolled 40%".
2. **One pinned scene per page**, at the top. Below it, the page returns to ordinary fast scrolling — that contrast is what reads as premium.
3. **Velocity as an input** (Codrops "Scroll-Reactive 3D Gallery… Velocity and Mood-Based Backgrounds", 2026-03-09): fast scroll → stronger distortion. For our hub: fast scroll → suppress staggered reveals (they'd never finish).
4. **`Flip` for grid relayout** (Codrops "Infinite GSAP Scroll Gallery with Parallax and Flip Transitions", 2026-07-30): exactly our search-refinement moment — cards should *travel* to their new positions instead of snapping.
5. **Scroll-linked text** (SplitText line masks) is now cheap and reflow-safe (SplitText 3.13 rewrite dropped the `position:absolute` hack `[REPORTED S2]`) — use on the hero title only.
6. **End-of-page matters**: award sites animate the footer (contact block, oversized wordmark) — our footer is a one-line `<p>` today `[VERIFIED-FILE]`.

## 5. What we deliberately do *not* copy

Infinite-scroll feeds (bad for a "did I see everything?" study tool and hostile to screen readers), scroll-jacked wheel hijacking, horizontal-only navigation, preloader percentage gates on a page whose LCP is a text headline, and scroll-linked *opacity* on large text blocks (perceived-contrast failure in light mode).

## 6. Failure modes to design against (specific to this app)

| Risk | Trigger | Mitigation |
|---|---|---|
| Trigger positions drift | Search filters change result height | `ScrollTrigger.refresh()` in a `useEffect` on `[filtered]`; `invalidateOnRefresh: true` |
| Font-swap jump | Newsreader italic arrives late | `next/font` self-hosts, **but** `globals.css` redefines `--font-editorial` and bypasses next/font's adjusted fallback → see audit §5.5; fix the token, then re-measure hero shift |
| Double-smoothing | `html{scroll-behavior:smooth}` + Lenis | remove the CSS rule when Lenis is used |
| Pin + `backdrop-filter` | `.glass-card` inside a pinned section | use a solid `bg` for pinned content; blur is a per-frame repaint |
| Reveal never completes | staggered reveal inside a `scrub` timeline | scrub only single properties; staggered reveals must be trigger-based |
| Hidden LCP | `opacity: 0` initial state on the hero headline | never hide the LCP element; animate `y`/`clip-path` only, and `initial={false}` on SSR-critical text |
| `overflow: hidden` ancestors | `animation-range: entry` on nested scrollers | set `timeline-scope` or flatten; audit `AmbientBackground`'s `overflow-hidden` wrapper `[VERIFIED-FILE]` |
| Z-index war | fixed ambient (z-0) + sticky header (z-50) + pins | document the scale: ambient 0, page 10, header 50, palette 100, toast 110 |
