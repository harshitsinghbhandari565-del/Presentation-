import React from 'react';

interface VaultSkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  circle?: boolean;
}

export const VaultSkeleton: React.FC<VaultSkeletonProps> = ({
  width,
  height,
  className = '',
  circle = false,
}) => {
  const style: React.CSSProperties = {
    width,
    height,
    borderRadius: circle ? 'var(--radius-circular)' : undefined,
  };

  return (
    <div 
      className={`ov-skeleton ${className}`} 
      style={style}
      aria-label="Loading..."
      aria-busy="true"
    />
  );
};
