import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifySessionToken, SESSION_COOKIE_NAME, requirePermission } from '@/lib/auth';
import {
  CreateServiceCategorySchema,
  UpdateServiceCategorySchema,
} from '@/lib/validation/schemas';
import { MAX_LIST_LIMIT } from '@/lib/constants';
import { getDefaultServiceCategories, isDefaultServiceCategoryId } from '@/lib/service-categories';

/**
 * Kiểm tra quyền từ cookie phiên
 * @param request Request hiện tại
 * @param permission Quyền cần kiểm tra
 * @returns Response lỗi 403 nếu không đủ quyền, null nếu hợp lệ
 */
function checkPermission(request: NextRequest, permission: string): NextResponse | null {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? verifySessionToken(token) : null;
  const authCheck = requirePermission(session, permission);
  if (!authCheck.authorized) {
    return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
  }
  return null;
}

/**
 * Lấy danh sách danh mục dịch vụ
 * GET /api/admin/service-categories?activeOnly=true
 * Nếu bảng chưa có dữ liệu (hoặc chưa đồng bộ DB) trả về 4 danh mục mặc định với isFallback = true
 */
export async function GET(request: NextRequest) {
  const denied = checkPermission(request, 'services:view');
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const activeOnly = searchParams.get('activeOnly') === 'true';

  try {
    const categories = await db.serviceCategory.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      take: MAX_LIST_LIMIT,
    });

    if (categories.length === 0) {
      const total = await db.serviceCategory.count();
      if (total === 0) {
        return NextResponse.json({
          success: true,
          categories: getDefaultServiceCategories(),
          isFallback: true,
        });
      }
    }

    return NextResponse.json({ success: true, categories, isFallback: false });
  } catch (error) {
    console.error('Error fetching service categories:', error);
    return NextResponse.json({
      success: true,
      categories: getDefaultServiceCategories(),
      isFallback: true,
    });
  }
}

/**
 * Thêm danh mục dịch vụ mới
 * POST /api/admin/service-categories
 */
export async function POST(request: NextRequest) {
  const denied = checkPermission(request, 'services:manage');
  if (denied) return denied;

  try {
    const body = await request.json();
    const parsed = CreateServiceCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Mã danh mục gồm 2-30 ký tự chữ, số hoặc gạch dưới và phải có tên danh mục' },
        { status: 400 }
      );
    }

    const exists = await db.serviceCategory.findUnique({ where: { code: parsed.data.code } });
    if (exists) {
      return NextResponse.json({ success: false, error: 'Mã danh mục đã tồn tại' }, { status: 409 });
    }

    const category = await db.serviceCategory.create({ data: parsed.data });
    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error creating service category:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi thêm danh mục. Hãy chắc chắn đã tạo bảng ServiceCategory trong database' },
      { status: 500 }
    );
  }
}

/**
 * Cập nhật danh mục dịch vụ (không cho đổi mã)
 * PATCH /api/admin/service-categories
 */
export async function PATCH(request: NextRequest) {
  const denied = checkPermission(request, 'services:manage');
  if (denied) return denied;

  try {
    const body = await request.json();
    const parsed = UpdateServiceCategorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Dữ liệu danh mục không hợp lệ' }, { status: 400 });
    }

    const { id, ...data } = parsed.data;
    if (isDefaultServiceCategoryId(id)) {
      return NextResponse.json(
        { success: false, error: 'Danh mục mặc định chưa được lưu vào database, hãy chạy SQL tạo bảng và seed trước' },
        { status: 409 }
      );
    }

    const category = await db.serviceCategory.update({ where: { id }, data });
    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error updating service category:', error);
    return NextResponse.json({ success: false, error: 'Lỗi cập nhật danh mục' }, { status: 500 });
  }
}

/**
 * Xoá danh mục dịch vụ (chỉ khi chưa có dịch vụ nào dùng)
 * DELETE /api/admin/service-categories?id=...
 */
export async function DELETE(request: NextRequest) {
  const denied = checkPermission(request, 'services:manage');
  if (denied) return denied;

  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Thiếu ID danh mục' }, { status: 400 });
    }
    if (isDefaultServiceCategoryId(id)) {
      return NextResponse.json(
        { success: false, error: 'Danh mục mặc định chưa được lưu vào database, hãy chạy SQL tạo bảng và seed trước' },
        { status: 409 }
      );
    }

    const category = await db.serviceCategory.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy danh mục' }, { status: 404 });
    }

    const usedCount = await db.service.count({ where: { category: category.code } });
    if (usedCount > 0) {
      return NextResponse.json(
        { success: false, error: `Danh mục đang có ${usedCount} dịch vụ, hãy chuyển dịch vụ sang danh mục khác hoặc chọn Ngưng` },
        { status: 409 }
      );
    }

    await db.serviceCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service category:', error);
    return NextResponse.json({ success: false, error: 'Lỗi xoá danh mục' }, { status: 500 });
  }
}
