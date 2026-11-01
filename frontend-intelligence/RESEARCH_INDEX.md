# Research Index — Every Source, What Was Claimed, How It Was Verified

**Compiled by AK · 2026-11-01**

Verification legend: `[VERIFIED-REGISTRY]` npm registry live lookup · `[VERIFIED-API]` GitHub REST API live lookup · `[VERIFIED-DOC]` official doc/README read directly · `[VERIFIED-FILE]` project source read · `[REPORTED]` secondary sources agree · `[UNVERIFIED]` flagged, do not rely on.

---

## 1. Primary sources actually fetched (highest trust)

### Registry lookups — `registry.npmjs.org`, 2026-11-01 `[VERIFIED-REGISTRY]`

| Package | latest | published | license | notable peer / dep |
|---|---|---|---|---|
| `next` | 16.4.3 | 2026-10-23 | MIT | peer `react: ^18.2.0 \|\| ^19.0.0` |
| `react` | 19.3.1 | 2026-10-14 | MIT | `latest` tag; canary 19.3.0-canary…20261031 |
| `tailwindcss` | 4.3.3 | 2026-07-16 | MIT | — |
| `framer-motion` | 14.9.0 | 2026-10-30 | MIT | peer react `^18.0.0 \|\| ^19.0.0`; deps `tslib, motion-dom, motion-utils` |
| `motion` | 14.9.0 | 2026-10-30 | MIT | exports `./react ./three ./vgpu ./mini ./react-client ./react-animate-view ./remix` |
| `three` | 0.187.0 | 2026-10-30 | MIT | exports `./tsl ./webgpu ./addons ./src/*` |
| `@react-three/fiber` | 9.8.2 | 2026-10-14 | MIT | **peer `react: >=19 <19.4`**, `three >=0.156` |
| `@react-three/drei` | 10.7.9 | 2026-09-25 | MIT | peer `react ^19`, `fiber ^9`, `three >=0.159`; deps maath, meshline, stats-gl, hls.js |
| `@react-three/postprocessing` | 3.2.2 | 2026-10-21 | MIT | peer `postprocessing ^6.36.0`, `fiber >=9.7.0`; deps `n8ao, maath` |
| `postprocessing` | 6.39.6 | 2026-11-01 | **Zlib** | — |
| `gsap` | 3.15.0 | **2026-04-13** | **Standard "no charge"** | no peer deps; `exports ./*` → plugins importable as `gsap/SplitText` |
| `@gsap/react` | 2.1.2 | 2025-01-15 | "SEE LICENSE" | peer `gsap ^3.12.5`, `react >=17` — **18 months old, low churn by design** |
| `gsap-trial` | 3.13.0 | 2025-04-30 | gsap trial terms | legacy path; **do not use now that plugins are free** |
| `lenis` | 1.3.27 | 2026-10-15 | MIT | **zero dependencies**; exports `./react ./vue ./nuxt ./snap` |
| `@studio-freight/lenis` | 1.0.42 | 2024-03-17 | MIT | **deprecated old name — do not install** `[VERIFIED-REGISTRY]` |
| `ogl` | 1.0.11 | **2025-01-27** | Unlicense | 21 months since publish |
| `postprocessing`(pmndrs repo) | — | — | — | see `@react-three/postprocessing` |
| `@react-spring/three` | 10.1.2 | 2026-06-24 | MIT | — |
| `animejs` | 4.5.0 | 2026-06-22 | MIT | — |
| `troika-three-text` | 0.52.5 | 2026-07-24 | MIT | 3D SDF text used by drei `<Text>` |
| `lottie-react` | 3.1.2 | 2026-09-07 | MIT | wraps `lottie-web` |
| `@lottiefiles/dotlottie-react` | 0.21.0 | 2026-10-30 | MIT | WASM `.lottie` renderer |
| `@rive-app/react-canvas` | 4.38.0 | 2026-10-27 | MIT | active, monthly cadence |
| `@splinetool/react-spline` | 4.1.0 | **2025-07-15** | *(none declared)* | deps blurhash, thumbhash; proprietary runtime + cloud assets |
| `@react-three/uikit` | 1.0.78 | 2026-10-27 | "SEE LICENSE IN L…" | custom license; dep `@pmndrs/uikit` |
| `@monogrid/gainmap-js` | 3.7.2 | 2026-10-20 | MIT | HDR/EnvMap compression |
| `@theatre/core` | 0.7.2 | **2024-05-19** | Apache-2.0 | **effectively abandoned — avoid** |
| `maath` | 0.10.8 | 2024-07-07 | MIT | stable math util, low churn OK |
| `shiki` | 4.5.0 | 2026-10-01 | MIT | (checked as candidate for code-preview styling; not used) |

