import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getRoomTypeAvailability } from '@/lib/availability';
import { calculateNights, calculateBookingPricing } from '@/lib/pricing';
import { generateVietQRUrl } from '@/lib/vietqr';
import { CreatePublicBookingSchema } from '@/lib/validation/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CreatePublicBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền đầy đủ các thông tin bắt buộc' },
        { status: 400 }
      );
    }

    const {
      fullName,
      phone,
      email,
      roomTypeId,
      checkIn: checkInStr,
      checkOut: checkOutStr,
      adults,
      children,
      specialRequests,
      paymentMethod, // COUNTER or VIETQR
    } = parsed.data;

    const cleanPhone = String(phone).trim().replace(/[\s.-]/g, '');
    if (!/^(0|\+84)[0-9]{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: 'Số điện thoại không hợp lệ. Vui lòng nhập 10 chữ số.' },
        { status: 400 }
      );
    }

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const checkInDatePart = checkInStr.includes('T') ? checkInStr.split('T')[0] : checkInStr;

    if (checkInDatePart < todayStr) {
      return NextResponse.json(
        { success: false, error: 'Ngày nhận phòng không thể trong quá khứ' },
        { status: 400 }
      );
    }

    if (checkOutStr <= checkInStr) {
      return NextResponse.json(
        { success: false, error: 'Ngày trả phòng phải sau ngày nhận phòng' },
        { status: 400 }
      );
    }

    const normalizeIso = (str: string, defaultTime: string) => {
      // Use Asia/Ho_Chi_Minh +07:00 to avoid UTC off-by-half-day on Date parsing
      if (!str.includes('T')) return `${str}T${defaultTime}+07:00`;
      if (str.length === 16) return `${str}:00+07:00`;
      if (str.length === 19) return `${str}+07:00`;
      return str;
    };

    const checkIn = new Date(normalizeIso(checkInStr, '14:00:00'));
    const checkOut = new Date(normalizeIso(checkOutStr, '12:00:00'));

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Ngày nhận/trả phòng không hợp lệ' },
        { status: 400 }
      );
    }

    const nights = calculateNights(checkIn, checkOut);
    if (nights > 30) {
      return NextResponse.json(
        {
          success: false,
          error: 'Thời gian đặt phòng tối đa 30 ngày. Vui lòng liên hệ hotline nếu có nhu cầu lưu trú dài hạn.',
        },
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

    // 2. Tính toán tiền phòng & cọc
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

    // 3. Sinh mã Booking: BK-YYYYMM-XXXX
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingCode = `BK-${yearMonth}-${randomSuffix}`;

    // 4. Thực hiện toàn bộ quy trình kiểm tra phòng trống & tạo đơn trong 1 transaction an toàn
    const { booking, guest } = await db.$transaction(async (tx) => {
      // Re-check phòng trống bên trong transaction để chống race-condition
      const availability = await getRoomTypeAvailability(tx as any, roomTypeId, checkIn, checkOut);
      if (!availability.isAvailable) {
        throw new Error('SLOT_FULL');
      }

      // Tìm hoặc tạo Guest
      let currentGuest = await tx.guest.findFirst({
        where: { phone: cleanPhone },
      });

      if (!currentGuest) {
        currentGuest = await tx.guest.create({
          data: {
            fullName: fullName.trim(),
            phone: cleanPhone,
            email: email ? String(email).trim() : null,
          },
        });
      } else if (email && !currentGuest.email) {
        await tx.guest.update({
          where: { id: currentGuest.id },
          data: { email: String(email).trim() },
        });
      }

      // Tạo đơn Booking
      const createdBooking = await tx.booking.create({
        data: {
          bookingCode,
          source: 'ONLINE_WEB',
          guestId: currentGuest.id,
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

      return { booking: createdBooking, guest: currentGuest };
    });

    // 5. Sinh mã VietQR nếu chọn cọc chuyển khoản
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
    if (error?.message === 'SLOT_FULL') {
      return NextResponse.json(
        {
          success: false,
          error: 'Rất tiếc, hạng phòng này vừa được khách khác đặt hết trong khoảng thời gian quý khách chọn.',
        },
        { status: 400 }
      );
    }
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { success: false, error: 'Đã xảy ra lỗi khi tạo đơn đặt phòng' },
      { status: 500 }
    );
  }
}
