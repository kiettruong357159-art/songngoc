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
});
