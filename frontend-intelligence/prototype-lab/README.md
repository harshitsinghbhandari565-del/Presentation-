# Prototype lab (research-only, isolated)

Ten self-contained animation/3D/scroll experiments used to answer AK's Phase 2 technology questions.
**Nothing here is production code and nothing here is installed into the application.** `package.json` and
`node_modules/` belong to this folder only; the app's manifest is untouched (branch rules).

## Run

```bash
npm install            # three@0.187.0 gsap@3.15.0 lenis@1.3.27 motion@14.9.0 framer-motion@12.43.0 + esbuild, jsdom
node build.mjs         # bundles each src/exNN-*/main.js into dist/, copies html/css, measures real gzip cost
node test.mjs          # headless: 10 experiments × (default, forced reduced-motion) = 20 assertions
python3 -m http.server 8123 --bind 0.0.0.0 --directory dist     # http://localhost:8123/
```

## Layout

```
build.mjs            esbuild driver + vendor-floor measurement (writes dist/_sizes/table.md, measurements.json)
lab.css              AC's real tokens, copied verbatim from their branches (motion/ease/surface/radius)
src/_shared/lab.js   prefs, capability checks, toolbar (R/F/G/T), fps meter, cssReveal helper
src/exNN-*/          index.html + main.js + style.css per experiment
dist/                built static site (gitignored)
.test-build/         IIFE bundles for the jsdom harness (gitignored)
```

## Conventions that make the experiments testable

- each `main.js` exports `boot(root = document.body)` and returns `{ mode, destroy(), ...}`
- the auto-run line is guarded: `if (typeof window !== "undefined" && !window.__AK_TEST__) boot();`
- vendors are **inlined by esbuild**, so the size in `dist/_sizes` is exactly what AC would add
- every experiment has a reduced-motion path and a no-WebGL / `?fallback=1` path
- `?motion=reduce` and `?fallback=1` URL params exist for CI

## Findings

Written up in `../phase2/INTERACTION_EXPERIMENT_LAB.md` (measured numbers, per-experiment verdicts,
and the list of checks AK could not run without a browser).
