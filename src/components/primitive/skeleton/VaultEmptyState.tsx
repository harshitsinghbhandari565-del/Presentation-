import React from 'react';
import { LucideIcon } from 'lucide-react';
import { VaultIcon } from '../icon/VaultIcon';
import { VaultButton } from '../button/VaultButton';

interface VaultEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const VaultEmptyState: React.FC<VaultEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-12 gap-4 ${className}`}>
      <VaultIcon icon={icon} className="text-[var(--color-text-secondary)] w-16 h-16" />
      <h3 className="font-body font-semibold text-[var(--type-h3-size)] text-[var(--color-text-primary)]">
        {title}
      </h3>
      <p className="font-body text-[var(--type-body-size)] text-[var(--color-text-secondary)] max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <VaultButton variant="primary" onClick={onAction} className="mt-2">
          {actionLabel}
        </VaultButton>
      )}
    </div>
  );
};
