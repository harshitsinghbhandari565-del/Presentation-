/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import { VaultIcon } from '../icon/VaultIcon';

interface VaultDoorProps {
  onComplete?: () => void;
}

export const VaultDoor: React.FC<VaultDoorProps> = ({ onComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRendered, setIsRendered] = useState(true);

  useEffect(() => {
    // Session tracking
    const sessionKey = 'ov-vault-door-sessions';
    const sessions = parseInt(localStorage.getItem(sessionKey) || '0');
    
    // Skip animation if sessions > 3
    if (sessions >= 3) {
        setIsOpen(true);
        const timer = setTimeout(() => setIsRendered(false), 300);
        return () => clearTimeout(timer);
    }

    localStorage.setItem(sessionKey, (sessions + 1).toString());

    // Start opening after a brief delay
    const timer = setTimeout(() => {
      setIsOpen(true);
      // Haptic feedback
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(40);
      }
    }, 500);

    // Remove from DOM after animation completes
    const removeTimer = setTimeout(() => {
      setIsRendered(false);
      onComplete?.();
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [onComplete]);

  if (!isRendered) return null;

  return (
    <div className={`ov-vault-door ${isOpen ? 'ov-vault-door--open' : ''}`}>
      <div className="ov-vault-door__logo">
        <div className="ov-vault-door__icon-wrapper">
            <VaultIcon icon={Lock} className="text-accent-default w-10 h-10" />
        </div>
        <span className="ov-vault-door__text">Vault Unlocked</span>
        <div aria-live="polite" className="ov-sr-only">
            Vault unlocked. Welcome back.
        </div>
      </div>
      <div className="ov-vault-door__panel ov-vault-door__panel--left" />
      <div className="ov-vault-door__panel ov-vault-door__panel--right" />
    </div>
  );
};
