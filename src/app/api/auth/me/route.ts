import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    const response = NextResponse.json({ success: false, user: null }, { status: 401 });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }

  return NextResponse.json({
    success: true,
    user: payload,
  });
}
