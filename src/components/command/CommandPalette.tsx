"use client";
import { useState, useCallback, useRef, useMemo } from "react";
import { Search, FileText, Star, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import data from "@/data/presentations.json";
import type { Presentation } from "@/types/presentation";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const presentations = useMemo(
    () => (data.presentations || []) as Presentation[],
    []
  );

  // Filter presentations based on query
  const filtered = useMemo(() => {
    if (query.trim()) {
      const q = query.toLowerCase();
      return presentations.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.subject.toLowerCase().includes(q) ||
          p.topic.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    const pinned = presentations.filter((p) => p.pinned);
    return pinned.length > 0 ? pinned : presentations.slice(0, 5);
  }, [query, presentations]);

  // Handle query change - reset selection inline
  const handleQueryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(e.target.value);
      setSelectedIndex(0);
    },
    []
  );

  // Handle close - reset state inline
  const handleClose = useCallback(() => {
    setQuery("");
    setSelectedIndex(0);
    onClose();
  }, [onClose]);

  const handleNavigate = useCallback(
    (id: string) => {
      handleClose();
      router.push(`/presentation/${id}`);
    },
    [handleClose, router]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < filtered.length - 1 ? prev + 1 : prev
          );
          // Scroll into view
          requestAnimationFrame(() => {
            if (listRef.current) {
              const items =
                listRef.current.querySelectorAll("[data-command-item]");
              const nextIndex = Math.min(selectedIndex + 1, filtered.length - 1);
              items[nextIndex]?.scrollIntoView({ block: "nearest" });
            }
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          // Scroll into view
          requestAnimationFrame(() => {
            if (listRef.current) {
              const items =
                listRef.current.querySelectorAll("[data-command-item]");
              const prevIndex = Math.max(selectedIndex - 1, 0);
              items[prevIndex]?.scrollIntoView({ block: "nearest" });
            }
          });
          break;
        case "Enter":
          e.preventDefault();
          if (filtered[selectedIndex]) {
            handleNavigate(filtered[selectedIndex].id);
          }
          break;
        case "Escape":
          e.preventDefault();
          handleClose();
          break;
      }
    },
    [filtered, selectedIndex, handleNavigate, handleClose]
  );

  // Click outside to close
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleClose();
      }
    },
    [handleClose]
  );

  // Focus input when opened
  const handleTransitionEnd = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
      onAnimationEnd={handleTransitionEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div className="w-full max-w-2xl bg-[#121212] border border-white/[0.12] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.08]">
          <Search
            className="text-[#475569] shrink-0"
            size={20}
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            onKeyDown={handleKeyDown}
            placeholder="Search presentations..."
            className="flex-1 bg-transparent text-lg text-[#f8fafc] placeholder:text-[#475569] focus:outline-none"
            autoComplete="off"
            spellCheck={false}
            aria-label="Search presentations"
            autoFocus
          />
          <kbd
            className="hidden sm:inline-flex items-center px-2 py-1 rounded bg-white/[0.05] border border-white/[0.10] text-xs text-[#475569]"
            aria-hidden="true"
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="max-h-[50vh] overflow-y-auto py-2"
          role="listbox"
          aria-label="Search results"
        >
          {filtered.length === 0 ? (
            <div className="px-5 py-8 text-center text-[#475569]">
              No presentations found
            </div>
          ) : (
            <>
              <div
                className="px-4 py-2 text-xs font-medium text-[#475569] uppercase tracking-wider"
                aria-hidden="true"
              >
                {query.trim() ? "Results" : "Recent"}
              </div>
              {filtered.map((presentation, index) => (
                <button
                  key={presentation.id}
                  data-command-item
                  onClick={() => handleNavigate(presentation.id)}
                  className={`w-full flex items-center gap-4 px-5 py-3 text-left transition-colors ${
                    index === selectedIndex
                      ? "bg-indigo-500/20 text-[#f8fafc]"
                      : "text-[#94a3b8] hover:bg-white/[0.05]"
                  }`}
                  role="option"
                  aria-selected={index === selectedIndex}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      index === selectedIndex
                        ? "bg-indigo-500/30"
                        : "bg-white/[0.05]"
                    }`}
                    aria-hidden="true"
                  >
                    {presentation.pinned ? (
                      <Star size={16} className="text-amber-400" />
                    ) : (
                      <FileText size={16} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[#f8fafc] truncate">
                      {presentation.title}
                    </div>
                    <div className="text-sm text-[#475569] truncate">
                      {presentation.subject} • {presentation.topic}
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className={`shrink-0 transition-opacity ${
                      index === selectedIndex ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden="true"
                  />
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer hints */}
        <div
          className="px-5 py-3 border-t border-white/[0.08] flex items-center gap-4 text-xs text-[#475569]"
          aria-hidden="true"
        >
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.10]">
              ↑↓
            </kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.10]">
              ↵
            </kbd>
            Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.10]">
              esc
            </kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}
