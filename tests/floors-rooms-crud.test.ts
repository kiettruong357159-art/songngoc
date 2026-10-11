import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

describe('Floors and Rooms CRUD APIs & UI Components', () => {
  it('all required route files and modal components exist', () => {
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/api/admin/floors/route.ts'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/api/admin/floors/[id]/route.ts'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/api/admin/rooms/route.ts'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/api/admin/rooms/[id]/route.ts'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/components/admin/FloorModal.tsx'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/components/admin/RoomModal.tsx'))).toBe(true);
  });

  it('routes enforce authorization via requirePermission', () => {
    const floorsRoute = fs.readFileSync(
      path.resolve(__dirname, '../src/app/api/admin/floors/route.ts'),
      'utf-8'
    );
    expect(floorsRoute).toContain('requirePermission');

    const floorDetailRoute = fs.readFileSync(
      path.resolve(__dirname, '../src/app/api/admin/floors/[id]/route.ts'),
      'utf-8'
    );
    expect(floorDetailRoute).toContain('requirePermission');

    const roomsRoute = fs.readFileSync(
      path.resolve(__dirname, '../src/app/api/admin/rooms/route.ts'),
      'utf-8'
    );
    expect(roomsRoute).toContain('requirePermission');

    const roomDetailRoute = fs.readFileSync(
      path.resolve(__dirname, '../src/app/api/admin/rooms/[id]/route.ts'),
      'utf-8'
    );
    expect(roomDetailRoute).toContain('requirePermission');
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

    // 1. Lấy danh sách hạng phòng để có roomTypeId hợp lệ
    const roomTypesRes = await fetch('http://localhost:3001/api/admin/room-types', {
      headers: { Cookie: cookieHeader },
    });
    const roomTypesData = await roomTypesRes.json();
    expect(roomTypesData.success).toBe(true);
    const validRoomTypeId = roomTypesData.roomTypes[0].id;

    // 2. Tạo tầng test mới ngẫu nhiên
    const testFloorNumber = 10000 + Math.floor(Math.random() * 50000);
    const testRoomNumber = 'TEST_' + Math.floor(Math.random() * 500000);
    let createdFloorId: string | null = null;
    let createdRoomId: string | null = null;

    try {
      const createFloorRes = await fetch('http://localhost:3001/api/admin/floors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
        body: JSON.stringify({
          name: `Tầng Kiểm Thử ${testFloorNumber}`,
          floorNumber: testFloorNumber,
        }),
      });
      const createFloorData = await createFloorRes.json();
      expect(createFloorRes.status).toBe(201);
      expect(createFloorData.success).toBe(true);
      createdFloorId = createFloorData.data.id;

      // 3. Tạo phòng test trong tầng này
      const createRoomRes = await fetch('http://localhost:3001/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
        body: JSON.stringify({
          roomNumber: testRoomNumber,
          floorId: createdFloorId,
          roomTypeId: validRoomTypeId,
          note: 'Ghi chú phòng test',
        }),
      });
      const createRoomData = await createRoomRes.json();
      expect(createRoomRes.status).toBe(201);
      expect(createRoomData.success).toBe(true);
      createdRoomId = createRoomData.room.id;

      // 4. Kiểm tra chống trùng số phòng
      const dupRoomRes = await fetch('http://localhost:3001/api/admin/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
        body: JSON.stringify({
          roomNumber: testRoomNumber,
          floorId: createdFloorId,
          roomTypeId: validRoomTypeId,
        }),
      });
      expect(dupRoomRes.status).toBe(400);

      // 5. Kiểm tra bảo vệ: Không cho xóa tầng khi đang chứa phòng
      const deleteFloorFailRes = await fetch(`http://localhost:3001/api/admin/floors/${createdFloorId}`, {
        method: 'DELETE',
        headers: { Cookie: cookieHeader },
      });
      expect(deleteFloorFailRes.status).toBe(400);
      const deleteFloorFailData = await deleteFloorFailRes.json();
      expect(deleteFloorFailData.error).toContain('Không thể xóa');

      // 6. Cập nhật phòng test
      const updateRoomRes = await fetch(`http://localhost:3001/api/admin/rooms/${createdRoomId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Cookie: cookieHeader },
        body: JSON.stringify({
          roomNumber: testRoomNumber,
          note: 'Đã cập nhật ghi chú test',
        }),
      });
      const updateRoomData = await updateRoomRes.json();
      expect(updateRoomRes.status).toBe(200);
      expect(updateRoomData.room.note).toBe('Đã cập nhật ghi chú test');

      // 7. Xóa phòng test
      const deleteRoomRes = await fetch(`http://localhost:3001/api/admin/rooms/${createdRoomId}`, {
        method: 'DELETE',
        headers: { Cookie: cookieHeader },
      });
      expect(deleteRoomRes.status).toBe(200);
      createdRoomId = null;

      // 8. Sau khi phòng đã xóa, xóa tầng test thành công
      const deleteFloorSuccessRes = await fetch(`http://localhost:3001/api/admin/floors/${createdFloorId}`, {
        method: 'DELETE',
        headers: { Cookie: cookieHeader },
      });
      expect(deleteFloorSuccessRes.status).toBe(200);
      createdFloorId = null;
    } finally {
      if (createdRoomId) {
        await fetch(`http://localhost:3001/api/admin/rooms/${createdRoomId}`, {
          method: 'DELETE',
          headers: { Cookie: cookieHeader },
        }).catch(() => {});
      }
      if (createdFloorId) {
        await fetch(`http://localhost:3001/api/admin/floors/${createdFloorId}`, {
          method: 'DELETE',
          headers: { Cookie: cookieHeader },
        }).catch(() => {});
      }
      // Dọn dẹp tầng 9876 từ lần chạy trước nếu còn
      const leftover = await fetch('http://localhost:3001/api/admin/floors', {
        headers: { Cookie: cookieHeader },
      });
      const leftoverData = await leftover.json();
      if (leftoverData.success && Array.isArray(leftoverData.floors)) {
        const orphan = leftoverData.floors.find((f: any) => f.floorNumber === 9876);
        if (orphan) {
          await fetch(`http://localhost:3001/api/admin/floors/${orphan.id}`, {
            method: 'DELETE',
            headers: { Cookie: cookieHeader },
          }).catch(() => {});
        }
      }
    }
  }, 30000);
});
