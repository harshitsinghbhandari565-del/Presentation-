/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Sparkles, Grid, Clock, Star, Play, ArrowRight, Presentation as PresentationIcon } from "lucide-react";
import FeaturedPresentation from "@/components/dashboard/FeaturedPresentation";
import SearchBar from "@/components/dashboard/SearchBar";
import SubjectChips from "@/components/dashboard/SubjectChips";
import data from "@/data/presentations.json";
import type { Presentation } from "@/types/presentation";
import { VaultCard } from "@/components/primitive/card/VaultCard";
import { VaultBadge } from "@/components/primitive/badge/VaultBadge";
import { formatNumber } from "@/lib/format";
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

  if (!mounted) return <div className="min-h-screen bg-[var(--color-surface-base)]" />;

  return (
    <div className="space-y-20 pb-32 max-w-[1600px] mx-auto">
      {/* Hero Section */}
      <section className="animate-in fade-in slide-in-from-top-4 duration-700">
        {pinned && <FeaturedPresentation presentation={pinned} />}
      </section>

      {/* Secondary Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-20">
            {/* Recently Viewed */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                            <Clock size={20} />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Recently Viewed</h2>
                    </div>
                    <Link href="/library" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">See All</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recentlyViewed.map(p => (
                        <VaultCard key={p.id} interactive onClick={() => window.location.href=`/presentation/${p.id}`} className="group p-5">
                             <div className="aspect-video bg-black rounded-lg mb-4 border border-white/5 overflow-hidden flex items-center justify-center relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-1/2 aspect-video bg-white/5 rounded border border-white/10 p-2 flex flex-col gap-1 transform group-hover:scale-110 transition-transform">
                                    <div className="w-1/3 h-1 bg-indigo-500/40 rounded-full" />
                                    <div className="w-full h-1 bg-white/10 rounded-full" />
                                </div>
                             </div>
                             <h3 className="font-bold text-[var(--color-text-primary)] line-clamp-1 group-hover:text-indigo-400 transition-colors">{p.title}</h3>
                             <p className="text-[10px] text-[var(--color-text-secondary)] uppercase font-black tracking-widest mt-1">{p.subject}</p>
                        </VaultCard>
                    ))}
                </div>
            </section>

            {/* All Catalogue */}
            <section className="space-y-10">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                            <PresentationIcon size={20} />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">Presentation Library</h2>
                    </div>
                    <div className="h-px flex-1 bg-white/5" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filtered.map((p) => (
                        <div key={p.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <VaultCard interactive onClick={() => window.location.href=`/presentation/${p.id}`} className="h-full p-0 overflow-hidden group border-white/5 hover:border-orange-500/30">
                                <div className="h-32 bg-black flex items-center justify-center border-b border-white/5 relative">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,_rgba(255,85,0,0.1)_0%,_transparent_70%)]" />
                                    <div className="w-1/2 aspect-video bg-white/5 rounded border border-white/10 p-2 flex flex-col gap-1.5 transform group-hover:scale-110 transition-transform duration-500">
                                        <div className="w-1/4 h-1 bg-orange-500/40 rounded-full" />
                                        <div className="w-full h-1 bg-white/10 rounded-full" />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-40" />
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <VaultBadge variant="warning" label={p.subject} />
                                        {p.pinned && <Star size={14} fill="currentColor" className="text-orange-500" />}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-[var(--color-text-primary)] line-clamp-1 group-hover:text-orange-500 transition-colors">
                                            {p.title}
                                        </h3>
                                        <p className="text-xs text-[var(--color-text-secondary)] font-mono mt-1 opacity-60 tracking-wider">
                                            {p.topic}
                                        </p>
                                    </div>
                                    <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed font-light">
                                        {p.description}
                                    </p>
                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Start Session →</span>
                                        <span className="text-[10px] font-bold text-[var(--color-text-secondary)] opacity-40 uppercase">{p.platform}</span>
                                    </div>
                                </div>
                            </VaultCard>
                        </div>
                    ))}
                </div>
            </section>
        </div>

        {/* Sidebar Controls */}
        <aside className="lg:col-span-4 space-y-10">
            <VaultCard title="Search & Filters" glass className="shadow-2xl border-white/10">
                <div className="space-y-10 p-4">
                    <SearchBar onSearch={setQuery} />
                    
                    <div className="space-y-4">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)] font-black block">Categories</span>
                        <SubjectChips
                            subjects={subjects}
                            active={subject}
                            onSelect={setSubject}
                        />
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col gap-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
                                <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Active</div>
                                <div className="text-3xl font-black text-white mt-1">{formatNumber(presentations.length)}</div>
                            </div>
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center">
                                <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Subjects</div>
                                <div className="text-3xl font-black text-white mt-1">{formatNumber(subjects.length)}</div>
                            </div>
                        </div>
                        
                        <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex flex-col gap-3">
                             <div className="flex items-center gap-2 text-indigo-400">
                                <Sparkles size={16} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Learning Hub</span>
                             </div>
                             <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed font-medium">
                                Create an account to sync your favorite presentations across all your classroom devices.
                             </p>
                        </div>
                    </div>
                </div>
            </VaultCard>
            
            <VaultCard title="Quick Resources" className="p-6">
                 <ul className="space-y-4">
                    {['Curriculum Guide', 'Teaching Tools', 'Platform Tutorial'].map(item => (
                        <li key={item}>
                            <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group text-sm font-bold text-[var(--color-text-secondary)] hover:text-white">
                                {item}
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </li>
                    ))}
                 </ul>
            </VaultCard>
        </aside>
      </div>
    </div>
  );
}
