"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { VaultDoor } from '@/components/primitive/vault-door/VaultDoor';

export default function VaultOpeningPage() {
  const router = useRouter();

  const handleComplete = () => {
    // Redirect to dashboard after animation
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[var(--color-primitive-black)]">
        <VaultDoor onComplete={handleComplete} />
    </div>
  );
}
