import { describe, it, expect } from 'vitest';
import { isDateOverlapping, checkRoomTypeAvailability } from '../src/lib/availability';

describe('Room Availability Logic', () => {
  it('detects date overlaps correctly', () => {
    // Existing: Oct 10 -> Oct 12
    const startA = new Date('2026-10-10T14:00:00Z');
    const endA = new Date('2026-10-12T12:00:00Z');

    // Overlapping: Oct 11 -> Oct 13
    expect(
      isDateOverlapping(startA, endA, new Date('2026-10-11T14:00:00Z'), new Date('2026-10-13T12:00:00Z'))
    ).toBe(true);

    // Enclosing: Oct 9 -> Oct 13
    expect(
      isDateOverlapping(startA, endA, new Date('2026-10-09T14:00:00Z'), new Date('2026-10-13T12:00:00Z'))
    ).toBe(true);

    // Non-overlapping: Oct 12 -> Oct 14 (checkout day meets checkin day)
    expect(
      isDateOverlapping(startA, endA, new Date('2026-10-12T14:00:00Z'), new Date('2026-10-14T12:00:00Z'))
    ).toBe(false);

    // Non-overlapping: Oct 8 -> Oct 10
    expect(
      isDateOverlapping(startA, endA, new Date('2026-10-08T14:00:00Z'), new Date('2026-10-10T12:00:00Z'))
    ).toBe(false);
  });

  it('calculates available rooms count according to spec formula', () => {
    // Spec Formula: Available = TotalRooms - ConfirmedBookings
    const totalRooms = 5;
    const activeBookingsCount = 3;
    const available = checkRoomTypeAvailability(totalRooms, activeBookingsCount);
    expect(available).toBe(2);

    // Fully booked
    expect(checkRoomTypeAvailability(5, 5)).toBe(0);

    // Overbooked safeguard returns 0 instead of negative
    expect(checkRoomTypeAvailability(5, 6)).toBe(0);
  });
});
