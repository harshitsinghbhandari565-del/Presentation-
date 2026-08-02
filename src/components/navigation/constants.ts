import { LayoutDashboard, Lock, Clock, Settings } from 'lucide-react';

export const VAULT_NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Vault', icon: Lock, href: '/vault' },
  { label: 'Activity', icon: Clock, href: '/activity' },
  { label: 'Settings', icon: Settings, href: '/settings' },
];
