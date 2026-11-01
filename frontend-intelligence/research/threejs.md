# Three.js (core) — state of the art 2026

**AK · 2026-11-01 · Domain A**

## 1. Version reality `[VERIFIED-REGISTRY]` `[VERIFIED-API]`

| Item | Value |
|---|---|
| `three` latest | **0.187.0**, published **2026-10-30** (one day before this research) |
| Release cadence | Monthly-ish `0.N.0`; r182 Dec 2025 → r186 Sep 2026 → r187 Oct 2026 `[REPORTED S5]` |
| Repo | `mrdoob/three.js` ★117,352, forks 36,872, last push **2026-11-01**, MIT — the healthiest project in this entire catalog |
| Import map | `exports`: `.` , `./tsl`, `./webgpu`, `./addons`, `./src/*`, `./examples/jsm/*`, `./examples/fonts/*` |
| Types | `@types/three@0.187.0` (2026-10-30) — pin to the *exact* three minor |
| License | MIT; examples/addons carry their own headers; **`examples/fonts` no longer ships in the npm package since r185** `[REPORTED S5]` → don't plan on `FontLoader` JSON fonts from the package |

## 2. The 2026 renderer decision (this is the real research finding)

Three.js now ships **two renderers from one scene graph**:

| | `WebGLRenderer` | `WebGPURenderer` (`three/webgpu`) |
|---|---|---|
| Maturity | Production default; the official manual still calls it **"the recommended choice for pure WebGL 2 applications"**, describing WebGPURenderer as still maturing with possible missing features `[REPORTED S5]` | Production-viable since **r171** (2024-11-29), no build config needed |
| Fallback | — | **Automatic WebGL 2 fallback** — one codebase, all users |
| Shaders | GLSL `ShaderMaterial` | **TSL** (Three Shading Language) transpiled to WGSL *or* GLSL. **`ShaderMaterial`, `RawShaderMaterial` and `onBeforeCompile` are not supported on the WebGPU path** `[REPORTED S5]` |
| Compute | ❌ | ✅ (large particle systems, GPU culling) |
| Ecosystem | `pmndrs/postprocessing`, `troika-three-text`, drei, `@react-three/*` are built WebGL-first | needs TSL replacements (r183 renamed `PostProcessing` → `RenderPipeline`) |
| Browser | Universal in evergreen | Chrome/Edge 113+, Chrome Android 12+, **Safari 26**, Firefox Windows/Apple Silicon; Linux partial, Firefox-Android behind flag `[REPORTED S5]` |

Migration cost is a **porting** job, not a rewrite: the renderer swap is one import; the work is in custom GLSL and post-processing `[REPORTED S5]`.

Notable API churn AC will hit if he reads pre-2026 snippets `[REPORTED S5]`:
- r181: `renderAsync()/computeAsync()` deprecated → use `render()`/`compute()` + `setAnimationLoop()` or `await renderer.init()`
- r182: `colorBufferType` → `outputBufferType`
- r183: `PostProcessing` → **`RenderPipeline`**; `Clock` deprecated → **`Timer`**; `WebGLCubeRenderTarget` incompatible → `CubeRenderTarget`
- r184: TSL/node materials usable on `WebGLRenderer` via a compatibility layer; FSR1/TAAU upscaling nodes
- r185: premultiplied alpha changed; `positionLocal` in a `positionNode` no longer includes skinning → use `positionGeometry`
- r186: `PCFSoftShadowMap` removed (→ `PCFShadowMap` is now soft); `viewportResolution` TSL export → `screenSize`; minified builds removed, CJS deprecated; `Source` → `TextureSource`; custom `Object3D` subclasses must call `super.dispose()`

### Decision for Harshit Presentation Hub

`[AK-RECOMMENDATION]` **`WebGLRenderer`, via React Three Fiber, with `frameloop="demand"`.** Rationale:
1. The three candidate effects (mouse-reactive field, depth card tilt, scroll-morph) are all trivial on WebGL; none needs compute.
2. drei + troika (3D text) are the parts we actually want, and they are WebGL-first.
3. It keeps one renderer to QA across Android WebView/iOS WebKit — the audience's real devices.
4. **Revisit WebGPU only** if we later add particle counts in the 100k+ or GPU-driven galleries. If that day comes, `import { WebGPURenderer } from "three/webgpu"` with `renderer.init()` + `setAnimationLoop`, and budget a TSL port of every custom shader.

## 3. Techniques worth stealing (with our application)

