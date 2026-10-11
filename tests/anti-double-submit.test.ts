import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/booking/availability/route';

describe('Task 4: Anti-Double Submit & Edge CDN Caching', () => {
  it('has guard if (submitting) return; in booking form handleSubmit', () => {
    const pagePath = path.resolve(process.cwd(), 'src/app/(public)/booking/page.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');

    // Chốt chặn logic chống spam click/double submit
    expect(content).toContain('if (submitting) return;');
  });

  it('sets Cache-Control header for Edge CDN on public availability endpoint', async () => {
    const routePath = path.resolve(process.cwd(), 'src/app/api/booking/availability/route.ts');
    const content = fs.readFileSync(routePath, 'utf-8');

    expect(content).toContain('Cache-Control');
    expect(content).toContain('s-maxage=');

    // Gọi endpoint thực tế và kiểm tra header phản hồi
    const req = new NextRequest('http://localhost:3000/api/booking/availability');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const cacheHeader = res.headers.get('cache-control');
    expect(cacheHeader).toBeDefined();
    expect(cacheHeader).toContain('s-maxage=');
    expect(cacheHeader).toContain('stale-while-revalidate=');
  });
});
