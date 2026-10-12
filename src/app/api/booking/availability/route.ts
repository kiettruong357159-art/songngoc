import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRoomTypeAvailability, getBatchAvailability } from '@/lib/availability';

const EDGE_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roomTypeId = searchParams.get('roomTypeId');
    const checkInParam = searchParams.get('checkIn');
    const checkOutParam = searchParams.get('checkOut');

    const now = new Date();
    const checkIn = checkInParam ? new Date(checkInParam) : new Date(now.getTime() + 86400000);
    const checkOut = checkOutParam ? new Date(checkOutParam) : new Date(now.getTime() + 86400000 * 3);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
      return NextResponse.json(
        { success: false, error: 'Khoảng thời gian nhận/trả phòng không hợp lệ' },
        { status: 400 }
      );
    }

    if (roomTypeId) {
      const result = await getRoomTypeAvailability(db, roomTypeId, checkIn, checkOut);
      return NextResponse.json(
        { success: true, data: result },
        { headers: EDGE_CACHE_HEADERS }
      );
    }

    // Nếu không truyền roomTypeId, trả về tình trạng phòng của tất cả RoomTypes
    const roomTypes = await db.roomType.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
    });

    const batch = await getBatchAvailability(db, roomTypes.map((r) => r.id), checkIn, checkOut);
    const results = roomTypes.map((rt) => ({ ...rt, ...(batch.get(rt.id) as any) }));

    return NextResponse.json(
      { success: true, data: results },
      { headers: EDGE_CACHE_HEADERS }
    );
  } catch (error: any) {
    console.error('Availability check error:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi khi kiểm tra tình trạng phòng' },
      { status: 500 }
    );
  }
}
