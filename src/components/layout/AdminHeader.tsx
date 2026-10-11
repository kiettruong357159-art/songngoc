'use client';

import React from 'react';
import Link from 'next/link';
import { LogOut, ExternalLink, User, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAdminUI } from '@/context/AdminUIContext';
import { usePathname } from 'next/navigation';

interface BreadcrumbConfig {
  category?: string;
  title: string;
}

/**
  * Tiêu đề breadcrumb chi tiết theo đường dẫn từng trang admin
  */
const ADMIN_BREADCRUMBS: { path: string; category?: string; title: string }[] = [
  { path: '/admin/rooms', category: 'Vận hành', title: 'Sơ đồ phòng (Grid)' },
  { path: '/admin/bookings', category: 'Vận hành', title: 'Quản lý đơn đặt phòng' },
  { path: '/admin/checkin', category: 'Vận hành', title: 'Check-in tại quầy' },
  { path: '/admin/services', category: 'Dịch vụ & Thu ngân', title: 'Minibar & Dịch vụ' },
  { path: '/admin/invoices', category: 'Dịch vụ & Thu ngân', title: 'Hóa đơn & Thu ngân' },
  { path: '/admin/room-types', category: 'Quản trị hệ thống', title: 'Cấu hình hạng phòng' },
  { path: '/admin/amenities', category: 'Quản trị hệ thống', title: 'Danh mục tiện nghi' },
  { path: '/admin/users', category: 'Quản trị hệ thống', title: 'Nhân viên & Phân quyền' },
];

/**
  * Lấy cấu hình breadcrumb cho trang hiện tại
  * @param pathname Đường dẫn hiện tại
  * @returns {BreadcrumbConfig}
  */
function getAdminBreadcrumb(pathname: string): BreadcrumbConfig {
  if (pathname === '/admin' || pathname === '/admin/') {
    return { title: 'Tổng quan (Dashboard)' };
  }
  const matched = ADMIN_BREADCRUMBS.find(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`)
  );
  return matched || { title: 'Trang quản trị' };
}

export const AdminHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useAdminUI();
  const pathname = usePathname();
  const breadcrumb = getAdminBreadcrumb(pathname);

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

        <nav aria-label="Breadcrumb" className="admin-header-breadcrumb">
          <Link href="/admin" className="admin-breadcrumb-root" style={{ textDecoration: 'none' }}>
            Hệ Thống Quản Lý
          </Link>

          {breadcrumb.category && (
            <>
              <span className="admin-breadcrumb-sep">/</span>
              <span className="admin-breadcrumb-category">{breadcrumb.category}</span>
            </>
          )}

          <span className="admin-breadcrumb-sep">/</span>
          <span className="admin-breadcrumb-current">{breadcrumb.title}</span>
        </nav>
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
