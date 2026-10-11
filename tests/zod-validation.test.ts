import { describe, it, expect } from 'vitest';
import { CreatePublicBookingSchema, CreateServiceSchema } from '../src/lib/validation/schemas';
import { successResponse, errorResponse } from '../src/lib/types/api';
import { MAX_LIST_LIMIT } from '../src/lib/constants';

describe('Zod validation & API envelopes', () => {
  it('đặt phòng hợp lệ: gán mặc định adults/children/paymentMethod', () => {
    const r = CreatePublicBookingSchema.safeParse({
      fullName: 'Nguyen Van A',
      phone: '0901234567',
      roomTypeId: 'rt1',
      checkIn: '2030-01-01',
      checkOut: '2030-01-02',
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.adults).toBe(1);
      expect(r.data.children).toBe(0);
      expect(r.data.paymentMethod).toBe('COUNTER');
    }
  });

  it('đặt phòng thiếu trường bắt buộc bị từ chối', () => {
    expect(CreatePublicBookingSchema.safeParse({ fullName: 'A' }).success).toBe(false);
  });

  it('dịch vụ: price coerce số, thiếu unit bị từ chối', () => {
    const ok = CreateServiceSchema.safeParse({ name: 'Giặt ủi', category: 'LAUNDRY', price: '50000', unit: 'kg' });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.price).toBe(50000);
    expect(CreateServiceSchema.safeParse({ name: 'x', category: 'y', price: 1 }).success).toBe(false);
  });

  it('envelope helper', () => {
    expect(successResponse({ a: 1 }).success).toBe(true);
    expect(errorResponse('lỗi').error).toBe('lỗi');
  });

  it('có giới hạn an toàn cho danh sách', () => {
    expect(MAX_LIST_LIMIT).toBeGreaterThan(0);
  });
});
