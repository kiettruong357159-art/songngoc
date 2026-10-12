'use client';

import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { vi } from 'date-fns/locale';
import { format, parseISO, isValid } from 'date-fns';
import { Calendar as CalendarIcon, Clock, ChevronDown, Check } from 'lucide-react';
import 'react-day-picker/style.css';

export interface DateTimePickerProps {
  value?: string; // YYYY-MM-DDTHH:mm (khi datetime) hoặc YYYY-MM-DD (khi date)
  onChange: (value: string) => void;
  minDate?: Date | string;
  min?: Date | string; // Alias cho minDate để tương thích chuẩn HTML input
  label?: string;
  placeholder?: string;
  type?: 'checkIn' | 'checkOut';
  mode?: 'date' | 'datetime';
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
}

const CHECKIN_PRESET_TIMES = [
  { label: '14:00 (Tiêu chuẩn)', time: '14:00' },
  { label: '14:30', time: '14:30' },
  { label: '15:00', time: '15:00' },
  { label: '16:00', time: '16:00' },
  { label: '17:00', time: '17:00' },
  { label: '18:00', time: '18:00' },
  { label: '19:00', time: '19:00' },
  { label: '20:00', time: '20:00' },
  { label: '21:00 (Đến trễ)', time: '21:00' },
];

