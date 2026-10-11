import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getCachedRoomTypeBySlug } from '@/lib/cached-queries';
import { formatVND } from '@/lib/utils';
import { SafeImage } from '@/components/ui/SafeImage';
import { Badge } from '@/components/ui/Badge';
import {
  Bed,
  Maximize2,
  Users,
  Wifi,
  Tv,
  Wind,
  Droplets,
  Calendar,
  Check,
  ShieldCheck,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

interface RoomDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: RoomDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const roomType = await getCachedRoomTypeBySlug(slug);

  if (!roomType) {
    return {
      title: 'Hạng Phòng Không Tồn Tại | Homestay Song Ngọc',
    };
  }

  return {
    title: `${roomType.name} | Homestay Song Ngọc Phan Thiết`,
    description: roomType.description.slice(0, 160),
    openGraph: {
      title: `${roomType.name} - Giá từ ${formatVND(roomType.basePrice)}/đêm`,
      description: roomType.description.slice(0, 160),
    },
  };
}

export default async function RoomDetailPage({ params }: RoomDetailPageProps) {
  const { slug } = await params;

  const roomType = await getCachedRoomTypeBySlug(slug);

  if (!roomType) {
    notFound();
  }

  let images: string[] = [];
  let amenities: string[] = [];
  try {
    images = JSON.parse(roomType.images);
  } catch {
    images = ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'];
  }
  try {
    amenities = JSON.parse(roomType.amenities);
  } catch {
    amenities = ['wifi', 'air_con', 'tv_smart', 'hot_water'];
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: '3.5rem 0 5rem' }}>
      <div className="container">
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          <Link href="/" style={{ color: 'var(--color-primary)' }}>Trang chủ</Link>
          <span>/</span>
          <Link href="/rooms" style={{ color: 'var(--color-primary)' }}>Hạng phòng</Link>
          <span>/</span>
          <span>{roomType.name}</span>
        </div>

        {/* Room Header Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Badge variant="accent">Hạng phòng cao cấp</Badge>
              <Badge variant="primary">Không gian thoáng mát</Badge>
            </div>
            <h1 className="serif-heading" style={{ fontSize: '2.5rem', color: 'var(--color-primary)' }}>
              {roomType.name}
            </h1>
          </div>

          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Giá niêm yết mỗi đêm</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--color-primary)' }}>
              {formatVND(roomType.basePrice)}
            </div>
          </div>
        </div>

        {/* Photo Gallery Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            marginBottom: '3rem',
          }}
        >
          {images.map((img, idx) => (
            <div
              key={idx}
              style={{
                position: 'relative',
                height: '380px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}
            >
              <SafeImage
                src={img}
                alt={`${roomType.name} - Ảnh ${idx + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={idx === 0}
              />
            </div>
          ))}
        </div>

        {/* Main Content & Booking Sidebar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'flex-start',
          }}
        >
          {/* Left Details */}
          <div>
            <h2 className="serif-heading" style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
              Mô Tả Không Gian & Tiện Nghi
            </h2>
            <p style={{ color: 'var(--color-text)', lineHeight: 1.8, fontSize: '1rem', marginBottom: '2rem' }}>
              {roomType.description}
            </p>

            {/* Room Features */}
            <div
              className="glass-panel"
              style={{
                padding: '1.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2.5rem',
              }}
            >
              <div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>Diện tích phòng</div>
                <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Maximize2 size={18} />
                  <span>{roomType.roomArea} m²</span>
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>Loại giường</div>
                <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Bed size={18} />
                  <span>{roomType.bedType}</span>
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>Số lượng khách</div>
                <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Users size={18} />
                  <span>{roomType.maxAdults} Lớn + {roomType.maxChildren} Trẻ</span>
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>Giá cuối tuần</div>
                <div style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Sparkles size={18} />
                  <span>{roomType.weekendPrice ? formatVND(roomType.weekendPrice) : formatVND(roomType.basePrice)}</span>
                </div>
              </div>
            </div>

            {/* Amenities list */}
            <h3 className="serif-heading" style={{ fontSize: '1.35rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
              Trang Thiết Bị Tiêu Chuẩn
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2.5rem',
              }}
            >
              {amenities.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.625rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    color: 'var(--color-text)',
                  }}
                >
                  <Check size={18} style={{ color: 'var(--color-room-available)' }} />
                  <span>{item.replace('_', ' ').toUpperCase()}</span>
                </div>
              ))}
            </div>

            {/* Hotel Policies */}
            <h3 className="serif-heading" style={{ fontSize: '1.35rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
              Chính Sách Khách Sạn & Nhận Phòng
            </h3>
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                fontSize: '0.9rem',
                color: 'var(--color-text-muted)',
                lineHeight: 1.7,
              }}
            >
              <p>• Nhận phòng từ <strong>14:00</strong> và trả phòng trước <strong>12:00</strong>.</p>
              <p>• Quý khách vui lòng xuất trình CCCD hoặc Hộ chiếu khi làm thủ tục nhận phòng tại quầy.</p>
              <p>• Thanh toán đặt cọc tiện lợi và nhanh chóng bằng mã <strong>VietQR Napas247</strong>.</p>
              <p>• Không hút thuốc trong phòng nghỉ nhằm đảm bảo không khí trong lành cho kỳ nghỉ của quý khách.</p>
            </div>
          </div>

          {/* Right Floating Booking Box */}
          <div
            className="glass-panel"
            style={{
              padding: '2rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface)',
              boxShadow: 'var(--shadow-lg)',
              position: 'sticky',
              top: '96px',
            }}
          >
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '1.25rem' }}>
              Đặt Phòng Ngay
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.925rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Giá ngày thường:</span>
                <span style={{ fontWeight: 600 }}>{formatVND(roomType.basePrice)}/đêm</span>
              </div>
              {roomType.weekendPrice && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.925rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Giá cuối tuần (T6, T7):</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>{formatVND(roomType.weekendPrice)}/đêm</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.925rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Sức chứa tiêu chuẩn:</span>
                <span style={{ fontWeight: 600 }}>{roomType.maxAdults} người lớn</span>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--color-primary-light)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                fontSize: '0.8125rem',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <ShieldCheck size={20} style={{ flexShrink: 0 }} />
              <span>Cam kết giá tốt nhất khi đặt trực tiếp trên website Homestay Song Ngọc Phan Thiết.</span>
            </div>

            <Link
              href={`/booking?roomType=${roomType.slug}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                padding: '0.875rem 1.5rem',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-text-inverse)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 700,
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: 'var(--shadow-md)',
                transition: 'background var(--transition-fast)',
              }}
            >
              <span>Tiến hành đặt phòng</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
