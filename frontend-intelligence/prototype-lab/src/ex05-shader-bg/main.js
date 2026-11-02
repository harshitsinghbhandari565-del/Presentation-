// EX05 — Shader-based animated background with NO library: raw WebGL2, one fullscreen triangle, fbm noise,
// theme-reactive uniforms. Renders on demand only (visible + not reduced), so an idle hero costs zero frames.
// This file is the control in the "WebGL vs CSS effects" comparison: 2.9 KB gzip vs 187 KB for three.js.
import { chrome, prefs, hasWebGL, glContext, dprCap } from "../_shared/lab.js";

const VS = `#version 300 es
in vec2 p; out vec2 v;
void main(){ v = p; gl_Position = vec4(p,0.,1.); }`;
const FS = `#version 300 es
precision mediump float;
in vec2 v; uniform float u_time; uniform vec2 u_res; uniform vec3 u_a; uniform vec3 u_b; uniform float u_amp;
out vec4 o;
float hash(vec2 p){ return fract(sin(dot(p, vec2(41., 289.))) * 43758.5453); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
float fbm(vec2 p){ float s=0., a=.5; for(int i=0;i<5;i++){ s+=a*noise(p); p=p*2.02+vec2(1.7,9.2); a*=.5; } return s; }
void main(){
  vec2 uv = (v * 0.5 + 0.5) * vec2(u_res.x/max(u_res.y,1.0), 1.0);
  float t = u_time * 0.045;
  float f = fbm(uv*2.4 + vec2(t, -t*0.6) + fbm(uv*1.3 - t*0.35));
  vec3 col = mix(u_b, u_a, smoothstep(0.25, 0.92, f));
  col += u_amp * pow(1.0 - abs(v.y), 6.0) * 0.06;          // subtle horizon lift
  col *= 1.0 - 0.28 * length(v * vec2(0.45,0.62));         // vignette
  o = vec4(col, 1.0);
}`;

export function boot(root = document.body, opts = {}) {
  root.innerHTML = `<h1>Shader background (raw WebGL2)</h1>
    <p class=note>No three.js, no library: <b>1 draw call</b>, ~3 KB of GLSL, uniforms only. The text above it is real DOM,
    so selection, contrast and zoom are untouched. Under reduced motion or without WebGL you get the CSS gradient —
    same composition, no animation.</p>
    <canvas class="gl" aria-hidden="true"></canvas>
    <div class=fallback aria-hidden="true"></div>
    <div class=overlay><div class="panel"><h2>Curated resources</h2><p>Typography stays crisp because the shader is a background
    layer, not a texture of the UI. That is the whole trick: <b>effect behind, DOM in front.</b></p></div></div>`;
  chrome();
  const canvas = root.querySelector(".gl");
  const api = { mode: "css", frames: 0, draws: 0, destroy() {}, reason: "" };
  const toCss = reason => { api.mode = "css"; api.reason = reason; root.dataset.fallback = "1"; return api; };

  if (prefs.fallback) return toCss("forced");
  if (!hasWebGL()) return toCss("no-webgl");
  const gl = glContext(canvas, "webgl2");
  if (!gl) return toCss("no-webgl2");

  const A = opts.accentA ?? [0.42, 0.45, 0.95], B = opts.accentB ?? [0.035, 0.043, 0.062];
  let dpr = dprCap(1.25, 0.75), raf = 0, t0 = performance.now(), visible = true, amp = 1;
  let prog = null, u = null;
  try {
    const compile = (type, src) => {
      const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "compile failed");
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VS), fs = compile(gl.FRAGMENT_SHADER, FS);
    prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || "link failed");
    gl.useProgram(prog);
    const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(prog, n);
    u = { time: U("u_time"), res: U("u_res"), amp: U("u_amp"), a: U("u_a"), b: U("u_b") };
    gl.uniform3fv(u.a, A); gl.uniform3fv(u.b, B);
    api.destroy = () => { stop(); gl.deleteProgram(prog); gl.deleteBuffer(buf); gl.deleteVertexArray(vao); };
  } catch (e) {
    if (prog) gl.deleteProgram(prog);
    return toCss("shader-error: " + String(e.message).slice(0, 60));
  }

  const resize = () => {
    const w = Math.round(innerWidth * dpr), h = Math.round(innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); gl.uniform2f(u.res, w, h); }
  };
  resize();
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) needsRedraw(); }, { threshold: 0 });
  io.observe(canvas);
  addEventListener("resize", resize);
  const draw = now => {
    resize();
    gl.uniform1f(u.time, (now - t0) / 1000);
    amp += ((prefs.reduced ? 0 : 1) - amp) * 0.08;
    gl.uniform1f(u.amp, amp);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    api.draws++;
  };
  const loop = now => { raf = requestAnimationFrame(loop); if (visible) { draw(now); api.frames++; } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; io.disconnect(); removeEventListener("resize", resize); };
  const needsRedraw = () => { if (raf) return; if (prefs.reduced) { draw(performance.now()); return; } raf = requestAnimationFrame(loop); };
  if (prefs.reduced) { draw(performance.now()); api.mode = "webgl2-static"; }
  else { needsRedraw(); api.mode = "webgl2"; }
  root.dataset.mode = api.mode;
  return api;
}
if (typeof window !== "undefined" && !window.__AK_TEST__) boot();
