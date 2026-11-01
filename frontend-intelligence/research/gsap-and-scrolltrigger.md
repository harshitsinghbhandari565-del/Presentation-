# GSAP + ScrollTrigger (2026 state)

**AK · 2026-11-01**

## 1. The licensing fact that changes the decision — verified twice

- **Claim:** GSAP is 100% free **including every formerly Club-only plugin** (SplitText, MorphSVG, DrawSVG, ScrollSmoother, Inertia, MotionPathHelper, GSDevTools, ScrambleText, Physics2D) for commercial and non-commercial use; the change landed **2025-04-30** following Webflow's **2024-10-15** acquisition of GreenSock. `[REPORTED]` — corroborated by 6 independent 2025–2026 sources.
- **Corroboration from the primary repo `[VERIFIED-DOC — README read directly]`:** `greensock/gsap-skills` states *"GSAP is 100% free — including every plugin… Install everything from the public `gsap` npm package — no Club membership, no `.npmrc` / auth token, no private registry required."*
- **Registry proof `[VERIFIED-REGISTRY]`:** `gsap@3.15.0` (published 2026-04-13) declares license **`Standard "no charge" license`** and its `exports` map exposes `./*` — i.e. `gsap/SplitText`, `gsap/ScrollTrigger`, `gsap/Flip` are all in the public package. There is also a legacy `gsap-trial@3.13.0` (2025-04-30) which AC must **not** use.

**Practical consequences for this team:**
1. Any tutorial saying "SplitText requires Club GreenSock / Business Green" is **stale** — do not let AC's priors talk it out of using it.
2. **Not open source.** GreenSock's standard license permits commercial use but forbids reselling GSAP or building a competing animation product. Irrelevant to shipping our hub; relevant if this code were ever published as a reusable library `[REPORTED S2]`.
3. No private registry config, no auth token, no `.npmrc`. If AC generates any of those, it is hallucinating a 2024 workflow.

## 2. Version & package reality

| Item | Value | Source |
|---|---|---|
| `gsap` latest | **3.15.0**, published 2026-04-13 | `[VERIFIED-REGISTRY]` |
| Current line | 3.x — **there is no GSAP 4**; 3.x API has been stable for years (a genuine upgrade-safety argument) | `[REPORTED S2]` |
| Repo | `greensock/GSAP`, ★30,021, last push 2026-04-13, license `NONE` (custom standard license) | `[VERIFIED-API]` |
| React helper | `@gsap/react@2.1.2` (2025-01-15), peers `gsap ^3.12.5`, `react >=17` | `[VERIFIED-REGISTRY]` |
| SplitText | Rewritten in 3.13: **~50% smaller**, ~14 new features, **no longer uses the `position:absolute` hack** → splits reflow naturally and is friendlier to screen readers | `[REPORTED S2]` |
| Core size | ~22–27 KB min+gzip core; plugins add à la carte | `[REPORTED S1/S2/S6]` |
| Official agent skills | `greensock/gsap-skills` ★17,684, MIT, 8 skills (core, timeline, scrolltrigger, plugins, utils, react, performance, frameworks), install `npx skills add https://github.com/greensock/gsap-skills` | `[VERIFIED-API + VERIFIED-DOC]` |

`[AK-RECOMMENDATION]` **Have AC install the GSAP skills before writing animation code.** This is the highest-leverage low-risk step in the entire program: it is authored by GSAP, is in the Agent Skills format, and directly targets the SSR/cleanup/registerPlugin mistakes agents make. Same for `vercel-labs/agent-skills` → `vercel-react-view-transitions` (★33,341 `[VERIFIED-API]`), which the official Next.js guide itself links.

## 3. Plugin-by-plugin relevance to *this* product

| Plugin | What it does | Relevance to Harshit Presentation Hub | Verdict |
|---|---|---|---|
| **ScrollTrigger** | Scroll-linked/triggered tweens, pin, scrub, snap, batch | Hero storytelling + section reveals | ✅ **use** |
| **Flip** | Animate between two layout states automatically | **The** search/filter relayout animation for the card grid; grid↔list toggle | ✅ **use** (highest value-per-KB here) |
| **SplitText** | Split into chars/words/lines, stagger | Hero title, section headings; accessible now | ✅ use, hero + 1 heading per section max |
| ScrollToPlugin | Animated scroll to target | ⌘K result → section jump; "back to top" | ⚠️ only if Lenis is absent (Lenis `scrollTo` covers it) |
| ScrollSmoother | Lerp smooth scroll + `data-speed` parallax | Would duplicate Lenis; known friction with `position: fixed` + `overflow: hidden` | ❌ prefer Lenis if smoothing is approved at all |
| Observer | Unified wheel/touch/keys/drag | Fullscreen "presentation stepper" on `/presentation/[id]` | 💡 optional, genuinely nice for classroom use |
| Draggable / Inertia | Drag + momentum | Card drag-reorder for a custom "playlist" | ❌ out of scope |
| MorphSVG / DrawSVG | Path morph/draw | Animated underline/drawn rule motifs, logo trace on load | 💡 DrawSVG on a single 1-path divider — cheap, distinctive |
| MotionPath | Follow an SVG path | Decorative; no product need | ❌ skip |
| CustomEase / EasePack | Author easing curves | Encode *the* house curve once (`0.22,1,0.36,1`) | ✅ use as config, not as content |
| GSDevTools | Visual timeline editor | Debug only; never ship | ⚠️ dev-only |

