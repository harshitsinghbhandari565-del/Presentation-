import React, { useState } from 'react';
import { Eye, EyeOff, Search, X } from 'lucide-react';
import { VaultIcon } from '../icon/VaultIcon';

interface VaultInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  error?: boolean;
  type?: 'text' | 'password' | 'search' | 'textarea';
  leadingIcon?: React.ReactNode;
}

export const VaultInput: React.FC<VaultInputProps> = ({
  type = 'text',
  error = false,
  className = '',
  leadingIcon,
  value,
  onChange,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isTextArea = type === 'textarea';
  
  const inputType = type === 'password' && showPassword ? 'text' : type;

  const baseClass = isTextArea ? 'ov-textarea' : 'ov-input';
  const classes = `${baseClass} ${error ? 'ov-input--error' : ''} ${leadingIcon ? 'ov-input--has-leading' : ''} ${className}`;

  return (
    <div className="ov-input-container">
      {leadingIcon && (
        <span className="ov-input-icon ov-input-icon--leading">{leadingIcon}</span>
      )}
      
      {isTextArea ? (
        <textarea 
          className={classes} 
          value={value} 
          onChange={onChange as any} 
          {...props as any} 
        />
      ) : (
        <input 
          type={inputType} 
          className={classes} 
          value={value} 
          onChange={onChange} 
          {...props} 
        />
      )}

      {type === 'password' && (
        <button
          type="button"
          className="ov-input-icon ov-input-icon--trailing"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          <VaultIcon icon={showPassword ? EyeOff : Eye} />
        </button>
      )}

      {type === 'search' && value && (
        <button
          type="button"
          className="ov-input-icon ov-input-icon--trailing"
          onClick={() => onChange?.({ target: { value: '' } } as any)}
          aria-label="Clear search"
        >
          <VaultIcon icon={X} />
        </button>
      )}
    </div>
  );
};
