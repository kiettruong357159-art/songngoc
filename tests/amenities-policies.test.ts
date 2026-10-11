import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { DEFAULT_AMENITIES_SEED } from '@/app/api/admin/amenities/route';
import { AMENITY_ICON_MAP, AVAILABLE_AMENITY_ICONS } from '@/components/admin/AmenityIcon';
import { DEFAULT_HOTEL_POLICIES } from '@/components/admin/RoomTypeModal';

describe('Amenities & Policies Management System', () => {
  it('all required files exist', () => {
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/api/admin/amenities/route.ts'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/api/admin/amenities/[id]/route.ts'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/components/admin/AmenityModal.tsx'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/components/admin/AmenityIcon.tsx'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/admin/amenities/page.tsx'))).toBe(true);
  });

  it('amenities API routes enforce authorization', () => {
    const amenitiesRoute = fs.readFileSync(
      path.resolve(__dirname, '../src/app/api/admin/amenities/route.ts'),
      'utf-8'
    );
    expect(amenitiesRoute).toContain('requirePermission');
    expect(amenitiesRoute).toContain('rooms:view');
    expect(amenitiesRoute).toContain('rooms:manage');
    expect(amenitiesRoute).toContain('export async function GET');
    expect(amenitiesRoute).toContain('export async function POST');
    expect(amenitiesRoute).toContain('export async function PATCH');

    const deleteRoute = fs.readFileSync(
      path.resolve(__dirname, '../src/app/api/admin/amenities/[id]/route.ts'),
      'utf-8'
    );
    expect(deleteRoute).toContain('requirePermission');
    expect(deleteRoute).toContain('rooms:manage');
    expect(deleteRoute).toContain('export async function DELETE');
  });

  it('prisma schema contains Amenity model and RoomType policies field', () => {
    const schemaContent = fs.readFileSync(
      path.resolve(__dirname, '../prisma/schema.prisma'),
      'utf-8'
    );
    expect(schemaContent).toContain('model Amenity');
    expect(schemaContent).toContain('code      String   @unique');
    expect(schemaContent).toContain('category  String');
    expect(schemaContent).toContain('policies     String?');
  });

  it('admin sidebar contains link to /admin/amenities', () => {
    const sidebarContent = fs.readFileSync(
      path.resolve(__dirname, '../src/components/layout/AdminSidebar.tsx'),
      'utf-8'
    );
    expect(sidebarContent).toContain('/admin/amenities');
    expect(sidebarContent).toContain('Danh mục tiện nghi');
  });

  it('room-types API persists policies in POST and PATCH', () => {
    const roomTypesApi = fs.readFileSync(
      path.resolve(__dirname, '../src/app/api/admin/room-types/route.ts'),
      'utf-8'
    );
    expect(roomTypesApi).toContain('policies');
  });

  it('RoomTypeModal contains Section 5 for policies and dynamic amenities', () => {
    const modalContent = fs.readFileSync(
      path.resolve(__dirname, '../src/components/admin/RoomTypeModal.tsx'),
      'utf-8'
    );
    expect(modalContent).toContain('5. Chính Sách Khách Sạn & Nhận Phòng');
    expect(modalContent).toContain('Nạp chính sách mặc định');
    expect(modalContent).toContain('/api/admin/amenities');
  });

  it('Storefront room detail page renders dynamic policies and amenities', () => {
    const roomDetailContent = fs.readFileSync(
      path.resolve(__dirname, '../src/app/(public)/rooms/[slug]/page.tsx'),
      'utf-8'
    );
    expect(roomDetailContent).toContain('policyLines');
    expect(roomDetailContent).toContain('AmenityIcon');
    expect(roomDetailContent).toContain('getCachedAmenities');
  });

  it('default seed data has 20 amenities and valid categories', () => {
    expect(DEFAULT_AMENITIES_SEED.length).toBe(20);
    const validCategories = new Set(['BEDROOM', 'BATHROOM', 'MEDIA', 'GENERAL']);
    for (const item of DEFAULT_AMENITIES_SEED) {
      expect(item.code).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.icon).toBeTruthy();
      expect(validCategories.has(item.category)).toBe(true);
    }
  });

  it('amenity icons are defined and map properly', () => {
    expect(AVAILABLE_AMENITY_ICONS.length).toBeGreaterThan(15);
    expect(AMENITY_ICON_MAP.wifi).toBeDefined();
    expect(AMENITY_ICON_MAP.snowflake).toBeDefined();
    expect(AMENITY_ICON_MAP.bath).toBeDefined();
  });

  it('default hotel policies contain standard guest guidelines', () => {
    expect(DEFAULT_HOTEL_POLICIES).toContain('14:00');
    expect(DEFAULT_HOTEL_POLICIES).toContain('12:00');
    expect(DEFAULT_HOTEL_POLICIES).toContain('CCCD');
    expect(DEFAULT_HOTEL_POLICIES).toContain('Không hút thuốc');
  });
});
