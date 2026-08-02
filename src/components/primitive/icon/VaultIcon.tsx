import React from 'react';
import { LucideIcon } from 'lucide-react';

interface VaultIconProps {
  icon: LucideIcon;
  label?: string;
  className?: string;
  functional?: boolean;
}

export const VaultIcon: React.FC<VaultIconProps> = ({
  icon: Icon,
  label,
  className = '',
  functional = false,
}) => {
  const isDecorative = !label;

  return (
    <span 
      className={`ov-icon ${functional ? 'ov-icon--functional' : ''} ${className}`}
      aria-hidden={isDecorative ? 'true' : undefined}
      aria-label={label}
      role={functional ? 'button' : undefined}
      tabIndex={functional ? 0 : undefined}
    >
      <Icon size={20} strokeWidth={2} />
    </span>
  );
};
