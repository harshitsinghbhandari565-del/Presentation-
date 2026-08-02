"use client";
import React, { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { VaultAppShell } from '@/components/layout/VaultAppShell';
import { VaultSettingsShell } from '@/components/layout/VaultSettingsShell';

const NO_SHELL_PAGES = ['/', '/login', '/login/verify', '/vault/opening', '/error/500'];

export const ShellSelector: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  const isNoShell = useMemo(() => {
    return NO_SHELL_PAGES.includes(pathname || '') || pathname?.startsWith('/error/');
  }, [pathname]);

  const isSettings = useMemo(() => {
    return pathname?.startsWith('/settings');
  }, [pathname]);

  if (isNoShell) {
    return <>{children}</>;
  }

  if (isSettings) {
    return (
        <VaultAppShell>
            <VaultSettingsShell>
                {children}
            </VaultSettingsShell>
        </VaultAppShell>
    );
  }

  return <VaultAppShell>{children}</VaultAppShell>;
};
