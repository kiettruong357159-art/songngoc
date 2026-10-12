import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'songngoc_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'songngoc-secret-salt-key-hmac-sha256-2026';

function decodeBase64Url(str: string): string {
  // Edge-compatible base64url decode using atob
  const pad = str.length % 4 === 0 ? '' : '='.repeat(4 - (str.length % 4));
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + pad;
  try {
    return atob(base64);
  } catch {
    throw new Error('decode failed');
  }
}

async function verifySignatureHmac(payloadB64: string, signature: string): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
    const sigBytes = Uint8Array.from(atob(signature.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (signature.length % 4)) % 4)), c => c.charCodeAt(0));
    const dataBytes = enc.encode(payloadB64);
    // Compute expected and compare via subtle.verify for timing safety
    const sigBuffer = sigBytes.buffer as ArrayBuffer;
    return await crypto.subtle.verify('HMAC', key, sigBuffer, dataBytes);
  } catch {
    return false;
  }
}

async function verifyTokenEdge(token: string): Promise<Record<string, any> | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadB64, sig] = parts;
    if (!payloadB64 || !sig) return null;
    const ok = await verifySignatureHmac(payloadB64, sig);
    if (!ok) return null;
    const jsonStr = decodeBase64Url(payloadB64);
    const payload = JSON.parse(jsonStr);
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Edge Middleware kiểm soát bảo mật và chống FOUC (< 5ms)
 * Chặn đứng truy cập trái phép vào tuyến /admin ngay tại Edge Network
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  const validRoles = ['ADMIN', 'RECEPTIONIST', 'HOUSEKEEPING', 'MANAGER'] as const;

  // Xử lý /admin/login: user đã đăng nhập chuyển về /admin, chưa đăng nhập chuyển về /login
  if (pathname === '/admin/login') {
    if (sessionToken) {
      const payload = await verifyTokenEdge(sessionToken);
      if (payload && payload.role && (validRoles as readonly string[]).includes(payload.role)) {
        return NextResponse.redirect(new URL('/admin', req.url));
      }
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Bỏ qua trang /login thông thường
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Bảo vệ nghiêm ngặt toàn bộ tuyến /admin — verify HMAC (Edge-compatible WebCrypto)
  if (pathname.startsWith('/admin')) {
    if (!sessionToken) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    const payload = await verifyTokenEdge(sessionToken);
    if (!payload || !payload.role || !(validRoles as readonly string[]).includes(payload.role)) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
