'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Users, Phone, User, Mail, CreditCard, QrCode, ShieldCheck, ArrowRight } from 'lucide-react';
import { CustomSelect, SelectOption } from '@/components/ui/CustomSelect';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import { formatVND } from '@/lib/utils';
import { calculateNights } from '@/lib/pricing';

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [adults, setAdults] = useState('1');
  const [children, setChildren] = useState('0');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COUNTER' | 'VIETQR'>('VIETQR');

  // Load room types
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/booking/availability');
        const json = await res.json();
        if (json.success) {
          setRoomTypes(json.data);

          // Prefill room type from query param
          const roomSlug = searchParams.get('roomType');
          if (roomSlug) {
            const found = json.data.find((rt: any) => rt.slug === roomSlug);
            if (found) setSelectedRoomTypeId(found.id);
          } else if (json.data.length > 0) {
            setSelectedRoomTypeId(json.data[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Default dates from query or fallback
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const dayAfter = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
    setCheckIn(searchParams.get('checkIn') || tomorrow);
    setCheckOut(searchParams.get('checkOut') || dayAfter);
    setAdults(searchParams.get('adults') || '2');
    setChildren(searchParams.get('children') || '0');
  }, [searchParams]);

  const selectedRoomType = roomTypes.find((rt) => rt.id === selectedRoomTypeId);

  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 1;
  const basePrice = selectedRoomType ? selectedRoomType.basePrice || 450000 : 450000;
  const totalAmount = nights * basePrice;
  const depositAmount = paymentMethod === 'VIETQR' ? Math.max(200000, Math.round((totalAmount * 0.3) / 1000) * 1000) : 0;

  const roomSelectOptions: SelectOption[] = roomTypes.map((rt) => ({
    value: rt.id,
    label: `${rt.name} - ${formatVND(rt.basePrice || 450000)}/đêm`,
    sublabel: `Sức chứa ${rt.maxAdults || 2} người lớn`,
  }));

  const adultOptions: SelectOption[] = [
    { value: '1', label: '1 Người lớn' },
    { value: '2', label: '2 Người lớn' },
    { value: '3', label: '3 Người lớn' },
    { value: '4', label: '4 Người lớn' },
  ];

  const childOptions: SelectOption[] = [
    { value: '0', label: '0 Trẻ em' },
    { value: '1', label: '1 Trẻ em' },
    { value: '2', label: '2 Trẻ em' },
    { value: '3', label: '3 Trẻ em' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !selectedRoomTypeId) {
      toast.error('Vui lòng điền họ tên, số điện thoại và chọn hạng phòng');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          email,
          roomTypeId: selectedRoomTypeId,
          checkIn,
          checkOut,
          adults: parseInt(adults, 10),
          children: parseInt(children, 10),
          specialRequests,
          paymentMethod,
        }),
      });

      const json = await res.json();
      if (json.success) {
        toast.success('Đặt phòng thành công!');
        router.push(
          `/booking/confirmation?code=${json.data.bookingCode}&deposit=${json.data.depositAmount}&qr=${encodeURIComponent(
            json.data.vietqrUrl || ''
          )}`
        );
      } else {
        toast.error(json.error || 'Đặt phòng không thành công');
      }
    } catch (err: any) {
      toast.error('Không thể kết nối đến máy chủ. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh', padding: '3.5rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span
            style={{
              color: 'var(--color-accent)',
              fontWeight: 700,
              fontSize: '0.8125rem',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
            }}
          >
            Đặt Phòng Trực Tuyến
          </span>
          <h1 className="serif-heading" style={{ fontSize: '2.5rem', color: 'var(--color-primary)', marginTop: '0.5rem' }}>
            Thông Tin Đặt Phòng Nghỉ
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Quý khách vui lòng kiểm tra thông tin thời gian lưu trú và điền biểu mẫu liên hệ bên dưới.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2.5rem',
              alignItems: 'flex-start',
            }}
          >
            {/* Left Column: Guest info & Stay Details */}
            <div
              className="glass-panel"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              <h2 className="serif-heading" style={{ fontSize: '1.35rem', color: 'var(--color-primary)' }}>
                1. Thông Tin Khách Lưu Trú
              </h2>

              {/* Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.375rem' }}>
                  Họ và tên quý khách <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem 0.625rem 2.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      outline: 'none',
                    }}
                  />
                  <User size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                </div>
              </div>

              {/* Phone & Email */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.375rem' }}>
                    Số điện thoại <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0901234567"
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.875rem 0.625rem 2.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        outline: 'none',
                      }}
                    />
                    <Phone size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.375rem' }}>
                    Email xác nhận
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@vidu.com"
                      style={{
                        width: '100%',
                        padding: '0.625rem 0.875rem 0.625rem 2.25rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        outline: 'none',
                      }}
                    />
                    <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                  </div>
                </div>
              </div>

              <h2 className="serif-heading" style={{ fontSize: '1.35rem', color: 'var(--color-primary)', marginTop: '0.5rem' }}>
                2. Lựa Chọn Hạng Phòng & Ngày Lưu Trú
              </h2>

              {/* Room Type Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.375rem' }}>
                  Hạng phòng mong muốn <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <CustomSelect
                  options={roomSelectOptions}
                  value={selectedRoomTypeId}
                  onChange={(val) => setSelectedRoomTypeId(val)}
                  placeholder="Chọn hạng phòng..."
                />
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.375rem' }}>
                    Nhận phòng (14:00)
                  </label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.375rem' }}>
                    Trả phòng (12:00)
                  </label>
                  <input
                    type="date"
                    required
                    value={checkOut}
                    min={checkIn}
                    onChange={(e) => setCheckOut(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.875rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Guests */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.375rem' }}>
                    Người lớn
                  </label>
                  <CustomSelect
                    options={adultOptions}
                    value={adults}
                    onChange={(val) => setAdults(val || '1')}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.375rem' }}>
                    Trẻ em
                  </label>
                  <CustomSelect
                    options={childOptions}
                    value={children}
                    onChange={(val) => setChildren(val || '0')}
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.375rem' }}>
                  Yêu cầu đặc biệt (tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Ví dụ: Phòng tầng cao yên tĩnh, chuẩn bị nôi em bé..."
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.875rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>

            {/* Right Column: Payment Method & Summary */}
            <div
              className="glass-panel"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                boxShadow: 'var(--shadow-lg)',
                position: 'sticky',
                top: '96px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              <h2 className="serif-heading" style={{ fontSize: '1.35rem', color: 'var(--color-primary)' }}>
                3. Chi Tiết Giá & Thanh Toán
              </h2>

              {/* Price Calculation Card */}
              <div style={{ backgroundColor: 'var(--color-bg)', padding: '1.25rem', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Hạng phòng:</span>
                  <span style={{ fontWeight: 600 }}>{selectedRoomType ? selectedRoomType.name : 'Chưa chọn'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Thời gian:</span>
                  <span style={{ fontWeight: 600 }}>{nights} đêm ({checkIn} → {checkOut})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Đơn giá:</span>
                  <span>{formatVND(basePrice)}/đêm</span>
                </div>
                <div style={{ height: '1px', backgroundColor: 'var(--color-border)', margin: '0.25rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>Tổng tiền phòng:</span>
                  <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                    {formatVND(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.75rem' }}>
                  Chọn Phương Thức Giữ Chỗ
                </label>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {/* VietQR Napas247 Option */}
                  <div
                    onClick={() => setPaymentMethod('VIETQR')}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${paymentMethod === 'VIETQR' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: paymentMethod === 'VIETQR' ? 'var(--color-primary-light)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <QrCode size={22} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.925rem' }}>
                        Chuyển khoản VietQR Napas247 (Khuyên dùng)
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                        Đặt cọc giữ phòng trước <strong>{formatVND(depositAmount || 200000)}</strong>. Quét mã QR tức thì qua mọi app ngân hàng.
                      </div>
                    </div>
                  </div>

                  {/* Counter Option */}
                  <div
                    onClick={() => setPaymentMethod('COUNTER')}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `2px solid ${paymentMethod === 'COUNTER' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      backgroundColor: paymentMethod === 'COUNTER' ? 'var(--color-primary-light)' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <CreditCard size={22} style={{ color: 'var(--color-primary)', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.925rem' }}>
                        Thanh toán khi nhận phòng tại quầy
                      </div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                        Thanh toán toàn bộ 100% bằng tiền mặt hoặc thẻ tại quầy lễ tân.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={submitting}
                rightIcon={<ArrowRight size={18} />}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-primary)',
                  fontWeight: 700,
                }}
              >
                {paymentMethod === 'VIETQR' ? 'Tiếp tục & Lấy mã VietQR' : 'Xác nhận đặt phòng ngay'}
              </Button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                <ShieldCheck size={16} style={{ color: 'var(--color-room-available)' }} />
                <span>Không phát sinh phí ẩn. Hỗ trợ 24/7 qua 0901.234.567</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
