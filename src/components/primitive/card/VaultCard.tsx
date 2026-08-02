import React from 'react';

interface VaultCardProps {
  children: React.ReactNode;
  title?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

export const VaultCard: React.FC<VaultCardProps> = ({
  children,
  title,
  headerAction,
  footer,
  interactive = false,
  className = '',
  onClick,
}) => {
  const Component = interactive && onClick ? 'button' : 'article';
  
  return (
    <Component 
      className={`ov-card ${interactive ? 'ov-card--interactive' : ''} ${className}`}
      onClick={onClick}
    >
      {(title || headerAction) && (
        <div className="ov-card__header">
          {title && <h3 className="ov-card__title">{title}</h3>}
          {headerAction && <div className="ov-card__header-action">{headerAction}</div>}
        </div>
      )}
      <div className="ov-card__body">{children}</div>
      {footer && <div className="ov-card__footer">{footer}</div>}
    </Component>
  );
};
