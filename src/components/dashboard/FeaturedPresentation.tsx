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
                    {/* Main Slide */}
                    <div className="relative z-20 w-full aspect-video bg-white/[0.04] backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden transform rotate-x-6 rotate-y-[-10deg] rotate-z-1 group-hover/hero:rotate-0 group-hover/hero:scale-[1.02] transition-all duration-1000 p-8 md:p-10 flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                            <div className="w-20 h-2 bg-orange-500/40 rounded-full" />
                            <Sparkles size={20} className="text-orange-400" />
                        </div>
                        <div className="space-y-4 flex-1">
                            <div className="w-full h-8 bg-white/5 rounded-2xl" />
                            <div className="w-full h-8 bg-white/5 rounded-2xl" />
                            <div className="w-2/3 h-8 bg-white/5 rounded-2xl" />
                        </div>
                        <div className="h-32 bg-black/40 rounded-[2rem] border border-white/5 flex items-center justify-center shadow-inner relative">
                            <div className="absolute inset-0 bg-orange-600/5" />
                            <Play size={48} className="text-white/10" />
                        </div>
                    </div>

                    {/* Floating Secondary Slides */}
                    <div className="absolute -top-12 -right-8 z-10 w-48 aspect-video bg-white/[0.02] backdrop-blur-lg rounded-2xl border border-white/5 shadow-2xl transform rotate-12 group-hover/hero:translate-x-4 group-hover/hero:-translate-y-4 transition-all duration-1000" />
                    <div className="absolute -bottom-10 -left-6 z-30 w-56 aspect-video bg-white/[0.03] backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl transform -rotate-12 group-hover/hero:-translate-x-6 group-hover/hero:translate-y-4 transition-all duration-1000" />
                    
                    {/* Decorative Ambient Light */}
                    <div className="absolute -inset-20 bg-orange-500/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen animate-pulse" />
                </div>
            </div>

            {/* Bottom Glow Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent z-30" />
        </VaultCard>
    </div>
  );
}
