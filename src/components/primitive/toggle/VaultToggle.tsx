import React from 'react';

interface VaultToggleProps {
  on: boolean;
  onChange: (on: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export const VaultToggle: React.FC<VaultToggleProps> = ({
  on,
  onChange,
  disabled = false,
  label,
  className = '',
}) => {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      className={`ov-toggle ${on ? 'ov-toggle--on' : ''} ${className}`}
      onClick={() => onChange(!on)}
    >
      <span className="ov-toggle__knob" />
    </button>
  );
};
