import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE_NAME, hasPermission } from '@/lib/auth';
import { RoomStatus } from '@/lib/constants';

const VALID_TRANSITIONS: Record<string, string[]> = {
  AVAILABLE: ['OCCUPIED', 'MAINTENANCE'],
  OCCUPIED: ['DIRTY'],
  DIRTY: ['CLEANING', 'MAINTENANCE'],
  CLEANING: ['AVAILABLE', 'DIRTY', 'MAINTENANCE'],
  MAINTENANCE: ['DIRTY', 'AVAILABLE'],
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const canChangeStatus =
      hasPermission(session.permissions, 'rooms:status') ||
      hasPermission(session.permissions, 'rooms:clean') ||
      hasPermission(session.permissions, '*');

    if (!canChangeStatus) {
      return NextResponse.json(
        { success: false, error: 'Bạn không có quyền thay đổi trạng thái buồng phòng' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, note } = body as { status?: RoomStatus; note?: string };

    const currentRoom = await db.room.findUnique({
      where: { id },
    });

    if (!currentRoom) {
      return NextResponse.json({ success: false, error: 'Phòng không tồn tại' }, { status: 404 });
    }

    // Nếu có thay đổi trạng thái, kiểm tra quy tắc máy trạng thái
    if (status && status !== currentRoom.status) {
      const allowedNext = VALID_TRANSITIONS[currentRoom.status] || [];
      if (!allowedNext.includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: `Chuyển trạng thái không hợp lệ: Không thể chuyển từ ${currentRoom.status} sang ${status}`,
          },
          { status: 400 }
        );
      }
    }

    const updatedRoom = await db.room.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(note !== undefined ? { note } : {}),
      },
      include: {
        roomType: true,
        floor: true,
        bookings: {
          where: { status: 'CHECKED_IN' },
          include: { guest: true },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      success: true,
      room: {
        id: updatedRoom.id,
        roomNumber: updatedRoom.roomNumber,
        status: updatedRoom.status,
        note: updatedRoom.note,
        roomType: {
          id: updatedRoom.roomType.id,
          name: updatedRoom.roomType.name,
          slug: updatedRoom.roomType.slug,
          basePrice: updatedRoom.roomType.basePrice,
          bedType: updatedRoom.roomType.bedType,
        },
        floor: {
          id: updatedRoom.floor.id,
          name: updatedRoom.floor.name,
          floorNumber: updatedRoom.floor.floorNumber,
        },
        currentBooking: updatedRoom.bookings[0]
          ? {
              id: updatedRoom.bookings[0].id,
              bookingCode: updatedRoom.bookings[0].bookingCode,
              guest: {
                fullName: updatedRoom.bookings[0].guest.fullName,
                phone: updatedRoom.bookings[0].guest.phone,
              },
              checkIn: updatedRoom.bookings[0].checkIn,
              checkOut: updatedRoom.bookings[0].checkOut,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error updating room status:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi cập nhật trạng thái phòng' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context);
}
