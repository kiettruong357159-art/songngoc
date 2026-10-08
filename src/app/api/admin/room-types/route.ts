import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE_NAME, requirePermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'rooms:view');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const roomTypes = await db.roomType.findMany({
      orderBy: { basePrice: 'asc' },
      include: {
        _count: {
          select: { rooms: true },
        },
      },
    });

    return NextResponse.json({ success: true, roomTypes });
  } catch (error) {
    console.error('Error fetching room types:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải danh sách hạng phòng' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'rooms:manage');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      name,
      basePrice,
      weekendPrice,
      hourlyPrice,
      maxAdults,
      maxChildren,
      bedType,
      roomArea,
      description,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu mã hạng phòng' }, { status: 400 });
    }

    const updated = await db.roomType.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(basePrice !== undefined ? { basePrice: Number(basePrice) } : {}),
        ...(weekendPrice !== undefined ? { weekendPrice: weekendPrice ? Number(weekendPrice) : null } : {}),
        ...(hourlyPrice !== undefined ? { hourlyPrice: hourlyPrice ? Number(hourlyPrice) : null } : {}),
        ...(maxAdults !== undefined ? { maxAdults: Number(maxAdults) } : {}),
        ...(maxChildren !== undefined ? { maxChildren: Number(maxChildren) } : {}),
        ...(bedType ? { bedType: bedType.trim() } : {}),
        ...(roomArea !== undefined ? { roomArea: Number(roomArea) } : {}),
        ...(description ? { description: description.trim() } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    return NextResponse.json({ success: true, roomType: updated });
  } catch (error) {
    console.error('Error updating room type:', error);
    return NextResponse.json({ success: false, error: 'Lỗi cập nhật cấu hình hạng phòng' }, { status: 500 });
  }
}
