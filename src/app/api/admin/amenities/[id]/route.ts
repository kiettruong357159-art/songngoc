import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE_NAME, requirePermission } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'rooms:manage');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu mã ID tiện nghi' }, { status: 400 });
    }

    const existing = await db.amenity.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Tiện nghi không tồn tại hoặc đã bị xóa trước đó' }, { status: 404 });
    }

    await db.amenity.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa tiện nghi "${existing.name}" thành công`,
    });
  } catch (error) {
    console.error('Error deleting amenity:', error);
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ khi xóa tiện nghi' }, { status: 500 });
  }
}
