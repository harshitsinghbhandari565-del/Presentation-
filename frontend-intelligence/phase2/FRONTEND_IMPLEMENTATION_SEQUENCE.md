# Frontend implementation sequence — Phase 2 (motion, 3D, discovery polish)

Sequenced so that **each step is independently shippable and independently reversible**, and the cheap wins come
first. Sizes are the lab's [MEASURED] numbers. "Gate" = the automated check that closes the step. Nothing here
changes AC's architecture, schema, RLS, or manifest without AO approval; step 1 does not touch `package.json` at all.

| # | step | files AC touches | new deps | size | gate (definition of done) |
|--:|---|---|---|--:|---|
| 1 | **Motion tokens + one easing authority.** Copy `--motion-*`, `--ease-*`, `--move-*` into the product `@theme`; point `Reveal.tsx`'s inline `ease`/`duration` at them; ban `transition: all` | `globals.css`, `Reveal.tsx`, `button.css`-equivalents | none | 0 | axe suite green; Playwright: computed `transition-duration` equals token on 3 sampled components; `grep -rn "transition: all" src/` → 0 |
| 2 | **Mini import + LazyMotion.** Switch animated client components to `framer-motion/mini` + `m.*` + `LazyMotion features={domAnimation}` | component imports, one provider | none (entry change) | **−15.2 KB gz** | `ANALYZE=true` build diff shows the drop; all motion tests pass |
| 3 | **Card system (EX07).** Five-layer `.doc-card` with `@property` spotlight/lift; keep AC's `DocumentCard` semantics (server component, `tabIndex={-1} aria-hidden` cover link, `displayHost`) | `components/documents/*`, `globals.css` | none | +4 KB | Playwright: hover state changes only `transform/opacity/box-shadow` (trace has no layout); reduced-motion pass shows ring+lift, no tilt; 0 axe violations |
| 4 | **Discovery correctness.** Facet collapse when a facet is empty (e.g. `semester: null` for all legacy rows), applied-chip row with labelled removes, `aria-live` count, skeletons matching geometry, sort = segmented control | `LibraryControls`, results page, `types` untouched | none | 0 | Playwright: filtering never scrolls the viewport (`window.scrollY` unchanged); count text matches `get_catalog_facets()`; empty-facet case has no empty list |
| 5 | **Search ranking (the highest-value change).** `to_tsvector` → weighted `tsvector` + `websearch_to_tsquery` + `ts_rank`; expose `relevance` meaningfully | `lib/search.ts`, migration adding a generated column + GIN, `api/search/route.ts` | none | 0 | before/after relevance eval on 20 real queries (AK has none of AC's corpus — AC picks the set); no regression on `compatibility` mode tests |
| 6 | **Mobile sheet + nav pill (EX08/EX10).** Sheet for filters, measured pill for subject nav, 44 px targets, `content-visibility` on result rows | new components + landing rail | none | +6 KB | keyboard: Tab enters/exits exactly once; Escape closes and restores focus; 320 px reflow screenshot; tap-target audit ≥ 44 px |
| 7 | **Landing assembly (EX01 + EX09).** Hero line reveal, chapter index, VT theme flip, `view-transition-name` on card→detail | landing sections | none | +2 KB | LCP element is hero text (`performance-get-element` assertion); VT guarded by `typeof document.startViewTransition === "function"`; no jank: 0 long tasks during a scripted 3 s scroll |
| 8 | **Ambient layer, opt-in (EX05).** One file, dynamic import, `requestIdleCallback` after LCP, `IntersectionObserver` pause, `?fallback=1` path, DPR ≤ 1.25 (0.75 low-power) | `components/landing/gl-bg/*` | none | +2.9 KB | Playwright: **0 frames while offscreen**; `destroy()` on unmount → `renderer`/context released; shader-compile failure falls back (force by passing a bad source in a test) |
| 9 | **Storytelling upgrade, if PO asks for it (EX04).** Pinned 3-chapter section, `matchMedia` ≥ 900 px, `gsap.context()` teardown | landing chapter component | **`gsap` + `ScrollTrigger`** | +44.4 KB | **legal sign-off on the "no charge" licence first**; pin releases focus correctly; `Tab` traverses without trapping; mobile uses the stacked variant with identical DOM |
| 10 | **Smooth scroll, behind a toggle (EX09's Lenis half).** Desktop-only, `no-preference`, `lenis.destroy()` on unmount; **remove `html{scroll-behavior:smooth}` in the same PR** | scroll provider + `globals.css` | `lenis` | +5.3 KB | find-in-page and pull-to-refresh still work (manual + a Playwright `page.find` check where available); toggle state persists; anchor jumps land correctly with `scroll-padding-top` |
| 11 | **3D moment, only if PO chooses it.** R3F + drei, one scene, interaction-gated, poster/CSS-3D first, mobile excluded, `frameloop="demand"` | new lazy chunk | `three`, `@react-three/fiber`, `@react-three/drei` | +130 KB → | 4× CPU-throttled ≥ 30 fps during the scene; 0 bytes fetched before interaction on mobile; DOM twin readable by AT; `renderer.info.memory` back to 0 after unmount |
| 12 | **CI performance ratchet.** `size-limit` entries for the landing/ambient chunks + a frames-while-idle assertion + Lighthouse CI thresholds | CI config | dev-only | 0 | a deliberate +20 KB on the landing route **fails CI**; that is the whole test |

**Deliberately excluded from this sequence:** Lottie/Rive (no interactive asset commissioned), virtualisation
(12-item pages), a carousel library (`scroll-snap` is enough), a UI kit or state library, any change to
`getCatalogMode()`/RLS/`safeExternalUrl` semantics.

## Ordering rationale in one paragraph
Steps 1–4 are free: they cost no bytes, no dependencies and no architecture debate, and they fix the two things a
user actually feels first (inconsistent motion, unstable/disinforming discovery UI). Step 5 is the only change with a
chance of being called "the product got better" — it is a search-quality fix, not a visual one, and it is where
Phase 2's discovery work pointed hardest [VERIFIED-FILE]. Steps 6–8 buy 90 % of the premium impression for
+8 KB. Steps 9–11 are PO taste decisions with real prices attached, each landable alone and revertible alone. Step 12
makes the whole thing stay true after launch, which is the only part of this pack that outlives the release.

## Per-step test detail
Every gate above is written so AC can paste it into the existing Playwright project (`playwright.config.ts`,
`@axe-core/playwright` [VERIFIED-FILE]). `ACCESSIBILITY_GUIDELINES.md` §7 has the reusable test bodies;
`PERFORMANCE_BUDGETS.md` §7 has the size-limit + frames-while-idle snippets. The lab's `boot(root) → {mode, destroy()}`
contract is what makes steps 3, 7, 8, 9, 11 automatable without a human watching a screen.
