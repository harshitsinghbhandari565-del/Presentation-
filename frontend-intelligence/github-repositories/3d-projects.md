# 3D & WebGL Projects Worth AC's Time

**Verified 2026-11-01 via GitHub API · all metadata `[VERIFIED-API]` unless noted**

Selection rule: *engineering quality + working demo + license clarity + transferable technique.* Awe was not a criterion.

---

## Tier 1 — study these

### `pmndrs/react-three-fiber` + `pmndrs/drei` — the stack itself
★33,417 / ★10,097 · last push 2026-10-21 both · MIT · docs.pmnd.rs
1. **Reusable techniques:** `frameloop="demand"` + `invalidate()`; `<Suspense>` around `useLoader`; drei `<Instances>`/`<Instance>` for hundreds of repeated meshes at one draw call; `<Text>` (troika SDF) for crisp type without font-geometry export; `<Html>` for DOM-in-scene labels; `<PerformanceMonitor>` for automatic quality downscaling; `<Bounds>`/`<CameraControls>` for framing content.
2. **What AC learns specifically for us:** how to keep a scene *off* React's render path (mutate refs in `useFrame`), how to isolate the canvas in its own client boundary, how drei's `<AdaptiveDpr>`/`<Preload all>` behave.
3. **Known limitations:** three.js version coupling (`three >=0.156` for fiber, `>=0.159` for drei `[VERIFIED-REGISTRY]`); React ceiling `>=19 <19.4`; no SSR for the canvas; drei's barrel-import surface needs bundle verification after install; no a11y story for scene content — the DOM must carry the meaning.
4. **Perf considerations:** default `frameloop="always"` burns GPU continuously — the single most important setting for us; text geometry vs SDF; per-frame allocations.

### `FarazzShaikh/THREE-CustomShaderMaterial` ★1,354 · 2025-10-12 · MIT
Inject custom vertex/fragment code into `MeshStandardMaterial`/`Physical` **while keeping lights, fog, shadows, tone-mapping intact**. For a hub that wants "paper that catches the room light but also shimmers", this is strictly better than a raw `ShaderMaterial`. Technique transfers directly to an R3F `<meshPhysicalMaterial>` + CSM combo. *Note the WebGL-only caveat: `onBeforeCompile`-style patching is unsupported on `WebGPURenderer` (`research/threejs.md` §2).*

### `fand/vfx-js` ★1,163 · 2026-10-19 · MIT · amagi.dev/vfx-js
"WebGL effects made easy": attach shaders to DOM elements (`<canvas>`-free DX, GLSL authored like a JSX prop, auto-resize, DPR handling). This is the **closest thing to a legitimate "effect library" for our architecture** because the DOM stays authoritative: text stays selectable, focus stays visible, SSR is unaffected. If AO approves exactly one WebGL effect (card spotlight refraction, hero image distortion), a vfx-js-*style* pattern — small, DOM-attached, no scene graph — is the right shape. Not currently installed by us; MIT, so AC may vendor after verifying `postprocessing`-free deps.

### `pascalorg/editor` ★25,261 · 2026-10-30 · MIT · editor.pascal.app
A production 3D architectural editor with CLI + MCP tools. Value is architectural, not visual: how a large R3F app stays fast (state layering, worker offloading, incremental serialization), and how 3D tooling is exposed to agents — relevant to this team's workflow. Do not copy domain code.

## Tier 2 — specific technique harvest

| Repo | What to take | Caveat |
|---|---|---|
| `srizzon/git-city` ★5,960 · AGPL | **3D as navigation over real records:** camera focus on selection, URL ↔ scene state, "click a building → open the person". This is literally our "click a subject node → filtered results" pattern | AGPL: **reference only**, no code |
| `ITomPoland/portfolio-itom` ★463 · 2026-09-08 · MIT | Recent, real R3F site: scroll-driven camera, lazy scene loading, sectionized scenes in React — closest *whole-site* reference at our scale | Portfolio-shaped, not data-dense |
| `codrops/ScrollBasedLayoutAnimations` ★338 · MIT · 2026-10-31 | Layout-switching on scroll with ScrollTrigger (see `repository-catalog.md` §2.2) | Vanilla → re-derive for React |
| `JosephASG/codrops-cinematic-scroll-animations` ★83 · 2026-03-16 | **CSS-3D (perspective + transforms) cinematic scroll with no WebGL at all.** Exactly our recommended "3D feel without three.js" | No license file → re-implement |
| `martinlaxenaire/curtainsjs` ★1,826 · 2025-04-03 · MIT | The DOM-plane architecture (plane per element, shader per plane, content still in DOM) | Last push 2025 → verify against three r187 if used |
| `countertype/three-text` ★126 · 2026-07-04 · MIT | High-fidelity 3D font rendering + layout; SDF-vs-geometry trade-offs | Niche; only if 3D typography is approved |
| `pmndrs/postprocessing` ★2,927 · 2026-11-01 · **Zlib** | EffectComposer discipline: how effects are chained and what each costs | Zlib ≠ MIT; **not recommended here** |
| `mkkellogg/GaussianSplats3D` ★2,937 | Loading-huge-point-clouds UX: progressive/LOD, splash screen, "camera flight" | irrelevant to a doc hub |
| `davidhckh/portfolio-2025` ★882 · 2026-08-11 | A recent Three.js site with explicit perf notes in README; per-scene disposal | Vue; NOASSERTION license |

## Tier 3 — deliberately excluded, with reasons (so AC doesn't re-add them)

`mlt131220/Astral3D` (★2,508, Vue engine, wrong stack) · `pixiv/three-vrm` · `jeeliz/jeelizFaceFilter` · `tengge1/ShadowEditor` · `heremaps/harp.gl` (★1,318, **Archived**) · `syt123450/giojs` (★1,741, last push **2021-02-18**) · `dragonir/3d` (★2,907, last push **2022-11-15**, pre-r150 APIs, no license) · `PavelDoGreat/WebGL-Fluid-Simulation` (★16,786, last push **2024-11-12**, and a fluid cursor trail is wrong for study UI) · `emilwidlund/alma` (★902, 2024-09-27, no license) · `pmndrs/react-three-next` (★2,883 but last push **2024-06-21** — do not scaffold from a 2024 Next-14-era starter on Next 16) · `img2threejs` (★20,018 — a *generation pipeline*, not a runtime technique; interesting only if we later want 3D from a slide thumbnail) · `wheresryan22/anatomy` (★23,678 — an agent-skill repo for isometric illustrations; **star count is an AI-tooling artifact, not frontend craft**).

**Meta-lesson for AC:** in 2026 the 3D GitHub landscape is polluted with agent-tooling repos that accumulate 20k stars in months. Rank by *last push + whether a live demo runs + whether the license file exists*, never by stars.

## 4. What AC should produce after reading these

A single `HeroField` scene (≤250 LOC) that satisfies: `frameloop="demand"`, DPR ≤1.75, instanced points, `uScroll`/`uPointer` uniforms driven from one shared Motion `useScroll` value, `prefers-reduced-motion` → static render, WebGL2 absent → the existing CSS gradient, and no dependency on `postprocessing`. That's the whole 3D brief for this project.
