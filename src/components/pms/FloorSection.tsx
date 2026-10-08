'use client';

import React from 'react';
import { Layers } from 'lucide-react';
import { RoomCard, RoomData } from './RoomCard';

interface FloorSectionProps {
  floorName: string;
  floorNumber: number;
  rooms: RoomData[];
  onRoomClick: (room: RoomData) => void;
}

export const FloorSection: React.FC<FloorSectionProps> = ({
  floorName,
  floorNumber,
  rooms,
  onRoomClick,
}) => {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* Floor Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          marginBottom: '1.25rem',
          paddingBottom: '0.5rem',
          borderBottom: '2px solid var(--color-border)',
        }}
      >
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

      {/* Grid of rooms on this floor */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} onClick={onRoomClick} />
        ))}
      </div>
    </div>
  );
};

export default FloorSection;
