import { describe, it, expect } from 'vitest';
import { POST } from '../src/app/api/booking/create/route';
import { NextRequest } from 'next/server';
import { db } from '../src/lib/db';

describe('Task 2: Backend Concurrency & Validation Guards', () => {
  it('rejects invalid phone numbers with 400', async () => {
    const roomType = await db.roomType.findFirst({ where: { isActive: true } });
    expect(roomType).toBeDefined();

    const req = new NextRequest('http://localhost:3000/api/booking/create', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Nguyễn Văn Test',
        phone: '12345', // invalid phone
        roomTypeId: roomType!.id,
        checkIn: '2026-11-01',
        checkOut: '2026-11-03',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain('Số điện thoại không hợp lệ');
  });

  it('rejects check-in date in the past with 400', async () => {
    const roomType = await db.roomType.findFirst({ where: { isActive: true } });

    const req = new NextRequest('http://localhost:3000/api/booking/create', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Nguyễn Văn Test',
        phone: '0912345678',
        roomTypeId: roomType!.id,
        checkIn: '2020-01-01', // past date
        checkOut: '2020-01-03',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain('trong quá khứ');
  });

  it('rejects bookings longer than 30 nights with 400', async () => {
    const roomType = await db.roomType.findFirst({ where: { isActive: true } });

    const req = new NextRequest('http://localhost:3000/api/booking/create', {
      method: 'POST',
      body: JSON.stringify({
        fullName: 'Nguyễn Văn Test',
        phone: '0912345678',
        roomTypeId: roomType!.id,
        checkIn: '2026-12-01',
        checkOut: '2027-01-15', // 45 nights
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toContain('tối đa 30 ngày');
  });
});
