import React from 'react';
import Link from 'next/link';
import { Sparkles, Play, ArrowUpRight, Presentation as PresentationIcon } from 'lucide-react';
import { VaultCard } from '@/components/primitive/card/VaultCard';
import { VaultButton } from '@/components/primitive/button/VaultButton';
import { VaultBadge } from '@/components/primitive/badge/VaultBadge';
import { VaultIcon } from '@/components/primitive/icon/VaultIcon';
import type { Presentation } from '@/types/presentation';

export default function FeaturedPresentation({
  presentation,
}: {
  presentation: Presentation;
}) {
  return (
    <div className="relative group/hero">
        <VaultCard className="p-0 border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden rounded-[2rem] bg-black border border-white/5 h-full">
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-transparent to-indigo-600/5 opacity-40" />
                <div className="absolute top-0 right-0 w-[60%] h-full bg-[radial-gradient(circle_at_70%_30%,_rgba(255,85,0,0.1)_0%,_transparent_70%)]" />
                <div className="absolute bottom-0 left-0 w-full h-[50%] bg-gradient-to-t from-black to-transparent z-10" />
            </div>

            <div className="relative z-20 p-8 md:p-14 lg:p-20 flex flex-col lg:flex-row gap-16 items-center">
                <div className="flex-1 space-y-10 text-center lg:text-left animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <Sparkles size={14} className="text-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Featured Session</span>
                    </div>

                    <div className="space-y-6">
                        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-black tracking-tightest text-white leading-[0.85] text-balance">
                            {presentation.title}
                        </h1>
                        <p className="text-xl md:text-2xl text-white/50 font-light italic font-display max-w-xl mx-auto lg:mx-0">
                            {presentation.topic}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5">
                        <Link href={`/presentation/${presentation.id}`}>
                            <VaultButton variant="primary" className="h-16 px-10 rounded-2xl text-lg font-bold shadow-[0_20px_40px_-10px_rgba(255,85,0,0.4)] hover:shadow-[0_25px_50px_-10px_rgba(255,85,0,0.6)]">
                                <Play size={20} fill="currentColor" className="mr-3" />
                                Start Session
                            </VaultButton>
                        </Link>
                        <Link href="/library">
                            <VaultButton variant="ghost" className="h-16 px-8 rounded-2xl text-lg font-bold border border-white/10 hover:bg-white/5">
                                Browse Collection
                            </VaultButton>
                        </Link>
                    </div>
                </div>

                {/* Perspective Presentation Mockup */}
                <div className="hidden lg:flex flex-1 relative perspective-1000">
                    <div className="relative w-full aspect-video bg-white/[0.03] backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] overflow-hidden transform rotate-x-6 rotate-y-[-12deg] rotate-z-2 group-hover/hero:rotate-0 group-hover/hero:scale-105 transition-all duration-1000 p-10 flex flex-col gap-8">
                        <div className="flex justify-between items-center">
                            <div className="w-16 h-2 bg-orange-500/40 rounded-full" />
                            <div className="flex gap-3">
                                <div className="w-3 h-3 rounded-full bg-white/10" />
                                <div className="w-3 h-3 rounded-full bg-white/10" />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="w-full h-8 bg-white/5 rounded-2xl" />
                            <div className="w-full h-8 bg-white/5 rounded-2xl" />
                            <div className="w-3/4 h-8 bg-white/5 rounded-2xl" />
                        </div>
                        <div className="mt-auto h-40 bg-black/40 rounded-[2rem] border border-white/5 flex items-center justify-center shadow-inner relative group/play">
                            <div className="absolute inset-0 bg-orange-600/5 group-hover/play:bg-orange-600/10 transition-colors" />
                            <Play size={64} className="text-white/5 group-hover/play:text-orange-500 group-hover/play:scale-110 transition-all duration-500" />
                        </div>
                    </div>
                    {/* Floating elements */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/20 blur-[60px] rounded-full animate-pulse" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 blur-[80px] rounded-full animate-pulse" />
                </div>
            </div>
        </VaultCard>
    </div>
  );
}
