import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  hasPermission,
} from '../src/lib/auth';

describe('Auth & RBAC Discipline', () => {
  it('hashes password with salt and verifies correctly', () => {
    const raw = 'admin123';
    const hashed = hashPassword(raw);
    expect(hashed).toContain(':');
    expect(verifyPassword(raw, hashed)).toBe(true);
    expect(verifyPassword('wrongpassword', hashed)).toBe(false);
  });

  it('signs and verifies HMAC session token correctly', () => {
    const payload = { userId: 'u1', username: 'admin', role: 'ADMIN', permissions: ['*'] };
    const token = createSessionToken(payload);
    const verified = verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.username).toBe('admin');
    expect(verified?.role).toBe('ADMIN');

    // Tampered token fails
    const tampered = token.slice(0, -4) + 'abcd';
    expect(verifySessionToken(tampered)).toBeNull();

    // Malformed token fails
    expect(verifySessionToken('invalid.token.structure')).toBeNull();
  });

  it('evaluates RBAC permissions strictly with wildcard and namespace support', () => {
    const adminPermissions = ['*'];
    const receptionistPermissions = ['rooms:view', 'rooms:status', 'bookings:*', 'invoices:*'];
    const housekeepingPermissions = ['rooms:view', 'rooms:clean'];

    // Admin can do anything
    expect(hasPermission(adminPermissions, 'rooms:view')).toBe(true);
    expect(hasPermission(adminPermissions, 'users:create')).toBe(true);
    expect(hasPermission(adminPermissions, 'any:arbitrary:permission')).toBe(true);

    // Receptionist
    expect(hasPermission(receptionistPermissions, 'rooms:view')).toBe(true);
    expect(hasPermission(receptionistPermissions, 'rooms:status')).toBe(true);
    expect(hasPermission(receptionistPermissions, 'bookings:create')).toBe(true);
    expect(hasPermission(receptionistPermissions, 'bookings:update')).toBe(true);
    expect(hasPermission(receptionistPermissions, 'invoices:create')).toBe(true);
    expect(hasPermission(receptionistPermissions, 'users:delete')).toBe(false);
    expect(hasPermission(receptionistPermissions, 'rooms:clean')).toBe(false);

    // Housekeeping
    expect(hasPermission(housekeepingPermissions, 'rooms:clean')).toBe(true);
    expect(hasPermission(housekeepingPermissions, 'rooms:view')).toBe(true);
    expect(hasPermission(housekeepingPermissions, 'invoices:create')).toBe(false);
    expect(hasPermission(housekeepingPermissions, 'bookings:view')).toBe(false);

    // Empty or invalid
    expect(hasPermission([], 'rooms:view')).toBe(false);
  });

  it('retrieves user from Cookie header via getCurrentUserFromCookie', async () => {
    const { getCurrentUserFromCookie, SESSION_COOKIE_NAME } = await import('../src/lib/auth');
    const token = createSessionToken({
      userId: 'u2',
      username: 'receptionist',
      role: 'RECEPTIONIST',
      permissions: ['bookings:*'],
    });

    // Case 1: Standard Request with Cookie header
    const req = new Request('http://localhost:3000/api/admin/dashboard', {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${token}; other_cookie=123`,
      },
    });

    const user = await getCurrentUserFromCookie(req);
    expect(user).not.toBeNull();
    expect(user?.username).toBe('receptionist');
    expect(user?.role).toBe('RECEPTIONIST');

    // Case 2: Request without cookie
    const emptyReq = new Request('http://localhost:3000/api/admin/dashboard');
    const noUser = await getCurrentUserFromCookie(emptyReq);
    expect(noUser).toBeNull();
  });
});

