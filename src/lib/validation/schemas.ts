import { z } from 'zod';
import { SERVICE_CATEGORY_ICON_KEYS } from '@/lib/service-categories';

/**
 * Schema kiểm tra kiểu dữ liệu body đặt phòng công khai (POST /api/booking/create).
 * Các quy tắc nghiệp vụ (ngày quá khứ, tối đa 30 đêm, SĐT...) vẫn nằm ở route để giữ nguyên thông báo lỗi.
 */
export const CreatePublicBookingSchema = z.object({
  fullName: z.string().trim().min(1),
  phone: z.union([z.string(), z.number()]).transform((v) => String(v)).pipe(z.string().trim().min(1)),
  email: z.string().trim().optional().nullable(),
  roomTypeId: z.string().min(1),
  checkIn: z.string().min(1),
  checkOut: z.string().min(1),
  adults: z.coerce.number().int().min(1).default(1),
  children: z.coerce.number().int().min(0).default(0),
  specialRequests: z.string().optional().nullable(),
  paymentMethod: z.enum(['COUNTER', 'VIETQR']).default('COUNTER'),
});

export type CreatePublicBookingInput = z.infer<typeof CreatePublicBookingSchema>;

/**
 * Schema kiểm tra body tạo dịch vụ (POST /api/admin/services).
 */
export const CreateServiceSchema = z.object({
  name: z.string().trim().min(1),
  category: z.string().min(1),
  price: z.coerce.number().min(0),
  unit: z.string().trim().min(1),
  isActive: z.boolean().default(true),
});

export type CreateServiceInput = z.infer<typeof CreateServiceSchema>;

/**
 * Schema kiểm tra body tạo danh mục dịch vụ (POST /api/admin/service-categories).
 */
export const CreateServiceCategorySchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9_]{2,30}$/),
  name: z.string().trim().min(1).max(60),
  icon: z.enum(SERVICE_CATEGORY_ICON_KEYS).default('tag'),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isActive: z.boolean().default(true),
});

export type CreateServiceCategoryInput = z.infer<typeof CreateServiceCategorySchema>;

/**
 * Schema kiểm tra body cập nhật danh mục dịch vụ (PATCH /api/admin/service-categories). Không cho đổi code.
 */
export const UpdateServiceCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(60).optional(),
  icon: z.enum(SERVICE_CATEGORY_ICON_KEYS).optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateServiceCategoryInput = z.infer<typeof UpdateServiceCategorySchema>;
