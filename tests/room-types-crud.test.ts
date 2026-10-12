import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

describe('Room Types CRUD & Image Management', () => {
  it('all required files exist', () => {
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/api/admin/upload/route.ts'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/api/admin/room-types/route.ts'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/api/admin/room-types/[id]/route.ts'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/components/admin/RoomTypeModal.tsx'))).toBe(true);
  });

  it('routes enforce authorization via requirePermission', () => {
    const uploadRoute = fs.readFileSync(
      path.resolve(__dirname, '../src/app/api/admin/upload/route.ts'),
      'utf-8'
    );
    expect(uploadRoute).toContain('requirePermission');
    expect(uploadRoute).toContain('rooms:manage');

    const roomTypesRoute = fs.readFileSync(
      path.resolve(__dirname, '../src/app/api/admin/room-types/route.ts'),
      'utf-8'
    );
    expect(roomTypesRoute).toContain('requirePermission');
    expect(roomTypesRoute).toContain('rooms:manage');
    expect(roomTypesRoute).toContain('rooms:view');

    const roomTypeDetailRoute = fs.readFileSync(
      path.resolve(__dirname, '../src/app/api/admin/room-types/[id]/route.ts'),
      'utf-8'
    );
    expect(roomTypeDetailRoute).toContain('requirePermission');
    expect(roomTypeDetailRoute).toContain('rooms:manage');
  });

  it('room-types route supports POST, PATCH with image and amenity arrays', () => {
    const routeContent = fs.readFileSync(
      path.resolve(__dirname, '../src/app/api/admin/room-types/route.ts'),
      'utf-8'
    );
    expect(routeContent).toContain('export async function POST');
    expect(routeContent).toContain('export async function PATCH');
    expect(routeContent).toContain('toSlug');
    expect(routeContent).toContain('images');
    expect(routeContent).toContain('amenities');
  });

  it('DELETE route blocks deleting room type with linked rooms or bookings', () => {
    const detailContent = fs.readFileSync(
      path.resolve(__dirname, '../src/app/api/admin/room-types/[id]/route.ts'),
      'utf-8'
    );
    expect(detailContent).toContain('export async function DELETE');
    expect(detailContent).toContain('db.room.count');
    expect(detailContent).toContain('db.booking.count');
    expect(detailContent).toContain('status: 400');
  });

  it(
    'end-to-end CRUD on running dev server maintains referential integrity',
    async () => {
      const SESSION_SECRET = 'songngoc-secret-salt-key-hmac-sha256-2026';
      const payload = {
        userId: 'test-admin',
        username: 'admin',
        role: 'ADMIN',
        permissions: ['*'],
        exp: Date.now() + 60 * 1000,
      };
      const enc = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const sig = crypto.createHmac('sha256', SESSION_SECRET).update(enc).digest('base64url');
      const cookieHeader = `songngoc_session=${enc}.${sig}`;

      // 1. Tạo mới một RoomType thử nghiệm
      const randomSuffix = Math.floor(Math.random() * 90000 + 10000);
      const testRoomTypeName = `Hạng Phòng Test ${randomSuffix}`;
      const createRes = await fetch('http://localhost:3001/api/admin/room-types', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
        },
        body: JSON.stringify({
          name: testRoomTypeName,
          basePrice: 550000,
          weekendPrice: 650000,
          hourlyPrice: 180000,
          maxAdults: 2,
          maxChildren: 1,
          bedType: '1 Giường King',
          roomArea: 30,
          amenities: ['wifi', 'air_con', 'hot_water', 'balcony'],
          images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'],
          description: 'Phòng test tích hợp tự động',
          isActive: true,
        }),
      });

      const createData = await createRes.json();
      expect(createRes.status).toBe(201);
      expect(createData.success).toBe(true);
      expect(createData.roomType).toBeDefined();
      const createdId = createData.roomType.id;
      expect(createData.roomType.basePrice).toBe(550000);

      // 2. Chỉnh sửa RoomType vừa tạo
      const patchRes = await fetch('http://localhost:3001/api/admin/room-types', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieHeader,
        },
        body: JSON.stringify({
          id: createdId,
          name: `${testRoomTypeName} (Đã Sửa)`,
          basePrice: 600000,
          images: [
            'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
            '/uploads/rooms/test-new.jpg',
          ],
        }),
      });
      const patchData = await patchRes.json();
      expect(patchRes.status).toBe(200);
      expect(patchData.success).toBe(true);
      expect(patchData.roomType.basePrice).toBe(600000);
      expect(patchData.roomType.images).toContain('/uploads/rooms/test-new.jpg');

      // 3. Xóa RoomType vừa tạo (chưa có phòng liên kết nên thành công)
      const deleteRes = await fetch(`http://localhost:3001/api/admin/room-types/${createdId}`, {
        method: 'DELETE',
        headers: { Cookie: cookieHeader },
      });
      const deleteData = await deleteRes.json();
      expect(deleteRes.status).toBe(200);
      expect(deleteData.success).toBe(true);

      // 4. Kiểm tra xóa một RoomType đang có phòng thực tế (phải bị từ chối 400)
      const listRes = await fetch('http://localhost:3001/api/admin/room-types', {
        headers: { Cookie: cookieHeader },
      });
      const listData = await listRes.json();
      const roomTypeWithRooms = listData.roomTypes.find((rt: any) => rt._count?.rooms > 0);
      if (roomTypeWithRooms) {
        const failDeleteRes = await fetch(`http://localhost:3001/api/admin/room-types/${roomTypeWithRooms.id}`, {
          method: 'DELETE',
          headers: { Cookie: cookieHeader },
        });
        const failDeleteData = await failDeleteRes.json();
        expect(failDeleteRes.status).toBe(400);
        expect(failDeleteData.success).toBe(false);
        expect(failDeleteData.error).toContain('phòng thực tế liên kết');
      }
    },
    15000
  );
});
