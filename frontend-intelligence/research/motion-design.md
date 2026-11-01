# Motion Design Engineering — Motion/Framer, CSS, SVG, Lottie, Rive, View Transitions

**AK · 2026-11-01 · Domain D**

## 1. The library picture as it actually is today

| Engine | Version (verified 2026-11-01) | License | Status | Notes for us |
|---|---|---|---|---|
| **Motion** (`motion`) | **14.9.0**, 2026-10-30 | MIT | Active, monthly | `motion/react`; peers `react ^18 \|\| ^19`; subpaths `./mini ./m ./debug ./three ./vgpu ./react-client ./react-animate-view` `[VERIFIED-REGISTRY]` |
| **framer-motion** (same project, React alias) | 14.9.0, 2026-10-30 | MIT | Active | Now a thin re-export of `motion` (`motion-dom`, `motion-utils`, `tslib`) `[VERIFIED-REGISTRY]`. Repo `motiondivision/motion` ★34,769, pushed 2026-11-01 `[VERIFIED-API]` |
| **GSAP** | 3.15.0, 2026-04-13 | Standard "no charge" | Active, very stable | See `gsap-and-scrolltrigger.md` |
| **react-spring** | `@react-spring/three` 10.1.2, 2026-06-24 | MIT | Active (repo pushed 2026-11-01, ★29,260) | Overlaps Motion; no reason to add `[VERIFIED-REGISTRY/API]` |
| **anime.js** | 4.5.0, 2026-06-22 | MIT | Active | Excellent standalone, but we already have two engines |
| **Lottie** (lottie-web path) | `lottie-react` 3.1.2, 2026-09-07 | MIT | Mature/slow | `lottie-web` ≈ **250 KB** parsed; JSON files carry full vector data |
| **dotLottie** | `@lottiefiles/dotlottie-react` 0.21.0, 2026-10-30 | MIT | Active | WASM renderer, smaller payloads, `.lottie` binary; adds a WASM fetch |
| **Rive** | `@rive-app/react-canvas` 4.38.0, 2026-10-27 | MIT | **Very active** (near-weekly) | WASM runtime + `.riv` state machines; interactive, animatable-by-input |
| **View Transitions (browser)** | native | — | **Baseline for same-document**; Chromium 125+ for transition types/`view-transition-class` `[VERIFIED-DOC]` | Free, compositor-driven |
| **React `<ViewTransition>`** | **stable in React 19.3** (2026-09-09) | MIT | In `react` itself | DOM-only; **project is on 19.2.6 → needs the upgrade** `[VERIFIED-DOC/FILE]` |
| **Theatre.js** | 0.7.2, 2024-05-19 | Apache-2.0 | **Stale** | Not a dependency to take `[VERIFIED-REGISTRY]` |
| **Lenis** | 1.3.27, 2026-10-15 | MIT | Active | See scroll doc |

## 2. Motion vs GSAP — decision table for *this* app

| Criterion | Motion 14 | GSAP 3.15 | Winner here |
|---|---|---|---|
| Model | Declarative, tied to component state/props (`initial/animate/exit/variants/layout`) | Imperative timelines on DOM/anything | **Motion** for UI state; **GSAP** for scenes |
| React integration | Native; no extra lib | `@gsap/react@2.1.2` or manual `gsap.context()` + cleanup | **Motion** |
| Mount/unmount | `AnimatePresence` — best-in-class | manual | **Motion** |
| Layout / shared-element | `layout` / `layoutId` (projection) — same-page only | `Flip` — any DOM change | Tie; **GSAP Flip** wins for grid reflow |
| Scroll | `useScroll`/`useTransform` (great for range mapping, `scrollXLength` since 14.7.0) | ScrollTrigger (pinning, scrub, batch, snap) | **GSAP** for pinning; **Motion** for simple range drives |
| Text splitting | manual | `SplitText` (rewritten, ~50% smaller, reflow-safe) `[REPORTED S2]` | **GSAP** |
| Non-DOM targets | **`motion/three` `threeEffect`: animates Three.js objects, materials, shader uniforms, TSL nodes** `[VERIFIED-DOC CHANGELOG 13.2.0]` | `gsap.to(uniforms.uTime…)` works fine | Tie — and both mean *no extra animation lib for 3D* |
| Rendering | Hybrid: Web Animations API where possible + JS fallback; hardware-accelerated independent transforms since 14.2.0; accelerated `backgroundColor`/SVG since 12.43 `[VERIFIED-DOC CHANGELOG]` | Own JS engine, extremely reliable across browsers | **Motion** on compositor-friendly props |
| Bundle | ~35 KB core-ish, tree-shakable `[REPORTED S1]`; `m`/`LazyMotion`+`domAnimation` shrinks it further | ~22–27 KB core, plugins à la carte `[REPORTED S2]` | Tie at our scale |
| License | MIT | free-but-not-OSS | **Motion** (cleaner) |
| Docs | Excellent, API-first | Excellent, tutorial-first | tie |

