# Animation & Interaction Projects

**Verified 2026-11-01 `[VERIFIED-API]`**

## 1. Engine repositories

| Repo | ★ | Last push | Lic | Why it earns a place |
|---|---|---|---|---|
| `motiondivision/motion` | 34,769 | **2026-11-01** | MIT | Already our engine. Read the **CHANGELOG** for 13.2→14.9: `threeEffect`, `AnimateView`, accelerated transforms, spring retarget 80% faster |
| `greensock/GSAP` | 30,021 | 2026-04-13 | No Charge | ScrollTrigger/SplitText/Flip; the docs site (gsap.com/docs) is the reference, not the repo source |
| `greensock/gsap-skills` | 17,684 | 2026-07-29 | MIT | Agent-readable GSAP correctness rules (React SSR, cleanup, perf) |
| `darkroomengineering/lenis` | 17,023 | 2026-10-29 | MIT | Smooth scroll + `lenis/react` + ScrollTrigger sync |
| `pmndrs/react-spring` | 29,260 | 2026-11-01 | MIT | Healthy, but redundant next to Motion |
| `shuding/next-view-transitions` | 2,381 | 2026-03-06 | MIT | Historical; the ideas migrated into React 19.3 core |
| `nextjs/react-view-transitions-demo` | 32 | 2026-10-14 | — | **The** Next-16-native VT worked example |
| `rudrodip/theme-toggle-effect` | 817 | 2025-10-07 | NONE | Circular-clip theme transition — our exact dark/light need |

## 2. Focused interaction references

| Repo | What to steal | Notes |
|---|---|---|
| `productdevbook/pencere` ★48 · 2026-06-29 · MIT | A **zero-dependency lightbox using native View Transitions** for images/video/**iframes** — i.e. exactly how to preview a Google Slides embed without a library | Read the source; it is small |
| `viliket/pure-web-bottom-sheet` ★223 · 2026-10-20 · MIT | Mobile bottom sheet on **CSS scroll-driven animations** + `@starting-style`, no JS — this is how our mobile facet sheet should be built | Directly usable pattern |
| `iDev-Games/Trig-JS` ★174 · 2026-05-22 · MIT | CSS-variable scroll effects engine — a good model for how *we* should expose `--scroll-progress` on sections | |
| `Felix-au/CursorX` ★119 · 2026-08-05 · MIT | 20+ cursor effects with live previews; skim for the tasteful 3 | |
| `mulkatz/use-magnetic` ★1 · 2026-10-03 · MIT | A tiny a11y-first magnetic hover hook (~1.3 KB) — read it as the *reference implementation* of pointer+spring+keyboard safety | Stars ≠ quality; this 1★ repo is more useful than several 50k★ ones |
| `vikingmute/scrambl` ★37 · 2026-05-11 · MIT | Zero-dep text scramble/decode | |
| `pptt3300/ui-fx-kit` ★49 · 2026-03-23 · MIT | 64 composable cursor/scroll/text/background animations — **use as an effects taxonomy** while writing `design-system/animation-guidelines.md` | |
| `iondrimba/interactive-repulsive-effect` ★217 · 2022 · NOASSERTION | Pointer-repulsion across grid items (Codrops-derived) | Old; idea is fine |
| `chrisgannon/ScrollLottie` ★88 · 2023 | Scrubbing a Lottie timeline with ScrollTrigger | Only if a designer hands us a Lottie file |
| `barvian/CodropsCarousels` ★100 · 2024 | Three carousel experiments in **pure CSS scroll-driven animations** | The technique is now Baseline-adjacent; code needs a refresh |

## 3. Motion techniques mapped to our screens

| Our screen | Technique | Reference | Engine |
|---|---|---|---|
| Landing hero | Ambient gradient drift + SplitText line-mask on the H1 | Codrops Mar 2026 text studies; `vfx-js` | CSS + GSAP |
| Section entry | `view()` reveal, stagger via `nth-child` `animation-delay` | MDN scroll-driven `[VERIFIED-DOC]` | CSS |
| Document card | Spotlight-follow border + `layoutId` hover pill + `:active` compression | `react-bits` spotlight patterns | CSS + Motion |
| Filter change | `Flip` position/size tween between result sets | `codrops/ScrollBasedLayoutAnimations` | GSAP Flip |
| Card → detail | `<ViewTransition name>` shared-element morph, `share="morph"` + blur keyframe | **`nextjs/react-view-transitions-demo`** `[VERIFIED-DOC]` | React 19.3 |
| Route direction | `transitionTypes={['nav-forward'/'nav-back']}` on `<Link>` | same `[VERIFIED-DOC]` | React 19.3 |
| Loading | Skeleton `@starting-style` + shimmer; Suspense fallback *exit* animation | Next guide §Step 2 | CSS + VT |
| Theme switch | Circular clip from the toggle + `color-scheme` swap | `rudrodip/theme-toggle-effect` | VT + CSS |
| ⌘K palette | Scale/fade panel, per-row stagger, no layout thrash | `dip/cmdk` (MIT) for a11y model | Motion |
| Footer | Oversized wordmark + a scroll-reactive marquee of subjects | studio-site idiom `[REPORTED S10]` | CSS |

## 4. What to avoid, with evidence

- **Theatre.js** (`@theatre/core` 0.7.2, **2024-05-19** `[VERIFIED-REGISTRY]`) — timeline editors are a human-collaboration tool; with no designer and an unmaintained core, it is pure risk.
- **GSAP `ScrollSmoother`** when Lenis is present — two rAF scroll owners fight. Pick one.
- **Any "scroll trigger library" other than ScrollTrigger/CSS/IO** — e.g. `lax.js` is **Archived** (★10,457!), AOS-style attribute libraries ship `!important`-heavy global CSS and cannot express our beats.
- **Framer-Motion-era workarounds**: `dynamic(() => …, { ssr: false })` *just because* is no longer needed for Motion on React 19/Next 16 (the old `useContext`/SSR-era bug is closed); AC should not cargo-cult `ssr:false` everywhere — it costs SEO/first paint. (`[AK-RECOMMENDATION]`: verify with a build, keep `ssr:false` only for the canvas.)
- **Animating `filter: blur()`** during View Transitions on large surfaces — the Next guide's blur trick is a 30% keyframe on an *image pair*, not a page-wide effect.
