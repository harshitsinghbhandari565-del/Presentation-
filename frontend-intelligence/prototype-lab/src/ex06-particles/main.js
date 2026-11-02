// EX06 — Particle field: 4 000 GPU particles in ONE draw call via three.js Points + a custom ShaderMaterial.
// Demand-style: frames only while visible AND something changed (or drift is allowed). Mobile gets 1 500.
// This is the "measure twice" object for the WebGL budget in PERFORMANCE_BUDGETS.md.
import { chrome, prefs, hasWebGL, dprCap, lowPower, safe } from "../_shared/lab.js";

export async function boot(root = document.body, opts = {}) {
  const COUNT = opts.count ?? (lowPower() ? 1500 : 4000);
  root.innerHTML = `<h1>Particle field</h1>
    <p class=note><b>${COUNT.toLocaleString()}</b> particles · 1 draw call · position computed in the vertex shader
    (no per-frame CPU buffer writes). Pointer parallax only. ${lowPower() ? "<i>Detected low-power profile → reduced count.</i>" : ""}</p>
    <div class=field></div>
    <div class=below><p>Scroll away and the loop stops (IntersectionObserver). That single detail is the difference between
    "a demo that stutters" and "a hero that disappears from the frame budget".</p></div>`;
  chrome();
  const stage = root.querySelector(".field");
  const api = { mode: "css", count: COUNT, draws: 0, destroy() {} };
  const cssDots = () => {
    api.mode = "css";
    stage.innerHTML = `<div class=css-dots>${Array.from({ length: 60 }, (_, i) => `<i style="--x:${(i*37)%100}%;--y:${(i*53)%100}%;--d:${i%7}"></i>`).join("")}</div>`;
    const n = root.querySelector(".note"); if (n) n.innerHTML += " <b>CSS fallback</b>: 60 composited dots, same mood, 0 KB.";
    return api;
  };
  if (!hasWebGL() || prefs.fallback) return cssDots();
  const THREE = await import("three");
  const renderer = safe(() => new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "low-power" }), null);
  if (!renderer) { api.mode = "css"; cssDots(stage); return api; }
  renderer.setPixelRatio(dprCap(1.5, 1));
  const W = () => stage.clientWidth || 640, H = () => Math.max(320, Math.min(560, innerHeight * 0.6));
  renderer.setSize(W(), H(), false);
  stage.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(46, W() / H(), 0.1, 100);
  cam.position.z = 7;

  const pos = new Float32Array(COUNT * 3), seed = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    const r = 1.1 + Math.random() * 3.4, a = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = (Math.random() - 0.5) * 3.2; pos[i * 3 + 2] = Math.sin(a) * r * 0.55 - 1.4;
    seed[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.Float32BufferAttribute(seed, 1));
  const uniforms = { uTime: { value: 0 }, uPointer: { value: new THREE.Vector2(0, 0) }, uSize: { value: 2.6 * renderer.getPixelRatio() }, uTint: { value: new THREE.Color(0xa5aaff) } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float aSeed; uniform float uTime; uniform vec2 uPointer; uniform float uSize;
      varying float vA;
      void main(){
        vec3 p = position;
        float t = uTime * (0.12 + aSeed * 0.22);
        p.x += sin(t + aSeed * 6.28) * 0.42; p.y += cos(t * 1.21 + aSeed * 3.1) * 0.3;
        p.xy += uPointer * (0.22 + aSeed * 0.5);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uSize * (1.0 + aSeed * 2.2) * (7.0 / -mv.z);
        vA = 0.18 + 0.82 * aSeed * aSeed;
        gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `precision mediump float; uniform vec3 uTint; varying float vA;
      void main(){ vec2 d = gl_PointCoord - 0.5; float m = 1.0 - smoothstep(0.16, 0.5, length(d));
        if (m < 0.01) discard; gl_FragColor = vec4(uTint, m * vA); }`,
  });
  const points = new THREE.Points(geo, mat); scene.add(points);

  let visible = true, raf = 0, t0 = performance.now(), px = 0, py = 0, tx = 0, ty = 0, needs = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) needs = true; }, { threshold: 0 });
  io.observe(stage);
  const onMove = e => { tx = (e.clientX / innerWidth - 0.5) * 0.9; ty = -(e.clientY / innerHeight - 0.5) * 0.6; needs = true; };
  addEventListener("pointermove", onMove, { passive: true });
  const onResize = () => { renderer.setSize(W(), H(), false); cam.aspect = W() / H(); cam.updateProjectionMatrix(); needs = true; };
  addEventListener("resize", onResize);
  const frame = now => {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const idle = !prefs.reduced;
    if (!idle && !needs) return;                                  // demand: skip the draw entirely
    uniforms.uTime.value = (now - t0) / 1000;
    px += (tx - px) * 0.06; py += (ty - py) * 0.06;
    uniforms.uPointer.value.set(px, py);
    needs = idle || Math.abs(tx - px) > 1e-3 || Math.abs(ty - py) > 1e-3;
    renderer.render(scene, cam); api.draws++;
  };
  raf = requestAnimationFrame(frame);
  if (prefs.reduced) { uniforms.uTime.value = 0; renderer.render(scene, cam); }
  api.mode = "webgl";
  api.destroy = () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("pointermove", onMove); removeEventListener("resize", onResize);
    geo.dispose(); mat.dispose(); renderer.dispose(); };
  return api;
}
if (typeof window !== "undefined" && !window.__AK_TEST__) boot();
