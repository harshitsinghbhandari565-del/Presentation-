"use client";
import React from 'react';

export default function SubjectChips({
  subjects,
  active,
  onSelect,
}: {
  subjects: string[];
  active: string;
  onSelect: (s: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by subject">
      <button
        onClick={() => onSelect("All")}
        aria-pressed={active === "All"}
        className={`px-5 py-2.5 min-h-[40px] rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 border ${
          active === "All"
            ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95"
            : "bg-white/[0.03] border-white/[0.08] text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/[0.06] hover:border-white/[0.12] active:scale-95"
        }`}
      >
        ALL
      </button>
      {subjects.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          aria-pressed={active === s}
          className={`px-5 py-2.5 min-h-[40px] rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 border ${
            active === s
              ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-95"
              : "bg-white/[0.03] border-white/[0.08] text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/[0.06] hover:border-white/[0.12] active:scale-95"
          }`}
        >
          {s.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
