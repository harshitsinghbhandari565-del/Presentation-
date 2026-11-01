# Technology Comparisons

**AK · 2026-11-01 · Domain B.** Six head-to-heads the mission requires, each decided **for this app** (Next 16.2.6 + React 19.2.6 + Tailwind 4.1.17 + Motion 12.43 `[VERIFIED-FILE package.json]`, 26 files / 1,861 LOC, no 3D, fonts via `next/font` (Geist + Newsreader), 1-record dataset `[VERIFIED-FILE]`).
Versions/licences are registry/API facts of 2026-11-01; behaviour claims come from official docs. Verdicts are `[AK-RECOMMENDATION]`.

---

## 1. Three.js **core** vs React Three Fiber (vs vanilla, vs OGL, vs Spline)

| | three.js core (vanilla) | **@react-three/fiber v9** | OGL | Spline (`@splinetool/react-spline`) |
|---|---|---|---|---|
| Latest / licence | `0.187.0`, MIT (2026-10-17) `[VERIFIED-API]` | `9.8.2`, MIT, peers `react >=19 <19.4` `[VERIFIED-API]` | `1.0.11`, no repo license, last push 2025-01-27 `[VERIFIED-API]` | `4.1.0`, **no license**, last publish 2025-07-15 `[VERIFIED-API]` |
| ★ | 117,352 | 33,417 | 4,744 | — |
| Integration cost | Renderer/camera/loop/dispose by hand | Declarative JSX; reconciler owns lifecycle | Very small API, hand-rolled loop | Designer-authored scenes; runtime SDK |
| React interop | manual refs, careful `useEffect` | state/props/refs natively; `<Canvas frameloop="demand">` | n/a | opaque scene object |
| Ecosystem | — | drei 10.7.9, postprocessing 6.39.6 (Zlib), troika-three-text 0.52.5, drei-text | — | proprietary editor |
| WebGPU path | `WebGPURenderer`/TSL, newer | `@react-three/webgpu` experimental `[VERIFIED-DOC]` | no | no |
| Bundle floor | `three` core ≈ 150 KB min | three + R3F + drei → several hundred KB (tree-shakeable, measure) | ~30 KB | vendor runtime (heavy) |
| Risk | imperative bugs, leaks | reconciler version coupling (React `<19.4` ceiling) | **effectively unmaintained** | licence + lock-in + staleness |

**Verdict.** Use **R3F + drei only if AO approves 3D**; three.js is a peer dep we get free either way. R3F's declarative model fits a Next App-Router codebase where a hand-rolled loop would live in a 26-file repo with no test infrastructure `[VERIFIED-FILE]`.
**Reject for this project:** Spline (no licence file + 15-month-old publish = unacceptable for a product), OGL (stale), `@react-three/postprocessing` (adds a second dependency chain for a garnish), physics (`use-cannon` last push 2024-06 `[VERIFIED-API]`).
**Escape hatch:** if we want *one* shader background and no 3D semantics, a raw `WebGLRenderer` + plane + fragment shader (~60 lines, zero deps) beats both — that's the `vfx-js`/`curtains.js` shape, and it stays an option because **R3F is not required to do shader work**.

## 2. GSAP + ScrollTrigger vs Motion (Framer Motion)

| | **GSAP 3.15.0 + ScrollTrigger/Flip/SplitText** | **motion 14.9.0 / framer-motion** |
|---|---|---|
| Licence | "Standard no charge" — free incl. **all** plugins & bonus plugins, **paid only for client work** `[VERIFIED-DOC]` | MIT `[VERIFIED-API]` |
| Scroll control | **best-in-class**: pin/snap/sc scrub/batch, `matchMedia`, `containerAnimation`, `invalidateOnRefresh` | `useScroll` progress only (14.7 added `scrollXLength/scrollYLength` `[VERIFIED-DOC changelog]`); pin/snap = DIY |
| Time-based authoring | timelines, position params, labels, `.fromTo` | declarative variants; no timeline |
| Layout | **Flip** (measure/invert/play) | `layout` / `layoutId` auto-animated layout — unique strength |
| Text | **SplitText** free since 3.13 | none built-in |
| React glue | `@gsap/react` `useGSAP` 2.1.2 (cleanup + auto-refresher) | first-class |
| SSR | avoid `gsap.to` at module scope; `client` components | needs `use client`; `LazyMotion` reduces bundle |
| Bundle | gsap+ST ≈ 70–80 KB min, gz ~30 KB (measure) | `domAnimation` via LazyMotion is the small path |
| Smooth-scroll integration | official Lenis bridge (`autoRaf` or ticker) | none needed (scroll progress from native events) |
| Reduced motion | `gsap.matchMedia()` manual | `<MotionConfig reducedMotion="user">` built in |
| Community for our stack | `greensock/GSAP` 30,021★; `greensock/gsap-skills` 17,684★ MIT (8 agent skills) `[VERIFIED-API]` | `motiondivision/motion` 34,769★ `[VERIFIED-API]` |

