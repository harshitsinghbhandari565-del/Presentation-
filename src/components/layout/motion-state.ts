"use client";
import { useSyncExternalStore } from "react";

const KEY = "presentation-hub-motion-paused";
const FORCE_KEY = "presentation-hub-force-motion";
const listeners = new Set<() => void>();
let mediaBound = false;

function ensureMediaListener() {
  if (mediaBound || typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return;
  }
  mediaBound = true;
  const media = window.matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", () => notify());
}

function notify() {
  listeners.forEach(listener => listener());
}

export function subscribeMotionPaused(callback: () => void): () => void {
  ensureMediaListener();
  listeners.add(callback);
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === FORCE_KEY || event.key === null) {
      syncForceDataset();
      callback();
    }
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(callback);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function isMotionPaused(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage.getItem(KEY) === "true";
  } catch {
    return false;
  }
}

export function isForceMotionEnabled(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage.getItem(FORCE_KEY) === "true";
  } catch {
    return false;
  }
}

export function isOsReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function syncForceDataset(): void {
  if (typeof document === "undefined") return;
  const force = isForceMotionEnabled() && !isMotionPaused();
  if (force) {
    document.documentElement.dataset.forceMotion = "true";
  } else {
    delete document.documentElement.dataset.forceMotion;
  }
  document.documentElement.classList.toggle("motion-paused", isMotionPaused());
}

/**
 * Unified 3D/scroll motion gate:
 * - Always false in classroom projector-mode or when explicitly paused.
 * - True if user explicitly tapped "Enable 3D" (overriding OS reduced-motion).
 * - Otherwise follows OS prefers-reduced-motion.
 */
export function canRun3DMotion(): boolean {
  if (typeof document !== "undefined" && document.documentElement.classList.contains("projector-mode")) {
    return false;
  }
  if (isMotionPaused()) return false;
  if (isForceMotionEnabled()) return true;
  return !isOsReducedMotion();
}

export function setMotionPaused(paused: boolean): void {
  try {
    localStorage.setItem(KEY, String(paused));
    if (paused) {
      localStorage.removeItem(FORCE_KEY);
    }
  } catch {}
  syncForceDataset();
  notify();
}

export function enable3DMotion(): void {
  try {
    localStorage.setItem(KEY, "false");
    localStorage.setItem(FORCE_KEY, "true");
  } catch {}
  syncForceDataset();
  notify();
}

export function toggleMotionPaused(): boolean {
  if (!canRun3DMotion()) {
    enable3DMotion();
    return false;
  }
  setMotionPaused(true);
  return true;
}

export function useMotionPaused(): boolean {
  return useSyncExternalStore(subscribeMotionPaused, isMotionPaused, () => false);
}

type MotionStatusSnapshot = "active" | "os-blocked" | "paused";

function getMotionStatusSnapshot(): MotionStatusSnapshot {
  if (isMotionPaused()) return "paused";
  if (isOsReducedMotion() && !isForceMotionEnabled()) return "os-blocked";
  return "active";
}

export function useMotionStatus(): MotionStatusSnapshot {
  return useSyncExternalStore(subscribeMotionPaused, getMotionStatusSnapshot, () => "active");
}
