import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE_NAME, requirePermission, hashPassword } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'users:manage');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const [users, roles] = await Promise.all([
      db.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          phone: true,
          isActive: true,
          roleId: true,
          role: {
            select: {
              id: true,
              code: true,
              name: true,
              permissions: true,
            },
          },
          createdAt: true,
        },
      }),
      db.role.findMany({
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({ success: true, users, roles });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải danh sách nhân viên' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'users:manage');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const { username, password, name, roleId, phone, email, isActive = true } = body;

    if (!username || !password || !name || !roleId) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp đầy đủ tên đăng nhập, mật khẩu, họ tên và vai trò' },
        { status: 400 }
      );
    }

    const existing = await db.user.findUnique({
      where: { username: username.trim().toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Tên đăng nhập đã tồn tại trong hệ thống' },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);

    const newUser = await db.user.create({
      data: {
        username: username.trim().toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        roleId,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        isActive: Boolean(isActive),
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        phone: true,
        isActive: true,
        role: true,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tạo tài khoản nhân viên' }, { status: 500 });
  }
}
