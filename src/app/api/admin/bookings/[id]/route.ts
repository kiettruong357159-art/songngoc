import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE_NAME, requirePermission } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'bookings:view');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const booking = await db.booking.findUnique({
      where: { id },
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
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Đơn đặt phòng không tồn tại' }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking });
  } catch (error) {
    console.error('Error fetching booking detail:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải chi tiết đơn' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'bookings:update');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const { status, roomId, specialRequests, depositAmount, paymentStatus } = body;

    const currentBooking = await db.booking.findUnique({
      where: { id },
    });

    if (!currentBooking) {
      return NextResponse.json({ success: false, error: 'Đơn đặt phòng không tồn tại' }, { status: 404 });
    }

    const updatedBooking = await db.$transaction(async (tx) => {
      // Nếu hủy đơn và phòng đang được gán, giải phóng phòng nếu cần
      if (status === 'CANCELLED' && currentBooking.roomId && currentBooking.status === 'CHECKED_IN') {
        await tx.room.update({
          where: { id: currentBooking.roomId },
          data: { status: 'AVAILABLE' },
        });
      }

      return tx.booking.update({
        where: { id },
        data: {
          ...(status ? { status } : {}),
          ...(roomId !== undefined ? { roomId } : {}),
          ...(specialRequests !== undefined ? { specialRequests } : {}),
          ...(depositAmount !== undefined ? { depositAmount: Number(depositAmount) } : {}),
          ...(paymentStatus ? { paymentStatus } : {}),
        },
        include: {
          guest: true,
          roomType: true,
          room: true,
        },
      });
    });

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json({ success: false, error: 'Lỗi cập nhật đơn đặt phòng' }, { status: 500 });
  }
}
