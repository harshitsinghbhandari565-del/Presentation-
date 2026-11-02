// EX03 — Scroll-controlled 3D: a "resource tunnel" the camera flies through, progress-driven, not timeline-driven.
// Chosen deliberately over a GSAP timeline: a scroll-linked camera is one uniform update per frame, so it costs
// almost nothing on the main thread and can be driven by CSS scroll progress when available.
import { chrome, prefs, hasWebGL, dprCap, clamp, safe } from "../_shared/lab.js";

const CARDS = ["Presentation", "Notes", "Worksheet", "Practice set", "Reference", "Slide deck", "Revision map", "Case study"];
export async function boot(root = document.body) {
  root.innerHTML = `<h1>Scroll-controlled 3D</h1>
    <p class=note>Scroll — the camera moves through a tunnel of resource cards. Progress is a single scalar
    (<code>scrollYProgress</code>), so the 3D layer never touches layout. Reduced motion renders the middle frame, static.</p>
    <div class=tunnel-wrap><div class="tunnel" id="tunnel"></div></div>
    <div class=after><h2>Why this shape</h2><p>One uniform, one attribute, zero re-layout: the pattern to copy is <i>scalar-in → GPU-out</i>, not <i>DOM-out</i>.</p></div>`;
  chrome();
  const stage = root.querySelector("#tunnel");
  const api = { mode: "css", destroy() {}, progress: 0 };
  const wrap = root.querySelector(".tunnel-wrap");
  wrap.style.height = `${Math.max(1800, innerHeight * 2.2)}px`;

  const progressOf = () => {
    const r = wrap.getBoundingClientRect();
    return clamp(-r.top / (r.height - innerHeight * 0.5), 0, 1);
  };

  const cssTunnel = () => {
    api.mode = "css";
    stage.innerHTML = `<div class=css-tunnel>${CARDS.map((c, i) => `<span style="--z:${i}">${c}</span>`).join("")}</div>`;
    if (!document.getElementById("ex03-css")) {
      const style = document.createElement("style");
      style.id = "ex03-css";
      style.textContent = `.css-tunnel{perspective:700px;height:100%;transform-style:preserve-3d}
        .css-tunnel span{position:absolute;left:50%;top:45%;padding:10px 14px;border:1px solid var(--border-strong);
        border-radius:10px;background:var(--surface);transform:translate(-50%,-50%) translateZ(calc((var(--z) * -180px) + var(--p,0px)))}`;
      document.head.appendChild(style);
    }
    const tick = () => { api.raf = requestAnimationFrame(tick); api.progress = progressOf(); stage.style.setProperty("--p", `${api.progress * 1400}px`); };
    tick();
    api.destroy = () => cancelAnimationFrame(api.raf);
    return api;
  };
  if (!hasWebGL() || prefs.fallback) return cssTunnel();

  const THREE = await import("three");
  const renderer = safe(() => new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" }), null);
  if (!renderer) { cssTunnel(stage); return api; }
  renderer.setPixelRatio(dprCap(1.6, 1));
  const size = () => { const w = stage.clientWidth || 640, h = innerHeight * 0.9; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); };
  stage.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x090b10, 6, 26);
  const cam = new THREE.PerspectiveCamera(52, 1, 0.1, 60);
  size(); addEventListener("resize", size);

  const w = 2.6, h = 3.4;
  const geo = new THREE.PlaneGeometry(w, h, 1, 1);
  const group = new THREE.Group(); scene.add(group);
  const mats = [];
  CARDS.forEach((label, i) => {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x1a2030).lerp(new THREE.Color(0xa5aaff), (i % 3) * 0.14), transparent: true, opacity: 0.72, side: THREE.DoubleSide });
    mats.push(m);
    const mesh = new THREE.Mesh(geo, m);
    const a = (i / CARDS.length) * Math.PI * 2;
    mesh.position.set(Math.cos(a) * 1.9, Math.sin(a) * 1.15, -i * 3.2);
    mesh.rotation.y = -Math.cos(a) * 0.34;
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({ color: 0x8ea2ff, transparent: true, opacity: 0.5 }));
    edge.position.copy(mesh.position); edge.rotation.copy(mesh.rotation);
    group.add(mesh, edge);
  });
  const line = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(CARDS.map((_, i) => new THREE.Vector3(0, 0, -i * 3.2))),
    new THREE.LineBasicMaterial({ color: 0x2f3852 }));
  scene.add(line);

  let visible = true, smooth = 0, raf = 0;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "200px" });
  io.observe(stage);
  const draw = () => {
    const p = prefs.reduced ? 0.5 : progressOf();
    api.progress = p;
    smooth += (p - smooth) * 0.14;                        // lerp = the only "smoothing" we pay for
    cam.position.z = 4 - smooth * (CARDS.length - 1) * 3.2;
    cam.position.x = Math.sin(smooth * 4) * 0.35;
    group.rotation.z = smooth * 0.22;
    scene.fog.near = 4 + smooth * 2;
    renderer.render(scene, cam);
  };
  const loop = () => { raf = requestAnimationFrame(loop); if (visible) draw(); };
  if (prefs.reduced) { draw(); } else { loop(); }
  api.mode = "webgl";
  api.destroy = () => { cancelAnimationFrame(raf); io.disconnect(); removeEventListener("resize", size);
    geo.dispose(); mats.forEach(m => m.dispose()); line.geometry.dispose(); line.material.dispose(); renderer.dispose(); };
  return api;
}
if (typeof window !== "undefined" && !window.__AK_TEST__) boot();
