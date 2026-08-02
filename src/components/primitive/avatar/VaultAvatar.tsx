import React from 'react';

interface VaultAvatarProps {
  src?: string;
  initials?: string;
  label?: string;
  className?: string;
}

export const VaultAvatar: React.FC<VaultAvatarProps> = ({
  src,
  initials,
  label,
  className = '',
}) => {
  return (
    <div 
      className={`ov-avatar ${className}`}
      aria-label={label}
      role={label ? 'img' : undefined}
    >
      {src ? (
        <img src={src} alt="" className="ov-avatar__image" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};
