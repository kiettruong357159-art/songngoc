import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Public Room Routes', () => {
  it('room pages and availability API route files exist', () => {
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/(public)/rooms/page.tsx'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/(public)/rooms/[slug]/page.tsx'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/api/booking/availability/route.ts'))).toBe(true);
  });
});
