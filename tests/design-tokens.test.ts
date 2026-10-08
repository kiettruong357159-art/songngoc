import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Design Tokens Integrity', () => {
  it('globals.css must define required brand and status tokens', () => {
    const cssPath = path.resolve(__dirname, '../src/app/globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    expect(cssContent).toContain('--color-primary: #0f5b66');
    expect(cssContent).toContain('--color-accent: #c49a45');
    expect(cssContent).toContain('--color-room-available: #10b981');
    expect(cssContent).toContain('--color-room-occupied: #ef4444');
    expect(cssContent).toContain('--color-room-dirty: #f59e0b');
    expect(cssContent).toContain('--color-room-cleaning: #3b82f6');
    expect(cssContent).toContain('--color-room-maintenance: #6b7280');
    expect(cssContent).toContain('backdrop-filter: blur(12px)');
  });
});
