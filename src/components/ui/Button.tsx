'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  style,
  className = '',
  ...props
}) => {
  const effectiveLoading = isLoading || loading;
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-text-inverse)',
          border: '1px solid var(--color-primary)',
        };
      case 'secondary':
        return {
          backgroundColor: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          border: '1px solid transparent',
        };
      case 'accent':
        return {
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-text-inverse)',
          border: '1px solid var(--color-accent)',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
        };
      case 'danger':
        return {
          backgroundColor: '#ef4444',
          color: '#ffffff',
          border: '1px solid #ef4444',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: 'var(--color-text-muted)',
          border: '1px solid transparent',
        };
      default:
        return {};
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          padding: '0.375rem 0.75rem',
          fontSize: '0.8125rem',
          borderRadius: 'var(--radius-sm)',
        };
      case 'lg':
        return {
          padding: '0.875rem 1.75rem',
          fontSize: '1.0625rem',
          borderRadius: 'var(--radius-md)',
        };
      case 'md':
      default:
        return {
          padding: '0.625rem 1.25rem',
          fontSize: '0.9375rem',
          borderRadius: 'var(--radius-md)',
        };
    }
  };

  return (
    <button
      disabled={disabled || effectiveLoading}
      style={{
        display: fullWidth ? 'flex' : 'inline-flex',
        width: fullWidth ? '100%' : undefined,
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontWeight: 600,
        lineHeight: 1.2,
        cursor: disabled || effectiveLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || effectiveLoading ? 0.65 : 1,
        transition: 'all var(--transition-fast)',
        ...getVariantStyles(),
        ...getSizeStyles(),
        ...style,
      }}
      className={`btn-component ${className}`}
      {...props}
    >
      {effectiveLoading ? (
        <span
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
          }}
        />
      ) : (
        leftIcon
      )}
      {children}
      {!effectiveLoading && rightIcon}
    </button>
  );
};

export default Button;
