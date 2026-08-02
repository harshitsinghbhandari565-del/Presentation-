"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { VAULT_NAV_ITEMS } from '../constants';
import { VaultIcon } from '../../primitive/icon/VaultIcon';

export const VaultSideNav: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="ov-side-nav" aria-label="Primary navigation">
      <div className="ov-side-nav__header">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-[var(--color-accent-default)] flex items-center justify-center text-black font-bold">H</div>
            <span className="font-display font-bold text-xl tracking-tight text-[var(--color-text-primary)]">Harshit <span className="italic font-light opacity-80">Hub</span></span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {VAULT_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
            <Link 
                key={item.href} 
                href={item.href}
                className={`ov-side-nav__item ${isActive ? 'ov-side-nav__item--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
            >
                <VaultIcon 
                icon={item.icon} 
                className="ov-side-nav__icon" 
                aria-hidden="true" 
                />
                <span>{item.label}</span>
            </Link>
            );
        })}
      </div>
    </nav>
  );
};
