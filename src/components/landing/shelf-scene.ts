import {
  ACESFilmicToneMapping,
  AmbientLight,
  BoxGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PointLight,
  Scene,
  SRGBColorSpace,
  TorusGeometry,
  WebGLRenderer,
} from "three";
import { isMotionPaused, subscribeMotionPaused } from "@/components/layout/motion-state";

export interface ShelfItem {
  name: string;
  count: number;
  live: boolean;
}

export interface ShelfController {
  dispose: () => void;
  setActiveIndex: (index: number) => void;
}

const UPCOMING_SUBJECTS = ["Physics", "Mathematics", "Computer Science", "Economics"];

export function buildShelfItems(subjects: { name: string; count: number }[]): ShelfItem[] {
  const liveItems: ShelfItem[] = (subjects.length ? subjects : [{ name: "English", count: 1 }])
    .slice(0, 6)
    .map(s => ({ name: s.name, count: s.count, live: true }));

  const existing = new Set(liveItems.map(s => s.name.toLowerCase()));
  for (const candidate of UPCOMING_SUBJECTS) {
    if (liveItems.length >= 5) break;
    if (!existing.has(candidate.toLowerCase())) {
      liveItems.push({ name: candidate, count: 0, live: false });
    }
  }
  return liveItems;
}

function createFolioCoverTexture(item: ShelfItem, index: number, isLight: boolean): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 720;
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  const H = canvas.height;

  const grad = ctx.createLinearGradient(0, 0, W, H);
  if (item.live) {
    if (isLight) {
      grad.addColorStop(0, "#ffffff");
      grad.addColorStop(1, "#e6eaf8");
    } else {
      grad.addColorStop(0, "#232b47");
      grad.addColorStop(1, "#14192b");
    }
  } else {
    if (isLight) {
      grad.addColorStop(0, "#f2f4fa");
      grad.addColorStop(1, "#e4e8f3");
    } else {
      grad.addColorStop(0, "#171c29");
      grad.addColorStop(1, "#10141f");
    }
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Accent bar at top
  ctx.fillStyle = item.live ? (isLight ? "#5157c4" : "#a5aaff") : (isLight ? "#b4bdd4" : "#364057");
  ctx.fillRect(42, 46, W - 84, 8);

  // Index number
  ctx.fillStyle = item.live ? (isLight ? "#5157c4" : "#a5aaff") : (isLight ? "#7a849d" : "#6c7690");
  ctx.font = "600 26px system-ui, -apple-system, sans-serif";
  ctx.fillText(`0${index + 1}`, 42, 108);

  // Status badge
  ctx.fillStyle = item.live ? "#91d8bd" : (isLight ? "#8a94ad" : "#68728c");
  ctx.font = "600 19px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(item.live ? "LIVE SHELF" : "UPCOMING", W - 42, 106);
  ctx.textAlign = "left";

  // Subject title
  ctx.fillStyle = isLight ? "#1a2031" : (item.live ? "#f4f5fb" : "#a8b0c5");
  ctx.font = "600 50px system-ui, -apple-system, sans-serif";
  const words = item.name.split(" ");
  words.slice(0, 2).forEach((word, idx) => {
    ctx.fillText(word, 42, 230 + idx * 58);
  });

  // Decorative architectural lines
  ctx.strokeStyle = item.live
    ? (isLight ? "rgba(81,87,196,0.22)" : "rgba(165,170,255,0.24)")
    : (isLight ? "rgba(30,41,75,0.09)" : "rgba(255,255,255,0.07)");
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    const y = 420 + i * 38;
    ctx.beginPath();
    ctx.moveTo(42, y);
    ctx.lineTo(W - 84 - i * 56, y);
    ctx.stroke();
  }

  // Bottom count label
  ctx.fillStyle = item.live ? (isLight ? "#237457" : "#91d8bd") : (isLight ? "#626d82" : "#7e879e");
  ctx.font = "500 24px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    item.live ? `${item.count} curated resource${item.count !== 1 ? "s" : ""}` : "Ready for future decks",
    42,
    H - 54,
  );

  // Frame border
  ctx.strokeStyle = item.live
    ? (isLight ? "rgba(81,87,196,0.35)" : "rgba(165,170,255,0.4)")
    : (isLight ? "rgba(30,41,75,0.14)" : "rgba(255,255,255,0.1)");
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, W - 6, H - 6);

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

