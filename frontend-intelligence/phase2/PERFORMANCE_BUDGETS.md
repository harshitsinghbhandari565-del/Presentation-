# Performance budgets — set from measurements, enforceable in CI

Basis: AC's stack (Next 16.4.3 app router, RSC landing, Supabase-backed catalog) + this lab's measured bundles.
Nothing here is a Lighthouse number AK produced — **no browser exists in this sandbox**, so all CWV figures are
budgets to enforce, not observations. Bundle figures marked [MEASURED] were produced here.

## 1. JS budgets per route (gzip, first-party + third-party combined)

| route | initial JS budget | of which animation libs | measured floors to compare against [MEASURED] |
|---|--:|--:|---|
| `/` landing | ≤ 90 KB | 0 KB (framer-motion already counted in the app shell) | framer-motion root 44.9 / mini 29.7; CSS-only hero 0; raw GL background **2.9** |
| `/library` discovery | ≤ 110 KB | 0 | filters/nav = CSS + framer-motion `animate`; card = 4 KB of own code (EX07) |
| `/resources/[slug]` detail | ≤ 80 KB | 0 | embed is user-initiated → its lib cost lands on click, not on load |
| **if Tier 2 approved**: landing with pinned chapter | +44.4 KB, **lazy, landing-only** | | gsap+ScrollTrigger 44.4 [MEASURED] |
| **if Tier 2 approved**: landing with 3D moment | +130–190 KB **after interaction only** | | three named 130.4 / namespace 187.5 [MEASURED] |

Rules that make those numbers hold:
- `import * as THREE` is banned in app code: named imports saved **57.1 KB gz** measured on the same scene.
- No animation library may be imported by a shared component used on the detail route (the classic way a 4 KB card becomes a 50 KB page).
- `next/dynamic(..., { ssr:false })` for anything that touches a canvas or `window.matchMedia` at construction time.
- AC's `@fontsource-variable/*` packages stay self-hosted (already the case [VERIFIED-FILE]); no remote font CSS.

## 2. Core Web Vitals targets (per route, p75 on RUM or Lighthouse CI)

| metric | landing | discovery | detail | why |
|---|---|---|---|---|
| LCP | ≤ 2.0 s | ≤ 2.2 s | ≤ 1.8 s | landing LCP is a text block (server-rendered) — do **not** let a hero animation or image become the LCP element |
| INP | ≤ 180 ms | ≤ 200 ms | ≤ 150 ms | discovery has the busiest handlers (facet toggles, debounce); budget is for the *interaction*, not the fetch |
| CLS | ≤ 0.05 | ≤ 0.08 | ≤ 0.05 | skeletons must match final geometry; see §3 |
| TTFB | ≤ 500 ms | ≤ 600 ms | ≤ 500 ms | landing/discovery are `revalidate=60` cacheable [VERIFIED-FILE]; detail is per-document |
| long tasks during scroll | none > 50 ms | — | — | a 3D/pin section must not run >1 long task in 60 s of scrolling |

Enforcement: Lighthouse CI assertions in AC's existing `ci.yml`-adjacent job (proposal, not a change AK makes), plus the Playwright metrics check in §4.

## 3. Layout-stability rules (CLS is our most likely self-inflicted failure)

