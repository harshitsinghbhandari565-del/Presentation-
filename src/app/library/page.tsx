"use client";
import React, { useMemo } from 'react';
import { Presentation as PresentationIcon, Search } from 'lucide-react';
import data from "@/data/presentations.json";
import { VaultCard } from "@/components/primitive/card/VaultCard";
import { VaultBadge } from "@/components/primitive/badge/VaultBadge";
import type { Presentation } from "@/types/presentation";

export default function LibraryPage() {
  const presentations = (data.presentations || []) as Presentation[];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-4xl font-black tracking-tighter text-[var(--color-text-primary)]">
          Presentation <span className="text-[var(--color-accent-default)] italic">Library</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-2 font-body text-lg">
          Browse all curated educational materials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {presentations.map((p) => (
          <VaultCard key={p.id} interactive onClick={() => window.location.href=`/presentation/${p.id}`} className="h-full p-6">
            <div className="space-y-5">
              <div className="flex justify-between items-start">
                <VaultBadge variant="info" label={p.subject} />
              </div>
              <h3 className="font-bold text-xl text-[var(--color-text-primary)] line-clamp-2 leading-tight">
                {p.title}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3 leading-relaxed font-light">
                {p.description}
              </p>
              <div className="pt-5 border-t border-white/5 flex items-center justify-between text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                <span>{p.topic}</span>
                <span>OPEN HUB →</span>
              </div>
            </div>
          </VaultCard>
        ))}
      </div>
    </div>
  );
}
