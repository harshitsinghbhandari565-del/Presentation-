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
  TorusGeometry,
  WebGLRenderer,
} from "three";
import type { EducationalDocument } from "@/types/document";
import { isMotionPaused, subscribeMotionPaused } from "@/components/layout/motion-state";
import {
  SANS_FONT_STACK,
  SERIF_FONT_STACK,
  computeCrispPixelRatio,
  configureSharpTexture,
  createHiResCanvas,
  onWebFontsReady,
  subscribeViewportZoom,
} from "./webgl-quality";

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
  secondary: string;
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

function drawHudCorners(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  len: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y);
  ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len);
  ctx.moveTo(x + w, y + h - len); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w - len, y + h);
  ctx.moveTo(x + len, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x, y + h - len);
  ctx.stroke();
  ctx.restore();
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

function paintLayerFace(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  spec: LayerSpec,
  isLight: boolean,
  isBackFace: boolean,
) {
  const pad = 16;
  const radius = 38;

  ctx.clearRect(0, 0, W, H);
  roundedRect(ctx, pad, pad, W - pad * 2, H - pad * 2, radius);
  ctx.save();
  ctx.clip();

  // Interstellar titanium hull plate gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  if (isLight) {
    grad.addColorStop(0, isBackFace ? "#ebf2fb" : "#ffffff");
    grad.addColorStop(1, isBackFace ? "#dce8f7" : "#e6effb");
  } else {
    grad.addColorStop(0, isBackFace ? "#0e1728" : "#121e34");
    grad.addColorStop(0.55, "#09101e");
    grad.addColorStop(1, "#04070e");
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Dual cosmic glow (Ice-Blue + Solar-Gold)
  const glow = ctx.createRadialGradient(W * 0.84, H * 0.16, 8, W * 0.84, H * 0.16, W * 0.68);
  glow.addColorStop(0, isLight ? "rgba(3,98,150,0.14)" : "rgba(125,211,252,0.22)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const warmGlow = ctx.createRadialGradient(W * 0.14, H * 0.86, 8, W * 0.14, H * 0.86, W * 0.56);
  warmGlow.addColorStop(0, isLight ? "rgba(138,93,16,0.08)" : "rgba(243,201,121,0.12)");
  warmGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = warmGlow;
  ctx.fillRect(0, 0, W, H);

  // Top telemetry bar
  ctx.fillStyle = spec.accent;
  roundedRect(ctx, 54, 46, 78, 6, 3);
  ctx.fill();

  ctx.fillStyle = spec.accent;
  ctx.font = `700 20px ${SANS_FONT_STACK}`;
  ctx.fillText(`ORB-${spec.step}  •  ${spec.tag.toUpperCase()}`, 54, 92);

  // Solar-Gold / Emerald status beacon on top-right
  ctx.fillStyle = spec.secondary;
  ctx.beginPath();
  ctx.arc(W - 64, 84, 7, 0, Math.PI * 2);
  ctx.fill();

  if (isBackFace) {
    // Astrolabe orbital backplate emblem when viewed from 180° orbit
    ctx.strokeStyle = isLight ? "rgba(3,98,150,0.25)" : "rgba(125,211,252,0.32)";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(W / 2, H / 2 + 12, 114, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = isLight ? "rgba(138,93,16,0.3)" : "rgba(243,201,121,0.4)";
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(W / 2, H / 2 + 12, 76, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = isLight ? "#0c1424" : "#f6f9ff";
    ctx.font = `600 34px ${SANS_FONT_STACK}`;
    ctx.textAlign = "center";
    ctx.fillText(spec.tag, W / 2, H / 2 + 10);
    ctx.fillStyle = spec.accent;
    ctx.font = `600 19px ${SANS_FONT_STACK}`;
    ctx.fillText(`ORBITAL ARCHIVE • SECTOR ${spec.step}`, W / 2, H / 2 + 46);
    ctx.textAlign = "left";
  } else {
    // Primary title
    ctx.fillStyle = isLight ? "#0c1424" : "#f8fbff";
    ctx.font = `600 44px ${SANS_FONT_STACK}`;
    const lines = wrapText(ctx, spec.title, W - 112, 2);
    lines.forEach((l, i) => ctx.fillText(l, 54, 158 + i * 50));

    // Subtitle
    const subY = 162 + lines.length * 50;
    ctx.fillStyle = isLight ? "#43526b" : "#b3c2d8";
    ctx.font = `italic 25px ${SERIF_FONT_STACK}`;
    ctx.fillText(spec.detail, 54, subY);

    // Bespoke holographic layer diagram in lower half
    const boxY = 300;
    if (spec.kind === "cover") {
      const widths = [0.82, 0.64, 0.48];
      const cols = [spec.accent, spec.secondary, isLight ? "#0f7656" : "#6ee7b7"];
      widths.forEach((wFrac, idx) => {
        roundedRect(ctx, 54, boxY + idx * 46, (W - 260) * wFrac, 22, 11);
        ctx.fillStyle = cols[idx];
        ctx.fill();
      });
      roundedRect(ctx, W - 186, boxY, 132, 120, 22);
      ctx.fillStyle = isLight ? "rgba(3,98,150,0.09)" : "rgba(125,211,252,0.12)";
      ctx.fill();
      ctx.strokeStyle = spec.secondary;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.fillStyle = spec.accent;
      ctx.font = `700 34px ${SANS_FONT_STACK}`;
      ctx.textAlign = "center";
      ctx.fillText("16:9", W - 120, boxY + 72);
      ctx.textAlign = "left";
    } else if (spec.kind === "taxonomy") {
      const chips = ["Subject: English", "Course: Class 12", "Type: Slides Deck", "Topic: Lost Spring"];
      chips.forEach((chip, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const cx = 54 + col * 352;
        const cy = boxY + row * 74;
        roundedRect(ctx, cx, cy, 332, 56, 16);
        ctx.fillStyle = isLight ? "rgba(138,93,16,0.08)" : "rgba(243,201,121,0.11)";
        ctx.fill();
        ctx.strokeStyle = isLight ? "rgba(138,93,16,0.34)" : "rgba(243,201,121,0.42)";
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.fillStyle = isLight ? "#0c1424" : "#f4f8ff";
        ctx.font = `600 21px ${SANS_FONT_STACK}`;
        ctx.fillText(chip, cx + 22, cy + 35);
      });
    } else if (spec.kind === "slides") {
      for (let s = 0; s < 3; s++) {
        const sx = 54 + s * 236;
        roundedRect(ctx, sx, boxY, 214, 146, 18);
        ctx.fillStyle = isLight ? "rgba(3,98,150,0.06)" : "rgba(125,211,252,0.055)";
        ctx.fill();
        ctx.strokeStyle = isLight ? "rgba(15,118,86,0.32)" : "rgba(110,231,183,0.4)";
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.fillStyle = spec.accent;
        ctx.font = `700 18px ${SANS_FONT_STACK}`;
        ctx.fillText(`SLIDE 0${s + 1}`, sx + 20, boxY + 38);
        ctx.fillStyle = isLight ? "rgba(12,20,36,0.2)" : "rgba(186,230,253,0.24)";
        roundedRect(ctx, sx + 20, boxY + 62, 160, 10, 5);
        ctx.fill();
        roundedRect(ctx, sx + 20, boxY + 84, 120, 10, 5);
        ctx.fill();
        roundedRect(ctx, sx + 20, boxY + 106, 90, 10, 5);
        ctx.fill();
      }
    } else {
      roundedRect(ctx, 54, boxY + 8, W - 108, 132, 24);
      ctx.fillStyle = isLight ? "rgba(3,98,150,0.09)" : "rgba(125,211,252,0.11)";
      ctx.fill();
      ctx.strokeStyle = spec.accent;
      ctx.lineWidth = 2.2;
      ctx.stroke();
      ctx.fillStyle = spec.secondary;
      ctx.beginPath();
      ctx.arc(104, boxY + 74, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = isLight ? "#0c1424" : "#f8fbff";
      ctx.font = `600 26px ${SANS_FONT_STACK}`;
      ctx.fillText("Opens Original Cloud Source Directly  ↗", 136, boxY + 68);
      ctx.fillStyle = isLight ? "#43526b" : "#aac0da";
      ctx.font = `500 20px ${SANS_FONT_STACK}`;
      ctx.fillText("Google Slides • Docs • Sheets • Drive • Dropbox", 136, boxY + 104);
    }
  }

  drawHudCorners(
    ctx,
    pad + 14,
    pad + 14,
    W - (pad + 14) * 2,
    H - (pad + 14) * 2,
    20,
    isLight ? "rgba(3,98,150,0.34)" : "rgba(243,201,121,0.44)",
  );

  ctx.restore();

  roundedRect(ctx, pad + 2, pad + 2, W - (pad + 2) * 2, H - (pad + 2) * 2, radius - 2);
  ctx.strokeStyle = isLight ? "rgba(255,255,255,0.8)" : "rgba(186,230,253,0.10)";
  ctx.lineWidth = 1.4;
  ctx.stroke();

  roundedRect(ctx, pad, pad, W - pad * 2, H - pad * 2, radius);
  ctx.strokeStyle = isLight ? "rgba(3,98,150,0.36)" : "rgba(125,211,252,0.44)";
  ctx.lineWidth = 3.2;
  ctx.stroke();
}

function createLayerTexture(
  spec: LayerSpec,
  isLight: boolean,
  renderer: WebGLRenderer,
  isBackFace = false,
): { texture: CanvasTexture; repaint: () => void } {
  const logicalW = 800;
  const logicalH = 540;
  const { canvas, ctx } = createHiResCanvas(logicalW, logicalH);
  paintLayerFace(ctx, logicalW, logicalH, spec, isLight, isBackFace);

  const texture = configureSharpTexture(new CanvasTexture(canvas), renderer);
  const repaint = () => {
    paintLayerFace(ctx, logicalW, logicalH, spec, isLight, isBackFace);
    texture.needsUpdate = true;
  };
  return { texture, repaint };
}

function createStarTexture(coreRgba: string, midRgba: string): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, coreRgba);
  g.addColorStop(0.36, midRgba);
  g.addColorStop(1, "rgba(0,0,0,0)");
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
    bevelSegments: 6,
    curveSegments: 32,
  });
  geo.center();
  return geo;
}

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
  const accentIce = isLight ? "#036296" : "#7dd3fc";
  const accentGold = isLight ? "#8a5d10" : "#f3c979";
  const accentMint = isLight ? "#0f7656" : "#6ee7b7";

  renderer.setPixelRatio(computeCrispPixelRatio(host.clientWidth || 1200, host.clientHeight || 720, renderer));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = isLight ? 1.05 : 1.13;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 80);

  const world = new Group();
  scene.add(world);

  const deckCluster = new Group();
  world.add(deckCluster);

  scene.add(new AmbientLight(isLight ? 0xffffff : 0xd4e8ff, isLight ? 1.38 : 0.98));

  const keyLight = new DirectionalLight(0xffffff, isLight ? 1.55 : 1.85);
  keyLight.position.set(-4, 5, 6);
  scene.add(keyLight);

  const rimLight = new DirectionalLight(isLight ? 0x036296 : 0xf3c979, 1.55);
  rimLight.position.set(4.5, -2.5, -3.5);
  scene.add(rimLight);

  const coreLight = new PointLight(isLight ? 0x036296 : 0x7dd3fc, isLight ? 2.0 : 3.9, 9, 1.5);
  coreLight.position.set(0, 0, 0);
  deckCluster.add(coreLight);

  const disposables: { dispose: () => void }[] = [];
  const textureRepainters: (() => void)[] = [];

  const layerSpecs: LayerSpec[] = [
    {
      step: "01",
      tag: doc?.platform ?? "Google Slides",
      title: doc?.title ?? "MCQs Practice",
      detail: doc?.topic ?? "Ch 2 – The Lost Spring",
      accent: accentIce,
      secondary: accentGold,
      kind: "cover",
    },
    {
      step: "02",
      tag: "Orbital Context",
      title: `${doc?.subject ?? "English"} • ${doc?.course ?? "Class 12"}`,
      detail: "Structured telemetry before you open a single tab.",
      accent: accentGold,
      secondary: accentIce,
      kind: "taxonomy",
    },
    {
      step: "03",
      tag: "Slide Matrix",
      title: "Clear Visual Breakdown",
      detail: "Key concepts, practice prompts & revision flow.",
      accent: accentMint,
      secondary: accentGold,
      kind: "slides",
    },
    {
      step: "04",
      tag: "Verified Uplink",
      title: "Direct Owner Link",
      detail: "Zero sign-up wall. Always up to date at the source.",
      accent: accentIce,
      secondary: accentGold,
      kind: "source",
    },
  ];

  const plateW = 3.1;
  const plateH = 2.08;
  const slabDepth = 0.055;
  const sharedChassisGeo = createWideSlabGeometry(plateW * 0.97, plateH * 0.97, 0.12, slabDepth);
  const sharedFaceGeo = new PlaneGeometry(plateW, plateH);
  const chassisMat = new MeshStandardMaterial({
    color: new Color(isLight ? 0xd2dfef : 0x152238),
    metalness: isLight ? 0.38 : 0.8,
    roughness: 0.22,
  });
  disposables.push(sharedChassisGeo, sharedFaceGeo, chassisMat);

  const plates: Group[] = [];
  layerSpecs.forEach(spec => {
    const group = new Group();
    const chassis = new Mesh(sharedChassisGeo, chassisMat);
    group.add(chassis);

    const frontTexBundle = createLayerTexture(spec, isLight, renderer, false);
    const backTexBundle = createLayerTexture(spec, isLight, renderer, true);
    textureRepainters.push(frontTexBundle.repaint, backTexBundle.repaint);

    const frontMat = new MeshStandardMaterial({
      map: frontTexBundle.texture,
      transparent: true,
      alphaTest: 0.02,
      roughness: 0.34,
      metalness: 0.04,
    });
    const backMat = new MeshStandardMaterial({
      map: backTexBundle.texture,
      transparent: true,
      alphaTest: 0.02,
      roughness: 0.36,
      metalness: 0.06,
    });

    const front = new Mesh(sharedFaceGeo, frontMat);
    front.position.z = slabDepth / 2 + 0.027;
    group.add(front);

    const back = new Mesh(sharedFaceGeo, backMat);
    back.rotation.y = Math.PI;
    back.position.z = -(slabDepth / 2 + 0.027);
    group.add(back);

    disposables.push(frontTexBundle.texture, backTexBundle.texture, frontMat, backMat);
    deckCluster.add(group);
    plates.push(group);
  });

  // 4 glowing Ice-Blue laser alignment rails connecting corners of the exploded stack
  const railGeo = new CylinderGeometry(0.012, 0.012, 1, 12);
  railGeo.rotateX(Math.PI / 2);
  const railMat = new MeshStandardMaterial({
    color: new Color(isLight ? 0x036296 : 0x7dd3fc),
    emissive: new Color(isLight ? 0x024469 : 0x38bdf8),
    emissiveIntensity: 0.85,
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

  // Dual Ice-Blue & Solar-Gold gyroscopic orbital rings + telemetry beacons
  const gyroGroup = new Group();
  world.add(gyroGroup);

  const iceRingMat = new MeshStandardMaterial({
    color: new Color(isLight ? 0x036296 : 0x7dd3fc),
    emissive: new Color(isLight ? 0x024469 : 0x256b96),
    emissiveIntensity: 0.42,
    metalness: 0.85,
    roughness: 0.18,
    transparent: true,
    opacity: isLight ? 0.34 : 0.48,
  });
  const goldRingMat = new MeshStandardMaterial({
    color: new Color(isLight ? 0x8a5d10 : 0xf3c979),
    emissive: new Color(isLight ? 0x5e3e08 : 0x8c641e),
    emissiveIntensity: 0.45,
    metalness: 0.88,
    roughness: 0.18,
    transparent: true,
    opacity: isLight ? 0.32 : 0.46,
  });

  const outerRingGeo = new TorusGeometry(2.85, 0.014, 16, 128);
  const outerRing = new Mesh(outerRingGeo, iceRingMat);
  outerRing.rotation.set(1.08, 0.25, 0);
  gyroGroup.add(outerRing);

  const innerRingGeo = new TorusGeometry(2.35, 0.011, 16, 128);
  const innerRing = new Mesh(innerRingGeo, goldRingMat);
  innerRing.rotation.set(-0.85, -0.4, 0.3);
  gyroGroup.add(innerRing);

  const gemGeo = new OctahedronGeometry(0.09, 0);
  const gemMat = new MeshStandardMaterial({
    color: new Color(isLight ? 0x8a5d10 : 0xf3c979),
    emissive: new Color(isLight ? 0x5e3e08 : 0x9c6d1c),
    emissiveIntensity: 0.6,
    metalness: 0.75,
    roughness: 0.16,
  });
  const gems: Mesh[] = [];
  for (let i = 0; i < 4; i++) {
    const gem = new Mesh(gemGeo, gemMat);
    gyroGroup.add(gem);
    gems.push(gem);
  }
  disposables.push(iceRingMat, goldRingMat, outerRingGeo, innerRingGeo, gemGeo, gemMat);

  // Dual-tone Interstellar Starfield that rushes past on scroll
  const makeWarpStars = (count: number, size: number, color: number, core: string, mid: string) => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10.5;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 7.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8.5 - 1;
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    const tex = createStarTexture(core, mid);
    const mat = new PointsMaterial({
      color,
      map: tex,
      size,
      transparent: true,
      opacity: isLight ? 0.42 : 0.78,
      depthWrite: false,
    });
    const pts = new Points(geo, mat);
    scene.add(pts);
    disposables.push(geo, tex, mat);
    return pts;
  };

  const iceBokeh = makeWarpStars(
    72,
    0.16,
    isLight ? 0x036296 : 0xbae6fd,
    "rgba(255,255,255,1)",
    "rgba(125,211,252,0.7)",
  );
  const goldBokeh = makeWarpStars(
    36,
    0.18,
    isLight ? 0x8a5d10 : 0xf3c979,
    "rgba(255,250,235,1)",
    "rgba(243,201,121,0.72)",
  );

  let disposed = false;
  let inView = true;
  let paused = isMotionPaused();
  let targetProgress = 0;
  let smoothProgress = 0;
  let pointerX = 0;
  let pointerY = 0;
  let smoothPX = 0;
  let smoothPY = 0;
  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragTravel = 0;
  let userYaw = 0;
  let userPitch = 0;
  let targetYaw = 0;
  let targetPitch = 0;
  let flipTarget = 0;
  let flipCurrent = 0;
  let isPortrait = false;
  let baseCamZ = 6.6;
  let elapsed = 0;
  let lastNow = performance.now();
  let raf = 0;

  const renderFrame = (dt: number) => {
    if (!paused) elapsed += dt;

    smoothProgress += (targetProgress - smoothProgress) * 0.11;
    smoothPX += (pointerX - smoothPX) * 0.08;
    smoothPY += (pointerY - smoothPY) * 0.08;
    if (!dragging) {
      targetYaw *= 0.95;
      targetPitch *= 0.95;
    }
    userYaw += (targetYaw - userYaw) * 0.13;
    userPitch += (targetPitch - userPitch) * 0.13;
    flipCurrent += (flipTarget - flipCurrent) * 0.1;

    const p = smoothProgress;

    const openIn = MathUtils.smoothstep(p, 0.06, 0.38);
    const closeOut = 1 - MathUtils.smoothstep(p, 0.76, 0.97);
    const explode = openIn * closeOut;

    const sweepY = -0.38 + p * Math.PI * 1.18 + userYaw + flipCurrent + (paused ? 0 : smoothPX * 0.2);
    const sweepX = MathUtils.clamp(0.14 + Math.sin(p * Math.PI * 2) * 0.24 + userPitch + (paused ? 0 : -smoothPY * 0.14), -0.68, 0.68);
    const sweepZ = Math.sin(p * Math.PI) * -0.08;

    deckCluster.rotation.set(sweepX, sweepY, sweepZ);

    const stageOffsetX = isPortrait ? 0 : MathUtils.lerp(1.15, 0.95, explode);
    const stageOffsetY = isPortrait ? 0.82 : 0.04;
    world.position.set(stageOffsetX, stageOffsetY + (paused ? 0 : Math.sin(elapsed * 0.9) * 0.05), 0);

    const tightSpacing = 0.11;
    const explodedSpacing = 1.14;
    const spacing = MathUtils.lerp(tightSpacing, explodedSpacing, explode);
    const totalSpan = spacing * (plates.length - 1);

    plates.forEach((plate, idx) => {
      const centered = (plates.length - 1) / 2 - idx;
      const zPos = centered * spacing;
      const xSpread = explode * centered * (isPortrait ? 0.24 : 0.42);
      const yStair = explode * centered * -0.22;
      const yWave = explode * Math.sin(p * Math.PI * 2 + idx * 0.9) * 0.08;
      plate.position.set(xSpread, yStair + yWave, zPos);
      plate.rotation.z = explode * (idx - 1.5) * 0.045;
      plate.rotation.y = explode * centered * 0.06;
    });

    railMat.opacity = explode * (isLight ? 0.58 : 0.82);
    rails.forEach(rail => {
      rail.scale.set(1, 1, Math.max(0.05, totalSpan));
    });
    coreLight.intensity = (isLight ? 1.3 : 2.4) + explode * 2.5;

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

    const camDolly = Math.sin(p * Math.PI) * -0.55;
    camera.position.set(0, 0, baseCamZ + camDolly);
    camera.lookAt(0, 0, 0);

    iceBokeh.position.y = (p - 0.5) * 2.6;
    iceBokeh.rotation.y = p * 0.88 + elapsed * 0.022;
    goldBokeh.position.y = (p - 0.5) * 1.85;
    goldBokeh.rotation.y = -p * 0.65 - elapsed * 0.016;

    renderer.render(scene, camera);
  };

  const resize = () => {
    if (disposed) return;
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(computeCrispPixelRatio(width, height, renderer));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    isPortrait = width < 860;
    baseCamZ = isPortrait
      ? 7.8 / Math.min(1, Math.max(0.58, camera.aspect / 0.78))
      : 6.35 / Math.min(1, Math.max(0.76, camera.aspect / 1.35));
    camera.updateProjectionMatrix();
    if (inView) renderFrame(0);
  };

  const loop = (now: number) => {
    if (disposed) return;
    const dt = Math.min(0.05, Math.max(0, (now - lastNow) / 1000));
    lastNow = now;
    if (inView && document.visibilityState === "visible") {
      renderFrame(dt);
      const scrubbing =
        Math.abs(targetProgress - smoothProgress) > 0.0008 ||
        Math.abs(flipTarget - flipCurrent) > 0.003 ||
        dragging;
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

  const unsubFonts = onWebFontsReady(() => {
    if (disposed) return;
    textureRepainters.forEach(fn => fn());
    if (inView) renderFrame(0);
  });

  const unsubZoom = subscribeViewportZoom(resize);

  const onPointerMove = (event: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    pointerX = MathUtils.clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1, 1);
    pointerY = MathUtils.clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1, 1);
  };

  const onDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (paused || dragging || event.gamma === null || event.beta === null) return;
    pointerX = MathUtils.clamp(event.gamma / 28, -1, 1);
    pointerY = MathUtils.clamp((event.beta - 45) / 28, -1, 1);
    if (inView) wake();
  };

  const onStageDown = (event: PointerEvent) => {
    dragging = true;
    dragTravel = 0;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    host.dataset.dragging = "true";
    try {
      renderer.domElement.setPointerCapture(event.pointerId);
    } catch {}
    wake();
  };

  const onStageMove = (event: PointerEvent) => {
    if (!dragging) return;
    const dx = event.clientX - dragStartX;
    const dy = event.clientY - dragStartY;
    dragTravel += Math.hypot(dx, dy);
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    targetYaw = MathUtils.clamp(targetYaw + dx * 0.0085, -1.2, 1.2);
    targetPitch = MathUtils.clamp(targetPitch + dy * 0.006, -0.45, 0.45);
  };

  const onStageUp = () => {
    if (!dragging) return;
    dragging = false;
    delete host.dataset.dragging;
    if (dragTravel < 7) {
      flipTarget += Math.PI;
    }
    wake();
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
  window.addEventListener("deviceorientation", onDeviceOrientation, { passive: true });
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", onVisibility);
  renderer.domElement.addEventListener("pointerdown", onStageDown);
  renderer.domElement.addEventListener("pointermove", onStageMove);
  renderer.domElement.addEventListener("pointerup", onStageUp);
  renderer.domElement.addEventListener("pointercancel", onStageUp);
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);

  resize();
  renderFrame(0.016);
  wake();

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    unsubFonts();
    unsubZoom();
    unsubPause();
    io?.disconnect();
    ro?.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("deviceorientation", onDeviceOrientation);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVisibility);
    renderer.domElement.removeEventListener("pointerdown", onStageDown);
    renderer.domElement.removeEventListener("pointermove", onStageMove);
    renderer.domElement.removeEventListener("pointerup", onStageUp);
    renderer.domElement.removeEventListener("pointercancel", onStageUp);
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
