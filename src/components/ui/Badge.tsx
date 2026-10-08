'use client';

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent' | 'primary';
  size?: 'sm' | 'md';
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  style,
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: 'var(--color-room-available-bg)',
          color: 'var(--color-room-available)',
          border: '1px solid var(--color-room-available-border)',
        };
      case 'warning':
        return {
          backgroundColor: 'var(--color-room-dirty-bg)',
          color: 'var(--color-room-dirty)',
          border: '1px solid var(--color-room-dirty-border)',
        };
      case 'danger':
        return {
          backgroundColor: 'var(--color-room-occupied-bg)',
          color: 'var(--color-room-occupied)',
          border: '1px solid var(--color-room-occupied-border)',
        };
      case 'info':
        return {
          backgroundColor: 'var(--color-room-cleaning-bg)',
          color: 'var(--color-room-cleaning)',
          border: '1px solid var(--color-room-cleaning-border)',
        };
      case 'accent':
        return {
          backgroundColor: 'var(--color-accent-light)',
          color: 'var(--color-accent)',
          border: '1px solid #f2e2c2',
        };
      case 'primary':
        return {
          backgroundColor: 'var(--color-primary-light)',
          color: 'var(--color-primary)',
          border: '1px solid #c9e3e7',
        };
      case 'neutral':
      default:
        return {
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-muted)',
          border: '1px solid var(--color-border)',
        };
    }
  };

  const isSmall = size === 'sm';

  return (
    <span
      className={`badge-component ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: isSmall ? '0.125rem 0.5rem' : '0.25rem 0.625rem',
        borderRadius: 'var(--radius-full)',
        fontSize: isSmall ? '0.75rem' : '0.8125rem',
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '0.01em',
        ...getVariantStyles(),
        ...style,
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
