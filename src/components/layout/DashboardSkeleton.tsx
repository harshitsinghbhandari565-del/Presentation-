import React from 'react';
import { VaultSkeleton } from '../primitive/skeleton/VaultSkeleton';
import { VaultCard } from '../primitive/card/VaultCard';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-3 flex-1">
          <VaultSkeleton width="300px" height="48px" />
          <VaultSkeleton width="450px" height="24px" />
        </div>
        <div className="hidden lg:flex gap-4">
          <VaultSkeleton width="120px" height="64px" />
          <VaultSkeleton width="120px" height="64px" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Featured Hero Skeleton */}
        <div className="lg:col-span-8 xl:col-span-9 h-full">
          <VaultSkeleton height="420px" className="rounded-3xl" />
        </div>

        {/* Sidebar Skeleton */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
          <VaultCard className="h-[380px]">
            <div className="space-y-6 p-4">
              <VaultSkeleton height="48px" />
              <div className="space-y-2">
                <VaultSkeleton height="16px" width="100px" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4].map(i => <VaultSkeleton key={i} width="60px" height="32px" />)}
                </div>
              </div>
              <VaultSkeleton height="40px" />
            </div>
          </VaultCard>
          <VaultSkeleton height="100px" className="rounded-2xl" />
        </aside>
      </div>

      {/* Grid Results Skeleton */}
      <section className="space-y-8">
        <div className="flex items-center gap-6">
          <VaultSkeleton width="200px" height="32px" />
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <VaultCard key={i} className="h-[280px] p-0 overflow-hidden">
               <VaultSkeleton height="112px" className="rounded-none" />
               <div className="p-5 space-y-4">
                  <VaultSkeleton width="80px" height="20px" />
                  <VaultSkeleton height="24px" />
                  <VaultSkeleton height="40px" />
               </div>
            </VaultCard>
          ))}
        </div>
      </section>
    </div>
  );
};
