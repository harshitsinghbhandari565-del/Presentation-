# Scrolling-Experience Repositories

**Verified 2026-11-01 `[VERIFIED-API]`**

## 1. Best scroll-engineering references, ordered by usefulness to us

| ◆ | Repository | ★ | Last push | Lic | Live demo | Why it's here |
|---|---|---|---|---|---|---|
| ◆ | `codrops/ScrollBasedLayoutAnimations` | 338 | **2026-10-31** | **MIT** | via tympanus article | **Highest relevance.** Scroll-driven *layout switching* with ScrollTrigger — the same problem as our filtered card grid. MIT, official Codrops, actively pushed |
| ◆ | `darkroomengineering/lenis` | 17,023 | 2026-10-29 | MIT | lenis.dev | The smooth-scroll reference; README carries the canonical ScrollTrigger wiring, `lenis/react` wrapper, `lenis/snap` for section snapping |
| ◆ | `greensock/GSAP` | 30,021 | 2026-04-13 | No Charge | gsap.com/scroll-trigger | ScrollTrigger source + demos; `pin`, `scrub`, `snap`, `batch`, `containerAnimation` (horizontal), `toggleActions` |
| ◆ | `JosephASG/codrops-cinematic-scroll-animations` | 83 | 2026-03-16 | NONE | tympanus tutorial | **CSS `perspective` + transforms** for a cinematic 3D scroll — no WebGL. The pragmatic route to "3D transitions" for our hub |
| ◆ | `barvian/CodropsCarousels` | 100 | 2024-01-24 | NONE | tympanus | Three carousel experiments in pure CSS scroll-driven animations — the zero-JS pattern for horizontal rails |
| | `DmitriNaumov/Paralax-effect-with-gsap-scrolltrigger` | 142 | 2023-02-27 | NONE | github.io | Minimal, readable scrub+parallax — good first diff for AC to imitate |
| | `iondrimba/interactive-repulsive-effect` | 217 | 2022-07-30 | NOASSERTION | tympanus | Grid-item repulsion on pointer (CSS/GSAP) — a *card-grid* interaction we can use |
| | `ektogamat/drill-webgi-tutorial` | 197 | 2023-02-12 | NONE | vercel app | Scroll-scrubbed WebGL *image sequence* — the technique for a slide "flip-through" without video |
| | `chrisgannon/ScrollLottie` | 88 | 2023-05-21 | NONE | codepen | ScrollLinked Lottie — reference only (we rejected Lottie) |
| | `gongnyang/awesome-html-scrolline-deck` | 102 | 2026-10-08 | MIT | vercel app | "Scroll-driven presentation decks: one continuous timeline, beats that turn into the next" — **closest conceptual neighbour to a presentation product** |
| | `holux-design/v-gsap-nuxt` | 169 | 2026-02-10 | NONE | vercel | Nuxt module: study its `useGsap` API shape, not the framework |
| | `ShowravKormokar/capsule` | 103 | 2026-03-24 | NONE | github.io | Open construction of an Awwwards-winning site (capsule.moyra.co): section structure, Lenis+GSAP wiring |
| | `manish-850/gentlerain.ai` | 46 | 2025-12-06 | NONE | github.io | Another award-site clone; useful for **mobile-first degradation** of an animated marketing page |
| | `viliket/pure-web-bottom-sheet` | 223 | 2026-10-20 | MIT | — | Scroll-driven + snap inside a sheet; mobile facet-panel model |
| | `iDev-Games/Trig-JS` | 174 | 2026-05-22 | MIT | github.io | CSS-variable driven scroll effects: how to expose progress to CSS cheaply |

## 2. Techniques worth porting (and how)

**T1 — Sticky grid that unfolds (Codrops "Sticky Grid Scroll", 2026-03-02 `[REPORTED S8]`).** A `position: sticky` block containing a grid that reveals, zooms and toggles content across a scrubbed timeline, with `lerp: 0.08, wheelMultiplier: 1.4` Lenis. **Port to:** the "How discovery works" scene — 3 beats over ~1.6 viewport heights, and *disable it below `lg`* (scrub-heavy pinned scenes are where mobile dies).
Implementation deltas for us: `invalidateOnRefresh: true`, `ScrollTrigger.refresh()` after `filtered` changes, and no `.glass-card` inside the pinned area (backdrop-filter re-composite).

**T2 — SVG mask reveals (Codrops "SVG Mask Transitions on Scroll", 2026-03-11).** Four full-screen image reveals via masked strips (`viewBox="0 0 100 100"` so maths is resolution-independent; `scrub: 2.0–2.5` for physical trailing). **Port to:** the transition between the hero and the library section — use a *12-strip blind* rather than an image, revealing the grid beneath. Zero WebGL, works in light mode.

**T3 — Velocity-driven mood (Codrops "Scroll-Reactive 3D Gallery with Three.js, Velocity and Mood-Based Backgrounds", 2026-03-09).** Scroll *velocity* keys background hue/distortion. **Port to:** one scalar — `--scroll-velocity` — that slightly intensifies the ambient gradient and tightens card stagger. Cheap, and it makes the page feel alive without any library beyond `useScroll`.

**T4 — CSS-only scroll-linked motion (MDN `[VERIFIED-DOC]`).** `animation-timeline: view()` + `animation-range: entry 10% entry 90%`; `animation-duration: auto` required; `both` fill; `@supports` gate. **Port to:** every reveal, the progress rail, and the header compaction. This replaces ~70 % of what teams build with IntersectionObserver + `whileInView`.

**T5 — Infinite/seamless scroll (Codrops 2026-05-28).** Deliberately **not** ported: infinite scroll harms place-keeping for study material `[REPORTED S11]`.

**T6 — Horizontal rails.** Prefer `overflow-x: auto` + `scroll-snap-type` (native, accessible, free) with `view(inline)` per-item scaling for the "focused card" feel. Reserve GSAP `containerAnimation` for a scene that must be *scrubbed*.

## 3. Anti-patterns confirmed by this pass

- Pinning a section whose height is content-driven → jump/`pinSpacing` artefacts; **pin fixed-height scenes only**.
- `scrub: true` (1:1) on a long scene = exhausting; `scrub: 0.7–2.5` reads as premium (matches T2's published values).
- Reveals that leave content at `opacity: 0` if the timeline never runs (no-JS, or `prefers-reduced-motion` without a fallback). Always author the **visible** state as the default and *opt into* motion (`@supports` / `.js` class) `[REPORTED S8]`.
- Two smooth-scroll systems simultaneously (`scroll-behavior: smooth` + Lenis + ScrollSmoother) — our `globals.css` already contains one of them `[VERIFIED-FILE]`.
- Lenis on a page with a scroll-position-dependent *layout shift* (fonts/images arriving) → stale trigger bounds; needs `lenis.resize()` + `ScrollTrigger.refresh()`.
