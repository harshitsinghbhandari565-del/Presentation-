/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Sparkles, Grid, Clock, Star, Play, ArrowRight, ArrowUpRight, Presentation as PresentationIcon, Search, List, BarChart3 } from "lucide-react";
import FeaturedPresentation from "@/components/dashboard/FeaturedPresentation";
import SearchBar from "@/components/dashboard/SearchBar";
import SubjectChips from "@/components/dashboard/SubjectChips";
import data from "@/data/presentations.json";
import type { Presentation } from "@/types/presentation";
import { VaultCard } from "@/components/primitive/card/VaultCard";
import { VaultBadge } from "@/components/primitive/badge/VaultBadge";
import { formatNumber } from "@/lib/format";
import { DashboardSkeleton } from "@/components/layout/DashboardSkeleton";
import Link from "next/link";

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

  const recentlyViewed = useMemo(
    () => presentations.slice(1, 4),
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

  if (!mounted) return <DashboardSkeleton />;

  return (
    <div className="space-y-12 pb-32">
      {/* 1. Hero Section - The Focal Point */}
      <section className="w-full animate-in fade-in slide-in-from-top-6 duration-1000">
        {pinned && <FeaturedPresentation presentation={pinned} />}
      </section>

      {/* 2. Search & Filters Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
              <VaultCard className="p-1 h-full shadow-lg">
                  <div className="flex items-center gap-4 px-6 py-4">
                      <Search size={20} className="text-indigo-500" />
                      <div className="flex-1">
                        <SearchBar onSearch={setQuery} />
                      </div>
                  </div>
              </VaultCard>
          </div>
          <div className="lg:col-span-4">
              <VaultCard className="p-1 h-full shadow-lg">
                  <div className="flex items-center gap-4 px-6 py-4 overflow-x-auto no-scrollbar">
                      <List size={20} className="text-orange-500 shrink-0" />
                      <SubjectChips
                        subjects={subjects}
                        active={subject}
                        onSelect={setSubject}
                      />
                  </div>
              </VaultCard>
          </div>
      </div>

      {/* 3. Mid-Section Bento: Stats, Recently Viewed, Subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Recently Viewed (High Depth) */}
          <section className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                    <Clock size={20} className="text-indigo-400" />
                    <h2 className="text-xl font-bold tracking-tight text-white">Continue Learning</h2>
                </div>
                <Link href="/library" className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-indigo-300 transition-colors">History →</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {recentlyViewed.map(p => (
                      <VaultCard key={p.id} interactive onClick={() => window.location.href=`/presentation/${p.id}`} className="group p-0 overflow-hidden border-white/5 bg-black/40 backdrop-blur-md">
                           <div className="aspect-[16/10] bg-black relative overflow-hidden flex items-center justify-center border-b border-white/5">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="w-2/3 aspect-video bg-white/[0.03] rounded border border-white/10 p-2 flex flex-col gap-1 transform group-hover:scale-110 transition-transform duration-700 shadow-2xl">
                                    <div className="w-1/3 h-1 bg-indigo-500/40 rounded-full" />
                                    <div className="w-full h-1 bg-white/10 rounded-full" />
                                    <div className="w-2/3 h-1 bg-white/10 rounded-full" />
                                </div>
                                <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-mono text-white/40">12 SLIDES</div>
                           </div>
                           <div className="p-4 space-y-2">
                                <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">{p.title}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] text-white/40 uppercase font-bold tracking-widest">{p.subject}</span>
                                    <span className="text-[9px] text-indigo-400/60 font-mono">2h ago</span>
                                </div>
                           </div>
                      </VaultCard>
                  ))}
              </div>
          </section>

          {/* Statistics Bento (Premium Accent) */}
          <aside className="lg:col-span-4 space-y-6">
              <div className="flex items-center gap-3 px-2">
                  <BarChart3 size={20} className="text-orange-500" />
                  <h2 className="text-xl font-bold tracking-tight text-white">Hub Metrics</h2>
              </div>
              <VaultCard className="p-6 bg-gradient-to-br from-white/[0.03] to-transparent border-white/10 shadow-2xl flex-1 flex flex-col justify-between min-h-[240px]">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Active Records</span>
                            <div className="text-5xl font-black text-white tracking-tighter tabular-nums">{formatNumber(presentations.length)}</div>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                            <PresentationIcon size={24} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Disciplines</span>
                        <div className="text-3xl font-bold text-white tracking-tight">{formatNumber(subjects.length)}</div>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">Global Sync Enabled</span>
                      </div>
                  </div>
              </VaultCard>
          </aside>
      </div>

      {/* 4. The Library Catalogue (Rich Grid) */}
      <section className="space-y-10">
         <div className="flex items-center gap-6 px-2">
            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 shadow-lg">
                    <Grid size={18} />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Archive Catalogue</h2>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{filtered.length} Results</div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map((p) => (
                <div key={p.id} className="animate-in fade-in slide-in-from-bottom-3 duration-700">
                    <VaultCard interactive onClick={() => window.location.href=`/presentation/${p.id}`} className="h-full p-0 overflow-hidden group border-white/5 hover:border-orange-500/40 bg-black/20 hover:bg-black/40 transition-all duration-500">
                        {/* Rich Thumbnail with Hover Effects */}
                        <div className="h-44 bg-black flex items-center justify-center relative overflow-hidden border-b border-white/5">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_rgba(255,85,0,0.1)_0%,_transparent_70%)] group-hover:scale-150 transition-transform duration-1000" />
                            <div className="w-[60%] aspect-video bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/10 p-3 flex flex-col gap-2 transform group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 shadow-2xl relative z-10">
                                <div className="w-1/4 h-1.5 bg-orange-500/40 rounded-full" />
                                <div className="w-full h-2 bg-white/10 rounded-full" />
                                <div className="w-5/6 h-2 bg-white/10 rounded-full" />
                                <div className="mt-auto flex justify-between items-end">
                                    <div className="w-6 h-6 rounded bg-white/5 border border-white/5" />
                                    <div className="w-6 h-6 rounded bg-white/5 border border-white/5" />
                                </div>
                            </div>
                            {/* Glass Overlay Play Button */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20">
                                <div className="p-4 rounded-full bg-orange-600/20 backdrop-blur-xl border border-orange-500/30 text-orange-500 shadow-2xl">
                                    <Play size={24} fill="currentColor" />
                                </div>
                            </div>
                            <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/5 text-[8px] font-black text-white/40 uppercase tracking-widest z-30">Hub v2.0</div>
                        </div>

                        <div className="p-6 space-y-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start">
                                <VaultBadge variant="info" label={p.subject} className="bg-indigo-500/10 border-indigo-500/20 text-indigo-400 font-black" />
                                {p.pinned && <Star size={14} fill="currentColor" className="text-orange-500 animate-pulse" />}
                            </div>
                            <div className="flex-1 space-y-2">
                                <h3 className="font-bold text-xl text-white line-clamp-2 leading-tight group-hover:text-orange-500 transition-colors">
                                    {p.title}
                                </h3>
                                <p className="text-[10px] text-white/30 font-mono uppercase tracking-[0.2em] font-bold">
                                    {p.topic}
                                </p>
                            </div>
                            <p className="text-sm text-white/50 line-clamp-2 leading-relaxed font-light">
                                {p.description}
                            </p>
                            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-4 text-[9px] font-black text-white/20 uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={10} />
                                        <span>15m</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <ArrowUpRight size={10} />
                                        <span>Interactive</span>
                                    </div>
                                </div>
                                <Link 
                                    href={`/presentation/${p.id}`}
                                    className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5 text-white/40 hover:text-white hover:bg-orange-600 hover:border-orange-500 transition-all active:scale-90 shadow-sm"
                                >
                                    <ArrowRight size={16} />
                                </Link>
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
