import {
  ACESFilmicToneMapping,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  OctahedronGeometry,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  Scene,
  Shape,
  SRGBColorSpace,
  TorusGeometry,
  WebGLRenderer,
} from "three";
import type { EducationalDocument } from "@/types/document";
import { isMotionPaused, subscribeMotionPaused } from "@/components/layout/motion-state";

export interface ShowcaseController {
  dispose: () => void;
  setProgress: (progress: number) => void;
}

interface LayerSpec {
  step: string;
  tag: string;
  title: string;
  detail: string;
  accent: string;
  kind: "cover" | "taxonomy" | "slides" | "source";
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines: string[] = [];
  let line = words[0];
  for (let i = 1; i < words.length; i++) {
    const test = `${line} ${words[i]}`;
    if (ctx.measureText(test).width <= maxW) {
      line = test;
    } else {
      lines.push(line);
      line = words[i];
      if (lines.length === maxLines - 1) break;
    }
  }
  lines.push(line);
  return lines.slice(0, maxLines);
}

function createLayerTexture(spec: LayerSpec, isLight: boolean, isBackFace = false): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 540;
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  const H = canvas.height;
  const pad = 16;
  const radius = 38;

  ctx.clearRect(0, 0, W, H);
  roundedRect(ctx, pad, pad, W - pad * 2, H - pad * 2, radius);
  ctx.save();
  ctx.clip();

  // Rich glass/studio plate gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  if (isLight) {
    grad.addColorStop(0, isBackFace ? "#eef1fb" : "#ffffff");
    grad.addColorStop(1, isBackFace ? "#dfe5f6" : "#eaeeff");
  } else {
    grad.addColorStop(0, isBackFace ? "#151b2c" : "#1c233a");
    grad.addColorStop(0.55, "#111625");
    grad.addColorStop(1, "#0b0e18");
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Corner glow
  const glow = ctx.createRadialGradient(W * 0.82, H * 0.18, 8, W * 0.82, H * 0.18, W * 0.65);
  glow.addColorStop(0, isLight ? "rgba(81,87,196,0.16)" : "rgba(165,170,255,0.22)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Top chrome bar
  ctx.fillStyle = spec.accent;
  ctx.fillRect(54, 46, 78, 6);

  ctx.fillStyle = spec.accent;
  ctx.font = "700 20px system-ui, -apple-system, sans-serif";
  ctx.fillText(`LAYER ${spec.step}  •  ${spec.tag.toUpperCase()}`, 54, 92);

  // Status orb on top-right
  ctx.fillStyle = "#91d8bd";
  ctx.beginPath();
  ctx.arc(W - 64, 84, 7, 0, Math.PI * 2);
  ctx.fill();

  if (isBackFace) {
    // Clean architectural backplate emblem when viewed from 180° orbit
    ctx.strokeStyle = isLight ? "rgba(81,87,196,0.2)" : "rgba(165,170,255,0.22)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2 + 12, 110, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(W / 2, H / 2 + 12, 72, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = isLight ? "#1a2031" : "#f2f3f8";
    ctx.font = "600 34px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(spec.tag, W / 2, H / 2 + 10);
    ctx.fillStyle = spec.accent;
    ctx.font = "500 20px system-ui, -apple-system, sans-serif";
    ctx.fillText(`HARSHIT PRESENTATION HUB • ${spec.step}`, W / 2, H / 2 + 46);
    ctx.textAlign = "left";
  } else {
    // Primary title
    ctx.fillStyle = isLight ? "#151b2c" : "#f5f6fc";
    ctx.font = "600 44px system-ui, -apple-system, sans-serif";
    const lines = wrapText(ctx, spec.title, W - 112, 2);
    lines.forEach((l, i) => ctx.fillText(l, 54, 158 + i * 50));

    // Subtitle
    const subY = 162 + lines.length * 50;
    ctx.fillStyle = isLight ? "#525c73" : "#a8b1c7";
    ctx.font = "italic 25px Georgia, serif";
    ctx.fillText(spec.detail, 54, subY);

    // Bespoke layer diagram in lower half
    const boxY = 300;
    if (spec.kind === "cover") {
      // Presentation hero bars + slide ratio badge
      const widths = [0.82, 0.64, 0.48];
      const cols = [spec.accent, "#91d8bd", "#e2c58c"];
      widths.forEach((wFrac, idx) => {
        roundedRect(ctx, 54, boxY + idx * 46, (W - 260) * wFrac, 22, 11);
        ctx.fillStyle = cols[idx];
        ctx.fill();
      });
      roundedRect(ctx, W - 186, boxY, 132, 120, 22);
      ctx.fillStyle = isLight ? "rgba(81,87,196,0.1)" : "rgba(165,170,255,0.14)";
      ctx.fill();
      ctx.fillStyle = spec.accent;
      ctx.font = "700 34px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("16:9", W - 120, boxY + 72);
      ctx.textAlign = "left";
    } else if (spec.kind === "taxonomy") {
      // Structured taxonomy pills
      const chips = ["Subject: English", "Course: Class 12", "Type: Slides Deck", "Topic: Lost Spring"];
      chips.forEach((chip, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const cx = 54 + col * 352;
        const cy = boxY + row * 74;
        roundedRect(ctx, cx, cy, 332, 56, 16);
        ctx.fillStyle = isLight ? "rgba(35,116,87,0.09)" : "rgba(145,216,189,0.11)";
        ctx.fill();
        ctx.strokeStyle = isLight ? "rgba(35,116,87,0.3)" : "rgba(145,216,189,0.32)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = isLight ? "#1a2031" : "#eef2fa";
        ctx.font = "600 21px system-ui, -apple-system, sans-serif";
        ctx.fillText(chip, cx + 22, cy + 35);
      });
    } else if (spec.kind === "slides") {
      // 3-up miniature slide cards
      for (let s = 0; s < 3; s++) {
        const sx = 54 + s * 236;
        roundedRect(ctx, sx, boxY, 214, 146, 18);
        ctx.fillStyle = isLight ? "rgba(81,87,196,0.07)" : "rgba(255,255,255,0.05)";
        ctx.fill();
        ctx.strokeStyle = isLight ? "rgba(81,87,196,0.24)" : "rgba(226,197,140,0.32)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = spec.accent;
        ctx.font = "700 18px system-ui, -apple-system, sans-serif";
        ctx.fillText(`SLIDE 0${s + 1}`, sx + 20, boxY + 38);
        ctx.fillStyle = isLight ? "rgba(30,41,75,0.18)" : "rgba(255,255,255,0.18)";
        ctx.fillRect(sx + 20, boxY + 62, 160, 10);
        ctx.fillRect(sx + 20, boxY + 84, 120, 10);
        ctx.fillRect(sx + 20, boxY + 106, 90, 10);
      }
    } else {
      // Verified direct cloud link badge
      roundedRect(ctx, 54, boxY + 8, W - 108, 132, 24);
      ctx.fillStyle = isLight ? "rgba(81,87,196,0.09)" : "rgba(165,170,255,0.12)";
      ctx.fill();
      ctx.strokeStyle = spec.accent;
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.fillStyle = "#91d8bd";
      ctx.beginPath();
      ctx.arc(104, boxY + 74, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isLight ? "#1a2031" : "#f5f6fc";
      ctx.font = "600 26px system-ui, -apple-system, sans-serif";
      ctx.fillText("Opens Original Cloud Source Directly  ↗", 136, boxY + 68);
      ctx.fillStyle = isLight ? "#586176" : "#a6adbf";
      ctx.font = "500 20px system-ui, -apple-system, sans-serif";
      ctx.fillText("Google Slides • Docs • Sheets • Drive • Dropbox", 136, boxY + 104);
    }
  }

  ctx.restore();

  // Outer specular border
  roundedRect(ctx, pad, pad, W - pad * 2, H - pad * 2, radius);
  ctx.strokeStyle = isLight ? "rgba(81,87,196,0.32)" : "rgba(185,192,255,0.38)";
  ctx.lineWidth = 3.5;
  ctx.stroke();

  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

function createBokehTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(185,192,255,0.6)");
  g.addColorStop(1, "rgba(165,170,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function createWideSlabGeometry(width: number, height: number, radius: number, depth: number): ExtrudeGeometry {
  const shape = new Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + radius, y);
  shape.lineTo(x + width - radius, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + height - radius);
  shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  shape.lineTo(x + radius, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - radius);
  shape.lineTo(x, y + radius);
  shape.quadraticCurveTo(x, y, x + radius, y);

  const geo = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.025,
    bevelSegments: 3,
    curveSegments: 14,
  });
  geo.center();
  return geo;
}

