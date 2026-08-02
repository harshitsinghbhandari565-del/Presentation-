"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, Sparkles, ExternalLink, Shield } from "lucide-react";
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
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-6">
        <h2 className="text-2xl font-bold">Record Missing</h2>
        <VaultButton onClick={() => router.push("/dashboard")}>Back to Safety</VaultButton>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Protocol: Return</span>
        </button>
        
        <div className="flex items-center gap-3">
          <VaultBadge variant="info" label={presentation.platform} />
          {presentation.pinned && <VaultBadge variant="warning" label="PINNED" />}
        </div>
      </div>

      {/* Header section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-indigo-400">
            <span className="h-px w-8 bg-indigo-500/50" />
            <span className="text-xs font-black uppercase tracking-[0.3em]">{presentation.subject}</span>
        </div>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black leading-[1] tracking-tighter text-[var(--color-text-primary)] title-glow">
          {presentation.title}
        </h1>
        <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-3xl font-light italic font-display opacity-90">
          {presentation.topic}
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            {/* Launch Card */}
            <VaultCard className="p-8 md:p-12 border-t-4 border-t-indigo-500 shadow-2xl overflow-hidden relative">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4 text-center md:text-left">
                        <h2 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">Access Record</h2>
                        <p className="text-[var(--color-text-secondary)] text-sm max-w-xs mx-auto md:mx-0">Establish a secure connection to begin the presentation session.</p>
                        
                        <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                            <a href={presentation.presentUrl || presentation.url} target="_blank" rel="noopener noreferrer">
                                <VaultButton variant="primary" size="default">
                                    <Play size={18} fill="currentColor" className="mr-2" />
                                    Launch Hub
                                </VaultButton>
                            </a>
                            <VaultButton variant="secondary" onClick={() => {}}>
                                <ExternalLink size={18} className="mr-2" />
                                Alternate Link
                            </VaultButton>
                        </div>
                    </div>
                    
                    <div className="w-48 h-48 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shadow-inner relative group">
                         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-accent-indigo)_0%,_transparent_70%)] opacity-20 group-hover:opacity-40 transition-opacity" />
                         <Play size={64} className="text-indigo-400/50 group-hover:text-indigo-400 group-hover:scale-110 transition-all" />
                    </div>
                </div>
                
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[80px] rounded-full pointer-events-none" />
            </VaultCard>

            {/* Overview */}
            <VaultCard title="Record Abstract" className="p-8">
                <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed font-light whitespace-pre-wrap">
                    {presentation.description}
                </p>
            </VaultCard>
        </div>

        <aside className="space-y-6">
            {/* Details Piece */}
            <VaultCard title="Protocol Metadata" className="p-6">
                <div className="space-y-6">
                    <div>
                        <div className="text-[10px] text-[var(--color-text-secondary)] uppercase font-black tracking-widest mb-1">Source ID</div>
                        <div className="text-[var(--color-text-primary)] font-mono text-sm break-all bg-white/5 p-2 rounded border border-white/5">{presentation.id}</div>
                    </div>
                    <div>
                        <div className="text-[10px] text-[var(--color-text-secondary)] uppercase font-black tracking-widest mb-2">Access Tags</div>
                        <div className="flex flex-wrap gap-2">
                            {presentation.tags.map(tag => (
                                <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-indigo-400 font-bold">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </VaultCard>

            {/* Security Tip */}
            <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex gap-4">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 h-fit">
                    <Shield size={16} />
                </div>
                <div className="space-y-1">
                    <span className="text-sm font-black text-emerald-400 uppercase tracking-widest block">Safe Access</span>
                    <p className="text-[10px] text-[var(--color-text-secondary)] leading-relaxed font-medium uppercase tracking-wider">
                        All records are decrypted on the fly for secure in-class delivery.
                    </p>
                </div>
            </div>
        </aside>
      </div>
    </div>
  );
}