## 4. React + Next 16 integration rules (where GSAP breaks)

```ts
"use client";
import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);   // once, guarded
```

1. **Register once, guarded.** `gsap.registerPlugin` at module scope is safe but do it inside a `typeof window` check to keep RSC/SSR quiet.
2. **`useLayoutEffect`, not `useEffect`,** for anything that must not flash the un-animated state; wrap in `gsap.context(scope, fn)` and return `ctx.revert()`. `useGSAP()` from `@gsap/react` does exactly this if AC prefers the hook (`[REPORTED S7]`).
3. **Never animate from React state.** Mutate via refs/timelines; React owns structure, GSAP owns presentation. (Applies to the existing `useState` filter logic in `page.tsx` `[VERIFIED-FILE]`.)
4. **Strict Mode double-invoke** creates triggers twice → `ctx.revert()` + `ScrollTrigger.getAll().forEach(t => t.kill())` on unmount is the fix; `ScrollTrigger.batch()` for many cards beats many triggers.
5. **Refresh discipline:** call `ScrollTrigger.refresh()` after data/filter changes, after `next/image` loads, after fonts settle; set `invalidateOnRefresh: true` on scrub scenes.
6. **`pin` + `backdrop-filter`:** the project's `.glass-card` uses `backdrop-filter: blur(20px) saturate(180%)` `[VERIFIED-FILE]`. Pinning glass (or pinning *inside* a blurred ancestor) forces a blur re-composite per frame → jank on mid phones. Pinned scenes should be opaque-surface, not glass.
7. **Don't fight `next dev` HMR:** GSAP + hot reload double-adds tweens; `ctx.revert()` on cleanup makes HMR safe.
8. **Reduced motion:** `const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches` → set targets immediately (`gsap.set`) instead of tweening; also listen for changes and `ScrollTrigger.refresh()`. `prefers-reduced-motion` in CSS does **not** stop a JS timeline.
9. **Code-split:** keep any GSAP module out of shared layout; `next/dynamic(..., { ssr: false })` for the one heavy scene. GSAP's tree-shaking is decent but plugins must be imported to be bundled.

## 5. Where GSAP wins over CSS/Motion for us (the honest short list)

- **Pinning** (CSS has no equivalent) — the hero "how discovery works" scene.
- **Timelines with relative overlaps & labels** — orchestrating 4+ coordinated beats.
- **Flip** — layout-state animation without React re-key gymnastics.
- **SplitText with semantic reflow** — word/line reveals that survive wrapping and don't mangle the a11y tree.
- **Determinism:** one engine, one frame loop, `lagSmoothing(0)` when scroll-syncing.

Everything else (fade/slide on enter, progress bars, small parallax, hover states) should be **CSS** — cheaper, and it survives a blocked/slow script.

## 6. Anti-patterns observed repeatedly in the reference material

- Scrubbing a long section on a page whose purpose is *finding a link* → delays the click. Our scroll scene must be skippable (a "Skip intro" affordance) and never gate the search UI.
- `pinSpacing` on mobile creating giant dead zones → set `pinSpacing: false` + shorter `end`, or unpin below 768 px.
- `markers: true` reaching production.
- Animating `top/left/margin` instead of `x/y/scale` (triggers layout).
- `will-change` left on permanently → keep it scoped to the animating element and remove after.
- ScrollTrigger inside `overflow: auto` containers with the wrong `scroller` → silently dead. The palette list is such a container here.
- Reveal animations that leave content at `opacity: 0` when JS fails (progressive-enhancement failure). Author final-state default, opt into motion `[REPORTED S8]`.

## 7. Bundle budget attribution

| Addition | Approx. cost (min+gzip) | Source |
|---|---|---|
| `gsap` core + `ScrollTrigger` | ~30–35 KB | `[REPORTED S1/S6]` (core ~22–27 KB + plugin à la carte) |
| + `Flip` | +~5–8 KB | à la carte |
| + `SplitText` | +~4–6 KB | à la carte (3.13 rewrite halved it) `[REPORTED S2]` |
| Lenis | ~10 KB, zero deps | `[VERIFIED-REGISTRY]` |
| R3F + drei (for contrast) | ~150–400 KB | see `react-three-fiber.md` |

`[AK-RECOMMENDATION]` Ship `gsap` (core + ScrollTrigger + Flip) in Phase 1 — **~40 KB** — and defer `SplitText` to Phase 2 so the size delta of the first visual commit stays measurable.
