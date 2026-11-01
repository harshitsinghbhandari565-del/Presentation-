# React Three Fiber & drei — practical assessment for this project

**AK · 2026-11-01 · Domain A**

## 1. Verified facts

| Item | Value | Source |
|---|---|---|
| `@react-three/fiber` | **9.8.2**, 2026-10-14, MIT, **peer `react >=19 <19.4`**, `three >=0.156`, deps `zustand, its-fine, buffer, base64-js, scheduler, @types/webxr` | `[VERIFIED-REGISTRY]` |
| `@react-three/drei` | **10.7.9**, 2026-09-25, MIT, peers `react ^19`, `fiber ^9.0.0`, `three >=0.159`; deps incl. `maath`, `meshline`, `stats-gl`, `camera-controls`, `hls.js` | `[VERIFIED-REGISTRY]` |
| `@react-three/postprocessing` | 3.2.2, 2026-10-21, MIT, deps `n8ao, maath` | `[VERIFIED-REGISTRY]` |
| Repo | `pmndrs/react-three-fiber` ★**33,417**, last push 2026-10-21, MIT, docs `docs.pmnd.rs/react-three-fiber` | `[VERIFIED-API]` |
| drei repo | `pmndrs/drei` ★**10,097**, last push 2026-10-21, MIT | `[VERIFIED-API]` |
| Next.js starter | `pmndrs/react-three-next` ★2,883, MIT, **last push 2024-06-21** | `[VERIFIED-API]` |

### Read the two rows above carefully

- **R3F v9 targets React 19 and caps at `<19.4`.** The project is on React **19.2.6** `[VERIFIED-FILE]` → compatible *today*. If AO later bumps React to 19.4+/20, R3F must wait for a matching major. This is the single most likely "why did the build break" scenario.
- **`react-three-next` is 2 years stale** (Next 14 era) `[VERIFIED-API]`. Do **not** scaffold from it. Its value is pattern reference only; on Next 16 with App Router + RSC we do the same thing natively (`"use client"` + `next/dynamic`).

## 2. R3F vs raw three.js — for a React team

| Dimension | Verdict for us |
|---|---|
| Performance | **Tie.** R3F is a thin reconciler over three.js; the render loop, draw calls and GL are identical. "R3F is slower" is a myth `[REPORTED S5]`. Its real advantage: **automatic disposal** on unmount — the most common three.js leak, eliminated |
| Ergonomics | **R3F wins hard.** `<mesh><boxGeometry/><meshStandardMaterial/></mesh>` + hooks + props map 1:1 to the imperative API |
| Suspense/preloading | R3F integrates with React Suspense (`useLoader` caches by URL); raw three needs hand-rolled loaders + loading state |
| Re-renders | R3F isolates the canvas from React state changes (no reconciliation per frame); **`useFrame` must mutate refs, never setState** `[REPORTED S5]` |
| Pointer events on meshes | R3F raycasting is built in — for a "pick a document in 3D space" idea, that alone justifies it |
| Bundle | Same three.js core either way; R3F adds ~15 KB (zustand/its-fine/scheduler) `[VERIFIED-REGISTRY deps]` |
| Debug | drei `<Stats>`/`r3f-perf` vs. manual |
| Ecosystem | pmndrs (drei, uikit, xr, camera-controls) is React-first and active `[VERIFIED-API]` |

**`[AK-RECOMMENDATION]` Use R3F, not raw three.js, if we do 3D at all.** This is a React codebase with React 19 already; writing a hand-managed imperative scene inside a Next 16 App Router project buys nothing.

## 3. The drei surface that is actually useful (not the whole catalogue)

drei is ~200 helpers; **importing the barrel is the classic R3F bundle mistake** — tree-shaking usually handles it with ESM, but audit after installing.

| Helper | Use here | Cost |
|---|---|---|
| `<Text>` (troika SDF) | Hero wordmark / floating labels | ~adds `troika-three-text` (0.52.5 `[VERIFIED-REGISTRY]`) |
| `<Float>` | Ambient drift on the hero object | trivial |
| `<Environment>` | Reflections | ⚠️ **presets fetch remote HDRIs** → self-host `.hdr` + `@monogrid/gainmap-js`, or skip and use 2 lights |
| `<ContactShadows>` | Grounding the hero object | one extra render pass — acceptable, cap resolution |
| `<useGLTF>` / `<Loader>` | only if a model is ever commissioned | requires an asset pipeline we don't have |
| `<Html>` | Overlay DOM inside 3D scene | handy for labels; **breaks if used for real content** (a11y) |
| `<OrbitControls>` (`camera-controls`) | Model viewer | ❌ not for an ambient hero; steals wheel/scroll |
| `<ScrollControls>`, `<Scroll html>` | Scroll-driven 3D inside canvas | ⚠️ hijacks scrolling; incompatible with an ordinary document page |
| `<MeshTransmissionMaterial>` | Glassmorphism *in 3D* | ❌ expensive (buffer render targets per frame). Do not |
| `<Instances>`/`<Instance>` | 500 subject tiles, particle field | ✅ the right tool at scale |
| `<Stats>`/`<PerformanceMonitor>` | dev diagnostics | ✅ dev-only, guard with `NODE_ENV` |
| `<Preload all>` | warm assets | ✅ |

