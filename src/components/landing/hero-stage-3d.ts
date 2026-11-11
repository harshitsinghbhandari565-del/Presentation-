import {
  ACESFilmicToneMapping,
  AmbientLight,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  DirectionalLight,
  ExtrudeGeometry,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PointLight,
  Points,
  PointsMaterial,
  Scene,
  Shape,
  WebGLRenderer,
} from "three";
import { createOrbitalInstrument } from "./orbital-instruments";
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

interface CardSpec {
  badge: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  footerLeft: string;
  footerRight: string;
  accentHex: string;
  secondaryHex: string;
  sectorCode: string;
  variant: "primary" | "secondary" | "tertiary";
}

function drawRoundedRect(
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

function drawHudCornerBrackets(
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
  ctx.lineWidth = 2.4;
  ctx.lineCap = "square";
  ctx.beginPath();
  // Top-left
  ctx.moveTo(x, y + len);
  ctx.lineTo(x, y);
  ctx.lineTo(x + len, y);
  // Top-right
  ctx.moveTo(x + w - len, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + len);
  // Bottom-right
  ctx.moveTo(x + w, y + h - len);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w - len, y + h);
  // Bottom-left
  ctx.moveTo(x + len, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x, y + h - len);
  ctx.stroke();
  ctx.restore();
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [""];
  const lines: string[] = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
      if (lines.length === maxLines - 1) break;
    }
  }
  lines.push(current);
  return lines.slice(0, maxLines);
}

