// Sông Ngọc Hotel - Authentication & RBAC Authorization System
import crypto from 'crypto';

export const SESSION_COOKIE_NAME = 'songngoc_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'songngoc-secret-salt-key-hmac-sha256-2026';

export interface SessionPayload {
  userId: string;
  username: string;
  name?: string;
  role: string;
  permissions: string[];
  exp?: number;
}

/**
 * Mã hóa mật khẩu bằng PBKDF2 với Dynamic Salt 16 bytes
 * Định dạng lưu trữ: "salt:hash"
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Xác thực mật khẩu nhập vào so với chuỗi "salt:hash" đã lưu
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) {
    return false;
  }
  const [salt, originalHash] = storedHash.split(':');
  if (!salt || !originalHash) {
    return false;
  }
  const hashToVerify = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hashToVerify, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Tạo HMAC-SHA256 Signed Session Token
 */
export function createSessionToken(payload: SessionPayload): string {
  const exp = payload.exp || Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 ngày
  const data = { ...payload, exp };

  const encodedData = Buffer.from(JSON.stringify(data)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedData)
    .digest('base64url');

  return `${encodedData}.${signature}`;
}

/**
 * Giải mã và kiểm tra tính toàn vẹn của Session Token
 */
export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedData, signature] = parts;
  if (!encodedData || !signature) return null;

  const expectedSignature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encodedData)
    .digest('base64url');

  try {
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
    if (!isSignatureValid) return null;

    const jsonString = Buffer.from(encodedData, 'base64url').toString('utf-8');
    const payload = JSON.parse(jsonString) as SessionPayload;

    if (payload.exp && payload.exp < Date.now()) {
      return null; // Token hết hạn
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Kiểm tra phân quyền RBAC:
 * - Hỗ trợ quyền siêu quản trị: ["*"]
 * - Hỗ trợ quyền chính xác: "rooms:view"
 * - Hỗ trợ wildcard theo namespace: "bookings:*" bao gồm "bookings:create", "bookings:update", v.v.
 */
export function hasPermission(
  permissions: string[] | string | undefined | null,
  requiredPermission: string
): boolean {
  if (!permissions) return false;

  let permsList: string[] = [];
  if (typeof permissions === 'string') {
    try {
      permsList = JSON.parse(permissions);
    } catch {
      permsList = [permissions];
    }
  } else if (Array.isArray(permissions)) {
    permsList = permissions;
  }

  if (permsList.includes('*')) {
    return true;
  }

  if (permsList.includes(requiredPermission)) {
    return true;
  }

  // Kiểm tra wildcard namespace (ví dụ: 'bookings:*' cho 'bookings:create')
  if (requiredPermission.includes(':')) {
    const [namespace] = requiredPermission.split(':');
    if (permsList.includes(`${namespace}:*`)) {
      return true;
    }
  }

  return false;
}

/**
 * Kiểm tra quyền bắt buộc trong Server Action hoặc Route Handler
 */
export function requirePermission(
  user: SessionPayload | null | undefined,
  requiredPermission: string
): { authorized: boolean; error?: string } {
  if (!user) {
    return { authorized: false, error: 'Chưa đăng nhập (Unauthorized)' };
  }

  if (!hasPermission(user.permissions, requiredPermission)) {
    return { authorized: false, error: 'Không có quyền truy cập (Forbidden)' };
  }

  return { authorized: true };
}
