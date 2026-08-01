"use client";
import { useSyncExternalStore, useCallback } from "react";
import { Monitor } from "lucide-react";

const PROJECTOR_KEY = "presentation-hub-projector";
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === PROJECTOR_KEY) callback();
  };
  window.addEventListener("storage", handleStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(PROJECTOR_KEY) === "true";
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export default function ProjectorModeToggle() {
  const isActive = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const newState = !isActive;
    try {
      localStorage.setItem(PROJECTOR_KEY, String(newState));
    } catch {
      // ignore
    }
    
    if (newState) {
      document.documentElement.classList.add("projector-mode");
    } else {
      document.documentElement.classList.remove("projector-mode");
    }
    
    notifyListeners();
  }, [isActive]);

  const label = isActive ? "Disable projector mode" : "Enable projector mode";

  return (
    <button
      onClick={toggle}
      aria-label={label}
      aria-pressed={isActive}
      title={label}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors h-8 ${
        isActive
          ? "bg-indigo-500/15 border border-indigo-400/30 text-indigo-300"
          : "bg-white/[0.04] border border-white/[0.08] text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/[0.06] hover:border-white/[0.12]"
      }`}
    >
      <Monitor size={14} aria-hidden="true" />
      <span className="hidden sm:inline text-xs">Projector</span>
    </button>
  );
}
