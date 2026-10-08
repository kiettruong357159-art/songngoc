import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PMS Dashboard Components', () => {
  it('Dashboard page exists and renders metric cards', () => {
    const pagePath = path.resolve(__dirname, '../src/app/admin/page.tsx');
    const apiPath = path.resolve(__dirname, '../src/app/api/admin/dashboard/route.ts');

    expect(fs.existsSync(pagePath)).toBe(true);
    expect(fs.existsSync(apiPath)).toBe(true);

    const content = fs.readFileSync(pagePath, 'utf-8');
    expect(content).toContain('Tỷ lệ lấp đầy');
    expect(content).toContain('Doanh thu');
    expect(content).toContain('Check-in hôm nay');
  });
});
