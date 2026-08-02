import React from 'react';
import { VaultSpinner } from '../spinner/VaultSpinner';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'default' | 'small';

interface VaultButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const VaultButton: React.FC<VaultButtonProps> = ({
  children,
  variant = 'primary',
  size = 'default',
  loading = false,
  disabled = false,
  className = '',
  leftIcon,
  rightIcon,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      className={`ov-button ov-button--${variant} ov-button--${size} ${loading ? 'ov-button--loading' : ''} ${className}`}
      disabled={isDisabled}
      aria-busy={loading}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading && <VaultSpinner variant="inline" />}
      {!loading && leftIcon && <span className="flex items-center">{leftIcon}</span>}
      <span className={loading ? 'opacity-0' : ''}>{children}</span>
      {!loading && rightIcon && <span className="flex items-center">{rightIcon}</span>}
    </button>
  );
};
