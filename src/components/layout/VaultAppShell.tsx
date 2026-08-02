/* eslint-disable react-hooks/set-state-in-effect */
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
        {/* Top Header for Mobile/Tablet context */}
        {(viewport === 'mobile' || viewport === 'tablet') && (
            <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between sticky top-0 bg-[var(--color-surface-base)]/80 backdrop-blur-xl z-40 transition-all duration-300">
                <Link href="/" className="font-display font-black text-xl tracking-tighter text-[var(--color-text-primary)]">
                    Harshit <span className="italic font-light text-orange-500">Hub</span>
                </Link>
                <div className="flex items-center gap-2">
                    <CommandTrigger />
                    <ProjectorModeToggle />
                    <ThemeToggle />
                </div>
            </header>
        )}

        {/* Global Controls for Desktop (since sidebar header is branding only) */}
        {viewport === 'desktop' && (
            <div className="fixed top-8 right-8 z-50 pointer-events-none">
                <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl pointer-events-auto">
                    <CommandTrigger />
                    <div className="w-px h-4 bg-white/10" />
                    <ProjectorModeToggle />
                    <div className="w-px h-4 bg-white/10" />
                    <ThemeToggle />
                </div>
            </div>
        )}

        <main id="main-content" className="ov-app-shell__content">
          <div className="ov-container py-12 md:py-20">
            {children}
          </div>
          
          <footer className="ov-container py-12 border-t border-white/5 opacity-40 hover:opacity-100 transition-opacity">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--color-text-secondary)]">Harshit Presentation Hub</span>
                <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
                    <span>Built for classroom</span>
                    <span className="font-mono opacity-50">v1.1.0-STABLE</span>
                </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
