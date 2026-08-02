"use client";
import React from 'react';
import { VaultAppShell } from '@/components/layout/VaultAppShell';

export const ShellSelector: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <VaultAppShell>{children}</VaultAppShell>;
};
