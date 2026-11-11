import {
  CanvasTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  SRGBColorSpace,
  type WebGLRenderer,
} from "three";

export const SANS_FONT_STACK =
  '"Geist Variable", "Geist", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
export const SERIF_FONT_STACK =
  '"Newsreader Variable", "Newsreader", ui-serif, Georgia, Cambria, "Times New Roman", serif';

/**
 * Computes a zoom-aware Super-Retina pixel ratio so revolving 3D cards stay
 * razor-sharp during mobile pinch-zoom, trackpad zoom, and browser Ctrl/+ zoom,
 * while safely capping physical backbuffer dimensions at 4K (4096px).
 */
export function computeCrispPixelRatio(
  width: number,
  height: number,
  renderer?: WebGLRenderer,
  maxBackbufferDim = 4096,
): number {
  if (typeof window === "undefined") return 1;
  const deviceDpr = window.devicePixelRatio || 1;
  const pinchScale = window.visualViewport?.scale || 1;
  const effectiveDpr = deviceDpr * pinchScale;

  // Provide 1.75x SSAA supersampling on compact stages even on 1x 1080p screens
  const maxCssDim = Math.max(1, width, height);
  const minCrispDpr = maxCssDim <= 980 ? 1.75 : 1.25;
  const desired = Math.max(effectiveDpr, minCrispDpr);

  const gpuCap = renderer
    ? Math.min(maxBackbufferDim, renderer.capabilities.maxTextureSize || maxBackbufferDim)
    : maxBackbufferDim;
  const safeMaxDpr = Math.min(4, gpuCap / maxCssDim);

  return Math.max(1, Math.min(desired, safeMaxDpr));
}

/**
 * Returns optimal HiDPI supersampling factor for 2D CanvasTextures (2.0x–2.5x)
 * so card typography, icons, and hairline borders never pixelate on zoom.
 */
export function getTextureSupersample(baseMaxDim: number): number {
  if (typeof window === "undefined") return 2;
  const dpr = (window.devicePixelRatio || 1) * (window.visualViewport?.scale || 1);
  const targetScale = dpr >= 2 ? 2.5 : 2.25;
  // Keep individual card textures <= 2560px on longest side for fast upload & low VRAM
  return Math.min(targetScale, 2560 / Math.max(1, baseMaxDim));
}

/**
 * Creates a supersampled HTMLCanvasElement whose 2D context is pre-scaled to
 * logical coordinates (logicalW x logicalH) with high-quality smoothing.
 */
export function createHiResCanvas(
  logicalW: number,
  logicalH: number,
  scale = getTextureSupersample(Math.max(logicalW, logicalH)),
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; scale: number } {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(logicalW * scale);
  canvas.height = Math.round(logicalH * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.scale(canvas.width / logicalW, canvas.height / logicalH);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return { canvas, ctx, scale };
}

/**
 * Applies sRGB color space, trilinear mipmapping, and maximum hardware
 * anisotropic filtering (up to 16x) so revolving cards stay crystal clear at
 * steep oblique angles and close-up zoom.
 */
export function configureSharpTexture(
  texture: CanvasTexture,
  renderer: WebGLRenderer,
): CanvasTexture {
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = true;
  texture.anisotropy = Math.min(16, Math.max(4, renderer.capabilities.getMaxAnisotropy()));
  texture.needsUpdate = true;
  return texture;
}

/**
 * Subscribes to pinch-zoom (`window.visualViewport`) and browser DPR zoom changes
 * so WebGL stages immediately re-sharpen their backbuffer while zooming.
 */
export function subscribeViewportZoom(onZoomChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  let raf = 0;
  let removeDprMedia: (() => void) | undefined;

  const schedule = () => {
    if (raf) return;
    raf = window.requestAnimationFrame(() => {
      raf = 0;
      onZoomChange();
    });
  };

  const bindDprMedia = () => {
    removeDprMedia?.();
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
    const onChange = () => {
      bindDprMedia();
      schedule();
    };
    mq.addEventListener("change", onChange);
    removeDprMedia = () => mq.removeEventListener("change", onChange);
  };

  bindDprMedia();
  const vv = window.visualViewport;
  vv?.addEventListener("resize", schedule, { passive: true });

  return () => {
    if (raf) window.cancelAnimationFrame(raf);
    removeDprMedia?.();
    vv?.removeEventListener("resize", schedule);
  };
}

/**
 * Runs `onReady` once web fonts (Geist & Newsreader) finish loading if they
 * were still pending during initial canvas texture draw.
 */
export function onWebFontsReady(onReady: () => void): () => void {
  if (typeof document === "undefined" || !("fonts" in document)) return () => {};
  let cancelled = false;
  if (document.fonts.status !== "loaded") {
    void document.fonts.ready.then(() => {
      if (!cancelled) onReady();
    });
  }
  return () => {
    cancelled = true;
  };
}
