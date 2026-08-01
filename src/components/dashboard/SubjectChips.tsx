"use client";

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
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by subject">
      <button
        onClick={() => onSelect("All")}
        aria-pressed={active === "All"}
        className={`px-2.5 py-1 rounded-md text-sm transition-colors ${
          active === "All"
            ? "bg-white/[0.08] border border-white/[0.12] text-[#f8fafc]"
            : "bg-white/[0.02] border border-white/[0.06] text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/[0.04]"
        }`}
      >
        All
      </button>
      {subjects.map((s) => (
        <button
          key={s}
          onClick={() => onSelect(s)}
          aria-pressed={active === s}
          className={`px-2.5 py-1 rounded-md text-sm transition-colors ${
            active === s
              ? "bg-white/[0.08] border border-white/[0.12] text-[#f8fafc]"
              : "bg-white/[0.02] border border-white/[0.06] text-[#94a3b8] hover:text-[#f8fafc] hover:bg-white/[0.04]"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