function paintCardFace(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  spec: CardSpec,
  isLight: boolean,
) {
  const pad = 20;
  const radius = 50;

  ctx.clearRect(0, 0, W, H);

  // Outer rounded mask
  drawRoundedRect(ctx, pad, pad, W - pad * 2, H - pad * 2, radius);
  ctx.save();
  ctx.clip();

  // Interstellar hull surface gradient
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  if (isLight) {
    bgGrad.addColorStop(0, spec.variant === "primary" ? "#ffffff" : "#f5f9ff");
    bgGrad.addColorStop(1, spec.variant === "primary" ? "#e6effa" : "#dce8f7");
  } else {
    bgGrad.addColorStop(0, spec.variant === "primary" ? "#111c30" : "#0d1626");
    bgGrad.addColorStop(0.52, spec.variant === "primary" ? "#0a111f" : "#080e1a");
    bgGrad.addColorStop(1, "#04070e");
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Dual cosmic nebula glow (Ice-Blue upper right + Solar-Gold lower left)
  const glowIce = ctx.createRadialGradient(W * 0.84, H * 0.14, 10, W * 0.84, H * 0.14, W * 0.74);
  glowIce.addColorStop(0, isLight ? "rgba(3,98,150,0.14)" : "rgba(125,211,252,0.22)");
  glowIce.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glowIce;
  ctx.fillRect(0, 0, W, H);

  const glowGold = ctx.createRadialGradient(W * 0.16, H * 0.86, 10, W * 0.16, H * 0.86, W * 0.62);
  glowGold.addColorStop(0, isLight ? "rgba(138,93,16,0.09)" : "rgba(243,201,121,0.13)");
  glowGold.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glowGold;
  ctx.fillRect(0, 0, W, H);

  // Orbital star-chart coordinate grid hairlines
  ctx.strokeStyle = isLight ? "rgba(3,98,150,0.065)" : "rgba(125,211,252,0.055)";
  ctx.lineWidth = 1.2;
  for (let gx = 80; gx < W; gx += 76) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, H * 0.5);
    ctx.stroke();
  }
  for (let gy = 84; gy < H * 0.46; gy += 76) {
    ctx.beginPath();
    ctx.moveTo(pad, gy);
    ctx.lineTo(W - pad, gy);
    ctx.stroke();
  }

  // Header telemetry divider
  const headerH = 136;
  ctx.strokeStyle = isLight ? "rgba(12,20,36,0.11)" : "rgba(125,211,252,0.14)";
  ctx.lineWidth = 1.75;
  ctx.beginPath();
  ctx.moveTo(pad, pad + headerH);
  ctx.lineTo(W - pad, pad + headerH);
  ctx.stroke();

  // Flight-deck icon badge box
  drawRoundedRect(ctx, 66, 58, 68, 68, 18);
  ctx.fillStyle = isLight ? "rgba(3,98,150,0.09)" : "rgba(125,211,252,0.12)";
  ctx.fill();
  ctx.strokeStyle = spec.accentHex;
  ctx.globalAlpha = 0.52;
  ctx.lineWidth = 1.9;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Document telemetry glyph inside icon box
  ctx.strokeStyle = spec.accentHex;
  ctx.lineWidth = 3.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  drawRoundedRect(ctx, 85, 73, 30, 38, 5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(92, 86);
  ctx.lineTo(108, 86);
  ctx.moveTo(92, 95);
  ctx.lineTo(105, 95);
  ctx.stroke();

  // Platform label + Solar-Gold / Emerald status beacon
  ctx.fillStyle = isLight ? "#0c1424" : "#f4f8ff";
  ctx.font = `600 25px ${SANS_FONT_STACK}`;
  ctx.fillText(spec.badge, 154, 88);

  ctx.fillStyle = spec.secondaryHex;
  ctx.beginPath();
  ctx.arc(162, 113, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isLight ? "#43526b" : "#9db0ca";
  ctx.font = `500 18px ${SANS_FONT_STACK}`;
  ctx.fillText(`${spec.sectorCode} • VERIFIED TELEMETRY`, 176, 119);

  // Telemetry beacon dots on right
  const dotPalette = [spec.accentHex, spec.secondaryHex, isLight ? "rgba(12,20,36,0.22)" : "rgba(255,255,255,0.28)"];
  for (let d = 0; d < 3; d++) {
    ctx.fillStyle = dotPalette[d];
    ctx.beginPath();
    ctx.arc(W - 118 + d * 20, 92, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Eyebrow pill
  const bodyTop = 216;
  ctx.fillStyle = spec.accentHex;
  ctx.font = `700 20px ${SANS_FONT_STACK}`;
  ctx.fillText(spec.eyebrow.toUpperCase(), 68, bodyTop);

  // Title
  ctx.fillStyle = isLight ? "#0c1424" : "#f8fbff";
  ctx.font = `600 54px ${SANS_FONT_STACK}`;
  const titleLines = wrapLines(ctx, spec.title, W - 136, 2);
  titleLines.forEach((line, idx) => {
    ctx.fillText(line, 68, bodyTop + 68 + idx * 62);
  });

  // Editorial italic subtitle
  const subY = bodyTop + 68 + titleLines.length * 62 + 16;
  ctx.fillStyle = isLight ? "#43526b" : "#b5c4da";
  ctx.font = `italic 30px ${SERIF_FONT_STACK}`;
  const subLines = wrapLines(ctx, spec.subtitle, W - 136, 2);
  subLines.forEach((line, idx) => {
    ctx.fillText(line, 68, subY + idx * 38);
  });

  // Holographic orbital telemetry bay
  const deckY = 530;
  const deckH = 310;
  drawRoundedRect(ctx, 68, deckY, W - 136, deckH, 28);
  ctx.fillStyle = isLight ? "rgba(3,98,150,0.05)" : "rgba(125,211,252,0.045)";
  ctx.fill();
  ctx.strokeStyle = isLight ? "rgba(3,98,150,0.22)" : "rgba(125,211,252,0.24)";
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Miniature telemetry bars inside bay
  const barColors = [spec.accentHex, spec.secondaryHex, isLight ? "#0f7656" : "#6ee7b7"];
  const widths = [0.80, 0.60, 0.44];
  for (let i = 0; i < 3; i++) {
    const by = deckY + 46 + i * 64;
    drawRoundedRect(ctx, 104, by, W - 320, 22, 11);
    ctx.fillStyle = isLight ? "rgba(12,20,36,0.08)" : "rgba(255,255,255,0.07)";
    ctx.fill();
    drawRoundedRect(ctx, 104, by, (W - 320) * widths[i], 22, 11);
    ctx.fillStyle = barColors[i];
    ctx.globalAlpha = 0.9;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Dual-ring astrolabe telemetry dial on right side of bay
  const cx = W - 166;
  const cy = deckY + 136;
  ctx.strokeStyle = isLight ? "rgba(12,20,36,0.11)" : "rgba(125,211,252,0.14)";
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(cx, cy, 54, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = spec.accentHex;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, 54, -Math.PI / 2, Math.PI * 0.88);
  ctx.stroke();
  ctx.lineCap = "butt";

  // Inner Solar-Gold orbital ring
  ctx.strokeStyle = spec.secondaryHex;
  ctx.lineWidth = 2.4;
  ctx.setLineDash([7, 6]);
  ctx.beginPath();
  ctx.arc(cx, cy, 38, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = isLight ? "#0c1424" : "#f4f8ff";
  ctx.font = `600 23px ${SANS_FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.fillText(spec.variant === "primary" ? "01" : spec.variant === "secondary" ? "ORB" : "↗", cx, cy + 8);
  ctx.textAlign = "left";

  // Bottom callout chip inside bay
  drawRoundedRect(ctx, 104, deckY + 236, W - 208, 46, 14);
  ctx.fillStyle = isLight ? "rgba(3,98,150,0.085)" : "rgba(243,201,121,0.10)";
  ctx.fill();
  ctx.fillStyle = isLight ? spec.accentHex : spec.secondaryHex;
  ctx.font = `600 19px ${SANS_FONT_STACK}`;
  ctx.fillText("✦  DIRECT ORBITAL UPLINK — ZERO SIGN-UP WALL", 126, deckY + 266);

  // Footer divider + metadata
  const footerY = H - 118;
  ctx.strokeStyle = isLight ? "rgba(12,20,36,0.11)" : "rgba(125,211,252,0.12)";
  ctx.lineWidth = 1.75;
  ctx.beginPath();
  ctx.moveTo(pad, footerY);
  ctx.lineTo(W - pad, footerY);
  ctx.stroke();

  ctx.fillStyle = isLight ? "#0f7656" : "#6ee7b7";
  ctx.beginPath();
  ctx.arc(76, footerY + 50, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isLight ? "#43526b" : "#9db0ca";
  ctx.font = `500 21px ${SANS_FONT_STACK}`;
  ctx.fillText(spec.footerLeft, 94, footerY + 57);

  ctx.fillStyle = spec.accentHex;
  ctx.font = `600 21px ${SANS_FONT_STACK}`;
  ctx.textAlign = "right";
  ctx.fillText(spec.footerRight, W - 68, footerY + 57);
  ctx.textAlign = "left";

  // Precision HUD L-bracket reticles inside corners
  drawHudCornerBrackets(
    ctx,
    pad + 18,
    pad + 18,
    W - (pad + 18) * 2,
    H - (pad + 18) * 2,
    24,
    isLight ? "rgba(3,98,150,0.38)" : "rgba(243,201,121,0.48)",
  );

  ctx.restore();

  // Inner subtle sapphire highlight + outer holographic rim stroke
  drawRoundedRect(ctx, pad + 2.5, pad + 2.5, W - (pad + 2.5) * 2, H - (pad + 2.5) * 2, radius - 2);
  ctx.strokeStyle = isLight ? "rgba(255,255,255,0.8)" : "rgba(186,230,253,0.11)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  drawRoundedRect(ctx, pad, pad, W - pad * 2, H - pad * 2, radius);
  ctx.strokeStyle = isLight ? "rgba(3,98,150,0.34)" : "rgba(125,211,252,0.44)";
  ctx.lineWidth = 3.2;
  ctx.stroke();
}

function createCardTexture(
  spec: CardSpec,
  isLight: boolean,
  renderer: WebGLRenderer,
): { texture: CanvasTexture; repaint: () => void } {
  const logicalW = 768;
  const logicalH = 1024;
  const { canvas, ctx } = createHiResCanvas(logicalW, logicalH);
  paintCardFace(ctx, logicalW, logicalH, spec, isLight);

  const texture = configureSharpTexture(new CanvasTexture(canvas), renderer);
  const repaint = () => {
    paintCardFace(ctx, logicalW, logicalH, spec, isLight);
    texture.needsUpdate = true;
  };
  return { texture, repaint };
}

function createStarSpriteTexture(coreRgba: string, midRgba: string): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, coreRgba);
  grad.addColorStop(0.32, midRgba);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createBeveledChassisGeometry(width: number, height: number, radius: number, depth: number): ExtrudeGeometry {
  const r = Math.min(radius, width * 0.45, height * 0.45);
  const shape = new Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.quadraticCurveTo(x + width, y, x + width, y + r);
  shape.lineTo(x + width, y + height - r);
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  shape.lineTo(x + r, y + height);
  shape.quadraticCurveTo(x, y + height, x, y + height - r);
  shape.lineTo(x, y + r);
  shape.quadraticCurveTo(x, y, x + r, y);

  const geo = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.028,
    bevelSize: 0.026,
    bevelSegments: 6,
    curveSegments: 32,
  });
  geo.center();
  return geo;
}

export function mountHeroStage(
  host: HTMLElement,
  doc: EducationalDocument | undefined,
  onFallback: () => void,
): (() => void) | undefined {
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
  const iceHex = isLight ? "#036296" : "#7dd3fc";
  const goldHex = isLight ? "#8a5d10" : "#f3c979";
  const mintHex = isLight ? "#0f7656" : "#6ee7b7";

  renderer.setPixelRatio(computeCrispPixelRatio(host.clientWidth || 560, host.clientHeight || 470, renderer));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = isLight ? 1.05 : 1.13;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 60);
  camera.position.set(0, 0.08, 6.25);

  const rig = new Group();
  scene.add(rig);

  // Interstellar 3-point lighting: cool starlight key + warm solar-gold rim + cursor telemetry light
  const ambient = new AmbientLight(isLight ? 0xffffff : 0xd4e8ff, isLight ? 1.38 : 0.96);
  scene.add(ambient);

  const keyLight = new DirectionalLight(0xffffff, isLight ? 1.52 : 1.82);
  keyLight.position.set(-3.5, 4.5, 5.5);
  scene.add(keyLight);

  const rimLight = new DirectionalLight(isLight ? 0x036296 : 0xf3c979, isLight ? 1.35 : 1.55);
  rimLight.position.set(4.2, -2.2, 3.2);
  scene.add(rimLight);

  const cursorLight = new PointLight(isLight ? 0x036296 : 0x7dd3fc, isLight ? 2.1 : 3.8, 9.5, 1.6);
  cursorLight.position.set(0.6, 0.6, 3.2);
  scene.add(cursorLight);

  const disposables: { dispose: () => void }[] = [];
  const textureRepainters: (() => void)[] = [];

  const specs: {
    spec: CardSpec;
    w: number;
    h: number;
    pos: [number, number, number];
    rot: [number, number, number];
    depthFactor: number;
  }[] = [
    {
      spec: {
        badge: doc?.platform ?? "Resource Library",
        eyebrow: `${doc?.subject ?? "Ready for launch"}  •  Command Deck`,
        title: doc?.title ?? "Your library awaits",
        subtitle: doc?.topic ?? "Resources appear here when published.",
        footerLeft: doc ? "Locked & ready" : "Awaiting resources",
        footerRight: doc ? "Launch source ↗" : "Stand by",
        accentHex: iceHex,
        secondaryHex: goldHex,
        sectorCode: "ORB-01",
        variant: "primary",
      },
      w: 2.38,
      h: 3.18,
      pos: [0.04, 0.04, 0.35],
      rot: [0.03, -0.14, 0.015],
      depthFactor: 1.0,
    },
    {
      spec: {
        badge: "Orbital Archive",
        eyebrow: "Structured Telemetry",
        title: "Organized by Course & Topic",
        subtitle: "Every slide deck & note mapped to exact coordinates.",
        footerLeft: "Curated bays",
        footerRight: "Explore ↗",
        accentHex: goldHex,
        secondaryHex: iceHex,
        sectorCode: "ORB-02",
        variant: "secondary",
      },
      w: 1.92,
      h: 2.56,
      pos: [-1.62, 0.34, -0.78],
      rot: [0.05, 0.28, -0.055],
      depthFactor: -0.65,
    },
    {
      spec: {
        badge: "Direct Uplink",
        eyebrow: "Owner Controlled",
        title: "Original Cloud Sources",
        subtitle: "Slides, Docs, Sheets & Dropbox without middlemen.",
        footerLeft: "Zero sign-up",
        footerRight: "1-Click ↗",
        accentHex: mintHex,
        secondaryHex: goldHex,
        sectorCode: "ORB-03",
        variant: "tertiary",
      },
      w: 1.82,
      h: 2.42,
      pos: [1.62, -0.38, -0.42],
      rot: [-0.04, -0.32, 0.05],
      depthFactor: 0.55,
    },
  ];

  const cardGroups: {
    group: Group;
    basePos: [number, number, number];
    baseRot: [number, number, number];
    depthFactor: number;
    phase: number;
  }[] = [];

  const chassisMat = new MeshStandardMaterial({
    color: new Color(isLight ? 0xd2dfef : 0x162238),
    metalness: isLight ? 0.38 : 0.78,
    roughness: isLight ? 0.3 : 0.22,
  });
  disposables.push(chassisMat);

  specs.forEach(({ spec, w, h, pos, rot, depthFactor }, index) => {
    const cardGroup = new Group();
    cardGroup.position.set(...pos);
    cardGroup.rotation.set(...rot);

    const slabDepth = index === 0 ? 0.085 : 0.065;
    const chassisGeo = createBeveledChassisGeometry(w * 0.965, h * 0.965, 0.14, slabDepth);
    const chassisMesh = new Mesh(chassisGeo, chassisMat);
    cardGroup.add(chassisMesh);
    disposables.push(chassisGeo);

    const { texture: tex, repaint } = createCardTexture(spec, isLight, renderer);
    textureRepainters.push(repaint);
    const faceGeo = new PlaneGeometry(w, h);
    const faceMat = new MeshStandardMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.02,
      roughness: 0.34,
      metalness: 0.04,
    });
    const frontFace = new Mesh(faceGeo, faceMat);
    frontFace.position.z = slabDepth / 2 + 0.031;
    cardGroup.add(frontFace);

    const backFace = new Mesh(faceGeo, faceMat);
    backFace.rotation.y = Math.PI;
    backFace.position.z = -(slabDepth / 2 + 0.031);
    cardGroup.add(backFace);

    disposables.push(tex, faceGeo, faceMat);
    rig.add(cardGroup);
    cardGroups.push({
      group: cardGroup,
      basePos: pos,
      baseRot: rot,
      depthFactor,
      phase: index * 1.45,
    });
  });

  // Fine orbital scales sit behind the cards instead of oversized satellites.
  const instrument = createOrbitalInstrument(isLight);
  const orbitalGroup = instrument.group;
  rig.add(orbitalGroup);
  disposables.push(instrument);

  // Dual-tone Interstellar Starfield (Ice-Blue + Solar-Gold stars in 3D space)
  const makeStarCloud = (count: number, size: number, color: number, core: string, mid: string) => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8.6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6.2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5.2 - 0.9;
    }
    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    const tex = createStarSpriteTexture(core, mid);
    const mat = new PointsMaterial({
      color,
      map: tex,
      size,
      transparent: true,
      opacity: isLight ? 0.26 : 0.48,
      depthWrite: false,
    });
    const pts = new Points(geo, mat);
    scene.add(pts);
    disposables.push(geo, tex, mat);
    return pts;
  };

  const iceStars = makeStarCloud(
    64,
    0.055,
    isLight ? 0x036296 : 0xbae6fd,
    "rgba(255,255,255,1)",
    "rgba(125,211,252,0.7)",
  );
  const goldStars = makeStarCloud(
    32,
    0.06,
    isLight ? 0x8a5d10 : 0xf3c979,
    "rgba(255,250,235,1)",
    "rgba(243,201,121,0.72)",
  );

  let disposed = false;
  let inView = true;
  let paused = isMotionPaused();
  let raf = 0;

  let pointerX = 0;
  let pointerY = 0;
  let smoothPointerX = 0;
  let smoothPointerY = 0;

  let dragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragTravel = 0;
  let orbitY = 0;
  let orbitX = 0;
  let targetOrbitY = 0;
  let targetOrbitX = 0;
  let spinTarget = 0;
  let spinCurrent = 0;
  let scrollDepth = 0;
  let smoothScroll = 0;

  let elapsed = 0;
  let lastNow = performance.now();
  let baseCameraZ = 6.25;

  const renderScene = (dt: number) => {
    if (!paused) {
      elapsed += dt;
    }

    smoothPointerX += (pointerX - smoothPointerX) * 0.07;
    smoothPointerY += (pointerY - smoothPointerY) * 0.07;
    smoothScroll += (scrollDepth - smoothScroll) * 0.14;
    spinCurrent += (spinTarget - spinCurrent) * 0.11;
    const spinEnergy = Math.min(1, Math.abs(spinTarget - spinCurrent) / Math.PI);

    if (!dragging) {
      targetOrbitY *= 0.94;
      targetOrbitX *= 0.94;
    }
    orbitY += (targetOrbitY - orbitY) * 0.12;
    orbitX += (targetOrbitX - orbitX) * 0.12;

    const parallaxY = paused ? 0 : smoothPointerX * 0.28;
    const parallaxX = paused ? 0 : -smoothPointerY * 0.19;
    const dolly = paused ? 0 : smoothScroll;

    rig.rotation.y = parallaxY + orbitY + spinCurrent - dolly * 1.24;
    rig.rotation.x = MathUtils.clamp(parallaxX + orbitX + dolly * 0.46, -0.68, 0.75);
    rig.rotation.z = dolly * -0.15 + spinEnergy * 0.08;
    rig.position.y = dolly * 0.18;

    camera.position.z = baseCameraZ - dolly * 0.55 - spinEnergy * 0.35;
    camera.lookAt(0, 0, 0);

    cursorLight.position.set(
      smoothPointerX * 2.6 + dolly * 1.4,
      -smoothPointerY * 2.0 + 0.5,
      3.1,
    );

    const fanBoost = dolly + spinEnergy * 0.55;
    cardGroups.forEach(({ group, basePos, baseRot, depthFactor, phase }, idx) => {
      const floatY = Math.sin(elapsed * 0.95 + phase) * 0.075;
      const floatRotZ = Math.cos(elapsed * 0.7 + phase) * 0.014;
      const spreadX = fanBoost * (idx === 1 ? -0.78 : idx === 2 ? 0.78 : 0);
      const spreadY = fanBoost * (idx === 1 ? 0.28 : idx === 2 ? -0.28 : 0);
      const spreadZ = fanBoost * depthFactor * 1.05;

      group.position.set(
        basePos[0] + spreadX + smoothPointerX * depthFactor * 0.11,
        basePos[1] + spreadY + floatY - smoothPointerY * depthFactor * 0.08,
        basePos[2] + spreadZ,
      );
      group.rotation.set(
        baseRot[0] + smoothPointerY * 0.04 + dolly * idx * 0.08,
        baseRot[1] + smoothPointerX * 0.06 + dolly * (idx === 1 ? 0.25 : idx === 2 ? -0.25 : 0),
        baseRot[2] + floatRotZ,
      );
    });

    orbitalGroup.rotation.z = elapsed * 0.09 + dolly * 1.85;
    orbitalGroup.rotation.y = Math.sin(elapsed * 0.25) * 0.14 + dolly * 0.95;

    iceStars.rotation.y = elapsed * 0.032 + smoothPointerX * 0.14 + dolly * 0.9 + spinCurrent * 0.35;
    iceStars.rotation.x = -smoothPointerY * 0.08 + dolly * 0.32;
    iceStars.position.y = dolly * 0.65;

    goldStars.rotation.y = -elapsed * 0.024 + smoothPointerX * 0.1 + dolly * 0.65 + spinCurrent * 0.25;
    goldStars.rotation.x = -smoothPointerY * 0.06 + dolly * 0.24;
    goldStars.position.y = dolly * 0.48;

    renderer.render(scene, camera);
  };

  const resize = () => {
    if (disposed) return;
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(computeCrispPixelRatio(width, height, renderer));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    baseCameraZ = 6.25 / Math.min(1, Math.max(0.66, camera.aspect / 1.12));
    camera.updateProjectionMatrix();
    if (inView) renderScene(0);
  };

  const loop = (now: number) => {
    if (disposed) return;
    const dt = Math.min(0.05, Math.max(0, (now - lastNow) / 1000));
    lastNow = now;
    if (inView && document.visibilityState === "visible") {
      renderScene(dt);
      const spinning = Math.abs(spinTarget - spinCurrent) > 0.003;
      if (!paused || dragging || spinning || Math.abs(orbitY) > 0.002 || Math.abs(orbitX) > 0.002) {
        raf = requestAnimationFrame(loop);
        return;
      }
    }
    if (!paused) {
      raf = requestAnimationFrame(loop);
    }
  };

  const wakeLoop = () => {
    cancelAnimationFrame(raf);
    lastNow = performance.now();
    raf = requestAnimationFrame(loop);
  };

  const unsubFonts = onWebFontsReady(() => {
    if (disposed) return;
    textureRepainters.forEach(fn => fn());
    if (inView) renderScene(0);
  });

  const unsubZoom = subscribeViewportZoom(resize);

  const onWindowPointerMove = (event: PointerEvent) => {
    const rect = host.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    pointerX = MathUtils.clamp(((event.clientX - rect.left) / rect.width - 0.5) * 2, -1.25, 1.25);
    pointerY = MathUtils.clamp(((event.clientY - rect.top) / rect.height - 0.5) * 2, -1.25, 1.25);
  };

  const onDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (paused || dragging || event.gamma === null || event.beta === null) return;
    pointerX = MathUtils.clamp(event.gamma / 28, -1.15, 1.15);
    pointerY = MathUtils.clamp((event.beta - 45) / 28, -1.15, 1.15);
    if (inView) wakeLoop();
  };

  const onPointerDown = (event: PointerEvent) => {
    dragging = true;
    dragTravel = 0;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    host.dataset.dragging = "true";
    try {
      renderer.domElement.setPointerCapture(event.pointerId);
    } catch {}
    wakeLoop();
  };

  const onPointerMoveStage = (event: PointerEvent) => {
    if (!dragging) return;
    const dx = event.clientX - dragStartX;
    const dy = event.clientY - dragStartY;
    dragTravel += Math.hypot(dx, dy);
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    targetOrbitY = MathUtils.clamp(targetOrbitY + dx * 0.0075, -0.68, 0.68);
    targetOrbitX = MathUtils.clamp(targetOrbitX + dy * 0.0055, -0.38, 0.38);
  };

  const onPointerUp = () => {
    if (!dragging) return;
    dragging = false;
    delete host.dataset.dragging;
    if (dragTravel < 7) {
      spinTarget += Math.PI * 2;
    }
    wakeLoop();
  };

  const onScroll = () => {
    scrollDepth = MathUtils.clamp(window.scrollY / 520, 0, 1);
    if (!paused && inView) wakeLoop();
  };

  const onVisibility = () => {
    if (document.visibilityState === "visible" && inView) wakeLoop();
  };

  const onContextLost = (event: Event) => {
    event.preventDefault();
    dispose();
    onFallback();
  };

  let io: IntersectionObserver | undefined;
  if (typeof IntersectionObserver !== "undefined") {
    io = new IntersectionObserver(entries => {
      inView = entries[0]?.isIntersecting ?? true;
      if (inView) wakeLoop();
    });
    io.observe(host);
  }

  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : undefined;
  ro?.observe(host);

  const unsubPause = subscribeMotionPaused(() => {
    paused = isMotionPaused();
    wakeLoop();
  });

  window.addEventListener("pointermove", onWindowPointerMove, { passive: true });
  window.addEventListener("deviceorientation", onDeviceOrientation, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", onVisibility);
  renderer.domElement.addEventListener("pointerdown", onPointerDown);
  renderer.domElement.addEventListener("pointermove", onPointerMoveStage);
  renderer.domElement.addEventListener("pointerup", onPointerUp);
  renderer.domElement.addEventListener("pointercancel", onPointerUp);
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);

  onScroll();
  resize();
  renderScene(0.016);
  wakeLoop();

  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    unsubFonts();
    unsubZoom();
    unsubPause();
    io?.disconnect();
    ro?.disconnect();
    window.removeEventListener("pointermove", onWindowPointerMove);
    window.removeEventListener("deviceorientation", onDeviceOrientation);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", onVisibility);
    renderer.domElement.removeEventListener("pointerdown", onPointerDown);
    renderer.domElement.removeEventListener("pointermove", onPointerMoveStage);
    renderer.domElement.removeEventListener("pointerup", onPointerUp);
    renderer.domElement.removeEventListener("pointercancel", onPointerUp);
    renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
    disposables.forEach(item => item.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  }

  return dispose;
}
