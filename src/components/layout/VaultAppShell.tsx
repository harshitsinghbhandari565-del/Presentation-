"use client";
import React, { useEffect, useState } from 'react';
import { VaultBottomTabBar } from '../navigation/bottom-tab-bar/VaultBottomTabBar';
import { VaultSideRail } from '../navigation/side-rail/VaultSideRail';
import { VaultSideNav } from '../navigation/side-nav/VaultSideNav';
import { VaultSkipLink } from './VaultSkipLink';

interface VaultAppShellProps {
  children: React.ReactNode;
}

export const VaultAppShell: React.FC<VaultAppShellProps> = ({ children }) => {
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setViewport('desktop');
      else if (window.innerWidth >= 768) setViewport('tablet');
      else setViewport('mobile');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="ov-app-shell">
      <VaultSkipLink />

      {viewport === 'mobile' && <VaultBottomTabBar />}
      {viewport === 'tablet' && <VaultSideRail />}
      {viewport === 'desktop' && <VaultSideNav />}

      <div className="ov-app-shell__main">
        <main id="main-content" className="ov-app-shell__content">
          <div className="ov-container py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
