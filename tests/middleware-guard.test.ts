import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware, config } from '@/middleware';
import { createSessionToken } from '@/lib/auth';

describe('Task 26: Edge Middleware & Zero-FOUC Route Protection', () => {
  it('has matcher configured for /admin/:path*', () => {
    expect(config.matcher).toBeDefined();
    expect(config.matcher).toContain('/admin/:path*');
  });

  it('redirects unauthenticated requests to /admin to /login?redirect=...', () => {
    const req = new NextRequest('http://localhost:3000/admin/bookings');
    const res = middleware(req);

    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/login');
    expect(location).toContain('redirect=%2Fadmin%2Fbookings');
  });

  it('allows authenticated admin staff with valid session token to pass through', () => {
    const token = createSessionToken({
      userId: 'admin-1',
      username: 'admin',
      role: 'ADMIN',
      permissions: ['*'],
    });

    const req = new NextRequest('http://localhost:3000/admin');
    req.cookies.set('songngoc_session', token);

    const res = middleware(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('redirects expired or invalid session token to /login', () => {
    const expiredToken = createSessionToken({
      userId: 'admin-1',
      username: 'admin',
      role: 'ADMIN',
      permissions: ['*'],
      exp: Date.now() - 10000, // expired
    });

    const req = new NextRequest('http://localhost:3000/admin/dashboard');
    req.cookies.set('songngoc_session', expiredToken);

    const res = middleware(req);
    expect(res.status).toBe(307);
    const location = res.headers.get('location');
    expect(location).toContain('/login');
  });
});
