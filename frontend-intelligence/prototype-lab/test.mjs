// Headless verification for the prototype lab.
// Each experiment is executed INSIDE a jsdom window (via window.eval on the IIFE test bundle that build.mjs emits
// into .test-build/), which asserts: the bundle parses, boot() runs to completion in the no-WebGL / reduced-motion
// environment, the DOM reaches its final readable state, and destroy() is clean.
// SCOPE OF THIS EVIDENCE: DOM logic + fallback paths only. This is NOT a rendering, WebGL, animation-timing or
// layout test — the sandbox has no browser. Anything visual is marked [UNVERIFIED] in INTERACTION_EXPERIMENT_LAB.md.
import { JSDOM, VirtualConsole } from "jsdom";
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const DIST = join(ROOT, "dist");
const TEST = join(ROOT, ".test-build");

const SHIM = `
window.__AK_TEST__ = 1;
window.matchMedia = window.matchMedia || function (q) { return { matches: false, media: q, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} }; };
window.ResizeObserver = window.ResizeObserver || class { observe(){} disconnect(){} unobserve(){} };
window.IntersectionObserver = window.IntersectionObserver || class { constructor(cb){ this.cb = cb; } observe(t){ this.cb([{ isIntersecting: true, target: t, intersectionRatio: 1 }], this); } disconnect(){} unobserve(){} };
window.scrollTo = function (){};
window.HTMLElement.prototype.setPointerCapture = function (){};
window.HTMLElement.prototype.releasePointerCapture = function (){};
window.Element.prototype.getBoundingClientRect = function () { return { x:0, y:0, top:20, left:10, right:210, bottom:120, width:200, height:100, toJSON(){} }; };
`;

const d_probe = (d, a) => d && d.body && d.body.textContent.trim().length > 40;
const EXPS = {
  "ex01-hero-typography": {
    label: "type-led hero — CSS variant and GSAP variant of the same markup",
    asserts: [
      d => d.querySelector(".ak-title"),
      d => d.querySelectorAll(".ak-line").length === 2,
      (d, a) => a.state === "final" || a.state === "running" || a.mode === "css",
    ],
  },
  "ex02-3d-object": {
    label: "3D coverflow — must degrade to CSS 3-D when WebGL is absent",
    asserts: [d => d.querySelector(".stage"), (d, a) => a.mode === "css", d => /fallback/i.test(d.body.textContent)],
  },
  "ex03-scroll-3d": {
    label: "scroll-driven 3D tunnel — scalar progress, no layout writes",
    asserts: [d => d.querySelector("#tunnel"), d => d.querySelector(".tunnel-wrap").style.height !== "", (d, a) => a.mode === "css" && typeof a.progress === "number"],
  },
  "ex04-pinned-cinematic": {
    label: "pinned chapter — pin disabled below 900 px / reduced motion, content preserved",
    asserts: [d => d.querySelectorAll(".chapter-step").length === 4, d => /^\d\d$/.test(d.querySelector("[data-index]").textContent), (d, a) => a.mode === "stack"],
  },
  "ex05-shader-bg": {
    label: "raw WebGL2 shader background — no library, CSS-gradient fallback",
    asserts: [d => !!d.querySelector("canvas.gl"), (d, a) => a.mode === "css" && d.querySelector("canvas.gl").closest("[data-fallback]") !== null, d => !!d.querySelector(".panel h2")],
  },
  "ex06-particles": {
    label: "GPU particle field — 1 draw call, count adapts to device",
    asserts: [d => /[\d,]{3,}/.test(d.querySelector(".note").textContent), (d, a) => a.count >= 1500, (d, a) => a.mode === "css"],
  },
  "ex07-doc-card": {
    label: "document card — 5 CSS layers, @property spotlight, rAF-batched tilt",
    asserts: [d => d.querySelectorAll(".doc-card").length === 3,
      d => [...d.querySelectorAll(".doc-card")].every(c => c.querySelectorAll(".layer").length === 4),
      d => [...d.querySelectorAll(".doc-card")].every(c => c.getAttribute("tabindex") === "0"),
      d => [...d.querySelectorAll(".doc-card")].every(c => c.style.viewTransitionName)],
  },
  "ex08-nav-animation": {
    label: "animated subject nav — measured pill, roving tabindex, one selected",
    asserts: [d => d.querySelectorAll(".navitem").length === 6,
      d => d.querySelector(".pill").style.width !== "",
      d => d.querySelectorAll('.navitem[aria-selected="true"]').length === 1,
      d => d.querySelectorAll('.navitem[tabindex="0"]').length === 1],
  },
  "ex09-page-transition": {
    label: "View Transitions + Lenis toggle — works with VT unsupported",
    asserts: [d => !!d.querySelector("[data-viewbox] .card-v"), d => !!d.querySelector("[data-lenis]")],
  },
  "ex10-mobile-variant": {
    label: "mobile variant — snap carousel, bottom sheet closed by default, ARIA wired",
    asserts: [d => d.querySelectorAll(".slide").length === 4, (d, a) => a.open === false && d.querySelector(".sheet").hidden === true,
      d => d.querySelector("[data-sheet]").getAttribute("aria-expanded") === "false"],
  },
  "ex11-approved-spec": {
    label: "approved spec — Geist/Newsreader roles, CSS pin, GLSL ambient with CSS fallback, gated 3D slot",
    asserts: [
      d => !!d.querySelector("h1.ak-title em"),
      d => d.querySelectorAll(".pin-step").length === 3,
      d => d.querySelector(".story").dataset.pin === "off",
      d => d.querySelector("[data-ambient]").hasAttribute("data-fallback"),
      (d, a) => a.ambient === "css" && a.scene.mounted === false,
      d => d.querySelector("[data-gate]").textContent.trim().length > 4,
    ],
  },
};