/**
 * Sticky scroll-scrubbed 3D Exploded Presentation Assembly.
 * Progress (0 -> 1) directly drives a 4-layer Z-axis explosion, 220° 3D orbital
 * camera/rig sweep, laser alignment rails, and magnetic re-assembly.
 */
export function mountScrollShowcase(
  host: HTMLElement,
  doc: EducationalDocument | undefined,
  onFallback: () => void,
): ShowcaseController | undefined {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
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
  const accentPrimary = isLight ? "#5157c4" : "#a5aaff";
  const accentEmerald = isLight ? "#237457" : "#91d8bd";
  const accentAmber = isLight ? "#866020" : "#e2c58c";

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = isLight ? 1.08 : 1.18;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 80);

  const world = new Group();
  scene.add(world);

  const deckCluster = new Group();
  world.add(deckCluster);

  scene.add(new AmbientLight(isLight ? 0xffffff : 0xdde2ff, isLight ? 1.35 : 0.92));

  const keyLight = new DirectionalLight(0xffffff, isLight ? 1.65 : 2.0);
  keyLight.position.set(-4, 5, 6);
  scene.add(keyLight);

  const rimLight = new DirectionalLight(isLight ? 0x5157c4 : 0x9aa2ff, 1.65);
  rimLight.position.set(4.5, -2.5, -3.5);
  scene.add(rimLight);

  const coreLight = new PointLight(isLight ? 0x5157c4 : 0x91d8bd, isLight ? 2.2 : 4.4, 9, 1.5);
  coreLight.position.set(0, 0, 0);
  deckCluster.add(coreLight);

  const disposables: { dispose: () => void }[] = [];

  const layerSpecs: LayerSpec[] = [
    {
      step: "01",
      tag: doc?.platform ?? "Google Slides",
      title: doc?.title ?? "MCQs Practice",
      detail: doc?.topic ?? "Ch 2 – The Lost Spring",
      accent: accentPrimary,
      kind: "cover",
    },
    {
      step: "02",
      tag: "Academic Context",
      title: `${doc?.subject ?? "English"} • ${doc?.course ?? "Class 12"}`,
      detail: "Structured taxonomy before you open a single tab.",
      accent: accentEmerald,
      kind: "taxonomy",
    },
    {
      step: "03",
      tag: "Slide Architecture",
      title: "Clear Visual Breakdown",
      detail: "Key concepts, practice prompts & revision flow.",
      accent: accentAmber,
      kind: "slides",
    },
    {
      step: "04",
      tag: "Verified Source",
      title: "Direct Owner Link",
      detail: "Zero sign-up wall. Always up to date at the source.",
      accent: accentPrimary,
      kind: "source",
    },
  ];

  const plateW = 3.1;
  const plateH = 2.08;
  const slabDepth = 0.055;
  const sharedChassisGeo = createWideSlabGeometry(plateW * 0.97, plateH * 0.97, 0.12, slabDepth);
  const sharedFaceGeo = new PlaneGeometry(plateW, plateH);
  const chassisMat = new MeshStandardMaterial({
    color: new Color(isLight ? 0xd5dcf0 : 0x242c44),
    metalness: isLight ? 0.38 : 0.78,
    roughness: 0.24,
  });
  disposables.push(sharedChassisGeo, sharedFaceGeo, chassisMat);

  const plates: Group[] = [];
  layerSpecs.forEach(spec => {
    const group = new Group();
    const chassis = new Mesh(sharedChassisGeo, chassisMat);
    group.add(chassis);

    const frontTex = createLayerTexture(spec, isLight, false);
    const backTex = createLayerTexture(spec, isLight, true);

    const frontMat = new MeshStandardMaterial({
      map: frontTex,
      transparent: true,
      roughness: 0.26,
      metalness: 0.08,
    });
    const backMat = new MeshStandardMaterial({
      map: backTex,
      transparent: true,
      roughness: 0.3,
      metalness: 0.1,
    });

    const front = new Mesh(sharedFaceGeo, frontMat);
    front.position.z = slabDepth / 2 + 0.027;
    group.add(front);

    const back = new Mesh(sharedFaceGeo, backMat);
    back.rotation.y = Math.PI;
    back.position.z = -(slabDepth / 2 + 0.027);
    group.add(back);

    disposables.push(frontTex, backTex, frontMat, backMat);
    deckCluster.add(group);
    plates.push(group);
  });

  // 4 glowing laser alignment rails connecting corners of the exploded stack
  const railGeo = new CylinderGeometry(0.012, 0.012, 1, 10);
  railGeo.rotateX(Math.PI / 2);
  const railMat = new MeshStandardMaterial({
    color: new Color(isLight ? 0x5157c4 : 0x91d8bd),
    emissive: new Color(isLight ? 0x3f45b0 : 0x4f9e84),
    emissiveIntensity: 0.75,
    transparent: true,
    opacity: 0,
  });
  const railCorners: [number, number][] = [
    [-1.36, 0.86],
    [1.36, 0.86],
    [-1.36, -0.86],
    [1.36, -0.86],
  ];
  const rails: Mesh[] = railCorners.map(([cx, cy]) => {
    const r = new Mesh(railGeo, railMat);
    r.position.set(cx, cy, 0);
    deckCluster.add(r);
    return r;
  });
  disposables.push(railGeo, railMat);

  // Dual gyroscopic orbital rings + floating crystals
  const gyroGroup = new Group();
  world.add(gyroGroup);

  const ringMat = new MeshStandardMaterial({
    color: new Color(isLight ? 0x5157c4 : 0x9aa2ff),
    emissive: new Color(isLight ? 0x2e3494 : 0x3b42a8),
    emissiveIntensity: 0.35,
    metalness: 0.85,
    roughness: 0.18,
    transparent: true,
    opacity: isLight ? 0.32 : 0.42,
  });
  const outerRingGeo = new TorusGeometry(2.85, 0.014, 12, 110);
  const outerRing = new Mesh(outerRingGeo, ringMat);
  outerRing.rotation.set(1.08, 0.25, 0);
  gyroGroup.add(outerRing);

  const innerRingGeo = new TorusGeometry(2.35, 0.01, 12, 96);
  const innerRing = new Mesh(innerRingGeo, ringMat);
  innerRing.rotation.set(-0.85, -0.4, 0.3);
  gyroGroup.add(innerRing);

  const gemGeo = new OctahedronGeometry(0.09, 0);
  const gemMat = new MeshStandardMaterial({
    color: new Color(0x91d8bd),
    emissive: new Color(0x2d7a60),
    emissiveIntensity: 0.55,
    metalness: 0.7,
    roughness: 0.18,
  });
  const gems: Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const gem = new Mesh(gemGeo, gemMat);
    gyroGroup.add(gem);
    gems.push(gem);
  }
  disposables.push(ringMat, outerRingGeo, innerRingGeo, gemGeo, gemMat);

  // Optical bokeh depth field that rushes past on scroll
  const pCount = 72;
  const pPositions = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPositions[i * 3] = (Math.random() - 0.5) * 10;
    pPositions[i * 3 + 1] = (Math.random() - 0.5) * 7;
    pPositions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
  }
  const pGeo = new BufferGeometry();
  pGeo.setAttribute("position", new BufferAttribute(pPositions, 3));
  const bokehTex = createBokehTexture();
  const pMat = new PointsMaterial({
    color: isLight ? 0x5157c4 : 0xa5aaff,
    map: bokehTex,
    size: 0.18,
    transparent: true,
    opacity: isLight ? 0.42 : 0.65,
    depthWrite: false,
  });
  const bokeh = new Points(pGeo, pMat);
  scene.add(bokeh);
  disposables.push(pGeo, bokehTex, pMat);

  let disposed = false;
  let inView = true;
  let paused = isMotionPaused();
  let targetProgress = 0;
  let smoothProgress = 0;
  let pointerX = 0;
  let pointerY = 0;
  let smoothPX = 0;
  let smoothPY = 0;
  let isPortrait = false;
  let baseCamZ = 6.6;
  let elapsed = 0;
  let lastNow = performance.now();
  let raf = 0;

  const resize = () => {
    if (disposed) return;
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    isPortrait = width < 860;
    baseCamZ = isPortrait
      ? 7.8 / Math.min(1, Math.max(0.58, camera.aspect / 0.78))
      : 6.35 / Math.min(1, Math.max(0.76, camera.aspect / 1.35));
    camera.updateProjectionMatrix();
  };

  const renderFrame = (dt: number) => {
    if (!paused) elapsed += dt;

    smoothProgress += (targetProgress - smoothProgress) * 0.11;
    smoothPX += (pointerX - smoothPX) * 0.08;
    smoothPY += (pointerY - smoothPY) * 0.08;

    const p = smoothProgress;

    // Bell-shaped explosion curve: closed at 0, wide open 0.25..0.75, snaps shut at 1.0
    const openIn = MathUtils.smoothstep(p, 0.06, 0.38);
    const closeOut = 1 - MathUtils.smoothstep(p, 0.76, 0.97);
    const explode = openIn * closeOut;

    // Full 3D orbital sweep driven directly by scroll progress!
    const sweepY = -0.38 + p * Math.PI * 1.18 + (paused ? 0 : smoothPX * 0.18);
    const sweepX = 0.14 + Math.sin(p * Math.PI * 2) * 0.24 + (paused ? 0 : -smoothPY * 0.12);
    const sweepZ = Math.sin(p * Math.PI) * -0.08;

    deckCluster.rotation.set(sweepX, sweepY, sweepZ);

    // Offset cluster right on wide desktop so left HUD never overlaps; upper-half on mobile portrait
    const stageOffsetX = isPortrait ? 0 : MathUtils.lerp(1.15, 0.95, explode);
    const stageOffsetY = isPortrait ? 0.82 : 0.04;
    world.position.set(stageOffsetX, stageOffsetY + (paused ? 0 : Math.sin(elapsed * 0.9) * 0.05), 0);

    // Z-axis plate separation + subtle fan staircase
    const tightSpacing = 0.11;
    const explodedSpacing = 0.92;
    const spacing = MathUtils.lerp(tightSpacing, explodedSpacing, explode);
    const totalSpan = spacing * (plates.length - 1);

    plates.forEach((plate, idx) => {
      const centered = (plates.length - 1) / 2 - idx;
      const zPos = centered * spacing;
      const yWave = explode * Math.sin(p * Math.PI * 2 + idx * 0.9) * 0.09;
      plate.position.set(0, yWave, zPos);
      plate.rotation.z = explode * (idx - 1.5) * 0.025;
    });

    // Laser guide rails stretch across the exact exploded span
    railMat.opacity = explode * (isLight ? 0.55 : 0.78);
    rails.forEach(rail => {
      rail.scale.set(1, 1, Math.max(0.05, totalSpan));
    });
    coreLight.intensity = (isLight ? 1.4 : 2.6) + explode * 2.8;

    // Gyroscopic rings spin aggressively with scroll velocity & progress
    gyroGroup.rotation.y = -p * Math.PI * 1.6 + elapsed * 0.08;
    gyroGroup.rotation.x = p * Math.PI * 0.75;
    outerRing.scale.setScalar(1 + explode * 0.12);
    innerRing.scale.setScalar(1 - explode * 0.06);

    gems.forEach((gem, i) => {
      const a = p * Math.PI * 3 + elapsed * 0.5 + (i * Math.PI) / 2;
      const r = 2.65 + explode * 0.25;
      gem.position.set(Math.cos(a) * r, Math.sin(a * 1.3) * 1.25, Math.sin(a) * r * 0.55);
      gem.rotation.set(a, a * 0.7, 0);
    });

    // Camera dollies dynamically through Z-space as you scroll
    const camDolly = Math.sin(p * Math.PI) * -0.55;
    camera.position.set(0, 0, baseCamZ + camDolly);
    camera.lookAt(0, 0, 0);

    // Bokeh field flies past vertically & rotationally on scroll
    bokeh.position.y = (p - 0.5) * 2.4;
    bokeh.rotation.y = p * 0.85 + elapsed * 0.02;

    renderer.render(scene, camera);
  };

  const loop = (now: number) => {
    if (disposed) return;
    const dt = Math.min(0.05, Math.max(0, (now - lastNow) / 1000));
    lastNow = now;
    if (inView && document.visibilityState === "visible") {
      renderFrame(dt);
      const scrubbing = Math.abs(targetProgress - smoothProgress) > 0.0008;
      if (!paused || scrubbing) {
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

  const onPointerMove = (event: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    pointerX = MathUtils.clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
    pointerY = MathUtils.clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
  };

  const onVisibility = () => {
    if (document.visibilityState === "visible" && inView) wake();
  };

  const onContextLost = (event: Event) => {
    event.preventDefault();
    dispose();
    onFallback();
  };

  let io: IntersectionObserver | undefined;
  if (typeof IntersectionObserver !== "undefined") {
    io = new IntersectionObserver(
      entries => {
        inView = entries[0]?.isIntersecting ?? true;
        if (inView) wake();
      },
      { rootMargin: "200px" },
    );
    io.observe(host);
  }

  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : undefined;
  ro?.observe(host);

  const unsubPause = subscribeMotionPaused(() => {
    paused = isMotionPaused();
    wake();
  });

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", onVisibility);
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);

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
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVisibility);
    renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
    disposables.forEach(d => d.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  }

  return {
    dispose,
    setProgress(progress: number) {
      targetProgress = MathUtils.clamp(progress, 0, 1);
      wake();
    },
  };
}
