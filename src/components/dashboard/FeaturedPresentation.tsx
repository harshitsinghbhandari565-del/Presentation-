import React from 'react';
import Link from 'next/link';
import { Sparkles, Play, ArrowRight, Presentation as PresentationIcon } from 'lucide-react';
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
    <VaultCard className="p-0 border-none shadow-2xl relative group/hero overflow-hidden min-h-[420px] rounded-3xl">
       {/* Premium High-Impact Background */}
       <div className="absolute inset-0 bg-[#0A0A0C]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_var(--color-accent-indigo)_0%,_transparent_60%)] opacity-20 group-hover/hero:opacity-30 transition-opacity duration-1000" />
            <div className="absolute -bottom-1/2 -left-1/4 w-full h-full bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0%,_var(--color-accent-emerald)_50%,_transparent_100%)] opacity-10 blur-3xl" />
       </div>

       <div className="relative z-20 p-8 md:p-14 flex flex-col lg:flex-row gap-12 items-center h-full">
            <div className="flex-1 space-y-10 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-4">
                    <VaultBadge variant="warning" label="FEATURED SESSION" />
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <div className="flex items-center gap-1.5">
                        <PresentationIcon size={12} className="text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">Classroom Ready</span>
                    </div>
                </div>

                <div className="space-y-5">
                    <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white leading-[0.9]">
                        {presentation.title}
                    </h1>
                    <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] font-light italic font-display max-w-xl mx-auto lg:mx-0 opacity-80">
                        {presentation.topic}
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5">
                    <Link href={`/presentation/${presentation.id}`}>
                        <VaultButton variant="primary" size="default" className="shadow-2xl shadow-orange-600/30 px-8 h-14 text-base font-bold">
                            <Play size={20} fill="currentColor" className="mr-2" />
                            Start Presentation
                        </VaultButton>
                    </Link>
                    <Link href="/library">
                        <VaultButton variant="ghost" className="h-14 px-6 text-base font-bold text-white/60 hover:text-white">
                            Browse Library
                        </VaultButton>
                    </Link>
                </div>
            </div>

            {/* Presentation "Slide" Mockup Illustration */}
            <div className="hidden lg:flex w-full lg:w-[40%] aspect-[16/10] bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 flex-col gap-6 shadow-2xl transform rotate-1 group-hover/hero:rotate-0 transition-transform duration-1000">
                <div className="flex justify-between items-center">
                    <div className="w-1/4 h-2 bg-indigo-500/40 rounded-full" />
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-white/10" />
                        <div className="w-2 h-2 rounded-full bg-white/10" />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="w-full h-5 bg-white/10 rounded-xl" />
                    <div className="w-full h-5 bg-white/10 rounded-xl" />
                    <div className="w-3/4 h-5 bg-white/10 rounded-xl" />
                </div>
                <div className="mt-auto h-32 bg-[var(--color-surface-base)] rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden relative group/slide">
                    <div className="absolute inset-0 bg-indigo-600/5 group-hover/slide:bg-indigo-600/10 transition-colors" />
                    <Play size={40} className="text-white/10 group-hover/slide:text-indigo-400 group-hover/slide:scale-110 transition-all duration-500" />
                </div>
            </div>
       </div>

       {/* Decorative border accent */}
       <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent" />
       <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
    </VaultCard>
  );
}
