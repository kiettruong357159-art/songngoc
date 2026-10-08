// Sông Ngọc Hotel - Room Availability & Overlap Checking Engine
import { PrismaClient } from '@prisma/client';

/**
 * Kiểm tra xem 2 khoảng thời gian [startA, endA) và [startB, endB) có bị giao thoa (overlap) hay không.
 * Khách trả phòng lúc 12:00 ngày X và khách mới nhận phòng lúc 14:00 cùng ngày X KHÔNG tính là overlap.
 */
export function isDateOverlapping(
  startA: Date | string,
  endA: Date | string,
  startB: Date | string,
  endB: Date | string
): boolean {
  const sA = new Date(startA).getTime();
  const eA = new Date(endA).getTime();
  const sB = new Date(startB).getTime();
  const eB = new Date(endB).getTime();

  return sA < eB && eA > sB;
}

/**
 * Công thức tính số phòng khả dụng theo đặc tả mục 6.1:
 * Số phòng khả dụng = Tổng số phòng của loại phòng - Số đơn đã giữ chỗ/đang ở trong khoảng ngày
 */
export function checkRoomTypeAvailability(totalRooms: number, bookedCount: number): number {
  return Math.max(0, totalRooms - Math.max(0, bookedCount));
}

export interface AvailabilityCheckResult {
  roomTypeId: string;
  totalRooms: number;
  bookedCount: number;
  availableCount: number;
  isAvailable: boolean;
}

/**
 * Truy vấn cơ sở dữ liệu để tính toán số phòng khả dụng thực tế của một loại phòng
 */
export async function getRoomTypeAvailability(
  db: PrismaClient,
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date
): Promise<AvailabilityCheckResult> {
  // 1. Đếm tổng số phòng khả dụng thuộc loại phòng này (loại trừ phòng bảo trì)
  const totalRooms = await db.room.count({
    where: {
      roomTypeId,
      status: { not: 'MAINTENANCE' },
    },
  });

  // 2. Tìm tất cả đơn đặt phòng bị trùng khoảng ngày
  const overlappingBookings = await db.booking.count({
    where: {
      roomTypeId,
      status: { in: ['CONFIRMED', 'CHECKED_IN'] },
      checkIn: { lt: checkOut },
      checkOut: { gt: checkIn },
    },
  });

  const availableCount = checkRoomTypeAvailability(totalRooms, overlappingBookings);

  return {
    roomTypeId,
    totalRooms,
    bookedCount: overlappingBookings,
    availableCount,
    isAvailable: availableCount > 0,
  };
}
