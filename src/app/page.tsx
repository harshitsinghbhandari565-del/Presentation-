/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Sparkles, Grid, Presentation as PresentationIcon } from "lucide-react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return <div className="min-h-screen bg-[var(--color-surface-base)]" />;

  return (
    <div className="space-y-12 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <h1 className="font-display text-4xl md:text-5xl font-black tracking-tighter text-[var(--color-text-primary)]">
              Discover <span className="text-[var(--color-accent-default)] italic tracking-normal">Learning</span>.
           </h1>
           <p className="text-[var(--color-text-secondary)] mt-2 font-body text-lg max-w-lg">
             Explore our curated collection of classroom presentations.
           </p>
        </div>
        
        <div className="hidden lg:flex items-center gap-4 bg-white/5 border border-white/5 px-6 py-4 rounded-2xl backdrop-blur-md">
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.2em]">Total</span>
                <span className="text-2xl font-black text-[var(--color-text-primary)]">{formatNumber(presentations.length)}</span>
            </div>
            <div className="w-px h-8 bg-white/10 mx-2" />
            <div className="flex flex-col">
                <span className="text-[10px] font-black text-[var(--color-text-secondary)] uppercase tracking-[0.2em]">Subjects</span>
                <span className="text-2xl font-black text-[var(--color-text-primary)]">{formatNumber(subjects.length)}</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Featured Hero */}
        <div className="lg:col-span-8 xl:col-span-9 h-full">
            {pinned ? (
                <FeaturedPresentation presentation={pinned} />
            ) : (
                <VaultCard className="p-12 border-dashed flex items-center justify-center h-full">
                    <p className="text-[var(--color-text-secondary)] italic">Select a presentation to highlight.</p>
                </VaultCard>
            )}
        </div>

        {/* Sidebar Controls */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
            <VaultCard title="Presentation Library" className="shadow-2xl border-white/10">
                <div className="space-y-8 p-4">
                    <SearchBar onSearch={setQuery} />
                    
                    <div>
                        <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-secondary)] font-black mb-4 block">Filter by Subject</span>
                        <SubjectChips
                            subjects={subjects}
                            active={subject}
                            onSelect={setSubject}
                        />
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-2.5">
                             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                             <span className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-tight">{filtered.length} Available</span>
                         </div>
                         <VaultBadge variant="info" label="LIVE" />
                    </div>
                </div>
            </VaultCard>
            
            <div className="p-6 rounded-2xl bg-orange-600/5 border border-orange-500/10 flex flex-col gap-3">
                 <div className="flex items-center gap-2 text-orange-400">
                    <Sparkles size={16} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Learning Tip</span>
                 </div>
                 <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-medium">
                    Use <span className="text-[var(--color-text-primary)]">Projector Mode</span> (Top Right) to optimize the hub for classroom displays.
                 </p>
            </div>
        </aside>
      </div>

      {/* Grid Results */}
      <section className="space-y-8">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400">
                    <PresentationIcon size={20} />
                </div>
                <h2 className="text-base font-black uppercase tracking-[0.4em] text-[var(--color-text-secondary)]">Catalogue</h2>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p) => (
                <div key={p.id}>
                    <VaultCard interactive onClick={() => window.location.href=`/presentation/${p.id}`} className="h-full p-6 border-white/5 hover:border-indigo-500/30 transition-all duration-300 shadow-xl group">
                         <div className="space-y-5">
                            <div className="flex justify-between items-start">
                                <VaultBadge variant="info" label={p.subject} />
                                {p.pinned && <Sparkles size={14} className="text-orange-400" />}
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-[var(--color-text-primary)] line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors">
                                    {p.title}
                                </h3>
                                <p className="text-xs text-[var(--color-text-secondary)] font-mono mt-2 opacity-60 tracking-wider">
                                    {p.topic}
                                </p>
                            </div>
                            <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed font-light">
                                {p.description}
                            </p>
                            <div className="pt-5 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] group-hover:translate-x-1 transition-transform">Details →</span>
                                <span className="text-[10px] font-bold text-[var(--color-text-secondary)] opacity-40 uppercase">{p.platform}</span>
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
