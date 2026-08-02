"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HUB_NAV_ITEMS } from '../constants';
import { VaultIcon } from '../../primitive/icon/VaultIcon';

export const VaultBottomTabBar: React.FC = () => {
  const pathname = usePathname();

  return (
    <nav className="ov-bottom-tab-bar" aria-label="Mobile navigation">
      {HUB_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={`ov-bottom-tab-bar__item ${isActive ? 'ov-bottom-tab-bar__item--active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <VaultIcon 
              icon={item.icon} 
              className="ov-bottom-tab-bar__icon" 
              aria-hidden="true" 
            />
            <span className="ov-bottom-tab-bar__label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
