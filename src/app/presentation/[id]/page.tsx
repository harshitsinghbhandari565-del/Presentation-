"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, Sparkles, ExternalLink, Presentation as PresentationIcon, Monitor } from "lucide-react";
import data from "@/data/presentations.json";
import { VaultButton } from "@/components/primitive/button/VaultButton";
import { VaultBadge } from "@/components/primitive/badge/VaultBadge";
import { VaultCard } from "@/components/primitive/card/VaultCard";
import { VaultIcon } from "@/components/primitive/icon/VaultIcon";
import type { Presentation } from "@/types/presentation";

export default function PresentationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const presentation = useMemo(
    () => (data.presentations as Presentation[]).find((p) => p.id === id),
    [id]
  );

  if (!presentation) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-8">
        <h2 className="text-3xl font-black text-[var(--color-text-primary)]">Presentation Not Found</h2>
        <VaultButton onClick={() => router.push("/")}>Return to Library</VaultButton>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-16 pb-24">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-3 text-[var(--color-text-secondary)] hover:text-indigo-400 transition-all group"
        >
          <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:bg-indigo-600/10 group-hover:border-indigo-500/20">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.2em]">Return to Library</span>
        </button>
        
        <div className="flex items-center gap-4">
          <VaultBadge variant="info" label={presentation.platform} />
          {presentation.pinned && <VaultBadge variant="warning" label="FEATURED" />}
        </div>
      </div>

      {/* Header section */}
      <div className="space-y-8">
        <div className="flex items-center gap-4 text-indigo-400">
            <div className="w-12 h-px bg-gradient-to-r from-indigo-500/50 to-transparent" />
            <span className="text-sm font-black uppercase tracking-[0.4em]">{presentation.subject}</span>
        </div>
        <h1 className="font-display text-5xl md:text-8xl font-black leading-[0.95] tracking-tighter text-[var(--color-text-primary)] title-glow">
          {presentation.title}
        </h1>
        <p className="text-2xl md:text-3xl text-[var(--color-text-secondary)] max-w-4xl font-light italic font-display opacity-80 leading-relaxed">
          {presentation.topic}
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
            {/* Launch Card */}
            <VaultCard className="p-0 border-none shadow-2xl overflow-hidden relative rounded-3xl min-h-[400px]">
                <div className="absolute inset-0 bg-[#0A0A0C]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-accent-indigo)_0%,_transparent_70%)] opacity-10" />
                </div>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 p-8 md:p-16 relative z-10 h-full">
                    <div className="space-y-8 text-center md:text-left flex-1">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black text-white tracking-tight leading-none">Open Hub</h2>
                            <p className="text-[var(--color-text-secondary)] text-lg font-light leading-relaxed max-w-sm mx-auto md:mx-0">
                                Launch the interactive presentation viewer to start your classroom session.
                            </p>
                        </div>
                        
                        <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-5">
                            <a href={presentation.presentUrl || presentation.url} target="_blank" rel="noopener noreferrer">
                                <VaultButton variant="primary" size="default" className="h-14 px-10 text-base font-bold shadow-xl shadow-orange-600/20">
                                    <Play size={20} fill="currentColor" className="mr-3" />
                                    Launch Hub
                                </VaultButton>
                            </a>
                        </div>
                    </div>
                    
                    <div className="w-56 h-56 rounded-[2.5rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-inner relative group">
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-accent-indigo)_0%,_transparent_70%)] opacity-20 group-hover:opacity-40 transition-opacity" />
                         <PresentationIcon size={80} className="text-indigo-400/40 group-hover:text-indigo-400 group-hover:scale-110 transition-all duration-700" />
                    </div>
                </div>
                
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none" />
            </VaultCard>

            {/* Overview */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">Overview</h3>
                    <div className="h-px flex-1 bg-white/5" />
                </div>
                <p className="text-[var(--color-text-secondary)] text-xl leading-relaxed font-light whitespace-pre-wrap">
                    {presentation.description}
                </p>
            </div>
        </div>

        <aside className="lg:col-span-4 space-y-8">
            {/* Details Piece */}
            <VaultCard title="Presentation Info" className="p-8 border-white/10 shadow-xl rounded-3xl">
                <div className="space-y-8">
                    <div>
                        <div className="text-[10px] text-[var(--color-text-secondary)] uppercase font-black tracking-widest mb-2 opacity-50">Reference Key</div>
                        <div className="text-[var(--color-text-primary)] font-mono text-sm break-all bg-white/[0.03] p-4 rounded-xl border border-white/5 shadow-inner leading-relaxed">
                            {presentation.id}
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] text-[var(--color-text-secondary)] uppercase font-black tracking-widest mb-4 opacity-50">Topic Tags</div>
                        <div className="flex flex-wrap gap-2.5">
                            {presentation.tags.map(tag => (
                                <span key={tag} className="text-[10px] px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-black uppercase tracking-widest transition-colors hover:bg-indigo-500/20">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </VaultCard>

            {/* Teaching Tip */}
            <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 flex flex-col gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 shadow-sm">
                        <Monitor size={24} />
                    </div>
                    <span className="text-base font-black text-indigo-300 uppercase tracking-widest">Presenter Tip</span>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed font-medium">
                    This presentation is optimized for <span className="text-[var(--color-text-primary)]">Google Slides</span>. For the best experience, ensure you are signed in to your school account before launching the viewer.
                </p>
            </div>
        </aside>
      </div>
    </div>
  );
}
