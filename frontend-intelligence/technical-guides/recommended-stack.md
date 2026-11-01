# Recommended Stack

**AK position, 2026-11-01 · for the committed stack: Next 16.2.6 + React 19.2.6 + Tailwind v4.1.17 + framer-motion 12.43 + TS strict `[VERIFIED-FILE]`**

Governing principle: **the project already has an animation library, a glass design system and an ambient background. The best possible outcome here is depth on a small toolset, not breadth.** Every addition below must pay for itself in the same PR.

---

## 1. Decision summary (read this table, then the rationale)

| # | Technology | Verdict | Weight | Why, in one line |
|---|---|---|---|---|
| 1 | **Motion** (upgrade `framer-motion` → `motion`, import from `motion/react`) | ✅ **DO — first action** | free-ish (−few KB, +major features) | MIT, same authors, already installed, React 19-native; v14 adds hardware-accelerated independent transforms `[VERIFIED-REGISTRY/CHANGELOG]` |
| 2 | **React `<ViewTransition>`** (React 19.3 + Next 16.4) | ✅ **DO** | ~0 KB | Route + shared-element + Suspense-reveal motion with **no library**; official Next.js guide `[VERIFIED-DOC]` |
| 3 | **CSS scroll-driven animations** (`animation-timeline: view()/scroll()`) | ✅ **DO for reveals/progress** | 0 KB | Compositor-driven, works under main-thread load; `@supports`-guarded (not Baseline per MDN `[VERIFIED-DOC]`) |
| 4 | **GSAP 3.15 + ScrollTrigger (+ ScrollSmoother optional, SplitText)** | ✅ **DO — only for what CSS can't do** | ~27 KB core + plugins `[REPORTED S5]` | Pinning, scrubbed multi-beat timelines, `Flip` for grid↔detail, `Observer`. Now 100% free incl. all plugins `[VERIFIED-DOC]` |
| 5 | **Lenis 1.3.27** | ⚠️ **OPTIONAL — default NO** | ~10 KB, zero deps | Enables cinematic lerp scroll; costs scroll-latency risk on low-end Android, breaks `prefers-reduced-motion` silently. Approve only via AO decision D2 |
| 6 | **React Three Fiber 9 + drei 10 + three 0.187** | ⚠️ **GATED — one hero scene only** | ~+150–600 KB gz | Full React/WebGL integration, but the heaviest risk in the whole plan. Ship only after 1–5 are live |
| 7 | **@react-three/postprocessing** | ❌ **AVOID** | +~40 KB | Bloom/DoF on a document hub is decoration; adds `postprocessing` (Zlib) peer coupling and extra full-screen passes |
| 8 | **Tailwind v4 native theming** (`@custom-variant dark` + `@theme inline` tokens) | ✅ **DO** | −~30 `!important` rules | Replaces the fragile light-mode override layer found in the audit (§5.2) |
| 9 | **glslCanvas / raw GLSL / ogl** | ❌ **AVOID** | — | Use TSL-free plain `THREE.ShaderMaterial` inside R3F if a shader is needed; `ogl` is 21 months since publish `[VERIFIED-REGISTRY]` |
| 10 | **Lottie / Rive / dotlottie** | ❌ **AVOID for v1** | 30–150 KB WASM/runtime | Only justified for a designer-authored loader. `@rive-app/react-canvas` 4.38.0 is actively maintained if the Product Owner insists later `[VERIFIED-REGISTRY]` |
| 11 | **Theatre.js** | ❌ **AVOID** | — | `@theatre/core` 0.7.2 last published **2024-05-19** `[VERIFIED-REGISTRY]` — effectively unmaintained |
| 12 | **Spline (`@splinetool/react-spline`)** | ❌ **AVOID** | heavy runtime | Undeclared npm license, 2025-07-15 last publish, proprietary runtime + cloud-hosted assets = wrong risk profile for a school project `[VERIFIED-REGISTRY]` |
| 13 | **next-view-transitions (shuding)** | ❌ **AVOID — now redundant** | — | ★2,381, MIT, last push 2026-03-06 `[VERIFIED-API]`. React 19.3 + Next 16.4 made the native path configuration-free; keep the repo as a *reference*, not a dependency |
| 14 | **`@studio-freight/lenis`** | ❌ **NEVER** | — | Deprecated 2024-03 (1.0.42). Tutorials still name it `[VERIFIED-REGISTRY]` |
| 15 | **react-spring / anime.js** (as primary engines) | ❌ **AVOID** | — | Capable and maintained (`@react-spring/three` 10.1.2; `animejs` 4.5.0) but they *duplicate* Motion. One engine only |

## 2. Two coherent packages, one recommendation

**[AK-RECOMMENDATION] Plan A — "Native-first premium" (recommended).**
Motion + View Transitions + CSS scroll-driven + GSAP/ScrollTrigger (targeted) + Tailwind v4 token theming. **Zero 3D.** No Lenis by default.

