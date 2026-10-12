import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Task 28: Per-Page Tailored Skeleton System & Blueprint Wireframes', () => {
  it('has reusable skeleton components in src/components/ui/Skeletons.tsx', () => {
    const filePath = path.resolve(process.cwd(), 'src/components/ui/Skeletons.tsx');
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('SkeletonBox');
    expect(content).toContain('RoomCardSkeleton');
    expect(content).toContain('AdminDashboardSkeleton');
    expect(content).toContain('AdminTableSkeleton');
  });

  it('has route-specific loading.tsx for /rooms catalog', () => {
    const filePath = path.resolve(process.cwd(), 'src/app/(public)/rooms/loading.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('RoomCardSkeleton');
  });

  it('has route-specific loading.tsx for /rooms/[slug] detail without raw breadcrumb slashes', () => {
    const filePath = path.resolve(process.cwd(), 'src/app/(public)/rooms/[slug]/loading.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('gallery');
    expect(content).not.toContain('>/<');
  });

  it('has route-specific loading.tsx for /booking checkout', () => {
    const filePath = path.resolve(process.cwd(), 'src/app/(public)/booking/loading.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('booking');
  });

  it('has route-specific loading.tsx for /track booking tracker', () => {
    const filePath = path.resolve(process.cwd(), 'src/app/(public)/track/loading.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('track');
  });

  it('has route-specific loading.tsx for /admin dashboard', () => {
    const filePath = path.resolve(process.cwd(), 'src/app/admin/loading.tsx');
    expect(fs.existsSync(filePath)).toBe(true);
    const content = fs.readFileSync(filePath, 'utf-8');
    expect(content).toContain('AdminDashboardSkeleton');
  });

  it('defines .skeleton-box and .skeleton-shimmer in globals.css', () => {
    const cssPath = path.resolve(process.cwd(), 'src/app/globals.css');
    const content = fs.readFileSync(cssPath, 'utf-8');
    expect(content).toContain('.skeleton-box');
    expect(content).toContain('.skeleton-shimmer::after');
  });
});
