import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatVND } from '@/lib/utils';
import { getRoomTypeAvailability } from '@/lib/availability';
import { FloatingBookingBar } from '@/components/booking/FloatingBookingBar';
import { SafeImage } from '@/components/ui/SafeImage';
import { Badge } from '@/components/ui/Badge';
import { Bed, Maximize2, Users, ArrowRight, Eye, Check } from 'lucide-react';

interface RoomsPageProps {
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    adults?: string;
    children?: string;
  }>;
}

export default async function RoomsPage({ searchParams }: RoomsPageProps) {
  const params = await searchParams;
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000);
  const dayAfter = new Date(now.getTime() + 86400000 * 3);

  const checkInStr = params.checkIn || tomorrow.toISOString().split('T')[0];
  const checkOutStr = params.checkOut || dayAfter.toISOString().split('T')[0];
  const adultsNum = parseInt(params.adults || '1', 10);

  const checkInDate = new Date(checkInStr);
  const checkOutDate = new Date(checkOutStr);

  const roomTypes = await db.roomType.findMany({
    where: {
      isActive: true,
      maxAdults: { gte: adultsNum },
    },
    orderBy: { basePrice: 'asc' },
  });

  // Tính số phòng khả dụng cho từng loại phòng theo ngày
  const roomTypesWithAvailability = await Promise.all(
    roomTypes.map(async (rt) => {
      const avail = await getRoomTypeAvailability(db, rt.id, checkInDate, checkOutDate);
      return {
        ...rt,
        availability: avail,
      };
    })
  );

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', paddingBottom: '5rem' }}>
      {/* Page Header */}
      <div
        style={{
          padding: '4rem 1.5rem 2.5rem',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          textAlign: 'center',
        }}
      >
        <div className="container">
          <span
            style={{
              color: 'var(--color-accent)',
              fontWeight: 700,
              fontSize: '0.8125rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}
          >
            Hệ Thống Phòng Nghỉ Song Ngọc
          </span>
          <h1
            className="serif-heading"
            style={{
              fontSize: '2.5rem',
              color: 'var(--color-primary)',
              marginTop: '0.5rem',
              marginBottom: '0.75rem',
            }}
          >
            Danh Sách Hạng Phòng & Giá Tốt Nhất
          </h1>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            Tất cả các phòng đều được trang bị nệm chuẩn khách sạn 5 sao, điều hòa 2 chiều, wifi tốc độ cao và đồ vệ sinh cao cấp.
          </p>
        </div>
      </div>

      {/* Floating Filter Bar */}
      <div className="container" style={{ marginTop: '-1.5rem', marginBottom: '3.5rem' }}>
        <FloatingBookingBar
          initialCheckIn={checkInStr}
          initialCheckOut={checkOutStr}
          initialAdults={params.adults}
          initialChildren={params.children}
        />
      </div>

      {/* Room Listing Grid */}
      <div className="container">
        {roomTypesWithAvailability.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '3rem',
              textAlign: 'center',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface)',
            }}
          >
            <h3 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
              Không tìm thấy hạng phòng phù hợp với số lượng khách
            </h3>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Quý khách vui lòng chọn lại số lượng khách hoặc liên hệ hotline 0962.103.737 để được hỗ trợ xếp phòng.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {roomTypesWithAvailability.map((roomType) => {
              let images: string[] = [];
              let amenities: string[] = [];
              try {
                images = JSON.parse(roomType.images);
              } catch {
                images = ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'];
              }
              try {
                amenities = JSON.parse(roomType.amenities);
              } catch {
                amenities = ['wifi', 'air_con', 'hot_water'];
              }

              const availableCount = roomType.availability.availableCount;
              const isAvailable = availableCount > 0;

              return (
                <div
                  key={roomType.id}
                  className="glass-panel"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--color-surface)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                    boxShadow: 'var(--shadow-md)',
                  }}
                >
                  {/* Left Column: Image with badges */}
                  <div
                    style={{
                      height: '320px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <SafeImage
                      src={images[0]}
                      alt={roomType.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        display: 'flex',
                        gap: '0.5rem',
                        zIndex: 1,
                      }}
                    >
                      {isAvailable ? (
                        <Badge variant="success">Còn {availableCount} phòng trống</Badge>
                      ) : (
                        <Badge variant="danger">Hết phòng trong ngày chọn</Badge>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Room Details & Booking CTA */}
                  <div
                    style={{
                      padding: '2rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <h2
                          className="serif-heading"
                          style={{ fontSize: '1.65rem', color: 'var(--color-primary)' }}
                        >
                          {roomType.name}
                        </h2>
                      </div>

                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                        {roomType.description}
                      </p>

                      {/* Specs badges */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '1rem',
                          padding: '0.75rem 0',
                          borderTop: '1px solid var(--color-border)',
                          borderBottom: '1px solid var(--color-border)',
                          marginBottom: '1.25rem',
                          fontSize: '0.875rem',
                          color: 'var(--color-text)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Maximize2 size={16} style={{ color: 'var(--color-primary)' }} />
                          <span>{roomType.roomArea} m²</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Bed size={16} style={{ color: 'var(--color-primary)' }} />
                          <span>{roomType.bedType}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Users size={16} style={{ color: 'var(--color-primary)' }} />
                          <span>Tối đa {roomType.maxAdults} người lớn + {roomType.maxChildren} trẻ em</span>
                        </div>
                      </div>

                      {/* Amenities checklist */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', marginBottom: '1.5rem' }}>
                        {amenities.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              fontSize: '0.785rem',
                              color: 'var(--color-primary)',
                              backgroundColor: 'var(--color-primary-light)',
                              padding: '0.25rem 0.625rem',
                              borderRadius: 'var(--radius-sm)',
                              fontWeight: 500,
                            }}
                          >
                            <Check size={12} />
                            <span>{item.replace('_', ' ').toUpperCase()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Pricing & Actions */}
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
                      <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Giá mỗi đêm</div>
                        <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                          {formatVND(roomType.basePrice)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <Link
                          href={`/rooms/${roomType.slug}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.625rem 1.125rem',
                            backgroundColor: 'transparent',
                            color: 'var(--color-primary)',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            textDecoration: 'none',
                          }}
                        >
                          <Eye size={16} />
                          <span>Chi tiết</span>
                        </Link>

                        <Link
                          href={`/booking?roomType=${roomType.slug}&checkIn=${checkInStr}&checkOut=${checkOutStr}&adults=${adultsNum}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.625rem 1.375rem',
                            backgroundColor: isAvailable ? 'var(--color-primary)' : 'var(--color-text-light)',
                            color: 'var(--color-text-inverse)',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            textDecoration: 'none',
                            pointerEvents: isAvailable ? 'auto' : 'none',
                            transition: 'background var(--transition-fast)',
                          }}
                        >
                          <span>{isAvailable ? 'Đặt phòng ngay' : 'Tạm hết phòng'}</span>
                          <ArrowRight size={16} />
                        </Link>
                      </div>
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
