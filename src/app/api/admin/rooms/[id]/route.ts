import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE_NAME, requirePermission } from '@/lib/auth';
import { RoomStatus, ROOM_STATUS } from '@/lib/constants';

/**
 * GET /api/admin/rooms/[id]
 * Lấy thông tin chi tiết một phòng
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'rooms:view');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const room = await db.room.findUnique({
      where: { id },
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

    if (!room) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy phòng' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        roomNumber: room.roomNumber,
        status: room.status,
        note: room.note,
        roomType: {
          id: room.roomType.id,
          name: room.roomType.name,
          slug: room.roomType.slug,
          basePrice: room.roomType.basePrice,
          bedType: room.roomType.bedType,
        },
        floor: {
          id: room.floor.id,
          name: room.floor.name,
          floorNumber: room.floor.floorNumber,
        },
        currentBooking: room.bookings[0]
          ? {
              id: room.bookings[0].id,
              bookingCode: room.bookings[0].bookingCode,
              guest: {
                fullName: room.bookings[0].guest.fullName,
                phone: room.bookings[0].guest.phone,
              },
              checkIn: room.bookings[0].checkIn,
              checkOut: room.bookings[0].checkOut,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error fetching room detail:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải thông tin phòng' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/rooms/[id]
 * Cập nhật thông tin phòng (số phòng, tầng, hạng phòng, ghi chú, trạng thái)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'rooms:view');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const existingRoom = await db.room.findUnique({
      where: { id },
    });
    if (!existingRoom) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy phòng cần sửa' }, { status: 404 });
    }

    const body = await request.json();
    const roomNumber = typeof body.roomNumber === 'string' ? body.roomNumber.trim() : existingRoom.roomNumber;
    const floorId = typeof body.floorId === 'string' ? body.floorId.trim() : existingRoom.floorId;
    const roomTypeId = typeof body.roomTypeId === 'string' ? body.roomTypeId.trim() : existingRoom.roomTypeId;
    const note = body.note !== undefined ? (typeof body.note === 'string' ? body.note.trim() : null) : existingRoom.note;
    const status = body.status !== undefined ? (body.status as RoomStatus) : existingRoom.status;

    if (!roomNumber) {
      return NextResponse.json({ success: false, error: 'Số phòng không được để trống' }, { status: 400 });
    }

    if (status && !(Object.values(ROOM_STATUS) as string[]).includes(status)) {
      return NextResponse.json({ success: false, error: 'Trạng thái phòng không hợp lệ' }, { status: 400 });
    }

    // 1. Nếu đổi roomNumber, kiểm tra xem có bị trùng với phòng khác không
    if (roomNumber !== existingRoom.roomNumber) {
      const duplicate = await db.room.findFirst({
        where: {
          roomNumber,
          NOT: { id },
        },
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: `Số phòng ${roomNumber} đã được sử dụng bởi phòng khác` },
          { status: 400 }
        );
      }
    }

    // 2. Kiểm tra floorId nếu thay đổi
    if (floorId !== existingRoom.floorId) {
      const floorExists = await db.floor.findUnique({ where: { id: floorId } });
      if (!floorExists) {
        return NextResponse.json({ success: false, error: 'Tầng đã chọn không tồn tại' }, { status: 400 });
      }
    }

    // 3. Kiểm tra roomTypeId nếu thay đổi
    if (roomTypeId !== existingRoom.roomTypeId) {
      const typeExists = await db.roomType.findUnique({ where: { id: roomTypeId } });
      if (!typeExists) {
        return NextResponse.json({ success: false, error: 'Hạng phòng đã chọn không tồn tại' }, { status: 400 });
      }
    }

    const updated = await db.room.update({
      where: { id },
      data: {
        roomNumber,
        floorId,
        roomTypeId,
        note: note || null,
        status: status as any,
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
      message: `Đã cập nhật phòng ${updated.roomNumber} thành công`,
      room: {
        id: updated.id,
        roomNumber: updated.roomNumber,
        status: updated.status,
        note: updated.note,
        roomType: {
          id: updated.roomType.id,
          name: updated.roomType.name,
          slug: updated.roomType.slug,
          basePrice: updated.roomType.basePrice,
          bedType: updated.roomType.bedType,
        },
        floor: {
          id: updated.floor.id,
          name: updated.floor.name,
          floorNumber: updated.floor.floorNumber,
        },
        currentBooking: updated.bookings[0]
          ? {
              id: updated.bookings[0].id,
              bookingCode: updated.bookings[0].bookingCode,
              guest: {
                fullName: updated.bookings[0].guest.fullName,
                phone: updated.bookings[0].guest.phone,
              },
              checkIn: updated.bookings[0].checkIn,
              checkOut: updated.bookings[0].checkOut,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ khi cập nhật phòng' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/rooms/[id]
 * Xóa phòng khỏi hệ thống
 * Ràng buộc an toàn: Không xóa nếu phòng đang OCCUPIED hoặc có booking đang active
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'rooms:view');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const room = await db.room.findUnique({
      where: { id },
      include: {
        bookings: {
          where: {
            status: { in: ['CHECKED_IN', 'CONFIRMED'] },
          },
          take: 1,
        },
      },
    });

    if (!room) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy phòng cần xóa' }, { status: 404 });
    }

    // 1. Chặn xóa nếu phòng đang có khách ở
    if (room.status === 'OCCUPIED') {
      return NextResponse.json(
        { success: false, error: `Không thể xóa phòng ${room.roomNumber} vì đang có khách lưu trú!` },
        { status: 400 }
      );
    }

    // 2. Chặn xóa nếu có đơn đặt phòng active
    if (room.bookings.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Không thể xóa phòng ${room.roomNumber} vì đang có đơn đặt phòng (Mã: ${room.bookings[0].bookingCode}). Vui lòng hủy hoặc dời đơn sang phòng khác trước.`,
        },
        { status: 400 }
      );
    }

    await db.room.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: `Đã xóa phòng ${room.roomNumber} thành công`,
      id,
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ khi xóa phòng' }, { status: 500 });
  }
}
