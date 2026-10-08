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

    const items = await db.bookingService.findMany({
      where: { bookingId: id },
      include: { service: true },
      orderBy: { addedAt: 'desc' },
    });

    return NextResponse.json({ success: true, items });
  } catch (error) {
    console.error('Error fetching booking services:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải danh sách dịch vụ phòng' }, { status: 500 });
  }
}

export async function POST(
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

    const booking = await db.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Đơn đặt phòng không tồn tại' }, { status: 404 });
    }

    const body = await request.json();
    const { items } = body as {
      items: Array<{ serviceId: string; quantity: number; note?: string }>;
    };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'Không có dịch vụ nào được chọn' }, { status: 400 });
    }

    // Lấy thông tin các service để lấy unitPrice chính xác
    const serviceIds = items.map((i) => i.serviceId);
    const services = await db.service.findMany({
      where: { id: { in: serviceIds } },
    });
    const serviceMap = new Map(services.map((s) => [s.id, s]));

    const createdItems = await db.$transaction(async (tx) => {
      const records = [];
      for (const item of items) {
        const s = serviceMap.get(item.serviceId);
        if (!s) continue;
        const qty = Math.max(1, item.quantity);
        const unitPrice = s.price;
        const totalPrice = unitPrice * qty;

        const created = await tx.bookingService.create({
          data: {
            bookingId: id,
            serviceId: item.serviceId,
            quantity: qty,
            unitPrice,
            totalPrice,
            note: item.note || null,
          },
          include: { service: true },
        });
        records.push(created);
      }
      return records;
    });

    return NextResponse.json({ success: true, items: createdItems });
  } catch (error) {
    console.error('Error adding services to booking:', error);
    return NextResponse.json({ success: false, error: 'Lỗi ghi nhận dịch vụ vào phòng' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'bookings:update');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json({ success: false, error: 'Thiếu mã dịch vụ đã dùng' }, { status: 400 });
    }

    await db.bookingService.delete({
      where: { id: itemId, bookingId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting booking service:', error);
    return NextResponse.json({ success: false, error: 'Lỗi xóa dịch vụ' }, { status: 500 });
  }
}
