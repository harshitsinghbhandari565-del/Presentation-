"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { VaultButton } from '@/components/primitive/button/VaultButton';
import { VaultInput } from '@/components/primitive/input/VaultInput';
import { VaultFormField } from '@/components/primitive/input/VaultFormField';
import { VaultCard } from '@/components/primitive/card/VaultCard';
import { useVaultToast } from '@/components/primitive/toast/VaultToast';

export default function CreateVaultItemPage() {
  const router = useRouter();
  const { addToast } = useVaultToast();
  const [loading, setLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      addToast('success', 'Presentation record has been encrypted and stored.', 'RECORD CREATED');
      router.push('/vault');
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-widest">Back</span>
      </button>

      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          New Record
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1 font-body">Define and store a new presentation key.</p>
      </div>

      <VaultCard className="p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <VaultFormField label="Presentation Title" id="title" required>
            <VaultInput type="text" placeholder="e.g. Modern Physics: Quantum Mechanics" />
          </VaultFormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VaultFormField label="Subject" id="subject" required>
              <VaultInput type="text" placeholder="e.g. Physics" />
            </VaultFormField>
            <VaultFormField label="Topic" id="topic" required>
              <VaultInput type="text" placeholder="e.g. Chapter 4" />
            </VaultFormField>
          </div>

          <VaultFormField label="Resource URL" id="url" required helperText="Google Slides or Dropbox link">
            <VaultInput type="text" placeholder="https://..." />
          </VaultFormField>

          <VaultFormField label="Internal Description" id="description">
            <VaultInput type="textarea" placeholder="Brief summary of the content..." />
          </VaultFormField>

          <div className="pt-4 flex justify-end gap-3">
             <VaultButton variant="ghost" type="button" onClick={() => router.back()}>Cancel</VaultButton>
             <VaultButton variant="primary" loading={loading} type="submit">
                <Save size={18} className="mr-2" />
                Encrypt & Save
             </VaultButton>
          </div>
        </form>
      </VaultCard>
    </div>
  );
}
