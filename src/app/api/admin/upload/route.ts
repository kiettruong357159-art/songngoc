import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { verifySessionToken, SESSION_COOKIE_NAME, requirePermission } from '@/lib/auth';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? verifySessionToken(token) : null;
    const authCheck = requirePermission(session, 'rooms:manage');
    if (!authCheck.authorized) {
      return NextResponse.json({ success: false, error: authCheck.error }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng chọn một tệp hình ảnh để tải lên' },
        { status: 400 }
      );
    }

    // Kiểm tra định dạng tệp
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPG, PNG, WebP hoặc GIF.' },
        { status: 400 }
      );
    }

    // Kiểm tra dung lượng tệp
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'Dung lượng ảnh vượt quá giới hạn cho phép (tối đa 5MB).' },
        { status: 400 }
      );
    }

    // Xác định phần mở rộng
    let ext = 'jpg';
    if (file.type === 'image/png') ext = 'png';
    else if (file.type === 'image/webp') ext = 'webp';
    else if (file.type === 'image/gif') ext = 'gif';

    // Tạo thư mục nếu chưa tồn tại
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'rooms');
    await fs.promises.mkdir(uploadDir, { recursive: true });

    // Tạo tên tệp ngẫu nhiên an toàn
    const randomHex = crypto.randomBytes(4).toString('hex');
    const fileName = `room-${Date.now()}-${randomHex}.${ext}`;
    const filePath = path.join(uploadDir, fileName);

    // Ghi tệp vào hệ thống tệp
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/uploads/rooms/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { success: false, error: 'Lỗi máy chủ khi tải ảnh lên' },
      { status: 500 }
    );
  }
}
