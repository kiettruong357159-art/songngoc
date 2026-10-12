'use client';

import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { AlertTriangle, Trash2, Info, Loader2 } from 'lucide-react';

export type ConfirmVariant = 'danger' | 'warning' | 'info';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 size={22} style={{ color: 'var(--color-error)' }} />,
          iconBg: 'rgba(239, 68, 68, 0.1)',
          confirmBtnBg: 'var(--color-error)',
          confirmBtnHover: '#dc2626',
        };
      case 'warning':
        return {
          icon: <AlertTriangle size={22} style={{ color: 'var(--color-accent)' }} />,
          iconBg: 'rgba(196, 154, 69, 0.12)',
          confirmBtnBg: 'var(--color-accent)',
          confirmBtnHover: '#b38b38',
        };
      case 'info':
      default:
        return {
          icon: <Info size={22} style={{ color: 'var(--color-primary)' }} />,
          iconBg: 'rgba(15, 91, 102, 0.1)',
          confirmBtnBg: 'var(--color-primary)',
          confirmBtnHover: '#0a3f47',
        };
    }
  };

  const currentVariant = getVariantStyles();

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (loading) return;
    await onConfirm();
  };

  const handleCancel = () => {
    if (loading) return;
    if (onCancel) onCancel();
    onOpenChange(false);
  };

  return (
    <AlertDialog.Root open={open} onOpenChange={(val) => !loading && onOpenChange(val)}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="radix-alert-overlay" />
        <AlertDialog.Content className="radix-alert-content">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            {/* Biểu tượng trạng thái */}
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: currentVariant.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {currentVariant.icon}
            </div>

            {/* Nội dung tiêu đề & mô tả */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <AlertDialog.Title
                style={{
                  fontSize: '1.0625rem',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  margin: 0,
                  lineHeight: 1.4,
                  fontFamily: 'var(--font-heading, inherit)',
                }}
              >
                {title}
              </AlertDialog.Title>

              <AlertDialog.Description
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                  marginTop: '0.5rem',
                  marginBottom: 0,
                  lineHeight: 1.5,
                }}
              >
                {description}
              </AlertDialog.Description>
            </div>
          </div>

          {/* Nút hành động */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '0.75rem',
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--color-border)',
            }}
          >
            <AlertDialog.Cancel asChild>
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'background-color 0.15s ease',
                }}
              >
                {cancelText}
              </button>
            </AlertDialog.Cancel>

            <AlertDialog.Action asChild>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1.125rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  backgroundColor: currentVariant.confirmBtnBg,
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.75 : 1,
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  transition: 'background-color 0.15s ease, transform 0.1s ease',
                }}
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                <span>{loading ? 'Đang xử lý...' : confirmText}</span>
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

export default ConfirmDialog;
