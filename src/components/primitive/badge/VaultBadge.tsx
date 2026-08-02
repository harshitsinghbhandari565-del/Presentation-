import React from 'react';

type BadgeVariant = 'success' | 'error' | 'info' | 'warning';

interface VaultBadgeProps {
  label: string;
  variant: BadgeVariant;
  className?: string;
}

export const VaultBadge: React.FC<VaultBadgeProps> = ({
  label,
  variant,
  className = '',
}) => {
  return (
    <span className={`ov-badge ov-badge--${variant} ${className}`}>
      <span className="ov-badge__dot" aria-hidden="true" />
      {label}
    </span>
  );
};
