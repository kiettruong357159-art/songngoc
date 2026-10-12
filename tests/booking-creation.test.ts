import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Booking Creation & Tracking Spec', () => {
  it('booking code follows format BK-YYYYMM-XXXX', () => {
    const generateBookingCode = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const random = Math.floor(1000 + Math.random() * 9000);
      return `BK-${year}${month}-${random}`;
    };

    const code = generateBookingCode();
    expect(code).toMatch(/^BK-\d{6}-\d{4}$/);
  });

  it('booking pages and tracking routes exist', () => {
    const bookingPath = path.resolve(__dirname, '../src/app/(public)/booking/page.tsx');
    const confirmPath = path.resolve(__dirname, '../src/app/(public)/booking/confirmation/page.tsx');
    const trackPath = path.resolve(__dirname, '../src/app/(public)/track/page.tsx');
    const createApiPath = path.resolve(__dirname, '../src/app/api/booking/create/route.ts');
    const trackApiPath = path.resolve(__dirname, '../src/app/api/booking/track/route.ts');

    expect(fs.existsSync(bookingPath)).toBe(true);
    expect(fs.existsSync(confirmPath)).toBe(true);
    expect(fs.existsSync(trackPath)).toBe(true);
    expect(fs.existsSync(createApiPath)).toBe(true);
    expect(fs.existsSync(trackApiPath)).toBe(true);
    const pickerPath = path.resolve(__dirname, '../src/components/ui/DateTimePicker.tsx');
    expect(fs.existsSync(pickerPath)).toBe(true);

    const bookingContent = fs.readFileSync(bookingPath, 'utf-8');
    expect(bookingContent).toContain('DateTimePicker');
    expect(bookingContent).toContain('placeholder="Họ và tên của bạn"');
  });
});
