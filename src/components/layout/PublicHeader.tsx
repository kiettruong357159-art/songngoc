'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Calendar, Search, LogIn, Menu, X } from 'lucide-react';

export const PublicHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header
      className="glass-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        width: '100%',
        transition: 'all var(--transition-fast)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '76px',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            display: 'flex',
            flexDirection: 'column',
            textDecoration: 'none',
          }}
        >
          <span
            className="serif-heading"
            style={{
              fontSize: '1.65rem',
              color: 'var(--color-primary)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            Sông Ngọc
          </span>
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: 'var(--color-accent)',
            }}
          >
            Homestay Phan Thiết
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '2rem',
          }}
          className="desktop-nav"
        >
          <Link
            href="/"
            style={{
              fontSize: '0.925rem',
              fontWeight: 600,
              color: 'var(--color-text)',
              transition: 'color var(--transition-fast)',
            }}
          >
            Trang chủ
          </Link>
          <Link
            href="/rooms"
            style={{
              fontSize: '0.925rem',
              fontWeight: 500,
              color: 'var(--color-text)',
              transition: 'color var(--transition-fast)',
            }}
          >
            Hạng phòng
          </Link>
          <Link
            href="/track"
            style={{
              fontSize: '0.925rem',
              fontWeight: 500,
              color: 'var(--color-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              transition: 'color var(--transition-fast)',
            }}
          >
            <Search size={16} />
            Tra cứu đặt phòng
          </Link>
        </nav>

        {/* Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <a
            href="tel:0962103737"
            style={{
              display: 'none',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--color-primary)',
              fontWeight: 600,
              fontSize: '0.9rem',
              textDecoration: 'none',
            }}
            className="desktop-hotline"
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-primary-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Phone size={16} />
            </div>
            <span>0962.103.737</span>
          </a>

          <Link
            href="/rooms"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'background var(--transition-fast)',
            }}
          >
            <Calendar size={15} />
            <span>Đặt phòng</span>
          </Link>

          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.75rem',
              backgroundColor: 'transparent',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 500,
              fontSize: '0.825rem',
              textDecoration: 'none',
            }}
            title="Đăng nhập Lễ tân & Quản trị"
          >
            <LogIn size={15} />
            <span className="desktop-text">Nội bộ</span>
          </Link>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              padding: '0.5rem',
              color: 'var(--color-text)',
            }}
            className="mobile-toggle"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="glass-panel animate-slide-down"
          style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 600, color: 'var(--color-text)' }}
          >
            Trang chủ
          </Link>
          <Link
            href="/rooms"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 500, color: 'var(--color-text)' }}
          >
            Hạng phòng & Giá
          </Link>
          <Link
            href="/track"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontWeight: 500, color: 'var(--color-text)' }}
          >
            Tra cứu đơn đặt phòng
          </Link>
          <a
            href="tel:0962103737"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--color-primary)',
              fontWeight: 600,
            }}
          >
            <Phone size={16} />
            Hotline: 0962.103.737
          </a>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 768px) {
          :global(.desktop-nav) {
            display: flex !important;
          }
          :global(.desktop-hotline) {
            display: flex !important;
          }
          :global(.mobile-toggle) {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default PublicHeader;
