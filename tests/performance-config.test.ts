import { describe, it, expect } from 'vitest';
import nextConfig from '../next.config';

describe('Task 3: Performance & Next.js Bundle Optimization', () => {
  it('enables Gzip/Brotli compression', () => {
    expect(nextConfig.compress).toBe(true);
  });

  it('optimizes package imports for lucide-react', () => {
    expect(nextConfig.experimental?.optimizePackageImports).toContain('lucide-react');
  });

  it('provides security and caching headers for static assets', async () => {
    expect(typeof nextConfig.headers).toBe('function');
    if (nextConfig.headers) {
      const headersConfig = await nextConfig.headers();
      expect(Array.isArray(headersConfig)).toBe(true);
      const staticHeaderRule = headersConfig.find((rule: any) =>
        rule.source.includes(':all*') || rule.source.includes('images') || rule.source.includes('static')
      );
      expect(staticHeaderRule).toBeDefined();
    }
  });
});
