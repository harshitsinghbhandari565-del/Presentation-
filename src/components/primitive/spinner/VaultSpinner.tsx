import React from 'react';

interface VaultSpinnerProps {
  variant?: 'inline' | 'area';
  className?: string;
}

export const VaultSpinner: React.FC<VaultSpinnerProps> = ({
  variant = 'inline',
  className = '',
}) => {
  return (
    <div 
      className={`ov-spinner ov-spinner--${variant} ${className}`}
      role="progressbar"
      aria-label="Loading"
    />
  );
};
