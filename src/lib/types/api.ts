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
