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
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useAdminUI } from '@/context/AdminUIContext';
import { hasPermission } from '@/lib/auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  permission?: string;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuth();
  const { sidebarOpen, setSidebarOpen } = useAdminUI();

  const navGroups: NavGroup[] = [
    {
      items: [
        {
          label: 'Tổng quan (Dashboard)',
          href: '/admin',
          icon: <LayoutDashboard size={18} />,
        },
      ],
    },
    {
      title: 'Vận hành',
      items: [
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
      ],
    },
    {
      title: 'Dịch vụ & Thu ngân',
      items: [
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
      ],
    },
    {
      title: 'Quản trị hệ thống',
      items: [
        {
          label: 'Cấu hình hạng phòng',
          href: '/admin/room-types',
          icon: <BedDouble size={18} />,
          permission: '*',
        },
        {
          label: 'Danh mục tiện nghi',
          href: '/admin/amenities',
          icon: <Sparkles size={18} />,
          permission: '*',
        },
        {
          label: 'Nhân viên & Phân quyền',
          href: '/admin/users',
          icon: <Users size={18} />,
          permission: '*',
        },
      ],
    },
  ];

  const userPerms = user?.permissions || [];

  // Lọc các mục menu mà nhân viên có quyền truy cập, bỏ nhóm không còn mục nào
  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        if (!item.permission) return true;
        return hasPermission(userPerms, item.permission);
      }),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile/Tablet Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="admin-sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/favicon.svg" alt="Song Ngọc Emblem" width={38} height={38} style={{ display: 'block' }} />
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

          {/* Close button on Mobile/Tablet */}
          <button
            type="button"
            className="admin-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Đóng thanh điều hướng"
          >
            <X size={20} />
          </button>
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
          {visibleGroups.map((group, groupIndex) => (
            <div
              key={group.title || 'root'}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: groupIndex === 0 ? 0 : '0.75rem' }}
            >
              {group.title && (
                <div
                  style={{
                    padding: '0.5rem 0.875rem 0.25rem',
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#94a3b8',
                    opacity: 0.75,
                  }}
                >
                  {group.title}
                </div>
              )}

              {group.items.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
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
            </div>
          ))}
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
    </>
  );
};

export default AdminSidebar;
