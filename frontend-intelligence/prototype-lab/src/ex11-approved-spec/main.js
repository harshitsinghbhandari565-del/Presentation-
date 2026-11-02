// EX11 — the PO-approved design specification, implemented as one page against AC's REAL tokens.
// Approved 2026-11-02: (1) Geist + Newsreader, (2) pinned storytelling + ONE optional 3D scene,
// (3) GLSL ambient background with a CSS fallback. Research-only; nothing here is imported by the app.
// Every layer is independently removable, and each one degrades to what AC already ships today.
import { chrome, prefs, hasWebGL, glContext, dprCap, lowPower, mq, supports, safe, q, qa } from "../_shared/lab.js";

/* ── 1. Typography roles ────────────────────────────────────────────────────────
   AC's identity is already in the markup: Geist carries the headline, Newsreader
   italic appears only inside <em> at 1.14em (`.hero h1 em`). This keeps that ratio and
   fixes the token: in the app `--font-editorial: var(--font-editorial), Georgia, serif`
   self-references — it only renders at all because next/font's unlayered class wins the
   cascade. Declare the family instead, and give the scale to `clamp()` so no rule needs vw. */
const TYPE_TOKENS = `
:root{
  --font-ui: var(--font-geist), ui-sans-serif, system-ui, sans-serif;
  --font-editorial: "editorial", "editorial Fallback", Newsreader, Georgia, ui-serif, serif;
  --step--1: clamp(.72rem,.70rem + .10vw,.78rem);
  --step-0:  clamp(.92rem,.88rem + .18vw,1rem);
  --step-1:  clamp(1.12rem,1.02rem + .42vw,1.32rem);
  --step-2:  clamp(1.45rem,1.20rem + 1.05vw,2.05rem);
  --step-3:  clamp(2.6rem,1.6rem + 4.2vw,4.55rem);
  --motion-fast: 180ms; --motion-base: 300ms; --motion-slow: 450ms;
  --ease-out-soft: cubic-bezier(.22,1,.36,1); --ease-inout: cubic-bezier(.65,0,.35,1);
  --move-sm: 8px; --move-md: 14px;
}
`;

/* ── 3. GLSL ambient layer — raw WebGL2, no library (3.1 KB gz here vs 192.2 KB with three.js) ── */
const VS = `#version 300 es
in vec2 p; out vec2 v;
void main(){ v = p; gl_Position = vec4(p, 0., 1.); }`;

const FS = `#version 300 es
precision mediump float;
in vec2 v;
uniform vec2  u_res;
uniform float u_time;
uniform vec3  u_light;      // --accent, read from the CSS token
uniform vec3  u_base;        // --bg, read from the CSS token
uniform float u_lightmode;
uniform float u_amp;         // eased 0→1; 0 under reduced motion → a still frame
float hash(vec2 p){ return fract(sin(dot(p, vec2(41., 289.))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x),
             mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
}
float fbm(vec2 p){
  float s = 0., a = .5;
  for (int i = 0; i < 4; i++){ s += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= .5; }
  return s;
}
void main(){
  vec2 uv = (v * .5 + .5) * vec2(u_res.x / max(u_res.y, 1.), 1.);
  float t = u_time * .03;
  float f = fbm(uv * 1.9 + vec2(t, -t * .55) + fbm(uv * 1.1 - t * .25));
  // AC's hero light sits top-right ('ambient-background' = radial at 80% 25%) — match it, don't fight it.
  float d = length((uv - vec2(.80, .75)) * vec2(1.25, 1.0));
  float lift = smoothstep(.18, .96, f) * pow(max(0., 1. - d), 1.7);
  vec3 col = u_base + lift * u_light * mix(.055, .030, u_lightmode) * u_amp;
  col *= 1. - .22 * length(v * vec2(.42, .60));                 // vignette keeps the edges quiet
  col = mix(col, u_base, smoothstep(.55, 1.0, uv.y) * .35);     // dissolve before the grid band
  gl_FragColor = vec4(col, 1.);
}`;

