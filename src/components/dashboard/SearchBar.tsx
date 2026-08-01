"use client";
import { Search } from "lucide-react";

export default function SearchBar({
  onSearch,
}: {
  onSearch: (q: string) => void;
}) {
  return (
    <div className="relative">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]"
        size={16}
        aria-hidden="true"
      />
      <input
        type="text"
        placeholder="Search presentations..."
        onChange={(e) => onSearch(e.target.value)}
        className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-[#f8fafc] placeholder:text-[#475569] focus:outline-none focus:border-indigo-400/50 focus:bg-white/[0.04] transition-all"
        aria-label="Search presentations"
      />
    </div>
  );
}