function createSpineTexture(item: ShelfItem, isLight: boolean): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 160;
  canvas.height = 720;
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  const H = canvas.height;

  ctx.fillStyle = item.live
    ? (isLight ? "#dfe4f7" : "#283152")
    : (isLight ? "#e6eaf4" : "#181e2c");
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = item.live ? (isLight ? "#5157c4" : "#a5aaff") : (isLight ? "#9aa4bd" : "#444e66");
  ctx.fillRect(20, 36, W - 40, 8);

  ctx.save();
  ctx.translate(W / 2 + 10, H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = item.live ? (isLight ? "#1a2031" : "#f2f3f8") : (isLight ? "#586176" : "#9aa3b8");
  ctx.font = "600 32px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(item.name.toUpperCase(), 0, 0);
  ctx.restore();

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** Named imports only; dynamic import keeps Three.js out of blocking initial JS. */
export function mountShelf(
  host: HTMLElement,
  subjects: { name: string; count: number }[],
  onFallback: () => void,
): ShelfController | undefined {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
      failIfMajorPerformanceCaveat: true,
    });
  } catch {
    try {
      renderer = new WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "default",
      });
    } catch {
      return undefined;
    }
  }

  const isLight = document.documentElement.dataset.theme === "light";
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = isLight ? 1.06 : 1.15;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(36, 1, 0.1, 50);
  camera.position.set(0, 1.35, 6.2);
  camera.lookAt(0, 0.15, 0);

  const turntable = new Group();
  scene.add(turntable);

  scene.add(new AmbientLight(isLight ? 0xffffff : 0xdbe0ff, isLight ? 1.3 : 0.95));
  const key = new DirectionalLight(0xffffff, isLight ? 1.45 : 1.75);
  key.position.set(3.2, 4.8, 5.2);
  scene.add(key);

  const rim = new PointLight(isLight ? 0x5157c4 : 0xa5aaff, isLight ? 2.2 : 3.8, 10, 1.5);
  rim.position.set(-2.5, 2.0, 3.2);
  scene.add(rim);

  const disposables: { dispose: () => void }[] = [];
  const items = buildShelfItems(subjects);

  const folios: {
    mesh: Mesh;
    baseY: number;
    baseRotY: number;
    angleOffset: number;
  }[] = [];

  items.forEach((item, index) => {
    const height = item.live ? 1.58 + Math.min(item.count, 5) * 0.08 : 1.38 + (index % 2) * 0.08;
    const width = 0.28;
    const depth = 1.16;
    const geo = new BoxGeometry(width, height, depth);

    const coverTex = createFolioCoverTexture(item, index, isLight);
    const spineTex = createSpineTexture(item, isLight);

    const coverMat = new MeshStandardMaterial({
      map: coverTex,
      roughness: 0.32,
      metalness: 0.12,
    });
    const spineMat = new MeshStandardMaterial({
      map: spineTex,
      roughness: 0.35,
      metalness: 0.18,
    });
    const edgeMat = new MeshStandardMaterial({
      color: new Color(item.live ? (isLight ? 0xd9dff4 : 0x2c3556) : (isLight ? 0xe5e9f3 : 0x1b2130)),
      roughness: 0.42,
      metalness: 0.35,
    });

    // BoxGeometry material order: +x (right cover), -x (left cover), +y, -y, +z (front spine), -z (back spine)
    const materials = [coverMat, coverMat, edgeMat, edgeMat, spineMat, edgeMat];
    const folio = new Mesh(geo, materials);

    const centered = index - (items.length - 1) / 2;
    const xPos = centered * 0.66;
    const zPos = -Math.abs(centered) * 0.14;
    const rotY = -centered * 0.14;
    const baseY = height / 2 - 0.58;

    folio.position.set(xPos, baseY, zPos);
    folio.rotation.y = rotY;
    turntable.add(folio);

    folios.push({
      mesh: folio,
      baseY,
      baseRotY: rotY,
      angleOffset: -centered * 0.22,
    });
    disposables.push(geo, coverTex, spineTex, coverMat, spineMat, edgeMat);
  });

  // Architectural cylindrical studio pedestal + glowing accent halo ring
  const plinthGeo = new CylinderGeometry(2.35, 2.52, 0.18, 64);
  const plinthMat = new MeshStandardMaterial({
    color: new Color(isLight ? 0xe2e6f3 : 0x161b28),
    metalness: isLight ? 0.2 : 0.62,
    roughness: 0.35,
  });
  const plinth = new Mesh(plinthGeo, plinthMat);
  plinth.position.y = -0.68;
  turntable.add(plinth);

  const haloGeo = new TorusGeometry(2.42, 0.014, 12, 96);
  const haloMat = new MeshStandardMaterial({
    color: new Color(isLight ? 0x5157c4 : 0x9aa2ff),
    emissive: new Color(isLight ? 0x3b41a8 : 0x5860d8),
    emissiveIntensity: 0.5,
    metalness: 0.8,
    roughness: 0.2,
  });
  const halo = new Mesh(haloGeo, haloMat);
  halo.rotation.x = Math.PI / 2;
  halo.position.y = -0.59;
  turntable.add(halo);
  disposables.push(plinthGeo, plinthMat, haloGeo, haloMat);

  let disposed = false;
  let inView = true;
  let paused = isMotionPaused();
  let activeIndex = 0;
  let dragging = false;
  let lastX = 0;
  let userRotation = 0;
  let scrollOrbit = 0;
  let targetRotation = folios[0]?.angleOffset ?? 0;
  let currentRotation = targetRotation;
  let elapsed = 0;
  let lastNow = performance.now();
  let raf = 0;

  const resize = () => {
    if (disposed) return;
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 768 ? 1.5 : 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = 6.2 / Math.min(1, Math.max(0.68, camera.aspect / 1.45));
    camera.updateProjectionMatrix();
  };

  const renderFrame = (dt: number) => {
    if (!paused) elapsed += dt;

    const autoSway = paused || dragging ? 0 : Math.sin(elapsed * 0.45) * 0.14;
    const scrollSpin = paused ? 0 : scrollOrbit;
    const desiredRot = targetRotation + userRotation + scrollSpin + autoSway;
    currentRotation += (desiredRot - currentRotation) * 0.09;
    turntable.rotation.y = currentRotation;

    folios.forEach((f, idx) => {
      const selected = idx === activeIndex;
      const targetY = f.baseY + (selected ? 0.22 : 0) + (paused ? 0 : Math.sin(elapsed * 1.1 + idx) * 0.02);
      const targetZ = (-Math.abs(idx - (items.length - 1) / 2) * 0.14) + (selected ? 0.28 : 0);
      f.mesh.position.y += (targetY - f.mesh.position.y) * 0.12;
      f.mesh.position.z += (targetZ - f.mesh.position.z) * 0.12;
      const targetRot = f.baseRotY + (selected ? -0.32 : 0);
      f.mesh.rotation.y += (targetRot - f.mesh.rotation.y) * 0.12;
    });

    renderer.render(scene, camera);
  };

  const loop = (now: number) => {
    if (disposed) return;
    const dt = Math.min(0.05, Math.max(0, (now - lastNow) / 1000));
    lastNow = now;
    if (inView && document.visibilityState === "visible") {
      renderFrame(dt);
      const settling = Math.abs(targetRotation + userRotation - currentRotation) > 0.002;
      if (!paused || dragging || settling) {
        raf = requestAnimationFrame(loop);
        return;
      }
    }
    if (!paused) {
      raf = requestAnimationFrame(loop);
    }
  };

  const wake = () => {
    cancelAnimationFrame(raf);
    lastNow = performance.now();
    raf = requestAnimationFrame(loop);
  };

  const down = (event: PointerEvent) => {
    dragging = true;
    lastX = event.clientX;
    host.dataset.dragging = "true";
    try {
      renderer.domElement.setPointerCapture(event.pointerId);
    } catch {}
    wake();
  };

  const move = (event: PointerEvent) => {
    if (!dragging) return;
    userRotation = MathUtils.clamp(userRotation + (event.clientX - lastX) * 0.009, -1.6, 1.6);
    lastX = event.clientX;
    wake();
  };

  const up = () => {
    if (!dragging) return;
    dragging = false;
    delete host.dataset.dragging;
    wake();
  };

  const lost = (event: Event) => {
    event.preventDefault();
    dispose();
    onFallback();
  };

  const onVisibility = () => {
    if (document.visibilityState === "visible" && inView) wake();
  };

  let io: IntersectionObserver | undefined;
  if (typeof IntersectionObserver !== "undefined") {
    io = new IntersectionObserver(entries => {
      inView = entries[0]?.isIntersecting ?? true;
      if (inView) wake();
    });
    io.observe(host);
  }

  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : undefined;
  ro?.observe(host);

  const unsubPause = subscribeMotionPaused(() => {
    paused = isMotionPaused();
    wake();
  });

  const onScroll = () => {
    const rect = host.getBoundingClientRect();
    const vh = Math.max(1, window.innerHeight);
    const norm = 1 - (rect.top + rect.height / 2) / vh; // -0.5 entering -> +1.5 leaving
    scrollOrbit = MathUtils.clamp((norm - 0.5) * 1.15, -0.85, 0.85);
    if (!paused && inView) wake();
  };

  renderer.domElement.addEventListener("pointerdown", down);
  renderer.domElement.addEventListener("pointermove", move);
  renderer.domElement.addEventListener("pointerup", up);
  renderer.domElement.addEventListener("pointercancel", up);
  renderer.domElement.addEventListener("webglcontextlost", lost);
  window.addEventListener("resize", resize);
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);

  onScroll();
  resize();
  renderFrame(0.016);
  wake();

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    unsubPause();
    io?.disconnect();
    ro?.disconnect();
    window.removeEventListener("resize", resize);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVisibility);
    renderer.domElement.removeEventListener("pointerdown", down);
    renderer.domElement.removeEventListener("pointermove", move);
    renderer.domElement.removeEventListener("pointerup", up);
    renderer.domElement.removeEventListener("pointercancel", up);
    renderer.domElement.removeEventListener("webglcontextlost", lost);
    disposables.forEach(d => d.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  }

  return {
    dispose,
    setActiveIndex(index: number) {
      activeIndex = MathUtils.clamp(index, 0, folios.length - 1);
      userRotation = 0;
      targetRotation = folios[activeIndex]?.angleOffset ?? 0;
      wake();
    },
  };
}
