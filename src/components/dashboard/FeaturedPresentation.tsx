import React from 'react';
import Link from 'next/link';
import { Sparkles, Play, ArrowRight, Presentation as PresentationIcon, Monitor, Clock } from 'lucide-react';
import { VaultCard } from '@/components/primitive/card/VaultCard';
import { VaultButton } from '@/components/primitive/button/VaultButton';
import { VaultBadge } from '@/components/primitive/badge/VaultBadge';
import type { Presentation } from '@/types/presentation';

export default function FeaturedPresentation({
  presentation,
}: {
  presentation: Presentation;
}) {
  return (
    <div className="relative group/hero h-full min-h-[500px]">
        <VaultCard className="p-0 border-none shadow-2xl relative overflow-hidden rounded-[2.5rem] bg-black border border-white/5 h-full flex-row items-stretch">
            {/* Visual Background with subtle motion */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/15 via-transparent to-indigo-600/10 opacity-60" />
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_30%,_rgba(255,85,0,0.12)_0%,_transparent_60%)]" />
                <div className="absolute -bottom-1/2 -left-1/4 w-full h-full bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0%,_rgba(99,102,241,0.05)_50%,_transparent_100%)] opacity-30 blur-3xl animate-[spin_30s_linear_infinite]" />
            </div>

            <div className="relative z-20 p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row gap-12 items-center w-full">
                {/* Content Side */}
                <div className="flex-[1.2] space-y-8 text-center lg:text-left">
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                        <VaultBadge variant="warning" label="Featured Session" className="bg-orange-500/10 border-orange-500/20 text-orange-400 font-black px-4 py-1.5 rounded-full" />
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                            <Clock size={12} className="text-indigo-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">25 min read</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-tightest text-white leading-[0.9] text-balance">
                            {presentation.title}
                        </h1>
                        <div className="flex items-center justify-center lg:justify-start gap-3 text-xl md:text-2xl text-white/50 font-light italic font-display">
                            <span className="text-indigo-400/80">{presentation.subject}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                            <span>{presentation.topic}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 pt-4">
                        <Link href={`/presentation/${presentation.id}`}>
                            <VaultButton variant="primary" className="h-16 px-10 rounded-2xl text-lg font-bold shadow-[0_20px_40px_-10px_rgba(255,85,0,0.4)] hover:shadow-[0_25px_50px_-10px_rgba(255,85,0,0.6)] group/btn">
                                <Play size={20} fill="currentColor" className="mr-3" />
                                Continue Session
                                <ArrowRight size={20} className="ml-2 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                            </VaultButton>
                        </Link>
                        <Link href="/library">
                            <VaultButton variant="ghost" className="h-16 px-8 rounded-2xl text-lg font-bold border border-white/10 hover:bg-white/5 text-white/70">
                                Browse Collection
                            </VaultButton>
                        </Link>
                    </div>
                </div>

            {/* Perspective Showcase Side */}
            <div className="hidden lg:flex flex-1 relative perspective-1000 items-center justify-center">
                {/* Background Glow */}
                <div className="absolute -inset-20 bg-orange-500/10 blur-[120px] rounded-full pointer-events-none mix-blend-screen animate-pulse" />

                {/* Secondary Slide (Back) */}
                <div className="absolute top-0 right-0 z-10 w-64 aspect-video bg-white/[0.02] backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-2xl transform rotate-12 -translate-y-8 translate-x-8 group-hover/hero:translate-x-12 group-hover/hero:-translate-y-12 transition-all duration-1000 ease-out" />

                {/* Main Slide */}
                <div className="relative z-20 w-full aspect-video bg-white/[0.04] backdrop-blur-3xl rounded-[2.5rem] border border-white/15 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.9)] overflow-hidden transform rotate-x-6 rotate-y-[-10deg] rotate-z-1 group-hover/hero:rotate-0 group-hover/hero:scale-[1.05] transition-all duration-1000 ease-out p-10 flex flex-col gap-8">
                    <div className="flex justify-between items-center">
                        <div className="w-24 h-2.5 bg-orange-500/40 rounded-full" />
                        <div className="flex gap-2.5">
                            <div className="w-3 h-3 rounded-full bg-white/10" />
                            <div className="w-3 h-3 rounded-full bg-white/10" />
                            <div className="w-3 h-3 rounded-full bg-white/10" />
                        </div>
                    </div>
                    <div className="space-y-5 flex-1">
                        <div className="w-full h-10 bg-white/5 rounded-2xl" />
                        <div className="w-full h-10 bg-white/5 rounded-2xl" />
                        <div className="w-4/5 h-10 bg-white/5 rounded-2xl" />
                    </div>
                    <div className="mt-auto h-44 bg-black/40 rounded-[2.5rem] border border-white/5 flex items-center justify-center shadow-inner relative group/play overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent opacity-0 group-hover/play:opacity-100 transition-opacity" />
                        <Play size={80} className="text-white/5 group-hover/play:text-orange-500 group-hover/play:scale-110 transition-all duration-700 ease-out" />
                    </div>
                </div>

                {/* Front Element (Floating Badge) */}
                <div className="absolute -bottom-8 -left-8 z-30 px-6 py-4 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl transform -rotate-12 group-hover/hero:-translate-x-4 group-hover/hero:translate-y-4 transition-all duration-1000 ease-out flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500">
                        <PresentationIcon size={20} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-white uppercase tracking-widest">Active session</span>
                        <span className="text-[10px] text-white/40 font-mono">01:24:55</span>
                    </div>
                </div>
            </div>
            </div>

            {/* Bottom Glow Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent z-30" />
        </VaultCard>
    </div>
  );
}
