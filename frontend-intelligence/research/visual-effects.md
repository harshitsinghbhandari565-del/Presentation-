# Visual Effects — what to use, what to refuse

**AK · 2026-11-01 · Domain E.** Each row is *evaluated for a document-discovery site used by students on mid-range Android in a classroom projector*, not for a portfolio.

## 1. Candidate effects, judged

| Effect | Implementation | Real cost | Aesthetic value here | Verdict |
|---|---|---|---|---|
| **Interactive particle background** | R3F `Points`, canvas-sampled text mask, pointer/scroll uniforms | +300–900 KB (three+fiber+drei), GPU per frame, context-loss handling | High, once | ⚠️ **Only as Phase 4, gated** (see `3d-websites.md` §4) |
| **CSS mesh-gradient ambient** (already shipped) | 3 blurred radial divs + `float` keyframes `[VERIFIED-FILE]` | ~0 (composited, but big blurred layers cost memory) | High | ✅ **Keep and refine** — this is our "particle background" at 1/100 the cost |
| **Fluid / goo simulation** | `PavelDoGreat/WebGL-Fluid-Simulation` ★16,786 MIT, **last push 2024-11-12** `[VERIFIED-API]` | Full-screen sim; battery + thermal; mobile needs reduced quality | Novel, transient | ❌ **Refuse.** Zero product relevance; stale flagship repo signals a maintenance cliff |
| **Distortion on hover (liquid image)** | WebGL plane sampling a DOM element: `martinlaxenaire/curtainsjs` ★1,826 MIT, **last push 2025-04-03** `[VERIFIED-API]` | 1 extra context; text must stay DOM for a11y | Medium on *image* grids, **negative on text cards** | ❌ on cards. ✅ acceptable on the one featured visual, if a real image ever exists |
| **Shader gradient / grain** | plain `ShaderMaterial`, or CSS `feTurbulence` (already `[VERIFIED-FILE]`) | low | High | ✅ **CSS version now**; shader version only inside an approved canvas |
| **Magnetic interactions** | Motion springs (`useMotionValue`+`useSpring`) or `mulkatz/use-magnetic` (★1 MIT, 2026-10-03, <1.3 KB, a11y-first `[VERIFIED-API]`) | ~0 | High (buttons feel expensive) | ✅ **Yes**, primary CTA + nav |
| **Custom cursor** | two divs lerped; hide on `(pointer: coarse)` | low | Medium; **risky** (usability, projector) | ⚠️ Optional; never replace the native cursor over links/cards |
| **Generative graphics** (per-subject pattern) | deterministic SVG/canvas from `subject`+`id` hash | ~0 | Medium; **solves our no-thumbnails problem** | ✅ **Strong recommendation** — generated card texture keyed to metadata, no assets needed |
| **Animated/aurora gradient text** | `background-clip: text` + `@property --angle` | medium (paint) | Cliché risk | ⚠️ Title only if at all; keep static Newsreader |
| **Morphing shapes** | CSS `d: path()` / `shape()` (Chrome 135, Firefox 148, Safari 18.4 `[REPORTED S9]`) or GSAP MorphSVG | low | Medium | 💡 Use for the hero's ambient blob edge, not for content |
| **Spotlight-follow cards** | `--mx/--my` CSS vars → `radial-gradient` border/overlay | ~0 (one var write per rAF, throttled) | **High per KB** | ✅ **Do it.** The best value/effort effect in this file |
| **Noise/film grain** | already present at `opacity .012` `[VERIFIED-FILE]` | ~0 | Medium | ✅ keep static; **never animate** |
| **Glassmorphism** | shipped `[VERIFIED-FILE]` | backdrop reads | High | ✅ keep, **cap ≤4 simultaneous blurred layers** |
| **Parallax** | CSS `animation-timeline: view()` | ~0 | Medium | ✅ small (≤10 %) on ambient, not on text |
| **Page-wide scroll smoke/ink transitions** | WebGL crossfade between snapshots | high, fragile in RSC | Medium | ❌ refuse for v1 |
| **Marquee/kinetic type** | transform keyframes, `aria-hidden` | ~0 | Medium | ✅ one subject-word marquee strip as a section divider; pause on hover + reduced-motion |

## 2. The "generative document texture" idea (mine, worth building)

We have no thumbnails, and stock document imagery would look fake. Instead: derive a **deterministic visual** from the record's own metadata.

```
seed = hash(id + subject)                       // stable across renders
pattern = one of [grid, contour, ruled-paper, halftone, isometric-lines][seed % 5]
hue = hueForAccent(accent)                      // reuse the existing accent field
render = inline <svg> (≈1–2 KB, crisp at any DPR, theme-aware via currentColor)
```
Properties: zero assets, zero network, no CLS (intrinsic aspect ratio), prints well, dark/light coherent, and **each subject becomes visually recognizable** — which is genuinely useful for a student scanning a grid. It is also exactly the kind of thing an award jury reads as "designed" rather than "skinned". `[AK-RECOMMENDATION]`

## 3. Effects engineering rules (all verified against published performance guidance `[REPORTED S5/S6]` + MDN `[VERIFIED-DOC]`)

1. **Two animated full-screen layers maximum**, one of which must be cheap (transform/opacity only).
2. **Never** `filter: blur()` + `backdrop-filter` + `box-shadow` on the same element.
3. **Never** animate `filter`/`border-radius`/`background-position` on large areas; use `transform`/`opacity` (and `@property`-registered custom props for the rest).
4. Every canvas: DPR ≤ 2 (1.75 better), `powerPreference:"high-performance"`, pause on `IntersectionObserver` exit and `visibilitychange`, `webglcontextlost` fallback to the static poster.
5. **No effect may delay the first useful interaction**: search input must be interactive and visible before any WebGL init (init in `requestIdleCallback`/after LCP).
6. Effects are `aria-hidden`, `pointer-events-none`, and live **behind** content z-layers (our `z-0` ambient / `z-10` content split `[VERIFIED-FILE]` is the right pattern — keep it).
7. Reduced motion: kill ambient loops, disable pointer-reactivity, no parallax, no magnetic travel, no marquee. CSS handles the declarative ones; JS must read `matchMedia` for the imperative ones.
8. Projector mode: **disable all effects** (a room projector has the least GPU headroom and the worst legibility demands); we already have the class hook (`html.projector-mode`).
9. Light mode: re-tune every glow/blend — `mix-blend-mode: screen` disappears on `#f8fafc`.
10. **Measure with a CPU-throttle 4× and a real mid-range Android** before shipping any of these.

## 4. Explicit "no" list with reasons

Fluid sims · full-screen WebGL hero on the *documents* page · Lottie/Rive for decoration · glassmorphism-on-every-card · animated grain · cursor replacement on touch · scroll-jacked route transitions (use native View Transitions instead — cheaper and it does not break Back) · shader text · physics · post-processing bloom/DoF on a text UI.
