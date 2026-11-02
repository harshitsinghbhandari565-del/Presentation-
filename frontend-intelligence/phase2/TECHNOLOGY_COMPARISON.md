# Technology comparison — nine decisions, measured where measurement was possible

Every size below is from `prototype-lab/measurements.json` (esbuild 0.25.12 + node zlib, vendors inlined, react external),
2026-11-02. Where a number is not ours it says so. Compatibility claims reference **AC's actual manifest**
(`origin/arena/c9d0d599-presentation:package.json`): next 16.4.3, react 19.2.6, **framer-motion ^12.43.0**,
tailwindcss 4.1.17, @supabase/ssr 0.12.7, drizzle-orm 0.45.2, zod 4.6.7, playwright 1.64.1 + @axe-core/playwright 4.14.0 [VERIFIED-FILE].

| AC already has | AC does not have |
|---|---|
| framer-motion, tailwind 4, lucide, playwright+axe, supabase, drizzle, zod | three, R3F, drei, GSAP, Lenis, lottie, rive, any virtualiser, any smooth-scroll lib |

---

## 1. three.js vs React Three Fiber

| | three.js (direct) | R3F |
|---|---|---|
| Strengths | full control; no reconciler; smallest possible GL app (my EX02 imports only what it needs) | declarative lifecycle = correct `dispose()` almost for free; Suspense loading; drei ecosystem; `frameloop="demand"` is one prop |
| Weaknesses | AC hand-writes mount/unmount/resize/dispose in a React app — the classic source of leaked WebGL contexts | adds react-reconciler; harder to debug below the abstraction; R3F version must match React major |
| Measured bundle | **130.4 KB gz** named / 187.5 KB namespace | R3F+three ≈ 130 KB + reconciler (**unmeasured**: AC would add `three`, `@react-three/fiber`; I could not install React-side packages without touching app-adjacent config — lab stayed vanilla) |
| Accessibility | canvas is `aria-hidden` + a DOM twin either way | same; R3F doesn't change a11y |
| Maintenance | MIT, pushed 2026-11-01, ★117,375 [VERIFIED-API] | MIT, pushed 2026-10-21, ★33,418 [VERIFIED-API] |
| Fit with AC | framework-neutral; risk = hand-rolled lifecycle in RSC/SSR needs `dynamic({ssr:false})` | needs a client boundary — fine (AC already uses client components for `Reveal`) |
| When to use | one effect, one canvas, precise control (hero background) | anything with many objects, state, or drei helpers (Text/Instances/ScrollControls) |

**Verdict:** if 3D is approved at all, **R3F + drei + three, imported dynamically behind a capability + intent gate**.
The only situation where raw three wins for us is a *single* fullscreen effect — and for that, §7 says don't use three at all.

## 2. GSAP vs Motion (framer-motion)

| | GSAP + ScrollTrigger | framer-motion 12.43 (installed) |
|---|---|---|
| Measured | core 27.1 KB; +ScrollTrigger **44.4 KB**; +Flip 53.1; +SplitText 56.1 | root **44.9 KB**; `/mini`+LazyMotion **29.7 KB**; `motion/react` 49.5 KB |
| Strengths | timeline/pin/scrub/matchMedia/context are the best-in-class primitives for **scroll-sequenced storytelling**; SplitText/Flip solve real problems | already in the bundle; React-native state (`AnimatePresence`, layout animations, `useScroll`+`useTransform`, `MotionConfig reducedMotion="user"` — AC already wraps the tree in it) |
| Weaknesses | **licence is not MIT** [VERIFIED-LICENSE]: npm field = `Standard 'no charge' license` → PO/legal must read gsap.com/standard-license before AC adds it; new 44 KB of JS on the landing route; overlaps what framer-motion already does | scroll pinning is `position:sticky` DIY (fine) but there's no scrubbed timeline equivalent; per-component cost in RSC trees; the root import drags features AC doesn't use |
| Accessibility | both must respect `prefers-reduced-motion`; GSAP needs manual `matchMedia`; AC's `Reveal.tsx` already uses `useReducedMotion()` [VERIFIED-FILE] | built-in `useReducedMotion` + `MotionConfig` |
| Maintenance | repo pushed 2026-04-13 (plugins live in the no-charge repo) [VERIFIED-API] | pushed 2026-11-01, ★34,777 [VERIFIED-API] |

