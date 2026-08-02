import React from 'react';
import Link from 'next/link';
import { Sparkles, Play, ArrowRight } from 'lucide-react';
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
    <VaultCard className="p-0 border-none shadow-2xl relative group/hero overflow-hidden min-h-[400px]">
       {/* High-Impact Visual Background */}
       <div className="absolute inset-0 bg-[var(--color-surface-base)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_var(--color-accent-indigo)_0%,_transparent_60%)] opacity-20 group-hover/hero:opacity-30 transition-opacity duration-1000" />
            <div className="absolute -bottom-1/2 -left-1/4 w-full h-full bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0%,_var(--color-accent-emerald)_50%,_transparent_100%)] opacity-10 blur-3xl" />
       </div>

       <div className="relative z-20 p-8 md:p-12 flex flex-col lg:flex-row gap-12 items-center h-full">
            <div className="flex-1 space-y-8 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3">
                    <VaultBadge variant="warning" label="PRIMARY RECORD" />
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Locked Session</span>
                </div>

                <div className="space-y-4">
                    <h1 className="font-display text-4xl md:text-6xl font-black tracking-tighter text-white leading-[0.95]">
                        {presentation.title}
                    </h1>
                    <p className="text-lg md:text-xl text-[var(--color-text-secondary)] font-light italic font-display max-w-xl mx-auto lg:mx-0">
                        {presentation.topic}
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                    <Link href={`/presentation/${presentation.id}`}>
                        <VaultButton variant="primary" size="default" className="shadow-lg shadow-orange-600/20">
                            <Play size={18} fill="currentColor" className="mr-2" />
                            Launch Vault
                        </VaultButton>
                    </Link>
                    <Link href="/vault">
                        <VaultButton variant="ghost">View Archives</VaultButton>
                    </Link>
                </div>
            </div>

            {/* Presentation "Slide" Mockup Illustration */}
            <div className="hidden md:flex w-full lg:w-1/3 aspect-[4/3] bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex-col gap-4 shadow-2xl transform rotate-2 group-hover/hero:rotate-0 transition-transform duration-700">
                <div className="flex justify-between">
                    <div className="w-1/3 h-2 bg-indigo-500/50 rounded-full" />
                    <Sparkles size={16} className="text-orange-400" />
                </div>
                <div className="space-y-3">
                    <div className="w-full h-4 bg-white/10 rounded-lg" />
                    <div className="w-full h-4 bg-white/10 rounded-lg" />
                    <div className="w-2/3 h-4 bg-white/10 rounded-lg" />
                </div>
                <div className="mt-auto h-24 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center">
                    <Play size={32} className="text-white/20" />
                </div>
            </div>
       </div>

       {/* Decorative border accent */}
       <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--color-accent-default)] to-transparent opacity-50" />
    </VaultCard>
  );
}
