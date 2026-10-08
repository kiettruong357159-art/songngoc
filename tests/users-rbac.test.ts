import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('User Management RBAC Guard', () => {
  it('Users API route checks for ADMIN role or wildcard permission', () => {
    const routePath = path.resolve(__dirname, '../src/app/api/admin/users/route.ts');
    expect(fs.existsSync(routePath)).toBe(true);
    const content = fs.readFileSync(routePath, 'utf-8');

    expect(content).toContain('requirePermission');
  });

  it('Room types, users pages and user detail API route exist', () => {
    const roomTypesPage = path.resolve(__dirname, '../src/app/admin/room-types/page.tsx');
    const usersPage = path.resolve(__dirname, '../src/app/admin/users/page.tsx');
    const roomTypesApi = path.resolve(__dirname, '../src/app/api/admin/room-types/route.ts');
    const userDetailApi = path.resolve(__dirname, '../src/app/api/admin/users/[id]/route.ts');

    expect(fs.existsSync(roomTypesPage)).toBe(true);
    expect(fs.existsSync(usersPage)).toBe(true);
    expect(fs.existsSync(roomTypesApi)).toBe(true);
    expect(fs.existsSync(userDetailApi)).toBe(true);
  });
});