**Verdict: use framer-motion for everything component-level (that's free — it's installed), and do NOT add GSAP unless
the pinned/scrubbed chapter survives PO review as a *required* experience.** If it is required, add
`gsap`+`ScrollTrigger` **only on the landing route via a dynamic import**, use `gsap.context()` teardown
(EX04 shows the shape), and accept +44.4 KB gz on that route only. Never install `motion` to "replace"
framer-motion — measured +4.6 KB for an API we don't use.

## 3. GSAP ScrollTrigger vs native CSS scroll-driven animations

| | ScrollTrigger | CSS `animation-timeline: view()/scroll()` |
|---|---|---|
| Measured | 17.9 KB gz (plugin alone), 44.4 with core | **0 KB** |
| Strengths | works everywhere; pin; scrub; callbacks; `matchMedia`; timeline nesting | no JS, no main-thread work, compositor-friendly, auto-pauses when offscreen |
| Weaknesses | bytes + licence + a second scroll authority | **pinning is still not expressible**; `view-timeline` coverage is Chromium-led (Safari support landed late/behind flags — verify before relying on it); no `onUpdate` for driving a shader uniform |
| Accessibility | JS must honour reduced motion | wrap in `@supports (animation-timeline: view())` + `@media (prefers-reduced-motion: no-preference)` and content is visible by default (EX01's `cssReveal` does exactly this) |
| Fit | adds a dependency | pure CSS — zero architectural change |

**Verdict:** **both, layered.** Reveal/parallax/progress-bar = CSS (0 KB). Anything that *pins* or drives a
non-CSS target (WebGL uniform, audio, analytics) = ScrollTrigger or `framer-motion`'s `useScroll`. My `cssReveal()`
in `src/_shared/lab.js` is the pattern: content is never hidden if `@supports` fails.

## 4. Lenis vs native scrolling

| | Lenis 1.3.27 | native |
|---|---|---|
| Measured | **5.3 KB gz** | 0 |
| Strengths | consistent momentum across OSes; `lerp` easing; programmatic stop; anchors; ScrollTrigger bridge documented | no hijack; find-in-page, pull-to-refresh, `scroll-behavior`, `scroll-snap`, focus scroll-into-view, reader mode all work |
| Weaknesses | hijacks wheel+keyboard; conflicts with AC's existing `html{scroll-behavior:smooth;scroll-padding-top:105px}` [VERIFIED-FILE c9d0d599 globals.css]; can break anchor focus; needs `lenis.destroy()` and *never* both `autoRaf` and a ticker | no control over iOS momentum; uneven Firefox/Linux feel |
| Accessibility | keyboard scrolling still works but with lerp delay — some users with motion sensitivity need it off; must be a visible toggle | default = best |
| Maintenance | MIT, pushed 2026-10-29, ★17,028; `@darkroomengineering/satus` is its successor tooling [VERIFIED-API] | — |

**Verdict: do not add Lenis as a default.** Add it (5.3 KB) only behind the same user-facing toggle my EX09 uses,
desktop-only, `matchMedia("(prefers-reduced-motion: no-preference)") and (min-width:1024px)`, with teardown — and if AC adds it, **remove `scroll-behavior:smooth` from `globals.css`** (conflict; recorded as a discrepancy for AO, not fixed by AK).

## 5. CSS animation vs JavaScript animation

| | CSS | JS |
|---|---|---|
| Measured cost | 0 KB (EX10 = 2.0 KB gz *total page*) | 27–56 KB per library (EX07/EX08: same effect, +60 KB) |
| Where it wins | discrete state transitions, hovers, reveals, `@property`-registered custom props (EX07 spotlight), scroll-driven reveals, layout-stable transforms | anything needing measurement, interruption, sequencing, physics, or non-CSS targets (canvas/WebGL/audio) |
| Where it loses | no per-frame read/write logic; can't coordinate two elements around a measured rect; no completion events (there is `animationend`, but sequencing gets ugly fast) | forces you to own reduced-motion, cleanup, and jank |
| A11y | media queries handle it declaratively | must implement `useReducedMotion`/`matchMedia` (both engines in EX01/EX04 show it) |
| Maintenance | nothing to update | a dependency to upgrade |

**Verdict: CSS-first with a documented escape hatch.** Rule for AC: *an effect may only use JS if it needs a measured
value, an interruption, or a non-DOM target.* This one sentence removes ~90 KB of the tempting options in this pack.

## 6. Lottie vs Rive vs SVG vs CSS

| | Lottie (`lottie-web`) | Rive (`@rive-app/react-canvas`) | SVG + CSS | CSS only |
|---|---|---|---|---|
| Measured | **unmeasured** (typical published figure ≈50–60 KB gz for the full renderer; AC would verify) | unmeasured (runtime adds a WASM/JS core, larger) | 0 KB + inline path bytes | 0 KB |
| State | MIT, last push **2025-09-01** → 13 months stale [VERIFIED-API] | rive-react MIT, pushed 2026-10-27, ★1,182 [VERIFIED-API] | — | — |
| Strengths | After Effects ecosystem; JSON is data, not code | interactive state machines + input-driven (this is what "micro-interaction as an asset" actually means) | crisp, themable with `currentColor`, animatable in CSS | free |
| Weaknesses | renderer cost, no interactivity, JSON payload per animation (often 20–150 KB each), stale package | vendor runtime + editor lock-in; needs a licence for team features | complex art is hand-worked | limited to CSS-able properties |
| Fit | adds a renderer to a React app that has none | same, plus WASM fetch | perfect | perfect |

**Verdict: CSS + SVG covers our needs; skip both runtimes.** Our motion needs are state transitions, spinners,
skeleton shimmer, checkmarks, and one possible "how it works" animation. If PO later wants an interactive mascot or
a state-machine-driven illustration, choose **Rive over Lottie** (active maintenance, inputs/state machines) — and
then treat the file as an *asset with its own budget*, lazy-loaded per route.

## 7. WebGL vs CSS effects

| | WebGL (raw GL or three) | CSS/gradient/filter effects |
|---|---|---|
| Measured | EX05 raw GLSL: **2.9 KB gz total page**; EX06 via three: **192 KB gz total page** for one particle field | EX07 card: ~4 KB; blur/gradient/mask/border effects: 0 KB |
| GPU | real shader cost; must cap DPR (1.25/0.75 in the lab), gate on visibility, render on demand | `backdrop-filter` is expensive on large areas and *unmeasurable here*; gradients/blur on small layers are cheap |
| Failure modes | context creation can **throw**; shader compile can fail; context loss (mobile backgrounds); battery | mostly none; worst case is a soft edge in an old browser |
| A11y | content must live in DOM; canvas `aria-hidden`; text over shader needs contrast guarantees (EX05 puts a translucent panel behind copy) | text stays text |
| Reduced motion | render one static frame (EX05) or drop to gradient | pause animations |

**Verdict: one raw-WebGL2 background is allowed; three.js is a separate, explicit decision.** The measured 66×
difference between EX05 and EX06 for visually similar ambience is the entire argument. If a shader is added, ship
EX05's structure verbatim: capability check → dynamic import → try/catch program build → `IntersectionObserver`
pause → CSS-gradient fallback → DPR cap → static frame under reduced motion.

## 8. Client-side rendering vs server rendering

| | what AC does today (RSC + `revalidate=60`, server-rendered landing, `Promise.all([getCatalogHighlights(), getFacets()])`) [VERIFIED-FILE] | a client-fetched landing |
|---|---|---|
| LCP | first paint already has copy → LCP element is server HTML | LCP = fetch + render; on 4G this is the single biggest CWV risk |
| INP | unaffected by hydration of data | every interaction competes with hydration |
| CLS | controlled if skeletons match | layout shift on data arrival |
| Motion | hero/ambient motion can hydrate in after paint (that's what `Reveal.tsx` does) | motion competes with data |
| Caching | CDN-cacheable HTML, honest empty states | needs client cache |
| Compatibility | 3D/canvas effects are the *only* part that must be client — and only after capability check | no upside for a metadata app |

**Verdict: keep the current architecture; put motion on top of server HTML, never in place of it.** Landing = server
component; the animated layer = client, dynamically imported, `aria-hidden`, non-essential (EX05's overlay panel
keeps the *content* in DOM). Document cards = server components (AC's `DocumentCard.tsx` already is [VERIFIED-FILE]),
with CSS hover states, not JS.

## 9. Static pre-built 3D/asset pipeline vs runtime-generated

| | static (glTF/Draco/meshopt, texture atlas, pre-baked) | runtime-generated (procedural geometry/shaders) |
|---|---|---|
| Bytes | asset download; a 100 KB glTF is 100 KB of LCP risk if above the fold | ~0 asset bytes (EX05/EX06 are 100 % procedural: 0 asset requests) |
| CPU/GPU at first use | decode + upload; can be deferred with `useGLTF.preload` / lazy import | shader compile on first frame (jank unless warmed) + per-frame math |
| Authoring | designer-controlled quality; needs a pipeline and file management | code-controlled; deterministic; theme-reactive (EX05 changes colour with the theme without a reload) |
| Failure | missing/blocked asset → broken visual (needs a poster/fallback) | low-end GPU → frame starvation (needs DPR cap + downgrade path) |
| Our reality | **we have no 3D assets and no permission to proxy user files** (AC D2: metadata + links only) | fits our constraints exactly |

**Verdict: runtime-generated or nothing.** We must not ship a 100 KB model for decoration, and procedural
effects respect AC's "no asset pipeline" reality. If PO insists on a hero object, then: one glTF ≤ 40 KB after
Draco+meshopt, `poster` image shown first, loaded only after first interaction (`pointerdown`/`wheel`) or after
LCP, and never on mobile.

---

## Consolidated decision table (for `AO_FINAL_FRONTEND_BLUEPRINT.md`)

| capability | recommended | new bytes (gz) | new dependency? | gate |
|---|---|--:|---|---|
| hero type animation | CSS `@keyframes` + `view-timeline` | 0 | no | `@supports` + reduced-motion |
| reveal on scroll | `framer-motion` `whileInView` (AC's `Reveal.tsx`) or CSS | 0 | no | already shipped |
| micro-interactions (card, nav, sheet) | CSS + `@property` + framer-motion `animate` | 0 | no | CSS-only first |
| ambient background | **raw WebGL2 single pass** | 2.9 KB | no | capability + visibility |
| pinned cinematic chapter | ScrollTrigger **or** cut the idea | 44.4 KB | **yes (licence review)** | desktop + `no-preference` |
| smooth scroll | Lenis behind a toggle | 5.3 KB | **yes** | desktop + toggle |
| 3D scene | R3F + drei | 130 KB+ | **yes** | opt-in + lazy + poster |
| page transitions | native View Transitions | 0 | no | feature-detect (react 19.2.6 blocks the npm helpers) |
| long lists | CSS `content-visibility`; TanStack Virtual only if >200 rows | 0 / unmeasured | no / maybe | measure first |
| Lottie/Rive | none | 0 | no | revisit only for an interactive asset |

**Smallest coherent stack that delivers the brief: framer-motion (already installed) + CSS + `@property` +
native View Transitions + one optional raw-WebGL2 background = 2.9 KB of new JS.** Everything premium in the
brief is achievable at that price; the two things that are not (pinned chapters, real 3D) are exactly the two
the PO must choose between.
