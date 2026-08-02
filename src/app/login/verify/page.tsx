"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { VaultButton } from '@/components/primitive/button/VaultButton';
import { VaultInput } from '@/components/primitive/input/VaultInput';
import { VaultFormField } from '@/components/primitive/input/VaultFormField';
import { VaultCard } from '@/components/primitive/card/VaultCard';
import { useVaultToast } from '@/components/primitive/toast/VaultToast';

export default function VerifyPage() {
  const router = useRouter();
  const { addToast } = useVaultToast();
  const [loading, setLoading] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      addToast('success', 'Identity verified. Opening vault door...', 'ACCESS GRANTED');
      router.push('/vault/opening');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[var(--color-surface-base)] flex items-center justify-center p-6">
      <VaultCard className="w-full max-w-[400px] shadow-2xl p-8">
        <div className="flex flex-col items-center text-center gap-4 mb-8">
           <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-600/20">
              <ShieldCheck size={32} className="text-white" />
           </div>
           <div>
              <h1 className="font-display text-2xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
                Second Factor
              </h1>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                A verification code has been sent to your device.
              </p>
           </div>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <VaultFormField label="Security Code" id="code" required helperText="Enter the 6-digit code">
            <VaultInput type="text" placeholder="000 000" className="text-center text-2xl tracking-[0.5em] font-mono" />
          </VaultFormField>

          <VaultButton variant="primary" className="w-full" loading={loading} type="submit">
            Finalize Authentication
          </VaultButton>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <button className="text-[10px] text-indigo-400 uppercase tracking-widest font-black hover:text-indigo-300 transition-colors">
                Resend Code
            </button>
        </div>
      </VaultCard>
    </div>
  );
}
