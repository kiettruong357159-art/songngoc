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
