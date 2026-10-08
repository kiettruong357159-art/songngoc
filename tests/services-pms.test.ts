import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PMS Services Management', () => {
  it('Service selector, services catalog and booking services API files exist', () => {
    expect(fs.existsSync(path.resolve(__dirname, '../src/components/admin/ServiceSelector.tsx'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/admin/services/page.tsx'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/api/admin/services/route.ts'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/api/admin/bookings/[id]/services/route.ts'))).toBe(true);
  });
});
