import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { db } from '../src/lib/db';
import { getRoomTypeAvailability } from '../src/lib/availability';

describe('Task 1: Database Compound Indexes & Performance Tuning', () => {
  it('schema.prisma contains compound index on Booking (roomTypeId, status, checkIn, checkOut)', () => {
    const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
    const content = fs.readFileSync(schemaPath, 'utf-8');

    expect(content).toContain('@@index([roomTypeId, status, checkIn, checkOut])');
    expect(content).toContain('@@index([isActive, basePrice])');
  });

  it('runs getRoomTypeAvailability efficiently with Prisma indexes', async () => {
    const roomType = await db.roomType.findFirst({ where: { isActive: true } });
    expect(roomType).toBeDefined();

    if (roomType) {
      const now = new Date();
      const checkIn = new Date(now.getTime() + 86400000);
      const checkOut = new Date(now.getTime() + 86400000 * 2);

      const start = performance.now();
      const availability = await getRoomTypeAvailability(db, roomType.id, checkIn, checkOut);
      const duration = performance.now() - start;

      expect(availability).toBeDefined();
      expect(typeof availability.totalRooms).toBe('number');
      expect(typeof availability.availableCount).toBe('number');
      // Index-optimized query should be fast
      expect(duration).toBeLessThan(100);
    }
  });
});
