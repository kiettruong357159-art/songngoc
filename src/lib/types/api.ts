// Song Ngọc Homestay - Standardized API Response Envelopes & Types (PROJECT_RULES_TEMPLATE.md Section V)

/**
 * Phản hồi chuẩn hóa cho các thao tác hành động (Mutations: Tạo, Sửa, Xóa)
 */
export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

/**
 * Phản hồi chuẩn hóa cho các danh sách phân trang (Pagination)
 */
export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    currentPage: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Tạo phản hồi thành công theo envelope ActionResponse
 * @param data Dữ liệu trả về
 * @param message Thông báo tùy chọn
 * @returns ActionResponse thành công
 */
export function successResponse<T>(data: T, message?: string): ActionResponse<T> {
  return { success: true, data, message };
}

/**
 * Tạo phản hồi lỗi theo envelope ActionResponse
 * @param error Nội dung lỗi
 * @param fieldErrors Lỗi theo từng trường (tùy chọn)
 * @returns ActionResponse thất bại
 */
export function errorResponse(error: string, fieldErrors?: Record<string, string[]>): ActionResponse<never> {
  return { success: false, error, fieldErrors };
}
