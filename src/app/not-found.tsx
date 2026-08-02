"use client";
import React from 'react';
import Link from 'next/link';
import { Compass } from 'lucide-react';
import { VaultButton } from '@/components/primitive/button/VaultButton';
import { VaultIcon } from '@/components/primitive/icon/VaultIcon';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-base)] flex flex-col items-center justify-center p-6 text-center gap-8 animate-fade-in">
       <div className="w-24 h-24 rounded-3xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
          <Compass size={48} className="text-indigo-400 animate-pulse" />
       </div>
       
       <div className="space-y-4">
          <h1 className="font-display text-8xl font-black text-[var(--color-text-primary)] tracking-tighter">404</h1>
          <h2 className="text-2xl font-extrabold text-[var(--color-text-primary)]">Record Not Located</h2>
          <p className="text-[var(--color-text-secondary)] max-w-sm mx-auto">
            The secret key or vault record you are looking for does not exist or has been relocated.
          </p>
       </div>

       <Link href="/dashboard">
          <VaultButton variant="primary">Return to Hub</VaultButton>
       </Link>
    </div>
  );
}
