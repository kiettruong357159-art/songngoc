import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    if (!session) {
      return NextResponse.json({ success: false, error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Thống kê trạng thái phòng
    const allRooms = await db.room.findMany({
      select: { status: true },
    });

    const totalRooms = allRooms.length;
    const statusCounts = {
      AVAILABLE: 0,
      OCCUPIED: 0,
      DIRTY: 0,
      CLEANING: 0,
      MAINTENANCE: 0,
    };

    allRooms.forEach((r) => {
      if (r.status in statusCounts) {
        statusCounts[r.status as keyof typeof statusCounts]++;
      }
    });

    const activeRooms = totalRooms - statusCounts.MAINTENANCE;
    const occupancyRate =
      activeRooms > 0 ? Math.round((statusCounts.OCCUPIED / activeRooms) * 100) : 0;

    // 2. Check-in hôm nay
    const todayCheckInsCount = await db.booking.count({
      where: {
        checkIn: { gte: todayStart, lte: todayEnd },
        status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
      },
    });

    // 3. Check-out hôm nay
    const todayCheckOutsCount = await db.booking.count({
      where: {
        checkOut: { gte: todayStart, lte: todayEnd },
        status: { in: ['CHECKED_IN', 'CHECKED_OUT'] },
      },
    });

    // 4. Doanh thu hôm nay từ hóa đơn
    const todayInvoices = await db.invoice.findMany({
      where: {
        createdAt: { gte: todayStart, lte: todayEnd },
      },
      select: { finalAmount: true },
    });

    const todayRevenue = todayInvoices.reduce((sum, inv) => sum + inv.finalAmount, 0);

    // 5. 5 đơn đặt phòng gần nhất
    const recentBookings = await db.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        guest: true,
        roomType: true,
        room: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalRooms,
        occupancyRate,
        statusCounts,
        todayCheckInsCount,
        todayCheckOutsCount,
        todayRevenue,
        recentBookings,
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải số liệu bảng điều khiển' },
      { status: 500 }
    );
  }
}
