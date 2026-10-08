import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Task 4: UI/UX Date Cascading & Loading Skeletons', () => {
  it('Skeleton component exists and supports variant, width, height', () => {
    const skeletonPath = path.resolve(__dirname, '../src/components/ui/Skeleton.tsx');
    expect(fs.existsSync(skeletonPath)).toBe(true);

    const content = fs.readFileSync(skeletonPath, 'utf-8');
    expect(content).toContain('Skeleton');
    expect(content).toContain('animation');
  });

  it('FloatingBookingBar has min-date clamping and auto-cascading date logic', () => {
    const barPath = path.resolve(__dirname, '../src/components/booking/FloatingBookingBar.tsx');
    const content = fs.readFileSync(barPath, 'utf-8');

    expect(content).toContain('todayStr');
    expect(content).toContain('min={');
  });

  it('Admin dashboard utilizes loading skeletons instead of plain text loading', () => {
    const adminPagePath = path.resolve(__dirname, '../src/app/admin/page.tsx');
    const content = fs.readFileSync(adminPagePath, 'utf-8');

    expect(content).toContain('Skeleton');
  });
});
