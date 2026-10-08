import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE_NAME, requirePermission } from '@/lib/auth';
import { calculateNights, calculateBookingPricing } from '@/lib/pricing';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'bookings:view');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { bookingCode: { contains: search } },
        { guest: { fullName: { contains: search } } },
        { guest: { phone: { contains: search } } },
        { room: { roomNumber: { contains: search } } },
      ];
    }

    const [total, bookings] = await Promise.all([
      db.booking.count({ where: whereClause }),
      db.booking.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          guest: true,
          roomType: true,
          room: {
            include: { floor: true },
          },
          services: {
            include: { service: true },
          },
          invoice: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tải danh sách đơn đặt phòng' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'bookings:create');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const {
      guestName,
      phone,
      email,
      idCard,
      roomTypeId,
      roomId,
      checkIn,
      checkOut,
      adults = 1,
      children = 0,
      depositAmount = 0,
      paymentMethod = 'CASH',
      specialRequests,
      status = 'CHECKED_IN',
    } = body;

    if (!guestName || !phone || !roomTypeId || !checkIn || !checkOut) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc' },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const nights = calculateNights(checkInDate, checkOutDate);

    const roomType = await db.roomType.findUnique({
      where: { id: roomTypeId },
    });

    if (!roomType) {
      return NextResponse.json(
        { success: false, error: 'Loại phòng không tồn tại' },
        { status: 404 }
      );
    }

    const pricing = calculateBookingPricing({
      basePrice: roomType.basePrice,
      nights,
      weekendPrice: roomType.weekendPrice,
    });

    // Kiểm tra phòng nếu gán phòng cụ thể
    if (roomId) {
      const room = await db.room.findUnique({ where: { id: roomId } });
      if (!room) {
        return NextResponse.json(
          { success: false, error: 'Phòng được chỉ định không tồn tại' },
          { status: 404 }
        );
      }
      if (status === 'CHECKED_IN' && room.status !== 'AVAILABLE') {
        return NextResponse.json(
          { success: false, error: `Phòng ${room.roomNumber} hiện không sẵn sàng (Trạng thái: ${room.status})` },
          { status: 400 }
        );
      }
    }

    // Tạo mã đơn ngẫu nhiên
    const now = new Date();
    const datePrefix = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `SN-${datePrefix}-${randomSuffix}`;

    const newBooking = await db.$transaction(async (tx) => {
      // 1. Tìm hoặc tạo khách hàng
      let guest = await tx.guest.findFirst({
        where: { phone },
      });

      if (!guest) {
        guest = await tx.guest.create({
          data: {
            fullName: guestName,
            phone,
            email: email || null,
            idCard: idCard || null,
          },
        });
      } else {
        guest = await tx.guest.update({
          where: { id: guest.id },
          data: {
            fullName: guestName,
            ...(email ? { email } : {}),
            ...(idCard ? { idCard } : {}),
          },
        });
      }

      // 2. Tạo đơn đặt phòng
      const isCheckedIn = status === 'CHECKED_IN';
      const paymentStatus =
        depositAmount >= pricing.totalRoomAmount
          ? 'PAID'
          : depositAmount > 0
          ? 'PARTIALLY_PAID'
          : 'UNPAID';

      const booking = await tx.booking.create({
        data: {
          bookingCode,
          source: 'DIRECT_COUNTER',
          guestId: guest.id,
          roomTypeId,
          roomId: roomId || null,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          actualCheckIn: isCheckedIn ? new Date() : null,
          adults: Number(adults),
          children: Number(children),
          status,
          totalRoomAmount: pricing.totalRoomAmount,
          depositAmount: Number(depositAmount),
          paymentStatus,
          specialRequests: specialRequests || null,
          createdById: session?.userId || null,
        },
        include: {
          guest: true,
          roomType: true,
          room: true,
        },
      });

      // 3. Nếu là check-in trực tiếp và có phòng, cập nhật trạng thái phòng thành OCCUPIED
      if (isCheckedIn && roomId) {
        await tx.room.update({
          where: { id: roomId },
          data: { status: 'OCCUPIED' },
        });
      }

      return booking;
    });

    return NextResponse.json({
      success: true,
      booking: newBooking,
    });
  } catch (error) {
    console.error('Error creating walk-in booking:', error);
    return NextResponse.json(
      { success: false, error: 'Không thể tạo đơn đặt phòng hoặc nhận phòng' },
      { status: 500 }
    );
  }
}
