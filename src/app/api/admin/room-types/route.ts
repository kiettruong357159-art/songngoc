import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE_NAME, requirePermission } from '@/lib/auth';
import { toSlug } from '@/lib/slug';

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

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'rooms:manage');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      basePrice,
      weekendPrice,
      hourlyPrice,
      maxAdults,
      maxChildren,
      bedType,
      roomArea,
      amenities,
      images,
      description,
      policies,
      isActive,
    } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Tên hạng phòng không được để trống' }, { status: 400 });
    }

    const parsedBasePrice = Number(basePrice);
    if (isNaN(parsedBasePrice) || parsedBasePrice < 0) {
      return NextResponse.json({ success: false, error: 'Giá ngày thường phải là số dương hợp lệ' }, { status: 400 });
    }

    // Tự sinh slug nếu không truyền
    const finalSlug = (slug && typeof slug === 'string' && slug.trim())
      ? toSlug(slug.trim())
      : toSlug(name.trim());

    // Kiểm tra trùng lặp slug
    const existing = await db.roomType.findUnique({
      where: { slug: finalSlug },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Slug "${finalSlug}" đã tồn tại trên hệ thống. Vui lòng chọn định danh khác.` },
        { status: 400 }
      );
    }

    // Chuẩn hóa amenities và images dạng JSON string
    const amenitiesJson = Array.isArray(amenities)
      ? JSON.stringify(amenities)
      : typeof amenities === 'string' && amenities.trim()
        ? amenities.trim()
        : '["wifi", "air_con", "hot_water"]';

    const imagesJson = Array.isArray(images)
      ? JSON.stringify(images)
      : typeof images === 'string' && images.trim()
        ? images.trim()
        : '[]';

    const newRoomType = await db.roomType.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        basePrice: parsedBasePrice,
        weekendPrice: weekendPrice ? Number(weekendPrice) : null,
        hourlyPrice: hourlyPrice ? Number(hourlyPrice) : null,
        maxAdults: maxAdults !== undefined ? Number(maxAdults) : 2,
        maxChildren: maxChildren !== undefined ? Number(maxChildren) : 1,
        bedType: bedType && typeof bedType === 'string' ? bedType.trim() : '1 Giường đôi',
        roomArea: roomArea !== undefined ? Number(roomArea) : 25,
        amenities: amenitiesJson,
        images: imagesJson,
        description: description && typeof description === 'string' ? description.trim() : '',
        policies: policies && typeof policies === 'string' && policies.trim() ? policies.trim() : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, roomType: newRoomType }, { status: 201 });
  } catch (error) {
    console.error('Error creating room type:', error);
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ khi tạo hạng phòng mới' }, { status: 500 });
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
      slug,
      basePrice,
      weekendPrice,
      hourlyPrice,
      maxAdults,
      maxChildren,
      bedType,
      roomArea,
      amenities,
      images,
      description,
      policies,
      isActive,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu mã hạng phòng' }, { status: 400 });
    }

    // Nếu có đổi slug, kiểm tra trùng lặp
    let finalSlug: string | undefined = undefined;
    if (slug && typeof slug === 'string' && slug.trim()) {
      finalSlug = toSlug(slug.trim());
      const duplicate = await db.roomType.findFirst({
        where: {
          slug: finalSlug,
          NOT: { id },
        },
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: `Slug "${finalSlug}" đã được sử dụng bởi hạng phòng khác.` },
          { status: 400 }
        );
      }
    }

    const updated = await db.roomType.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(finalSlug ? { slug: finalSlug } : {}),
        ...(basePrice !== undefined ? { basePrice: Number(basePrice) } : {}),
        ...(weekendPrice !== undefined ? { weekendPrice: weekendPrice ? Number(weekendPrice) : null } : {}),
        ...(hourlyPrice !== undefined ? { hourlyPrice: hourlyPrice ? Number(hourlyPrice) : null } : {}),
        ...(maxAdults !== undefined ? { maxAdults: Number(maxAdults) } : {}),
        ...(maxChildren !== undefined ? { maxChildren: Number(maxChildren) } : {}),
        ...(bedType ? { bedType: bedType.trim() } : {}),
        ...(roomArea !== undefined ? { roomArea: Number(roomArea) } : {}),
        ...(amenities !== undefined
          ? { amenities: Array.isArray(amenities) ? JSON.stringify(amenities) : String(amenities) }
          : {}),
        ...(images !== undefined
          ? { images: Array.isArray(images) ? JSON.stringify(images) : String(images) }
          : {}),
        ...(description !== undefined ? { description: description.trim() } : {}),
        ...(policies !== undefined ? { policies: policies && typeof policies === 'string' && policies.trim() ? policies.trim() : null } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    return NextResponse.json({ success: true, roomType: updated });
  } catch (error) {
    console.error('Error updating room type:', error);
    return NextResponse.json({ success: false, error: 'Lỗi cập nhật cấu hình hạng phòng' }, { status: 500 });
  }
}
