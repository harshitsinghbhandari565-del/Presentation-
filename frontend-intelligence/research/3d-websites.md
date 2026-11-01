# 3D Web Experiences — what is real, what is practical

**AK · 2026-11-01 · Domain A**

## 1. The landscape, verified

| Evidence | Finding |
|---|---|
| `mrdoob/three.js` ★117,352, last push 2026-11-01, MIT `[VERIFIED-API]` | The substrate; extremely healthy |
| `pmndrs/react-three-fiber` ★33,417 `[VERIFIED-API]` | React integration is mature and active |
| `pascalorg/editor` ★25,261, last push 2026-10-30, MIT, `editor.pascal.app` `[VERIFIED-API]` | A **3D architectural editor in the browser**, React-Three-Fiber-based, with CLI + MCP tooling. Proof that serious 3D *applications* (not just scenes) ship on this stack |
| `img2threejs/img2threejs` ★20,018, Apache-2.0, pushed 2026-10-28, `img2threejs.io` `[VERIFIED-API]` | "Rebuild the object in a reference image as code-only, procedural, quality-gated" generation. Relevant as a **content pipeline** idea (generate 3D from a slide screenshot) rather than a runtime dependency |
| `srizzon/git-city` ★5,960, **AGPL-3.0**, pushed 2026-10-26 `[VERIFIED-API]` | "Your GitHub profile as a 3D pixel-art building in an interactive city" — the single best **pattern** reference for "3D as a navigation metaphor over real data" (and a license warning: AGPL, do not vendor) |
| `mkkellogg/GaussianSplats3D` ★2,937 `[VERIFIED-API]` | Capture-based 3D; irrelevant to us without captured data |
| `mlt131220/Astral3D` ★2,508, pushed 2026-10-31 `[VERIFIED-API]` | Vue3-based 3D engine + editor with particle system and plugin system — ecosystem health signal, not a fit (Vue) |
| `pixiv/three-vrm` ★2,251, pushed 2026-10-22 `[VERIFIED-API]` | Avatars; not our domain |
| `dragonir/3d` ★2,907, last push **2022-11-15** `[VERIFIED-API]` | Large Chinese three.js demo collection (Bing Dwen Dwen, digital city, car showcase…). **Stale** — good for ideas, bad for copy-paste (its APIs predate r150) |

## 2. What 2026's 3D work actually consists of (synthesis from the sources above + `[REPORTED S8/S10]`)

1. **One object, well lit** beats a scene full of objects. The winning Awwwards-class 3D builds are a single hero artifact + typography, with post-processing kept off the critical path.
2. **Scroll is the timeline.** Camera or object transform is driven by a normalized scroll value (Codrops 2026 set: camera-path galleries, image tubes, scroll-reactive galleries `[REPORTED S8]`).
3. **Velocity is an input**, not just position (distortion amount, particle energy keyed to scroll speed).
4. **DOM + WebGL hybrids, not WebGL pages.** Text stays in the DOM (accessible, selectable, indexable); the canvas paints around it — the curtains.js architecture idea.
5. **Shader-driven flat work is where most of the "premium" is** — grain, caustics, iridescent gradients, blurred mesh fields — none of which needs a scene graph at all.
6. **Fallbacks are designed, not improvised**: a static poster frame that is itself a good-looking image.
7. **Budget discipline**: real-time 3D sites that win Developer Awards are the ones with low transfer and stable frame rate, not the ones with the most triangles `[REPORTED S10]`.

## 3. Applicability matrix for Harshit Presentation Hub

Given the audited reality (1 document, client-side page, `.glass-card` system, projector mode, student Android/iOS mix, no 3D assets `[VERIFIED-FILE]`):

| 3D idea | Effect | Complexity | Mobile risk | Fits our data? | Verdict |
|---|---|---|---|---|---|
| Pointer-reactive **particle field** in the ambient layer | Futuristic depth, "alive" | Low–Mid | Medium (frame budget) | Yes — pure atmosphere | ✅ **the one to build** (Phase 4) |
| **Text → particles** hero ("Knowledge", subject name dissolving/reforming) | Signature moment | Mid | Medium | Yes, uses real titles | ✅ high-value variant of the above |
| **3D card tilt** (CSS `rotateX/Y` + `translateZ` layers) | Depth on hover | **Trivial, zero deps** | Low | Yes | ✅ **do this in Phase 1** — 80% of the perceived 3D for 0 KB |
| 3D "slide deck" object, scroll-flips through featured docs | Cinematic | High | High | Needs ≥5 featured docs | ⏸ revisit at n≥10 |
| Subject **constellation/graph** navigation in 3D | Discoverability | High (labels, picking, a11y) | High | ❌ one subject today | ❌ blocked on data |
| WebGL-distorted document thumbnails | Texture | Mid | Medium | Needs thumbnails we don't store | ⏸ needs an asset decision |
| Avatars / splats / physics / configurator | — | High | High | No | ❌ |
| `MeshTransmissionMaterial` glass in 3D | Match to `.glass-card` | Mid | **Very high** (buffer RTs) | Redundant with real CSS glass | ❌ |

## 4. Recommended 3D scope (if AO approves Phase 4)

- **One** R3F `<Canvas>`, `fixed inset-0 z-0`, `pointer-events-none`, `aria-hidden`, `frameloop="demand"`, `dpr={[1, 1.75]}`, `ssr: false`, behind a WebGL2 + reduced-motion + device-memory gate.
- Contents: 2,000–4,000 points (mobile 800) from a **canvas-sampled text mask** (the hub wordmark or current subject), drifting with a `uTime` uniform, plus a lerped pointer parallax on the camera (±0.35 units max).
- Palette comes from existing tokens (`#6366f1`, `#34d399`) so dark/light stay coherent; **in light mode reduce to a faint ink-on-paper dot field or disable** — glowing particles on `#f8fafc` look wrong. `[AK-RECOMMENDATION]`
- Everything above the fold (title, search, featured card) renders **before** the canvas mounts; the canvas is progressive decoration.
- Kill the canvas on `/presentation/[id]` and in projector mode (it can only hurt legibility while presenting `[VERIFIED-FILE]` — `page.tsx` and the focus page share the layout-level `AmbientBackground`).

## 5. Decision

**No 3D in the first pass.** Ship CSS-3D tilt + View Transitions + scroll reveals first; measure; then add the single ambient particle scene as a discrete, revertible experiment. This is the difference between "premium" and "novelty with a regression risk", and it keeps the playbook's performance budgets intact.
