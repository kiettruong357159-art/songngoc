import { describe, it, expect } from 'vitest';
import { formatVND, calculateNights, calculateBookingPricing, calculateInvoiceSettlement } from '../src/lib/pricing';

describe('Pricing Engine', () => {
  it('formats currency correctly to Vietnamese Dong with symbol', () => {
    expect(formatVND(450000)).toBe('450.000₫');
    expect(formatVND(0)).toBe('0₫');
  });

  it('calculates nights accurately between dates (minimum 1 night)', () => {
    const d1 = new Date('2026-10-10T14:00:00Z');
    const d2 = new Date('2026-10-12T12:00:00Z');
    expect(calculateNights(d1, d2)).toBe(2);

    // Same day booking counts as 1 night minimum
    const sameDay = new Date('2026-10-10T18:00:00Z');
    expect(calculateNights(d1, sameDay)).toBe(1);
  });

  it('calculates booking pricing with regular and weekend nights', () => {
    const pricing = calculateBookingPricing({
      basePrice: 450000,
      nights: 3,
      weekendPrice: 500000,
      weekendNights: 1,
    });
    // 2 weekday * 450k + 1 weekend * 500k = 900k + 500k = 1.400.000
    expect(pricing.totalRoomAmount).toBe(1400000);
  });

  it('calculates invoice settlement according to spec example', () => {
    // Spec Example:
    // Tiền phòng (2 đêm x 450.000₫): 900.000₫
    // Dịch vụ (2 Nước suối 15k + 1 Mì 15k): 45.000₫
    // Phụ thu (Trả muộn 1 tiếng): 50.000₫
    // Giảm giá voucher: 0₫
    // Tiền cọc trước đó: 200.000₫
    // => Thực thu tại quầy: 795.000₫
    const settlement = calculateInvoiceSettlement({
      roomCharge: 900000,
      serviceCharge: 45000,
      surcharge: 50000,
      discount: 0,
      depositDeducted: 200000,
    });
    expect(settlement.finalAmount).toBe(795000);
    expect(settlement.refundAmount).toBe(0);
  });

  it('handles refund case when deposit exceeds total charges without negative error', () => {
    const settlement = calculateInvoiceSettlement({
      roomCharge: 200000,
      serviceCharge: 0,
      surcharge: 0,
      discount: 0,
      depositDeducted: 300000,
    });
    expect(settlement.finalAmount).toBe(0);
    expect(settlement.refundAmount).toBe(100000);
  });
});