const CHECKOUT_PRESET_TIMES = [
  { label: '07:00 (Rời sớm)', time: '07:00' },
  { label: '08:00', time: '08:00' },
  { label: '09:00', time: '09:00' },
  { label: '10:00', time: '10:00' },
  { label: '11:00', time: '11:00' },
  { label: '11:30', time: '11:30' },
  { label: '12:00 (Tiêu chuẩn)', time: '12:00' },
];

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  minDate,
  min,
  label,
  placeholder,
  type = 'checkIn',
  mode = 'datetime',
  disabled = false,
  required = false,
  className = '',
  id,
}) => {
  const generatedId = useId();
  const pickerId = id || generatedId;
  const defaultPlaceholder = mode === 'date' ? 'Chọn ngày...' : 'Chọn ngày & giờ...';
  const effectivePlaceholder = placeholder || defaultPlaceholder;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverPos, setPopoverPos] = useState<{ top?: number; bottom?: number; left: number; width: number } | null>(null);

  // Phân tích giá trị ban đầu: Ngày (Date) và Giờ (string 'HH:mm')
  const defaultHour = type === 'checkIn' ? '14:00' : '12:00';
  let initialDate: Date | undefined;
  let initialTime = defaultHour;

  if (value) {
    if (value.includes('T')) {
      const [dPart, tPart] = value.split('T');
      const parsed = parseISO(`${dPart}T00:00:00`);
      if (isValid(parsed)) initialDate = parsed;
      if (tPart) initialTime = tPart.slice(0, 5);
    } else {
      const parsed = parseISO(`${value}T00:00:00`);
      if (isValid(parsed)) initialDate = parsed;
    }
  }

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [selectedTime, setSelectedTime] = useState<string>(initialTime);

  // Đồng bộ khi value bên ngoài thay đổi
  useEffect(() => {
    if (value) {
      if (value.includes('T')) {
        const [dPart, tPart] = value.split('T');
        const parsed = parseISO(`${dPart}T00:00:00`);
        if (isValid(parsed)) setSelectedDate(parsed);
        if (tPart) setSelectedTime(tPart.slice(0, 5));
      } else {
        const parsed = parseISO(`${value}T00:00:00`);
        if (isValid(parsed)) setSelectedDate(parsed);
      }
    }
  }, [value]);

  // Tính vị trí thông minh của Popover
  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const POPOVER_HEIGHT = mode === 'date' ? 360 : 420;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < POPOVER_HEIGHT && rect.top > spaceBelow;

    // Chiều rộng tối ưu
    const targetWidth = mode === 'date' ? 350 : 560;
    const minWidth = mode === 'date' ? 300 : 340;
    const popoverWidth = Math.min(targetWidth, Math.max(minWidth, rect.width));
    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 12) {
      left = window.innerWidth - popoverWidth - 12;
    }
    if (left < 12) left = 12;

    setPopoverPos(
      openUp
        ? { bottom: window.innerHeight - rect.top + 6, left, width: popoverWidth }
        : { top: rect.bottom + 6, left, width: popoverWidth }
    );
  }, [mode]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen, updatePosition]);

  // Đóng khi click ngoài hoặc ấn ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Cập nhật khi chọn ngày
  const handleSelectDay = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    if (mode === 'date') {
      onChange(dateStr);
      setIsOpen(false);
    } else {
      onChange(`${dateStr}T${selectedTime}`);
    }
  };

  // Cập nhật khi chọn giờ
  const handleSelectTime = (newTime: string) => {
    setSelectedTime(newTime);
    if (selectedDate) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      onChange(`${dateStr}T${newTime}`);
    }
  };

  // Định dạng ngày tối thiểu (minDate hoặc min)
  let parsedMinDate: Date | undefined;
  const effectiveMin = minDate || min;
  if (effectiveMin) {
    if (typeof effectiveMin === 'string') {
      const [dPart] = effectiveMin.split('T');
      const parsed = parseISO(`${dPart}T00:00:00`);
      if (isValid(parsed)) parsedMinDate = parsed;
    } else if (isValid(effectiveMin)) {
      parsedMinDate = effectiveMin;
    }
  }

  // Chuỗi hiển thị sang trọng trên ô Input Trigger
  const displayText = selectedDate
    ? mode === 'date'
      ? format(selectedDate, 'dd/MM/yyyy')
      : `${format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi })} lúc ${selectedTime}`
    : '';

  const presetTimes = type === 'checkIn' ? CHECKIN_PRESET_TIMES : CHECKOUT_PRESET_TIMES;

  return (
    <div className={`datetime-picker-wrapper ${className}`} ref={containerRef} style={{ width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {label && (
        <label
          htmlFor={pickerId}
          style={{
            display: 'block',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: 'var(--color-text)',
            marginBottom: '0.375rem',
            lineHeight: 1.4,
            wordBreak: 'break-word',
          }}
        >
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      {/* Trigger Button mô phỏng input cao cấp */}
      <button
        type="button"
        id={pickerId}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          padding: '0.625rem 0.875rem',
          borderRadius: 'var(--radius-md)',
          border: `1px solid ${isOpen ? 'var(--color-primary)' : 'var(--color-border)'}`,
          backgroundColor: 'var(--color-surface)',
          color: displayText ? 'var(--color-text)' : 'var(--color-text-muted)',
          fontSize: '0.925rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          boxShadow: isOpen ? '0 0 0 3px rgba(15, 91, 102, 0.12)' : 'var(--shadow-sm)',
          transition: 'all var(--transition-fast)',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', minWidth: 0, overflow: 'hidden', flex: 1 }}>
          <CalendarIcon size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: displayText ? 500 : 400 }}>
            {displayText || effectivePlaceholder}
          </span>
        </div>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--color-text-muted)',
            flexShrink: 0,
            transform: isOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform var(--transition-fast)',
          }}
        />
      </button>

      {/* Popover Lịch & Giờ render qua Portal */}
      {isOpen &&
        popoverPos &&
        createPortal(
          <div
            ref={popoverRef}
            className="animate-fade-in"
            style={{
              position: 'fixed',
              top: popoverPos.top,
              bottom: popoverPos.bottom,
              left: popoverPos.left,
              width: popoverPos.width,
              zIndex: 10000,
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.14)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Popover Header */}
            <div
              style={{
                padding: '0.875rem 1.25rem',
                backgroundColor: 'var(--color-primary-light)',
                borderBottom: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {mode === 'date' ? (
                  <CalendarIcon size={16} style={{ color: 'var(--color-primary)' }} />
                ) : (
                  <Clock size={16} style={{ color: 'var(--color-primary)' }} />
                )}
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {mode === 'date'
                    ? type === 'checkIn'
                      ? 'Chọn ngày nhận phòng'
                      : 'Chọn ngày trả phòng'
                    : type === 'checkIn'
                    ? 'Thời gian nhận phòng'
                    : 'Thời gian trả phòng'}
                </span>
              </div>
              {mode === 'datetime' && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                  {selectedTime}
                </span>
              )}
            </div>

            {/* Split Grid: Lịch bên trái + Cột chọn Giờ bên phải (nếu mode datetime) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: mode === 'datetime' && popoverPos.width > 480 ? '1fr 200px' : '1fr',
                maxHeight: '380px',
                overflowY: 'auto',
              }}
            >
              {/* Lịch DayPicker Shadcn Style */}
              <div
                style={{
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'center',
                  borderRight: mode === 'datetime' && popoverPos.width > 480 ? '1px solid var(--color-border)' : 'none',
                  borderBottom: mode === 'datetime' && popoverPos.width <= 480 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleSelectDay}
                  locale={vi}
                  disabled={parsedMinDate ? { before: parsedMinDate } : undefined}
                  className="songngoc-day-picker"
                />
              </div>

              {/* Panel Chọn Giờ (Chỉ hiển thị khi mode === 'datetime') */}
              {mode === 'datetime' && (
                <div
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--color-bg)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Khung giờ dự kiến
                  </div>

                  {/* Danh sách các khung giờ preset */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.375rem',
                      overflowY: 'auto',
                      maxHeight: '230px',
                      paddingRight: '0.25rem',
                    }}
                  >
                    {presetTimes.map((item) => {
                      const isSelected = selectedTime === item.time;
                      return (
                        <button
                          key={item.time}
                          type="button"
                          onClick={() => handleSelectTime(item.time)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.45rem 0.65rem',
                            borderRadius: 'var(--radius-sm)',
                            border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                            backgroundColor: isSelected ? 'var(--color-primary)' : '#ffffff',
                            color: isSelected ? '#ffffff' : 'var(--color-text)',
                            fontSize: '0.8125rem',
                            fontWeight: isSelected ? 600 : 500,
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                            textAlign: 'left',
                          }}
                        >
                          <span>{item.label}</span>
                          {isSelected && <Check size={14} />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Chọn giờ tùy ý */}
                  <div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                      Giờ chính xác:
                    </label>
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => e.target.value && handleSelectTime(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.35rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        fontSize: '0.85rem',
                        backgroundColor: '#ffffff',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Popover Footer */}
            <div
              style={{
                padding: '0.75rem 1.25rem',
                borderTop: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                {selectedDate ? (
                  <span>
                    Đã chọn: <strong style={{ color: 'var(--color-primary)' }}>
                      {format(selectedDate, 'dd/MM/yyyy')}{mode === 'datetime' ? ` ${selectedTime}` : ''}
                    </strong>
                  </span>
                ) : (
                  <span>Vui lòng chọn ngày</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color var(--transition-fast)',
                }}
              >
                {mode === 'date' ? 'Đóng' : 'Xác nhận'}
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export interface DatePickerProps extends Omit<DateTimePickerProps, 'mode'> {}

export const DatePicker: React.FC<DatePickerProps> = (props) => (
  <DateTimePicker {...props} mode="date" />
);

export default DateTimePicker;
