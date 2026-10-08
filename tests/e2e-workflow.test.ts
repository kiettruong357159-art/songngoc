import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { calculateInvoiceSettlement, calculateBookingPricing, formatVND } from '../src/lib/pricing';
import { generateVietQRUrl, DEFAULT_HOTEL_BANK } from '../src/lib/vietqr';
import { hashPassword, verifyPassword, hasPermission } from '../src/lib/auth';
import { isDateOverlapping } from '../src/lib/availability';

describe('End-to-End Hotel System Lifecycle', () => {
  it('completes the entire guest-to-checkout journey: availability -> booking -> deposit -> checkin -> services -> settlement', () => {
    // 1. Date overlap check
    const guestCheckIn = new Date('2026-10-15T14:00:00Z');
    const guestCheckOut = new Date('2026-10-17T12:00:00Z');
    expect(
      isDateOverlapping(
        guestCheckIn,
        guestCheckOut,
        new Date('2026-10-16T14:00:00Z'),
        new Date('2026-10-18T12:00:00Z')
      )
    ).toBe(true);

    // 2. Booking pricing calculation: 2 nights x 450,000 = 900,000 VND
    const pricing = calculateBookingPricing({
      basePrice: 450000,
      nights: 2,
    });
    expect(pricing.totalRoomAmount).toBe(900000);

    // 3. VietQR 50% deposit generation (450,000 VND)
    const depositAmount = Math.round(pricing.totalRoomAmount / 2);
    const bookingCode = 'BK-202610-9999';
    const qrUrl = generateVietQRUrl({
      amount: depositAmount,
      bookingCode,
    });
    expect(qrUrl).toContain('amount=450000');
    expect(qrUrl).toContain(`addInfo=${bookingCode}`);
    expect(qrUrl).toContain(DEFAULT_HOTEL_BANK.accountNo);

    // 4. Staff RBAC permissions check
    const receptionistPerms = ['rooms:view', 'rooms:status', 'bookings:*', 'invoices:*'];
    expect(hasPermission(receptionistPerms, 'invoices:create')).toBe(true);
    expect(hasPermission(receptionistPerms, 'bookings:checkin')).toBe(true);
    expect(hasPermission(receptionistPerms, 'users:manage')).toBe(false);

    const adminPerms = ['*'];
    expect(hasPermission(adminPerms, 'users:manage')).toBe(true);

    // 5. Final invoice settlement at check-out
    // Room charge: 900k + Minibar: 45k + Surcharge: 50k - Deposit: 450k = 545,000 VND
    const invoice = calculateInvoiceSettlement({
      roomCharge: 900000,
      serviceCharge: 45000,
      surcharge: 50000,
      discount: 0,
      depositDeducted: 450000,
    });
    expect(invoice.finalAmount).toBe(545000);
    expect(formatVND(invoice.finalAmount)).toBe('545.000₫');
  });

  it('verifies all essential application routes and components exist for production', () => {
    const requiredFiles = [
      // Storefront routes
      '../src/app/(public)/page.tsx',
      '../src/app/(public)/rooms/page.tsx',
      '../src/app/(public)/booking/page.tsx',
      '../src/app/(public)/booking/confirmation/page.tsx',
      '../src/app/(public)/track/page.tsx',
      // Admin PMS routes
      '../src/app/admin/page.tsx',
      '../src/app/admin/rooms/page.tsx',
      '../src/app/admin/bookings/page.tsx',
      '../src/app/admin/checkin/page.tsx',
      '../src/app/admin/services/page.tsx',
      '../src/app/admin/invoices/page.tsx',
      '../src/app/admin/room-types/page.tsx',
      '../src/app/admin/users/page.tsx',
      // Core APIs
      '../src/app/api/auth/login/route.ts',
      '../src/app/api/admin/dashboard/route.ts',
      '../src/app/api/admin/rooms/route.ts',
      '../src/app/api/admin/bookings/route.ts',
      '../src/app/api/admin/services/route.ts',
      '../src/app/api/admin/invoices/route.ts',
      '../src/app/api/admin/room-types/route.ts',
      '../src/app/api/admin/users/route.ts',
    ];

    for (const relPath of requiredFiles) {
      const fullPath = path.resolve(__dirname, relPath);
      expect(fs.existsSync(fullPath), `Missing file: ${relPath}`).toBe(true);
    }
  });
});
