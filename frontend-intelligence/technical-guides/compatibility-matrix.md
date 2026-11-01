# Compatibility Matrix

**Every row resolved against the live npm registry on 2026-11-01 against the pinned project versions.** This is the file to check before adding a single dependency.

Project baseline `[VERIFIED-FILE]`: `next@16.2.6`, `react@19.2.6`, `react-dom@19.2.6`, `typescript@5.9.3` (strict), `tailwindcss@4.1.17`, `framer-motion@^12.43.0`, `lucide-react@^1.28.0`, `pg@8.20.0`, `drizzle-orm@0.45.2`, Node in sandbox `v22.22.3`.

---

## 1. Dependency × project matrix

| Package | Latest (2026-11-01) | Published | License | Peer-dep reality | Verdict on **this** project |
|---|---|---|---|---|---|
| `motion` | 14.9.0 | 2026-10-30 | MIT | `react ^18 \|\| ^19` | ✅ **Compatible.** Import via `motion/react` |
| `framer-motion` | 14.9.0 | 2026-10-30 | MIT | `react ^18 \|\| ^19`; now depends on `motion-dom`, `motion-utils`, `tslib` | ⚠️ Works, but v12→v14 skips 2 majors — see §3 |
| `gsap` | 3.15.0 | 2026-04-13 | **Standard "no charge"** (not open source) | none | ✅ **Compatible.** Plugins importable from the public package `[VERIFIED-DOC]` |
| `@gsap/react` | 2.1.2 | 2025-01-15 | see LICENSE | `gsap ^3.12.5`, `react >=17` | ✅ Compatible; 18-month-old but low-churn by nature |
| `lenis` | 1.3.27 | 2026-10-15 | MIT | optional peers `react >=17`, `vue >=3`, `@nuxt/kit >=3` | ✅ Compatible; `lenis/react` provides `<ReactLenis>` + `useLenis` `[VERIFIED-DOC]` |
| `@studio-freight/lenis` | 1.0.42 | 2024-03-17 | MIT | — | ❌ **Do not install** — deprecated name |
| `three` | 0.187.0 | 2026-10-30 | MIT | none; exports `./tsl ./webgpu ./addons` | ✅ Compatible (framework-agnostic) |
| `@react-three/fiber` | 9.8.2 | 2026-10-14 | MIT | **`react >=19 <19.4`**, `react-dom >=19 <19.4`, `three >=0.156` | ⚠️ **Hard ceiling.** OK at 19.2.6 and 19.3.1; breaks if React goes ≥19.4 |
| `@react-three/drei` | 10.7.9 | 2026-09-25 | MIT | `react ^19`, `react-dom ^19`, `@react-three/fiber ^9`, `three >=0.159` | ✅ with fiber 9 + three ≥0.159 |
| `@react-three/postprocessing` | 3.2.2 | 2026-10-21 | MIT | `react ^19`, `fiber >=9.7.0`, `postprocessing ^6.36.0`, `three >=0.156` | ❌ Not recommended (bundle + full-screen passes) |
| `postprocessing` | 6.39.6 | 2026-11-01 | **Zlib** | `three` peer (unreleased-range) | ❌ Not recommended; note non-MIT SPDX |
| `@react-three/drei`'s `troika-three-text` | 0.52.5 | 2026-07-24 | MIT | `three` peer | ✅ auto-installed with drei's `<Text>` |
| `maath` | 0.10.8 | 2024-07-07 | MIT | — | ✅ small math helper; stable, low churn is fine |
| `ogl` | 1.0.11 | **2025-01-27** | Unlicense | — | ⚠️ 21 months since publish; repo license `NONE` `[VERIFIED-API]`. Prefer three.js |
| `@splinetool/react-spline` | 4.1.0 | **2025-07-15** | *(no license field)* | `react` peer | ❌ Proprietary runtime + asset cloud, unmaintained-ish |
| `@rive-app/react-canvas` | 4.38.0 | 2026-10-27 | MIT | `react` | ✅ if a Rive file is ever designed; otherwise skip |
| `lottie-react` | 3.1.2 | 2026-09-07 | MIT | wraps `lottie-web` (~250 KB) | ⚠️ only for a designed loader |
| `@lottiefiles/dotlottie-react` | 0.21.0 | 2026-10-30 | MIT | WASM renderer | ⚠️ smaller payload, adds WASM fetch |
| `@react-spring/three` | 10.1.2 | 2026-06-24 | MIT | react 18/19 | ❌ redundant next to Motion `threeEffect` (§2) |
| `animejs` | 4.5.0 | 2026-06-22 | MIT | — | ❌ redundant engine |
| `@theatre/core` | 0.7.2 | **2024-05-19** | Apache-2.0 | — | ❌ **abandoned signal** |
| `@react-three/uikit` | 1.0.78 | 2026-10-27 | **custom** (`SEE LICENSE IN L…`) | — | ❌ custom license + niche; not needed |
| `@monogrid/gainmap-js` | 3.7.2 | 2026-10-20 | MIT | — | ✅ only if HDRIs are used (drei `<Environment>`) |
| `@react-three/xr` | 6.6.32 | 2026-10-13 | custom | fiber 9 | ❌ no WebXR requirement |
| `next-view-transitions` | latest (repo pushed 2026-03-06) | — | MIT | next 13/14/15 | ❌ **redundant** — React 19.3 `<ViewTransition>` needs no config `[VERIFIED-DOC]` |
| `shadcn-ui/ui` | repo pushed 2026-10-31, ★127,119 | — | MIT | Tailwind v4 | ⚠️ copy selectively at most; don't re-platform |
| `dip/cmdk` | repo pushed 2025-10-29, ★13,057 | — | MIT | react 18/19 | ⚠️ the app already ships a custom palette; only swap if focus/ARIA bugs surface |
| `@types/three` | 0.187.0 | 2026-10-30 | MIT | — | ✅ version-match `three` exactly |

