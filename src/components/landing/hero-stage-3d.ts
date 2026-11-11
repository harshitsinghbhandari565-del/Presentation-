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

interface CardSpec {
  badge: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  footerLeft: string;
  footerRight: string;
  accentHex: string;
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

function createCardTexture(spec: CardSpec, isLight: boolean): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  const H = canvas.height;
  const pad = 20;
  const radius = 52;

  ctx.clearRect(0, 0, W, H);

  // Outer rounded mask
  drawRoundedRect(ctx, pad, pad, W - pad * 2, H - pad * 2, radius);
  ctx.save();
  ctx.clip();

  // Studio surface gradient
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  if (isLight) {
    bgGrad.addColorStop(0, spec.variant === "primary" ? "#ffffff" : "#f6f8ff");
    bgGrad.addColorStop(1, spec.variant === "primary" ? "#eef1fb" : "#e5eaf8");
  } else {
    bgGrad.addColorStop(0, spec.variant === "primary" ? "#1a2033" : "#151a2a");
    bgGrad.addColorStop(0.55, spec.variant === "primary" ? "#111624" : "#0f1320");
    bgGrad.addColorStop(1, "#0b0e18");
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Top-right radial studio glow
  const glow = ctx.createRadialGradient(W * 0.82, H * 0.14, 10, W * 0.82, H * 0.14, W * 0.72);
  glow.addColorStop(0, isLight ? "rgba(81,87,196,0.16)" : "rgba(165,170,255,0.22)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Subtle architectural grid lines in header zone
  ctx.strokeStyle = isLight ? "rgba(81,87,196,0.06)" : "rgba(255,255,255,0.035)";
  ctx.lineWidth = 1.5;
  for (let gx = 80; gx < W; gx += 76) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, H * 0.48);
    ctx.stroke();
  }

  // Header bar
  const headerH = 136;
  ctx.strokeStyle = isLight ? "rgba(30,41,75,0.1)" : "rgba(255,255,255,0.09)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, pad + headerH);
  ctx.lineTo(W - pad, pad + headerH);
  ctx.stroke();

  // Icon badge box
  drawRoundedRect(ctx, 66, 58, 68, 68, 18);
  ctx.fillStyle = isLight ? "rgba(81,87,196,0.10)" : "rgba(165,170,255,0.14)";
  ctx.fill();
  ctx.strokeStyle = isLight ? "rgba(81,87,196,0.28)" : "rgba(165,170,255,0.34)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Document glyph inside icon box
  ctx.strokeStyle = spec.accentHex;
  ctx.lineWidth = 3.5;
  drawRoundedRect(ctx, 85, 73, 30, 38, 5);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(92, 86);
  ctx.lineTo(108, 86);
  ctx.moveTo(92, 95);
  ctx.lineTo(105, 95);
  ctx.stroke();

  // Platform label + status dot
  ctx.fillStyle = isLight ? "#1a2031" : "#f2f3f8";
  ctx.font = "600 25px system-ui, -apple-system, sans-serif";
  ctx.fillText(spec.badge, 154, 88);

