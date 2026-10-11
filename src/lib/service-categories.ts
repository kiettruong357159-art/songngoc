import { SERVICE_CATEGORY_LABELS } from '@/lib/constants';

/** Danh sách khoá icon cho phép khi tạo danh mục dịch vụ */
export const SERVICE_CATEGORY_ICON_KEYS = [
  'coffee',
  'shirt',
  'utensils',
  'car',
  'bed',
  'sparkles',
  'tag',
  'gift',
] as const;

export type ServiceCategoryIconKey = (typeof SERVICE_CATEGORY_ICON_KEYS)[number];

/** Nhãn tiếng Việt cho từng icon trong ô chọn */
export const SERVICE_CATEGORY_ICON_LABELS: Record<ServiceCategoryIconKey, string> = {
  coffee: 'Đồ uống',
  shirt: 'Giặt ủi',
  utensils: 'Ăn uống',
  car: 'Phương tiện',
  bed: 'Phòng ngủ',
  sparkles: 'Tiện ích',
  tag: 'Khác',
  gift: 'Quà tặng',
};

/** Một danh mục dịch vụ trả về từ API */
export interface ServiceCategoryItem {
  id: string;
  code: string;
  name: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

/** Icon mặc định cho 4 danh mục có sẵn trước đây */
const DEFAULT_ICON_BY_CODE: Record<string, ServiceCategoryIconKey> = {
  MINIBAR: 'coffee',
  LAUNDRY: 'shirt',
  FOOD: 'utensils',
  TRANSPORT: 'car',
};

/**
 * Danh mục mặc định (khớp với 4 loại cố định cũ), dùng khi bảng ServiceCategory chưa có dữ liệu
 * @returns Danh sách danh mục mặc định, id có tiền tố "default-"
 */
export function getDefaultServiceCategories(): ServiceCategoryItem[] {
  return Object.entries(SERVICE_CATEGORY_LABELS).map(([code, name], index) => ({
    id: `default-${code}`,
    code,
    name,
    icon: DEFAULT_ICON_BY_CODE[code] || 'tag',
    sortOrder: index + 1,
    isActive: true,
  }));
}

/**
 * Kiểm tra id có phải danh mục mặc định chưa lưu vào DB hay không
 * @param id Id danh mục
 * @returns true nếu là danh mục mặc định (fallback)
 */
export function isDefaultServiceCategoryId(id: string): boolean {
  return id.startsWith('default-');
}
