# 35 deep technical evaluations

These are the 35 repositories AK judged most relevant to this product **out of 72 that were actually inspected** (README + `package.json` fetched per repo on 2026-11-02). Selection is by relevance to a document-discovery product, not by raw score — see `REPOSITORY_QUALITY_RANKING.md` for why that distinction matters.

**Evidence levels used below**

- `[VERIFIED-FILE]` — read from AC's branch or a fetched `package.json`/README (file content, not a claim about behaviour)
- `[VERIFIED-API]` — GitHub REST metadata (stars, `pushed_at`, `license.spdx_id`, `archived`) at fetch time
- `[VERIFIED-LICENSE]` — npm registry `license` field for the published version
- `[MEASURED]` — produced by this lab's esbuild/zlib run (`prototype-lab/measurements.json`)
- `[REPORTED]` — the README/doc says it, AK did not execute it
- `[UNVERIFIED]` — inference; needs AC or a browser

### 1. `motiondivision/motion`  · **AC reference**

[https://github.com/motiondivision/motion](https://github.com/motiondivision/motion) · Motion / UI animation · ★34,777 · forks 1,492 · open issues 14 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | TypeScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2018-11-16 | | Last push | 2026-11-01 (1 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://motion.dev | | Found via | org:motiondivision, search:motion react animation stars:>500, search:react spring stars:>1000 |
| Score | 84 | | Inspected | yes — README 7,409 B |
| **Libraries in use** | `gsap`, `motion`, `react` [VERIFIED-FILE] | | | |
| Live demos found in README | 6 (https://motion.dev/docs/react, https://motion.dev/llms.txt?utm_source=github-readme…) | | README headings | React / JavaScript / Vue / Table of Contents / Why Motion? |

- **What it demonstrates:** Vanilla + React animation, spring physics, `MotionConfig reducedMotion="user"`, layout/FLIP animation, `animate`/`scroll`/`inView`.
- **Use in our product:** Already installed as framer-motion 12.43.0 — this is the micro-interaction engine of the product.
- **Compatibility / risk:** Renamed package: `motion` (14.x) vs `framer-motion` (12.x). Measured: motion/react costs 49.5 KB gz vs 44.9 KB for what AC has — switching buys nothing.
- **What AC should take from it:** Nothing new. Keep framer-motion; import from `framer-motion/mini` + `LazyMotion(domAnimation)` → measured 29.7 KB gz (−15.2 KB).
- **Evidence source:** README `7,409 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 2. `greensock/GSAP`  · **AC reference**

[https://github.com/greensock/GSAP](https://github.com/greensock/GSAP) · GSAP / scroll · ★30,029 · forks 2,322 · open issues 8 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | JavaScript | | Licence (repo) | NONE — check [VERIFIED-API] |
| Created | 2012-09-21 | | Last push | 2026-04-13 (203 d) [VERIFIED-API] |
| Maintenance | maturing | | Archived | False [VERIFIED-API] |
| Homepage | https://gsap.com | | Found via | org:greensock, search:topic:gsap stars:>20 |
| Score | 65.6 | | Inspected | yes — README 6,196 B |
| **Libraries in use** | `gsap`, `motion`, `splittype` [VERIFIED-FILE] | | | |
| Live demos found in README | 6 (https://gsap.com, https://gsap.com/docs/v3/Plugins/MorphSVGPlugin…) | | README headings | GSAP (GreenSock Animation Platform) / Get Started / Docs &amp; Installation / CDN |

- **What it demonstrates:** ScrollTrigger pin/scrub, batch, matchMedia for media-scoped setups, context cleanup (gsap.context().revert()).
- **Use in our product:** Only if we ship the pinned cinematic landing chapter; one library, one timeline, scrub + pin.
- **Compatibility / risk:** [VERIFIED-LICENSE] npm metadata says `Standard 'no charge' license` (gsap.com/standard-license) — NOT MIT. PO/legal must read it. Repo push 2026-04-13; plugin work happens in the private/no-charge repo.
- **What AC should take from it:** The `matchMedia` + `gsap.context()` teardown shape from EX04, so a pin can be switched off and destroyed.
- **Evidence source:** README `6,196 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 3. `darkroomengineering/lenis`  · **AC reference**

[https://github.com/darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) · GSAP / scroll · ★17,028 · forks 768 · open issues 38 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | TypeScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2022-02-21 | | Last push | 2026-10-29 (4 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://lenis.dev | | Found via | org:darkroomengineering, search:smooth scroll lenis stars:>10, search:topic:smooth-scroll stars:>50 |
| Score | 69.7 | | Inspected | yes — README 34,556 B |
| **Libraries in use** | `lenis`, `lenis_react`, `react`, `vue` [VERIFIED-FILE] | | | |
| Live demos found in README | 6 (https://unpkg.com/lenis@1.3.27/dist/lenis.min.js, https://easings.net/en…) | | README headings | Introduction / Features / Sponsors / Packages |

- **What it demonstrates:** Momentum scroll with `autoRaf`, `scrollTo`, anchors, programmatic stop, and the documented ScrollTrigger bridge.
- **Use in our product:** Optional desktop-only smooth scroll for the storytelling section; must stay a user-visible toggle.
- **Compatibility / risk:** MIT but it hijacks wheel/keyboard scroll: breaks find-in-page, pull-to-refresh, and any `scroll-behavior:smooth` CSS (AC's c9d0d599 has it). Measured floor 5.3 KB gz — cheap; the risk is behaviour, not bytes.
- **What AC should take from it:** The destroy path: `lenis.destroy()` + `gsap.ticker.remove` and never `autoRaf` together with a ticker.
- **Evidence source:** README `34,556 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 4. `pmndrs/react-three-fiber`  · **AC reference**

[https://github.com/pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) · 3D (three/R3F/Drei) · ★33,418 · forks 2,060 · open issues 28 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | TypeScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2019-02-25 | | Last push | 2026-10-21 (12 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://docs.pmnd.rs/react-three-fiber | | Found via | org:pmndrs, search:topic:threejs stars:>200 |
| Score | 83.9 | | Inspected | yes — README 14,290 B |
| **Libraries in use** | `cannon`, `rapier`, `react`, `three`, `vite`, `xr`, `zustand` [VERIFIED-FILE] | | | |
| Live demos found in README | 6 (https://www.flux.ai, https://npm-compare.com/@react-three/a11y,@react-three/cannon,@react-three/csg,@react-three/drei,@…) | | README headings | What does it look like? / Install expo-cli, this will create our app / Create app and cd into it / Install dependencies |

- **What it demonstrates:** Declarative three.js, `useFrame` opt-out for demand rendering, `<Canvas frameloop="demand">`, events, Suspense-based loading.
- **Use in our product:** The only sane way to put 3D inside AC's React 19 tree if we do 3D at all.
- **Compatibility / risk:** Adds react-three-fiber + its reconciler to an app that today ships zero 3D. Requires three (measured 130–188 KB gz). R3F v9 targets React 19 → compatible with AC's react 19.2.6.
- **What AC should take from it:** `frameloop="demand"` + `invalidate()` on input — the single most important WebGL cost control.
- **Evidence source:** README `14,290 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 5. `mrdoob/three.js`  · **AC reference**

[https://github.com/mrdoob/three.js](https://github.com/mrdoob/three.js) · 3D (three/R3F/Drei) · ★117,375 · forks 36,879 · open issues 392 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | JavaScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2010-03-23 | | Last push | 2026-11-01 (1 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://threejs.org/ | | Found via | org:mrdoob, search:topic:webgl stars:>300, search:webgpu three stars:>50 |
| Score | 81 | | Inspected | yes — README 2,969 B |
| Live demos found in README | 6 (https://threejs.org/examples/, https://threejs.org/docs/…) | | README headings | three.js / Usage / Cloning this repository / Change log |

- **What it demonstrates:** Renderer, materials, loaders, postprocessing; the WebGPU family (`webgpu_*`) as the forward path.
- **Use in our product:** Not a dependency in this ranking: it is the reference corpus (300 live `webgl_*` examples) and the renderer underneath everything else.
- **Compatibility / risk:** MIT, extremely active (pushed 2026-11-01). Importing `three` wholesale is the #1 size risk — measured 187.5 KB gz for a namespace import vs 130.4 KB for a named subset.
- **What AC should take from it:** Never `import * as THREE` in app code; import the named classes you use so bundlers can shake the rest.
- **Evidence source:** README `2,969 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 6. `pmndrs/drei`  · **AC reference**

[https://github.com/pmndrs/drei](https://github.com/pmndrs/drei) · 3D (three/R3F/Drei) · ★10,101 · forks 867 · open issues 151 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | JavaScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2020-04-26 | | Last push | 2026-10-21 (12 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://docs.pmnd.rs/drei | | Found via | org:pmndrs, search:topic:react-three-fiber stars:>20, search:topic:threejs stars:>200 |
| Score | 67.9 | | Inspected | yes — README 27,833 B |
| **Libraries in use** | `drei`, `glsl-loader`, `r3f`, `react`, `three`, `troika`, `vite`, `zustand` [VERIFIED-FILE] | | | |
| runtime deps | `@babel/runtime`, `@mediapipe/tasks-vision`, `@monogrid/gainmap-js`, `@use-gesture/react`, `camera-controls`, `cross-env`, `detect-gpu`, `glsl-noise`, `hls.js`, `maath` | | dev deps | 40 listed |
| Live demos found in README | 6 (https://pmndrs.github.io/drei/abstractions/gradient-texture, https://pmndrs.github.io/drei/staging/contact-shadows…) | | README headings | Basic usage / React-native / Documentation / Cameras |

- **What it demonstrates:** Helper catalogue with a live demo page per helper (pmndrs.github.io/drei/<group>/<name>) — that is the fastest way to see behaviour without installing anything.
- **Use in our product:** If R3F is approved, drei supplies ScrollControls, Float, Text (troika SDF), Environment, PerformanceMonitor.
- **Compatibility / risk:** Helpers are individually tree-shakeable but several pull heavy deps (troika-three-text for Text, @mediapipe/... no). MIT, active (2026-10-21).
- **What AC should take from it:** `PerformanceMonitor` to downgrade DPR/count on slow devices; the demo-per-helper pattern for our own docs.
- **Evidence source:** README `27,833 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 7. `shadcn-ui/ui`  · **AC reference**

[https://github.com/shadcn-ui/ui](https://github.com/shadcn-ui/ui) · Creative components · ★127,118 · forks 11,989 · open issues 1774 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | TypeScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2023-01-04 | | Last push | 2026-10-31 (2 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://ui.shadcn.com | | Found via | search:shadcn stars:>1000 |
| Score | 80 | | Inspected | yes — README 467 B |
| **Libraries in use** | `motion`, `tailwind`, `vite` [VERIFIED-FILE] | | | |
| runtime deps | `@babel/core`, `@changesets/changelog-github`, `@changesets/cli`, `@commitlint/cli`, `@commitlint/config-conventional`, `@ianvs/prettier-plugin-sort-imports`, `@manypkg/cli`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `autoprefixer` | | dev deps | 7 listed |
| Live demos found in README | 1 (https://ui.shadcn.com/docs…) | | README headings | shadcn/ui / Documentation / Contributing / License |

- **What it demonstrates:** Registry JSON, copy-in components, tailwind-4 tokens, Radix-based behaviour underneath.
- **Use in our product:** The distribution model for our own card/facet/nav primitives — copy in, own the code, no runtime dep.
- **Compatibility / risk:** MIT. Not a package to install for styling; treat as a source of implementations to read.
- **What AC should take from it:** The `registry/<name>/index.tsx + hooks + lib` layout if we ever publish our own component set.
- **Evidence source:** README `467 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 8. `radix-ui/primitives`  · **AC reference**

[https://github.com/radix-ui/primitives](https://github.com/radix-ui/primitives) · Document discovery / search · ★19,462 · forks 1,296 · open issues 263 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | TypeScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2020-06-19 | | Last push | 2026-10-14 (19 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://radix-ui.com/primitives | | Found via | gap:radix ui stars:>1000, search:radix primitives stars:>1000 |
| Score | 71.3 | | Inspected | yes — README 1,703 B |
| **Libraries in use** | `react`, `vite` [VERIFIED-FILE] | | | |
| Live demos found in README | 6 (https://discord.com/invite/7Xb99uG, https://www.radix-ui.com/primitives/docs…) | | README headings | Radix Primitives / Installation / Documentation / Releases |

- **What it demonstrates:** WAI-ARIA-compliant behaviour, focus trapping, typeahead, collision-aware positioning.
- **Use in our product:** Reference for the hard interaction-state problems: combobox (facet picker), dialog (mobile filter sheet), popover (preview).
- **Compatibility / risk:** MIT, active. React-only. Using Radix adds ~1-4 KB/prime* (unmeasured here) — note as unverified.
- **What AC should take from it:** The `asChild` composition + controlled/uncontrolled pattern for our filters.
- **Evidence source:** README `1,703 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 9. `tailwindlabs/headlessui`  · **AC reference**

[https://github.com/tailwindlabs/headlessui](https://github.com/tailwindlabs/headlessui) · Perf / a11y · ★28,805 · forks 1,213 · open issues 120 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | TypeScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2020-09-16 | | Last push | 2026-04-13 (203 d) [VERIFIED-API] |
| Maintenance | maturing | | Archived | False [VERIFIED-API] |
| Homepage | https://headlessui.com | | Found via | search:react a11y stars:>1000 |
| Score | 68.8 | | Inspected | yes — README 3,162 B |
| **Libraries in use** | `react`, `vue` [VERIFIED-FILE] | | | |
| Live demos found in README | 1 (https://headlessui.com…) | | README headings | Documentation / Installing the latest version / Installing the insiders version / Packages |

- **What it demonstrates:** Listbox/Combobox keyboard model, `Transition` render-prop, virtual-combobox example.
- **Use in our product:** Alternative to Radix for Listbox/Combobox/Dialog if we want fewer transitive deps.
- **Compatibility / risk:** MIT, last push 2026-04-13 → slower cadence than Radix. Vue+React.
- **What AC should take from it:** The virtual-combobox recipe (list × keyboard) for a 500-subject facet list.
- **Evidence source:** README `3,162 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 10. `bvaughn/react-virtualized`  · **AC reference**

[https://github.com/bvaughn/react-virtualized](https://github.com/bvaughn/react-virtualized) · Perf / a11y · ★27,066 · forks 3,015 · open issues 1 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | TypeScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2015-11-03 | | Last push | 2026-10-31 (2 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://react-virtualized-docs.vercel.app | | Found via | gap:react virtualization stars:>1000, search:react virtualized list stars:>2000 |
| Score | 79.2 | | Inspected | yes — README 19,453 B |
| **Libraries in use** | `react`, `tailwind`, `virtual`, `vite` [VERIFIED-FILE] | | | |
| runtime deps | `clsx`, `dom-helpers` | | dev deps | 40 listed |
| Live demos found in README | 6 (https://opencollective.com/react-virtualized/sponsor/4/avatar.svg, https://opencollective.com/react-virtualized/sponsor/10/website…) | | README headings | Sponsors / A word about `react-window` / Getting started / Dependencies |

- **What it demonstrates:** Windowing, dynamic heights, overscan, cell measurement caching.
- **Use in our product:** Only if a result list grows past ~200 rows per page; our pages are small so this may be unnecessary.
- **Compatibility / risk:** MIT but the author keeps it in maintenance mode; `react-window`/`@tanstack/virtual` are the actively developed siblings (not in my inspected set — flagged as a gap, not a recommendation).
- **What AC should take from it:** Nothing yet: prefer CSS content-visibility before adding a virtualiser.
- **Evidence source:** README `19,453 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 11. `DavidHDev/react-bits`  · **AC reference**

[https://github.com/DavidHDev/react-bits](https://github.com/DavidHDev/react-bits) · Creative components · ★50,983 · forks 2,538 · open issues 7 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | JavaScript | | Licence (repo) | NOASSERTION — custom/unspecified — legal review before vendoring [VERIFIED-API] |
| Created | 2024-08-06 | | Last push | 2026-10-31 (2 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://reactbits.dev | | Found via | search:interactive experience react stars:>30, search:react bits stars:>100 |
| Score | 74 | | Inspected | yes — README 12,112 B |
| **Libraries in use** | `drei`, `gsap`, `lenis`, `lenis_react`, `motion`, `ogl`, `postproc`, `r3f`, `rapier`, `react`, `splittype`, `tailwind`, `three`, `virtual`, `vite` [VERIFIED-FILE] | | | |
| runtime deps | `@chakra-ui/react`, `@emotion/react`, `@gsap/react`, `@hugeicons/core-free-icons`, `@hugeicons/react`, `@mediabunny/mp3-encoder`, `@react-three/drei`, `@react-three/fiber`, `@react-three/postprocessing`, `@react-three/rapier` | | dev deps | 17 listed |
| Live demos found in README | 6 (https://reactbits.dev/get-started/installation, https://shadcnstudio.com/?utm_source=reactbits&utm_medium=sponsor&utm_campaign=silver&ref=reactbit…) | | README headings | What's inside / React Bits Pro / Installation / Use it with your agent |

- **What it demonstrates:** Animated cards, spotlight, glare, count-up, blur text — with three/ogl/gsap/lenis/postprocessing in the dep tree.
- **Use in our product:** The densest single gallery of 'premium component with scroll/hover motion' in the ecosystem.
- **Compatibility / risk:** [VERIFIED-LICENSE] GitHub reports `NOASSERTION` (custom/unclear) → read patterns, do NOT copy source into the app.
- **What AC should take from it:** The interaction *idea list*, filtered to what survives reduced-motion.
- **Evidence source:** README `12,112 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 12. `magicuidesign/magicui`  · **AC reference**

[https://github.com/magicuidesign/magicui](https://github.com/magicuidesign/magicui) · Motion / UI animation · ★23,026 · forks 1,224 · open issues 1 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | MDX | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2023-06-26 | | Last push | 2026-10-31 (2 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://magicui.design | | Found via | gap:magic ui stars:>1000, search:magic ui components stars:>100, search:topic:framer-motion stars:>50 |
| Score | 76.1 | | Inspected | yes — README 1,767 B |
| Live demos found in README | 6 (https://discord.com/invite/87p2vpsat5, https://twitter.com/magicuidesign…) | | README headings | Documentation / Contributing / Community / Authors |

- **What it demonstrates:** Marquee, shimmering button, border animation, animated beam, shiny button, number ticker — all CSS+FM.
- **Use in our product:** Copy-in motion components that already assume tailwind + framer-motion, i.e. exactly AC's stack.
- **Compatibility / risk:** MIT. Some effects are pure decoration and would violate our 'must earn its place' rule.
- **What AC should take from it:** Border/gradient animation done with `@property` + pseudo-element instead of a JS loop.
- **Evidence source:** README `1,767 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 13. `chakra-ui/zag`  · **AC reference**

[https://github.com/chakra-ui/zag](https://github.com/chakra-ui/zag) · Perf / a11y · ★5,247 · forks 306 · open issues 8 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | TypeScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2021-07-07 | | Last push | 2026-11-01 (1 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | http://zagjs.com | | Found via | search:react a11y stars:>1000 |
| Score | 57.2 | | Inspected | yes — README 3,958 B |
| **Libraries in use** | `react`, `svelte`, `vite`, `vue` [VERIFIED-FILE] | | | |
| runtime deps | `@axe-core/playwright`, `@changesets/changelog-github`, `@changesets/cli`, `@commitlint/cli`, `@commitlint/config-conventional`, `@eslint/js`, `@internationalized/date`, `@playwright/test`, `@swc/core`, `@types/jsdom` | | dev deps | 0 listed |
| Live demos found in README | 6 (https://lit.dev/, https://www.w3.org/WAI/ARIA/apg/…) | | README headings | Zag / Why Zag? / Quick start / Contributing |

- **What it demonstrates:** Store actor model, per-framework actors (react/vue/solid), a11y behaviour baked in, headless.
- **Use in our product:** State machines for the interaction logic that keeps breaking: filter sheet, combobox, roving tabindex, tour.
- **Compatibility / risk:** MIT, active. Adds conceptual weight; only worth it if our filter logic keeps growing.
- **What AC should take from it:** The `connect`/prop-getter split — behaviour in a machine, rendering in our own components.
- **Evidence source:** README `3,958 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 14. `mui/base-ui`  · **AC reference**

[https://github.com/mui/base-ui](https://github.com/mui/base-ui) · Perf / a11y · ★11,272 · forks 593 · open issues 453 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | TypeScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2024-02-23 | | Last push | 2026-11-01 (1 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://base-ui.com | | Found via | gap:radix ui stars:>1000 |
| Score | 65.3 | | Inspected | yes — README 1,424 B |
| **Libraries in use** | `react`, `tailwind`, `vite` [VERIFIED-FILE] | | | |
| Live demos found in README | 6 (https://bsky.app/profile/base-ui.com, https://x.com/base_ui…) | | README headings | Base UI / Documentation / Contributing / Releases |

- **What it demonstrates:** Combobox, Menu, Tooltip, Toolbar with WAI alignment; CSS-first styling (no tailwind lock-in).
- **Use in our product:** Newer unstyled-primitive option with preview/focus-trap utilities; alternative to Radix.
- **Compatibility / risk:** MIT, active (2026-11-01) but young → API churn risk while our app is pre-launch.
- **What AC should take from it:** Their focus-management utilities if we hand-roll the sheet.
- **Evidence source:** README `1,424 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 15. `ariakit/ariakit`  · **AC reference**

[https://github.com/ariakit/ariakit](https://github.com/ariakit/ariakit) · Perf / a11y · ★8,630 · forks 424 · open issues 49 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | TypeScript | | Licence (repo) | NONE — check [VERIFIED-API] |
| Created | 2017-09-19 | | Last push | 2026-11-01 (1 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://ariakit.com | | Found via | search:aria react components stars:>200, search:react a11y stars:>1000 |
| Score | 56.1 | | Inspected | yes — README 4,249 B |
| **Libraries in use** | `react`, `vite` [VERIFIED-FILE] | | | |
| Live demos found in README | 6 (https://ariakit.com/examples, https://discord.gg/WyHvnXsvMs…) | | README headings | Docs / Packages / Core Team / Licensing |

- **What it demonstrates:** Collection, form, dialog with `portal`, command hover/active state machine, `fadeTimeout` handling.
- **Use in our product:** The most rigorous keyboard/ARIA implementation of dialog/menu/combobox if we hand-roll.
- **Compatibility / risk:** [VERIFIED-LICENSE] GitHub API returned license=None → must read LICENSE file before use. Active (2026-11-01).
- **What AC should take from it:** `hoverType: 'focus' | 'mouse'` timeout model — the correct way to delay a preview popover.
- **Evidence source:** README `4,249 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 16. `krisk/Fuse`

[https://github.com/krisk/Fuse](https://github.com/krisk/Fuse) · Document discovery / search · ★20,520 · forks 824 · open issues 21 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | JavaScript | | Licence (repo) | Apache-2.0 — permissive (patent grant) [VERIFIED-API] |
| Created | 2012-05-28 | | Last push | 2026-08-09 (85 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://fusejs.io/ | | Found via | search:fuse fuzzy stars:>1000 |
| Score | 65.9 | | Inspected | yes — README 9,427 B |
| **Libraries in use** | `search`, `vite`, `vue` [VERIFIED-FILE] | | | |
| Live demos found in README | 6 (https://fusejs.io, https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.min.mjs…) | | README headings | Fuse.js / ✨ What's New: Token Search / Web Workers / Installation |

- **What it demonstrates:** Bitap-style fuzzy matching, weighted keys, tokenizer, no backend.
- **Use in our product:** The compatibility-mode search: AC's `getCatalogMode()==="compatibility"` path has no Postgres tsvector, so a tiny client ranker beats substring filtering.
- **Compatibility / risk:** Apache-2.0, last push 2026-08-09 (slowing). Adds ~6-11 KB (unmeasured here).
- **What AC should take from it:** Weighted keys {title:3, tags:2, description:1} — mirrors what `setweight()` should do in SQL.
- **Evidence source:** README `9,427 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 17. `dimsemenov/PhotoSwipe`

[https://github.com/dimsemenov/PhotoSwipe](https://github.com/dimsemenov/PhotoSwipe) · Document discovery / search · ★25,295 · forks 3,271 · open issues 172 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | JavaScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2011-04-07 | | Last push | 2025-12-04 (333 d) [VERIFIED-API] |
| Maintenance | maturing | | Archived | False [VERIFIED-API] |
| Homepage | http://photoswipe.com | | Found via | search:image gallery lightbox stars:>500 |
| Score | 69.5 | | Inspected | yes — README 1,670 B |
| Live demos found in README | 6 (https://raw.githubusercontent.com/vshymanskyy/StandWithUkraine/main/banner-direct.svg, https://opencollective.com/photoswipe…) | | README headings | Repo structure / Older versions |

- **What it demonstrates:** v5 rewrite in TS with a DOM-based renderer and a plugin API.
- **Use in our product:** Document preview lightbox: pinch-zoom, swipe, keyboard, focus restoration.
- **Compatibility / risk:** MIT. Last push 2025-12-04 → 11 months; evaluate before depending on it.
- **What AC should take from it:** `errorMsg` degradation for broken images + the `close` focus-return contract.
- **Evidence source:** README `1,670 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 18. `danilowoz/react-content-loader`

[https://github.com/danilowoz/react-content-loader](https://github.com/danilowoz/react-content-loader) · Creative components · ★13,997 · forks 422 · open issues 23 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | TypeScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2017-01-20 | | Last push | 2026-01-22 (284 d) [VERIFIED-API] |
| Maintenance | maturing | | Archived | False [VERIFIED-API] |
| Homepage | https://skeletonreact.com | | Found via | search:skeleton loading react stars:>100 |
| Score | 56.8 | | Inspected | yes — README 17,008 B |
| **Libraries in use** | `react` [VERIFIED-FILE] | | | |
| Live demos found in README | 6 (http://danilowoz.com/create-content-loader/#gallery, https://user-images.githubusercontent.com/4838076/73212462-328f7500-4146-11ea-98dc-3a6aeafd4a26.pn…) | | README headings | Features / Index / Getting Started / For React Native |

- **What it demonstrates:** SVG-based skeleton with preserveAspectRatio so it doesn't reflow at any width.
- **Use in our product:** Skeletons for the doc grid so LCP isn't a spinner.
- **Compatibility / risk:** MIT, last push 2026-01-22 (slow). Trivial enough to reimplement in 30 lines.
- **What AC should take from it:** Skeleton shape = final shape (same padding/radius) → CLS 0.
- **Evidence source:** README `17,008 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 19. `code-hike/codehike`

[https://github.com/code-hike/codehike](https://github.com/code-hike/codehike) · GSAP / scroll · ★5,397 · forks 169 · open issues 20 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | TypeScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2020-04-23 | | Last push | 2026-03-17 (230 d) [VERIFIED-API] |
| Maintenance | maturing | | Archived | False [VERIFIED-API] |
| Homepage | https://codehike.org | | Found via | search:scrollytelling stars:>50 |
| Score | 51.6 | | Inspected | yes — README 3,904 B |
| Live demos found in README | 6 (https://stackblitz.com/github/code-hike/v1-starter?file=app%2Fpage.mdx, https://www.gitpod.io//#gh-light-mode-only…) | | README headings | Code Hike / Build rich content websites with Markdown and React / Top Sponsors |

- **What it demonstrates:** `useScrollMotion` over View Transitions + Motion; streaming; server/client split.
- **Use in our product:** The best public example of scroll-linked animation inside Next.js App Router with RSC.
- **Compatibility / risk:** MIT. It's a docs product, not a library — use as a pattern source.
- **What AC should take from it:** How they keep animated content server-renderable (progress written as CSS vars).
- **Evidence source:** README `3,904 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 20. `jscottsmith/react-scroll-parallax`

[https://github.com/jscottsmith/react-scroll-parallax](https://github.com/jscottsmith/react-scroll-parallax) · GSAP / scroll · ★2,988 · forks 152 · open issues 8 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | TypeScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2017-03-14 | | Last push | 2026-10-28 (5 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://react-scroll-parallax.damnthat.tv/ | | Found via | search:react parallax component stars:>50 |
| Score | 47.7 | | Inspected | yes — README 4,104 B |
| **Libraries in use** | `react`, `tailwind` [VERIFIED-FILE] | | | |
| runtime deps | `parallax-controller` | | dev deps | 37 listed |
| Live demos found in README | 6 (https://react-scroll-parallax.damnthat.tv/img/logo.png, https://react-scroll-parallax.damnthat.tv/docs/migration-guides/upgrade-to-v4…) | | README headings | React Scroll Parallax / Install / Try 4.0 Beta / Example |

- **What it demonstrates:** Native scroll listener + rAF, `useParallax`, `scaleSpeed`, SSR-safe.
- **Use in our product:** Cheap parallax for the landing hero without a pin — closer to what AC's HeroVisual already does.
- **Compatibility / risk:** MIT, active-ish (2026-10-28). Parallax on a hero competes with AC's existing `useScroll` transform.
- **What AC should take from it:** The `disabled` + `shouldAlwaysReset` escape hatches for reduced motion.
- **Evidence source:** README `4,104 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 21. `locomotivemtl/locomotive-scroll`

[https://github.com/locomotivemtl/locomotive-scroll](https://github.com/locomotivemtl/locomotive-scroll) · GSAP / scroll · ★8,894 · forks 1,114 · open issues 27 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | JavaScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2016-10-12 | | Last push | 2026-06-30 (125 d) [VERIFIED-API] |
| Maintenance | maturing | | Archived | False [VERIFIED-API] |
| Homepage | https://scroll.locomotive.ca | | Found via | search:locomotive scroll stars:>1000 |
| Score | 49.8 | | Inspected | yes — README 1,561 B |
| Live demos found in README | 3 (https://scroll.locomotive.ca/docs, https://bundlephobia.com/package/locomotive-scroll…) | | README headings | Locomotive Scroll / Documentation / Quick Start / Features |

- **What it demonstrates:** Virtual scroll, `data-scroll-speed`, anchors, lerp loop.
- **Use in our product:** Historical reference for smooth-scroll + `data-scroll` API design; superseded by Lenis.
- **Compatibility / risk:** MIT; v5 long-stalled → do not adopt new.
- **What AC should take from it:** The `data-scroll-*` attribute API as a mental model for author-driven motion.
- **Evidence source:** README `1,561 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 22. `greensock/gsap-skills`

[https://github.com/greensock/gsap-skills](https://github.com/greensock/gsap-skills) · GSAP / scroll · ★17,692 · forks 1,093 · open issues 14 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | None | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2026-03-04 | | Last push | 2026-07-29 (96 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | — | | Found via | org:greensock |
| Score | 55.7 | | Inspected | yes — README 7,654 B |
| **Libraries in use** | `gsap`, `splittype` [VERIFIED-FILE] | | | |
| Live demos found in README | 6 (https://agentskills.io, https://docs.cursor.com/context/rules…) | | README headings | GSAP AI Skills / Installing / npx skills (recommended) / Claude Code |

- **What it demonstrates:** Skill files for ScrollTrigger, matchMedia, context, eases.
- **Use in our product:** Official GSAP guidance package for agents/IDEs; encodes the idioms that avoid jank.
- **Compatibility / risk:** MIT, pushed 2026-07-29. Docs only — zero runtime cost.
- **What AC should take from it:** Their `gsap.context()` cleanup checklist for React StrictMode.
- **Evidence source:** README `7,654 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 23. `Naresh-Khatri/3d-portfolio`

[https://github.com/Naresh-Khatri/3d-portfolio](https://github.com/Naresh-Khatri/3d-portfolio) · premium-sites · ★1,338 · forks 262 · open issues 0 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | TypeScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2024-05-07 | | Last push | 2026-10-28 (5 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://nareshkhatri.dev | | Found via | search:motion react animation stars:>500, search:portfolio gsap stars:>50, search:topic:framer-motion stars:>50 |
| Score | 47.8 | | Inspected | yes — README 8,355 B |
| **Libraries in use** | `gsap`, `lenis`, `lenis_react`, `motion`, `next`, `r3f`, `react`, `tailwind`, `three` [VERIFIED-FILE] | | | |
| runtime deps | `@chibi3d/runtime`, `@gsap/react`, `@next/third-parties`, `@radix-ui/react-dialog`, `@radix-ui/react-label`, `@radix-ui/react-popover`, `@radix-ui/react-scroll-area`, `@radix-ui/react-slot`, `@radix-ui/react-toast`, `@radix-ui/react-tooltip` | | dev deps | 9 listed |
| Live demos found in README | 6 (https://chibi.nareshkhatri.dev/demo/keycaps, https://yoursite.com…) | | README headings | 🚀 3D Portfolio / [✨ Live Demo → nareshkhatri.dev](https://nareshkhatri.dev) / ✨ Features / 🛠️ Tech Stack |

- **What it demonstrates:** Section-by-section scroll with a shared canvas, pinned copy, lenis wiring.
- **Use in our product:** Small MIT codebase that puts next + r3f + drei + gsap + lenis together in one app — closest public shape to 'our landing page if we go 3D'.
- **Compatibility / risk:** 1.3k stars, single author, portfolio quality — reference, never a base.
- **What AC should take from it:** The shared-canvas-over-scrolling-DOM layout (and its z-index/focus pitfalls).
- **Evidence source:** README `8,355 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 24. `ITomPoland/portfolio-itom`

[https://github.com/ITomPoland/portfolio-itom](https://github.com/ITomPoland/portfolio-itom) · premium-sites · ★464 · forks 89 · open issues 7 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | HTML | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2025-12-27 | | Last push | 2026-09-08 (55 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://itomdev.com | | Found via | search:3d portfolio react three fiber stars:>50, search:portfolio gsap stars:>50, search:topic:gsap stars:>20 |
| Score | 45.1 | | Inspected | yes — README 4,434 B |
| **Libraries in use** | `drei`, `gsap`, `postproc`, `r3f`, `react`, `three`, `vite` [VERIFIED-FILE] | | | |
| runtime deps | `@gsap/react`, `@react-three/drei`, `@react-three/fiber`, `@react-three/postprocessing`, `@sanity/client`, `@sanity/image-url`, `@types/three`, `gsap`, `jimp`, `posthog-js` | | dev deps | 12 listed |
| Live demos found in README | 1 (https://itomdev.com…) | | README headings | 🎨 ITom Dev | Interactive 3D WebGL Portfolio / 🚀 Key Performance Architectures (2026 Standards) / 🏗️ 3D Scene Architecture / 🛠️ Local Development Setup |

- **What it demonstrates:** R3F scene with postprocessing composer, gsap transitions, react Lenis.
- **Use in our product:** Small MIT repo using drei + postprocessing — the cheapest way to see what a bloom/grain pass actually costs.
- **Compatibility / risk:** 464 stars, personal project; effects are decoration-first (anti-pattern for us).
- **What AC should take from it:** What NOT to do: a full-screen composer on a landing page with no user benefit.
- **Evidence source:** README `4,434 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 25. `CristianOlivera1/openhero`

[https://github.com/CristianOlivera1/openhero](https://github.com/CristianOlivera1/openhero) · premium-sites · ★407 · forks 38 · open issues 0 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | TypeScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2026-05-07 | | Last push | 2026-08-03 (91 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://openhero.art | | Found via | gap:hero section design stars:>100 |
| Score | 44.8 | | Inspected | yes — README 4,732 B |
| **Libraries in use** | `motion`, `next`, `react`, `supabase`, `tailwind` [VERIFIED-FILE] | | | |
| runtime deps | `@paper-design/shaders`, `@radix-ui/react-tabs`, `@supabase/ssr`, `@supabase/supabase-js`, `class-variance-authority`, `clsx`, `framer-motion`, `jszip`, `lucide-react`, `next` | | dev deps | 9 listed |
| Live demos found in README | 6 (https://nextjs.org/, https://openhero.art/svg/logo-openhero.svg…) | | README headings | ✨ What is openhero? / 🎬 Features / 🚀 Quick Start / 1. Clone the repo |

- **What it demonstrates:** Auth-gated landing, motion reveals, supabase client on the edge.
- **Use in our product:** Stack twin: next + tailwind + framer-motion + **supabase** — the closest public precedent for our exact combination.
- **Compatibility / risk:** 407 stars, young; verify its Supabase usage pattern against AC's RLS decisions before borrowing.
- **What AC should take from it:** The `MotionConfig` + `useReducedMotion` provider shape already used in AC's layout.tsx.
- **Evidence source:** README `4,732 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 26. `alchaincyf/huashu-motion`

[https://github.com/alchaincyf/huashu-motion](https://github.com/alchaincyf/huashu-motion) · GSAP / scroll · ★2,007 · forks 195 · open issues 4 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | JavaScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2026-10-18 | | Last push | 2026-10-22 (11 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://github.com/alchaincyf/huashu-motion | | Found via | search:topic:gsap stars:>20 |
| Score | 47.7 | | Inspected | yes — README 13,337 B |
| **Libraries in use** | `gsap` [VERIFIED-FILE] | | | |
| Live demos found in README | 6 (https://www.huasheng.ai, https://agentskills.io…) | | README headings | huashu-motion / 看效果 / 指着画面改 / 先写谱，再拍片 |

- **What it demonstrates:** Text split + stagger, horizontal sections, pin + scrub variants.
- **Use in our product:** Recipe book of GSAP scroll patterns with readable, small implementations.
- **Compatibility / risk:** MIT, 2k stars, single author, Chinese-first docs.
- **What AC should take from it:** The SplitText-free text stagger (roll your own splitter to avoid the paid plugin).
- **Evidence source:** README `13,337 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 27. `nateherkai/scroll-craft`

[https://github.com/nateherkai/scroll-craft](https://github.com/nateherkai/scroll-craft) · premium-sites · ★4,366 · forks 620 · open issues 11 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | JavaScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2026-08-22 | | Last push | 2026-09-30 (33 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://github.com/nateherkai/scroll-craft | | Found via | gap:topic:typography stars:>50, search:scrollytelling stars:>50, search:topic:scroll-animation stars:>50 |
| Score | 47.3 | | Inspected | yes — README 12,764 B |
| Live demos found in README | 3 (https://www.nateherk.com, https://code.claude.com/docs/en/plugins…) | | README headings | scroll-craft / New in 0.3.0: the approved ten-site standard / See the worked examples in motion / Three builds, three completely different pages |

- **What it demonstrates:** Section transitions, sticky reveals, marquee, tilt cards.
- **Use in our product:** Next/tailwind scroll-section collection; useful to see which patterns survive a real app shell.
- **Compatibility / risk:** 4.3k stars, pushed 2026-09-30; component-dump repo, no tests.
- **What AC should take from it:** Nothing structural; copy the reveal timing values only.
- **Evidence source:** README `12,764 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 28. `pixijs/pixijs`

[https://github.com/pixijs/pixijs](https://github.com/pixijs/pixijs) · WebGL / GLSL · ★48,612 · forks 5,134 · open issues 411 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | TypeScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2013-01-21 | | Last push | 2026-10-30 (3 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | http://pixijs.com | | Found via | search:topic:glsl stars:>100, search:topic:webgl stars:>300 |
| Score | 77 | | Inspected | yes — README 4,965 B |
| **Libraries in use** | `pixi` [VERIFIED-FILE] | | | |
| runtime deps | `@pixi/colord`, `@types/earcut`, `@webgpu/types`, `@xmldom/xmldom`, `earcut`, `eventemitter3`, `gifuct-js`, `ismobilejs`, `parse-svg-path`, `tiny-lru` | | dev deps | 40 listed |
| Live demos found in README | 6 (https://discord.gg/QrnxmQUPGV, https://pixijs.com…) | | README headings | PixiJS ⚡️ / Setup / Usage / TypeScript |

- **What it demonstrates:** WebGL/WebGPU 2D renderer, filters, sprite batching.
- **Use in our product:** The lighter-than-three option for 2D effects (sprite sheets, filters) if 3D is rejected but we still want GPU.
- **Compatibility / risk:** MIT, active. Bundle size for our needs unmeasured in the lab (only three/gsap/lenis/motion were measured).
- **What AC should take from it:** Nothing yet; keep as the fallback if '2D but GPU' becomes the brief.
- **Evidence source:** README `4,965 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 29. `subframe7536/maple-font`

[https://github.com/subframe7536/maple-font](https://github.com/subframe7536/maple-font) · Typography / design systems · ★29,609 · forks 1,215 · open issues 42 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | Python | | Licence (repo) | OFL-1.1 — check [VERIFIED-API] |
| Created | 2022-04-08 | | Last push | 2026-10-30 (3 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://font.subf.dev | | Found via | gap:topic:typography stars:>50 |
| Score | 71 | | Inspected | yes — README 30,851 B |
| Live demos found in README | 6 (https://font.subf.dev, https://fonts.zeoseven.com/items/442/…) | | README headings | Maple Mono / Features / Simplified Chinese, Traditional Chinese, and Japanese / ScreenShots |

- **What it demonstrates:** Variable weight axis, cubic-bezier-derived outlines, hintless rendering strategy.
- **Use in our product:** Candidate variable font with ligatures + Nerd icons; shows what a modern open type release looks like.
- **Compatibility / risk:** OFL-1.1: embedding and self-hosting fine; do not sell the font itself; renaming required for modified versions (reserved names).
- **What AC should take from it:** `font-feature-settings` stack (ss01/calt/liga) already implied by our editorial type.
- **Evidence source:** README `30,851 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 30. `githubnext/monaspace`

[https://github.com/githubnext/monaspace](https://github.com/githubnext/monaspace) · Typography / design systems · ★19,777 · forks 324 · open issues 68 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | Shell | | Licence (repo) | OFL-1.1 — check [VERIFIED-API] |
| Created | 2023-09-25 | | Last push | 2026-03-27 (220 d) [VERIFIED-API] |
| Maintenance | maturing | | Archived | False [VERIFIED-API] |
| Homepage | https://monaspace.githubnext.com | | Found via | gap:topic:typography stars:>50 |
| Score | 59.5 | | Inspected | yes — README 14,000 B |
| Live demos found in README | 6 (https://api.star-history.com/svg?repos=githubnext/monaspace&type=Date, http://monaspace.githubnext.com…) | | README headings | Monaspace / Overview / Texture Healing / Nerd Fonts |

- **What it demonstrates:** Five families with icon ligatures; JetBrains-based; OFL.
- **Use in our product:** Our mono layer (IDs, sizes, dates in metadata rows) — variable-width ligature coding fonts.
- **Compatibility / risk:** OFL-1.1; last push 2026-03-27 → static release, fine for fonts.
- **What AC should take from it:** Using a mono face *only* for machine values, never prose.
- **Evidence source:** README `14,000 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 31. `skeletonlabs/skeleton`

[https://github.com/skeletonlabs/skeleton](https://github.com/skeletonlabs/skeleton) · Typography / design systems · ★6,086 · forks 393 · open issues 56 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | TypeScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2022-02-23 | | Last push | 2026-11-01 (1 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://skeleton.dev | | Found via | search:design system tailwind stars:>500, search:react a11y stars:>1000 |
| Score | 58.6 | | Inspected | yes — README 2,324 B |
| **Libraries in use** | `react`, `svelte`, `vite` [VERIFIED-FILE] | | | |
| Live demos found in README | 6 (https://tailwindcss.com/, https://www.youtube.com/@skeletonlabs…) | | README headings | Skeleton / 📖 Get Started / 👥 Community / 🤝 Support |

- **What it demonstrates:** Theme-as-stylesheet, `--theme-*` CSS vars, preflight/typography presets.
- **Use in our product:** A typography-first CSS system built on tailwind: how to express type scale, prose, and theme switching as tokens.
- **Compatibility / risk:** MIT, active. Tailwind-plugin coupling — AC already runs tailwind 4.
- **What AC should take from it:** Theme-token layering (base → component → override) with zero JS.
- **Evidence source:** README `2,324 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 32. `radix-ui/themes`

[https://github.com/radix-ui/themes](https://github.com/radix-ui/themes) · Perf / a11y · ★8,810 · forks 346 · open issues 166 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | TypeScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2023-06-15 | | Last push | 2026-04-11 (205 d) [VERIFIED-API] |
| Maintenance | maturing | | Archived | False [VERIFIED-API] |
| Homepage | https://radix-ui.com/themes | | Found via | gap:radix ui stars:>1000 |
| Score | 55.5 | | Inspected | yes — README 1,397 B |
| Live demos found in README | 6 (https://radix-ui.com/themes, https://discord.com/invite/7Xb99uG…) | | README headings | Radix Themes / Documentation / Releases / Authors |

- **What it demonstrates:** 9-step colour scales, radius/leading tokens, `Theme` provider with `accentColor`.
- **Use in our product:** Reference for a coherent dark/light + accent-scale system built from primitives.
- **Compatibility / risk:** MIT. Opinionated styles we would have to undo for an editorial look.
- **What AC should take from it:** The 12-step scale idea for our surface/elevation tokens (not the CSS).
- **Evidence source:** README `1,397 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 33. `kokonut-labs/kokonutui`

[https://github.com/kokonut-labs/kokonutui](https://github.com/kokonut-labs/kokonutui) · Motion / UI animation · ★2,259 · forks 150 · open issues 0 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | TypeScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2024-11-01 | | Last push | 2026-10-31 (2 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://kokonutui.com | | Found via | search:topic:framer-motion stars:>50 |
| Score | 51.3 | | Inspected | yes — README 3,994 B |
| **Libraries in use** | `motion`, `next`, `react`, `tailwind` [VERIFIED-FILE] | | | |
| runtime deps | `@radix-ui/react-dropdown-menu`, `@radix-ui/react-slot`, `@tailwindcss/postcss`, `@types/mdx`, `@vercel/analytics`, `@vercel/speed-insights`, `class-variance-authority`, `clsx`, `fumadocs-core`, `fumadocs-mdx` | | dev deps | 11 listed |
| Live demos found in README | 6 (https://kokonutui.com/docs/agents, https://kokonutui.com/docs/media…) | | README headings | Quick start / Components / Use with AI agents / Kokonut UI Pro |

- **What it demonstrates:** 2.2k stars, MIT, motion + tailwind v4 idioms in real files.
- **Use in our product:** Copy-in tailwind+motion components (dashboards, pricing, hero) with a small codebase to read.
- **Compatibility / risk:** Component-gallery repo: no tests, breaking changes likely.
- **What AC should take from it:** Their tailwind-4 `@theme` usage.
- **Evidence source:** README `3,994 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 34. `ixartz/SaaS-Boilerplate`

[https://github.com/ixartz/SaaS-Boilerplate](https://github.com/ixartz/SaaS-Boilerplate) · premium-sites · ★7,479 · forks 1,337 · open issues 5 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | TypeScript | | Licence (repo) | MIT — permissive [VERIFIED-API] |
| Created | 2024-03-29 | | Last push | 2026-11-01 (1 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://react-saas.com/ | | Found via | search:shadcn stars:>1000 |
| Score | 54.3 | | Inspected | yes — README 32,822 B |
| **Libraries in use** | `drizzle`, `next`, `react`, `tailwind` [VERIFIED-FILE] | | | |
| runtime deps | `@clerk/localizations`, `@clerk/nextjs`, `@clerk/ui`, `@logtape/logtape`, `@radix-ui/react-accordion`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-icons`, `@radix-ui/react-separator`, `@radix-ui/react-slot`, `@sentry/nextjs` | | dev deps | 40 listed |
| Live demos found in README | 6 (https://max-demo.nextjs-boilerplate.com, https://react-saas.com/dashboard/user-profile…) | | README headings | Free and Open Source SaaS Boilerplate with Tailwind CSS and Shadcn UI / Sponsors / Demo / Features |

- **What it demonstrates:** Drizzle schema + migration + typed queries in an App-Router app.
- **Use in our product:** next + tailwind + **drizzle** + Clerk/marketing pages: nearest public shape of AC's data layer for a discovery product.
- **Compatibility / risk:** MIT. It is a boilerplate — audit anything you copy; AC's own Drizzle/Supabase decisions win.
- **What AC should take from it:** The typed query-boundary file (`lib/*` single import point), matching AC's D3 `lib/catalog.ts`.
- **Evidence source:** README `32,822 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]

### 35. `meilisearch/meilisearch`

[https://github.com/meilisearch/meilisearch](https://github.com/meilisearch/meilisearch) · Document discovery / search · ★59,746 · forks 2,781 · open issues 316 [VERIFIED-API]

| field | value | | field | value |
|---|---|---|---|---|
| Language | Rust | | Licence (repo) | NOASSERTION — custom/unspecified — legal review before vendoring [VERIFIED-API] |
| Created | 2018-04-23 | | Last push | 2026-11-01 (1 d) [VERIFIED-API] |
| Maintenance | active | | Archived | False [VERIFIED-API] |
| Homepage | https://www.meilisearch.com | | Found via | gap:meilisearch stars:>1000 |
| Score | 71 | | Inspected | yes — README 25,847 B |
| Live demos found in README | 6 (https://www.meilisearch.com/docs/resources/comparisons/opensearch?utm_campaign=oss&utm_source=gith, https://www.meilisearch.com/docs/resources/comparisons/algolia?utm_campaign=oss&utm_source=github&…) | | README headings | ☁️ Ways to run Meilisearch / 🚀 Quick start / 1. Get a Meilisearch instance / 2. Add documents |

- **What it demonstrates:** Typo tolerance, facets, sortable fields, instant HTTP API, `hitsPerPage`.
- **Use in our product:** If Postgres text search outgrows itself for typo-tolerant course/topic search, this is the self-hostable step.
- **Compatibility / risk:** MIT core (some enterprise features are ee-licensed → check dirs). Adds infrastructure, not a bundle.
- **What AC should take from it:** The facet-count response shape (`facetStats`/matched events) for our search UI.
- **Evidence source:** README `25,847 B` + `package.json` fetched 2026-11-02 via `research/deep_eval.py` → `discovery/readmes/`, `discovery/pkgs/` [VERIFIED-FILE]
- **Evaluation status:** ◆ inspected — dependency/README facts verified; runtime behaviour, a11y tree and visual result **not** executed in AK's environment [UNVERIFIED]


---

## 5. Supplementary evaluations — the five repos that were ▲ shortlisted and are now ◆ inspected

Added by the **2026-11-02 verification pass** (`VERIFICATION_LOG.md` §4 C1) to close open item #4 of `GITHUB_RESEARCH_GAPS.md`. All metadata re-fetched live from `api.github.com` + `registry.npmjs.org` on 2026-11-02; `package.json` / README read through the contents API — so dependencies and peer ceilings below are `[VERIFIED-FILE]`, not prose from a description.

### S1 · `troika-three-text` — upstream is **`protectwise/troika`** (not `etherlos/*`, which 404s)
| field | value |
|---|---|
| repo facts | ★1,985 · pushed **2026-11-01** · MIT · not archived · not a fork · homepage empty, docs at `protectwise.github.io/troika` [VERIFIED-API] |
| package facts | `troika-three-text@0.52.5`, published **2026-07-24**, npm licence **MIT** [VERIFIED-API] |
| runtime deps | `bidi-js`, `troika-three-utils`, `troika-worker-utils`, `webgl-sdf-generator` [VERIFIED-FILE package.json] |
| peer | `three >=0.125.0` — no React constraint at all, so it is orthogonal to the `react >=19 <19.4` R3F ceiling [VERIFIED-FILE] |
| what it demonstrates | SDF-based text for Three.js: real vector-crisp type inside a scene, with worker-side layout + bidi/Arabic/Indic shaping — the thing `<Text>` from drei delegates to |
| relevance to the hub | The **only** credible way to put readable type inside a 3D scene (e.g. a subject-orb label). Our recommendation stays "keep type in the DOM"; if AO approves 3D *and* wants labels in it, this is the package, and its licence is no longer an open question (Phase 1 U11 closed) |
| risk | 4 deps incl. a worker + an SDF generator; text layout runs off-main-thread but glyph atlas uploads are a real GPU cost on low-end Android; RTL shaping is a size cost we don't need (Hindi/English content → fine) |
| verdict | ⚠️ **conditional**: adopt only inside the Phase-5 3D scene, never for page type. MIT, active |

### S2 · `@react-three/postprocessing` — upstream **`pmndrs/react-postprocessing`** (★1,498, MIT, pushed **2026-10-21**)
| field | value |
|---|---|
| package | `@react-three/postprocessing@3.2.2`, published **2026-10-21**, MIT; deps `n8ao`, `maath` [VERIFIED-API] |
| peers | `@react-three/fiber >=9.7.0` · `react ^19.0.0` · `three >= 0.156.0` · `postprocessing ^6.36.0` [VERIFIED-API] |
| correction | Phase 1 skipped it for "no React 19 guarantee" — **the peer range explicitly requires React 19**, and the repo is active. The rejection stands on **cost**, not compatibility [VERIFICATION_LOG C2] |
| relevance | Bloom/vignette/chromatic-aberration presets are the cheap route to "cinematic"; but every effect adds render passes, which is precisely what our low-power budget forbids |
| verdict | ❌ **not installed**. If a glow is wanted, do it with one additive sprite or a CSS blur on the poster layer; measured floors in `prototype-lab/measurements.json` show the scene budget is already spent on three itself (130.4–187.5 KB gz) |

### S3 · `oframe/ogl` — the licence question, answered properly
| field | value |
|---|---|
| repo | ★4,745 · pushed **2025-04-13** · **API reports no SPDX licence** (`NONE` in the atlas) · not archived [VERIFIED-API] |
| licence reality | The repo has **no `LICENSE` file** (contents API 404s on `/LICENSE`), but `package.json` and the npm registry both declare **`Unlicense`** [VERIFIED-FILE] |
| package | `ogl@1.0.11`, published **2025-01-27** — **21 months stale**; zero runtime deps; exports `.` and `./src/*` [VERIFIED-API] |
| what it demonstrates | A ~30 KB minimal WebGL abstraction (geometry/program/camera only, no scene graph) — the existence proof that "WebGL background" ≠ "import three" |
| relevance | Our hero shader needs no abstraction at all (ex05 measured **6.6 KB js / 3.1 KB gz** with raw GLSL in `prototype-lab/src/ex05-shader-bg/`), so OGL buys us nothing we can't do in 60 lines |
| verdict | ❌ rejected — **for staleness, not licensing**. Note for AO: an `Unlicense` package with no `LICENSE` file is a weaker legal position than MIT; do not vendor code from it |

### S4 · `@tanstack/react-virtual` — the one perf tool we would actually add
| field | value |
|---|---|
| repo | `TanStack/virtual` ★**7,180**, pushed **2026-11-01** (same-day activity), MIT, monorepo root `package.json` name `root` [VERIFIED-API/FILE] |
| package | `@tanstack/react-virtual@3.14.25`, published **2026-11-01**, MIT, single dep `@tanstack/virtual-core`, peers `react ^16.8 ‖ ^17 ‖ ^18 ‖ ^19` [VERIFIED-API] |
| what it demonstrates | Headless windowing: it renders only the rows in view and reports the spacer sizes; no DOM opinion, so it composes with our `<DocCard>` and with `content-visibility` |
| relevance | **The answer to "what happens at 2,000 documents"** — the scaling question `audit/stack-audit.md` §3 raised. Grid rows of cards, and the mobile facet list, are both virtualisable |
| verdict | 💡 **deferred, not rejected**: add it in the phase where the dataset passes ~200 records, *or* rely on pagination + `content-visibility: auto` first. Cheapest correct order: server pagination → virtualisation only for the facet list if it grows |

### S5 · `cmdk` (repo `dip/cmdk`) — status corrected
| field | value |
|---|---|
| repo | ★**13,062**, pushed **2025-10-29**, MIT, **not a fork** (the repo moved; `pacocoursey/cmdk`, which npm metadata still cites, now 404s) [VERIFIED-API] |
| package | `cmdk@1.1.1` published **2025-03-14** — i.e. **19 months since a release**, not "active" as Phase 1 implied [VERIFIED-API / LOG C5] |
| README claims (their words, unverified) | "Fast, unstyled command menu React component… you render items, it filters and sorts them automatically", composable API, bundlephobia badge |
| what it demonstrates | The combobox/dialog composition our hand-rolled `CommandPalette` lacks (`aria-activedescendant`, roving focus, auto-filter/sort) — [VERIFIED-FILE] our palette implements only arrows/Enter/Esc |
| relevance | Phase 3 candidate for the palette. Stability is acceptable for a component this small, but AC should treat it as frozen: **pin `1.1.1`**, expect no upstream fixes, and budget owning the fork |
| verdict | ⚠️ **conditional** (unchanged from Phase 1 `frontend-components.md` §3): swap in Phase 3 with a11y tests, never during styling |

### Net effect of the supplement

| status | before | after |
|---|--:|--:|
| `◆ inspected (deep)` repos | 72 | **77** |
| evaluation cards in this file | 35 | **40** |
| open items in `GITHUB_RESEARCH_GAPS.md` § still-open | 5 | **2** (both browser-only) |
