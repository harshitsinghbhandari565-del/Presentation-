# The 15 best implementation references for AC

Hand-picked, ranked by 'how much of this can AC use without changing our architecture'. Each entry has a **do-this / not-this** line because a reference that AC mis-reads is worse than no reference.

Ranked set: 1–15 below. Full evaluations in `TOP_35_DEEP_EVALUATIONS.md`; the population they were drawn from in `REPOSITORY_ATLAS.md`.

## 1. `motiondivision/motion`

- **Why this one:** Already installed as framer-motion 12.43.0 — this is the micro-interaction engine of the product.
- **Read:** [https://github.com/motiondivision/motion](https://github.com/motiondivision/motion) — ★34,777, MIT, last push 2026-11-01 [VERIFIED-API]
- **Run it:** https://motion.dev
- **Live demos linked from its README:** https://motion.dev/docs/react, https://motion.dev/llms.txt?utm_source=github-readme, https://motion.dev/docs/cursor
- **AC does this:** Nothing new. Keep framer-motion; import from `framer-motion/mini` + `LazyMotion(domAnimation)` → measured 29.7 KB gz (−15.2 KB).
- **AC does not do this:** Renamed package: `motion` (14.x) vs `framer-motion` (12.x). Measured: motion/react costs 49.5 KB gz vs 44.9 KB for what AC has — switching buys nothing.

## 2. `greensock/GSAP`

- **Why this one:** Only if we ship the pinned cinematic landing chapter; one library, one timeline, scrub + pin.
- **Read:** [https://github.com/greensock/GSAP](https://github.com/greensock/GSAP) — ★30,029, NONE, last push 2026-04-13 [VERIFIED-API]
- **Run it:** https://gsap.com
- **Live demos linked from its README:** https://gsap.com, https://gsap.com/docs/v3/Plugins/MorphSVGPlugin, https://gsap.com/docs/v3/GSAP/UtilityMethods
- **AC does this:** The `matchMedia` + `gsap.context()` teardown shape from EX04, so a pin can be switched off and destroyed.
- **AC does not do this:** [VERIFIED-LICENSE] npm metadata says `Standard 'no charge' license` (gsap.com/standard-license) — NOT MIT. PO/legal must read it. Repo push 2026-04-13; plugin work happens in the private/no-charge repo.

## 3. `darkroomengineering/lenis`

- **Why this one:** Optional desktop-only smooth scroll for the storytelling section; must stay a user-visible toggle.
- **Read:** [https://github.com/darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) — ★17,028, MIT, last push 2026-10-29 [VERIFIED-API]
- **Run it:** https://lenis.dev
- **Live demos linked from its README:** https://unpkg.com/lenis@1.3.27/dist/lenis.min.js, https://easings.net/en, https://14islands.com/
- **AC does this:** The destroy path: `lenis.destroy()` + `gsap.ticker.remove` and never `autoRaf` together with a ticker.
- **AC does not do this:** MIT but it hijacks wheel/keyboard scroll: breaks find-in-page, pull-to-refresh, and any `scroll-behavior:smooth` CSS (AC's c9d0d599 has it). Measured floor 5.3 KB gz — cheap; the risk is behaviour, not bytes.

## 4. `pmndrs/react-three-fiber`

- **Why this one:** The only sane way to put 3D inside AC's React 19 tree if we do 3D at all.
- **Read:** [https://github.com/pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) — ★33,418, MIT, last push 2026-10-21 [VERIFIED-API]
- **Run it:** https://docs.pmnd.rs/react-three-fiber
- **Live demos linked from its README:** https://www.flux.ai, https://npm-compare.com/@react-three/a11y,@react-three/cannon,@react-three/csg,@react-three/drei,@, https://blockchain.com/eth/address/0x6E3f79Ea1d0dcedeb33D3fC6c34d2B1f156F2682
- **AC does this:** `frameloop="demand"` + `invalidate()` on input — the single most important WebGL cost control.
- **AC does not do this:** Adds react-three-fiber + its reconciler to an app that today ships zero 3D. Requires three (measured 130–188 KB gz). R3F v9 targets React 19 → compatible with AC's react 19.2.6.

## 5. `mrdoob/three.js`

- **Why this one:** Not a dependency in this ranking: it is the reference corpus (300 live `webgl_*` examples) and the renderer underneath everything else.
- **Read:** [https://github.com/mrdoob/three.js](https://github.com/mrdoob/three.js) — ★117,375, MIT, last push 2026-11-01 [VERIFIED-API]
- **Run it:** https://threejs.org/
- **Live demos linked from its README:** https://threejs.org/examples/, https://threejs.org/docs/, https://www.jsdelivr.com/package/npm/three
- **AC does this:** Never `import * as THREE` in app code; import the named classes you use so bundlers can shake the rest.
- **AC does not do this:** MIT, extremely active (pushed 2026-11-01). Importing `three` wholesale is the #1 size risk — measured 187.5 KB gz for a namespace import vs 130.4 KB for a named subset.

## 6. `pmndrs/drei`

- **Why this one:** If R3F is approved, drei supplies ScrollControls, Float, Text (troika SDF), Environment, PerformanceMonitor.
- **Read:** [https://github.com/pmndrs/drei](https://github.com/pmndrs/drei) — ★10,101, MIT, last push 2026-10-21 [VERIFIED-API]
- **Run it:** https://docs.pmnd.rs/drei
- **Live demos linked from its README:** https://pmndrs.github.io/drei/abstractions/gradient-texture, https://pmndrs.github.io/drei/staging/contact-shadows, https://pmndrs.github.io/drei/abstractions/screen-space
- **AC does this:** `PerformanceMonitor` to downgrade DPR/count on slow devices; the demo-per-helper pattern for our own docs.
- **AC does not do this:** Helpers are individually tree-shakeable but several pull heavy deps (troika-three-text for Text, @mediapipe/... no). MIT, active (2026-10-21).

## 7. `shadcn-ui/ui`

- **Why this one:** The distribution model for our own card/facet/nav primitives — copy in, own the code, no runtime dep.
- **Read:** [https://github.com/shadcn-ui/ui](https://github.com/shadcn-ui/ui) — ★127,118, MIT, last push 2026-10-31 [VERIFIED-API]
- **Run it:** https://ui.shadcn.com
- **Live demos linked from its README:** https://ui.shadcn.com/docs
- **AC does this:** The `registry/<name>/index.tsx + hooks + lib` layout if we ever publish our own component set.
- **AC does not do this:** MIT. Not a package to install for styling; treat as a source of implementations to read.

## 8. `radix-ui/primitives`

- **Why this one:** Reference for the hard interaction-state problems: combobox (facet picker), dialog (mobile filter sheet), popover (preview).
- **Read:** [https://github.com/radix-ui/primitives](https://github.com/radix-ui/primitives) — ★19,462, MIT, last push 2026-10-14 [VERIFIED-API]
- **Run it:** https://radix-ui.com/primitives
- **Live demos linked from its README:** https://discord.com/invite/7Xb99uG, https://www.radix-ui.com/primitives/docs, https://www.radix-ui.com/primitives/docs/overview/releases
- **AC does this:** The `asChild` composition + controlled/uncontrolled pattern for our filters.
- **AC does not do this:** MIT, active. React-only. Using Radix adds ~1-4 KB/prime* (unmeasured here) — note as unverified.

## 9. `tailwindlabs/headlessui`

- **Why this one:** Alternative to Radix for Listbox/Combobox/Dialog if we want fewer transitive deps.
- **Read:** [https://github.com/tailwindlabs/headlessui](https://github.com/tailwindlabs/headlessui) — ★28,805, MIT, last push 2026-04-13 [VERIFIED-API]
- **Run it:** https://headlessui.com
- **Live demos linked from its README:** https://headlessui.com
- **AC does this:** The virtual-combobox recipe (list × keyboard) for a 500-subject facet list.
- **AC does not do this:** MIT, last push 2026-04-13 → slower cadence than Radix. Vue+React.

## 10. `bvaughn/react-virtualized`

- **Why this one:** Only if a result list grows past ~200 rows per page; our pages are small so this may be unnecessary.
- **Read:** [https://github.com/bvaughn/react-virtualized](https://github.com/bvaughn/react-virtualized) — ★27,066, MIT, last push 2026-10-31 [VERIFIED-API]
- **Run it:** https://react-virtualized-docs.vercel.app
- **Live demos linked from its README:** https://opencollective.com/react-virtualized/sponsor/4/avatar.svg, https://opencollective.com/react-virtualized/sponsor/10/website, https://opencollective.com/react-virtualized/backer/15/website
- **AC does this:** Nothing yet: prefer CSS content-visibility before adding a virtualiser.
- **AC does not do this:** MIT but the author keeps it in maintenance mode; `react-window`/`@tanstack/virtual` are the actively developed siblings (not in my inspected set — flagged as a gap, not a recommendation).

## 11. `DavidHDev/react-bits`

- **Why this one:** The densest single gallery of 'premium component with scroll/hover motion' in the ecosystem.
- **Read:** [https://github.com/DavidHDev/react-bits](https://github.com/DavidHDev/react-bits) — ★50,983, NOASSERTION, last push 2026-10-31 [VERIFIED-API]
- **Run it:** https://reactbits.dev
- **Live demos linked from its README:** https://reactbits.dev/get-started/installation, https://shadcnstudio.com/?utm_source=reactbits&utm_medium=sponsor&utm_campaign=silver&ref=reactbit, https://x.com/shadcn/status/1962854085587275932
- **AC does this:** The interaction *idea list*, filtered to what survives reduced-motion.
- **AC does not do this:** [VERIFIED-LICENSE] GitHub reports `NOASSERTION` (custom/unclear) → read patterns, do NOT copy source into the app.

## 12. `magicuidesign/magicui`

- **Why this one:** Copy-in motion components that already assume tailwind + framer-motion, i.e. exactly AC's stack.
- **Read:** [https://github.com/magicuidesign/magicui](https://github.com/magicuidesign/magicui) — ★23,026, MIT, last push 2026-10-31 [VERIFIED-API]
- **Run it:** https://magicui.design
- **Live demos linked from its README:** https://discord.com/invite/87p2vpsat5, https://twitter.com/magicuidesign, https://contrib.rocks/image?repo=magicuidesign/magicui
- **AC does this:** Border/gradient animation done with `@property` + pseudo-element instead of a JS loop.
- **AC does not do this:** MIT. Some effects are pure decoration and would violate our 'must earn its place' rule.

## 13. `chakra-ui/zag`

- **Why this one:** State machines for the interaction logic that keeps breaking: filter sheet, combobox, roving tabindex, tour.
- **Read:** [https://github.com/chakra-ui/zag](https://github.com/chakra-ui/zag) — ★5,247, MIT, last push 2026-11-01 [VERIFIED-API]
- **Run it:** http://zagjs.com
- **Live demos linked from its README:** https://lit.dev/, https://www.w3.org/WAI/ARIA/apg/, https://zagjs.com/components/toggle-group
- **AC does this:** The `connect`/prop-getter split — behaviour in a machine, rendering in our own components.
- **AC does not do this:** MIT, active. Adds conceptual weight; only worth it if our filter logic keeps growing.

## 14. `mui/base-ui`

- **Why this one:** Newer unstyled-primitive option with preview/focus-trap utilities; alternative to Radix.
- **Read:** [https://github.com/mui/base-ui](https://github.com/mui/base-ui) — ★11,272, MIT, last push 2026-11-01 [VERIFIED-API]
- **Run it:** https://base-ui.com
- **Live demos linked from its README:** https://bsky.app/profile/base-ui.com, https://x.com/base_ui, https://x.com/jjenzz
- **AC does this:** Their focus-management utilities if we hand-roll the sheet.
- **AC does not do this:** MIT, active (2026-11-01) but young → API churn risk while our app is pre-launch.

## 15. `ariakit/ariakit`

- **Why this one:** The most rigorous keyboard/ARIA implementation of dialog/menu/combobox if we hand-roll.
- **Read:** [https://github.com/ariakit/ariakit](https://github.com/ariakit/ariakit) — ★8,630, NONE, last push 2026-11-01 [VERIFIED-API]
- **Run it:** https://ariakit.com
- **Live demos linked from its README:** https://ariakit.com/examples, https://discord.gg/WyHvnXsvMs, https://bsky.app/profile/ben.ariakit.org
- **AC does this:** `hoverType: 'focus' | 'mouse'` timeout model — the correct way to delay a preview popover.
- **AC does not do this:** [VERIFIED-LICENSE] GitHub API returned license=None → must read LICENSE file before use. Active (2026-11-01).

## The one-line version for AC

| if you only have 5 minutes | repo | because |
|---|---|---|
| 1 | `motiondivision/motion` | you already ship it; use `framer-motion/mini` + `LazyMotion` (measured −15.2 KB gz) |
| 2 | `darkroomengineering/lenis` | decides whether the landing scrolls smoothly; read its ScrollTrigger bridge before you try |
| 3 | `greensock/GSAP` | the pinned chapter needs it *or* CSS scroll-driven animations — and its licence is not MIT |
| 4 | `mrdoob/three.js` | 300 live examples, no install, all MIT: the cheapest possible 3D research |
| 5 | `radix-ui/primitives` | the filter sheet and preview popover are 90 % keyboard/focus behaviour |

## What is *not* in this list, on purpose

- No boilerplate/kit repos (`wasp-lang/open-saas`, `ixartz/*` patterns are covered in the 35 but not here): they encode *someone else's* architecture, and ours is already decided (Supabase + Drizzle + `lib/catalog.ts`).
- No AGPL (`apitable/apitable`) and no `NOASSERTION` source-copying (`DavidHDev/react-bits`) — reading only.
- No `@studio-freedom/lenis`-era advice: the package moved to `darkroomengineering/lenis` v1.3.27 [VERIFIED-LICENSE].
- No three.js wrappers we cannot measure (`@react-three/postprocessing` etc. were shortlisted but not inspected — recorded as a gap in `GITHUB_RESEARCH_GAPS.md`).
