'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastItem;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} style={{ color: 'var(--color-room-available)' }} />;
      case 'error':
        return <AlertCircle size={18} style={{ color: 'var(--color-room-occupied)' }} />;
      case 'info':
      default:
        return <Info size={18} style={{ color: 'var(--color-primary)' }} />;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return 'var(--color-room-available-border)';
      case 'error':
        return 'var(--color-room-occupied-border)';
      case 'info':
      default:
        return 'var(--color-border)';
    }
  };

  return (
    <div
      className="glass-panel animate-slide-down"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--color-surface)',
        borderLeft: `4px solid ${
          toast.type === 'success'
            ? 'var(--color-room-available)'
            : toast.type === 'error'
            ? 'var(--color-room-occupied)'
            : 'var(--color-primary)'
        }`,
        borderColor: getBorderColor(),
        boxShadow: 'var(--shadow-lg)',
        minWidth: '280px',
        maxWidth: '420px',
      }}
    >
      <div>{getIcon()}</div>
      <div style={{ flex: 1, fontSize: '0.875rem', color: 'var(--color-text)', fontWeight: 500 }}>
        {toast.message}
      </div>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        style={{
          padding: '2px',
          color: 'var(--color-text-muted)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
