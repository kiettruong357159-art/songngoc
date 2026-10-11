import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'songngoc_session';

/**
 * Edge Middleware kiểm soát bảo mật và chống FOUC (< 5ms)
 * Chặn đứng truy cập trái phép vào tuyến /admin ngay tại Edge Network
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionToken = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Xử lý /admin/login: user đã đăng nhập chuyển về /admin, chưa đăng nhập chuyển về /login
  if (pathname === '/admin/login') {
    if (sessionToken) {
      try {
        const [payloadB64] = sessionToken.split('.');
        if (payloadB64) {
          const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
          const payload = JSON.parse(jsonStr);
          const validRoles = ['ADMIN', 'RECEPTIONIST', 'HOUSEKEEPING', 'MANAGER'];
          if (
            payload.role &&
            validRoles.includes(payload.role) &&
            (!payload.exp || Date.now() <= payload.exp)
          ) {
            return NextResponse.redirect(new URL('/admin', req.url));
          }
        }
      } catch {
        // Token lỗi -> chuyển về /login
      }
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Bỏ qua trang /login thông thường
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Bảo vệ nghiêm ngặt toàn bộ tuyến /admin
  if (pathname.startsWith('/admin')) {
    if (!sessionToken) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const [payloadB64] = sessionToken.split('.');
      if (!payloadB64) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      const jsonStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
      const payload = JSON.parse(jsonStr);

      // Danh sách các vai trò nhân sự hợp lệ được phép vào CMS/PMS
      const validRoles = ['ADMIN', 'RECEPTIONIST', 'HOUSEKEEPING', 'MANAGER'];
      if (
        !payload.role ||
        !validRoles.includes(payload.role) ||
        (payload.exp && Date.now() > payload.exp)
      ) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
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
