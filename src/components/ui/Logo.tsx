import React from 'react';
import Link from 'next/link';

export interface LogoProps {
  variant?: 'light' | 'dark'; // 'light' for white surfaces (Header), 'dark' for teal surfaces (Sidebar, Footer)
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  href?: string;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'light',
  size = 'md',
  showSubtitle = true,
  href = '/',
  className = '',
}) => {
  const iconDimensions = size === 'sm' ? 32 : size === 'lg' ? 48 : 40;
  const titleSize = size === 'sm' ? '1.25rem' : size === 'lg' ? '1.75rem' : '1.45rem';
  const subtitleSize = size === 'sm' ? '0.55rem' : size === 'lg' ? '0.7rem' : '0.625rem';

  const textColor = variant === 'dark' ? '#ffffff' : 'var(--color-primary)';
  const subtitleColor = 'var(--color-accent)';

  const content = (
    <div
      className={`brand-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'sm' ? '0.625rem' : '0.75rem',
        textDecoration: 'none',
        userSelect: 'none',
      }}
    >
      {/* Vector Emblem Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        width={iconDimensions}
        height={iconDimensions}
        style={{ flexShrink: 0, borderRadius: 'var(--radius-md)' }}
      >
        <defs>
          <linearGradient id={`bg-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f5b66" />
            <stop offset="100%" stop-color="#072d33" />
          </linearGradient>

          <linearGradient id={`gold-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef08a" />
            <stop offset="50%" stop-color="#c49a45" />
            <stop offset="100%" stop-color="#9a7428" />
          </linearGradient>

          <radialGradient id={`p1-${variant}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="40%" stop-color="#e0f2f1" />
            <stop offset="85%" stop-color="#80cbc4" />
            <stop offset="100%" stop-color="#00695c" />
          </radialGradient>

          <radialGradient id={`p2-${variant}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="45%" stop-color="#fef9c3" />
            <stop offset="85%" stop-color="#f59e0b" />
            <stop offset="100%" stop-color="#b45309" />
          </radialGradient>
        </defs>

        <rect width="64" height="64" rx="16" fill={`url(#bg-${variant})`} />
        <rect x="1" y="1" width="62" height="62" rx="15" fill="none" stroke={`url(#gold-${variant})`} strokeWidth="1.5" strokeOpacity="0.6" />

        <path
          d="M16 38 C 20 28, 28 22, 38 22 C 48 22, 52 30, 48 40 C 44 48, 32 50, 22 46 C 17 44, 14 39, 16 38 Z"
          fill="none"
          stroke={`url(#gold-${variant})`}
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.85"
        />

        <circle cx="27" cy="35" r="9" fill={`url(#p1-${variant})`} />
        <ellipse cx="24.5" cy="32" rx="3" ry="1.8" fill="#ffffff" opacity="0.8" transform="rotate(-30 24.5 32)" />

        <circle cx="39" cy="27" r="7.5" fill={`url(#p2-${variant})`} />
        <ellipse cx="37" cy="24.5" rx="2.5" ry="1.5" fill="#ffffff" opacity="0.85" transform="rotate(-30 37 24.5)" />

        <path d="M43 14 Q 44.5 17.5 48 19 Q 44.5 20.5 43 24 Q 41.5 20.5 38 19 Q 41.5 17.5 43 14 Z" fill={`url(#gold-${variant})`} />
      </svg>

      {/* Typography */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          className="serif-heading"
          style={{
            fontSize: titleSize,
            color: textColor,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            fontWeight: 700,
          }}
        >
          Song Ngọc
        </span>
        {showSubtitle && (
          <span
            style={{
              fontSize: subtitleSize,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: subtitleColor,
              marginTop: '1px',
            }}
          >
            Homestay Phan Thiết
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none' }}>
        {content}
      </Link>
    );
  }

  return content;
};

export default Logo;
