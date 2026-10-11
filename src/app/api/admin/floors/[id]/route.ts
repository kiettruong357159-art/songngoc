import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE_NAME, requirePermission } from '@/lib/auth';
import { successResponse, errorResponse } from '@/lib/types/api';

/**
 * PUT /api/admin/floors/[id]
 * Cập nhật thông tin tầng
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'rooms:view');
    if (!authCheck.authorized) {
      return NextResponse.json(errorResponse(authCheck.error || 'Unauthorized'), { status: 403 });
    }

    const existing = await db.floor.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(errorResponse('Không tìm thấy tầng cần sửa'), { status: 404 });
    }

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : existing.name;
    const floorNumber = body.floorNumber !== undefined ? Number(body.floorNumber) : existing.floorNumber;

    if (!name) {
      return NextResponse.json(errorResponse('Tên tầng không được để trống'), { status: 400 });
    }

    if (isNaN(floorNumber)) {
      return NextResponse.json(errorResponse('Số thứ tự tầng phải là một số hợp lệ'), { status: 400 });
    }

    // Nếu đổi floorNumber, kiểm tra xem số mới có bị trùng với tầng khác không
    if (floorNumber !== existing.floorNumber) {
      const duplicate = await db.floor.findFirst({
        where: {
          floorNumber,
          NOT: { id },
        },
      });
      if (duplicate) {
        return NextResponse.json(
          errorResponse(`Số tầng ${floorNumber} đã được dùng bởi "${duplicate.name}"`),
          { status: 400 }
        );
      }
    }

    const updatedFloor = await db.floor.update({
      where: { id },
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

    return NextResponse.json(successResponse(updatedFloor, 'Cập nhật tầng thành công'));
  } catch (error) {
    console.error('Error updating floor:', error);
    return NextResponse.json(errorResponse('Lỗi máy chủ khi cập nhật tầng'), { status: 500 });
  }
}

/**
 * DELETE /api/admin/floors/[id]
 * Xóa tầng khỏi hệ thống (Bảo vệ: Không được xóa nếu còn phòng)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'rooms:view');
    if (!authCheck.authorized) {
      return NextResponse.json(errorResponse(authCheck.error || 'Unauthorized'), { status: 403 });
    }

    const existing = await db.floor.findUnique({
      where: { id },
      include: {
        _count: {
          select: { rooms: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(errorResponse('Không tìm thấy tầng cần xóa'), { status: 404 });
    }

    // Bảo vệ ràng buộc: Không cho xóa nếu tầng còn phòng
    if (existing._count.rooms > 0) {
      return NextResponse.json(
        errorResponse(
          `Không thể xóa "${existing.name}" vì đang có ${existing._count.rooms} phòng. Vui lòng chuyển hoặc xóa các phòng trước.`
        ),
        { status: 400 }
      );
    }

    await db.floor.delete({
      where: { id },
    });

    return NextResponse.json(successResponse({ id }, `Đã xóa tầng "${existing.name}" thành công`));
  } catch (error) {
    console.error('Error deleting floor:', error);
    return NextResponse.json(errorResponse('Lỗi máy chủ khi xóa tầng'), { status: 500 });
  }
}
