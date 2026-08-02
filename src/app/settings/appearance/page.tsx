/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useState, useEffect } from 'react';
import { Palette, Monitor, Sun, Moon } from 'lucide-react';
import { VaultCard } from '@/components/primitive/card/VaultCard';
import { VaultToggle } from '@/components/primitive/toggle/VaultToggle';
import { VaultIcon } from '@/components/primitive/icon/VaultIcon';

export default function AppearanceSettingsPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('ov-theme-preference') as 'dark' | 'light' : null;
    if (saved) setTheme(saved);
    
    const timeout = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  const toggleTheme = (isLight: boolean) => {
    const newTheme = isLight ? 'light' : 'dark';
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
        localStorage.setItem('ov-theme-preference', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          Appearance
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1 font-body">Customize your Hub experience.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <VaultCard title="Theme Engine" className="p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                        {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                    </div>
                    <div>
                        <div className="font-bold text-[var(--color-text-primary)] capitalize">{theme} Mode</div>
                        <div className="text-xs text-[var(--color-text-secondary)]">Optimized for high focus</div>
                    </div>
                </div>
                <VaultToggle on={theme === 'light'} onChange={toggleTheme} label="Toggle Light Mode" />
            </div>
        </VaultCard>

        <VaultCard title="Projector Mode" className="p-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                        <Monitor size={20} />
                    </div>
                    <div>
                        <div className="font-bold text-[var(--color-text-primary)]">Classroom View</div>
                        <div className="text-xs text-[var(--color-text-secondary)]">High-contrast readability</div>
                    </div>
                </div>
                <VaultToggle on={false} onChange={() => {}} label="Toggle Projector Mode" />
            </div>
        </VaultCard>
      </div>

      <VaultCard title="Visual Identity" className="p-12 border-dashed flex flex-col items-center gap-6">
           <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primitive-black)] border border-white/10" />
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primitive-orange-600)]" />
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primitive-gray-900)] border border-white/10" />
                <div className="w-12 h-12 rounded-xl bg-[var(--color-primitive-warm-white)]" />
           </div>
           <p className="text-xs text-[var(--color-text-secondary)] font-mono uppercase tracking-[0.2em]">Presentation Hub Design Language v1.0</p>
      </VaultCard>
    </div>
  );
}
