import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/admin/dashboard/route';
import { createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

describe('Task 2: Admin Dashboard Database Aggregations & Memory Optimization', () => {
  it('does not load raw room arrays or invoices into RAM for counting or summing', () => {
    const routePath = path.resolve(process.cwd(), 'src/app/api/admin/dashboard/route.ts');
    const content = fs.readFileSync(routePath, 'utf-8');

    // Cấm kéo toàn bộ mảng về RAM để .reduce() hoặc .forEach()
    expect(content).not.toContain('.reduce((sum, inv)');
    expect(content).not.toContain('allRooms.forEach');
    expect(content).not.toContain('const totalRooms = allRooms.length');

    // Bắt buộc dùng SQL Aggregations & Promise.all
    expect(content).toContain('groupBy');
    expect(content).toContain('aggregate');
    expect(content).toContain('_sum');
    expect(content).toContain('Promise.all');
  });

  it('executes GET /api/admin/dashboard successfully with authenticated session and returns valid metrics', async () => {
    const token = createSessionToken({
      userId: 'test-admin-id',
      username: 'admin',
      role: 'ADMIN',
      permissions: ['*'],
      name: 'Admin Test',
    });

    const req = new NextRequest('http://localhost:3000/api/admin/dashboard', {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${token}`,
      },
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toBeDefined();
    expect(typeof json.data.totalRooms).toBe('number');
    expect(typeof json.data.occupancyRate).toBe('number');
    expect(typeof json.data.todayRevenue).toBe('number');
    expect(json.data.statusCounts).toBeDefined();
    expect(typeof json.data.statusCounts.AVAILABLE).toBe('number');
    expect(typeof json.data.statusCounts.OCCUPIED).toBe('number');
    expect(Array.isArray(json.data.recentBookings)).toBe(true);
  });
});
