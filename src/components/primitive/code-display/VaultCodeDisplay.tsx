"use client";
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { VaultIcon } from '../icon/VaultIcon';

interface VaultCodeDisplayProps {
  code: string;
  variant?: 'inline' | 'block';
  copyable?: boolean;
  className?: string;
}

export const VaultCodeDisplay: React.FC<VaultCodeDisplayProps> = ({
  code,
  variant = 'inline',
  copyable = false,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (variant === 'inline') {
    return <code className={`ov-code ov-code--inline ${className}`}>{code}</code>;
  }

  return (
    <div className={`ov-code-container ${className}`}>
      <pre className="ov-code ov-code--block">
        <code>{code}</code>
      </pre>
      {copyable && (
        <button 
          className="ov-code__copy" 
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy code"}
        >
          <VaultIcon icon={copied ? Check : Copy} className={copied ? 'ov-text-success' : ''} />
        </button>
      )}
    </div>
  );
};
