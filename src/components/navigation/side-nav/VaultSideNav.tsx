"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HUB_NAV_ITEMS } from '../constants';
import { VaultIcon } from '../../primitive/icon/VaultIcon';

export const VaultSideNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="ov-side-nav" aria-label="Primary navigation">
      <div className="ov-side-nav__header mb-10 px-6">
        <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-accent-default)] flex items-center justify-center text-black font-black shadow-lg shadow-orange-600/20 group-hover:scale-105 transition-transform duration-300">
                <span className="text-xl tracking-tighter">P</span>
            </div>
            <div className="flex flex-col">
                <span className="font-display font-extrabold text-2xl tracking-tighter text-[var(--color-text-primary)] leading-none">
                    Harshit
                </span>
                <span className="font-display font-light italic text-sm tracking-widest text-[var(--color-accent-default)] uppercase">
                    Hub
                </span>
            </div>
        </Link>
      </div>
      <div className="flex flex-col gap-1 px-2">
        {HUB_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
            <Link 
                key={item.href} 
                href={item.href}
                className={`ov-side-nav__item rounded-xl px-4 py-3 \${isActive ? 'ov-side-nav__item--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
            >
                <VaultIcon 
                icon={item.icon} 
                className={`ov-side-nav__icon \${isActive ? 'text-orange-500' : ''}`} 
                aria-hidden="true" 
                />
                <span className="font-semibold tracking-tight">{item.label}</span>
            </Link>
            );
        })}
      </div>
      
      <div className="mt-auto px-6 py-8 border-t border-white/5">
         <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] opacity-50">Version</span>
            <span className="text-xs font-mono text-[var(--color-text-secondary)]">v1.1.0-stable</span>
         </div>
      </div>
    </nav>
  );
};
