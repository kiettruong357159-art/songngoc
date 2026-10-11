import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE_NAME, requirePermission } from '@/lib/auth';

/**
 * 20 tiện nghi tiêu chuẩn mặc định cho Homestay / Khách sạn
 */
export const DEFAULT_AMENITIES_SEED = [
  { code: 'wifi', name: 'Wifi tốc độ cao', icon: 'wifi', category: 'MEDIA', sortOrder: 1 },
  { code: 'air_con', name: 'Máy lạnh / Điều hòa', icon: 'snowflake', category: 'GENERAL', sortOrder: 2 },
  { code: 'tv_smart', name: 'Smart TV', icon: 'tv', category: 'MEDIA', sortOrder: 3 },
  { code: 'hot_water', name: 'Bình nước nóng', icon: 'flame', category: 'BATHROOM', sortOrder: 4 },
  { code: 'balcony', name: 'Ban công thoáng mát', icon: 'sun', category: 'GENERAL', sortOrder: 5 },
  { code: 'window', name: 'Cửa sổ lớn đón gió', icon: 'wind', category: 'GENERAL', sortOrder: 6 },
  { code: 'bathtub', name: 'Bồn tắm thư giãn', icon: 'bath', category: 'BATHROOM', sortOrder: 7 },
  { code: 'fridge', name: 'Tủ lạnh mini', icon: 'refrigerator', category: 'GENERAL', sortOrder: 8 },
  { code: 'hairdryer', name: 'Máy sấy tóc', icon: 'wind', category: 'BATHROOM', sortOrder: 9 },
  { code: 'kettle', name: 'Ấm đun siêu tốc', icon: 'coffee', category: 'GENERAL', sortOrder: 10 },
  { code: 'desk', name: 'Bàn làm việc', icon: 'laptop', category: 'BEDROOM', sortOrder: 11 },
  { code: 'safe_box', name: 'Két sắt an toàn', icon: 'shield', category: 'BEDROOM', sortOrder: 12 },
  { code: 'city_view', name: 'Tầm nhìn hướng phố', icon: 'building', category: 'GENERAL', sortOrder: 13 },
  { code: 'garden_view', name: 'Tầm nhìn hướng vườn', icon: 'trees', category: 'GENERAL', sortOrder: 14 },
  { code: 'kitchen', name: 'Khu vực bếp nấu', icon: 'utensils', category: 'GENERAL', sortOrder: 15 },
  { code: 'iron', name: 'Bàn ủi / Bàn là', icon: 'shirt', category: 'BEDROOM', sortOrder: 16 },
  { code: 'bathrobe', name: 'Áo choàng tắm', icon: 'sparkles', category: 'BATHROOM', sortOrder: 17 },
  { code: 'slippers', name: 'Dép đi trong phòng', icon: 'footprints', category: 'BEDROOM', sortOrder: 18 },
  { code: 'soundproof', name: 'Cách âm cao cấp', icon: 'volume-x', category: 'BEDROOM', sortOrder: 19 },
  { code: 'blackout_curtains', name: 'Rèm cản sáng', icon: 'moon', category: 'BEDROOM', sortOrder: 20 },
];

/**
 * Tự sinh mã code tiện nghi từ tên tiếng Việt (ví dụ: "Máy pha cà phê" -> "may_pha_ca_phe")
 */
function generateAmenityCode(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'rooms:view');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    // Tự động seed dữ liệu mẫu khởi tạo nếu bảng Amenity đang trống
    const count = await db.amenity.count();
    if (count === 0) {
      for (const item of DEFAULT_AMENITIES_SEED) {
        await db.amenity.upsert({
          where: { code: item.code },
          update: {},
          create: {
            code: item.code,
            name: item.name,
            icon: item.icon,
            category: item.category,
            sortOrder: item.sortOrder,
            isActive: true,
          },
        });
      }
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const category = searchParams.get('category')?.trim();
    const isActiveParam = searchParams.get('isActive')?.trim();

    const where: Record<string, unknown> = {};

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (isActiveParam === 'true') {
      where.isActive = true;
    } else if (isActiveParam === 'false') {
      where.isActive = false;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const amenities = await db.amenity.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' },
      ],
    });

    return NextResponse.json({ success: true, amenities });
  } catch (error) {
    console.error('Error fetching amenities:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải danh mục tiện nghi' }, { status: 500 });
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
    const { name, code, icon, category, sortOrder, isActive } = body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Tên tiện nghi không được để trống' }, { status: 400 });
    }

    const finalCode = (code && typeof code === 'string' && code.trim())
      ? generateAmenityCode(code)
      : generateAmenityCode(name);

    if (!finalCode) {
      return NextResponse.json({ success: false, error: 'Mã định danh không hợp lệ' }, { status: 400 });
    }

    const existing = await db.amenity.findUnique({
      where: { code: finalCode },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Mã tiện nghi "${finalCode}" đã tồn tại. Vui lòng chọn mã khác.` },
        { status: 400 }
      );
    }

    const validCategory = ['BEDROOM', 'BATHROOM', 'MEDIA', 'GENERAL'].includes(category)
      ? category
      : 'GENERAL';

    const amenity = await db.amenity.create({
      data: {
        code: finalCode,
        name: name.trim(),
        icon: icon && typeof icon === 'string' ? icon.trim() : 'sparkles',
        category: validCategory,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, amenity }, { status: 201 });
  } catch (error) {
    console.error('Error creating amenity:', error);
    return NextResponse.json({ success: false, error: 'Lỗi máy chủ khi tạo tiện nghi' }, { status: 500 });
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
    const { id, name, code, icon, category, sortOrder, isActive } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ success: false, error: 'Thiếu mã ID tiện nghi cần cập nhật' }, { status: 400 });
    }

    const existing = await db.amenity.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy tiện nghi trong hệ thống' }, { status: 404 });
    }

    let finalCode: string | undefined = undefined;
    if (code && typeof code === 'string' && code.trim()) {
      finalCode = generateAmenityCode(code);
      if (finalCode !== existing.code) {
        const duplicate = await db.amenity.findUnique({ where: { code: finalCode } });
        if (duplicate) {
          return NextResponse.json(
            { success: false, error: `Mã tiện nghi "${finalCode}" đã được sử dụng.` },
            { status: 400 }
          );
        }
      }
    }

    const validCategory = category && ['BEDROOM', 'BATHROOM', 'MEDIA', 'GENERAL'].includes(category)
      ? category
      : undefined;

    const updated = await db.amenity.update({
      where: { id },
      data: {
        ...(name && typeof name === 'string' ? { name: name.trim() } : {}),
        ...(finalCode ? { code: finalCode } : {}),
        ...(icon && typeof icon === 'string' ? { icon: icon.trim() } : {}),
        ...(validCategory ? { category: validCategory } : {}),
        ...(sortOrder !== undefined ? { sortOrder: Number(sortOrder) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    return NextResponse.json({ success: true, amenity: updated });
  } catch (error) {
    console.error('Error updating amenity:', error);
    return NextResponse.json({ success: false, error: 'Lỗi cập nhật tiện nghi' }, { status: 500 });
  }
}
