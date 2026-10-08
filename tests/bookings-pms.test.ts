import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PMS Booking Management Code Checks', () => {
  it('Bookings page enforces CustomSelect and Pagination', () => {
    const pagePath = path.resolve(__dirname, '../src/app/admin/bookings/page.tsx');
    expect(fs.existsSync(pagePath)).toBe(true);
    const content = fs.readFileSync(pagePath, 'utf-8');

    expect(content).toContain('Pagination');
    expect(content).toContain('CustomSelect');
  });

  it('Checkin page and booking APIs exist', () => {
    const checkinPath = path.resolve(__dirname, '../src/app/admin/checkin/page.tsx');
    const bookingsApi = path.resolve(__dirname, '../src/app/api/admin/bookings/route.ts');
    const checkinApi = path.resolve(__dirname, '../src/app/api/admin/bookings/[id]/checkin/route.ts');

    expect(fs.existsSync(checkinPath)).toBe(true);
    expect(fs.existsSync(bookingsApi)).toBe(true);
    expect(fs.existsSync(checkinApi)).toBe(true);
  });
});
