'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Users, Search } from 'lucide-react';
import { CustomSelect, SelectOption } from '../ui/CustomSelect';
import { Button } from '../ui/Button';
import { DatePicker } from '../ui/DateTimePicker';

export interface FloatingBookingBarProps {
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialAdults?: string;
  initialChildren?: string;
  className?: string;
}

export const FloatingBookingBar: React.FC<FloatingBookingBarProps> = ({
  initialCheckIn,
  initialCheckOut,
  initialAdults = '2',
  initialChildren = '0',
  className = '',
}) => {
  const router = useRouter();

  // Mặc định: ngày mai nhận phòng, ngày kia trả phòng
  const getDefaultDates = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 3);

    return {
      checkIn: tomorrow.toISOString().split('T')[0],
      checkOut: dayAfter.toISOString().split('T')[0],
    };
  };

  const defaults = getDefaultDates();
  const [checkIn, setCheckIn] = useState(initialCheckIn || defaults.checkIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut || defaults.checkOut);
  const [adults, setAdults] = useState(initialAdults);
  const [children, setChildren] = useState(initialChildren);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const handleCheckInChange = (newVal: string) => {
    setCheckIn(newVal);
    if (!checkOut || checkOut <= newVal) {
      const nextDay = new Date(newVal);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  const getMinCheckOut = () => {
    if (!checkIn) return todayStr;
    const d = new Date(checkIn);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams({
      checkIn,
      checkOut,
      adults,
      children,
    });
    router.push(`/rooms?${query.toString()}`);
  };

  return (
    <div
      className={`floating-booking-bar glass-panel ${className}`}
      style={{
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        padding: '1.25rem 1.75rem',
        maxWidth: '1100px',
        margin: '0 auto',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <form
        onSubmit={handleSearch}
        className="floating-booking-grid"
      >
        {/* Ngày nhận phòng */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label
            htmlFor="checkInInput"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <Calendar size={15} />
            Ngày nhận phòng
          </label>
          <DatePicker
            id="checkInInput"
            value={checkIn}
            min={todayStr}
            minDate={todayStr}
            onChange={(val) => handleCheckInChange(val)}
            type="checkIn"
            placeholder="Chọn ngày nhận..."
            required
          />
        </div>

        {/* Ngày trả phòng */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label
            htmlFor="checkOutInput"
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <Calendar size={15} />
            Ngày trả phòng
          </label>
          <DatePicker
            id="checkOutInput"
            value={checkOut}
            min={getMinCheckOut()}
            minDate={getMinCheckOut()}
            onChange={(val) => setCheckOut(val)}
            type="checkOut"
            placeholder="Chọn ngày trả..."
            required
          />
        </div>

        {/* Số người lớn */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <Users size={15} />
            Người lớn
          </label>
          <CustomSelect
            options={adultOptions}
            value={adults}
            onChange={(val) => setAdults(val || '1')}
            placeholder="Người lớn"
          />
        </div>

        {/* Số trẻ em */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
          <label
            style={{
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
            }}
          >
            <Users size={15} />
            Trẻ em (dưới 12t)
          </label>
          <CustomSelect
            options={childOptions}
            value={children}
            onChange={(val) => setChildren(val || '0')}
            placeholder="Trẻ em"
          />
        </div>

        {/* Nút Tìm phòng */}
        <div className="floating-booking-submit">
          <Button
            type="submit"
            variant="primary"
            size="md"
            leftIcon={<Search size={18} />}
            style={{
              width: '100%',
              height: '46px',
              backgroundColor: 'var(--color-primary)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
            }}
          >
            Tìm phòng trống
          </Button>
        </div>
      </form>
    </div>
  );
};

export default FloatingBookingBar;
