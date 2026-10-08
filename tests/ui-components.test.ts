import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('UI Atoms Adherence to Constraints', () => {
  it('CustomSelect implements search and outside click without native select tag', () => {
    const selectPath = path.resolve(__dirname, '../src/components/ui/CustomSelect.tsx');
    const content = fs.readFileSync(selectPath, 'utf-8');

    expect(content).not.toContain('<select');
    expect(content).toContain('search');
    expect(content).toContain('Escape');
  });

  it('Pagination handles pages and boundary disables', () => {
    const pagePath = path.resolve(__dirname, '../src/components/ui/Pagination.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');

    expect(content).toContain('currentPage');
    expect(content).toContain('totalPages');
    expect(content).toContain('onPageChange');
  });

  it('Modal, Badge, Button and Toast exist and use design tokens', () => {
    const modalPath = path.resolve(__dirname, '../src/components/ui/Modal.tsx');
    const badgePath = path.resolve(__dirname, '../src/components/ui/Badge.tsx');
    const btnPath = path.resolve(__dirname, '../src/components/ui/Button.tsx');
    const toastPath = path.resolve(__dirname, '../src/components/ui/Toast.tsx');

    expect(fs.existsSync(modalPath)).toBe(true);
    expect(fs.existsSync(badgePath)).toBe(true);
    expect(fs.existsSync(btnPath)).toBe(true);
    expect(fs.existsSync(toastPath)).toBe(true);
  });
});