**Verdict — both, with a firewall.** Scroll **scenes** (pin/scrub/pin-cinematics/text choreography) are a GSAP problem; UI **states** (hover/tap/layout/exit/gesture) are a Motion problem. Our repo already has Motion `[VERIFIED-FILE]`, so GSAP's net new cost is 1 dependency + 1 mental model. If AO refuses any non-MIT dependency, the fallback is honest: **Motion + CSS scroll-driven + `Flip`-free manual measurement**, at the price of pinning quality and the smooth-scroll bridge.
**Do not** buy GSAP for this project (no client work) and **do not** add `gsap-trial` (SplitText is in the standard package since 3.13 — a trial import would be a needless licence smell).

## 3. Lenis (smooth scroll) vs native scroll (+ CSS scroll-behavior)

| | **Lenis 1.3.27 (MIT, zero deps)** | Native scroll |
|---|---|---|
| Feel | inertia/lerp on `wheel`/touch; `wheelMultiplier`, `duration`, `easing`, `autoRAF` `[VERIFIED-DOC]` | OS-native; momentum preserved exactly |
| Scroll-linked animation | drives *time-based* tweens in sync (`lenis.on('scroll', ScrollTrigger.update)`) | CSS `scroll()`/`view()` timelines are compositor-driven — smoother, free |
| Sticky / anchors / find-in-page | ✅ because it runs on **real** scroll positions `[VERIFIED-DOC]` | ✅ |
| a11y / screen readers | neutral (native scroll preserved) | best |
| Cost | 1 dep; must destroy on unmount; must avoid `syncTouch` pitfalls; **must remove `html{scroll-behavior:smooth}`** (conflicts `[VERIFIED-DOC]`) — our globals.css has it `[VERIFIED-FILE]` | 0 |
| Interactions needing it | scrubbed pinned scenes that feel "bouncy"; wheel-driven galleries | reveals, sticky columns, progress bars |
| `<ReactLenis>` | exported by `lenis/react` + `useLenis()` + `lenis/dist/lenis.css` `[VERIFIED-README]` | — |
| Alternatives | `locomotive-scroll` (abandoned for this use), `smooth-scrollbar` (hijacks, worse a11y), GSAP ScrollSmoother (Club-only) — see `research/scroll-animations.md` §2 | |

**Verdict.** Native + CSS scroll-driven **first**; add Lenis **only** when a scrubbed/pinned scene is in scope, behind a `matchMedia('(min-width:1024px) and (prefers-reduced-motion: no-preference)')` gate, desktop-only. Note 43 forks of the repo and 17,023★ `[VERIFIED-API]` — the ecosystem is healthy; the risk is UX (vestibular sensitivity, scroll-jacking complaints), not maintenance.

## 4. CSS animation vs JavaScript animation

| | CSS (`transition`, `@keyframes`, scroll-driven, `@property`) | JS (GSAP / Motion / rAF) |
|---|---|---|
| Runtime cost | runs on compositor; scroll-driven variants run without main-thread work | rAF tick, main-thread, React render if declarative |
| Reveal/stagger | `animation-delay`, sibling `nth-child`, `sibling-index()` (new) | precise stagger, per-item logic |
| Scroll-linked | `animation-timeline: view()/scroll()` + `range()` — **Chrome/Edge 115, Opera 101, Safari 26, iOS 26, Samsung 23, Firefox 159; NOT Baseline** `[VERIFIED-FETCH MDN]` | universally supported, works everywhere today |
| Choreography (pin, scrub, sequence, timeline labels) | ✗ | ✅ |
| Cross-element orchestration / conditionals | ✗ | ✅ |
| Interrupt/resume mid-flight | ✗ (or painful) | ✅ `overwrite`, kill/restart |
| Bundle | 0 KB | 10–80 KB+ |
| Reduced motion | 1 media query, zero JS | must be handled per-lib (`MotionConfig`, `matchMedia`) |
| Testability | hard to assert | assertable via lib state |

**Verdict.** Split by *kind of work*: **CSS for entrance/reveal/scroll-linked/hover; JS for state, layout, gesture, and timeline choreography.** For a document platform this matters beyond taste: CSS-side animation keeps INP headroom for search/filter interactions `[VERIFIED-DOC web.dev]`. Practical rule for AC: a section may have ≤ 1 JS-animated behaviour; anything else is CSS or nothing.

## 5. Lottie vs Rive (vs code, vs video)

