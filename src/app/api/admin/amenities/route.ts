import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE_NAME, requirePermission } from '@/lib/auth';

import { DEFAULT_AMENITIES_SEED } from '@/lib/amenity-defaults';

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
