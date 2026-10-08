import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE_NAME, requirePermission } from '@/lib/auth';
import { calculateInvoiceSettlement } from '@/lib/pricing';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'invoices:view');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { invoiceCode: { contains: search } },
        { booking: { bookingCode: { contains: search } } },
        { booking: { guest: { fullName: { contains: search } } } },
        { booking: { guest: { phone: { contains: search } } } },
      ];
    }

    const [total, invoices] = await Promise.all([
      db.invoice.count({ where }),
      db.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          booking: {
            include: {
              guest: true,
              roomType: true,
              room: true,
              services: {
                include: { service: true },
              },
            },
          },
          createdBy: {
            select: { id: true, name: true, username: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      invoices,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải danh sách hóa đơn' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'invoices:create');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const {
      bookingId,
      surcharge = 0,
      surchargeReason,
      discount = 0,
      paymentMethod = 'CASH',
      notes,
    } = body;

    if (!bookingId) {
      return NextResponse.json({ success: false, error: 'Thiếu mã đơn đặt phòng' }, { status: 400 });
    }

    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        services: true,
        invoice: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Đơn đặt phòng không tồn tại' }, { status: 404 });
    }

    if (booking.invoice) {
      return NextResponse.json(
        { success: false, error: 'Đơn đặt phòng này đã được xuất hóa đơn trước đó' },
        { status: 400 }
      );
    }

    // 1. Tính toán giá trị hóa đơn
    const roomCharge = booking.totalRoomAmount;
    const serviceCharge = booking.services.reduce((sum, item) => sum + item.totalPrice, 0);
    const depositDeducted = booking.depositAmount;

    const settlement = calculateInvoiceSettlement({
      roomCharge,
      serviceCharge,
      surcharge: Number(surcharge),
      surchargeReason,
      discount: Number(discount),
      depositDeducted,
    });

    // 2. Tạo mã hóa đơn INV-YYYYMM-XXXX
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const random = Math.floor(1000 + Math.random() * 9000);
    const invoiceCode = `INV-${datePart}-${random}`;

    // 3. Thực hiện giao dịch: Tạo Invoice, Cập nhật Booking -> CHECKED_OUT, Cập nhật Room -> DIRTY
    const invoice = await db.$transaction(async (tx) => {
      const createdInvoice = await tx.invoice.create({
        data: {
          invoiceCode,
          bookingId,
          roomCharge,
          serviceCharge,
          surcharge: Number(surcharge),
          surchargeReason: surchargeReason || null,
          discount: Number(discount),
          depositDeducted,
          finalAmount: settlement.finalAmount,
          paymentMethod,
          paidAt: new Date(),
          createdById: session!.userId,
          notes: notes || null,
        },
        include: {
          booking: {
            include: {
              guest: true,
              roomType: true,
              room: true,
              services: {
                include: { service: true },
              },
            },
          },
          createdBy: {
            select: { id: true, name: true, username: true },
          },
        },
      });

      // Cập nhật đơn đặt phòng sang CHECKED_OUT
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CHECKED_OUT',
          actualCheckOut: new Date(),
          paymentStatus: 'PAID',
        },
      });

      // Chuyển phòng sang trạng thái DIRTY để buồng phòng dọn dẹp
      if (booking.roomId) {
        await tx.room.update({
          where: { id: booking.roomId },
          data: { status: 'DIRTY' },
        });
      }

      return createdInvoice;
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tạo hóa đơn và trả phòng' }, { status: 500 });
  }
}
