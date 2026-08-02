"use client";
import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import { VaultButton } from '@/components/primitive/button/VaultButton';

export default function Error500Page() {
  return (
    <div className="min-h-screen bg-[var(--color-surface-base)] flex flex-col items-center justify-center p-6 text-center gap-8 animate-fade-in">
       <div className="w-24 h-24 rounded-3xl bg-red-600/10 border border-red-500/20 flex items-center justify-center">
          <ShieldAlert size={48} className="text-red-400" />
       </div>
       
       <div className="space-y-4">
          <h1 className="font-display text-8xl font-black text-[var(--color-text-primary)] tracking-tighter">500</h1>
          <h2 className="text-2xl font-extrabold text-[var(--color-text-primary)]">Encryption Breach</h2>
          <p className="text-[var(--color-text-secondary)] max-w-sm mx-auto">
            The vault server encountered an unexpected failure during decryption. Our security protocols have been activated.
          </p>
       </div>

       <div className="flex gap-4">
          <VaultButton variant="primary" onClick={() => window.location.reload()}>
            <RefreshCw size={18} className="mr-2" />
            Retry Connection
          </VaultButton>
          <VaultButton variant="ghost" onClick={() => window.location.href='/'}>Return to Hub</VaultButton>
       </div>
    </div>
  );
}
