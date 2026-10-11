'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Copy, Check, QrCode, Search, Home, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatVND } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const code = searchParams.get('code') || 'BK-202610-0000';
  const deposit = parseInt(searchParams.get('deposit') || '0', 10);
  const qrUrl = searchParams.get('qr');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Đã sao chép mã đặt phòng!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: '4rem 1.5rem 6rem' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        <div
          className="glass-panel"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-xl)',
            textAlign: 'center',
          }}
        >
          {/* Success Icon */}
          <div
            style={{
              width: '68px',
              height: '68px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-room-available-bg)',
              color: 'var(--color-room-available)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <CheckCircle2 size={36} />
          </div>

          <h1 className="serif-heading" style={{ fontSize: '2.2rem', color: 'var(--color-primary)', marginBottom: '0.75rem' }}>
            Đặt Phòng Thành Công!
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Cảm ơn quý khách đã tin chọn Homestay Song Ngọc Phan Thiết. Đơn đặt phòng của quý khách đã được ghi nhận trên hệ thống.
          </p>

          {/* Booking Code Banner */}
          <div
            style={{
              backgroundColor: 'var(--color-bg)',
              border: '2px dashed var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Mã Đặt Phòng Của Quý Khách
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary)', letterSpacing: '0.05em' }}>
                {code}
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check size={16} /> : <Copy size={16} />}
            >
              {copied ? 'Đã sao chép' : 'Sao chép mã'}
            </Button>
          </div>

          {/* VietQR Payment Section (if deposit chosen) */}
          {deposit > 0 && qrUrl && (
            <div
              style={{
                backgroundColor: 'var(--color-primary-light)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem 1.5rem',
                marginBottom: '2rem',
                border: '1px solid #c8e3e7',
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-primary)', fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>
                <QrCode size={20} />
                <span>Thanh Toán Đặt Cọc VietQR Napas247</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                Quý khách vui lòng quét mã bên dưới để hoàn tất đặt cọc <strong>{formatVND(deposit)}</strong>. Hệ thống sẽ tự động đối soát giữ phòng cho quý khách.
              </p>

              {/* Dynamic QR Image */}
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: '#ffffff',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-md)',
                  marginBottom: '1rem',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={decodeURIComponent(qrUrl)}
                  alt="Mã VietQR Đặt Cọc"
                  style={{
                    width: '280px',
                    height: 'auto',
                    display: 'block',
                    borderRadius: 'var(--radius-sm)',
                  }}
                />
              </div>

              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                Nội dung chuyển khoản mặc định: <strong>{code}</strong>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`/track?code=${code}`}>
              <Button variant="secondary" size="md" leftIcon={<Search size={16} />}>
                Tra cứu tiến độ đơn
              </Button>
            </Link>

            <Link href="/">
              <Button variant="primary" size="md" leftIcon={<Home size={16} />}>
                Về trang chủ
              </Button>
            </Link>
          </div>

          <div style={{ marginTop: '2.5rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
            <Phone size={14} />
            <span>Cần hỗ trợ gấp? Gọi ngay hotline: <strong>0962.103.737</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div style={{ padding: '5rem', textAlign: 'center' }}>Đang tải thông tin xác nhận...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
