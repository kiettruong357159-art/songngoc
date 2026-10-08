'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Calendar, Bed, User, ShieldCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatVND, formatDateVN } from '@/lib/utils';
import { BOOKING_STATUS_META, BookingStatus } from '@/lib/constants';

function TrackContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [query, setQuery] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`/api/booking/track?query=${encodeURIComponent(searchQuery.trim())}`);
      const json = await res.json();
      if (json.success) {
        setResults(json.data);
        if (json.data.length === 0) {
          setErrorMsg('Không tìm thấy thông tin đơn đặt phòng tương ứng.');
        }
      } else {
        setErrorMsg(json.error || 'Tra cứu thất bại');
      }
    } catch {
      setErrorMsg('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      handleSearch(initialCode);
    }
  }, [initialCode]);

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: '4rem 1.5rem 6rem' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span
            style={{
              color: 'var(--color-accent)',
              fontWeight: 700,
              fontSize: '0.8125rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}
          >
            Hệ Thống Tra Cứu Trực Tuyến
          </span>
          <h1 className="serif-heading" style={{ fontSize: '2.5rem', color: 'var(--color-primary)', marginTop: '0.5rem' }}>
            Tra Cứu Đơn Đặt Phòng
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Nhập số điện thoại đã đặt phòng hoặc mã booking (ví dụ: BK-202610-1001) để xem trạng thái đơn.
          </p>
        </div>

        {/* Search Bar */}
        <div
          className="glass-panel"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '2.5rem',
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
          >
            <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nhập Số điện thoại hoặc Mã đặt phòng..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.5rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  outline: 'none',
                  fontSize: '0.95rem',
                }}
              />
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                }}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              style={{ minWidth: '130px', fontWeight: 600 }}
            >
              Tra cứu
            </Button>
          </form>
        </div>

        {/* Error / Empty State */}
        {errorMsg && (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: 'var(--color-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              marginBottom: '2rem',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Results List */}
        {results && results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {results.map((booking) => {
              const statusMeta = BOOKING_STATUS_META[booking.status as BookingStatus] || {
                label: booking.status,
                badgeType: 'neutral',
              };

              return (
                <div
                  key={booking.id}
                  className="glass-panel"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '2rem',
                    boxShadow: 'var(--shadow-md)',
                    borderLeft: '4px solid var(--color-primary)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                      marginBottom: '1.25rem',
                      paddingBottom: '1rem',
                      borderBottom: '1px solid var(--color-border)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Mã đặt phòng</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                        {booking.bookingCode}
                      </div>
                    </div>

                    <Badge variant={statusMeta.badgeType as any}>{statusMeta.label}</Badge>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '1rem',
                      marginBottom: '1.5rem',
                      fontSize: '0.875rem',
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--color-text-muted)' }}>Khách lưu trú:</span>
                      <div style={{ fontWeight: 600 }}>{booking.guest?.fullName} ({booking.guest?.phone})</div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--color-text-muted)' }}>Hạng phòng:</span>
                      <div style={{ fontWeight: 600 }}>{booking.roomType?.name}</div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--color-text-muted)' }}>Thời gian:</span>
                      <div style={{ fontWeight: 600 }}>
                        {formatDateVN(booking.checkIn)} → {formatDateVN(booking.checkOut)}
                      </div>
                    </div>

                    <div>
                      <span style={{ color: 'var(--color-text-muted)' }}>Phòng xếp:</span>
                      <div style={{ fontWeight: 600, color: booking.room ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                        {booking.room ? `Phòng ${booking.room.roomNumber}` : 'Chờ gán khi Check-in'}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '1rem',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--color-border)',
                    }}
                  >
                    <div style={{ fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--color-text-muted)' }}>Tiền cọc: </span>
                      <strong style={{ color: 'var(--color-accent)' }}>{formatVND(booking.depositAmount)}</strong>
                      <span style={{ color: 'var(--color-text-muted)', marginLeft: '1rem' }}>Tổng tiền phòng: </span>
                      <strong style={{ color: 'var(--color-primary)' }}>{formatVND(booking.totalRoomAmount)}</strong>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                      Ngày tạo: {formatDateVN(booking.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div style={{ padding: '5rem', textAlign: 'center' }}>Đang tải công cụ tra cứu...</div>}>
      <TrackContent />
    </Suspense>
  );
}
