import React from 'react';
import { AlertCircle } from 'lucide-react';
import { VaultIcon } from '../icon/VaultIcon';

interface VaultFormFieldProps {
  children: React.ReactNode;
  label: string;
  id: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
}

export const VaultFormField: React.FC<VaultFormFieldProps> = ({
  children,
  label,
  id,
  required = false,
  error,
  helperText,
  className = '',
}) => {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label 
        htmlFor={id} 
        className="font-body font-semibold text-[var(--type-body-strong-size)] text-[var(--color-text-primary)]"
      >
        {label}
        {required && <span className="text-[var(--color-semantic-error)] ml-1" aria-hidden="true">*</span>}
        {required && <span className="ov-sr-only">(required)</span>}
      </label>
      
      {React.cloneElement(children as React.ReactElement<any>, {
        id,
        error: !!error,
        'aria-describedby': [error ? errorId : null, helperText ? helperId : null].filter(Boolean).join(' ') || undefined,
        'aria-required': required ? 'true' : undefined,
      })}

      {error && (
        <div id={errorId} className="flex items-center gap-1.5 text-[var(--type-caption-size)] text-[var(--color-semantic-error)]">
          <VaultIcon icon={AlertCircle} className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {helperText && !error && (
        <div id={helperId} className="text-[var(--type-caption-size)] text-[var(--color-text-secondary)]">
          {helperText}
        </div>
      )}
    </div>
  );
};
