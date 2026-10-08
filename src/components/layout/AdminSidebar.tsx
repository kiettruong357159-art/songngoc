'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Grid,
  BookOpen,
  CheckSquare,
  Coffee,
  Receipt,
  BedDouble,
  Users,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { hasPermission } from '@/lib/auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
}

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems: NavItem[] = [
    {
      label: 'Tổng quan (Dashboard)',
      href: '/admin',
      icon: <LayoutDashboard size={18} />,
    },
    {
      label: 'Sơ đồ phòng (Grid)',
      href: '/admin/rooms',
      icon: <Grid size={18} />,
      permission: 'rooms:view',
    },
    {
      label: 'Đặt phòng',
      href: '/admin/bookings',
      icon: <BookOpen size={18} />,
      permission: 'rooms:view',
    },
    {
      label: 'Check-in tại quầy',
      href: '/admin/checkin',
      icon: <CheckSquare size={18} />,
      permission: 'rooms:status',
    },
    {
      label: 'Minibar & Dịch vụ',
      href: '/admin/services',
      icon: <Coffee size={18} />,
      permission: 'services:*',
    },
    {
      label: 'Hóa đơn & Thu ngân',
      href: '/admin/invoices',
      icon: <Receipt size={18} />,
      permission: 'invoices:*',
    },
    {
      label: 'Cấu hình hạng phòng',
      href: '/admin/room-types',
      icon: <BedDouble size={18} />,
      permission: '*',
    },
    {
      label: 'Nhân viên & Phân quyền',
      href: '/admin/users',
      icon: <Users size={18} />,
      permission: '*',
    },
  ];

  const userPerms = user?.permissions || [];

  // Lọc các mục menu mà nhân viên có quyền truy cập
  const visibleItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return hasPermission(userPerms, item.permission);
  });

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#0a3036',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 50,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-accent)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Building2 size={22} />
        </div>
        <div>
          <div className="serif-heading" style={{ fontSize: '1.2rem', lineHeight: 1.1 }}>
            Song Ngọc
          </div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-accent)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
            Homestay PMS
          </div>
        </div>
      </div>

      {/* Nav List */}
      <nav
        style={{
          padding: '1rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          overflowY: 'auto',
          flex: 1,
        }}
      >
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6875rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                color: isActive ? '#ffffff' : '#cbd5e1',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              <span style={{ color: isActive ? 'var(--color-accent)' : '#94a3b8' }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Status Footer */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          fontSize: '0.8125rem',
        }}
      >
        <div style={{ color: '#94a3b8' }}>Đang đăng nhập:</div>
        <div style={{ fontWeight: 600, color: '#ffffff' }}>{user?.name || user?.username || 'Nhân viên'}</div>
        <div style={{ color: 'var(--color-accent)', fontSize: '0.75rem', marginTop: '2px' }}>
          Vai trò: {user?.role || 'Lễ tân'}
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
