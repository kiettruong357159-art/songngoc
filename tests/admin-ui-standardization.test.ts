import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Admin PMS UI Standardization & Format Consistency', () => {
  const adminPages = [
    { name: 'Bookings', path: 'src/app/admin/bookings/page.tsx', requiresPagination: true, requiresTable: true },
    { name: 'Invoices', path: 'src/app/admin/invoices/page.tsx', requiresPagination: true, requiresTable: true },
    { name: 'Services', path: 'src/app/admin/services/page.tsx', requiresPagination: true, requiresTable: true },
    { name: 'Users', path: 'src/app/admin/users/page.tsx', requiresPagination: true, requiresTable: true },
    { name: 'Room Types', path: 'src/app/admin/room-types/page.tsx', requiresPagination: false, requiresTable: false },
    { name: 'Amenities', path: 'src/app/admin/amenities/page.tsx', requiresPagination: true, requiresTable: true },
    { name: 'Rooms (PMS Rack)', path: 'src/app/admin/rooms/page.tsx', requiresPagination: false, requiresTable: false },
  ];

  it('all admin pages implement .admin-action-header for consistent action bars', () => {
    adminPages.forEach(({ name, path: filePath }) => {
      const content = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
      expect(content, `${name} must include .admin-action-header`).toContain('admin-action-header');
    });
  });

  it('all admin pages implement .admin-filter-card with standardized search input', () => {
    adminPages.forEach(({ name, path: filePath }) => {
      const content = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
      expect(content, `${name} must include .admin-filter-card`).toContain('admin-filter-card');
      expect(content, `${name} must include .admin-search-wrapper`).toContain('admin-search-wrapper');
      expect(content, `${name} must include .admin-search-input`).toContain('admin-search-input');
    });
  });

  it('all admin table pages implement .admin-table-card, .admin-table, and .admin-table-footer with Pagination', () => {
    adminPages
      .filter((p) => p.requiresTable)
      .forEach(({ name, path: filePath }) => {
        const content = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
        expect(content, `${name} must include .admin-table-card`).toContain('admin-table-card');
        expect(content, `${name} must include table with className "admin-table"`).toContain('admin-table');
        expect(content, `${name} must include .admin-table-footer`).toContain('admin-table-footer');
        expect(content, `${name} must include .admin-table-count`).toContain('admin-table-count');
        expect(content, `${name} must include <Pagination`).toContain('Pagination');
      });
  });

  it('all admin pages must be registered in AdminHeader breadcrumbs', () => {
    const headerContent = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/layout/AdminHeader.tsx'),
      'utf-8'
    );
    const adminDir = path.resolve(process.cwd(), 'src/app/admin');
    const entries = fs.readdirSync(adminDir, { withFileTypes: true });
    
    entries.forEach((entry) => {
      if (entry.isDirectory()) {
        const pagePath = path.join(adminDir, entry.name, 'page.tsx');
        if (fs.existsSync(pagePath)) {
          const route = `/admin/${entry.name}`;
          expect(
            headerContent,
            `Route ${route} must be registered in ADMIN_BREADCRUMBS in AdminHeader.tsx`
          ).toContain(route);
        }
      }
    });
  });

  it('no admin page should render standalone h1 inside page content (title is in breadcrumb)', () => {
    adminPages.forEach(({ name, path: filePath }) => {
      const content = fs.readFileSync(path.resolve(process.cwd(), filePath), 'utf-8');
      expect(
        content.includes('<h1'),
        `${name} should not contain <h1> inside page body as title is handled by AdminHeader breadcrumb`
      ).toBe(false);
    });
  });

  it('globals.css defines all standardized design tokens and utility classes', () => {
    const cssContent = fs.readFileSync(path.resolve(process.cwd(), 'src/app/globals.css'), 'utf-8');
    expect(cssContent).toContain('.admin-action-header');
    expect(cssContent).toContain('.admin-filter-card');
    expect(cssContent).toContain('.admin-search-wrapper');
    expect(cssContent).toContain('.admin-table-card');
    expect(cssContent).toContain('.admin-table');
    expect(cssContent).toContain('.admin-table-actions');
    expect(cssContent).toContain('.admin-table-footer');
    expect(cssContent).toContain('.admin-table-count');
  });
});
