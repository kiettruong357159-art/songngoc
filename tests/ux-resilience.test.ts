import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Task 5: UX Resilience - Global 0ms Loading Shimmer & Error Boundary', () => {
  it('has global loading.tsx with skeleton shimmer elements', () => {
    const loadingPath = path.resolve(process.cwd(), 'src/app/loading.tsx');
    expect(fs.existsSync(loadingPath)).toBe(true);

    const content = fs.readFileSync(loadingPath, 'utf-8');
    expect(content).toContain('skeleton');
    expect(content).toContain('container');
  });

  it('has global error.tsx client component with reset error recovery action', () => {
    const errorPath = path.resolve(process.cwd(), 'src/app/error.tsx');
    expect(fs.existsSync(errorPath)).toBe(true);

    const content = fs.readFileSync(errorPath, 'utf-8');
    expect(content).toContain("'use client'");
    expect(content).toContain('reset');
    expect(content).toContain('Thử lại');
  });

  it('defines shimmer animation in src/app/globals.css', () => {
    const cssPath = path.resolve(process.cwd(), 'src/app/globals.css');
    const content = fs.readFileSync(cssPath, 'utf-8');

    expect(content).toContain('@keyframes shimmer');
    expect(content).toContain('skeleton-shimmer');
  });
});