| Technique | Three.js API | Our use | Verdict |
|---|---|---|---|
| **Instancing** | `InstancedMesh`, `BatchedMesh` (r184 removed its multi-draw path) | Grid of 200 document "chips" as one draw call, or a starfield of subject nodes | ✅ the one performance tool that matters at scale |
| **Point clouds** | `Points` + `PointsMaterial`/custom shader | Hero ambient field; **morphing between shapes on scroll** | ✅ best cost/beauty ratio; cap at ~2–5k points on mobile `[REPORTED S5]` |
| **Custom material without breaking lighting** | `MeshPhysicalNodeMaterial` + TSL, or `onBeforeCompile` (WebGL-only) | "Paper edge" iridescence, subtle fresnel on the hero object | ⚠️ prefer a `ShaderMaterial` on a *decorative* mesh so nothing needs porting later |
| **Post-processing bloom** | `postprocessing` (Zlib) / `n8ao` (via `@react-three/postprocessing` 3.2.2) | Glow on active card | ❌ **rejected**: extra full-screen pass on mobile, on a text-heavy UI the aesthetic gain is negative |
| **3D text** | drei `<Text>` → `troika-three-text@0.52.5` (2026-07-24, MIT) `[VERIFIED-REGISTRY]` | Hero wordmark, floating section numbers | ✅ with `sdfGlyphSize`, `fontSize`, no `charSet` bloat; SDF text is cheap and crisp |
| **Text as particles** | Sample canvas → positions (classic "text particles") | **The** hero concept: the word "Library"/subject dissolving into a field | ✅ do this; ~60 lines, zero deps, huge impact |
| **Scroll → 3D** | camera z / object rotation driven by a normalized scroll value | Cinematic intro | ⚠️ only if it never delays the search box |
| **Environment/lighting** | drei `<Environment>`, `<ContactShadows>`, `@monogrid/gainmap-js` for HDR | Hero object realism | ⚠️ `<Environment preset>` pulls a remote HDRI → **self-host or skip**; a 2-light rig is enough for stylized flat objects |
| **KTX2/Draco glTF** | `KTX2Loader`, `DRACOLoader` | Any real 3D model | ❌ we have no 3D asset pipeline; do not add one for decoration |
| **Gaussian splatting** | `mkkellogg/GaussianSplats3D` ★2,937 (MIT, last push 2025-10-19) `[VERIFIED-API]` | Scanning real lecture halls | ❌ no data, heavy, novelty |
| **Physics** | `@react-three/rapier` / `pmndrs/use-cannon` (★2,971 but **last push 2024-02-25** `[VERIFIED-API]`) | "Cards falling into a tray" | ❌ delightful, indefensible on bundle + INP |

## 4. Performance notes specific to a text/document UI

- **Draw calls before triangles.** A student phone is fill-rate and driver bound, not vertex bound. One `InstancedMesh` of 500 > 500 meshes.
- **DPR cap 1.5–2** (`setPixelRatio(Math.min(devicePixelRatio, 2))`); 3× Retina phones with a 3× canvas is the #1 "premium site is slow" cause.
- **`frameloop="demand"` + `invalidate()`** for anything not actively animating → idle GPU ≈ 0, no thermal throttle mid-lecture `[REPORTED S5]`.
- **Never allocate in the frame loop** (`new Vector3()` per frame → GC stutter) `[REPORTED S5]`.
- **Dispose.** Three's own advice: `geometry.dispose()`, `material.dispose()`, `texture.dispose()` on unmount; `useLoader`/`Loader` caches by URL, so **clone before scene-specific mutation** and never dispose a shared cache entry `[REPORTED S5]`.
- **`powerPreference: "high-performance"`** on the canvas context, and `antialias: devicePixelRatio < 2` (MSAA + high DPR = waste).
- **Two canvases beat one big one** when one is ambient: put the ambient field in a `fixed` pointer-events-none layer at `z-0` (mirroring the existing `AmbientBackground` structure `[VERIFIED-FILE]`) so it never re-renders on React state change.
- **Cap the frame rate for ambient scenes** (render every 2nd/3rd frame) — a slowly drifting point field does not need 60 Hz, and this is where the battery is saved.
- **Context loss** happens on mobile under memory pressure: handle `webglcontextlost`, dispose, and fall back to the static gradient poster.

## 5. What three.js does **not** solve for us

Text layout, document rendering (Slides/Dropbox are iframes/links), accessibility of content, filtering. Three.js is for *atmosphere and one object*. Every piece of information a student needs must exist in the DOM. `[AK-RECOMMENDATION]`

## 6. References

- `threejs.org/docs` (r187), `threejs.org/examples` (TSL/WebGPU tabs), `threejs.org/manual` `[VERIFIED-API: homepage/metadata]`
- `utsubo.com/blog/threejs-best-practices-100-tips`, `.../threejs-2026-what-changed`, `.../webgpu-threejs-migration-guide` (r182–r186 changelog detail) `[REPORTED S5]`
- `zko.world/blog/webgpu-threejs-production-ready-quick-take`, `hontran.dev/blog/three-js-performance-optimization` `[REPORTED S5]`
- Catalog of runnable repos: `github-repositories/3d-projects.md`