  ctx.fillStyle = "#91d8bd";
  ctx.beginPath();
  ctx.arc(162, 113, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isLight ? "#586176" : "#9ca5bc";
  ctx.font = "500 19px system-ui, -apple-system, sans-serif";
  ctx.fillText("Verified classroom source", 176, 119);

  // Window dots on right
  for (let d = 0; d < 3; d++) {
    ctx.fillStyle = isLight ? "rgba(30,41,75,0.2)" : "rgba(255,255,255,0.22)";
    ctx.beginPath();
    ctx.arc(W - 118 + d * 20, 92, 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Eyebrow pill
  const bodyTop = 216;
  ctx.fillStyle = spec.accentHex;
  ctx.font = "700 20px system-ui, -apple-system, sans-serif";
  ctx.fillText(spec.eyebrow.toUpperCase(), 68, bodyTop);

  // Title
  ctx.fillStyle = isLight ? "#151b2c" : "#f5f6fb";
  ctx.font = "600 54px system-ui, -apple-system, sans-serif";
  const titleLines = wrapLines(ctx, spec.title, W - 136, 2);
  titleLines.forEach((line, idx) => {
    ctx.fillText(line, 68, bodyTop + 68 + idx * 62);
  });

  // Editorial italic subtitle
  const subY = bodyTop + 68 + titleLines.length * 62 + 16;
  ctx.fillStyle = isLight ? "#4b556d" : "#b2bad0";
  ctx.font = "italic 30px Georgia, serif";
  const subLines = wrapLines(ctx, spec.subtitle, W - 136, 2);
  subLines.forEach((line, idx) => {
    ctx.fillText(line, 68, subY + idx * 38);
  });

  // Visual presentation slide preview deck box
  const deckY = 530;
  const deckH = 310;
  drawRoundedRect(ctx, 68, deckY, W - 136, deckH, 28);
  ctx.fillStyle = isLight ? "rgba(81,87,196,0.055)" : "rgba(255,255,255,0.035)";
  ctx.fill();
  ctx.strokeStyle = isLight ? "rgba(81,87,196,0.18)" : "rgba(165,170,255,0.18)";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Miniature slide modules inside preview box
  const barColors = [spec.accentHex, "#91d8bd", "#e2c58c"];
  const widths = [0.78, 0.58, 0.42];
  for (let i = 0; i < 3; i++) {
    const by = deckY + 46 + i * 64;
    // Track
    drawRoundedRect(ctx, 104, by, W - 320, 22, 11);
    ctx.fillStyle = isLight ? "rgba(30,41,75,0.07)" : "rgba(255,255,255,0.06)";
    ctx.fill();
    // Active bar
    drawRoundedRect(ctx, 104, by, (W - 320) * widths[i], 22, 11);
    ctx.fillStyle = barColors[i];
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Circular radial stat dial on right side of deck box
  const cx = W - 166;
  const cy = deckY + 136;
  ctx.strokeStyle = isLight ? "rgba(30,41,75,0.1)" : "rgba(255,255,255,0.1)";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(cx, cy, 52, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = spec.accentHex;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, 52, -Math.PI / 2, Math.PI * 0.85);
  ctx.stroke();
  ctx.lineCap = "butt";

  ctx.fillStyle = isLight ? "#1a2031" : "#f2f3f8";
  ctx.font = "600 24px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(spec.variant === "primary" ? "01" : spec.variant === "secondary" ? "A+" : "↗", cx, cy + 9);
  ctx.textAlign = "left";

  // Bottom callout chip inside deck box
  drawRoundedRect(ctx, 104, deckY + 236, W - 208, 46, 14);
  ctx.fillStyle = isLight ? "rgba(81,87,196,0.09)" : "rgba(165,170,255,0.11)";
  ctx.fill();
  ctx.fillStyle = spec.accentHex;
  ctx.font = "500 20px system-ui, -apple-system, sans-serif";
  ctx.fillText("✦  Instant classroom access — zero sign-up wall", 126, deckY + 266);

  // Footer divider + metadata
  const footerY = H - 118;
  ctx.strokeStyle = isLight ? "rgba(30,41,75,0.1)" : "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(pad, footerY);
  ctx.lineTo(W - pad, footerY);
  ctx.stroke();

  ctx.fillStyle = "#91d8bd";
  ctx.beginPath();
  ctx.arc(76, footerY + 50, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = isLight ? "#586176" : "#9ca5bc";
  ctx.font = "500 21px system-ui, -apple-system, sans-serif";
  ctx.fillText(spec.footerLeft, 94, footerY + 57);

  ctx.fillStyle = spec.accentHex;
  ctx.font = "600 21px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(spec.footerRight, W - 68, footerY + 57);
  ctx.textAlign = "left";

  ctx.restore();

  // Crisp glass rim stroke
  drawRoundedRect(ctx, pad, pad, W - pad * 2, H - pad * 2, radius);
  ctx.strokeStyle = isLight ? "rgba(81,87,196,0.28)" : "rgba(185,192,255,0.32)";
  ctx.lineWidth = 3.5;
  ctx.stroke();

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

function createBokehSpriteTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(200,206,255,0.65)");
  grad.addColorStop(1, "rgba(165,170,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createBeveledChassisGeometry(width: number, height: number, radius: number, depth: number): ExtrudeGeometry {
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
    bevelThickness: 0.028,
    bevelSize: 0.026,
    bevelSegments: 4,
    curveSegments: 16,
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
  const accentHex = isLight ? "#5157c4" : "#a5aaff";

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = isLight ? 1.08 : 1.16;
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(38, 1, 0.1, 60);
  camera.position.set(0, 0.08, 6.25);

  const rig = new Group();
  scene.add(rig);

  // Studio 3-point PBR lighting + cursor-tracking specular light
  const ambient = new AmbientLight(isLight ? 0xffffff : 0xdde2ff, isLight ? 1.35 : 0.9);
  scene.add(ambient);

  const keyLight = new DirectionalLight(0xffffff, isLight ? 1.6 : 1.9);
  keyLight.position.set(-3.5, 4.5, 5.5);
  scene.add(keyLight);

  const rimLight = new DirectionalLight(isLight ? 0x6168d8 : 0x9aa2ff, 1.5);
  rimLight.position.set(4.2, -2.2, 3.2);
  scene.add(rimLight);

  const cursorLight = new PointLight(isLight ? 0x5157c4 : 0xb8beff, isLight ? 2.4 : 4.2, 9.5, 1.6);
  cursorLight.position.set(0.6, 0.6, 3.2);
  scene.add(cursorLight);

  const disposables: { dispose: () => void }[] = [];

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
        badge: doc?.platform ?? "Google Slides",
        eyebrow: `${doc?.subject ?? "English"}  •  Featured Deck`,
        title: doc?.title ?? "MCQs Practice",
        subtitle: doc?.topic ?? "Ch 2 – The Lost Spring",
        footerLeft: "Ready for class",
        footerRight: "Open source ↗",
        accentHex,
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
        badge: "Subject Archive",
        eyebrow: "Structured Context",
        title: "Organized by Course & Topic",
        subtitle: "Every slide deck & note right where you expect it.",
        footerLeft: "Curated shelves",
        footerRight: "Browse ↗",
        accentHex: isLight ? "#237457" : "#91d8bd",
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
        badge: "Direct Links",
        eyebrow: "Owner Controlled",
        title: "Original Cloud Sources",
        subtitle: "Slides, Docs, Sheets & Dropbox without middlemen.",
        footerLeft: "Zero sign-up",
        footerRight: "1-Click ↗",
        accentHex: isLight ? "#866020" : "#e2c58c",
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
    color: new Color(isLight ? 0xd9dff0 : 0x252d44),
    metalness: isLight ? 0.35 : 0.72,
    roughness: isLight ? 0.32 : 0.24,
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

    const tex = createCardTexture(spec, isLight);
    const faceGeo = new PlaneGeometry(w, h);
    const faceMat = new MeshStandardMaterial({
      map: tex,
      transparent: true,
      roughness: 0.28,
      metalness: 0.08,
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

  // Precision studio orbital rings + faceted floating gems
  const orbitalGroup = new Group();
  rig.add(orbitalGroup);

  const ringMat = new MeshStandardMaterial({
    color: new Color(isLight ? 0x5157c4 : 0x8f96ff),
    metalness: 0.85,
    roughness: 0.2,
    transparent: true,
    opacity: isLight ? 0.28 : 0.36,
  });
  const ringGeo1 = new TorusGeometry(2.55, 0.011, 12, 96);
  const ring1 = new Mesh(ringGeo1, ringMat);
  ring1.rotation.set(1.12, 0.28, -0.2);
  orbitalGroup.add(ring1);

  const ringGeo2 = new TorusGeometry(2.95, 0.008, 12, 96);
  const ring2 = new Mesh(ringGeo2, ringMat);
  ring2.rotation.set(-0.95, -0.42, 0.35);
  orbitalGroup.add(ring2);

  const gemGeo = new OctahedronGeometry(0.085, 0);
  const gemMat = new MeshStandardMaterial({
    color: new Color(isLight ? 0x5157c4 : 0xc5c9ff),
    emissive: new Color(isLight ? 0x2d3396 : 0x4b52c9),
    emissiveIntensity: 0.45,
    metalness: 0.75,
    roughness: 0.15,
  });
  const gems: Mesh[] = [];
  for (let g = 0; g < 3; g++) {
    const gem = new Mesh(gemGeo, gemMat);
    orbitalGroup.add(gem);
    gems.push(gem);
  }
  disposables.push(ringMat, ringGeo1, ringGeo2, gemGeo, gemMat);

  // Soft optical bokeh particles in 3D depth
  const particleCount = 56;
  const particlePositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 7.8;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 5.6;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 4.5 - 0.8;
  }
  const particleGeo = new BufferGeometry();
  particleGeo.setAttribute("position", new BufferAttribute(particlePositions, 3));
  const bokehTex = createBokehSpriteTexture();
  const particleMat = new PointsMaterial({
    color: isLight ? 0x5157c4 : 0xa5aaff,
    map: bokehTex,
    size: 0.16,
    transparent: true,
    opacity: isLight ? 0.42 : 0.62,
    depthWrite: false,
  });
  const particles = new Points(particleGeo, particleMat);
  scene.add(particles);
  disposables.push(particleGeo, bokehTex, particleMat);

  // Interaction state: pointer parallax + direct drag-to-orbit + scroll dolly
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
  const resize = () => {
    if (disposed) return;
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, width < 768 ? 1.5 : 2));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    baseCameraZ = 6.25 / Math.min(1, Math.max(0.66, camera.aspect / 1.12));
    camera.updateProjectionMatrix();
  };

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
    gems.forEach((gem, i) => {
      const a = elapsed * 0.55 + (i * Math.PI * 2) / 3;
      gem.position.set(Math.cos(a) * 2.55, Math.sin(a) * 1.15, Math.sin(a * 1.3) * 0.95);
      gem.rotation.set(elapsed * 0.9 + i, elapsed * 0.7, 0);
    });

    particles.rotation.y = elapsed * 0.035 + smoothPointerX * 0.14 + dolly * 0.9 + spinCurrent * 0.35;
    particles.rotation.x = -smoothPointerY * 0.08 + dolly * 0.32;
    particles.position.y = dolly * 0.65;
    renderer.render(scene, camera);
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
