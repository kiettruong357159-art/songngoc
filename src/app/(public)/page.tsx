import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatVND } from '@/lib/utils';
import { FloatingBookingBar } from '@/components/booking/FloatingBookingBar';
import { Badge } from '@/components/ui/Badge';
import { Wifi, Sparkles, Coffee, ShieldCheck, MapPin, ArrowRight, Bed, Maximize2 } from 'lucide-react';

export const revalidate = 60; // ISR cache

export default async function HomePage() {
  // Lấy danh sách hạng phòng từ cơ sở dữ liệu
  let roomTypes: any[] = [];
  try {
    roomTypes = await db.roomType.findMany({
      where: { isActive: true },
      include: {
        rooms: {
          where: { status: { not: 'MAINTENANCE' } },
        },
      },
      orderBy: { basePrice: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching room types:', error);
  }

  return (
    <div>
      {/* 1. HERO BANNER - 65vh BOUTIQUE LUXURY (Phương án A) */}
      <section
        style={{
          position: 'relative',
          height: '65vh',
          minHeight: '480px',
          maxHeight: '680px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `linear-gradient(rgba(15, 91, 102, 0.72), rgba(10, 67, 75, 0.85)), url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=85')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#ffffff',
          textAlign: 'center',
          padding: '0 1.5rem',
        }}
      >
        <div style={{ maxWidth: '850px', zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.35rem 1rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(196, 154, 69, 0.25)',
              border: '1px solid var(--color-accent)',
              color: '#fef3c7',
              fontSize: '0.8125rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
            }}
          >
            <Sparkles size={14} />
            Homestay Nghỉ Dưỡng Ấm Cúng Tại Phan Thiết
          </div>

          <h1
            className="serif-heading"
            style={{
              fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)',
              lineHeight: 1.15,
              marginBottom: '1rem',
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
            }}
          >
            Kỳ Nghỉ Thư Thái Tại Homestay Song Ngọc Phan Thiết
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.8vw, 1.2rem)',
              color: '#e5e7eb',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: 1.6,
              fontWeight: 400,
            }}
          >
            Không gian nghỉ dưỡng ấm cúng, tọa lạc tại 307/2 Thủ Khoa Huân, trung tâm Phan Thiết, chỉ vài phút đến bãi biển Đồi Dương và chợ hải sản tươi sống.
          </p>
        </div>
      </section>

      {/* 2. FLOATING BOOKING BAR (Ghim giữa Hero và nội dung) */}
      <div style={{ marginTop: '-42px', position: 'relative', zIndex: 10, padding: '0 1rem' }}>
        <FloatingBookingBar />
      </div>

      {/* 3. FEATURED ROOMS GRID (Lưới phòng nghỉ nổi bật) */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--color-bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem' }}>
            <span
              style={{
                color: 'var(--color-accent)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
              }}
            >
              Không Gian Nghỉ Dưỡng
            </span>
            <h2
              className="serif-heading"
              style={{
                fontSize: '2.35rem',
                color: 'var(--color-primary)',
                marginTop: '0.5rem',
                marginBottom: '0.75rem',
              }}
            >
              Các Hạng Phòng Tiêu Biểu
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.975rem' }}>
              Mỗi căn phòng tại Homestay Song Ngọc được bài trí ấm cúng, tinh tế, đầy đủ tiện nghi cho gia đình và nhóm bạn.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            {roomTypes.map((roomType) => {
              let images: string[] = [];
              try {
                images = JSON.parse(roomType.images);
              } catch {
                images = ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'];
              }

              return (
                <div
                  key={roomType.id}
                  className="glass-panel"
                  style={{
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
                    backgroundColor: 'var(--color-surface)',
                  }}
                >
                  {/* Ảnh phòng */}
                  <div
                    style={{
                      height: '240px',
                      position: 'relative',
                      backgroundImage: `url(${images[0]})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        display: 'flex',
                        gap: '0.5rem',
                      }}
                    >
                      <Badge variant="accent">
                        {roomType.slug === 'deluxe-double' ? 'Ban Công' : 'Best Seller'}
                      </Badge>
                    </div>
                  </div>

                  {/* Nội dung card */}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                      <h3
                        className="serif-heading"
                        style={{ fontSize: '1.35rem', color: 'var(--color-primary)' }}
                      >
                        {roomType.name}
                      </h3>
                    </div>

                    <p
                      style={{
                        fontSize: '0.875rem',
                        color: 'var(--color-text-muted)',
                        lineHeight: 1.5,
                        marginBottom: '1.25rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {roomType.description}
                    </p>

                    {/* Tiện nghi phòng cơ bản */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.25rem',
                        padding: '0.75rem 0',
                        borderTop: '1px solid var(--color-border)',
                        borderBottom: '1px solid var(--color-border)',
                        marginBottom: '1.25rem',
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Maximize2 size={15} style={{ color: 'var(--color-primary)' }} />
                        <span>{roomType.roomArea} m²</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Bed size={15} style={{ color: 'var(--color-primary)' }} />
                        <span>{roomType.bedType}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                        <Wifi size={15} style={{ color: 'var(--color-primary)' }} />
                        <span>Wifi 6</span>
                      </div>
                    </div>

                    {/* Mức giá và CTA */}
                    <div
                      style={{
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                          Chỉ từ
                        </div>
                        <div
                          style={{
                            fontSize: '1.3rem',
                            fontWeight: 700,
                            color: 'var(--color-primary)',
                          }}
                        >
                          {formatVND(roomType.basePrice)}
                          <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>
                            /đêm
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/rooms/${roomType.slug}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '0.625rem 1.125rem',
                          backgroundColor: 'var(--color-primary)',
                          color: 'var(--color-text-inverse)',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          textDecoration: 'none',
                          transition: 'background var(--transition-fast)',
                        }}
                      >
                        <span>Đặt phòng</span>
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '3rem' }}>
            <Link
              href="/rooms"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.75rem',
                border: '1px solid var(--color-primary)',
                color: 'var(--color-primary)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                fontSize: '0.925rem',
                textDecoration: 'none',
                backgroundColor: 'transparent',
              }}
            >
              <span>Xem tất cả hạng phòng & bảng giá chi tiết</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. HOTEL HIGHLIGHTS / TIỆN ÍCH */}
      <section style={{ padding: '4.5rem 0', backgroundColor: 'var(--color-surface)', borderTop: '1px solid var(--color-border)' }}>
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2.5rem',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <MapPin size={26} />
              </div>
              <h4 className="serif-heading" style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                Vị Trí Trung Tâm Phan Thiết
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                307/2 Thủ Khoa Huân, P. Phú Thủy; gần bãi biển Đồi Dương, bảo tàng Hồ Chí Minh và công viên trung tâm.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-accent-light)',
                  color: 'var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <Coffee size={26} />
              </div>
              <h4 className="serif-heading" style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                Bếp Nấu Hải Sản & BBQ Ngoài Trời
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Không gian bếp chung đầy đủ gia vị dụng cụ để bạn tự tay chế biến hải sản tươi sống và tổ chức tiệc BBQ ấm cúng.
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.25rem',
                }}
              >
                <ShieldCheck size={26} />
              </div>
              <h4 className="serif-heading" style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                Đặt Cọc VietQR Tức Thì
              </h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Thanh toán giữ phòng tiện lợi qua mã Napas247, xác nhận đơn tự động và bảo mật tuyệt đối.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
