'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { Toaster, toast } from 'sonner';
import { ToastType } from '../components/ui/Toast';

export { toast };

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'warning':
        toast.warning(message);
        break;
      case 'info':
      default:
        toast.info(message);
        break;
    }
  }, []);

  const success = useCallback((msg: string) => toast.success(msg), []);
  const error = useCallback((msg: string) => toast.error(msg), []);
  const info = useCallback((msg: string) => toast.info(msg), []);
  const warning = useCallback((msg: string) => toast.warning(msg), []);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning }}>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand
        duration={3500}
        theme="light"
        toastOptions={{
          style: {
            fontFamily: 'var(--font-sans)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 25px -5px rgba(15, 91, 102, 0.12), 0 8px 10px -6px rgba(15, 91, 102, 0.08)',
            fontSize: '0.875rem',
          },
        }}
      />
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

