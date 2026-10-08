'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  UserPlus, 
  Bed, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  ArrowLeft,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { formatVND, calculateNights } from '@/lib/utils';
import { calculateBookingPricing } from '@/lib/pricing';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import Button from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

interface RoomTypeOption {
  id: string;
  name: string;
  basePrice: number;
  maxAdults: number;
}

interface RoomOption {
  id: string;
  roomNumber: string;
  roomTypeId: string;
  floorName: string;
}

function CheckinFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedRoomId = searchParams.get('roomId') || '';

  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [roomTypes, setRoomTypes] = useState<RoomTypeOption[]>([]);
  const [availableRooms, setAvailableRooms] = useState<RoomOption[]>([]);

  // Form Fields
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [idCard, setIdCard] = useState('');
  const [email, setEmail] = useState('');

  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState(preselectedRoomId);

  // Default dates: today and tomorrow
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }, []);

  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const [depositAmount, setDepositAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [specialRequests, setSpecialRequests] = useState('');

  // Tải danh sách phòng và loại phòng
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/rooms');
        const data = await res.json();
        if (data.success && Array.isArray(data.floors)) {
          const rTypesMap = new Map<string, RoomTypeOption>();
          const availRooms: RoomOption[] = [];

          data.floors.forEach((fl: any) => {
            fl.rooms.forEach((r: any) => {
              if (!rTypesMap.has(r.roomType.id)) {
                rTypesMap.set(r.roomType.id, {
                  id: r.roomType.id,
                  name: r.roomType.name,
                  basePrice: r.roomType.basePrice,
                  maxAdults: 2,
                });
              }

              if (r.status === 'AVAILABLE' || r.id === preselectedRoomId) {
                availRooms.push({
                  id: r.id,
                  roomNumber: r.roomNumber,
                  roomTypeId: r.roomType.id,
                  floorName: fl.name,
                });
              }
            });
          });

          const rTypesArray = Array.from(rTypesMap.values());
          setRoomTypes(rTypesArray);
          setAvailableRooms(availRooms);

          if (preselectedRoomId) {
            const found = availRooms.find((r) => r.id === preselectedRoomId);
            if (found) {
              setSelectedRoomTypeId(found.roomTypeId);
              setSelectedRoomId(found.id);
            }
          } else if (rTypesArray.length > 0) {
            setSelectedRoomTypeId(rTypesArray[0].id);
          }
        }
      } catch (err) {
        console.error(err);
        showToast('Không thể tải danh sách phòng', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [preselectedRoomId, showToast]);

  // Lọc phòng trống theo loại phòng đã chọn
  const filteredRooms = useMemo(() => {
    if (!selectedRoomTypeId) return availableRooms;
    return availableRooms.filter((r) => r.roomTypeId === selectedRoomTypeId);
  }, [availableRooms, selectedRoomTypeId]);

  // Cập nhật selectedRoomId khi danh sách lọc thay đổi nếu phòng hiện tại không thuộc loại phòng mới
  useEffect(() => {
    if (filteredRooms.length > 0) {
      const isCurrentValid = filteredRooms.some((r) => r.id === selectedRoomId);
      if (!isCurrentValid) {
        setSelectedRoomId(filteredRooms[0].id);
      }
    } else {
      setSelectedRoomId('');
    }
  }, [filteredRooms, selectedRoomId]);

  // Tính toán giá phòng
  const currentRoomType = roomTypes.find((rt) => rt.id === selectedRoomTypeId);
  const nights = useMemo(() => {
    try {
      return calculateNights(new Date(checkIn), new Date(checkOut));
    } catch {
      return 1;
    }
  }, [checkIn, checkOut]);

  const pricing = useMemo(() => {
    if (!currentRoomType) return { totalRoomAmount: 0, nights };
    return calculateBookingPricing({
      basePrice: currentRoomType.basePrice,
      nights,
    });
  }, [currentRoomType, nights]);

  const remainingAtCheckout = Math.max(0, pricing.totalRoomAmount - depositAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName.trim()) {
      showToast('Vui lòng nhập họ tên khách hàng', 'error');
      return;
    }
    if (!phone.trim()) {
      showToast('Vui lòng nhập số điện thoại khách hàng', 'error');
      return;
    }
    if (!selectedRoomId) {
      showToast('Vui lòng chọn phòng trống để nhận phòng', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName,
          phone,
          idCard,
          email,
          roomTypeId: selectedRoomTypeId,
          roomId: selectedRoomId,
          checkIn,
          checkOut,
          adults,
          children,
          depositAmount,
          paymentMethod,
          specialRequests,
          status: 'CHECKED_IN',
        }),
      });

      const data = await res.json();
      if (data.success && data.booking) {
        showToast(`Nhận phòng thành công cho đơn ${data.booking.bookingCode}!`, 'success');
        router.push('/admin/rooms');
      } else {
        showToast(data.error || 'Nhận phòng thất bại', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi gửi yêu cầu nhận phòng', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const roomTypeSelectOptions: SelectOption[] = roomTypes.map((rt) => ({
    value: rt.id,
    label: `${rt.name} (${formatVND(rt.basePrice)}/đêm)`,
  }));

  const roomSelectOptions: SelectOption[] = filteredRooms.map((r) => ({
    value: r.id,
    label: `Phòng ${r.roomNumber} (${r.floorName})`,
  }));

  const paymentOptions: SelectOption[] = [
    { value: 'CASH', label: 'Tiền mặt' },
    { value: 'VIETQR', label: 'Chuyển khoản VietQR Napas247' },
    { value: 'CARD', label: 'Quẹt thẻ POS' },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <Sparkles size={36} className="animate-spin" style={{ color: 'var(--color-primary)', margin: '0 auto 1rem' }} />
        <p style={{ color: 'var(--color-text-muted)' }}>Đang chuẩn bị quầy tiếp tân...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* Top Breadcrumb & Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          type="button"
          onClick={() => router.back()}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="serif-heading" style={{ fontSize: '1.875rem', color: 'var(--color-primary)' }}>
            Quầy Nhận Phòng Tại Chỗ (Walk-in Check-in)
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            Tiếp đón khách trực tiếp tại quầy lễ tân, gán phòng và nhận cọc nhanh chóng.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Section 1: Guest Information */}
          <div
            className="glass-panel"
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <UserPlus size={20} style={{ color: 'var(--color-primary)' }} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                1. Thông tin khách lưu trú
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Họ và tên khách hàng <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Số điện thoại <span style={{ color: 'var(--color-error)' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0912 345 678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Số CCCD / Hộ chiếu
                  </label>
                  <input
                    type="text"
                    placeholder="07920100..."
                    value={idCard}
                    onChange={(e) => setIdCard(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Email (tùy chọn)
                </label>
                <input
                  type="email"
                  placeholder="khachhang@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Ghi chú hoặc yêu cầu đặc biệt
                </label>
                <textarea
                  rows={2}
                  placeholder="Yêu cầu tầng cao, giường thêm chăn ấm..."
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Room Selection & Schedule */}
          <div
            className="glass-panel"
            style={{
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Bed size={20} style={{ color: 'var(--color-primary)' }} />
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                2. Chọn phòng & Thời gian lưu trú
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Hạng phòng <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <CustomSelect
                  options={roomTypeSelectOptions}
                  value={selectedRoomTypeId}
                  onChange={(val) => setSelectedRoomTypeId(val)}
                  placeholder="Chọn hạng phòng..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Số phòng trống <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                {filteredRooms.length === 0 ? (
                  <div
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      color: 'var(--color-error)',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>Hạng phòng này hiện không còn phòng trống sẵn sàng.</span>
                  </div>
                ) : (
                  <CustomSelect
                    options={roomSelectOptions}
                    value={selectedRoomId}
                    onChange={(val) => setSelectedRoomId(val)}
                    placeholder="Chọn số phòng..."
                  />
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Ngày nhận phòng
                  </label>
                  <input
                    type="date"
                    required
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Ngày trả phòng
                  </label>
                  <input
                    type="date"
                    required
                    min={checkIn}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Số người lớn
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={adults}
                    onChange={(e) => setAdults(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Số trẻ em
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={children}
                    onChange={(e) => setChildren(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Billing Formula & Settlement */}
        <div
          className="glass-panel"
          style={{
            marginTop: '1.5rem',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <CreditCard size={20} style={{ color: 'var(--color-primary)' }} />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              3. Dự tính chi phí & Đặt cọc
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {/* Calculation summary */}
            <div
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                CÔNG THỨC TÍNH TIỀN PHÒNG
              </div>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                {formatVND(currentRoomType?.basePrice || 0)} × {nights} đêm = <strong>{formatVND(pricing.totalRoomAmount)}</strong>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                (Công thức: [Đơn giá ngày thường: {formatVND(currentRoomType?.basePrice || 0)}] × [Số đêm: {nights}] -&gt; {formatVND(pricing.totalRoomAmount)})
              </div>

              <div style={{ borderTop: '1px dashed var(--color-border)', marginTop: '0.75rem', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                  <span>Tổng tiền phòng:</span>
                  <strong>{formatVND(pricing.totalRoomAmount)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', color: 'var(--color-success)' }}>
                  <span>Khách cọc trước:</span>
                  <strong>{formatVND(depositAmount)}</strong>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: 'var(--color-primary)',
                    marginTop: '0.5rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid var(--color-border)',
                  }}
                >
                  <span>Còn lại khi Check-out:</span>
                  <span>{formatVND(remainingAtCheckout)}</span>
                </div>
              </div>
            </div>

            {/* Deposit Input & Payment Mode */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Tiền cọc nhận tại quầy (VNĐ)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    style={{
                      flex: 1,
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      backgroundColor: 'var(--color-bg)',
                      color: 'var(--color-text)',
                      fontWeight: 700,
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDepositAmount(Math.round(pricing.totalRoomAmount / 2))}
                  >
                    Cọc 50%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDepositAmount(pricing.totalRoomAmount)}
                  >
                    100%
                  </Button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Phương thức thanh toán cọc
                </label>
                <CustomSelect
                  options={paymentOptions}
                  value={paymentMethod}
                  onChange={(val) => setPaymentMethod(val)}
                />
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  loading={submitting}
                  disabled={!selectedRoomId || filteredRooms.length === 0}
                  style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <CheckCircle size={20} />
                  <span>Xác Nhận & Nhận Phòng (Check-in Ngay)</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function AdminCheckinPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Đang tải quầy tiếp tân...</div>}>
      <CheckinFormContent />
    </Suspense>
  );
}
