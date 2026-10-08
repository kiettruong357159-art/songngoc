import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập tên đăng nhập và mật khẩu' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { username },
      include: { role: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Tài khoản không tồn tại hoặc đã bị khóa' },
        { status: 401 }
      );
    }

    const isMatch = verifyPassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    let permissions: string[] = [];
    try {
      permissions = JSON.parse(user.role.permissions);
    } catch {
      permissions = [user.role.permissions];
    }

    const token = createSessionToken({
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role.code,
      permissions,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role.code,
          roleName: user.role.name,
          permissions,
        },
      },
    });

    // Thiết lập cookie phiên an toàn HTTP-Only
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 ngày
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi đăng nhập hệ thống' },
      { status: 500 }
    );
  }
}
