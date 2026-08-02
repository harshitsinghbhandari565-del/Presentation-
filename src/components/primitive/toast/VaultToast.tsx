"use client";
import React, { useState, useCallback, useContext, createContext } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { VaultIcon } from '../icon/VaultIcon';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  addToast: (type: ToastType, message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const VaultToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string, title?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev.slice(-2), { id, type, title, message }]);
    
    if (type !== 'error') {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    }
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="ov-toast-region" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`ov-toast ov-toast--${toast.type}`}>
            <div className="ov-toast__accent" />
            <VaultIcon 
              icon={toast.type === 'success' ? CheckCircle : toast.type === 'error' ? AlertCircle : Info} 
              className={`ov-text-${toast.type}`}
            />
            <div className="ov-toast__content">
              {toast.title && <span className="ov-toast__title">{toast.title}</span>}
              <span className="ov-toast__message">{toast.message}</span>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-white/5 rounded-md transition-colors"
              aria-label="Dismiss"
            >
              <VaultIcon icon={X} className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useVaultToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useVaultToast must be used within a VaultToastProvider');
  return context;
};
