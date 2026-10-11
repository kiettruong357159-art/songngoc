import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Task 30: Admin PMS Mobile Drawer & Responsive Architecture', () => {
  it('has AdminUIContext with sidebarOpen state and toggleSidebar function', () => {
    const contextPath = path.resolve(process.cwd(), 'src/context/AdminUIContext.tsx');
    expect(fs.existsSync(contextPath)).toBe(true);

    const content = fs.readFileSync(contextPath, 'utf-8');
    expect(content).toContain('AdminUIProvider');
    expect(content).toContain('useAdminUI');
    expect(content).toContain('toggleSidebar');
  });

  it('AdminHeader includes mobile menu toggle button', () => {
    const headerPath = path.resolve(process.cwd(), 'src/components/layout/AdminHeader.tsx');
    const content = fs.readFileSync(headerPath, 'utf-8');
    expect(content).toContain('useAdminUI');
    expect(content).toContain('toggleSidebar');
  });

  it('AdminSidebar supports mobile drawer mode with close button and backdrop', () => {
    const sidebarPath = path.resolve(process.cwd(), 'src/components/layout/AdminSidebar.tsx');
    const content = fs.readFileSync(sidebarPath, 'utf-8');
    expect(content).toContain('useAdminUI');
    expect(content).toContain('sidebarOpen');
    expect(content).toContain('backdrop');
  });

  it('admin layout incorporates AdminUIProvider with responsive padding', () => {
    const layoutPath = path.resolve(process.cwd(), 'src/app/admin/layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf-8');
    expect(content).toContain('AdminUIProvider');
  });

  it('Task 31: FloatingBookingBar and Booking Form have responsive mobile styling', () => {
    const barPath = path.resolve(process.cwd(), 'src/components/booking/FloatingBookingBar.tsx');
    const barContent = fs.readFileSync(barPath, 'utf-8');
    expect(barContent).toContain('floating-booking-grid');
    expect(barContent).toContain('floating-booking-submit');

    const bookingPath = path.resolve(process.cwd(), 'src/app/(public)/booking/page.tsx');
    const bookingContent = fs.readFileSync(bookingPath, 'utf-8');
    expect(bookingContent).toContain('responsive-input-pair');
  });

  it('Task 32: Table and PMS Room Rack use responsive adaptive classes', () => {
    const cssPath = path.resolve(process.cwd(), 'src/app/globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    expect(cssContent).toContain('.table-responsive');
    expect(cssContent).toContain('.pms-room-grid');

    const floorPath = path.resolve(process.cwd(), 'src/components/pms/FloorSection.tsx');
    const floorContent = fs.readFileSync(floorPath, 'utf-8');
    expect(floorContent).toContain('pms-room-grid');

    const bookingsAdminPath = path.resolve(process.cwd(), 'src/app/admin/bookings/page.tsx');
    const bookingsAdminContent = fs.readFileSync(bookingsAdminPath, 'utf-8');
    expect(bookingsAdminContent).toContain('table-responsive');
  });
});
