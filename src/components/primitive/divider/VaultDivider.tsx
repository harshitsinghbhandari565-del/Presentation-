import React from 'react';

export const VaultDivider: React.FC<{ className?: string }> = ({ className = '' }) => (
  <hr className={`ov-divider ${className}`} />
);
