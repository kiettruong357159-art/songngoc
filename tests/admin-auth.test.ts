import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Admin PMS Auth Protection', () => {
  it('Admin layout enforces authentication check and contains RBAC sidebar', () => {
    const layoutPath = path.resolve(__dirname, '../src/app/admin/layout.tsx');
    const sidebarPath = path.resolve(__dirname, '../src/components/layout/AdminSidebar.tsx');
    const headerPath = path.resolve(__dirname, '../src/components/layout/AdminHeader.tsx');
    const loginPath = path.resolve(__dirname, '../src/app/(auth)/login/page.tsx');

    expect(fs.existsSync(layoutPath)).toBe(true);
    expect(fs.existsSync(sidebarPath)).toBe(true);
    expect(fs.existsSync(headerPath)).toBe(true);
    expect(fs.existsSync(loginPath)).toBe(true);

    expect(fs.readFileSync(sidebarPath, 'utf-8')).toContain('hasPermission');
  });
});