const REDUCED = {
  "ex01-hero-typography": (d, a) => a.mode === "css" || a.state === "final",
  "ex04-pinned-cinematic": (d, a) => a.mode === "stack",
  "ex05-shader-bg": (d, a) => a.mode === "css" || a.mode === "webgl2-static",
  "ex03-scroll-3d": (d, a) => typeof a.progress === "number",
  "ex06-particles": (d, a) => a.mode === "css" || a.draws <= 1,
  "ex08-nav-animation": (d) => d.querySelector(".pill").style.width !== "",
  "ex10-mobile-variant": (d) => d.querySelectorAll(".slide").length === 4,
};
const results = [];
let pass = 0, fail = 0;
const PASSES = [{ tag: "default", reduce: false }, { tag: "reduced", reduce: true }];
for (const { tag, reduce } of PASSES) {
for (const [name, cfg] of Object.entries(EXPS)) {
  const suffix = reduce ? ".reduced" : "";
  const bundle = join(TEST, name, "main.js");
  const html = join(DIST, name, "index.html");
  if (!existsSync(bundle) || !existsSync(html)) {
    fail++; results.push({ name, label: cfg.label, ok: false, why: "missing build (run `node build.mjs` first)" });
    console.log(`FAIL  ${name.padEnd(24)} missing build`); continue;
  }
  const errs = [];
  const vc = new VirtualConsole();
  // jsdom's own stubs (no canvas, no WebGL) report "Not implemented" — that is the harness, not the app.
  // We record them as notes and rely on the experiment's own reported mode to prove the fallback ran.
  const notes = [];
  const isHarnessGap = m => /Not implemented|Could not parse CSS|not implemented/i.test(m);
  vc.on("jsdomError", e => { const m = String(e.message || e).slice(0, 180); (isHarnessGap(m) ? notes : errs).push("jsdomError: " + m); });
  vc.on("error", (...a) => { const m = String(a[0]).slice(0, 180); (isHarnessGap(m) ? notes : errs).push("console.error: " + m); });
  const dom = new JSDOM(readFileSync(html, "utf8"), { url: "http://localhost/", pretendToBeVisual: true, runScripts: "dangerously", virtualConsole: vc });
  const w = dom.window;
  let ok = false, why = "", info = {};
  try {
    w.eval(SHIM);
    if (reduce) w.document.documentElement.dataset.motion = "reduce";
    w.eval(readFileSync(bundle, "utf8"));
    if (typeof w.__LAB?.boot !== "function") throw new Error("bundle did not expose __LAB.boot() — is globalName set?");
    let api = w.__LAB.boot(w.document.body);
    if (api && typeof api.then === "function") api = await api;
    await new Promise(r => setTimeout(r, 200));
    const bad = [];
    cfg.asserts.forEach((f, i) => {
      try { const v = f(w.document, api || {}); if (Array.isArray(v)) info[v[0]] = v[1]; else if (!v) bad.push("assert" + i); }
      catch (e) { bad.push("assert" + i + "(" + String(e.message).slice(0, 60) + ")"); }
    });
    if (reduce) {
      try { if (!d_probe(w.document, api || {})) bad.push("reduced-generic"); } catch (e) { bad.push("reduced:" + String(e.message).slice(0, 60)); }
      const extra = REDUCED[name];
      if (extra) { try { if (!extra(w.document, api || {})) bad.push("reduced-expectation"); } catch (e) { bad.push("reduced-expectation:" + String(e.message).slice(0, 60)); } }
    }
    if (errs.length) bad.push(errs[0]);
    try { api?.destroy?.(); } catch (e) { bad.push("destroy:" + String(e.message).slice(0, 60)); }
    ok = bad.length === 0;
    why = ok ? (Object.entries(info).map(([k, v]) => `${k}=${v}`).join(" ") || "ok") + (notes.length ? ` (+${notes.length} harness note${notes.length > 1 ? "s" : ""})` : "") : "FAILED " + JSON.stringify(bad);
  } catch (e) {
    why = "threw: " + String(e.message).slice(0, 150) + (errs[0] ? " | " + errs[0] : "");
  }
  results.push({ pass: tag, name, label: cfg.label, ok, why, info, harnessNotes: notes.slice(0, 3) });
  ok ? pass++ : fail++;
  console.log(`${ok ? "PASS" : "FAIL"}  [${tag.padEnd(7)}] ${name.padEnd(24)} ${why}`);
  w.close();
  }
}

const line = `\n${pass} passed, ${fail} failed across ${PASSES.length} passes (default + forced reduced-motion) — headless DOM execution in jsdom 26.1.0. Fallback paths only; no WebGL, no layout, no timing evidence.`;
console.log(line);
writeFileSync(join(ROOT, "headless-results.json"), JSON.stringify({
  date: "2026-11-02",
  env: "node 22.22.3 + jsdom 26.1.0, no browser binary, no GPU",
  scope: "bundle parses, boot() completes, final DOM readable, destroy() clean",
  not_covered: ["visual rendering", "WebGL/GPU behaviour", "animation timing / fps", "layout & scroll geometry", "touch gestures", "assistive-technology output"],
  harness_limitation: "jsdom has no canvas/getContext, so every GL experiment is verified on its documented fallback path only; those 'Not implemented' notices are recorded per experiment as harnessNotes.",
  pass, fail, line: line.trim(), results,
}, null, 1));
process.exit(fail ? 1 : 0);
