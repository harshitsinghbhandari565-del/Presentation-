"use client";
import React, { useState, useMemo } from 'react';
import { Search as SearchIcon, Filter } from 'lucide-react';
import data from "@/data/presentations.json";
import { VaultCard } from "@/components/primitive/card/VaultCard";
import { VaultInput } from "@/components/primitive/input/VaultInput";
import { VaultBadge } from "@/components/primitive/badge/VaultBadge";
import type { Presentation } from "@/types/presentation";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const allPresentations = (data.presentations || []) as Presentation[];
    if (!query.trim()) return allPresentations;
    const q = query.toLowerCase();
    return allPresentations.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.subject.toLowerCase().includes(q) || 
      p.topic.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );
  }, [query]);

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="space-y-6">
        <h1 className="font-display text-4xl font-black tracking-tighter text-[var(--color-text-primary)]">
          Search <span className="text-[var(--color-accent-default)] italic">Records</span>
        </h1>
        <VaultInput 
          type="search"
          placeholder="Search by title, subject, or topic..."
          leadingIcon={<SearchIcon size={20} className="text-indigo-400" />}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="h-16 text-lg px-6"
        />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <span className="text-xs font-black uppercase tracking-widest text-[var(--color-text-secondary)]">
            {filtered.length} results found
          </span>
        </div>

        <div className="space-y-4">
          {filtered.map(p => (
            <VaultCard key={p.id} interactive onClick={() => window.location.href=`/presentation/${p.id}`} className="p-4 group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-[var(--color-text-primary)] group-hover:text-indigo-400 transition-colors">
                    {p.title}
                  </h3>
                  <div className="flex items-center gap-3">
                    <VaultBadge variant="info" label={p.subject} />
                    <span className="text-xs text-[var(--color-text-secondary)] font-mono">{p.topic}</span>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Access Hub →
                </span>
              </div>
            </VaultCard>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-dashed border-white/10">
              <p className="text-[var(--color-text-secondary)] italic">No records match your query.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
