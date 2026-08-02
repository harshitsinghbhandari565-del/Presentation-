"use client";
import React from 'react';
import { User, Mail, Shield } from 'lucide-react';
import { VaultCard } from '@/components/primitive/card/VaultCard';
import { VaultInput } from '@/components/primitive/input/VaultInput';
import { VaultFormField } from '@/components/primitive/input/VaultFormField';
import { VaultButton } from '@/components/primitive/button/VaultButton';
import { VaultAvatar } from '@/components/primitive/avatar/VaultAvatar';

export default function ProfileSettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)]">
          Profile Identity
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1 font-body">Manage your vault access persona.</p>
      </div>

      <VaultCard className="p-8">
        <div className="flex items-center gap-6 mb-10">
            <VaultAvatar initials="HS" className="w-20 h-20 text-xl" />
            <div className="space-y-2">
                <VaultButton variant="secondary" size="small">Change Avatar</VaultButton>
                <p className="text-[10px] text-[var(--color-text-secondary)] uppercase font-bold tracking-widest">JPG, PNG or WebP. Max 2MB.</p>
            </div>
        </div>

        <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <VaultFormField label="Full Name" id="name">
                    <VaultInput type="text" defaultValue="Harshit Singh" />
                </VaultFormField>
                <VaultFormField label="Identity Code" id="identity">
                    <VaultInput type="text" defaultValue="HS-565-DEL" disabled />
                </VaultFormField>
            </div>
            <VaultFormField label="Emergency Contact" id="email">
                <VaultInput type="text" defaultValue="harshit@obsidian-vault.com" leadingIcon={<Mail size={16} />} />
            </VaultFormField>
            
            <div className="pt-4">
                <VaultButton variant="primary">Update Protocol</VaultButton>
            </div>
        </form>
      </VaultCard>
    </div>
  );
}
