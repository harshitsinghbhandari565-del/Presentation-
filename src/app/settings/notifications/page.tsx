"use client";
import React from 'react';
import { Bell, Shield, Radio } from 'lucide-react';
import { VaultCard } from '@/components/primitive/card/VaultCard';
import { VaultToggle } from '@/components/primitive/toggle/VaultToggle';

export default function NotificationsSettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          Signal Intelligence
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1 font-body">Configure alert priorities and communication.</p>
      </div>

      <VaultCard title="Channel Configuration" className="p-6 divide-y divide-white/5">
            <div className="flex items-center justify-between py-4">
                <div>
                    <div className="font-bold text-[var(--color-text-primary)]">Critical Alerts</div>
                    <p className="text-xs text-[var(--color-text-secondary)]">Security breaches and vault locks</p>
                </div>
                <VaultToggle on={true} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between py-4">
                <div>
                    <div className="font-bold text-[var(--color-text-primary)]">Record Updates</div>
                    <p className="text-xs text-[var(--color-text-secondary)]">Notifications when shared records change</p>
                </div>
                <VaultToggle on={false} onChange={() => {}} />
            </div>
            <div className="flex items-center justify-between py-4">
                <div>
                    <div className="font-bold text-[var(--color-text-primary)]">Marketing Signals</div>
                    <p className="text-xs text-[var(--color-text-secondary)]">New feature announcements</p>
                </div>
                <VaultToggle on={false} onChange={() => {}} />
            </div>
      </VaultCard>
    </div>
  );
}
