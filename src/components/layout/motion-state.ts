"use client";
import { useSyncExternalStore } from "react";

const KEY = "presentation-hub-motion-paused";
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach(listener => listener());
}

export function subscribeMotionPaused(callback: () => void): () => void {
  listeners.add(callback);
  const onStorage = (event: StorageEvent) => {
    if (event.key === KEY || event.key === null) callback();
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

export function setMotionPaused(paused: boolean): void {
  try {
    localStorage.setItem(KEY, String(paused));
  } catch {}
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("motion-paused", paused);
  }
  notify();
}

export function toggleMotionPaused(): boolean {
  const next = !isMotionPaused();
  setMotionPaused(next);
  return next;
}

export function useMotionPaused(): boolean {
  return useSyncExternalStore(subscribeMotionPaused, isMotionPaused, () => false);
}
