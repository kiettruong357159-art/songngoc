import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE_NAME, requirePermission } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'rooms:view');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const { id } = await params;
    const roomType = await db.roomType.findUnique({
      where: { id },
      include: {
        _count: {
          select: { rooms: true, bookings: true },
        },
      },
    });

    if (!roomType) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy hạng phòng' }, { status: 404 });
    }

    return NextResponse.json({ success: true, roomType });
  } catch (error) {
    console.error('Error getting room type detail:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải thông tin hạng phòng' }, { status: 500 });
  }
}

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
    const existing = await db.roomType.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy hạng phòng cần xóa' }, { status: 404 });
    }

    // 1. Kiểm tra ràng buộc: Còn phòng thực tế nào thuộc hạng phòng này không?
    const roomCount = await db.room.count({
      where: { roomTypeId: id },
    });
    if (roomCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Không thể xóa hạng phòng "${existing.name}" vì đang có ${roomCount} phòng thực tế liên kết. Vui lòng chuyển các phòng sang hạng khác hoặc tạm ngưng kinh doanh.`,
        },
        { status: 400 }
      );
    }

    // 2. Kiểm tra ràng buộc: Còn đơn đặt phòng nào liên kết không?
    const bookingCount = await db.booking.count({
      where: { roomTypeId: id },
    });
    if (bookingCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Không thể xóa hạng phòng "${existing.name}" vì đang có ${bookingCount} đơn đặt phòng liên kết. Bạn có thể chọn Tạm ngưng kinh doanh thay vì xóa.`,
        },
        { status: 400 }
      );
    }

    // Thực hiện xóa an toàn
    await db.roomType.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa hạng phòng "${existing.name}" thành công`,
    });
  } catch (error) {
    console.error('Error deleting room type:', error);
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ khi xóa hạng phòng' }, { status: 500 });
  }
}
