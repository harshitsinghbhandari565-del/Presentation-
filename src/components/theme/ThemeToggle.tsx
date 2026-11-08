"use client";
import { useSyncExternalStore, useCallback } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";
const KEY = "presentation-hub-theme";
const listeners = new Set<() => void>();
function subscribe(callback: () => void) {
  listeners.add(callback);
  const storage = (event: StorageEvent) => { if (event.key === KEY || event.key === null) callback(); };
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener("storage", storage);
  media.addEventListener("change", callback);
  return () => { listeners.delete(callback); window.removeEventListener("storage", storage); media.removeEventListener("change", callback); };
}
function getSnapshot(): Theme {
  try { const value = localStorage.getItem(KEY); if (value === "light" || value === "dark" || value === "system") return value; } catch {}
  return "dark";
}
function apply(theme: Theme) {
  const effective = theme === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme;
  document.documentElement.dataset.theme = effective;
  document.documentElement.classList.toggle("dark", effective === "dark");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", effective === "dark" ? "#090b10" : "#f8f9fc");
}
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "dark" as Theme);
  const cycle = useCallback(() => {
    const next: Theme = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
    try { localStorage.setItem(KEY, next); } catch {}
    apply(next); listeners.forEach(listener => listener());
  }, [theme]);
  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  return <button className="icon-button theme-toggle" onClick={cycle} aria-label={`Theme: ${theme}. Switch to ${theme === "dark" ? "light" : theme === "light" ? "system" : "dark"}`} title={`Theme: ${theme} · click to switch`}><Icon size={18} strokeWidth={1.7} /><span className="theme-label">{theme === "system" ? "Auto" : theme === "dark" ? "Dark" : "Light"}</span></button>;
}
