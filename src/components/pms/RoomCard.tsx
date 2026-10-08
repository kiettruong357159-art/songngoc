'use client';

import React from 'react';
import { Bed, User, Clock, AlertTriangle, Sparkles, Wrench } from 'lucide-react';
import { ROOM_STATUS_META, RoomStatus } from '@/lib/constants';
import { formatDateVN } from '@/lib/utils';

export interface RoomData {
  id: string;
  roomNumber: string;
  status: RoomStatus;
  note?: string | null;
  roomType: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    bedType: string;
  };
  floor: {
    id: string;
    name: string;
    floorNumber: number;
  };
  currentBooking?: {
    id: string;
    bookingCode: string;
    guest: {
      fullName: string;
      phone: string;
    };
    checkIn: string | Date;
    checkOut: string | Date;
  } | null;
}

interface RoomCardProps {
  room: RoomData;
  onClick: (room: RoomData) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onClick }) => {
  const meta = ROOM_STATUS_META[room.status] || {
    label: room.status,
    color: '#6b7280',
    bg: '#f3f4f6',
    border: '#e5e7eb',
  };

  const isOccupied = room.status === 'OCCUPIED' && room.currentBooking;

  return (
    <div
      onClick={() => onClick(room)}
      className="glass-panel"
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        backgroundColor: 'var(--color-surface)',
        border: `2px solid ${meta.border}`,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '160px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Top Header: Room Number & Type */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
            {room.roomNumber}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
            {room.roomType.name}
          </div>
        </div>

        {/* Status Pill Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.25rem 0.625rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: meta.bg,
            color: meta.color,
            border: `1px solid ${meta.border}`,
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: meta.color,
            }}
          />
          <span>{meta.label}</span>
        </div>
      </div>

      {/* Middle Body: Occupant details or Status notices */}
      <div style={{ margin: '0.75rem 0', minHeight: '38px' }}>
        {isOccupied ? (
          <div style={{ fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontWeight: 600, color: 'var(--color-text)' }}>
              <User size={14} style={{ color: 'var(--color-room-occupied)' }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {room.currentBooking?.guest.fullName}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
              <Clock size={13} />
              <span>Trả phòng: {formatDateVN(room.currentBooking?.checkOut)}</span>
            </div>
          </div>
        ) : room.status === 'DIRTY' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-room-dirty)', fontWeight: 600 }}>
            <AlertTriangle size={15} />
            <span>Cần buồng phòng dọn dẹp</span>
          </div>
        ) : room.status === 'CLEANING' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-room-cleaning)', fontWeight: 600 }}>
            <Sparkles size={15} />
            <span>Đang dọn dẹp phòng...</span>
          </div>
        ) : room.status === 'MAINTENANCE' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-room-maintenance)', fontWeight: 600 }}>
            <Wrench size={15} />
            <span>Đang bảo trì / tạm khóa</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: 'var(--color-room-available)', fontWeight: 500 }}>
            <Bed size={15} />
            <span>Sẵn sàng đón khách</span>
          </div>
        )}
      </div>

      {/* Note indicator if any */}
      {room.note && (
        <div
          style={{
            fontSize: '0.725rem',
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-bg)',
            padding: '0.25rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
          title={room.note}
        >
          * {room.note}
        </div>
      )}
    </div>
  );
};

export default RoomCard;
