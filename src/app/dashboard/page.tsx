"use client";
import React, { useState, useMemo } from "react";
import { Sparkles, Grid } from "lucide-react";
import FeaturedPresentation from "@/components/dashboard/FeaturedPresentation";
import SearchBar from "@/components/dashboard/SearchBar";
import SubjectChips from "@/components/dashboard/SubjectChips";
import data from "@/data/presentations.json";
import type { Presentation } from "@/types/presentation";
import { VaultCard } from "@/components/primitive/card/VaultCard";
import { VaultBadge } from "@/components/primitive/badge/VaultBadge";
import { formatNumber } from "@/lib/format";

export default function DashboardPage() {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All");

  const presentations = useMemo(
    () => (data.presentations || []) as Presentation[],
    []
  );
  const pinned = useMemo(
    () => presentations.find((p) => p.pinned),
    [presentations]
  );

  const filtered = useMemo(() => {
    let arr = presentations;
    if (subject !== "All") arr = arr.filter((p) => p.subject === subject);
    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.topic.toLowerCase().includes(q) ||
          p.subject.toLowerCase().includes(q) ||
          p.tags.some((t: string) => t.includes(q))
      );
    }
    return arr;
  }, [query, subject, presentations]);

  const subjects = useMemo(
    () => Array.from(new Set(presentations.map((p) => p.subject))),
    [presentations]
  );

  return (
    <div className="space-y-12">
      <div>
         <h1 className="font-display text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            Morning, <span className="text-[var(--color-accent-default)] italic">Harshit</span>.
         </h1>
         <p className="text-[var(--color-text-secondary)] mt-1 font-body">Ready to inspire today&apos;s class?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 xl:col-span-9">
            {pinned ? (
                <FeaturedPresentation presentation={pinned} />
            ) : (
                <VaultCard className="p-12 border-dashed flex items-center justify-center">
                    <p className="text-[var(--color-text-secondary)] italic">No featured content currently available.</p>
                </VaultCard>
            )}
        </div>

        <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            <VaultCard title="Presentation Library" className="shadow-lg">
                <div className="space-y-6 p-4">
                    <SearchBar onSearch={setQuery} />
                    
                    <div>
                        <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] font-bold mb-3 block">Quick Filter</span>
                        <SubjectChips
                            subjects={subjects}
                            active={subject}
                            onSelect={setSubject}
                        />
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                             <span className="text-xs font-bold text-[var(--color-text-primary)]">{filtered.length} AVAILABLE</span>
                         </div>
                         <VaultBadge variant="info" label="SYNCED" />
                    </div>
                </div>
            </VaultCard>

            <div className="grid grid-cols-2 gap-4">
                <VaultCard className="p-5 border-l-2 border-l-indigo-500">
                    <div className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-widest">Vault Items</div>
                    <div className="text-3xl font-extrabold text-[var(--color-text-primary)] mt-1">{formatNumber(presentations.length)}</div>
                </VaultCard>
                <VaultCard className="p-5 border-l-2 border-l-emerald-500">
                    <div className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-widest">Active Keys</div>
                    <div className="text-3xl font-extrabold text-[var(--color-text-primary)] mt-1">{formatNumber(subjects.length)}</div>
                </VaultCard>
            </div>
        </aside>
      </div>

      <section className="space-y-6">
         <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                <Grid size={16} className="text-indigo-400" />
            </div>
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">All Records</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p) => (
                <div key={p.id}>
                    <VaultCard interactive onClick={() => window.location.href=`/presentation/${p.id}`} className="h-full p-6">
                         <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <VaultBadge variant="warning" label={p.subject} />
                                {p.pinned && <Sparkles size={14} className="text-indigo-400" />}
                            </div>
                            <h3 className="font-bold text-lg text-[var(--color-text-primary)] line-clamp-1 leading-tight">
                                {p.title}
                            </h3>
                            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                                {p.description}
                            </p>
                            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                                <span>{p.topic}</span>
                                <span>VIEW →</span>
                            </div>
                         </div>
                    </VaultCard>
                </div>
            ))}
         </div>
      </section>
    </div>
  );
}
