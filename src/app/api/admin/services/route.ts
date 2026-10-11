import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE_NAME, requirePermission } from '@/lib/auth';
import { CreateServiceSchema } from '@/lib/validation/schemas';
import { MAX_LIST_LIMIT } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'services:view');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const activeOnly = searchParams.get('activeOnly') === 'true';

    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = category;
    }
    if (activeOnly) {
      where.isActive = true;
    }

    const services = await db.service.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      take: MAX_LIST_LIMIT,
    });

    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải danh mục dịch vụ' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'services:manage');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const parsed = CreateServiceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng điền đầy đủ tên, danh mục, đơn giá và đơn vị tính' },
        { status: 400 }
      );
    }

    const { name, category, price, unit, isActive } = parsed.data;

    const newService = await db.service.create({
      data: {
        name,
        category,
        price: Number(price),
        unit,
        isActive: Boolean(isActive),
      },
    });

    return NextResponse.json({ success: true, service: newService });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ success: false, error: 'Lỗi thêm dịch vụ mới' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'services:manage');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, category, price, unit, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID dịch vụ' }, { status: 400 });
    }

    const updated = await db.service.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(category ? { category } : {}),
        ...(price !== undefined ? { price: Number(price) } : {}),
        ...(unit ? { unit } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    return NextResponse.json({ success: true, service: updated });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ success: false, error: 'Lỗi cập nhật dịch vụ' }, { status: 500 });
  }
}
