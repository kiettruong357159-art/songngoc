import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Logo & Favicon Assets', () => {
  it('app icon.svg and apple-icon.svg exist with valid SVG content', () => {
    const iconPath = path.resolve(__dirname, '../src/app/icon.svg');
    const appleIconPath = path.resolve(__dirname, '../src/app/apple-icon.svg');

    expect(fs.existsSync(iconPath)).toBe(true);
    expect(fs.existsSync(appleIconPath)).toBe(true);

    const iconContent = fs.readFileSync(iconPath, 'utf-8');
    expect(iconContent).toContain('<svg');
    expect(iconContent).toContain('</svg>');
  });

  it('public favicon.svg and logo.svg exist with Song Ngọc branding', () => {
    const favPath = path.resolve(__dirname, '../public/favicon.svg');
    const logoPath = path.resolve(__dirname, '../public/logo.svg');

    expect(fs.existsSync(favPath)).toBe(true);
    expect(fs.existsSync(logoPath)).toBe(true);

    const logoContent = fs.readFileSync(logoPath, 'utf-8');
    expect(logoContent).toContain('Song Ngọc');
    expect(logoContent).toContain('HOMESTAY PHAN THIẾT');
  });

  it('layout.tsx configures icons metadata', () => {
    const layoutPath = path.resolve(__dirname, '../src/app/layout.tsx');
    const content = fs.readFileSync(layoutPath, 'utf-8');

    expect(content).toContain('icons:');
    expect(content).toContain('/favicon.svg');
    expect(content).toContain('/apple-icon.svg');
  });

  it('PublicHeader displays logo emblem', () => {
    const headerPath = path.resolve(__dirname, '../src/components/layout/PublicHeader.tsx');
    const content = fs.readFileSync(headerPath, 'utf-8');

    expect(content).toContain('/favicon.svg');
    expect(content).toContain('Song Ngọc');
  });
});
