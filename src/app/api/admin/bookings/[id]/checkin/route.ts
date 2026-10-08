import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE_NAME, requirePermission } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'bookings:checkin');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const { roomId, idCard } = body as { roomId: string; idCard?: string };

    if (!roomId) {
      return NextResponse.json({ success: false, error: 'Vui lòng chọn phòng để nhận' }, { status: 400 });
    }

    const booking = await db.booking.findUnique({
      where: { id },
      include: { guest: true },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Đơn đặt phòng không tồn tại' }, { status: 404 });
    }

    if (booking.status === 'CHECKED_IN') {
      return NextResponse.json({ success: false, error: 'Đơn này đã được nhận phòng trước đó' }, { status: 400 });
    }

    const room = await db.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ success: false, error: 'Phòng không tồn tại' }, { status: 404 });
    }

    if (room.status !== 'AVAILABLE') {
      return NextResponse.json(
        { success: false, error: `Phòng ${room.roomNumber} hiện không sẵn sàng (Trạng thái: ${room.status})` },
        { status: 400 }
      );
    }

    const updatedBooking = await db.$transaction(async (tx) => {
      // 1. Cập nhật CCCD nếu có
      if (idCard && booking.guestId) {
        await tx.guest.update({
          where: { id: booking.guestId },
          data: { idCard },
        });
      }

      // 2. Chuyển phòng sang OCCUPIED
      await tx.room.update({
        where: { id: roomId },
        data: { status: 'OCCUPIED' },
      });

      // 3. Cập nhật trạng thái đơn
      return tx.booking.update({
        where: { id },
        data: {
          roomId,
          status: 'CHECKED_IN',
          actualCheckIn: new Date(),
        },
        include: {
          guest: true,
          roomType: true,
          room: true,
        },
      });
    });

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Error during check-in execution:', error);
    return NextResponse.json({ success: false, error: 'Lỗi thực hiện nhận phòng' }, { status: 500 });
  }
}