- Delivers: cinematic entrance choreography, a shared-element card→detail morph, pinned scroll storytelling, `Flip`-powered filter relayout, a scroll progress rail, a theme-transition that actually respects both palettes.
- Cost: ~1 new dependency (gsap) + 1 rename/upgrade (motion) + ~0 for the parts that matter most.
- Risk: low. Everything degrades to a still-visible, keyboard-complete page.
- Best fit for the *actual* product (audit §3: one document, students on cheap Android, classroom projector).

**Plan B — "Plan A + selective 3D".** Everything above, plus **one** R3F scene behind a device/capability gate (hero orb–field or a 3D "document deck" that reacts to pointer and scroll), lazy-loaded, `frameloop="demand"` outside interaction, DPR capped, static poster fallback.

**Plan C — "Cinematic" (do not choose without AO sign-off).** Adds Lenis site-wide + scroll-jacked sections + multiple WebGL scenes. Rejected: it trades the two metrics a student-facing site must win (INP ≤200 ms, LCP ≤2.5 s `[REPORTED S6]`) for effects on the least capable devices.

> Plan A is what AC should implement. Plan B is the approved stretch goal in Phase 4. Plan C is explicitly out.

## 3. Exact install list

**Phase 0 (safety, no visual change):**
```bash
# inside AC's branch — never here
npm install motion@^14                # new name; keep framer-motion only if migration must be staged
npm install gsap@^3.15                 # official package already contains every plugin [VERIFIED-DOC]
# optional, only if AO approves React/Next upgrade
npm install react@^19.3.1 react-dom@^19.3.1 next@^16.4.3
```
Then delete the now-redundant direct dep on `framer-motion` once imports are converted (`motion` v14 lists `framer-motion` as an internal dep `[VERIFIED-REGISTRY]` — it stays in the tree either way, but *our* imports become `motion/react`).

**Plan A additions:** none. (CSS + React + Motion + GSAP cover the plan.)
**Plan B additions (only in Phase 4):**
```bash
npm install three@^0.187.0 @react-three/fiber@^9.8.2 @react-three/drei@^10.7.9
# deliberately NOT @react-three/postprocessing
```
⚠️ `@react-three/fiber` peer is **`react >=19 <19.4`** `[VERIFIED-REGISTRY]` — do not let AC install React 19.4+/20 alongside R3F, and do not add R3F while the app is on React 18 in any future downgrade.

## 4. Why not "just add everything" — the concrete costs

| Trap | Real cost in this codebase |
|---|---|
| Lenis + `html { scroll-behavior: smooth }` (present in `globals.css` `[VERIFIED-FILE]`) | Conflicting scroll control → jitter and double-smoothing. Must be removed if Lenis lands |
| GSAP `pin` inside a `backdrop-filter` layer (`.glass-card` blurs `20px`) | Pinned elements re-rasterise the blur each frame; the classic "premium site, 24 fps on mobile" outcome |
| R3F in `page.tsx` (currently `"use client"` with data inline) | Three.js enters the initial chunk of the *only* page → LCP regression before a single pixel of 3D is visible |
| `framer-motion` v12 + React 19 `Transition` semantics | Misses `AnimateView` (added 13.4.0) and the accelerated-transform work (14.2.0) `[VERIFIED-DOC CHANGELOG]` — i.e. the exact features that make this plan cheap |
| Scroll libraries + ⌘K palette | Both want the scroll/keyboard position; lock body scroll when the palette is open or the palette scrolls the page behind it |

## 5. What AC should *not* touch

- **Do not migrate to a new component library.** No shadcn/ui (`★127,119` `[VERIFIED-API]`), no Aceternity/Magic UI/React Bits as dependencies. **Copy a technique, keep the `.glass-card` system as the single visual language.** Mixing shadcn defaults with the existing glass tokens produces the "template" look the Product Owner is trying to escape.
- **Do not add a CSS-in-JS layer** (styled-components/emotion). Tailwind v4 + CSS variables cover everything.
- **Do not introduce `next-themes`.** The custom `useSyncExternalStore` + inline-script approach works and has no flash; swapping it mid-visual-work invites hydration bugs for zero visual gain (`[VERIFIED-FILE]` audit §5.3).
- **Do not add `@gsap/react` unless `useGSAP` is genuinely needed.** It is small and correct (peer `gsap ^3.12.5`, `react >=17`) but last published 2025-01-15 `[VERIFIED-REGISTRY]`; `gsap.context()`/`ctx.revert()` inside `useLayoutEffect` + `ScrollTrigger.refresh()` is sufficient and dependency-free. [AK-RECOMMENDATION]
- **Do not restructure `src/db`, `drizzle.config.json`, or add Supabase.** Out of scope for a visual pass; note that `drizzle.config.json` currently hardcodes a local `postgres://postgres:postgres@127.0.0.1:5432/app_db` credential `[VERIFIED-FILE]` — flag to AO, don't "fix" it silently in a styling branch.

## 6. If only three things get done

1. Server-component split of `page.tsx` + motion upgrade (bundle and hydration win, enables `AnimateView`/springs).
2. Reveal system on CSS scroll-driven animations with a Motion fallback (motion, no jank, respects reduced motion).
3. View Transition shared-element morph **card → `/presentation/[id]`** — the one interaction that reads as "this is a premium product" for zero runtime cost.

Everything else is seasoning.
