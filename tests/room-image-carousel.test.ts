import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 10: Room Image Carousel (Trình chiếu ảnh Hạng phòng)', () => {
  it('Component RoomImageCarousel.tsx tồn tại và khai báo chuẩn Client Component', () => {
    const componentPath = path.resolve(process.cwd(), 'src/components/room/RoomImageCarousel.tsx');
    expect(fs.existsSync(componentPath)).toBe(true);

    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain("'use client'");
    expect(content).toContain('export function RoomImageCarousel');
    expect(content).toContain('SafeImage');
  });

  it('Component có đầy đủ tính năng: nút Glassmorphic Prev/Next, Badge đếm ảnh, Thumbnail strip, Touch swipe và Lightbox', () => {
    const componentPath = path.resolve(process.cwd(), 'src/components/room/RoomImageCarousel.tsx');
    const content = fs.readFileSync(componentPath, 'utf-8');

    // Nút điều hướng Glassmorphism
    expect(content).toContain('backdropFilter');
    expect(content).toContain('ChevronLeft');
    expect(content).toContain('ChevronRight');

    // Badge đếm ảnh
    expect(content).toContain('Camera');
    expect(content).toContain('currentIndex + 1');
    expect(content).toContain('ảnh');

    // Thumbnail strip
    expect(content).toContain('thumbnailContainerRef');
    expect(content).toContain('goToIndex');

    // Touch swipe di động
    expect(content).toContain('handleTouchStart');
    expect(content).toContain('handleTouchMove');
    expect(content).toContain('handleTouchEnd');

    // Lightbox modal phóng to
    expect(content).toContain('isLightboxOpen');
    expect(content).toContain('setIsLightboxOpen');
    expect(content).toContain('role="dialog"');
  });

  it('Trang chi tiết hạng phòng /rooms/[slug] tích hợp RoomImageCarousel thay cho grid tĩnh', () => {
    const pagePath = path.resolve(process.cwd(), 'src/app/(public)/rooms/[slug]/page.tsx');
    expect(fs.existsSync(pagePath)).toBe(true);

    const content = fs.readFileSync(pagePath, 'utf-8');
    expect(content).toContain("import { RoomImageCarousel } from '@/components/room/RoomImageCarousel'");
    expect(content).toContain('<RoomImageCarousel images={images} roomName={roomType.name} />');
    // Đã thay thế grid tĩnh cũ
    expect(content).not.toContain('{images.map((img, idx) => (');
  });
});