1. Every doc card reserves its cover with `aspect-ratio` (EX07 uses 16/9) — never height-from-content on async metadata.
2. Facet counts render as `min-width: 2ch; font-variant-numeric: tabular-nums` so "3" → "128" cannot shift the row.
3. Skeletons use the same padding/radius/border as the real card (`react-content-loader`'s discipline, measured 0 KB in our case).
4. Images of Drive/Docs thumbnails (if ever added) get `width`/`height` or `aspect-ratio` + `loading="lazy"` + `decoding="async"`.
5. Mobile sticky header is `position: sticky` with a reserved height; AC already reserves `scroll-padding-top: 105px` [VERIFIED-FILE] — any header height change must move that value in the same commit.

## 4. Scroll & animation budgets

| budget | value | how measured |
|---|---|---|
| frames while a GL/pinned section is offscreen | **0** | `IntersectionObserver` gate (EX03/EX05/EX06 pattern); assert with a rAF counter in Playwright |
| JS work per scroll tick (non-pinned) | 0 | CSS scroll-driven animations; nothing on `scroll` listener |
| JS work per scroll tick (pinned/GL) | ≤ 0.8 ms | one `uniform1f` + one `render()`; lab `fps` overlay reports long frames |
| style writes per frame | ≤ 1 per element | rAF-batched property writer (EX07) — never per `pointermove` |
| sustained fps, mid-range Android / 4× CPU throttle desktop | ≥ 30 fps landing, ≥ 50 fps elsewhere | **[UNVERIFIED here]** — AC runs `--cpu-throttling-rate=4` with traces |
| `will-change` usage | only on 2–3 elements at a time, removed after | grep rule in review |
| animated layers per viewport | ≤ 1 hero-class + 1 accent | design rule; enforced in review, not CI |
| `backdrop-filter` area | ≤ 20 % of viewport, never on `body` | EX05/EX10 keep it to one panel |

## 5. WebGL-specific budget (the section AC will actually implement from)

| item | limit | rationale / measurement |
|---|---|---|
| library | none for a background effect | 2.9 KB raw GL vs 192 KB via three [MEASURED] |
| geometry | ≤ 1 draw call for a background; ≤ 8 for a scene | EX05 = 3 vertices, 1 call; EX06 = 1 call for 4 000 particles |
| particles | 4 000 desktop / 1 500 low-power | EX06 count selection is `lowPower()`-driven |
| textures | 0 for backgrounds; if a scene needs one, ≤ 1024² and `.ktx`/`.webp` not `.png` | three's default material set is the temptation — measured 57 KB gz of it lands unused if you use MeshBasic |
| DPR | `min(devicePixelRatio, 1.25)` desktop, **1.0** low-power; canvas effects 1.5/1.0 max | `dprCap()` in `src/_shared/lab.js`; halves fragment count vs DPR 3 |
| render mode | demand or visibility-gated, never free-running rAF | all three GL experiments; EX06 skips `render()` entirely when nothing changed |
| context creation | `powerPreference:"low-power"` for backgrounds, `"high-performance"` only for interactive scenes | EX05 vs EX02 |
| failure handling | capability check → `try/catch` construction → CSS fallback **already in the DOM**, not injected on error | lab harness proved `getContext` can throw [VERIFIED, this sandbox] |
| context loss | listen for `webglcontextlost`, then swap to the CSS layer | not implemented in the lab — **[UNVERIFIED]**, AC to add |
| 3D asset size | ≤ 40 KB gz per model after Draco/meshopt; 0 assets preferred (procedural) | `TECHNOLOGY_COMPARISON.md` §9 |
| mobile | no WebGL by default; `?fallback=1` is the mobile reference build | EX10 is the mobile answer |

## 6. Loading & splitting policy

1. Landing: server HTML → CSS animations run → **after LCP**, `requestIdleCallback` mounts the ambient layer (EX05) so the shader never competes with paint.
2. Discovery: facets from `get_catalog_facets()` are server-rendered with the list [VERIFIED-FILE AC's RPC]; no client fetch waterfall. If a Tier-2 search UX (client fuzzy) is added, `import("fuse.js")` on first keystroke, not in the module graph.
3. Detail: the "Open in Drive/Docs" action is a link; **no embed script loads until the user clicks "Preview"** (matches AC's D2: user-initiated embeds).
4. Route prefetch: keep Next's default; do not prefetch `/resources/*` from the grid (it multiplies JSON payload for pages the user may never open).
5. Code-splitting rule of thumb from these measurements: a 3D moment justifies its own chunk; a 4 KB CSS card does not.
6. Images/icons: `lucide-react` is already tree-shaken by named imports — never `import * as Icons`.

## 7. Proposed CI gate (drop-in, AC's call)

```jsonc
// size-limit config AK would suggest for the landing route's animated parts
[
  { "name": "landing animated layer (CSS+FT)", "path": ".next/static/chunks/app/page-*.js", "limit": "90 KB", "gzip": true },
  { "name": "webgl background module",         "path": "src/components/landing/gl-bg/*",     "limit": "6 KB",  "gzip": true }
]
```
```ts
// Playwright: the assertion that "idle = no frames" (this is the one AK most wants AC to run)
test("ambient layer stops when offscreen", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => (window as any).__frames = 0);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1200);
  expect(await page.evaluate(() => (window as any).__frames)).toBeLessThan(6);
});
```
Both are **proposals**: AK has not added config to the repository (branch rules), and `size-limit` is not currently a
devDependency in AC's manifest [VERIFIED-FILE] — no size-limit or bundlewatch entry appeared in the qualified
repository set either, which is recorded in `GITHUB_RESEARCH_GAPS.md`.

## 8. What AC should measure that AK could not

| unknown | why it matters | how to close it |
|---|---|---|
| real fps / jank of EX03–EX06 | the whole "is 3D affordable" question | Lighthouse CI + traces on a mid-range Android and a 4×-throttled desktop |
| GPU memory on 4k particles + 3D stack over 5 min of scrolling | mobile Safari tab-kill risk | `chrome://gpu`, `WEBGL_debug_renderer_info`, or `performance.measureUserAgentSpecificMemory()` |
| actual `backdrop-filter` cost at 60 Hz on AC's hero area | could sink INP on mid phones | trace with paint profiling |
| shader compile time on first frame | a 40 ms compile = one dropped frame at the worst moment | `EXT_disjoint_timer_query_webgl2` or a timestamped `gl.finish()` |
| three.js tree-shaking inside **Next's** bundler (not esbuild) | my 130.4 KB is esbuild-specific; Next may differ by ±15 % | `ANALYZE=true` build in AC's app |
| effect of `content-visibility` on our 24-row grid | could remove the need for a virtualiser | A/B with CLS + INP capture |
