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
  });
});
