import { cache } from 'react';
import { db } from '@/lib/db';

/**
 * Tái sử dụng kết quả truy vấn RoomType theo slug giữa generateMetadata và RoomDetailPage
 * Đảm bảo chỉ bắn duy nhất 1 câu query xuống Postgres DB trong cùng 1 request render.
 */
export const getCachedRoomTypeBySlug = cache(async (slug: string) => {
  return db.roomType.findUnique({
    where: { slug },
  });
});

/**
 * Tái sử dụng danh sách các hạng phòng đang hoạt động
 */
export const getCachedActiveRoomTypes = cache(async () => {
  return db.roomType.findMany({
    where: { isActive: true },
    orderBy: { basePrice: 'asc' },
  });
});

/**
 * Tái sử dụng danh sách tầng và phòng
 */
export const getCachedFloors = cache(async () => {
  return db.floor.findMany({
    orderBy: { floorNumber: 'asc' },
    include: {
      rooms: {
        orderBy: { roomNumber: 'asc' },
        include: { roomType: true },
      },
    },
  });
});
