'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  LogIn,
  LogOut,
  DollarSign,
  Grid,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  UserPlus,
} from 'lucide-react';
import { formatVND, formatDateVN } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { BOOKING_STATUS_META, BookingStatus } from '@/lib/constants';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <Skeleton width="320px" height="2rem" style={{ marginBottom: '0.5rem' }} />
            <Skeleton width="480px" height="1rem" />
          </div>
          <Skeleton width="180px" height="2.5rem" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-panel" style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
              <Skeleton width="50%" height="0.875rem" style={{ marginBottom: '0.75rem' }} />
              <Skeleton width="70%" height="2rem" />
            </div>
          ))}
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--radius-lg)' }}>
          <Skeleton width="40%" height="1.25rem" style={{ marginBottom: '1.25rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} height="4.5rem" borderRadius="var(--radius-md)" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const stats = data || {
    occupancyRate: 0,
    todayRevenue: 0,
    todayCheckInsCount: 0,
    todayCheckOutsCount: 0,
    statusCounts: { AVAILABLE: 0, OCCUPIED: 0, DIRTY: 0, CLEANING: 0, MAINTENANCE: 0 },
    recentBookings: [],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Welcome Banner with Quick Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 className="serif-heading" style={{ fontSize: '1.85rem', color: 'var(--color-primary)' }}>
            Tổng Quan Điều Hành Homestay Song Ngọc
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Theo dõi công suất phòng, lượt khách nhận/trả và tình trạng vận hành theo thời gian thực.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/admin/checkin">
            <Button variant="primary" size="md" leftIcon={<UserPlus size={16} />}>
              Check-in khách nhanh
            </Button>
          </Link>
          <Link href="/admin/rooms">
            <Button variant="secondary" size="md" leftIcon={<Grid size={16} />}>
              Sơ đồ phòng (Grid)
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Metric 1: Tỷ lệ lấp đầy */}
        <div
          className="glass-panel"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            borderLeft: '4px solid var(--color-primary)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Tỷ lệ lấp đầy
            </span>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
            {stats.occupancyRate}%
          </div>
          <div style={{ marginTop: '0.5rem', height: '6px', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
            <div
              style={{
                width: `${stats.occupancyRate}%`,
                height: '100%',
                backgroundColor: 'var(--color-primary)',
                borderRadius: 'var(--radius-full)',
              }}
            />
          </div>
        </div>

        {/* Metric 2: Doanh thu hôm nay */}
        <div
          className="glass-panel"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            borderLeft: '4px solid var(--color-accent)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Doanh thu hôm nay
            </span>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-accent-light)', color: 'var(--color-accent)' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-accent)' }}>
            {formatVND(stats.todayRevenue)}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Từ hóa đơn đã chốt trong ngày
          </span>
        </div>

        {/* Metric 3: Check-in hôm nay */}
        <div
          className="glass-panel"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            borderLeft: '4px solid var(--color-room-available)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Check-in hôm nay
            </span>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-room-available-bg)', color: 'var(--color-room-available)' }}>
              <LogIn size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-room-available)' }}>
            {stats.todayCheckInsCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Lượt khách dự kiến nhận phòng
          </span>
        </div>

        {/* Metric 4: Check-out hôm nay */}
        <div
          className="glass-panel"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
            borderLeft: '4px solid var(--color-room-dirty)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
              Check-out hôm nay
            </span>
            <div style={{ padding: '6px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-room-dirty-bg)', color: 'var(--color-room-dirty)' }}>
              <LogOut size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-room-dirty)' }}>
            {stats.todayCheckOutsCount}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            Lượt khách chuẩn bị thanh toán
          </span>
        </div>
      </div>

      {/* Room Status Summary Bar */}
      <div
        className="glass-panel"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 className="serif-heading" style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>
            Tình Trạng Vận Hành Phòng
          </h2>
          <Link
            href="/admin/rooms"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              textDecoration: 'none',
            }}
          >
            <span>Mở sơ đồ phòng đầy đủ</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
          }}
        >
          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-room-available-bg)', border: '1px solid var(--color-room-available-border)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-room-available)', textTransform: 'uppercase' }}>
              Phòng trống
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-room-available)' }}>
              {stats.statusCounts.AVAILABLE}
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-room-occupied-bg)', border: '1px solid var(--color-room-occupied-border)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-room-occupied)', textTransform: 'uppercase' }}>
              Đang có khách
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-room-occupied)' }}>
              {stats.statusCounts.OCCUPIED}
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-room-dirty-bg)', border: '1px solid var(--color-room-dirty-border)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-room-dirty)', textTransform: 'uppercase' }}>
              Cần dọn dẹp
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-room-dirty)' }}>
              {stats.statusCounts.DIRTY}
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-room-cleaning-bg)', border: '1px solid var(--color-room-cleaning-border)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-room-cleaning)', textTransform: 'uppercase' }}>
              Đang dọn dẹp
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-room-cleaning)' }}>
              {stats.statusCounts.CLEANING}
            </div>
          </div>

          <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-room-maintenance-bg)', border: '1px solid var(--color-room-maintenance-border)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-room-maintenance)', textTransform: 'uppercase' }}>
              Bảo trì
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-room-maintenance)' }}>
              {stats.statusCounts.MAINTENANCE}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div
        className="glass-panel"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 className="serif-heading" style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>
            Đơn Đặt Phòng Mới Nhất
          </h2>
          <Link
            href="/admin/bookings"
            style={{
              fontSize: '0.85rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              textDecoration: 'none',
            }}
          >
            <span>Xem tất cả đơn đặt phòng</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {stats.recentBookings.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Chưa có đơn đặt phòng nào được ghi nhận.
          </div>
        ) : (
          <div className="table-responsive">
            <table style={{ width: '100%', minWidth: '640px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>Mã booking</th>
                  <th style={{ padding: '0.75rem' }}>Khách hàng</th>
                  <th style={{ padding: '0.75rem' }}>Hạng phòng</th>
                  <th style={{ padding: '0.75rem' }}>Thời gian lưu trú</th>
                  <th style={{ padding: '0.75rem' }}>Trạng thái</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Tổng tiền</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((b: any) => {
                  const statusMeta = BOOKING_STATUS_META[b.status as BookingStatus] || {
                    label: b.status,
                    badgeType: 'neutral',
                  };

                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.875rem 0.75rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {b.bookingCode}
                      </td>
                      <td style={{ padding: '0.875rem 0.75rem' }}>
                        <div>{b.guest?.fullName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{b.guest?.phone}</div>
                      </td>
                      <td style={{ padding: '0.875rem 0.75rem' }}>{b.roomType?.name}</td>
                      <td style={{ padding: '0.875rem 0.75rem' }}>
                        {formatDateVN(b.checkIn)} → {formatDateVN(b.checkOut)}
                      </td>
                      <td style={{ padding: '0.875rem 0.75rem' }}>
                        <Badge variant={statusMeta.badgeType as any}>{statusMeta.label}</Badge>
                      </td>
                      <td style={{ padding: '0.875rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>
                        {formatVND(b.totalRoomAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
