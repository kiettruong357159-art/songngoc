import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRoomTypeAvailability } from '@/lib/availability';
import { calculateNights, calculateBookingPricing } from '@/lib/pricing';
import { generateVietQRUrl } from '@/lib/vietqr';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      phone,
      email,
      roomTypeId,
      checkIn: checkInStr,
      checkOut: checkOutStr,
      adults = 1,
      children = 0,
      specialRequests,
      paymentMethod = 'COUNTER', // COUNTER or VIETQR
    } = body;

    if (!fullName || !phone || !roomTypeId || !checkInStr || !checkOutStr) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền đầy đủ các thông tin bắt buộc' },
        { status: 400 }
      );
    }

    const checkIn = new Date(`${checkInStr}T14:00:00Z`);
    const checkOut = new Date(`${checkOutStr}T12:00:00Z`);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime()) || checkOut <= checkIn) {
      return NextResponse.json(
        { success: false, error: 'Ngày nhận/trả phòng không hợp lệ' },
        { status: 400 }
      );
    }

    // 1. Kiểm tra hạng phòng
    const roomType = await db.roomType.findUnique({
      where: { id: roomTypeId },
    });

    if (!roomType || !roomType.isActive) {
      return NextResponse.json(
        { success: false, error: 'Hạng phòng không tồn tại hoặc đã ngưng phục vụ' },
        { status: 404 }
      );
    }

    // 2. Kiểm tra tình trạng phòng trống trong khoảng ngày
    const availability = await getRoomTypeAvailability(db, roomTypeId, checkIn, checkOut);
    if (!availability.isAvailable) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rất tiếc, hạng phòng này đã được đặt hết trong khoảng thời gian quý khách chọn.',
        },
        { status: 400 }
      );
    }

    // 3. Tính toán tiền phòng
    const nights = calculateNights(checkIn, checkOut);
    const pricing = calculateBookingPricing({
      basePrice: roomType.basePrice,
      weekendPrice: roomType.weekendPrice,
      nights,
    });
    const totalRoomAmount = pricing.totalRoomAmount;

    // Tính tiền cọc (30% tổng tiền, tối thiểu 200k, làm tròn nghìn)
    let depositAmount = 0;
    if (paymentMethod === 'VIETQR') {
      depositAmount = Math.max(200000, Math.round((totalRoomAmount * 0.3) / 1000) * 1000);
      if (depositAmount > totalRoomAmount) {
        depositAmount = totalRoomAmount;
      }
    }

    // 4. Sinh mã Booking: BK-YYYYMM-XXXX
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `BK-${yearMonth}-${randomSuffix}`;

    // 5. Tìm hoặc tạo thông tin khách hàng (Guest)
    let guest = await db.guest.findFirst({
      where: { phone },
    });

    if (!guest) {
      guest = await db.guest.create({
        data: {
          fullName,
          phone,
          email: email || null,
        },
      });
    } else if (email && !guest.email) {
      await db.guest.update({
        where: { id: guest.id },
        data: { email },
      });
    }

    // 6. Tạo đơn Booking
    const booking = await db.booking.create({
      data: {
        bookingCode,
        source: 'ONLINE_WEB',
        guestId: guest.id,
        roomTypeId: roomType.id,
        checkIn,
        checkOut,
        adults: Number(adults) || 1,
        children: Number(children) || 0,
        status: 'PENDING',
        totalRoomAmount,
        depositAmount,
        paymentStatus: 'UNPAID',
        specialRequests: specialRequests || null,
      },
      include: {
        guest: true,
        roomType: true,
      },
    });

    // 7. Sinh mã VietQR nếu chọn cọc chuyển khoản
    let vietqrUrl = '';
    if (depositAmount > 0) {
      vietqrUrl = generateVietQRUrl({
        amount: depositAmount,
        bookingCode: booking.bookingCode,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        guestName: guest.fullName,
        phone: guest.phone,
        roomTypeName: roomType.name,
        checkIn: checkInStr,
        checkOut: checkOutStr,
        nights,
        totalRoomAmount,
        depositAmount,
        paymentMethod,
        vietqrUrl,
      },
    });
  } catch (error: any) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi tạo đơn đặt phòng' },
      { status: 500 }
    );
  }
}
