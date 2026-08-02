"use client";
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { VaultIcon } from '../icon/VaultIcon';
import { VaultButton } from '../button/VaultButton';

interface VaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const VaultModal: React.FC<VaultModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="ov-modal-overlay" onClick={onClose} role="presentation">
      <div 
        className="ov-modal" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className="ov-modal__header">
          <h2 id="modal-title" className="ov-modal__title">{title}</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/5 rounded-md transition-colors"
            aria-label="Close"
          >
            <VaultIcon icon={X} />
          </button>
        </header>
        <div className="ov-modal__body">
          {children}
        </div>
        {footer && (
          <footer className="ov-modal__footer">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body
  );
};
