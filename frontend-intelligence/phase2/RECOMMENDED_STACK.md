# Recommended stack — the smallest coherent one

Constraint from the mission: **compatible with the real project, not an imagined stack.** "Real project" here means
AC's committed branch `arena/c9d0d599-presentation` (Next 16.4.3, React 19.2.6, Tailwind 4.1.17, framer-motion
^12.43.0, Supabase + Drizzle, Playwright + axe in CI) [VERIFIED-FILE], whose architecture decisions D1–D8 AK read
and does not propose to change.

## Tier 0 — use now, zero new dependencies (covers ~85 % of the "premium" brief)

| need | mechanism | evidence |
|---|---|---|
| type-led hero, line/word reveal | CSS `@keyframes` + `clip-path`/`translate`, split done in the server component | EX01 (0 KB variant passes headless) |
| reveal-on-enter | existing `Reveal.tsx` (`whileInView`, y 18→0, `cubic-bezier(.22,1,.36,1)`, `useReducedMotion`) | [VERIFIED-FILE] |
| scroll-linked hero | existing `HeroVisual.tsx` (`useScroll` + `useTransform`, y 0→55) | [VERIFIED-FILE] |
| card spotlight / glare / tilt | CSS layers + `@property` custom props, rAF-batched pointer write | EX07 (~4 KB, no JS lib) |
| nav pill / subject rail | framer-motion `animate` on measured rects + roving tabindex | EX08 |
| mobile filter sheet | native `<dialog>` or a hand-rolled sheet: `aria-modal`, Escape, focus return | EX10 (2.0 KB) |
| skeletons | SVG/CSS shimmer matching final geometry | `react-content-loader` pattern |
| page/route morph | native `document.startViewTransition` + `view-transition-name` on the card | EX09 (0 KB) |
| theme flip | View Transition + `clip-path: circle()` from the clicked button's rect | EX09 |
| ambient gradient/mesh | CSS `radial-gradient` + `filter: blur()` on a fixed layer, or `background-position` animation | design-system tokens |
| list performance | `content-visibility: auto` + `contain-intrinsic-size` on result rows | no measurement available: **[UNVERIFIED]** |

**Action for AC: none of this requires a PR to `package.json`.** That is the point of the tier.

## Tier 1 — one small, reversible addition (choose by experience, not by taste)

| add | when | measured cost | install shape | reversible by |
|---|---|--:|---|---|
| **none, but re-import framer-motion from its mini entry** | always | **−15.2 KB gz** | `framer-motion/mini` + `LazyMotion features={domAnimation}` | one import sweep |
| raw WebGL2 background (copy EX05) | PO wants a moving hero atmosphere | 2.9 KB | own file, `use client`, dynamic import | delete one file |
| Lenis | PO wants momentum scroll on the story section | 5.3 KB | `lenis@1.3.27`, desktop gate + toggle | remove provider |

## Tier 2 — needs a PO decision and a licence review before AC touches anything

| add | cost | blocker |
|---|--:|---|
| `gsap` + `ScrollTrigger` (pinned cinematic chapter) | 44.4 KB gz on the landing route | **licence is a custom "Standard no charge"**, not MIT [VERIFIED-LICENSE npm metadata]; repo activity 2026-04-13 [VERIFIED-API]. PO must accept a non-OSS-licence runtime dependency. |
| `three` + `@react-three/fiber` (+ `drei`) | ≥130 KB gz + reconciler + any drei helper bytes (unmeasured) | React-major coupling; SSR isolation; poster/fallback policy; battery on mobile. Recommend approving *a single 3D moment*, never a 3D site. |
| `@rive-app/react-canvas` | unmeasured, + runtime + WASM | vendor runtime for one asset class; only if an interactive illustrated asset is commissioned |

## Tier 3 — explicitly not recommended

| rejected | why |
|---|---|
| `motion` (rename of framer-motion) | measured +4.6 KB vs what AC ships, no capability AC lacks |
| `lottie-web` | last push 2025-09-01 (13 months) [VERIFIED-API]; a renderer + JSON payloads for decoration |
| `@view-transitions/react` | peer requires React ≥19.3; AC pins 19.2.6 → native API works without it |
| any carousel lib (embla/swiper/flickity) | none found in the qualified set for embla at all; `scroll-snap` did the job in EX10 at 2 KB |
| `react-virtualized` | maintenance mode; `TanStack/virtual` (★7,179, pushed 2026-11-01 [VERIFIED-API]) is the living option — **and we don't need either at 12–24 results per page** |
| GSAP plugins SplitText/Flip | +8.7 KB/+9 KB for text splitting and FLIP that `@property` + measured rects already solved (EX01/EX08) |
| a CSS-in-JS runtime, a UI kit, a state lib | AC has tailwind 4 tokens + `zod`; adding a runtime would fight their D-decisions |

