"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Zap, Lock, ArrowRight } from 'lucide-react';
import { VaultButton } from '@/components/primitive/button/VaultButton';
import { VaultIcon } from '@/components/primitive/icon/VaultIcon';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="min-h-screen bg-[var(--color-surface-base)]" />
  );

  return (
    <div className="min-h-screen bg-[var(--color-surface-base)] flex flex-col items-center justify-center p-6 text-center relative z-10">
      <div className="max-w-3xl space-y-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-widest animate-fade-in">
            <Shield size={14} />
            <span>Secure. Minimal. Obsidian.</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tighter text-[var(--color-text-primary)] leading-tight">
            Protect your <span className="text-[var(--color-accent-default)] italic">Ideas</span> inside the Obsidian Vault.
          </h1>
          
          <p className="font-body text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed">
            The next generation presentation hub designed for creators who value privacy, precision, and the dark aesthetic.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login">
            <VaultButton variant="primary" size="default" className="w-full sm:w-auto px-8 font-bold">
              Unlock Vault
              <ArrowRight size={18} className="ml-2" />
            </VaultButton>
          </Link>
          <Link href="/dashboard">
            <VaultButton variant="ghost" size="default" className="w-full sm:w-auto font-bold">
              Preview Features
            </VaultButton>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-white/5">
          <div className="flex flex-col items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <VaultIcon icon={Lock} className="text-indigo-400" />
             </div>
             <h3 className="font-bold text-[var(--color-text-primary)]">End-to-End</h3>
             <p className="text-xs text-[var(--color-text-secondary)]">Your data never leaves the local environment.</p>
          </div>
          <div className="flex flex-col items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <VaultIcon icon={Zap} className="text-indigo-400" />
             </div>
             <h3 className="font-bold text-[var(--color-text-primary)]">Blazing Fast</h3>
             <p className="text-xs text-[var(--color-text-secondary)]">Optimized for speed and minimal latency.</p>
          </div>
          <div className="flex flex-col items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <VaultIcon icon={Shield} className="text-indigo-400" />
             </div>
             <h3 className="font-bold text-[var(--color-text-primary)]">Pure Obsidian</h3>
             <p className="text-xs text-[var(--color-text-secondary)]">A design language built for deep focus.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
