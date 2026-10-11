'use client';

import React from 'react';
import { Layers, Plus, Edit2, Trash2 } from 'lucide-react';
import { RoomCard, RoomData } from './RoomCard';

interface FloorSectionProps {
  floorId: string;
  floorName: string;
  floorNumber: number;
  rooms: RoomData[];
  onRoomClick: (room: RoomData) => void;
  onAddRoom?: (floorId: string) => void;
  onEditFloor?: (floor: { id: string; name: string; floorNumber: number }) => void;
  onDeleteFloor?: (floor: { id: string; name: string; floorNumber: number; roomCount: number }) => void;
}

export const FloorSection: React.FC<FloorSectionProps> = ({
  floorId,
  floorName,
  floorNumber,
  rooms,
  onRoomClick,
  onAddRoom,
  onEditFloor,
  onDeleteFloor,
}) => {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* Floor Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.25rem',
          paddingBottom: '0.5rem',
          borderBottom: '2px solid var(--color-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
            }}
          >
            <Layers size={16} />
          </div>
          <h2 className="serif-heading" style={{ fontSize: '1.35rem', color: 'var(--color-primary)' }}>
            {floorName}
          </h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginLeft: '0.25rem' }}>
            ({rooms.length} phòng)
          </span>
        </div>

        {/* Floor Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {onAddRoom && (
            <button
              type="button"
              onClick={() => onAddRoom(floorId)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(15, 76, 58, 0.08)',
                color: 'var(--color-primary)',
                border: '1px solid rgba(15, 76, 58, 0.2)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              title={`Thêm phòng mới vào ${floorName}`}
            >
              <Plus size={14} />
              <span>Thêm phòng</span>
            </button>
          )}

          {onEditFloor && (
            <button
              type="button"
              onClick={() => onEditFloor({ id: floorId, name: floorName, floorNumber })}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.3rem 0.55rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              title="Sửa tên hoặc số tầng"
            >
              <Edit2 size={13} />
              <span className="desktop-text">Sửa tầng</span>
            </button>
          )}

          {onDeleteFloor && (
            <button
              type="button"
              onClick={() => onDeleteFloor({ id: floorId, name: floorName, floorNumber, roomCount: rooms.length })}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.3rem 0.55rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                color: 'var(--color-error)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                fontSize: '0.8125rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
              title="Xóa tầng (chỉ khi tầng không còn phòng)"
            >
              <Trash2 size={13} />
              <span className="desktop-text">Xóa tầng</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of rooms on this floor */}
      <div className="pms-room-grid">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} onClick={onRoomClick} />
        ))}
      </div>
    </div>
  );
};

export default FloorSection;
