import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Storefront Luxury Hero Spec', () => {
  it('PublicHeader and FloatingBookingBar contain approved layout elements', () => {
    const headerPath = path.resolve(__dirname, '../src/components/layout/PublicHeader.tsx');
    const barPath = path.resolve(__dirname, '../src/components/booking/FloatingBookingBar.tsx');

    expect(fs.readFileSync(headerPath, 'utf-8')).toContain('Song Ngọc');
    expect(fs.readFileSync(barPath, 'utf-8')).toContain('checkIn');
    expect(fs.readFileSync(barPath, 'utf-8')).toContain('checkOut');
  });

  it('Landing page exists and implements 65vh hero and featured rooms', () => {
    const pagePath = path.resolve(__dirname, '../src/app/(public)/page.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');

    expect(content).toContain('65vh');
    expect(content).toContain('Kỳ Nghỉ Thư Thái');
  });
});
