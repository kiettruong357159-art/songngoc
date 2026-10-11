import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE_NAME, requirePermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'rooms:view');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const floorId = searchParams.get('floorId');
    const status = searchParams.get('status');

    const roomWhere: Record<string, any> = {};
    if (floorId) roomWhere.floorId = floorId;
    if (status) roomWhere.status = status;

    const floors = await db.floor.findMany({
      orderBy: { floorNumber: 'asc' },
      include: {
        rooms: {
          where: roomWhere,
          orderBy: { roomNumber: 'asc' },
          include: {
            roomType: true,
            floor: true,
            bookings: {
              where: { status: 'CHECKED_IN' },
              include: { guest: true },
              take: 1,
            },
          },
        },
      },
    });

    const formattedFloors = floors.map((floor) => ({
      id: floor.id,
      name: floor.name,
      floorNumber: floor.floorNumber,
      rooms: floor.rooms.map((room) => ({
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
      })),
    }));

    return NextResponse.json({
      success: true,
      floors: formattedFloors,
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách sơ đồ phòng' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/rooms
 * Tạo phòng mới thuộc một tầng và một hạng phòng
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'rooms:view');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const roomNumber = typeof body.roomNumber === 'string' ? body.roomNumber.trim() : '';
    const floorId = typeof body.floorId === 'string' ? body.floorId.trim() : '';
    const roomTypeId = typeof body.roomTypeId === 'string' ? body.roomTypeId.trim() : '';
    const note = typeof body.note === 'string' ? body.note.trim() : null;

    if (!roomNumber) {
      return NextResponse.json({ success: false, error: 'Số phòng không được để trống' }, { status: 400 });
    }

    if (!floorId) {
      return NextResponse.json({ success: false, error: 'Vui lòng chọn tầng cho phòng' }, { status: 400 });
    }

    if (!roomTypeId) {
      return NextResponse.json({ success: false, error: 'Vui lòng chọn hạng phòng' }, { status: 400 });
    }

    // 1. Kiểm tra tầng tồn tại
    const floor = await db.floor.findUnique({
      where: { id: floorId },
    });
    if (!floor) {
      return NextResponse.json({ success: false, error: 'Tầng đã chọn không tồn tại' }, { status: 400 });
    }

    // 2. Kiểm tra hạng phòng tồn tại
    const roomType = await db.roomType.findUnique({
      where: { id: roomTypeId },
    });
    if (!roomType) {
      return NextResponse.json({ success: false, error: 'Hạng phòng đã chọn không tồn tại' }, { status: 400 });
    }

    // 3. Kiểm tra số phòng không được trùng lặp
    const existingRoom = await db.room.findUnique({
      where: { roomNumber },
    });
    if (existingRoom) {
      return NextResponse.json(
        { success: false, error: `Số phòng ${roomNumber} đã tồn tại trong hệ thống` },
        { status: 400 }
      );
    }

    // 4. Tạo phòng
    const newRoom = await db.room.create({
      data: {
        roomNumber,
        floorId,
        roomTypeId,
        note: note || null,
        status: 'AVAILABLE',
      },
      include: {
        roomType: true,
        floor: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Đã tạo phòng ${newRoom.roomNumber} thành công`,
        room: {
          id: newRoom.id,
          roomNumber: newRoom.roomNumber,
          status: newRoom.status,
          note: newRoom.note,
          roomType: {
            id: newRoom.roomType.id,
            name: newRoom.roomType.name,
            slug: newRoom.roomType.slug,
            basePrice: newRoom.roomType.basePrice,
            bedType: newRoom.roomType.bedType,
          },
          floor: {
            id: newRoom.floor.id,
            name: newRoom.floor.name,
            floorNumber: newRoom.floor.floorNumber,
          },
          currentBooking: null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ khi tạo phòng mới' }, { status: 500 });
  }
}

