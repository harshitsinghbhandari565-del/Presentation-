"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Shield, Palette, Bell } from 'lucide-react';
import { VaultIcon } from '../primitive/icon/VaultIcon';

const SETTINGS_NAV = [
    { label: 'Profile', href: '/settings/profile', icon: User },
    { label: 'Security', href: '/settings/security', icon: Shield },
    { label: 'Appearance', href: '/settings/appearance', icon: Palette },
    { label: 'Notifications', href: '/settings/notifications', icon: Bell },
];

export const VaultSettingsShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const pathname = usePathname();

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            <aside className="md:col-span-3 lg:col-span-2 space-y-2">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-secondary)] px-4 mb-4">Configuration</h2>
                {SETTINGS_NAV.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link 
                            key={item.href} 
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                                isActive 
                                ? 'bg-white/5 text-[var(--color-text-primary)] border border-white/5' 
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/[0.02]'
                            }`}
                        >
                            <VaultIcon icon={item.icon} className={isActive ? 'text-indigo-400' : ''} />
                            <span className="text-sm font-bold">{item.label}</span>
                        </Link>
                    );
                })}
            </aside>
            <div className="md:col-span-9 lg:col-span-10">
                {children}
            </div>
        </div>
    );
};