## 4. Integration rules for Next 16 + this codebase

```tsx
// components/three/HeroField.tsx  → loaded lazily, client-only
const HeroField = dynamic(() => import("./HeroFieldImpl"), { ssr: false, loading: () => <StaticPoster /> });

<div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
  <Canvas dpr={[1, 1.75]} frameloop="demand" gl={{ antialias: false, powerPreference: "high-performance", alpha: true }}
          camera={{ position: [0, 0, 6], fov: 42 }}>
    <HeroField />
  </Canvas>
</div>
```

1. **`ssr: false`.** No meaningful SSR of a canvas; WebGL context creation on the server throws. (R3F v9 + App Router: keep the canvas inside one `"use client"` boundary.)
2. **Wrap in a capability gate** — feature-detect WebGL2 (`document.createElement("canvas").getContext("webgl2")`) **and** `navigator.hardwareConcurrency`/`deviceMemory`/`matchMedia("(prefers-reduced-motion)")`; render the existing CSS gradient poster otherwise. The current `AmbientBackground` is the fallback — that's the whole point of keeping it.
3. **Never put content the user needs inside the canvas.** Text, links, filters, counts = DOM. `[AK-RECOMMENDATION]`
4. **`frameloop="demand"` + `invalidate()`** when idle; animate at 30 fps for ambient.
5. **DPR ceiling** `dpr={[1, 1.75]}`.
6. **Context loss:** listen for `webglcontextlost`, dispose, fall back to poster.
7. **TypeScript strict mode** (`strict: true` `[VERIFIED-FILE]`) + `@types/three` must match `three`'s minor exactly.
8. **Tailwind v4 + Canvas:** the canvas needs an explicit sized parent (our `fixed inset-0` satisfies it); R3F measures via ResizeObserver — avoid `backdrop-filter` ancestors around a canvas (they force extra compositing).
9. **`next/legacy-image`?** N/A. But note: adding three.js to the *only* page today means it lands in `page.tsx`'s client chunk `[VERIFIED-FILE]` — the server-component split is a prerequisite.

## 5. Cost/benefit for a document-discovery site

| Opportunity | Value | Cost | Verdict |
|---|---|---|---|
| Hero ambient particle field reacting to pointer | Sets the tone in <1s, no content risk | 300–900 lines, 1 scene | ✅ if Phase 4 is approved |
| Subject constellation / 3D graph of courses | Novel, **but with 1 subject today it is one dot** | high (labels, picking, a11y) | ❌ blocked on data volume (see audit §3) |
| 3D page-flip on the document card | Cute, low value, high jank risk near text | medium | ❌ |
| 3D "deck" of slides for the featured card | Attractive, but the slides live in Google Slides | needs a real preview source | 💡 revisit if `embedUrl` previews land |
| 3D typography for section numbers | Cheap with drei `<Text>` | low | ✅ optional garnish |

## 6. Alternatives considered

- **ogl** (`oframe/ogl` ★4,744, last push 2025-04-13, npm 1.0.11 from **2025-01-27**, repo license `NONE`) `[VERIFIED-API/REGISTRY]` — 4 KB vs three's ~150 KB, ideal for a single shader plane. **Rejected**: no React integration, maintenance cadence has slowed, and its license ambiguity makes vendoring awkward.
- **curtains.js** (`martinlaxenaire/curtainsjs` ★1,826, MIT, last push **2025-04-03**) `[VERIFIED-API]` — turns DOM elements into WebGL planes; the *perfect* conceptual fit for "texture the card, keep the DOM accessible". Rejected as a dependency for the same maintenance reason, but **its architecture is the model for the one WebGL effect worth building**: DOM stays authoritative, WebGL paints on top.
- **`@react-three/uikit`** (1.0.78, custom license `[VERIFIED-REGISTRY]`) — DOM-like layout inside 3D (Yoga). Not needed; we do the inverse (keep DOM).
- **CSS 3D** (`transform-style: preserve-3d`, `perspective`, `rotateY`) — 150× cheaper, no dependency, works everywhere, and delivers ~70% of the "3D cards" perceived value. **This is the correct default answer for everything except a genuine particle/mesh scene.** See `design-system/interaction-principles.md`.

## 7. If AC builds 3D, the 8 acceptance criteria

1. Page renders fully and correctly with JS disabled.
2. Canvas never contains the only copy of any information.
3. Idle GPU ≈ 0 (`frameloop="demand"` verified in devtools Performance).
4. Mobile: < 1.5 MB JS total transfer, and a visible quality drop path (`<PerformanceMonitor>`-driven).
5. Reduced-motion + `data-theme="light"` + projector mode all verified.
6. WebGL context loss recovers to poster, not to a black rectangle.
7. No `OrbitControls` on any non-modal scene (never trap the page scroll).
8. `npm run typecheck` clean with `@types/three` pinned to the three minor.
