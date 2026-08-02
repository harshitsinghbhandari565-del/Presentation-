"use client";
import { useState, useEffect, useCallback } from "react";
import { Search } from "lucide-react";
import CommandPalette from "./CommandPalette";

export default function CommandTrigger() {
  const [isOpen, setIsOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open command palette (Cmd+K or Ctrl+K)"
        aria-haspopup="dialog"
        title="Search (⌘K)"
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/[0.06] hover:border-white/[0.12] transition-colors h-8"
      >
        <Search size={14} aria-hidden="true" />
        <span className="hidden sm:inline text-xs">Search</span>
        <kbd
          className="hidden md:inline-flex items-center ml-0.5 px-1.5 py-0.5 rounded bg-white/[0.04] text-[10px] text-[#475569]"
          aria-hidden="true"
        >
          ⌘K
        </kbd>
      </button>
      <CommandPalette isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
