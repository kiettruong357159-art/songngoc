import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 16: Luxury UI Libraries - Sonner, Radix Confirm Dialog & React Day Picker', () => {
  it('Sonner Toaster and ToastContext integration are properly configured', () => {
    const toastContextPath = path.resolve(__dirname, '../src/context/ToastContext.tsx');
    expect(fs.existsSync(toastContextPath)).toBe(true);

    const content = fs.readFileSync(toastContextPath, 'utf-8');
    expect(content).toContain("from 'sonner'");
    expect(content).toContain('<Toaster');
    expect(content).toContain('showToast');
    expect(content).toContain('toast.success');
    expect(content).toContain('toast.error');
    expect(content).toContain('toast.warning');
  });

  it('ConfirmDialog component exists and uses @radix-ui/react-alert-dialog', () => {
    const confirmDialogPath = path.resolve(__dirname, '../src/components/ui/ConfirmDialog.tsx');
    expect(fs.existsSync(confirmDialogPath)).toBe(true);

    const content = fs.readFileSync(confirmDialogPath, 'utf-8');
    expect(content).toContain("@radix-ui/react-alert-dialog");
    expect(content).toContain('AlertDialog.Root');
    expect(content).toContain('AlertDialog.Overlay');
    expect(content).toContain('AlertDialog.Content');
    expect(content).toContain('radix-alert-overlay');
    expect(content).toContain('radix-alert-content');
  });

  it('Admin pages utilize ConfirmDialog for safe entity deletion', () => {
    const amenitiesPath = path.resolve(__dirname, '../src/app/admin/amenities/page.tsx');
    const roomTypesPath = path.resolve(__dirname, '../src/app/admin/room-types/page.tsx');
    const roomsPath = path.resolve(__dirname, '../src/app/admin/rooms/page.tsx');
    const serviceCategoryPath = path.resolve(__dirname, '../src/components/admin/ServiceCategoryManager.tsx');

    expect(fs.readFileSync(amenitiesPath, 'utf-8')).toContain('ConfirmDialog');
    expect(fs.readFileSync(roomTypesPath, 'utf-8')).toContain('ConfirmDialog');
    expect(fs.readFileSync(roomsPath, 'utf-8')).toContain('ConfirmDialog');
    expect(fs.readFileSync(serviceCategoryPath, 'utf-8')).toContain('ConfirmDialog');
  });

  it('DateTimePicker and DatePicker support mode="date" and mode="datetime"', () => {
    const dateTimePickerPath = path.resolve(__dirname, '../src/components/ui/DateTimePicker.tsx');
    expect(fs.existsSync(dateTimePickerPath)).toBe(true);

    const content = fs.readFileSync(dateTimePickerPath, 'utf-8');
    expect(content).toContain("from 'react-day-picker'");
    expect(content).toContain("from 'date-fns'");
    expect(content).toContain('export const DatePicker');
    expect(content).toContain("mode?: 'date' | 'datetime'");
  });

  it('FloatingBookingBar and Admin Checkin utilize DatePicker instead of raw date inputs', () => {
    const floatingBarPath = path.resolve(__dirname, '../src/components/booking/FloatingBookingBar.tsx');
    const adminCheckinPath = path.resolve(__dirname, '../src/app/admin/checkin/page.tsx');

    expect(fs.readFileSync(floatingBarPath, 'utf-8')).toContain('<DatePicker');
    expect(fs.readFileSync(adminCheckinPath, 'utf-8')).toContain('<DatePicker');
  });
});
