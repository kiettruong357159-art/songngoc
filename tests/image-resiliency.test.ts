import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Task 27: System-Wide Image Resiliency & SafeImage Fallback', () => {
  it('has placeholder-room.svg in public/images/', () => {
    const svgPath = path.resolve(process.cwd(), 'public/images/placeholder-room.svg');
    expect(fs.existsSync(svgPath)).toBe(true);

    const content = fs.readFileSync(svgPath, 'utf-8');
    expect(content).toContain('<svg');
    expect(content).toContain('</svg>');
    // Verify brand colors are utilized
    expect(content.toLowerCase()).toMatch(/#0f5b66|#c49a45|#faf8f5|#ede7df/);
  });

  it('has SafeImage client component with fallback and onError handling', () => {
    const componentPath = path.resolve(process.cwd(), 'src/components/ui/SafeImage.tsx');
    expect(fs.existsSync(componentPath)).toBe(true);

    const content = fs.readFileSync(componentPath, 'utf-8');
    expect(content).toContain("'use client'");
    expect(content).toContain('SafeImage');
    expect(content).toContain('onError');
    expect(content).toContain('placeholder-room.svg');
    expect(content).toContain('isValidImageSrc');
  });

  it('isValidImageSrc correctly validates URLs and paths', async () => {
    const { isValidImageSrc } = await import('../src/components/ui/SafeImage');

    // Valid paths and URLs
    expect(isValidImageSrc('/uploads/rooms/room-123.jpg')).toBe(true);
    expect(isValidImageSrc('/images/placeholder-room.svg')).toBe(true);
    expect(isValidImageSrc('https://images.unsplash.com/photo-123')).toBe(true);
    expect(isValidImageSrc('http://example.com/pic.png')).toBe(true);
    expect(isValidImageSrc('data:image/png;base64,iVBORw0KGgo=')).toBe(true);

    // Invalid URLs that would cause new URL() to crash
    expect(isValidImageSrc('')).toBe(false);
    expect(isValidImageSrc('   ')).toBe(false);
    expect(isValidImageSrc(null)).toBe(false);
    expect(isValidImageSrc(undefined)).toBe(false);
    expect(isValidImageSrc('not-a-url')).toBe(false);
    expect(isValidImageSrc('htp://bad-protocol')).toBe(false);
    expect(isValidImageSrc('abc.com')).toBe(false);
  });
});
