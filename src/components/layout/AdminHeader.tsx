'use client';

import React from 'react';
import Link from 'next/link';
import { LogOut, ExternalLink, User, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAdminUI } from '@/context/AdminUIContext';

export const AdminHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useAdminUI();

  return (
    <header className="glass-header admin-header">
      {/* Left: Mobile hamburger & breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
        <button
          type="button"
          onClick={toggleSidebar}
          className="admin-mobile-toggle"
          aria-label="Mở thanh điều hướng"
        >
          <Menu size={22} />
        </button>

        <div className="admin-header-breadcrumb">
          <span className="admin-breadcrumb-root">Hệ Thống Quản Lý</span>
          <span className="admin-breadcrumb-sep">/</span>
          <span className="admin-breadcrumb-current">
            Bảng Điều Hành Homestay Song Ngọc
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexShrink: 0 }}>
        {/* Link to public website */}
        <Link
          href="/"
          target="_blank"
          className="admin-storefront-btn"
          title="Xem trang chủ khách sạn"
        >
          <span className="desktop-text">Xem Storefront</span>
          <ExternalLink size={14} />
        </Link>

        {/* User Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {user?.name ? user.name[0].toUpperCase() : <User size={16} />}
          </div>
          <div className="admin-user-info" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>
              {user?.name || user?.username || 'Nhân viên'}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
              {user?.role === 'ADMIN' ? 'Quản trị viên' : user?.role === 'RECEPTIONIST' ? 'Lễ tân' : 'Buồng phòng'}
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={logout}
          className="admin-logout-btn"
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut size={16} />
          <span className="desktop-text">Đăng xuất</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
