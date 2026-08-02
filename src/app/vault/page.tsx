"use client";
import React from 'react';
import Link from 'next/link';
import { LayoutGrid, Plus, MoreHorizontal } from 'lucide-react';
import data from "@/data/presentations.json";
import { VaultTable, VaultTableRow, VaultTableCell } from "@/components/primitive/table/VaultTable";
import { VaultBadge } from "@/components/primitive/badge/VaultBadge";
import { VaultButton } from "@/components/primitive/button/VaultButton";
import { VaultIcon } from "@/components/primitive/icon/VaultIcon";

export default function VaultPage() {
  const presentations = data.presentations;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
            Vault Records
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1 font-body">Manage and access all stored presentations.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
            <Link href="/dashboard" className="flex-1 md:flex-none">
                <VaultButton variant="ghost" className="w-full">
                    <LayoutGrid size={18} className="mr-2" />
                    Grid View
                </VaultButton>
            </Link>
            <Link href="/vault/new" className="flex-1 md:flex-none">
                <VaultButton variant="primary" className="w-full">
                    <Plus size={18} className="mr-2" />
                    New Record
                </VaultButton>
            </Link>
        </div>
      </div>

      <VaultTable headers={['Record Name', 'Subject', 'Topic', 'Platform', 'Status', '']}>
        {presentations.map((p) => (
          <VaultTableRow key={p.id}>
            <VaultTableCell>
                <Link href={`/presentation/${p.id}`} className="font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                    {p.title}
                </Link>
            </VaultTableCell>
            <VaultTableCell>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--color-text-secondary)]">{p.subject}</span>
            </VaultTableCell>
            <VaultTableCell>
                <span className="text-sm italic font-display">{p.topic}</span>
            </VaultTableCell>
            <VaultTableCell>
                <VaultBadge variant="info" label={p.platform} />
            </VaultTableCell>
            <VaultTableCell>
                <VaultBadge variant={p.pinned ? 'warning' : 'success'} label={p.pinned ? 'PINNED' : 'READY'} />
            </VaultTableCell>
            <VaultTableCell>
                <button className="p-1 hover:bg-white/5 rounded transition-colors text-[var(--color-text-secondary)]">
                    <MoreHorizontal size={16} />
                </button>
            </VaultTableCell>
          </VaultTableRow>
        ))}
      </VaultTable>
    </div>
  );
}
