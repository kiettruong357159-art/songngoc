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

    // Chạy song song toàn bộ các truy vấn thống kê bằng SQL Aggregations trực tiếp tại CSDL (triệt tiêu load RAM)
    const [
      roomStatusGroups,
      totalRooms,
      todayCheckInsCount,
      todayCheckOutsCount,
      revenueAggregate,
      recentBookings,
    ] = await Promise.all([
      // 1. Thống kê số lượng phòng theo trạng thái bằng SQL groupBy
      db.room.groupBy({
        by: ['status'],
        _count: { status: true },
      }),

      // 2. Tổng số phòng
      db.room.count(),

      // 3. Đếm check-in hôm nay
      db.booking.count({
        where: {
          checkIn: { gte: todayStart, lte: todayEnd },
          status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN'] },
        },
      }),

      // 4. Đếm check-out hôm nay
      db.booking.count({
        where: {
          checkOut: { gte: todayStart, lte: todayEnd },
          status: { in: ['CHECKED_IN', 'CHECKED_OUT'] },
        },
      }),

      // 5. Tính tổng doanh thu hôm nay từ hóa đơn bằng SQL aggregate (_sum)
      db.invoice.aggregate({
        _sum: { finalAmount: true },
        where: {
          createdAt: { gte: todayStart, lte: todayEnd },
        },
      }),

      // 6. 5 đơn đặt phòng gần nhất
      db.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          guest: true,
          roomType: true,
          room: true,
        },
      }),
    ]);

    const statusCounts = {
      AVAILABLE: 0,
      OCCUPIED: 0,
      DIRTY: 0,
      CLEANING: 0,
      MAINTENANCE: 0,
    };

    for (const group of roomStatusGroups) {
      if (group.status in statusCounts) {
        statusCounts[group.status as keyof typeof statusCounts] = group._count.status;
      }
    }

    const activeRooms = totalRooms - statusCounts.MAINTENANCE;
    const occupancyRate =
      activeRooms > 0 ? Math.round((statusCounts.OCCUPIED / activeRooms) * 100) : 0;
    const todayRevenue = revenueAggregate._sum.finalAmount || 0;

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
