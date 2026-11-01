# Implementation Recipes

**AK · 2026-11-01 · Domain I.** Nine recipes, each grounded in a verified library fact and a verified line of *this* repo.
**All code below is AK-authored pseudocode — `[UNVERIFIED-CODE]`.** It is directionally correct (APIs and option names checked against 2026-11-01 official docs), but AC must re-check exact signatures at install time and treat every snippet as a starting point, not a patch.

---

## R1 — Split the client page into server shell + client leaves

**Problem (verified).** `src/app/page.tsx` starts with `"use client"` and fetches `/api/presentations` in `useEffect` `[VERIFIED-FILE]`; `src/db/index.ts` is a `pg` pool over `DATABASE_URL`, and `src/db/schema.ts` is `export {}` `[VERIFIED-FILE]`. So there is **no server-rendered content**: everything (including the animation budget) rides on the client bundle, and SSR/LCP/SEO are structurally capped.

**Shape to aim for** (do not implement blind — coordinate with AC's branch; this is AO decision **D1**):

```tsx
// src/app/page.tsx  (server component, no "use client")
export const dynamic = 'force-dynamic';        // or revalidate, once DB exists
export default async function Page() {
  const docs = await getDocuments();           // src/data/server.ts
  const facets = await getFacets(docs);
  return (
    <>
      <Hero />                                  {/* client leaf: animation only */}
      <FilterBar facets={facets} />             {/* state in URL searchParams */}
      <DocumentGrid docs={docs} />              {/* client leaf: Motion/GSAP + cards */}
    </>
  );
}
```

**Rules that make it safe.** (1) Data fetching in server components, effects/animations in client leaves; (2) filter state lives in `?subject=&course=&semester=&type=&q=` so a server component can read it (`searchParams` prop) and links stay shareable — which also matches our product's "share a document" promise; (3) keep `Suspense` boundaries around the grid so a slow DB never delays the hero (a real INP/LCP risk given `db/index.ts` throws when `DATABASE_URL` is unset `[VERIFIED-FILE]` → wrap in try/catch with the JSON fallback as the "preview" state).
**Payoff.** Playable first paint with zero JS; animation becomes a progressive layer; `next build` output diff becomes a usable performance signal.
**Watch out.** A `force-dynamic` page on Vercel with a cold `pg` pool is slow (TTFB budget ≤ 0.6 s `[VERIFIED-DOC web.dev]`) → needs `revalidate`/`connection()` decisions from AC.

## R2 — Tailwind v4 theme refactor that deletes the `!important`s

**Problem (verified).** `src/app/layout.tsx` contains `if(theme==='dark') root.classList.add('dark')` `[VERIFIED-FILE]` (the class strategy), while dark mode is actually driven by `[data-theme="dark"]` overrides — and `globals.css`'s own header comments admit the `!important`s exist because utilities beat custom classes.

**Fix (2026-correct, from Tailwind v4 theme docs `[VERIFIED-DOC]` + audit §5.2):**

```css
/* 1. raw channels, no colour function, so they can be interpolated/re-themed */
:root { --bg: 250 20% 98%; --surface: 0 0% 100%; --text: 240 12% 14%; --muted: 240 6% 45%; --border: 240 10% 88%; }
[data-theme="dark"] { --bg: 240 12% 7%; --surface: 240 10% 11%; --text: 240 12% 94%; --muted: 240 6% 62%; --border: 240 8% 22%; }

/* 2. PLAIN @theme (NOT `@theme inline` — inline bakes the values and breaks runtime switching) */
@theme {
  --color-bg: var(--bg); --color-surface: var(--surface);
  --color-text: var(--text); --color-muted: var(--muted); --color-border: var(--border);
}
/* 3. keep BOTH hooks so nothing breaks mid-migration */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));
```

**Effects.** `bg-surface text-muted` flip correctly → every `!important` in the dark block dies; projector mode stops fighting utilities; `accent`-per-record styling moves from arbitrary `bg-[${p.accent}]` (which Tailwind can't statically see) to a whitelisted `@source inline('bg-sky-500 bg-amber-500 …')`-style declaration or a `style={{'--accent': …}}` custom property (safer: no purge dependency at all, and it animates).
**Do first, before any animation work:** every animation layered on top of `!important` theming will look broken in dark mode.

## R3 — View Transition: card → detail with content crossfade

```tsx
// shared wrapper (src/components/ui/ViewTransitionPair.tsx)
'use client';
import { ViewTransition } from 'react';
export function DocMorph({ id, children }: { id: string; children: React.ReactNode }) {
  // share="morph" REQUIRES default="none" on the same element, or morphing is disabled
  return <ViewTransition name={`doc-${id}`} share="morph" default="none">{children}</ViewTransition>;
}
// card side: <Link href={`/presentation/${p.id}`}><DocMorph id={p.id}>…cover + title…</DocMorph></Link>
// detail side: same component, same name, same inner order
```
```css
::view-transition-group(*) { animation-duration: 420ms; animation-timing-function: cubic-bezier(.22,1,.36,1); }
::view-transition-image-pair(*) { isolation: auto; }
::view-transition-old(*) { animation: .2s ease-out .12s both vt-fade-out; }
::view-transition-new(*) { animation: .2s ease-out .12s both vt-fade-in; }
@keyframes vt-fade-out { to { opacity: 0 } } @keyframes vt-fade-in { from { opacity: 0 } }
```
**Checklist.** React 19.3 + Next 16.4 (no config) `[VERIFIED-DOC]`; if AC must stay on 19.2.6 → `experimental.viewTransition` in `next.config.mjs` + a shared `transitionType` for multiple transitions `[VERIFIED-DOC 16.2]`; add `::view-transition{pointer-events:none}` only if the documented click-stuck bug appears; never wrap the iframe.

## R4 — Grid relayout on filter change (Flip, without `layout`)

**Why Flip and not Motion `layout` here:** our grid is 12-col spans that *change span* when the set shrinks (`col-span-*` per record `[VERIFIED-FILE]`) — `layoutId` trees with many children are the documented perf caveat, and a GSAP `Flip` batch is cheaper + gives one easing language with the scroll work.

```tsx
'use client';
function useFlipGrid(ref: RefObject<HTMLElement>, deps: unknown[]) {
  useGSAP(() => {
    const ctx = gsap.context(() => {
      const state = Flip.getState('[data-flip-id]', { props: 'transform,opacity' });
      // caller mutates the DOM/React state here, then:
      Flip.from(state, { duration: 0.34, ease: 'power3.out', absolute: true,
        onEnter:  el => gsap.fromTo(el, { opacity: 0, scale: .94 }, { opacity: 1, scale: 1 }),
        onLeave:  el => gsap.to(el, { opacity: 0, scale: .94 }) });
    }, ref);
    return () => ctx.revert();
  }, { scope: ref, deps });
}
```
**Rules.** `data-flip-id={p.id}` on both sides; batch (one `Flip.getState` for the whole grid, never per card); `absolute: true` so reflow doesn't fight the animation; reduced-motion → skip the animation, still apply the state; **no `will-change` left on after** the tween.
**Alternative (0-dep, worse but fine):** Motion `layout` per card with `transition={{duration:0.34, ease:[0.22,1,0.36,1]}}`.

## R5 — Lenis ↔ GSAP ↔ sticky ↔ a11y (the correct wiring)

```tsx
'use client';
import gsap from 'gsap'; import ScrollTrigger from 'gsap/ScrollTrigger';
import { ReactLenis, useLenis } from 'lenis/react';           // exported by lenis/react [VERIFIED-README]
import 'lenis/dist/lenis.css';

export function withSmooth<T>(Comp: ComponentType<T>) {        // capability-gated HOC
  return (props: T) => {
    const enabled = useMediaQuery('(min-width:1024px) and (prefers-reduced-motion: no-preference)');
    if (!enabled) return <Comp {...props} />;
    return <ReactLenis root options={{ lerp: 0.1, wheelMultiplier: 1, syncTouch: false }}><Comp {...props} /></ReactLenis>;
  };
}

function useGsapScrollBridge() {
  const lenis = useLenis();
  useGSAP(() => {
    if (!lenis) return;
    // Choose ONE: autoRaf:true  OR  the ticker bridge. Never both.
    const off = lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf); gsap.ticker.lagSmoothing(0);
    return () => { off(); gsap.ticker.remove(raf); };           // cleanup — see audit §5.4
  }, { dependencies: [lenis] });
}
```
**Musts.** delete `html { scroll-behavior: smooth }` `[VERIFIED-FILE globals.css]` (documented conflict `[VERIFIED-DOC]`); `data-lenis-prevent` on the palette list, the mobile sheet and any `overflow-x` carousel; `lenis.stop()` whenever a modal is open; single root instance; `lenis.resize()` after fonts/images settle (else pin ends drift); no `duration > 2000 ms`.
**Kill switch.** Wrap the whole thing so `enabled === false` renders a plain page — AO can remove Lenis in one commit (that is the "every engine removable" rule).

## R6 — Demand-rendered hero particle field (the safe 3D)

```tsx
'use client';
const HeroField = dynamic(() => import('./HeroField').then(m => m.HeroField), { ssr: false });
// src/components/scene/HeroField.tsx
function HeroField() {
  const supported = useGLSupport();                    // probe once, cache
  if (!supported || usePrefersReducedMotion()) return <HeroPoster />;   // CSS gradient fallback
  return (
    <Canvas frameloop="demand" dpr={[1, 1.5]} gl={{ powerPreference: 'high-performance', antialias: false }}
            camera={{ position: [0, 0, 6], fov: 45 }} aria-hidden="true">
      <Particles count={4000} />                        {/* <instancedMesh>/<points> + custom ShaderMaterial */}
    </Canvas>
  );
}
```
**Perf contract.** `frameloop="demand"` + `invalidate()` on pointer/scroll only; `points`/`instancedMesh`, **one draw call**; `DPR ≤ 1.5` (2 on ≥300 ppi only if the FPS budget holds); no post-processing (skip `@react-three/postprocessing`); `useMemo` geometries, dispose on unmount (`useGSAP`/`useLayoutEffect` cleanup — R3F disposes automatically for its own objects `[VERIFIED-DOC]`); pause when `document.hidden` or the hero scrolls out (`IntersectionObserver`); mobile: count ≤ 1500, DPR ≤ 1.
**Budget.** canvas total ≤ 50 KB (3D) / ≤ 150 KB (any 3D incl. three+R3F) — see `technical-guides/recommended-stack.md` §4; three/R3F alone blow 150 KB, which is exactly why 3D is an **approval-gated** phase, not a starter.
**Honest note for AC.** 4,000 GPU particles ≈ 10⁵–10⁶ CPU-particle equivalents in feel, and the canvas is *decorative*: it must never be the only thing that makes the hero feel premium (Layer-1 CSS from `technology-comparison.md` §6 carries the look).

## R7 — Search & ranking that earns its "premium" label

**Facts (verified).** Today `filterDocuments` matches title/description/tags only, `toLowerCase().includes()` `[VERIFIED-FILE search.ts]`; there is no search API route and no `semester`/`course`/`documentType` field in the record (`src/data/presentations.json` keys are id,title,subject,topic,description,platform,url,presentUrl,embedUrl,backupLinks,tags,pinned,accent `[VERIFIED-FILE]`). The UX sources agree on the shape `[REPORTED S12/S13/S15]`: a visible input on every page, ≥3-char debounce with immediate results, 8–10 desktop / 4–8 mobile suggestions, multi-select facets applied on click (no "Apply"), match highlighting, zero-result recovery, load-more over infinite scroll.

**Recipe (client-side now, server later — same module):**
```ts
// src/lib/search.ts — additive scoring, no deps
const WEIGHTS = { title: 8, topic: 5, subject: 4, tags: 3, description: 2, course: 3, semester: 1 };
score(doc, tokens) = tokens.reduce((s, t) =>
  s + matchStrength(doc, t) /* 1.0 exact prefix | .8 word-start | .6 substring | .3 token-alias */, 0)
  + (doc.pinned ? 2 : 0);                       // pinned = tie-break, never overrides relevance
```
Plus: normalise (`NFD` → strip diacritics, lowercase, collapse spaces), a small synonym/alias map per subject (`"eng"→English`, `"sem4"→"Semester 4"`), highlight via `<mark>` on the *matched span*, `Promise`-debounced 120 ms, and a **zero-result block that offers facet removal** (not just "no results").
**When the DB lands:** move the same scoring to SQL `tsvector` + `websearch_to_tsquery` (Postgres is already wired via `pg` `[VERIFIED-FILE]`) or `supabase/…/rpc` if AO switches provider — keeping field weights identical so the UX doesn't shift under users. Faceted *counts* (`English (12)`) need `GROUP BY` per facet, and **`search-within-facet-values`** (type-to-filter the facet list) is cheap and is a real library-system feature worth copying `[REPORTED S15]`.
**A11y.** `<input role="combobox" aria-expanded aria-controls aria-activedescendant>` for suggestions; results count in `aria-live="polite"`; keyboard: ↑↓ + Enter, Esc closes suggestions but keeps text; no scroll-jacking inside the results list; do not animate results while typing (rule from §6 of interaction-breakdowns).

## R8 — Progressive enhancement + skeleton states (so "premium" survives bad conditions)

| Condition | Detection | Behaviour |
|---|---|---|
| Reduced motion | CSS media query + `usePrefersReducedMotion()` | all animated layers static; **theme, layout, projector still apply** |
| CSS scroll-driven unsupported | `@supports (animation-timeline: view())` | reveals fall back to Motion `whileInView` (or GSAP `batch`) |
| View Transition unsupported | `CSS.supports('view-transition-name: a')` / React falls back to a plain nav | instant route change, no morph |
| WebGL unavailable | context probe + `deviceMemory < 4` heuristic | `HeroPoster` gradient |
| JS disabled / hydration late | server components (R1) | content + links readable; filters fall back to `<form method="get">` + **hidden inputs** (a `<button>`/`<a>` does NOT submit its `name` — that's why the repo's share buttons are `<button>` + `onClick` `[VERIFIED-FILE]`) |
| Slow network | `navigator.connection.effectiveType` | skip reveal stagger; skeletons with exact final `aspect-ratio` (CLS ≤ 0.1 `[VERIFIED-DOC]`) |
| First-load data pending | R1 Suspense | hero + header render from static imports; grid shows 6 card skeletons |

**Skeleton rule for our grid:** card skeleton = the *same* 16:9 media block + 2 text lines + chip row, so nothing shifts when data arrives; `aria-busy="true"` + one `aria-live` announcement when settled; **no shimmer** under reduced motion (static block).

## R9 — Reduced-motion & a11y audit script (run this before any hand-off)

```bash
# 1. every animation-bearing selector must have a reduce branch
grep -n "animation\|transition" src/app/globals.css | wc -l
grep -n "prefers-reduced-motion" src/app/globals.css       # repo: 1 block ✓ [VERIFIED-FILE]
# 2. no raw hex in components (token discipline — audit §5.2)
grep -rn "bg-\[#\|text-\[#" src/components src/app
# 3. JS-driven motion must be gated, not unconditional
grep -rn "useGSAP\|ScrollTrigger.create\|whileInView\|animate=" src | grep -v "reduced"
# 4. canvas/decorative layers are hidden from AT
grep -rn "<Canvas" src | grep -v 'aria-hidden'
# 5. motion-reduce: variants actually used (repo: 1 line only [VERIFIED-FILE])
grep -rn "motion-reduce" src
# 6. focus visibility survives the glass surfaces (contrast of --ring on --surface-elevated)
# 7. keyboard path for the 3 critical flows: search→open→copy backup link
```
**Acceptance for a11y (our realistic bar, per `research/performance-accessibility.md`):** every interactive element reachable and operable by keyboard; visible focus (repo `:focus-visible` already global `[VERIFIED-FILE]`); no animation that can't be disabled; text ≥ 4.5:1 in **both** themes and in projector mode (currently *unmeasured* → AC should sample the tokens); no scroll trapping; `aria-live` for filter results; **nothing** colour-only (the `accent` per record must also carry an icon/label `[VERIFIED-FILE]`). WCAG AA as the target, A as the floor; a full AA certification is not claimed anywhere in this pack.
