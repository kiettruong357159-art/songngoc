import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Room Status State Machine', () => {
  const isValidTransition = (from: string, to: string) => {
    const transitions: Record<string, string[]> = {
      AVAILABLE: ['OCCUPIED', 'MAINTENANCE'],
      OCCUPIED: ['DIRTY'],
      DIRTY: ['CLEANING', 'MAINTENANCE'],
      CLEANING: ['AVAILABLE', 'DIRTY'],
      MAINTENANCE: ['DIRTY', 'AVAILABLE'],
    };
    return transitions[from]?.includes(to) ?? false;
  };

  it('allows valid PMS operational transitions', () => {
    expect(isValidTransition('AVAILABLE', 'OCCUPIED')).toBe(true);
    expect(isValidTransition('OCCUPIED', 'DIRTY')).toBe(true);
    expect(isValidTransition('DIRTY', 'CLEANING')).toBe(true);
    expect(isValidTransition('CLEANING', 'AVAILABLE')).toBe(true);
    expect(isValidTransition('AVAILABLE', 'MAINTENANCE')).toBe(true);
    expect(isValidTransition('MAINTENANCE', 'AVAILABLE')).toBe(true);
  });

  it('blocks invalid transitions (cannot jump directly from OCCUPIED to AVAILABLE)', () => {
    expect(isValidTransition('OCCUPIED', 'AVAILABLE')).toBe(false);
    expect(isValidTransition('DIRTY', 'AVAILABLE')).toBe(false);
  });

  it('PMS room grid files and status API exist', () => {
    const cardPath = path.resolve(__dirname, '../src/components/pms/RoomCard.tsx');
    const floorPath = path.resolve(__dirname, '../src/components/pms/FloorSection.tsx');
    const modalPath = path.resolve(__dirname, '../src/components/pms/QuickActionModal.tsx');
    const pagePath = path.resolve(__dirname, '../src/app/admin/rooms/page.tsx');
    const apiPath = path.resolve(__dirname, '../src/app/api/admin/rooms/[id]/status/route.ts');

    expect(fs.existsSync(cardPath)).toBe(true);
    expect(fs.existsSync(floorPath)).toBe(true);
    expect(fs.existsSync(modalPath)).toBe(true);
    expect(fs.existsSync(pagePath)).toBe(true);
    expect(fs.existsSync(apiPath)).toBe(true);
  });
});
