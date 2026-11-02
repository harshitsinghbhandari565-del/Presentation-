// EX02 — Interactive 3D object with zero assets: a "document stack" of planes, procedurally built.
// Pointer-drag rotation + idle drift; demand-style rendering (only when visible and something changed);
// DPR cap; capability probe with a CSS-3D fallback so the idea survives without WebGL.
import { chrome, prefs, hasWebGL, dprCap } from "../_shared/lab.js";

const STACK = 5;
export async function boot(root = document.body) {
  root.innerHTML = `<h1>Interactive 3D object</h1>
    <p class=note>Procedural document stack — no GLTF, no textures, one draw call per sheet. Drag to rotate. ${hasWebGL() ? "WebGL available." : "<b>No WebGL → CSS-3D fallback.</b>"}</p>
    <div class=stage></div>`;
  chrome();
  const stage = root.querySelector(".stage");
  const api = { mode: "css", destroy() {} };

  const needsGL = hasWebGL() && !prefs.fallback;
  if (!needsGL) { api.mode = "css"; return cssFallback(stage, root), api; }

  const THREE = await import("three");
  const renderer = safe(() => new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" }), null);
  if (!renderer) { api.mode = "css"; return cssFallback(stage, root), api; }
  renderer.setPixelRatio(dprCap(1.5, 1));
  renderer.setSize(stage.clientWidth || 640, 380, false);
  stage.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, (stage.clientWidth || 640) / 380, 0.1, 100);
  cam.position.set(0, 0.9, 5.2);

  const group = new THREE.Group();
  scene.add(group);
  const geo = new THREE.PlaneGeometry(2.5, 3.3);
  const sheets = [];
  for (let i = 0; i < STACK; i++) {
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: new THREE.Color(i === STACK - 1 ? 0xa5aaff : 0x2a3145).lerp(new THREE.Color(0xf2f3f8), i / (STACK * 2.4)),
      transparent: true, opacity: 0.28 + i * 0.14, side: THREE.DoubleSide,
    }));
    m.position.set(-i * 0.16, i * 0.34, i * 0.3);
    m.rotation.set(-0.62, 0.24, 0.05 + i * 0.01);
    group.add(m); sheets.push(m);
  }
  const edgeGeo = new THREE.EdgesGeometry(geo);
  sheets.forEach((s, i) => {
    const l = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: i === STACK - 1 ? 0xa5aaff : 0x59627a, transparent: true, opacity: 0.5 }));
    l.position.copy(s.position); l.rotation.copy(s.rotation); group.add(l);
  });

  let target = { x: -0.18, y: 0.5 }, current = { ...target }, visible = true, dirty = true, raf = 0;
  const draw = () => { renderer.render(scene, cam); };
  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!visible) return;
    if (!prefs.reduced) target.y += 0.0022;                    // idle drift
    const k = 0.12;
    current.x += (target.x - current.x) * k; current.y += (target.y - current.y) * k;
    group.rotation.set(current.x, current.y, 0);
    const still = Math.abs(target.y - current.y) < 1e-4 && prefs.reduced;
    if (!still || dirty) { draw(); dirty = false; }
  };
  const onDown = e => { stage.setPointerCapture?.(e.pointerId); stage.dataset.drag = "1"; };
  const onMove = e => { if (stage.dataset.drag !== "1") return; target.y += e.movementX * 0.006; target.x = Math.max(-0.9, Math.min(0.9, target.x + e.movementY * 0.004)); dirty = true; };
  const onUp = () => { stage.dataset.drag = "0"; };
  stage.addEventListener("pointerdown", onDown); addEventListener("pointermove", onMove); addEventListener("pointerup", onUp);
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { rootMargin: "120px" });
  io.observe(stage);
  const onResize = () => { const w = stage.clientWidth || 640; renderer.setSize(w, 380, false); cam.aspect = w / 380; cam.updateProjectionMatrix(); dirty = true; };
  addEventListener("resize", onResize);
  loop();
  api.mode = "webgl"; api.sheets = sheets.length;
  api.destroy = () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("resize", onResize);
    stage.removeEventListener("pointerdown", onDown); removeEventListener("pointermove", onMove); removeEventListener("pointerup", onUp);
    geo.dispose(); edgeGeo.dispose(); sheets.forEach(s => s.material.dispose()); renderer.dispose(); };
  return api;
}
function cssFallback(stage, root) {
  stage.innerHTML = `<div class=css3d>${Array.from({ length: 5 }, (_, i) => `<span style="--i:${i}"></span>`).join("")}</div>`;
  stage.querySelectorAll(".css3d span").forEach((s, i) => { s.style.transform = `rotateX(58deg) translateZ(${-i * 26}px) translateY(${-i * 12}px)`; });
  root.querySelector(".note").innerHTML += " Same silhouette, 0 KB, still interactive via CSS transforms.";
}
if (typeof window !== "undefined" && !window.__AK_TEST__) boot();