| | Lottie (`lottie-react` 3.1.2 / `@lottiefiles/dotlottie-react` 0.21.0) | **Rive (`@rive-app/react-canvas` 4.38.0)** | CSS/JS code | video |
|---|---|---|---|---|
| Runtime cost | parses/renders JSON each frame on main thread unless Canvas renderer | precompiled `.riv` + state machine; 60 fps with fewer layout costs | none beyond what's already there | decode + bytes |
| Interactivity / state | limited (segments, go-to-and-stop) | ✅ **state machines** — inputs drive animation, ideal for hover/press/loading states | ✅ full | ✗ |
| Dynamic text/theming | poor | ✅ (text runs, CSS colors via API) | ✅ | ✗ |
| Files/assets | needs designer-authored JSON; `dotLottie` for packaging/caching | needs `.riv` from Rive editor; editor is proprietary, runtime MIT | none | none |
| Bundle | renderer weight notable; needs `lazy()` | WASM runtime (~30 KB+ gz, measure) | 0 | 0 |
| Maintenance signal | `lottie-react` v3.1.2 (2026-01); dotlottie 0.21.0 (2025-11) | **active** (2026-08/09 publishes) `[VERIFIED-API]` | — | — |
| Fit for our app | ✅ for 2–3 authored micro-moments (empty-state, "found document", upload success) | ✅ if we want *interactive* brand moments (orb states, theme lamp) | ✅ default | only as poster fallback |

**Verdict.** **Default to code.** If AO commissions motion design: **Rive** for anything reactive (state machine = correct model for loading/empty/success), **Lottie/dotLottie** only if designers deliver `.lottie` files. Either way: `next/dynamic` + IntersectionObserver mount, pause off-screen, skip entirely under reduced motion (replace with a static frame). **Never** animate the document surface (Slides/Dropbox iframe) with either — `[VERIFIED-FILE]` those are our embed targets.

## 6. WebGL effects vs CSS effects

| | **CSS** (backdrop-filter, mask, conic/`@property` gradients, `filter`, 3D transforms, `mix-blend-mode`) | **WebGL** (three/R3F, shader effects, particles) |
|---|---|---|
| Cost per instance | GPU-composited; `backdrop-filter` is the expensive one, `@property` conic is cheap | context init, memory, one rAF loop |
| Low-end Android | degrades visually, stays interactive | risk of context loss/black canvas/thermal throttling |
| Failure mode | cosmetic, and `@supports` detectable | needs capability probe + poster fallback |
| Text/DOM fidelity | native (real DOM text stays selectable & searchable) | textures → blurry or expensive; a11y burden |
| a11y | `prefers-reduced-motion` works; no focus issues | needs `aria-hidden`, focus never inside canvas |
| What it can do that the other can't | crisp type, layout-accurate, theme-reactive instantly | refraction, fluid/particle fields, depth-of-field, instanced 3D, image distortion |
| Our current state | 3 blurred blobs + `glass-card` + `title-glow` + `projector-mode` `[VERIFIED-FILE globals.css]` | none |
| Tooling if needed | `vfx-js` 1.2.0-era (1,163★, MIT, active 2026-10-19) as a single-shader escape hatch `[VERIFIED-API]` | R3F + drei |

**Verdict — a two-layer contract.**
*Layer 1 (mandatory, "premium"):* **CSS** — glass elevation system, `@property` spotlight ring, mask-based text reveals, CSS-3D tilt, gradient-border hover, theme-reactive surfaces. It must look finished with WebGL unavailable.
*Layer 2 (optional garnish, "wow"):* **WebGL** — one hero particle/atmosphere field (+ a later 3D subject orb), demand-rendered, DPR-capped, capability-gated, `aria-hidden`, poster fallback.
This split is why the plan survives the low-end-device reality of our audience while still reading as premium on the demo laptop, and it is the same split the award-tier sites use (DOM typography + one shader moment) `[REPORTED S10]`.

---

## 7. Cross-cutting decision table for AC

| Job | Winner | Runner-up | Why |
|---|---|---|---|
| Route/element morph | **native View Transitions** (React 19.3 `<ViewTransition>` `[VERIFIED-DOC]`) | `next-view-transitions` 2,381★ (now redundant `[VERIFIED-API]`) | 0 KB, SSR-safe, works cross-route |
| In-page layout/exit/gestures | **Motion** (already installed) | GSAP Flip | declarative, `reducedMotion="user"` |
| Scroll scenes / pin / scrub | **GSAP ScrollTrigger** | CSS scroll-driven | quality + Lenis bridge |
| Reveals / progress / parallax garnish | **CSS scroll-driven** behind `@supports` | Motion `useScroll` | main-thread-free |
| Smooth scroll | **Lenis** (gated, desktop) | native | only what ScrollTrigger needs |
| Hero atmosphere | **R3F/three shader plane** or `vfx-js` | CSS blobs | replaceable, gated |
| Card depth | **CSS 3D transform + tilt** | R3F | no context cost, text stays crisp |
| Micro-animation assets | **code**; Rive if reactive | Lottie/dotLottie | maintenance + a11y |
| Text animation | **GSAP SplitText** | CSS masks | free since 3.13 |
| Theme switch | **CSS vars + inline script (already) + VT clip** | next-themes | don't add a provider we don't need |

**Single rule to remember:** *one engine per job, and every engine must be removable.* Each row above is behind a component boundary so AO can cut any of the four additions (GSAP, Lenis, three/R3F, Rive) in one commit without touching content code.
