"use client";
import { useSyncExternalStore, useCallback } from "react";
import { Monitor } from "lucide-react";
const KEY = "presentation-hub-projector";
const listeners = new Set<() => void>();
function subscribe(callback: () => void) {
  listeners.add(callback);
  const storage = (event: StorageEvent) => { if (event.key === KEY || event.key === null) callback(); };
  window.addEventListener("storage", storage);
  return () => { listeners.delete(callback); window.removeEventListener("storage", storage); };
}
function snapshot() { try { return localStorage.getItem(KEY) === "true"; } catch { return false; } }
export default function ProjectorModeToggle() {
  const active = useSyncExternalStore(subscribe, snapshot, () => false);
  const toggle = useCallback(() => {
    const next = !active;
    try { localStorage.setItem(KEY, String(next)); } catch {}
    document.documentElement.classList.toggle("projector-mode", next);
    listeners.forEach(listener => listener());
  }, [active]);
  return <button className="icon-button projector-toggle" onClick={toggle} aria-label={`${active ? "Disable" : "Enable"} projector mode`} aria-pressed={active} title="Projector mode: larger text and stronger contrast"><Monitor size={18} strokeWidth={1.7} /><span className="projector-label">Projector</span></button>;
}
