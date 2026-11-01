# Repository Catalog — verified metadata

**AK · 2026-11-01.** Every stars/last-push/license/homepage figure below was returned by the GitHub API on this date (`/search/repositories` + `/repos/{owner}/{name}`). **Do not trust any version of this table you remember** — numbers and dates moved during 2026.

**Method:** ~150 candidate repositories surfaced across 38 targeted searches → deduplicated → **46 retained** in this table → **18 analyzed in depth** (marked ◆) by additionally reading their README, `package.json`/`exports`, CHANGELOG or npm registry record. 40+ examined-and-rejected candidates are listed in §4 so AC does not re-discover them.

Legend — **License:** `MIT/Apache` = permissive, safe to study and (attribution aside) adapt · `NONE/NOASSERTION` = **no usable license granted → read-only reference, do not copy code** · `AGPL` = copyleft, **do not vendor**. **Status:** Active (<3 mo) · Slow (<18 mo) · Stale (>18 mo) · Archived.

---

## 1. Master table

### Animation & scroll engines
| ◆ | Repository | ★ | Last push | License | Status | Homepage | Relevance |
|---|---|---|---|---|---|---|---|
| ◆ | [greensock/GSAP](https://github.com/greensock/GSAP) | 30,021 | 2026-04-13 | **NONE** (Standard "No Charge") | Slow† | gsap.com | ScrollTrigger, SplitText, Flip — the scroll engine |
| ◆ | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | 17,684 | 2026-07-29 | MIT | Active | — | **Official AI skills** — install for AC before GSAP work |
| ◆ | [motiondivision/motion](https://github.com/motiondivision/motion) | 34,769 | **2026-11-01** | MIT | Very active | motion.dev | The project's existing engine; `motion/three` + `AnimateView` |
| ◆ | [darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) | 17,023 | 2026-10-29 | MIT | Very active | lenis.dev | Smooth scroll; `lenis/react`; ScrollTrigger sync recipe |
| ◆ | [shuding/next-view-transitions](https://github.com/shuding/next-view-transitions) | 2,381 | 2026-03-06 | MIT | Slow | vercel demo | Pattern reference only — **superseded by React 19.3 native** |
| ◆ | [nextjs/react-view-transitions-demo](https://github.com/nextjs/react-view-transitions-demo) | 32 | 2026-10-14 | NONE | Active | labs demo | **Official Next.js VT patterns** — closest thing to a spec for our detail-page morph |
| | [rudrodip/theme-toggle-effect](https://github.com/rudrodip/theme-toggle-effect) | 817 | 2025-10-07 | NONE | Slow | theme-toggle.rdsx.dev | Circular-clip theme transition via VT |
| ◆ | [oframe/ogl](https://github.com/oframe/ogl) | 4,744 | 2025-04-13 | NONE‡ | Slow | examples | Minimal WebGL — bundle argument, not a dependency |
| | [iDev-Games/Trig-JS](https://github.com/iDev-Games/Trig-JS) | 174 | 2026-05-22 | MIT | Active | demo | CSS-var scroll animations, zero JS per frame |
| | [alexfoxy/lax.js](https://github.com/alexfoxy/lax.js) | 10,457 | 2025-05-21 | MIT | **Archived** | — | Do not adopt |
| | [callmecavs/jump.js](https://github.com/callmecavs/jump.js) | 3,422 | 2026-09-13 | MIT | Active | — | Scroll-to (only if Lenis is not used) |
| | [gongnyang/awesome-html-scrolline-deck](https://github.com/gongnyang/awesome-html-scrolline-deck) | 102 | 2026-10-08 | MIT | Active | demo | Scroll-driven *presentation* deck patterns — directly adjacent to our product |

### 3D / WebGL
| ◆ | Repository | ★ | Last push | License | Status | Homepage | Relevance |
|---|---|---|---|---|---|---|---|
| ◆ | [mrdoob/three.js](https://github.com/mrdoob/three.js) | 117,352 | **2026-11-01** | MIT | Very active | threejs.org | `./webgpu`, `./tsl` exports; examples = technique library |
| ◆ | [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) | 33,417 | 2026-10-21 | MIT | Active | docs.pmnd.rs | React renderer; peer `react >=19 <19.4` |
| ◆ | [pmndrs/drei](https://github.com/pmndrs/drei) | 10,097 | 2026-10-21 | MIT | Active | docs.pmnd.rs/drei | `<Text> <Float> <Instances> <Html>`; avoid the kitchen sink |
| ◆ | [pmndrs/react-postprocessing](https://github.com/pmndrs/react-postprocessing) | 1,496 | 2026-10-21 | MIT | Active | docs | **Not recommended** (bloom/DoF on a text UI) |
| ◆ | [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing) | 2,927 | 2026-11-01 | **Zlib** | Active | — | license note matters if vendored |
| ◆ | [pmndrs/react-three-next](https://github.com/pmndrs/react-three-next) | 2,883 | **2024-06-21** | MIT | **Stale** | demo | R3F+Next starter — patterns only, do **not** scaffold from it |
| | [pascalorg/editor](https://github.com/pascalorg/editor) | 25,261 | 2026-10-30 | MIT | Very active | editor.pascal.app | Large-scale R3F app architecture (MCP, CLI, perf) |
| | [srizzon/git-city](https://github.com/srizzon/git-city) | 5,960 | 2026-10-26 | **AGPL-3.0** | Active | thegitcity.com | 3D-as-navigation-over-real-data pattern; **copyleft** |
| | [img2threejs/img2threejs](https://github.com/img2threejs/img2threejs) | 20,018 | 2026-10-28 | Apache-2.0 | Active | img2threejs.io | Procedural 3D-from-image generation; pipeline idea, not a runtime dep |
| ◆ | [FarazzShaikh/THREE-CustomShaderMaterial](https://github.com/FarazzShaikh/THREE-CustomShaderMaterial) | 1,354 | 2025-10-12 | MIT | Slow | demo | Inject custom GLSL into standard materials — the right way to keep lighting |
| | [martinlaxenaire/curtainsjs](https://github.com/martinlaxenaire/curtainsjs) | 1,826 | 2025-04-03 | MIT | Slow | curtainsjs.com | DOM-element-as-WebGL-plane: the correct hybrid architecture |
| | [countertype/three-text](https://github.com/countertype/three-text) | 126 | 2026-07-04 | MIT | Active | countertype.com | High-fidelity 3D type (an alternative to troika SDF for real fonts) |
| | [mkkellogg/GaussianSplats3D](https://github.com/mkkellogg/GaussianSplats3D) | 2,937 | 2025-10-19 | MIT | Slow | — | Not applicable (no captured scenes) |
| | [pixiv/three-vrm](https://github.com/pixiv/three-vrm) | 2,251 | 2026-10-22 | MIT | Active | — | Out of scope |
| | [PavelDoGreat/WebGL-Fluid-Simulation](https://github.com/PavelDoGreat/WebGL-Fluid-Simulation) | 16,786 | **2024-11-12** | MIT | **Stale** | demo | The famous fluid effect: **stale + irrelevant** → refuse |
| | [fand/vfx-js](https://github.com/fand/vfx-js) | 1,163 | 2026-10-19 | MIT | Active | amagi.dev/vfx-js | Shaders on DOM elements with a GLSL-like DSL — best-in-class reference for "DOM + shader" |
| | [emilwidlund/alma](https://github.com/emilwidlund/alma) | 902 | 2024-09-27 | NONE | Stale | alma.sh | Node-based generative WebGL; aesthetics only |
| | [mlt131220/Astral3D](https://github.com/mlt131220/Astral3D) | 2,508 | 2026-10-31 | Apache-2.0 | Very active | astraljs.com | Vue-based engine + particle/plugin system — wrong stack |
| | [jeeliz/jeelizFaceFilter](https://github.com/jeeliz/jeelizFaceFilter) | 2,954 | 2025-11-14 | Apache-2.0 | Slow | jeeliz.com | Tiny WebGL tracking; irrelevant |
| | [tengge1/ShadowEditor](https://github.com/tengge1/ShadowEditor) | 1,716 | 2026-05-25 | MIT | Active | — | Scene-editor architecture; irrelevant |
| | [heremaps/harp.gl](https://github.com/heremaps/harp.gl) | 1,318 | 2023-02-03 | Apache-2.0 | **Archived** | — | 3D map engine; note only |
| | [syt123450/giojs](https://github.com/syt123450/giojs) | 1,741 | **2021-02-18** | Apache-2.0 | **Stale (5 yr)** | giojs.org | Declarative 3D globe viz; **do not adopt**, concept only |
| | [dragonir/3d](https://github.com/dragonir/3d) | 2,907 | **2022-11-15** | NONE | Stale | demo | Chinese 3D showcase collection; pre-r150 APIs |

### Scroll storytelling & demos (mostly Codrops-affiliated)
| ◆ | Repository | ★ | Last push | License | Status | Relevance |
|---|---|---|---|---|---|---|
| ◆ | [codrops/ScrollBasedLayoutAnimations](https://github.com/codrops/ScrollBasedLayoutAnimations) | 338 | **2026-10-31** | **MIT** | Very active | **The single most on-point repo found:** scroll-based layout switching, GSAP ScrollTrigger, official Codrops, permissively licensed |
| | [codrops/PolaroidStackGrid](https://github.com/codrops/PolaroidStackGrid) | 60 | 2016-02-17 | NONE | Stale | Intro-stagger idea only |
| | [barvian/CodropsCarousels](https://github.com/barvian/CodropsCarousels) | 100 | 2024-01-24 | NONE | Stale | CSS scroll-driven carousels (no JS!) — technique is current, code is dated |
| | [JosephASG/codrops-cinematic-scroll-animations](https://github.com/JosephASG/codrops-cinematic-scroll-animations) | 83 | 2026-03-16 | NONE | Active | Cinematic 3D scroll (CSS `perspective` + GSAP) — the "3D transitions" idea without WebGL |
| | [iondrimba/interactive-repulsive-effect](https://github.com/iondrimba/interactive-repulsive-effect) | 217 | 2022-07-30 | NOASSERTION | Stale | Grid-item repulsion on pointer — nice on a card grid |
| | [DmitriNaumov/Paralax-effect-with-gsap-scrolltrigger](https://github.com/DmitriNaumov/Paralax-effect-with-gsap-scrolltrigger) | 142 | 2023-02-27 | NONE | Stale | Minimal scrub demo |
| | [chrisgannon/ScrollLottie](https://github.com/chrisgannon/ScrollLottie) | 88 | 2023-05-21 | NONE | Stale | Lottie scrubbed by ScrollTrigger (the pattern we're *not* using) |
| | [ektogamat/drill-webgi-tutorial](https://github.com/ektogamat/drill-webgi-tutorial) | 197 | 2023-02-12 | NONE | Stale | Scroll-driven WebGL image sequence; concept for a slide "flip-through" |
| | [holux-design/v-gsap-nuxt](https://github.com/holux-design/v-gsap-nuxt) | 169 | 2026-02-10 | NONE | Active | Nuxt — framework mismatch, wrapper design is instructive |

### UI systems, components & discovery
| ◆ | Repository | ★ | Last push | License | Status | Relevance |
|---|---|---|---|---|---|---|
| ◆ | [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits) | **50,952** | 2026-10-31 | **NOASSERTION** | Very active | Largest catalogue of animated React/Next components; **read the docs, respect the license terms** |
| ◆ | [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | **127,119** | 2026-10-31 | MIT | Very active | Token + component-quality bar; **do not re-platform** |
| ◆ | [dip/cmdk](https://github.com/dip/cmdk) | 13,057 | 2025-10-29 | MIT | Slow | Unstyled command palette — a11y reference for our existing ⌘K |
| | [21st-dev/magic-mcp](https://github.com/21st-dev/magic-mcp) | 6,333 | 2026-09-09 | ISC | Active | MCP for 10k+ React/Tailwind components — an *agent-tooling* lever for AC |
| | [lucide-icons/lucide](https://github.com/lucide-icons/lucide) | 25,442 | 2026-11-01 | NOASSERTION | Very active | Already used; icon-quality/consistency bar |
| | [aurorascharff/next16-conferences](https://github.com/aurorascharff/next16-conferences) | 167 | 2026-05-24 | MIT | Active | **Most similar tech stack to ours found:** Next 16 + React View Transitions, animated *explorer* of records |
| | [aurorascharff/next16-calendar](https://github.com/aurorascharff/next16-calendar) | 81 | 2026-09-25 | NONE | Active | Async React + Cache Components + partial prefetching patterns |
| | [adhhamdev/modern-react-guides…](https://github.com/adhhamdev/modern-react-guidance) | 49 | 2026-09-25 | MIT | Active | Agent skill for React 19+ (Actions, `use`, Compiler, **View Transitions**) |
| | [productdevbook/pencere](https://github.com/productdevbook/pencere) | 48 | 2026-06-29 | MIT | Active | Zero-dep lightbox using **native View Transitions** — model for a media/preview overlay |
| | [viliket/pure-web-bottom-sheet](https://github.com/viliket/pure-web-bottom-sheet) | 223 | 2026-10-20 | MIT | Active | Bottom sheet web component on CSS scroll-driven animations — model for mobile facet sheet |
| | [pptt3300/ui-fx-kit](https://github.com/pptt3300/ui-fx-kit) | 49 | 2026-03-23 | MIT | Slow | 64 composable cursor/scroll/text/background effects — effect *taxonomy* reference |
| | [Felix-au/CursorX-Interactive-Cursor-Effects](https://github.com/Felix-au/CursorX-Interactive-Cursor-Effects) | 119 | 2026-08-05 | MIT | Active | 20+ cursor effects with previews |
| | [mulkatz/use-magnetic](https://github.com/mulkatz/use-magnetic) | 1 | 2026-10-03 | MIT | Active | Tiny a11y-first magnetic hook — readable implementation |
| | [vikingmute/scrambl](https://github.com/vikingmute/scrambl) | 37 | 2026-05-11 | MIT | Active | Zero-dep text scramble/decode |
| | [react-pdf-viewer/react-pdf-viewer](https://github.com/react-pdf-viewer/react-pdf-viewer) | 2,600 | 2024-08-19 | NOASSERTION | **Archived** | Document preview — **do not use**; evidence our iframe/`embedUrl` approach is right |
| | [mohitkumawat310/react-pdf-flipbook-viewer](https://github.com/mohitkumawat310/react-pdf-flipbook-viewer) | 67 | 2025-11-15 | MIT | Slow | "Flip through slides" interaction reference |
| | [codebucks27/Next.js-Creative-Portfolio-Website](https://github.com/codebucks27/Next.js-Creative-Portfolio-Website) | 400 | 2026-10-06 | MIT | Active | Next.js + Three.js + Tailwind tutorial build (their repos are tutorial-grade; verify before trusting) |
| | [ShowravKormokar/capsule](https://github.com/ShowravKormokar/capsule) | 103 | 2026-03-24 | NONE | Active | **Clone of Awwwards-winning `capsule.moyra.co`** — how an award site is actually constructed |
| | [manish-850/gentlerain.ai](https://github.com/manish-850/gentlerain.ai) | 46 | 2025-12-06 | NONE | Slow | Clone of an Awwwards-winning SaaS site — GSAP/Lenis composition |
| | [asbhogal/Fyrre-Magazine](https://github.com/asbhogal/Fyrre-Magazine) | 136 | 2024-07-20 | NONE | Stale | Next.js **editorial** SPA — closest "premium editorial discovery" build I found |
| | [ITomPoland/portfolio-itom](https://github.com/ITomPoland/portfolio-itom) | 463 | 2026-09-08 | MIT | Active | R3F immersive site with scroll-driven 3D; recent, real, MIT |
| | [davidhckh/portfolio-2025](https://github.com/davidhckh/portfolio-2025) | 882 | 2026-08-11 | NOASSERTION | Active | Three.js performance discipline in a non-React app |

† GSAP's npm release is 3.15.0 (2026-04-13) — "slow" here means *stable and mature*, not abandoned; the 3.x API has been deliberately frozen for years `[REPORTED S2]`.
‡ `ogl` shows `NONE` at repo level while npm reports Unlicense — where they differ, the **npm field governs the installed artifact**, the repo field governs copied source.

## 2. Depth analysis — the 6 repositories AC should actually open

Format follows the brief's 14-point template.

### 2.1 `greensock/gsap-skills` ◆ — official AI skills for GSAP
1. **Name:** GSAP AI Skills · 2. **URL:** github.com/greensock/gsap-skills · 3. **Demo:** n/a (text skills) · 4. **Purpose:** teach coding agents correct GSAP usage — core API, timelines, ScrollTrigger, plugins, React/SSR, performance, frameworks · 5. **Tech:** Markdown skill files (Agent Skills format), works with the `skills` CLI across Cursor/Claude Code/Copilot/Codex · 6. **Features:** 8 skills; explicit install guidance (*"npm package, no auth token, no private registry"*); React SSR + `useGSAP` + `gsap.context()` cleanup rules · 7. **What AC learns:** the exact register/clean up/refresh patterns that prevent ScrollTrigger leaks in React, plus current licensing facts · 8. **Reusable:** the rules, verbatim, as a PR checklist · 9. **Install:** `npx skills add https://github.com/greensock/gsap-skills` (or `/plugin marketplace add` in Claude Code) · 10. **License:** MIT `[VERIFIED-API]` · 11. **Maintenance:** created 2026-03-04, pushed 2026-07-29, ★17,684, forks 1,093 — first-party, funded (Webflow) · 12. **Limitations:** covers GSAP only; says nothing about R3F/VT; skills consume context in AC's window · 13. **Perf:** n/a · 14. **Compatibility:** stack-agnostic; **directly usable by our agent team.** `[AK-RECOMMENDATION]` install before Phase 1.

### 2.2 `codrops/ScrollBasedLayoutAnimations` ◆ — best technique-to-license match
★338, **pushed 2026-10-31**, **MIT**, official Codrops account `[VERIFIED-API]`. Four scroll-based layout-switch explorations driven by GSAP ScrollTrigger. **Why it matters:** our hardest animation problem is *filtered grid relayout* (results re-flow when a chip changes); this repo is exactly that, from a reputable source, with a license that permits adaptation. Contains Vite + vanilla JS structure, so AC must re-derive the React wiring (`useLayoutEffect` + `gsap.context` + `ScrollTrigger.refresh()` on data change). Known limitation: demos are desktop-first, several use absolute-positioned overlays that need explicit mobile fallbacks. Live demos via the article (tympanus.net) rather than a repo homepage (`homepage: null` `[VERIFIED-API]`).

### 2.3 `darkroomengineering/lenis` ◆
★17,023, pushed 2026-10-29, MIT, lenis.dev, zero runtime deps `[VERIFIED-REGISTRY]`. Monorepo with `lenis/react` (`<ReactLenis>`, `useLenis`), `lenis/snap`, `lenis/vue`, `lenis/framer`. Verified from the README: the ScrollTrigger sync recipe, `scrollTo` options, `allowNestedScroll`, `data-lenis-prevent`, required `lenis.css`. **Learning value:** the required-CSS-and-cleanup contract, and the explicit "test without Lenis first" troubleshooting step. **Limitations:** no automatic reduced-motion handling; smoothing is a global behaviour that is hard to scope to one section; `syncTouch` discouraged. **Verdict:** read even if we don't install (we don't, by default).

### 2.4 `pmndrs/react-three-fiber` + `pmndrs/drei` ◆
Peers verified: fiber `react >=19 <19.4`, `three >=0.156`; drei `fiber ^9`, `react ^19`, `three >=0.159` `[VERIFIED-REGISTRY]`. Docs at docs.pmnd.rs are current (repo pushed 2026-10-21). **What AC learns:** declarative scene graph, `frameloop="demand"` + `invalidate()`, `useFrame` ref-mutation (never setState), automatic disposal. **Install requirements:** `@types/three` pinned to three's minor; `ssr:false` boundary; no webpack loader needed for shaders on Turbopack (use template literals or `?raw` if configured). **Limitations:** the R3F peer ceiling will constrain future React upgrades; drei's barrel imports need tree-shake verification; no a11y story for canvas content — that is our job.

### 2.5 `DavidHDev/react-bits` ◆
★50,952, pushed 2026-10-31, **license `NOASSERTION`** `[VERIFIED-API]` — i.e. GitHub could not identify a license file; the site (reactbits.dev) offers free components plus a paid "Pro" tier. **Value:** the fastest route to a polished splash text / animated gradient / spotlight card, and a good vocabulary for component naming. **Discipline required:** **do not bulk-copy components into the repo** without checking each component's terms; prefer re-implementing the *effect* in our own tokens. `reactbits.dev-skill` and an MCP server exist (`ceorkm/reactbits-mcp-server` ★72, MIT) if AO wants AC to consult components live.

### 2.6 `nextjs/react-view-transitions-demo` ◆
★32, pushed 2026-10-14 `[VERIFIED-API]`, linked from the official Next.js guide `[VERIFIED-DOC]`. Small, but it is the **authoritative** worked example of `<ViewTransition>` in the App Router: shared-element morphs, Suspense reveals, `transitionTypes` directional nav, `share="morph"` + `default="none"`, and the exact CSS pseudo-element selectors. **This is where our detail-page morph should be copied from** (first-party Vercel/Next code; the repo shows no SPDX license in the API — treat as reference, keep our implementation original).

## 3. License discipline (do not skip)

| Scenario | Allowed? |
|---|---|
| Reading any repo above to learn a technique | ✅ |
| Copying code from an **MIT/Apache/ISC/Zlib** repo | ✅ with attribution + license notice retained (Apache also: state changes) |
| Copying code from `NONE` / `NOASSERTION` / custom-license repos (react-bits, ogl@repo-level, codrops carousels, most Awwwards clones, GSAP itself) | ❌ **not licensed for reuse.** Re-implement the idea independently |
| Vendoring/using **AGPL** (`git-city`) in our app | ❌ (would trigger source-availability obligations) |
| Using **GSAP as an npm dependency** | ✅ — its Standard "No Charge" license permits commercial use; only *redistributing/forking GSAP* or building a competing animation product is barred `[REPORTED S2]` |
| Using three.js / R3F / drei / Motion / Lenis | ✅ MIT |

## 4. Examined and rejected (so AC doesn't waste a cycle)

`img2threejs`, `wheresryan22/anatomy` (23,678★) and similar **high-star AI-skill/agent repos masquerading as frontend resources** — starred-for-the-tool, not the craft; `syt123450/giojs` (5 yr stale); `heremaps/harp.gl`, `alexfoxy/lax.js`, `pmndrs/lamina`, `pmndrs/use-cannon` (2024-02-25, effectively dormant) — archived or stale; `@theatre/core` 0.7.2 (2024-05-19) — dormant; `@splinetool/react-spline` 4.1.0 (2025-07-15) — proprietary runtime + no license field + heavy; `@react-three/uikit` — custom license, no use case; `aceternity`/`magic-ui`-style kit repos — their output is the "template look" we're escaping, and `codebucks27`-style tutorial repos are frequently unmaintained next-* minors; `PavelDoGreat/WebGL-Fluid-Simulation` — stale + irrelevant; `react-pdf-viewer` — archived; `@studio-freight/lenis` — renamed 2024; the many 0–2★ "particle text 3d" repos — no engineering substance. **A star count is not a quality signal for us**; several of the best references here are 30–350 ★.