## 2. The one integration fact that changes the plan

**Motion ≥13.2.0 ships `motion/three` (`threeEffect`)**, which animates **Three.js objects, materials, shader uniforms and TSL uniform nodes** `[VERIFIED-DOC — official CHANGELOG, read directly]`.

Consequence: **AC does not need react-spring, nor a custom `useFrame` tween bridge, to drive 3D.** One library (Motion) can choreograph the DOM *and* the WebGL scene, sharing the same frame loop and the same spring/`useScroll` values. This is the strongest argument for upgrading `framer-motion@12 → motion@14` before touching 3D at all.

## 3. framer-motion 12.43 → motion 14.9: migration risk table

| Concern | Evidence | Action |
|---|---|---|
| v13.0.0 (2026-08-05) **removed the optional `@emotion/is-prop-valid` dependency** in favour of explicit `<MotionConfig isValidProp={isPropValid}>` | `[VERIFIED-DOC]` CHANGELOG | Only bites if DOM props leak through `motion.div`. The project's usage (6 components, `motion.div`/`motion.a`, `variants`, `initial/animate`) is unaffected |
| v14.0.0 (2026-10-03) removed internal APIs restored for cross-compat with 13.0–13.4 | `[VERIFIED-DOC]` | No action: the app uses public API only |
| No breaking *public* exports between 13.5.1 → 14.0.0 | `[REPORTED]` automated API diff of published types found 0 removed exports / 0 changed signatures | Reassuring, not authoritative — run `npm run typecheck` (exists `[VERIFIED-FILE]`) |
| Peer range `react ^18 \|\| ^19` | `[VERIFIED-REGISTRY]` | ✅ 19.2.6 satisfies |
| Gains | 12.43.0 background-colour/SVG hardware acceleration; 14.1.x accelerated independent transforms (`x, y, scaleX`); 14.1.0 *"delay animation start when main thread is held to prevent visual jumps"*; 14.7.0 `useScroll` returns `scrollXLength/scrollYLength`; 14.1.0 elastic-overscroll `useScroll` fix; 14.9.0 Reorder keyboard a11y | These are exactly the scroll/perf/a11y fixes this project needs |

**Risk rating: LOW. [AK-RECOMMENDATION] do it as its own commit before any visual work, and verify `npm run typecheck && npm run lint && npm run build`.**

## 4. Browser / platform matrix (what "modern CSS" means for a student audience in India)

| Capability | Support (verified) | Ship rule |
|---|---|---|
| **Same-document View Transitions** (React `<ViewTransition>`) | Chrome 111+, Safari 18+, Firefox 133/144+; **React's integration uses transition types + `view-transition-class` → Chromium 125+ and recent Safari/Firefox; "some animations may behave differently in Safari"** `[VERIFIED-DOC — Next.js guide]` | ✅ Ship. It degrades to no animation, never to broken UI |
| **CSS scroll-driven animations** (`animation-timeline: view()/scroll()`) | Chrome/Edge 115+, Safari 26, iOS 26, **Firefox 159** — MDN banner: **"not Baseline"** `[VERIFIED-DOC]` | ✅ Inside `@supports (animation-timeline: view())`, with Motion/CSS-timeline-free fallback |
| `backdrop-filter` (already core to `.glass-card`) | Universal in evergreen; **expensive on low-end mobile GPUs** | ⚠️ Cap blur count per viewport; never animate `backdrop-filter` |
| `position: sticky` | Universal | ✅ preferred over JS pinning when it suffices |
| `content-visibility: auto` | Universal in evergreen | ✅ on off-screen document-card clusters (with `contain-intrinsic-size` to protect CLS) |
| `@property` (animatable custom props for gradient/spotlight work) | Chrome 85+, Safari 16.4+, Firefox 128+ | ✅ with fallback |
| **WebGL2** | Broad; absent/blocked on some low-end Android + older Safari on iOS 14/15 | ⚠️ **feature-detect and show the static poster** |
| **WebGPU** | Chrome/Edge 113+ (Win/mac/ChromeOS), Chrome Android 12+, **Safari 26**, Firefox (Windows/Apple Silicon) — *partial on Linux, Android Firefox needs a flag* `[REPORTED S5]` | ❌ Not a target. If R3F is ever built, ship `WebGLRenderer`; three's `WebGPURenderer` auto-falls back but doubles the QA surface |
| `prefers-reduced-motion` | Universal | ✅ **mandatory** in every code path |
| `prefers-contrast`, `forced-colors` | Universal | ✅ add (Tailwind v4 `@custom-variant`; the audit found no `prefers-contrast` handling `[VERIFIED-FILE]`) |
| Container queries | Universal in evergreen | ✅ for card density, not for the reveal system |