## What "installing" means if Tier 2 is approved

```jsonc
// proposed additions ONLY (AC's package.json is untouched by AK — this is a proposal, not a change)
"@react-three/fiber": "^9.x",   // pins to react 19; verify latest with `npm view` at install time
"@react-three/drei": "^10.x",
"three": "^0.187.0",            // AK measured against 0.187.0
"gsap": "^3.15.0",              // licence review required first
"lenis": "^1.3.27"
```
Version numbers above are the ones AK measured (three 0.187.0, gsap 3.15.0, lenis 1.3.27, framer-motion 12.43.0,
motion 14.9.0) [VERIFIED-FILE: lab `package.json`] — **AC must re-check `npm view <pkg> version` at install time**;
do not copy these pins from a research doc on faith.

## Rule set that keeps this stack small

1. **Every animated effect starts as CSS.** It graduates to JS only if it needs a measured value, interruption, sequencing, or a non-DOM target.
2. **No library on a route that isn't using it.** Landing-only libraries land behind `dynamic(() => import(...), { ssr:false })` in the landing client component, not in the root layout.
3. **One global animation authority.** AC's app animates with framer-motion + CSS. GSAP, if approved, is scoped to *one* section and never used for component state.
4. **Capability gate → dynamic import → try/catch build → destroy()** for anything touching WebGL (all three GL experiments use exactly this; the pattern caught a real crash in the lab).
5. **Size is a CI signal, not a review comment.** See `PERFORMANCE_BUDGETS.md` §4 for the `size-limit` block to add.
6. **Reversibility is a design requirement.** Each Tier 1/2 item is one folder or one provider, so a decision can be undone in one commit — this is how AC should be able to say yes to experiments.

## What this stack delivers against the brief

| brief phrase | delivered by | quality gate |
|---|---|---|
| "premium SaaS, futuristic but sophisticated" | type system + spacing + selective layering + one ambient effect | PO visual sign-off on EX05/EX07 composites |
| "editorial typography" | variable serif + Inter/Space Grotesk pairing (see `VISUAL_DESIGN_PATTERNS.md`) | contrast + measure + scale tested |
| "immersive scroll storytelling" | CSS scroll-driven reveals; pinned chapter **only** if Tier 2 approved | LCP/INP/CLS budgets §2 |
| "selected 3D" | R3F behind opt-in gate, one moment, poster-first | 130 KB + FPS floor on 4× throttle |
| "sophisticated micro-interactions" | Tier 0 CSS/`@property` + framer-motion `animate` | axe 0 violations; reduced-motion parity |
| "responsive & performant" | mobile = different implementation (EX10), not a shrunk desktop | 2.0 KB gz mobile variant, 44 px targets |
| "no animation pile-up" | rule 1 + `@property` default + no Lottie/Rive/GSAP by default | one animated layer per viewport |

## Corrections from the 2026-11-02 verification pass

Four lines in this file were refined after re-reading source instead of summaries (`VERIFICATION_LOG.md` §4):

| line | correction | effect on the recommendation |
|---|---|---|
| Tier 2/3 wording implying a `framer-motion` → `motion` **package rename** | npm `framer-motion@14.9.0` exists (published 2026-10-30, same repo, same version line as `motion`) | AC's upgrade is `framer-motion@14.9.0` — one dependency line, no rename, no codemod on that axis |
| Tier 3 "skip `@react-three/postprocessing`" | its peers are `@react-three/fiber >=9.7`, `react ^19`, `three >=0.156`, `postprocessing ^6.36`; repo `pmndrs/react-postprocessing` ★1,498 MIT, pushed 2026-10-21 | **still ❌**, but the stated reason is now bundle cost, not React-19 uncertainty |
| Tier 3 `ogl` | no `LICENSE` file in repo; `Unlicense` declared in `package.json`/npm; `ogl@1.0.11` published 2025-01-27 (21 months stale) | **still ❌**, reason changed to staleness + weaker legal position (do not vendor its code) |
| Tier 2 `cmdk` / `@gsap/react` | `cmdk@1.1.1` last **published** 2025-03-14 (repo quiet since 2025-10-29, and it is not a fork — the upstream repo simply moved); `@gsap/react@2.1.2` last published **2025-01-15** | Pin `cmdk@1.1.1` and treat it as frozen; prefer bare `gsap.context()` + `ctx.revert()` over `@gsap/react` (one less 21-month-old dependency for a 2 KB wrapper) |
| Tier 1 "virtualisation is unnecessary at 12–24 results/page" | `@tanstack/react-virtual@3.14.25` published **2026-11-01**, MIT, `react ^19` in peers, 1 dep | unchanged conclusion, better evidence: it is the *living* option whenever the dataset passes ~200 rows |
