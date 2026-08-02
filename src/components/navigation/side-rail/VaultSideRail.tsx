"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HUB_NAV_ITEMS } from '../constants';
import { VaultIcon } from '../../primitive/icon/VaultIcon';

export const VaultSideRail: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="ov-side-rail" aria-label="Tablet navigation">
      {HUB_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={`ov-side-rail__item ${isActive ? 'ov-side-rail__item--active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <VaultIcon 
              icon={item.icon} 
              className="ov-side-rail__icon" 
              aria-hidden="true" 
            />
            <span className="ov-side-rail__label font-body text-sm">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
