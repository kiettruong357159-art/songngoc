import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE_NAME, requirePermission } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/types/api';

/**
 * GET /api/admin/floors
 * Lấy danh sách các tầng cùng số lượng phòng
 */
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'rooms:view');
    if (!authCheck.authorized) {
      return NextResponse.json(errorResponse(authCheck.error || 'Unauthorized'), { status: 403 });
    }

    const floors = await db.floor.findMany({
      orderBy: { floorNumber: 'asc' },
      include: {
        _count: {
          select: { rooms: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      floors,
    });
  } catch (error) {
    console.error('Error fetching floors:', error);
    return NextResponse.json(errorResponse('Không thể tải danh sách tầng'), { status: 500 });
  }
}

/**
 * POST /api/admin/floors
 * Thêm tầng mới vào hệ thống
 */
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'rooms:view');
    if (!authCheck.authorized) {
      return NextResponse.json(errorResponse(authCheck.error || 'Unauthorized'), { status: 403 });
    }

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const floorNumber = Number(body.floorNumber);

    if (!name) {
      return NextResponse.json(errorResponse('Tên tầng không được để trống'), { status: 400 });
    }

    if (isNaN(floorNumber)) {
      return NextResponse.json(errorResponse('Số thứ tự tầng phải là một số hợp lệ'), { status: 400 });
    }

    // Kiểm tra xem số tầng đã tồn tại chưa
    const existingFloor = await db.floor.findUnique({
      where: { floorNumber },
    });

    if (existingFloor) {
      return NextResponse.json(
        errorResponse(`Số tầng ${floorNumber} đã tồn tại với tên "${existingFloor.name}"`),
        { status: 400 }
      );
    }

    const newFloor = await db.floor.create({
      data: {
        name,
        floorNumber,
      },
      include: {
        _count: {
          select: { rooms: true },
        },
      },
    });

    return NextResponse.json(successResponse(newFloor, `Đã tạo tầng "${name}" thành công`), { status: 201 });
  } catch (error) {
    console.error('Error creating floor:', error);
    return NextResponse.json(errorResponse('Lỗi máy chủ khi tạo tầng mới'), { status: 500 });
  }
}