/** Read a colour token off the cascade; never trust it to exist or to be parseable. */
function cssColor(name, fallback) {
  const v = safe(() => getComputedStyle(document.documentElement).getPropertyValue(name).trim(), "");
  if (typeof v !== "string" || !/^(#[0-9a-f]{3,8}|rgba?\()/i.test(v)) return fallback;
  if (v[0] === "#") {
    const h = v.slice(1);
    const s = h.length === 3 ? h.split("").map(c => c + c).join("") : h.slice(0, 6);
    return [0, 2, 4].map(i => parseInt(s.slice(i, i + 2), 16) / 255);
  }
  const n = v.match(/[\d.]+/g) || ["0", "0", "0"];
  return [+n[0] / 255, +n[1] / 255, +n[2] / 255];
}

/* ── 4. Optional 3D scene — the GATE is the deliverable, not the geometry ───────
   Approved as "one optional scene that must never block initial content". AC ports this
   rule set verbatim; the geometry here is a labelled stand-in whose production cost is the
   measured 192.2 KB gz three.js chunk (ex06). */
export function sceneGate() {
  if (prefs.reduced) return "prefers-reduced-motion: reduce";
  if (prefs.fallback) return "forced fallback (?fallback=1)";
  if (mq("(pointer: coarse)") || innerWidth < 1024) return "touch or narrow viewport";
  if (lowPower()) return "low-power device (deviceMemory ≤4 / cores ≤2 / 2G)";
  if (safe(() => !!navigator.connection?.saveData, false)) return "Save-Data enabled";
  if (safe(() => document.documentElement.classList.contains("projector-mode"), false)) return "projector mode (lecture hall)";
  if (!hasWebGL()) return "no usable WebGL context";
  return "";
}

export function boot(root = document.body, opts = {}) {
  const api = { mode: "css", ambient: "css", pinned: false, steps: 3, draws: 0, frames: 0,
    scene: { mounted: false, blocked: sceneGate(), bytes: 0 }, destroy() {} };

  root.innerHTML = `
<div class="ambient-layer" data-ambient><canvas class="gl" aria-hidden="true"></canvas><div class="css-ambient" aria-hidden="true"></div></div>

<header class="demo-head">
  <a class="skip" href="#story">Skip to content</a>
  <div class="eyebrow"><span class="dot"></span>A LITTLE MORE ORGANIZED</div>
  <h1 class="ak-title">Less searching.<br>More <em>learning.</em></h1>
  <p class="lede">That useful presentation. Those well-written notes. Find the resources you need, all in one thoughtfully organized place.</p>
  <p class="note" data-readout>initialising…</p>
</header>

<section class="story" id="story" aria-labelledby="story-h">
  <div class="story-inner">
    <div class="story-pin">
      <h2 id="story-h">From “where is it?”<br>to <em>“here it is.”</em></h2>
      <ol class="story-rail"><li data-active="true">01</li><li>02</li><li>03</li></ol>
      <p class="pin-state" data-pin-state>pin: —</p>
    </div>
    <ol class="story-steps">
      <li class="pin-step"><span class="step-number">01</span><h3>Find your next resource</h3><p>Search a title or keyword. Narrow things down by subject, course, semester or document type.</p></li>
      <li class="pin-step"><span class="step-number">02</span><h3>Get the context first</h3><p>See what a resource covers, where it lives and how it fits into your studies before you open it.</p></li>
      <li class="pin-step"><span class="step-number">03</span><h3>Go straight to the source</h3><p>One click opens the original document. No extra account, no copied file, no detours.</p></li>
    </ol>
  </div>
</section>

<section class="scene-slot" aria-labelledby="scene-h">
  <div class="scene-copy">
    <h3 id="scene-h">One optional 3D moment</h3>
    <p>The approved spec keeps 3D as a garnish: never in the first load, never on touch, never under reduced motion or Save-Data, and never before the page is already readable.</p>
    <p class="gate" data-gate></p>
    <button type="button" class="btn" data-load-scene>Load the 3D scene</button>
    <div class="stage" data-stage hidden></div>
  </div>
  <ul class="cost-list"><li>stand-in geometry (CSS 3-D)</li><li>production cost = <b>192.2 KB</b> gz chunk (ex06, measured)</li><li>first-load cost = <b>0 KB</b> (dynamic import only)</li></ul>
</section>

<footer class="demo-foot"><p>With every approved layer switched off you get exactly what the app ships today: DOM text, a CSS radial wash, a stacked three-step list, no canvas.</p></footer>`;
  const style = document.createElement("style"); style.textContent = TYPE_TOKENS; root.prepend(style);

  const readout = q("[data-readout]", root);
  const say = () => { if (readout) readout.textContent =
    `ambient: ${api.ambient} · story: ${api.pinned ? "pinned (CSS animation-timeline)" : "stacked (native flow)"} · ` +
    `3D: ${api.scene.mounted ? `mounted (192.2 KB, off first load)` : `not loaded — ${api.scene.blocked || "user has not opted in"}`} · ` +
    `draws: ${api.draws} · frames: ${api.frames}`; };

  /* ── ambient ── */
  const layer = q("[data-ambient]", root);
  const canvas = q("canvas.gl", root);
  let gl = null, prog = null, buf = null, vao = null, u = {}, raf = 0, amp = 0, visible = true, lost = false, restorations = 0;
  const t0 = performance.now();
  const io = typeof IntersectionObserver === "function" ? new IntersectionObserver(es => {
    visible = !!es[0]?.isIntersecting; if (visible) kick();
  }, { threshold: 0 }) : null;

  const toCss = why => {
    api.ambient = "css"; api.mode = "css";
    if (layer) layer.dataset.fallback = why || "";
    if (canvas?.parentNode) canvas.remove();
    stop(); say();
  };
  const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0; io?.disconnect(); removeEventListener("resize", resize); };

  const resize = () => {
    const dpr = dprCap(1.5, 1);
    const w = Math.round(innerWidth * dpr);
    const h = Math.round(Math.min(innerHeight, 920) * dpr);      // AC's ambient band is `height: 920px`
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); gl.uniform2f(u.res, w, h); }
  };
  const colors = () => {
    const light = safe(() => document.documentElement.dataset.theme === "light", false);
    gl.uniform3fv(u.light, cssColor("--accent", [0.647, 0.667, 1]));
    gl.uniform3fv(u.base, cssColor("--bg", light ? [0.973, 0.976, 0.988] : [0.035, 0.043, 0.063]));
    gl.uniform1f(u.lm, light ? 1 : 0);
  };
  const draw = now => {
    resize();
    gl.uniform1f(u.time, (now - t0) / 1000);
    amp += (1 - amp) * 0.06; gl.uniform1f(u.amp, prefs.reduced ? 0.55 : amp);
    colors();
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    api.draws++;
  };
  const loop = now => { raf = requestAnimationFrame(loop); if (!visible || document.hidden || lost) return; draw(now); api.frames++; if (prefs.reduced) { cancelAnimationFrame(raf); raf = 0; } };
  const kick = () => { if (raf || prefs.reduced || api.ambient !== "webgl2") return; raf = requestAnimationFrame(loop); };

  function start() {
    if (api.ambient === "webgl2") return;            // re-entry guard: restore/theme/redraw all route here
    if (prefs.reduced) { api.ambient = "css-static"; return toCss("reduced-motion → CSS wash, no animation"); }
    if (prefs.fallback) return toCss("forced fallback");
    if (!hasWebGL()) return toCss("no WebGL support");
    gl = safe(() => glContext(canvas, "webgl2"), null);
    if (!gl) return toCss("no WebGL2 context");
    try {
      const sh = (type, src) => {
        const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "compile failed");
        return s;
      };
      prog = gl.createProgram();
      gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
      gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || "link failed");
      gl.useProgram(prog);
      vao = gl.createVertexArray(); gl.bindVertexArray(vao);
      buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      // one oversized triangle covers the viewport: no index buffer, no attribute per-vertex state, 1 draw call
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      u = { res: gl.getUniformLocation(prog, "u_res"), time: gl.getUniformLocation(prog, "u_time"),
        light: gl.getUniformLocation(prog, "u_light"), base: gl.getUniformLocation(prog, "u_base"),
        amp: gl.getUniformLocation(prog, "u_amp"), lm: gl.getUniformLocation(prog, "u_lightmode") };
      gl.disable(gl.DEPTH_TEST);
    } catch (e) {
      if (prog) safe(() => gl.deleteProgram(prog), 0);
      return toCss("shader compile/link error: " + String(e.message).slice(0, 48));
    }
    addEventListener("resize", resize);
    io?.observe(layer);
    // context loss must never leave a black rectangle where the hero is
    canvas.addEventListener("webglcontextlost", ev => { ev.preventDefault(); lost = true; toCss("context lost — CSS fallback engaged"); }, false);
    canvas.addEventListener("webglcontextrestored", () => {
      if (restorations++ > 0) { toCss("restore already attempted once — staying on CSS"); return; }
      start();
    }, false);
    api.ambient = "webgl2"; api.mode = "webgl2";
    if (layer) delete layer.dataset.fallback;
    resize(); colors(); kick(); say();
  }
  start();

  /* ── 2. Pinned storytelling — CSS scroll-driven only (no GSAP until its licence review) ── */
  const story = q(".story", root);
  const state = q("[data-pin-state]", root);
  const wide = () => mq("(min-width: 1024px)");
  const hasTimeline = () => supports("animation-timeline", "view()");
  const applyPin = () => {
    api.pinned = !prefs.reduced && wide() && hasTimeline();
    if (story) story.dataset.pin = api.pinned ? "on" : "off";
    if (state) state.textContent = api.pinned
      ? "pin: active — position:sticky + animation-timeline, 0 JS on the scroll path"
      : `pin: off — ${prefs.reduced ? "prefers-reduced-motion" : !wide() ? "viewport < 1024 px" : "no animation-timeline support"} → native stacked flow, reading order unchanged`;
    say();
  };
  applyPin();
  const steps = qa(".pin-step", root), rail = qa(".story-rail li", root);
  let obs = null;
  if (api.pinned && typeof IntersectionObserver === "function") {
    obs = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const i = steps.indexOf(e.target);
      rail.forEach((li, n) => li.dataset.active = String(n === i));
    }), { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach(s => obs.observe(s));
  }

  /* ── 4. scene slot ── */
  const slot = q("[data-stage]", root), gate = q("[data-gate]", root), btn = q("[data-load-scene]", root);
  const paintGate = () => {
    if (!gate) return;
    gate.textContent = api.scene.mounted
      ? "status: mounted — idle-ordered, off the LCP path, one canvas, aria-hidden, pausable"
      : api.scene.blocked ? `blocked by: ${api.scene.blocked}` : "allowed — the page is already readable, so loading now costs nothing you can see";
  };
  paintGate();
  const mountScene = () => {
    api.scene.blocked = sceneGate();
    if (api.scene.blocked) { paintGate(); btn?.setAttribute("data-denied", api.scene.blocked); say(); return false; }
    btn?.removeAttribute("data-denied");
    if (slot) {
      slot.hidden = false; slot.setAttribute("aria-hidden", "true");
      // In the app: `const Scene = dynamic(() => import("./Scene"), { ssr: false })` inside an
      // IntersectionObserver + requestIdleCallback. Never a static import, never above the fold's path.
      slot.innerHTML = `<div class="cube"><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <p class="stage-note">CSS 3-D stand-in · production: one canvas, <code>frameloop="demand"</code>, DPR ≤1.5, 1 draw call, poster underneath</p>`;
      slot.dataset.spin = "1";
    }
    api.scene.mounted = true; api.scene.bytes = 192.2; paintGate(); say();
    return true;
  };
  if (btn) btn.onclick = mountScene;
  addEventListener("keydown", e => { if (e.key === "3") mountScene(); });

  chrome({
    onReduced: () => { applyPin(); api.scene.blocked = sceneGate(); paintGate(); if (prefs.reduced) toCss("reduced-motion → CSS wash, no animation"); else start(); },
    onFallback: () => { toCss("forced fallback"); start(); api.scene.blocked = sceneGate(); paintGate(); },
    onTheme: () => { if (api.ambient === "css") { say(); return; } start(); },
  });
  api.destroy = () => {
    stop(); obs?.disconnect();
    if (canvas?.parentNode) canvas.remove();
    if (slot) { delete slot.dataset.spin; slot.innerHTML = ""; }
    if (prog && gl) safe(() => { gl.deleteProgram(prog); gl.deleteBuffer(buf); gl.deleteVertexArray(vao); }, 0);
    gl = null;
  };
  say();
  return api;
}
if (typeof window !== "undefined" && !window.__AK_TEST__) boot();
