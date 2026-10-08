'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: '#0a3036',
        color: '#e5e7eb',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '4rem',
        paddingBottom: '2.5rem',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Col 1: Brand Info */}
          <div>
            <div className="serif-heading" style={{ fontSize: '1.75rem', color: '#ffffff', marginBottom: '0.5rem' }}>
              Khách Sạn Sông Ngọc
            </div>
            <p style={{ fontSize: '0.875rem', color: '#9ca3af', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Trải nghiệm kỳ nghỉ thư thái với tầm nhìn ôm trọn dòng Sông Ngọc thanh bình. Không gian nghỉ dưỡng đẳng cấp kết hợp dịch vụ hiếu khách chuẩn mực.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', fontSize: '0.875rem', fontWeight: 600 }}>
              <ShieldCheck size={18} />
              <span>Thanh toán Napas247 Bảo Mật & Tiện Lợi</span>
            </div>
          </div>

          {/* Col 2: Contact Info */}
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Thông Tin Liên Hệ
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.875rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', color: '#cbd5e1' }}>
                <MapPin size={18} style={{ color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }} />
                <span>Số 128 Đường Ven Sông, Phường Cẩm Nam, TP. Hội An</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1' }}>
                <Phone size={18} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                <span>Hotline: 0901.234.567</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#cbd5e1' }}>
                <Mail size={18} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                <span>contact@songngoc.vn</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Checkin Policy */}
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Thời Gian Nhận / Trả Phòng
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={18} style={{ color: 'var(--color-accent)' }} />
                <span>Nhận phòng (Check-in): <strong>từ 14:00</strong></span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={18} style={{ color: 'var(--color-accent)' }} />
                <span>Trả phòng (Check-out): <strong>trước 12:00</strong></span>
              </li>
            </ul>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '1rem', lineHeight: 1.5 }}>
              * Quý khách có nhu cầu nhận phòng sớm hoặc trả phòng muộn vui lòng thông báo trước với lễ tân để được sắp xếp theo tình trạng phòng.
            </p>
          </div>

          {/* Col 4: Quick Links */}
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Liên Kết Nhanh
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
              <li>
                <Link href="/" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Trang chủ</Link>
              </li>
              <li>
                <Link href="/rooms" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Danh sách phòng & Giá</Link>
              </li>
              <li>
                <Link href="/track" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Tra cứu đơn đặt phòng</Link>
              </li>
              <li>
                <Link href="/login" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Cổng thông tin Lễ tân (PMS)</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            fontSize: '0.8125rem',
            color: '#9ca3af',
          }}
        >
          <div>© 2026 Sông Ngọc Hotel. Bản quyền thuộc về Khách Sạn Sông Ngọc.</div>
          <div>Hệ thống Quản lý Khách sạn Chuẩn mực & Tinh gọn</div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
