"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Key } from 'lucide-react';
import { VaultButton } from '@/components/primitive/button/VaultButton';
import { VaultInput } from '@/components/primitive/input/VaultInput';
import { VaultFormField } from '@/components/primitive/input/VaultFormField';
import { VaultCard } from '@/components/primitive/card/VaultCard';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock authentication
    setTimeout(() => {
      localStorage.setItem('ov-authenticated', 'true');
      router.push('/login/verify');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-base)] flex items-center justify-center p-6">
      <VaultCard className="w-full max-w-[400px] shadow-2xl p-8">
        <div className="flex flex-col items-center text-center gap-4 mb-8">
           <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/20">
              <Shield size={32} className="text-white" />
           </div>
           <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
                Identify Yourself
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                Enter your credentials to unlock the vault.
              </p>
           </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <VaultFormField label="Identity / Email" id="email" required>
            <VaultInput type="text" placeholder="name@domain.com" />
          </VaultFormField>

          <VaultFormField label="Passkey" id="password" required>
            <VaultInput type="password" placeholder="••••••••" />
          </VaultFormField>

          <VaultButton variant="primary" className="w-full" loading={loading} type="submit">
            Establish Session
          </VaultButton>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-4 text-center">
            <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-[0.2em] font-bold">
                Unauthorized access is strictly monitored
            </p>
            <VaultButton variant="ghost" size="small" onClick={() => router.push('/')}>
                Return to Surface
            </VaultButton>
        </div>
      </VaultCard>
    </div>
  );
}
