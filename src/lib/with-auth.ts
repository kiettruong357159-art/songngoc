// DRY Auth wrapper for API routes
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromCookie, requirePermission, SessionPayload } from './auth';

type Handler = (req: NextRequest, user: SessionPayload, context?: any) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: Handler, requiredPermission: string) {
  return async (request: NextRequest, context?: any) => {
    const user = await getCurrentUserFromCookie(request);
    const check = requirePermission(user, requiredPermission);
    if (!check.authorized) {
      const status = !user ? 401 : 403;
      return NextResponse.json({ success: false, error: check.error }, { status });
    }
    return handler(request, user as SessionPayload, context);
  };
}

export function withAuthNoPerm(handler: Handler) {
  return async (request: NextRequest, context?: any) => {
    const user = await getCurrentUserFromCookie(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập (Unauthorized)' }, { status: 401 });
    }
    return handler(request, user, context);
  };
}
