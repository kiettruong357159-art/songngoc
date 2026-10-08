'use client';

import React from 'react';
import Link from 'next/link';
import { LogOut, ExternalLink, User, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/Badge';

export const AdminHeader: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header
      className="glass-header"
      style={{
        height: '68px',
        padding: '0 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'var(--color-surface)',
      }}
    >
      {/* Left breadcrumb / Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Hệ Thống Quản Lý</span>
        <span style={{ color: 'var(--color-border)' }}>/</span>
        <span style={{ fontSize: '0.925rem', fontWeight: 600, color: 'var(--color-primary)' }}>
          Bảng Điều Hành Khách Sạn Sông Ngọc
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Link to public website */}
        <Link
          href="/"
          target="_blank"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            fontSize: '0.85rem',
            color: 'var(--color-primary)',
            textDecoration: 'none',
            fontWeight: 500,
            padding: '0.375rem 0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-light)',
          }}
        >
          <span>Xem Storefront</span>
          <ExternalLink size={14} />
        </Link>

        {/* User Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            {user?.name ? user.name[0].toUpperCase() : <User size={16} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.2 }}>
              {user?.name || user?.username || 'Nhân viên'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {user?.role === 'ADMIN' ? 'Quản trị viên' : user?.role === 'RECEPTIONIST' ? 'Lễ tân' : 'Buồng phòng'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={logout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            padding: '0.45rem 0.85rem',
            color: '#ef4444',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.825rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background var(--transition-fast)',
          }}
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut size={15} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
