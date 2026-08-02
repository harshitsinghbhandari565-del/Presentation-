/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React from 'react';
import { Eye, ShieldCheck, Download } from 'lucide-react';
import { VaultCard } from '@/components/primitive/card/VaultCard';
import { VaultBadge } from '@/components/primitive/badge/VaultBadge';
import { VaultIcon } from '@/components/primitive/icon/VaultIcon';
import { formatRelativeTime } from '@/lib/format';

const EVENTS_MOCK = [
  { type: 'access', label: 'Record Accessed', meta: 'Modern Physics', offset: 120000, icon: Eye, color: 'text-indigo-400' },
  { type: 'security', label: 'Vault Unlocked', meta: 'HS-565-DEL', offset: 900000, icon: ShieldCheck, color: 'text-emerald-400' },
  { type: 'download', label: 'Archive Exported', meta: 'Lost Spring MCQs', offset: 7200000, icon: Download, color: 'text-orange-400' },
];

export default function ActivityPage() {
  const [events, setEvents] = React.useState<any[]>([]);

  React.useEffect(() => {
    setEvents(EVENTS_MOCK.map(e => ({
        label: e.label,
        type: e.type,
        meta: e.meta,
        icon: e.icon,
        color: e.color,
        time: new Date(Date.now() - e.offset)
    })));
  }, []);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          Activity Logs
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1 font-body">Monitor all interactions with the Obsidian Vault.</p>
      </div>

      <div className="space-y-4">
        {events.map((event, i) => (
          <VaultCard key={i} className="p-4 flex items-center justify-between group hover:bg-white/[0.01] transition-colors">
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-white/5 border border-white/5 ${event.color}`}>
                    <VaultIcon icon={event.icon} />
                </div>
                <div>
                    <div className="font-bold text-[var(--color-text-primary)]">{event.label}</div>
                    <div className="text-xs text-[var(--color-text-secondary)] uppercase tracking-widest font-black opacity-60">{event.meta}</div>
                </div>
            </div>
            <div className="text-right">
                <div className="text-sm font-mono text-[var(--color-text-secondary)]">{formatRelativeTime(event.time)}</div>
                <VaultBadge variant="info" label="VERIFIED" className="mt-1" />
            </div>
          </VaultCard>
        ))}
      </div>

      <div className="pt-8 flex justify-center">
          <button className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-secondary)] hover:text-indigo-400 transition-colors">
            Load Historical Records
          </button>
      </div>
    </div>
  );
}
