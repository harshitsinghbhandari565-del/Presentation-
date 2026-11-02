// AK prototype-lab build + demo index generator. Research-only: nothing here is imported by the application.
// esbuild bundles each experiment (three/gsap/lenis/motion come from the LAB's own node_modules) and measures
// real bytes/gzip/brotli for every vendor floor — those numbers feed PERFORMANCE_BUDGETS.md and replace Phase 1 estimates.
import { build } from "esbuild";
import { readdirSync, mkdirSync, copyFileSync, existsSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { gzipSync, brotliCompressSync } from "node:zlib";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");
const OUT = join(ROOT, "dist");
mkdirSync(OUT, { recursive: true });
const w = (p, s) => { mkdirSync(join(p, ".."), { recursive: true }); writeFileSync(p, s); };
const stat = (p) => statSync(p).size;

const entries = readdirSync(SRC, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name).sort();
const built = [];

for (const name of entries) {
  const dir = join(SRC, name);
  const entryJs = join(dir, "main.js");
  if (!existsSync(entryJs)) { console.log("skip (no main.js):", name); continue; }
  const outDir = join(OUT, name);
  mkdirSync(outDir, { recursive: true });
  let res;
  try {
    res = await build({
      entryPoints: [entryJs], bundle: true, format: "esm", target: "es2022",
      outfile: join(outDir, "main.js"), minify: true, metafile: true, logLevel: "error",
    });
  } catch (e) { console.error("BUILD FAIL", name, e.message); continue; }
  // Second target for the headless harness: IIFE + globalName so jsdom can eval it inside its own window
  // and reach `__LAB.boot()` without patching Node globals (patching globals makes jsdom's webidl layer recurse).
  try {
    await build({ entryPoints: [entryJs], bundle: true, format: "iife", globalName: "__LAB", target: "es2020",
      outfile: join(ROOT, ".test-build", name, "main.js"), minify: true, logLevel: "error",
      // "use strict" IIFE + window.eval ⇒ the var stays in the eval scope, so publish it explicitly.
      footer: { js: "globalThis.__LAB=__LAB;" } });
  } catch (e) { console.error("TEST-BUILD FAIL", name, e.message); }
  const js = readFileSync(join(outDir, "main.js"));
  const gz = gzipSync(js).length, br = brotliCompressSync(js).length;
  const libs = {};
  for (const [k, v] of Object.entries(res.metafile.inputs)) {
    const m = k.match(/node_modules\/((?:@[^/]+\/)?[^/]+)\//);
    if (m) libs[m[1]] = (libs[m[1]] || 0) + v.bytesInOutput;
  }
  let cssBytes = 0;
  if (existsSync(join(dir, "style.css"))) { copyFileSync(join(dir, "style.css"), join(outDir, "style.css")); cssBytes = stat(join(dir, "style.css")); }
  if (existsSync(join(dir, "index.html"))) copyFileSync(join(dir, "index.html"), join(outDir, "index.html"));
  const title = readFileSync(join(dir, "index.html"), "utf8").match(/<title>([^<]+)<\/title>/)?.[1] ?? name;
  built.push({ name, title, js: js.length, js_gz: gz, js_br: br, css: cssBytes, libs });
  console.log(`built ${name.padEnd(30)} js ${(js.length/1024).toFixed(1).padStart(6)} KB (gz ${(gz/1024).toFixed(1)})  css ${(cssBytes/1024).toFixed(1)} KB  inlined: ${Object.keys(libs).join(", ") || "none"}`);
}

// ---- isolated vendor floor measurements (what each library would ACTUALLY add, minified) ----
const probes = {
  "gsap (core)": `import gsap from "gsap"; window.x = gsap;`,
  "gsap + ScrollTrigger": `import gsap from "gsap"; import { ScrollTrigger } from "gsap/ScrollTrigger"; gsap.registerPlugin(ScrollTrigger); window.x = [gsap, ScrollTrigger];`,
  "gsap + ST + Flip": `import gsap from "gsap"; import { ScrollTrigger } from "gsap/ScrollTrigger"; import { Flip } from "gsap/Flip"; gsap.registerPlugin(ScrollTrigger, Flip); window.x = [gsap, ScrollTrigger, Flip];`,
  "gsap + ST + Flip + SplitText": `import gsap from "gsap"; import { ScrollTrigger } from "gsap/ScrollTrigger"; import { Flip } from "gsap/Flip"; import { SplitText } from "gsap/SplitText"; gsap.registerPlugin(ScrollTrigger, Flip, SplitText); window.x = [gsap, ScrollTrigger, Flip, SplitText];`,
  "lenis": `import Lenis from "lenis"; window.x = Lenis;`,
  "three (namespace)": `import * as THREE from "three"; window.x = THREE;`,
  "three (named subset)": `import { WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, ShaderMaterial, Points, Float32BufferAttribute } from "three"; window.x = [WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, ShaderMaterial, Points, Float32BufferAttribute];`,
  "three + OrbitControls": `import * as THREE from "three"; import { OrbitControls } from "three/addons/controls/OrbitControls.js"; window.x = [THREE, OrbitControls];`,
  "motion (vanilla: animate/scroll/inView/spring)": `import { animate, scroll, inView, spring } from "motion"; window.x = [animate, scroll, inView, spring];`,
  "motion + Lenis (both)": `import { animate, scroll } from "motion"; import Lenis from "lenis"; window.x = [animate, scroll, Lenis];`,
  "framer-motion 12.43.0 (root, motion+AnimatePresence+useScroll)": `import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from "framer-motion"; window.x = [motion, AnimatePresence, useScroll, useTransform, useReducedMotion];`,
  "framer-motion (react-only: motion + useScroll)": `import { motion, useScroll } from "framer-motion"; window.x = [motion, useScroll];`,
  "framer-motion/mini + LazyMotion(domAnimation)": `import { LazyMotion, domAnimation, m, useScroll } from "framer-motion"; window.x = [LazyMotion, domAnimation, m, useScroll];`,
  "motion/react (successor package)": `import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from "motion/react"; window.x = [motion, AnimatePresence, useScroll, useTransform, useReducedMotion];`,
  "gsap ScrollTrigger only (no core import?)": `import { ScrollTrigger } from "gsap/ScrollTrigger"; window.x = ScrollTrigger;`,
};
const sizeDir = join(OUT, "_sizes"); mkdirSync(sizeDir, { recursive: true });
const measured = [];
for (const [label, code] of Object.entries(probes)) {
  const p = join(sizeDir, label.replace(/[^a-z0-9]+/gi, "_") + ".js");
  w(p, code);
  let r;
  try {
    // react/react-dom are provided by the framework — mark them external so each row is
    // "what this library adds", not "the library + a second copy of react".
    r = await build({ entryPoints: [p], bundle: true, minify: true, format: "esm", write: false, logLevel: "error",
      external: ["react", "react-dom", "react/jsx-runtime"], jsx: "automatic" });
  }
  catch (e) { measured.push({ label, bytes: 0, gz: 0, br: 0, error: String(e.message).slice(0, 120) }); continue; }
  const buf = Buffer.from(r.outputFiles[0].contents);
  const row = { label, bytes: buf.length, gz: gzipSync(buf).length, br: brotliCompressSync(buf).length };
  measured.push(row);
  w(join(ROOT, "vendor-sizes", label.replace(/[^a-z0-9]+/gi, "_") + ".js"), buf);
}
const table = ["| What AC would add | minified | gzip | brotli |", "|---|---|---|---|"]
  .concat(measured.map(m => `| ${m.label} | ${(m.bytes/1024).toFixed(1)} KB | **${(m.gz/1024).toFixed(1)} KB** | ${(m.br/1024).toFixed(1)} KB |${m.error ? " " + m.error : ""}`))
  .concat(["", "_Measured on 2026-11-02 with esbuild 0.25.12 + node zlib/brotli inside the isolated lab (`prototype-lab/node_modules`): three 0.187.0, gsap 3.15.0, lenis 1.3.27, motion 14.9.0. Single-module floors: no tree-shaking of our own code, no framework runtime, no CSS. Treat as lower bounds for 'what this library costs us'._"])
  .join("\n");
w(join(sizeDir, "table.md"), table);
w(join(ROOT, "measurements.json"), JSON.stringify({ date: "2026-11-02", measured, experiments: built }, null, 1));

// ---- index ----
const idx = ["<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width,initial-scale=1'>",
  "<title>AK Frontend Intelligence — Prototype Lab</title><link rel=stylesheet href=/lab.css>",
  "<h1>Prototype Lab <small>Phase 2 · isolated research · NOT the application</small></h1>",
  "<p class=note>Ten self-contained experiments built by <code>build.mjs</code>. Every one has a reduced-motion path and a no-WebGL / no-JS fallback. Keys: <kbd>R</kbd> force reduced-motion · <kbd>F</kbd> force fallback · <kbd>G</kbd> toggles the fps/stat overlay.</p>",
  "<ol>"].concat(built.map(b => `<li><a href="/${b.name}/">${b.title}</a> <code>${b.name}</code> — js ${(b.js_gz/1024).toFixed(1)} KB gz</li>`))
  .concat(["</ol>", "<h2>Measured vendor floor</h2><pre>", table.replace(/\|/g, " | "), "</pre>"]).join("\n");
w(join(OUT, "index.html"), idx);
if (existsSync(join(ROOT, "lab.css"))) copyFileSync(join(ROOT, "lab.css"), join(OUT, "lab.css"));

console.log("\n=== measured vendor floors (gzip) ===");
for (const m of measured) console.log("  " + m.label.padEnd(44) + (m.gz/1024).toFixed(1).padStart(7) + " KB");
console.log("\nexperiments built:", built.length, "→ dist/index.html");
