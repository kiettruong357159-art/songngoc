import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 11: System-Wide Custom Scrollbar (Chuẩn hóa thanh cuộn toàn hệ thống)', () => {
  const globalsCssPath = path.resolve(process.cwd(), 'src/app/globals.css');
  const sidebarPath = path.resolve(process.cwd(), 'src/components/layout/AdminSidebar.tsx');

  it('globals.css chứa đầy đủ design tokens cho thanh cuộn', () => {
    expect(fs.existsSync(globalsCssPath)).toBe(true);
    const css = fs.readFileSync(globalsCssPath, 'utf-8');

    expect(css).toContain('--scrollbar-width:');
    expect(css).toContain('--scrollbar-track:');
    expect(css).toContain('--scrollbar-thumb:');
    expect(css).toContain('--scrollbar-thumb-hover:');
  });

  it('globals.css cấu hình thanh cuộn mảnh toàn hệ thống và loại bỏ nút mũi tên thô của Windows', () => {
    const css = fs.readFileSync(globalsCssPath, 'utf-8');

    // Hỗ trợ Firefox/CSS chuẩn
    expect(css).toContain('scrollbar-width: thin');
    expect(css).toContain('scrollbar-color: var(--scrollbar-thumb)');

    // Hỗ trợ WebKit (Chrome, Edge, Safari)
    expect(css).toContain('::-webkit-scrollbar {');
    expect(css).toContain('::-webkit-scrollbar-track');
    expect(css).toContain('::-webkit-scrollbar-thumb');
    expect(css).toContain('border-radius: var(--radius-full)');

    // Triệt tiêu nút mũi tên mặc định
    expect(css).toContain('::-webkit-scrollbar-button');
    expect(css).toContain('display: none !important');
  });

  it('globals.css và AdminSidebar.tsx có thanh cuộn Dark Mode riêng biệt cho thanh điều hướng', () => {
    const css = fs.readFileSync(globalsCssPath, 'utf-8');
    expect(css).toContain('.admin-sidebar-nav');
    expect(css).toContain('.admin-sidebar nav');
    expect(css).toContain('rgba(255, 255, 255, 0.18)');

    const sidebarCode = fs.readFileSync(sidebarPath, 'utf-8');
    expect(sidebarCode).toContain('className="admin-sidebar-nav"');
  });
});
