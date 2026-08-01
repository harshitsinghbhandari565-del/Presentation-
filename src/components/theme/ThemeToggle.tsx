"use client";
import { useSyncExternalStore, useCallback } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

type Theme = "light" | "dark" | "system";
const THEME_KEY = "presentation-hub-theme";
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  const handleStorage = (e: StorageEvent) => {
    if (e.key === THEME_KEY) callback();
  };
  window.addEventListener("storage", handleStorage);
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
    mediaQuery.removeEventListener("change", callback);
  };
}

function getSnapshot(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
  } catch {
    // ignore
  }
  return "dark";
}

function getServerSnapshot(): Theme {
  return "dark";
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  const effectiveTheme = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.setAttribute("data-theme", effectiveTheme);
  document.documentElement.classList.toggle("dark", effectiveTheme === "dark");
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute("content", effectiveTheme === "dark" ? "#050505" : "#f1f5f9");
  }
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const cycleTheme = useCallback(() => {
    const nextTheme: Theme = theme === "dark" ? "light" : theme === "light" ? "system" : "dark";
    try {
      localStorage.setItem(THEME_KEY, nextTheme);
    } catch {
      // ignore
    }
    applyTheme(nextTheme);
    notifyListeners();
  }, [theme]);

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const label = `Theme: ${theme}`;

  return (
    <button
      onClick={cycleTheme}
      aria-label={label}
      title={label}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors h-8"
    >
      <Icon size={14} aria-hidden="true" />
      <span className="hidden sm:inline text-xs">
        {theme === "dark" ? "Dark" : theme === "light" ? "Light" : "Auto"}
      </span>
    </button>
  );
}