**Conclusion `[AK-RECOMMENDATION]`: keep Motion as the *interaction* engine, add GSAP only as the *scroll-scene* engine.** If AO wants a single dependency, choose **Motion alone** and implement pinning with `position: sticky` + `useScroll`. Do not choose "GSAP alone" — losing `AnimatePresence`/`layout` in a React app is a real cost.

## 3. View Transitions — the highest-value, lowest-cost item found in this research

Verified from the official Next.js guide (read directly `[VERIFIED-DOC]`):

- Works in the App Router **with no configuration** on Next 16.4 + React 19.3; the old `experimental.viewTransition` flag is gone (search of Next 16.4.2's config schema found no such key `[REPORTED]`).
- Triggers: **Transitions only** — `startTransition`, `<Suspense>` reveals, `useDeferredValue`. "Regular `setState` calls do not trigger them." Route navigation in Next.js *is* a transition → `<ViewTransition>` animates navigation automatically.
- Four animation kinds: `enter`, `exit`, `update`, `share`.
- Shared element = same `name` prop on both pages; morph works with **no CSS at all**; customize with `share="morph" default="none"` + `::view-transition-group(.morph)` / `::view-transition-image-pair(.morph)` and `transition-types` (`nav-forward`/`nav-back`) on `<Link>` for directionality.
- **Gotchas (explicitly documented, must reach AC):**
  - With `default="none"` and *no* `share` prop, "the pair silently stops morphing."
  - The morph only plays when the destination renders in the **same commit** (prefetched/cached). If it suspends to a fallback first, no pair forms → use `default="none"` on the pair and animate the reveal via a `Suspense` fallback `exit` + content `enter`.
  - During a transition `::view-transition` overlays the page and **captures pointer events** → `::view-transition { pointer-events: none; }`.
  - Some animations behave differently in Safari.
  - Unsupported browsers: app works normally, no animation. No polyfill needed.
- React 19.3 changelog includes `fix a <ViewTransition> crash in Mobile Safari #35337` and `…with SuspenseList #35520` `[VERIFIED-DOC react.dev]` → **19.3.1 specifically, not 19.3.0**, and not 19.2.6 where the API was still experimental.
- Motion 13.4.0 added **`AnimateView`: "View transitions for React 19.3, built on React's `ViewTransition`"** `[VERIFIED-DOC CHANGELOG]` — meaning the two systems compose: Motion for the choreography inside, native VT for the boundary between pages.

### Our application (document hub ⇒ navigation-heavy)
1. **Card → detail morph.** Wrap the card's title/preview and the detail hero in `<ViewTransition name={`doc-${id}`}>`. Instantly reads as "world-class" and is ~15 lines.
2. **Directional nav:** `transitionTypes={['nav-forward']}` list→detail, `nav-back` detail→list.
3. **Suspense reveal** for the detail page's related-documents block: skeleton → content crossfade instead of a pop.
4. **Theme switch as a same-document view transition** — a circular clip from the toggle position. This is the "dark/light theme transition" the brief asks for and it costs no JS library (reference: `rudrodip/theme-toggle-effect`, ★817, no license file `[VERIFIED-API]` → **read, do not copy**).
5. **Palette → route handoff** (⌘K select morphs into the detail card).
6. Add `::view-transition { pointer-events: none; }` and an `@media (prefers-reduced-motion: reduce) { ::view-transition-group(*) { animation: none } }` reset.

**Cost: 0 KB. This should be Phase 1, immediately after the React upgrade.**

## 4. CSS animations (still the right answer most of the time)

- Use for: hover transitions, focus rings, ambient loops (the existing `float`/`breathe` keyframes `[VERIFIED-FILE]`), `@starting-style` entry animations, scroll-driven reveals (`animation-timeline`), and theme-crossfade `transition` on tokens.
- Tailwind v4 note (verified `[REPORTED S7]`): theme values are plain CSS variables → `transition: --token` needs `@property` registration to interpolate; simpler to transition the *utility-backed properties* (`background-color`, `color`, `border-color`) which `@theme` already swaps.
- Animate only `transform`, `opacity`, `filter`, `clip-path`, `mask`. Never `width/height/top/left/margin/box-shadow` on large surfaces (`box-shadow` animates on the main thread and repaints; our `.glass-card:hover` animates it at 200 ms — acceptable on a card, not on 200 cards).
- `backdrop-filter` is *static* only. Never animate blur radius (the classic 60→20 fps mobile killer).

## 5. SVG animation

Cheap, scalable, themable, and works in every browser: `stroke-dasharray/offset` draws (logo/rules), `clipPath` masks for scroll reveals (Codrops' March 2026 SVG-mask set is exactly this technique `[REPORTED S8]`), `<mask>` + gradient for "ink" wipes, `shape()` (Baseline 2026 `[REPORTED S9]`) for organic clip geometry. **Recommended over Lottie for anything we can draw ourselves** — no runtime, no designer dependency.

## 6. Lottie vs Rive — comparison

| | Lottie (lottie-web / dotlottie) | Rive |
|---|---|---|
| Payload | `lottie-web` ~250 KB parsed `[REPORTED]`; `dotlottie` uses a WASM (~600 KB binary, cached) | WASM runtime, cached, plus small `.riv` |
| File size | JSON heavy (vector data), `.lottie` better | compact |
| Interactivity | mostly linear playback; `goToAndStop` scrubbing hack for scroll | **state machines, inputs, blending** — built for interaction |
| Authoring | After Effects + Bodymovin (Designer must know it) | Rive editor (free tier), exports interactive logic |
| Dev ergonomics | `useLottie({animationData, loop, autoplay})` | `useRive({src, stateMachines, inputs})` + `rive.stateMachineInputs(...).set("hover", true)` |
| Reduced motion | must be handled manually (pause at frame 0) | same, one line via state machine |
| Maintenance | `lottie-react` 3.1.2 (2026-09-07) | `@rive-app/react-canvas` 4.38.0 (2026-10-27), **very active** |

**`[AK-RECOMMENDATION]` — for this project: neither.** Both add a runtime to animate things we can express as CSS/SVG: an entrance, a loader, a hover flourish. The only legitimate trigger is **"a designer hands us an animation file"**. If that ever happens: **Rive** if it is interactive (button/loader with hover/state), **dotLottie** if it is a decorative one-shot (it beats legacy lottie-web on payload). Also note neither renders inside a projector-mode 18 px root context differently — verify.

## 7. Cursor, hover and micro-interaction patterns worth having

| Pattern | Implementation | Cost | Verdict |
|---|---|---|---|
| Magnetic button (translate toward pointer, spring back) | `useMotionValue`+`useSpring`, or the tiny `mulkatz/use-magnetic` (`★1`, MIT, 2026-10-03, "<1.3 KB gzipped, a11y-first") `[VERIFIED-API]` | ~0 | ✅ **do** (on primary CTA only) |
| Spotlight/pointer-tracked card border | CSS: `--mx/--my` set on `pointermove` (throttled to rAF) → `radial-gradient` in a `::before`; the `@property`-registered angle for conic borders | ~0 | ✅ **do** (this is the "premium card" signal) |
| Tilt-on-hover card | CSS `perspective(900px) rotateX/rotateY ±4deg` + `translateZ` on children | ~0 | ✅ **do**; skip if reduced-motion or coarse pointer |
| Custom cursor (dot + ring lerp) | Motion `useSpring` on two divs; must degrade on `(hover: none)` | low | ⚠️ **optional**; never hide the native cursor over interactive elements (usability), and it fights projector use |
| Hover "beam"/sheen sweep | Existing `group-hover` glow on the preview area `[VERIFIED-FILE]`; gradient translate on `::after` | ~0 | ✅ keep |
| Cursor-follow fluid/distortion trail | `PavelDoGreat/WebGL-Fluid-Simulation` ★16,786 (MIT, **last push 2024-11-12 → stale**) `[VERIFIED-API]` | full-screen WebGL, mobile-hostile | ❌ reject |
| Ripple on click | CSS keyframes on pointerdown | ~0 | ⚠️ skip — Material-ism, off-language |
| Text scramble on hover | GSAP `ScrambleText` or `vikingmute/scrambl` (★37, MIT, 2026-05-11) `[VERIFIED-API]` | low | 💡 use *once*, on a heading, as an easter egg; never on document titles (legibility during study) |

Rule `[AK-RECOMMENDATION]`: **hover must never be the only affordance.** Every hover state needs a `:focus-visible` equivalent; touch devices need the same visual weight via `:active` or persistent state. The existing CSS already follows this (`.glass-card:hover` + a real focus ring `[VERIFIED-FILE]`) — keep that discipline.

## 8. Loading / waiting states

- `app/loading.tsx` already exists `[VERIFIED-FILE]` — make it *match the layout* (skeleton grid, not a spinner) to protect CLS.
- Skeleton shimmer: CSS `background-position` animation on a `linear-gradient` — 0 JS, and pause with `prefers-reduced-motion`.
- For the ⌘K palette: no spinner; results are local (JSON) — render instantly, show empty-state copy instead.
- For the detail page: `<Suspense>` + `<ViewTransition default="none">` to make the fallback→content swap a crossfade (§3).
- Never block first paint on fonts: `next/font` self-hosts and preloads already `[VERIFIED-FILE]`; add `size-adjust` fallback metrics if Newsreader causes a shift.