**In-app browsers matter here.** Students open links from WhatsApp/Google/Instagram in-app webviews (Android WebView + Chrome-on-iOS). Consequences: no WebGPU, older Chromium on Android WebView, View Transitions may be missing → every motion feature must be progressive. `[AK-RECOMMENDATION]`

## 5. Tailwind v4.1.17 ↔ the debt it can fix

The audit found ~30 `html[data-theme="light"] … !important` overrides targeting **arbitrary-value classes** (`[VERIFIED-FILE]`). Verified v4 pattern that removes that entire layer `[REPORTED S7]`:

```css
@import "tailwindcss";
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

:root { --surface: oklch(0.98 0.002 250); --ink: oklch(0.25 0.02 260); }
[data-theme="dark"] { --surface: oklch(0.16 0.006 280); --ink: oklch(0.97 0.005 255); }

@theme inline {              /* inline = utilities read the var, so runtime swap works */
  --color-surface: var(--surface);
  --color-ink: var(--ink);
}
```
One source of truth; `bg-surface` just works in both themes; no `!important`. **This is the highest-leverage non-visual change in the whole mission** and it unblocks safe component-level polish (any new raw-hex class currently breaks light mode silently).

## 6. Tooling constraints

| Item | Reality | Implication |
|---|---|---|
| Turbopack | Next 16 uses Turbopack for `next dev` by default; `next.config.ts` is empty `[VERIFIED-FILE]` | No webpack loader tricks (raw GLSL import via `?raw`, `glsl-loader`) unless configured. Use `?raw`/template-literal shaders or add the loader explicitly if 3D lands |
| ESLint | flat config `eslint-config-next/core-web-vitals` `[VERIFIED-FILE]` | `no-unused-vars`/a11y rules will flag hand-rolled scroll listeners; keep `eslint .` green |
| `typecheck` | `tsc --noEmit` script exists, `strict: true`, `target: ES2017` | `three` types are heavy but fine; add `@types/three` pinned to `0.187.0` |
| `next.config.ts` | no `images.remotePatterns`/`domains` | **Adding Google Slides/Dropbox thumbnails via `next/image` requires an image-config decision** — flag to AC, currently nothing is configured |
| No lockfile committed `[VERIFIED-FILE]` | — | Pin before perf work, or CI installs drift from measurements |
| CI | none | Perf budgets can't be enforced by a pipeline yet; use Lighthouse locally + documented numbers |

## 7. Pre-flight checklist for AC (copy into the PR description)

```
[ ] motion@^14 installed; no `framer-motion` specifiers remain in src/
[ ] npm run typecheck && npm run lint && npm run build  → clean
[ ] No new dependency outside the approved list (recommended-stack.md §3)
[ ] gsap imported as: import { gsap } from "gsap"; import { ScrollTrigger } from "gsap/ScrollTrigger";
    (never gsap-trial, never @studio-freight/*, never a private GreenSock registry / .npmrc)
[ ] Every ScrollTrigger/useEffect has cleanup (ctx.revert(), lenis.destroy(), gsap.ticker.remove(fn))
[ ] Lenis NOT initialised server-side; created in useEffect; single instance per page
[ ] prefers-reduced-motion branch: no rAF loop, no infinite ambient, no scrubbed pinning
[ ] page.tsx is a Server Component; interactive leaves are the only client modules
[ ] No raw hex Tailwind classes added (theme tokens only) until §5 lands
[ ] Lighthouse mobile ≥ 90 perf on "/" and "/presentation/[id]"; INP p75 < 200 ms on a Moto-G-class device
[ ] Keyboard: Tab order, ⌘K open/close+focus-trap, visible focus, Esc closes overlays
[ ] Light+dark+projector screenshot diffs for every touched component
```
