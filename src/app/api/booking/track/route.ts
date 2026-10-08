import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query')?.trim();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập Số điện thoại hoặc Mã đặt phòng' },
        { status: 400 }
      );
    }

    const bookings = await db.booking.findMany({
      where: {
        OR: [
          { bookingCode: { contains: query } },
          { guest: { phone: { contains: query } } },
        ],
      },
      include: {
        guest: true,
        roomType: true,
        room: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: bookings,
    });
  } catch (error: any) {
    console.error('Error tracking booking:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tra cứu thông tin đặt phòng' },
      { status: 500 }
    );
  }
}
