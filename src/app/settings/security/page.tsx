"use client";
import React from 'react';
import { Lock, ShieldCheck, Smartphone } from 'lucide-react';
import { VaultCard } from '@/components/primitive/card/VaultCard';
import { VaultButton } from '@/components/primitive/button/VaultButton';
import { VaultBadge } from '@/components/primitive/badge/VaultBadge';

export default function SecuritySettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          Defense Protocols
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1 font-body">Manage encryption and access levels.</p>
      </div>

      <div className="space-y-6">
        <VaultCard title="Two-Factor Authentication" className="p-6">
             <div className="flex items-center justify-between">
                <div className="flex gap-4">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 h-fit">
                        <Smartphone size={20} />
                    </div>
                    <div>
                        <div className="font-bold text-[var(--color-text-primary)]">SMS Verification</div>
                        <p className="text-xs text-[var(--color-text-secondary)]">Mandatory for all vault access</p>
                    </div>
                </div>
                <VaultBadge variant="success" label="ACTIVE" />
             </div>
        </VaultCard>

        <VaultCard title="Passkey Management" className="p-6">
             <div className="space-y-4">
                <p className="text-sm text-[var(--color-text-secondary)]">Your passkey was last updated 14 days ago.</p>
                <VaultButton variant="secondary">Change Master Key</VaultButton>
             </div>
        </VaultCard>

        <VaultCard title="Active Sessions" className="p-6">
             <div className="flex items-center justify-between py-2">
                <div className="text-sm">
                    <div className="font-bold text-[var(--color-text-primary)]">Chrome on Windows</div>
                    <div className="text-xs text-[var(--color-text-secondary)]">Last active: Just now</div>
                </div>
                <VaultBadge variant="info" label="CURRENT" />
             </div>
        </VaultCard>
      </div>
    </div>
  );
}