### Official docs / READMEs read directly `[VERIFIED-DOC]`

1. **Next.js — "Designing view transitions"** `nextjs.org/docs/app/guides/view-transitions`. Fetched 2026-11-01. Confirms: *"View transitions work in the App Router with no configuration. React 19.3 includes the `<ViewTransition>` component and `addTransitionType` API"*; notes React's integration uses transition types + `view-transition-class`, *"available in Chromium 125+ and recent Safari and Firefox versions. Some animations may behave differently in Safari"*; documents `name=`, `share="morph"`, `default="none"` (and the trap: `default="none"` without `share` silently disables the morph), `::view-transition-group(.morph)`/`::view-transition-image-pair(.morph)`, Suspense-reveal pattern, `::view-transition { pointer-events: none }`; links demo `github.com/nextjs/react-view-transitions-demo` and agent skill `vercel-react-view-transitions` installable via `npx skills add vercel-labs/agent-skills --skill vercel-react-view-transitions`.
2. **MDN — `animation-timeline`** `developer.mozilla.org/.../animation-timeline` (page last modified 2026-09-16). Fetched 2026-11-01. Compatibility table read directly: **Chrome 115 / Edge 115 / Firefox 159 / Opera 101 / Safari 26 / Chrome Android 115 / Safari on iOS 26 / Samsung 23 — full support**, and the page carries the banner **"Limited availability — this feature is not Baseline because it does not work in some of the most widely-used browsers."** This is why the answer to "can we use CSS scroll-driven animations?" is *yes, as progressive enhancement behind `@supports`, not as the sole implementation*.
3. **darkroomengineering/lenis README** (fetched via GitHub contents API). Confirms package split (`lenis`, `lenis/react`, `lenis/vue`, `lenis/framer`, `lenis/snap`), the canonical GSAP sync snippet (`lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker.add(t => lenis.raf(t*1000))` + `gsap.ticker.lagSmoothing(0)`), `autoRaf: true` option, methods (`raf`, `scrollTo` with `offset/lerp/duration/easing/immediate/lock/force/userData`, `start`, `stop`, `resize`, `destroy`), `allowNestedScroll`, unpkg script URL `lenis@1.3.27`.
4. **`lenis/react` package README.** Confirms `<ReactLenis>` provider + `useLenis` hook and the requirement **`import 'lenis/dist/lenis.css'`**.
5. **greensock/gsap-skills README.** Confirms: *"GSAP is 100% free — including every plugin… Install everything from the public `gsap` npm package — no Club membership, no `.npmrc` / auth token, no private registry required."* Lists 8 skills (gsap-core, gsap-timeline, gsap-scrolltrigger, gsap-plugins, gsap-utils, gsap-react, gsap-performance, gsap-frameworks) and `npx skills add https://github.com/greensock/gsap-skills`.
6. **react.dev — React 19.3 (2026-09-09)** `[VERIFIED-DOC via search index of official post]`. Stabilizes `<ViewTransition>` and Fragment refs; adds `addTransitionType`, `use(browser())`, Trusted Types support; changelog explicitly lists *"react-dom: Fix a `<ViewTransition>` crash in Mobile Safari #35337"* and *"…with SuspenseList #35520"*. `<ViewTransition>` is DOM-only today.
7. **motiondivision/motion `CHANGELOG.md`** (fetched raw via API). Confirms `[12.43.0] 2026-07-27` hardware acceleration for `backgroundColor` + SVG; `[13.0.0] 2026-08-05` removed optional `@emotion/is-prop-valid` in favour of `<MotionConfig isValidProp={isPropValid}>`; `[13.2.0] 2026-09-03` added `animate.addEffect()`, **`threeEffect` (`motion/three`)** animating Three.js objects/materials/**shader uniforms/TSL uniform nodes**, and `vgpuEffect`; `[13.4.0] 2026-09-14` `AnimateView`: *"View transitions for React 19.3, built on React's `ViewTransition`"*; `[14.0.0] 2026-10-03` internal-API repinning; `[14.1.x] 2026-10-09/13` spring fixes, `useScroll` elastic-overscroll fix, **hardware-accelerated independent transforms (x, y, scaleX)**; `[14.7.0]` `useScroll` returns `scrollXLength/scrollYLength`; `[14.9.0] 2026-10-30` Reorder keyboard accessibility.
8. **Project files** `[VERIFIED-FILE]` — see `audit/stack-audit.md` for the file-by-file inventory.

### GitHub API metadata lookups `[VERIFIED-API]`

Repository stars / last-push / license / homepage are **not** from memory; they were fetched 2026-11-01 from `api.github.com/repos/{full_name}` and `/search/repositories`. Full table + per-repo analysis lives in `github-repositories/repository-catalog.md`. Repos queried individually (rather than only via search) include: `greensock/GSAP`, `greensock/gsap-skills`, `darkroomengineering/lenis`, `motiondivision/motion`, `framer/motion`, `pmndrs/react-three-fiber`, `pmndrs/drei`, `pmndrs/postprocessing`, `pmndrs/react-postprocessing`, `pmndrs/react-three-next`, `pmndrs/lamina`, `pmndrs/uikit`, `pmndrs/xr`, `pmndrs/use-cannon`, `mrdoob/three.js`, `oframe/ogl`, `martinlaxenaire/curtainsjs`, `shuding/next-view-transitions`, `rudrodip/theme-toggle-effect`, `nextjs/react-view-transitions-demo`, `vercel-labs/agent-skills`, `DavidHDev/react-bits`, `dip/cmdk`, `shadcn-ui/ui`, `lucide-icons/lucide`, `PavelDoGreat/WebGL-Fluid-Simulation`, `FarazzShaikh/THREE-CustomShaderMaterial`, `mkkellogg/GaussianSplats3D`, `pixiv/three-vrm`, `codrops/ScrollBasedLayoutAnimations`, `pascalorg/editor`, `srizzon/git-city`, `21st-dev/magic-mcp`.

## 2. Search-driven sources `[REPORTED]` (used only for direction, never for a dependency decision)

| # | Source | Date | Used for |
|---|---|---|---|
| S1 | Webflow/GSAP "GSAP is 100% free" coverage, via multiple 2026 articles citing the 2025-04-30 announcement | Apr–Oct 2026 | Licensing; cross-checked against `gsap` npm license field `[VERIFIED-REGISTRY]` |
| S2 | Art of Styleframe "GSAP 2026 release notes" | 2026-08-08 | SplitText rewrite (−50% size, no position-absolute hack), 3.13→3.15 line, "not open source" nuance |
| S3 | onlyWebPro "CSS View Transitions tutorial"; utsubo "Frontier Web APIs 2026" | Jun/Apr 2026 | Same-doc vs cross-doc support split; both agree with Next.js doc `[VERIFIED-DOC]` |
| S4 | openreplay "Motion vs GSAP" | 2026-08-15 | Mental-model & sizing comparison; note it reported *Motion "v12 line"* while registry says 14.9.0 → registry wins |
| S5 | utsubo "100 Three.js tips" + "Three.js in 2026 (r186)" + "WebGPU migration checklist" | Sep 2026 | R3F perf rules (delta, no allocation in `useFrame`, `frameloop="demand"` + `invalidate()`, DPR cap, KTX2/Draco, dispose), three.js r182–r186 breaking notes, `renderer.backend.isWebGPUBackend` |
| S6 | webhelpagency / seoscore / clickwebstudio / hustlemarketers Core Web Vitals guides | Apr–Jul 2026 | Thresholds LCP 2.5s / INP 200ms / CLS 0.1 at p75; `scheduler.yield()`, long-task budgeting; all four independent sources agree |
| S7 | tomodahinata / richdynamix / nerdleveltech / opentailwind Tailwind v4 guides | May–Oct 2026 | `@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *))`, `@theme` vs `@theme inline` for runtime theming, `oklch` semantics — **directly relevant to fixing the audit's §5.2 light-mode debt** |
| S8 | Codrops article index (`tympanus.net/codrops/tag/scroll/`, all-articles archive) | Feb–Jul 2026 | Current technique inventory (see website-inspiration/interaction-breakdowns.md) |
| S9 | Awwwards category pages (education, WebGL) pages 1/3/5 | Sep–Nov 2026 | Live site names, studios, award types & months. Titles/awards read; **individual studio URLs not crawlable from sandbox → `[UNVERIFIED-URL]`** |
| S10 | hontran.dev "Best award-winning websites 2026 (judged by a juror)"; psychoactive.co.nz "Best WebGL & 3D agencies 2026"; hireadrian.com 14-winners roundup | Sep–Oct 2026 | Studio-level craft analysis and which SOTDs won Developer Awards |
| S11 | prateeksha SRP UX guide (2026-03-31); "Designing a Search That Works in EdTech" (2025-10-15); Ex Libris Alma repository-search UX notes | Oct 2025–Mar 2026 | Faceted-search, filter placement, pagination-vs-infinite-scroll evidence for `document-discovery-ui.md` |
| S12 | various GSAP/Lenis integration write-ups incl. jiapixel, uxdev.org lesson 17, eliteai lenis skill notes | 2025–2026 | Cross-check of the Lenis↔ScrollTrigger wiring and cleanup pitfalls (ticker callback removal, single instance, no `autoRaf` + ticker both) — consistent with `[VERIFIED-DOC]` README |

## 3. Contradictions found, and how they were resolved

| Topic | Claim A | Claim B | Resolution |
|---|---|---|---|
| GSAP paid plugins | "SplitText/ScrollSmoother require Club membership" (older tutorials, still indexed) | "All plugins free since 2025-04-30" | **B.** Confirmed by the official `gsap-skills` README + `gsap` npm `exports` including plugin paths `[VERIFIED-REGISTRY]`. Also: license is *free*, not *open source*. |
| Motion version line | "Motion is on the v12 line (12.42.2)" | registry `latest = 14.9.0` (2026-10-30) | **Registry wins.** Article was stale. `[VERIFIED-REGISTRY]` |
| CSS scroll-driven animations | "Now fully cross-browser, 90%+ support, Firefox 126+" | MDN: Firefox **159**, banner "**not Baseline**" | **MDN wins.** Ship behind `@supports (animation-timeline: view())`. `[VERIFIED-DOC]` |
| View Transitions in Next.js | "add `experimental.viewTransition: true`" (Next 16.2 demo repo) | Next.js guide: "no configuration", React 19.3+ | **Both, sequenced.** The flag existed for the older path; on React 19.3 + Next 16.x it is configuration-free. Project currently has React **19.2.6** → upgrade first. `[VERIFIED-DOC]` |
| three.js WebGPU | "WebGPU is safe to ship; WebGL is legacy" | three.js manual still calls WebGLRenderer "the recommended choice for pure WebGL 2 apps"; WebGPURenderer described as still evolving; `@react-three/drei`/`postprocessing`/`troika` are WebGL-first | **Stay on WebGLRenderer for this project.** `[REPORTED]` + registry peer facts. See `research/threejs.md` §W. |
| R3F peer ceiling | "just install @react-three/fiber" | peer **`react >=19 <19.4`** | **Real constraint.** React 19.3.1 is inside; a future React 20 / 19.4 breaks it. `[VERIFIED-REGISTRY]` |
| Lenis package | install `@studio-freight/lenis` (old tutorials) | renamed to `lenis` (1.0.42 is the last old-name publish, 2024) | Use **`lenis`** + `lenis/react`. `[VERIFIED-REGISTRY]` |
| Product scope | Brief: subject/course/semester/type facets, Supabase, admin | Code: one record, no course/semester/type, no Supabase | **Code wins for planning.** Brief recorded as contingency. `[VERIFIED-FILE]` |

## 4. Search queries executed (reproducibility)

GitHub repository search, 2026-11-01, sorted by stars (search API, `per_page` 5–12):
`three.js 3d webgl topic:threejs` · `react-three-fiber` · `gsap scrolltrigger` · `lenis smooth scroll` · `webgl shader effects` · `threejs particle system interactive` · `3d landing page portfolio three.js` · `interactive portfolio threejs` · `codrops animation` · `view transitions api` · `bento grid tailwind components` · `command palette react` · `document viewer react` · `library search filter ui` · `curtains.js webgl dom` · `gsap official plugins` · `scroll driven animation css` · `threejs text 3d typography` · `aceternity ui components` · `magic ui react tailwind` · `react bits animations` · `shader gradient background animated` · `fluid simulation webgl` · `magnetic cursor hover interaction` · `scroll based animation library react` · `smooth scroll library` · `webgl image distortion hover` · `3d model viewer react` · `gsap react hook` · `react cursor effect custom` · `animated number counter react` · `text scramble reveal animation` · `three.js book journey tutorial` · `awwwards winner clone website` · `digital library reader next.js react` · `3d card hover tilt react` · `reactbits components` · `view transitions react` · `next.js smooth scroll lenis package` · `react three fiber nextjs starter`.

Web searches: GSAP licensing/plugins · Motion vs GSAP · View Transitions baseline · CSS scroll-driven animations support · Lenis + ScrollTrigger · Next.js 16 view transitions · React 19.3 · Three.js WebGPU production status · three.js r18x changelog · R3F performance best practices · Tailwind v4 theming · Core Web Vitals 2026 · award-winning sites 2026 · library/education search UX · Codrops recent tutorials.

## 5. Limitations of this research (honest)

1. **The sandbox cannot crawl arbitrary websites** (network allow-list: github.com, api.github.com, codeload, registry.npmjs.org, pypi). Site *inspection* of Awwwards/Godly entries therefore relies on (a) what the category pages returned, (b) multiple secondary write-ups. Studio URLs named in `website-inspiration/` are **not all individually re-verified** → marked `[UNVERIFIED-URL]`. AC must click-verify before quoting one to the Product Owner.
2. No browser-automation tooling in this sandbox → **no Lighthouse runs, no FPS traces, no device-lab data.** Every performance budget in the playbook is a *target derived from published thresholds + documented technique costs*, not a measurement of this app. First AC action is to baseline (playbook §Phase 0).
3. Awwwards pagination returned promotional/nominated items rather than a clean "SOTD list"; where an award+month is stated here it came from the category page text or S10's roundup `[REPORTED]`.
4. Star counts are a popularity proxy, not a quality measure. Two 20k+-star results encountered (`img2threejs/img2threejs`, `wheresryan22/anatomy`) are AI-agent-skill/tool repos, not frontend technique sources; they were examined and deliberately excluded. Don't let AC rank by stars.
5. npm `license` fields are what packages *declare*; several relevant repos report `NOASSERTION`/`NONE` at the repository level while the npm package says MIT (e.g. `ogl`, `framer-motion`, GSAP). **Where they conflict, the npm field governs the installed artifact and the repo field governs copied source.** Both are recorded in the catalog.
6. Research is a snapshot. Re-run `RESEARCH_INDEX` §1 registry lookups (`npm view <pkg> version license peerDependencies`) before any install if more than ~8 weeks have passed.
