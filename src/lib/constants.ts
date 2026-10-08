// Sông Ngọc Hotel Constants & Enums

export const ROOM_STATUS = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  DIRTY: 'DIRTY',
  CLEANING: 'CLEANING',
  MAINTENANCE: 'MAINTENANCE',
} as const;

export type RoomStatus = (typeof ROOM_STATUS)[keyof typeof ROOM_STATUS];

export const ROOM_STATUS_META: Record<
  RoomStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  AVAILABLE: {
    label: 'Phòng trống',
    color: 'var(--color-room-available)',
    bg: 'var(--color-room-available-bg)',
    border: 'var(--color-room-available-border)',
  },
  OCCUPIED: {
    label: 'Đang có khách',
    color: 'var(--color-room-occupied)',
    bg: 'var(--color-room-occupied-bg)',
    border: 'var(--color-room-occupied-border)',
  },
  DIRTY: {
    label: 'Chờ dọn dẹp',
    color: 'var(--color-room-dirty)',
    bg: 'var(--color-room-dirty-bg)',
    border: 'var(--color-room-dirty-border)',
  },
  CLEANING: {
    label: 'Đang dọn dẹp',
    color: 'var(--color-room-cleaning)',
    bg: 'var(--color-room-cleaning-bg)',
    border: 'var(--color-room-cleaning-border)',
  },
  MAINTENANCE: {
    label: 'Đang bảo trì',
    color: 'var(--color-room-maintenance)',
    bg: 'var(--color-room-maintenance-bg)',
    border: 'var(--color-room-maintenance-border)',
  },
};

export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CHECKED_IN: 'CHECKED_IN',
  CHECKED_OUT: 'CHECKED_OUT',
  CANCELLED: 'CANCELLED',
} as const;

export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

export const BOOKING_STATUS_META: Record<
  BookingStatus,
  { label: string; badgeType: 'warning' | 'info' | 'success' | 'neutral' | 'danger' }
> = {
  PENDING: { label: 'Chờ duyệt', badgeType: 'warning' },
  CONFIRMED: { label: 'Đã xác nhận', badgeType: 'info' },
  CHECKED_IN: { label: 'Đang ở', badgeType: 'success' },
  CHECKED_OUT: { label: 'Đã trả phòng', badgeType: 'neutral' },
  CANCELLED: { label: 'Đã hủy', badgeType: 'danger' },
};

export const PAYMENT_STATUS = {
  UNPAID: 'UNPAID',
  PARTIALLY_PAID: 'PARTIALLY_PAID',
  PAID: 'PAID',
} as const;

export const DEFAULT_HOTEL_BANK = {
  bankId: 'MBBank',
  accountNo: '888899996666',
  accountName: 'KHACH SAN SONG NGOC',
};

export const SERVICE_CATEGORIES = {
  MINIBAR: 'MINIBAR',
  LAUNDRY: 'LAUNDRY',
  FOOD: 'FOOD',
  TRANSPORT: 'TRANSPORT',
} as const;

export const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  MINIBAR: 'Minibar đồ uống',
  LAUNDRY: 'Giặt ủi',
  FOOD: 'Đồ ăn',
  TRANSPORT: 'Thuê phương tiện',
};
