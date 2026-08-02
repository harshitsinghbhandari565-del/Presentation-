"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { VaultBottomTabBar } from '../navigation/bottom-tab-bar/VaultBottomTabBar';
import { VaultSideRail } from '../navigation/side-rail/VaultSideRail';
import { VaultSideNav } from '../navigation/side-nav/VaultSideNav';
import { VaultSkipLink } from './VaultSkipLink';
import ThemeToggle from '../theme/ThemeToggle';
import ProjectorModeToggle from '../projector/ProjectorModeToggle';
import CommandTrigger from '../command/CommandTrigger';
import { Bell, Search, Layers, User } from 'lucide-react';
import { VaultAvatar } from '../primitive/avatar/VaultAvatar';

interface VaultAppShellProps {
  children: React.ReactNode;
}

export const VaultAppShell: React.FC<VaultAppShellProps> = ({ children }) => {
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth >= 1024) setViewport('desktop');
      else if (window.innerWidth >= 768) setViewport('tablet');
      else setViewport('mobile');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted) return null;

  return (
    <div className="ov-app-shell">
      <VaultSkipLink />

      {viewport === 'mobile' && <VaultBottomTabBar />}
      {viewport === 'tablet' && <VaultSideRail />}
      {viewport === 'desktop' && <VaultSideNav />}

      <div className="ov-app-shell__main">
        {/* Global Premium Header */}
        <header className={`h-20 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[var(--color-surface-base)]/70 backdrop-blur-2xl z-40 transition-all duration-500 px-6 md:px-12 ${viewport === 'desktop' ? 'ml-[260px]' : (viewport === 'tablet' ? 'ml-[64px]' : '')}`}>
            <div className="flex items-center gap-6 flex-1">
                {viewport !== 'desktop' && (
                    <Link href="/" className="font-display font-black text-xl tracking-tighter text-[var(--color-text-primary)] shrink-0">
                        P<span className="italic font-light text-orange-500">H</span>
                    </Link>
                )}
                
                {/* Search / Breadcrumb Context */}
                <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-white/40 max-w-md w-full group hover:bg-white/[0.05] transition-all cursor-text">
                    <Search size={16} />
                    <span className="text-sm font-medium">Quick search library...</span>
                    <div className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono">
                        <span>⌘</span><span>K</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full bg-white/[0.03] border border-white/5 shadow-sm">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-white/60 hover:text-white transition-colors cursor-pointer">
                        <Layers size={14} className="text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Main Room</span>
                    </div>
                    <div className="w-px h-4 bg-white/10 mx-1 hidden sm:block" />
                    <CommandTrigger />
                    <ProjectorModeToggle />
                    <ThemeToggle />
                </div>
                
                <div className="w-px h-6 bg-white/10 mx-1" />
                
                <div className="flex items-center gap-3">
                    <button className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-all relative">
                        <Bell size={20} />
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 border-2 border-black" />
                    </button>
                    <VaultAvatar initials="HS" className="w-10 h-10 border-white/10 shadow-lg cursor-pointer hover:scale-105 transition-transform" />
                </div>
            </div>
        </header>

        <main id="main-content" className={`ov-app-shell__content transition-all ${viewport === 'desktop' ? 'pl-[260px]' : (viewport === 'tablet' ? 'pl-[64px]' : '')}`}>
          <div className="ov-container py-12 md:py-16">
            {children}
          </div>
          
          <footer className="ov-container py-16 border-t border-white/5 bg-white/[0.01]">
            <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex flex-col items-center md:items-start gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-orange-600 flex items-center justify-center text-black font-black text-xs">P</div>
                        <span className="text-lg font-bold tracking-tight text-white">Presentation <span className="italic font-light opacity-50">Hub</span></span>
                    </div>
                    <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">The Premium Classroom Workspace</p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-10">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-white/20 uppercase font-black tracking-widest">Platform</span>
                        <div className="flex flex-col gap-1 text-sm font-bold text-white/40">
                            <Link href="/" className="hover:text-indigo-400 transition-colors">Workspace</Link>
                            <Link href="/library" className="hover:text-indigo-400 transition-colors">Archive</Link>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] text-white/20 uppercase font-black tracking-widest">Support</span>
                        <div className="flex flex-col gap-1 text-sm font-bold text-white/40">
                            <button className="text-left hover:text-orange-400 transition-colors">Guide</button>
                            <button className="text-left hover:text-orange-400 transition-colors">Contact</button>
                        </div>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-2">
                        <span className="text-[10px] text-white/20 uppercase font-black tracking-widest">Status</span>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/5 border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">v1.1.0 Stable</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="mt-16 pt-8 border-t border-white/[0.02] flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-[10px] text-white/10 uppercase tracking-[0.2em] font-bold">
                    &copy; 2026 Harshit Presentation Hub · Reserved
                </p>
                <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest text-white/10">
                    <button className="hover:text-white/40 transition-colors">Privacy</button>
                    <button className="hover:text-white/40 transition-colors">Terms</button>
                </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
