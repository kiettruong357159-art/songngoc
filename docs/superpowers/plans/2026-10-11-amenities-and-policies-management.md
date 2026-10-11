# Kế Hoạch Triển Khai: Trang Quản Lý "Danh Mục Tiện Nghi" & Cấu Hình "Chính Sách Nhận Phòng"

> **Dự án:** Song Ngọc Homestay Management System
> **Mục tiêu:** 
> 1. Xây dựng trang Quản trị riêng **"Danh mục Tiện nghi"** (`/admin/amenities`) cho phép Thêm - Sửa - Xóa các tiện nghi, icon, nhóm phân loại để dùng chung động cho các hạng phòng.
> 2. Triển khai **"Cách 3"**: Cho phép quản trị viên chỉnh sửa nội dung **Chính sách khách sạn & Nhận phòng** trực tiếp từ trang Admin cho từng hạng phòng và hiển thị ra Storefront.

---

## 1. Kiến trúc CSDL & Dữ liệu (Neon PostgreSQL)

### 1.1. Model `Amenity` mới trong `prisma/schema.prisma`:
```prisma
model Amenity {
  id        String   @id @default(cuid())
  code      String   @unique // "wifi", "air_con", "bathtub", "coffee_maker"
  name      String   // "Wifi tốc độ cao", "Máy lạnh / Điều hòa"
  icon      String   @default("sparkles") // wifi, snowflake, tv, bath, coffee, wind, sun...
  category  String   @default("GENERAL") // BEDROOM, BATHROOM, MEDIA, GENERAL
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([category, isActive])
  @@index([sortOrder])
}
```

### 1.2. Thêm trường `policies` vào `RoomType`:
```prisma
model RoomType {
  ...
  description  String
  policies     String?   // Văn bản chính sách nhận phòng (mỗi dòng 1 điều khoản)
  isActive     Boolean   @default(true)
  ...
}
```

- **Safe SQL Migration**:
  ```sql
  ALTER TABLE "RoomType" ADD COLUMN IF NOT EXISTS "policies" TEXT;
  CREATE TABLE IF NOT EXISTS "Amenity" (
    "id" TEXT PRIMARY KEY,
    "code" TEXT UNIQUE NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'sparkles',
    "category" TEXT NOT NULL DEFAULT 'GENERAL',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
  );
  ```

---

## 2. Các Bước Triển Khai Chi Tiết

### Phase 1: CSDL & Backend APIs
- **Task 1: CSDL Migration & Seed Tiện nghi**:
  - Dừng tạm dev server để giải phóng file engine Prisma trên Windows.
  - Cập nhật `prisma/schema.prisma`, chạy `npx prisma db push`.
  - Khởi động lại dev server trên cổng 3001.
  - Tự động nạp sẵn 20 tiện nghi tiêu chuẩn vào bảng `Amenity` nếu bảng đang trống.
- **Task 2: API CRUD Tiện nghi (`/api/admin/amenities` & `[id]`)**:
  - `GET /api/admin/amenities`: Lấy danh sách tiện nghi có phân loại, tìm kiếm, sắp xếp theo `sortOrder`.
  - `POST /api/admin/amenities`: Thêm mới tiện nghi (kiểm tra trùng mã `code`, lưu `name`, `icon`, `category`).
  - `PATCH /api/admin/amenities`: Cập nhật tên, icon, nhóm phân loại, trạng thái bật/tắt.
  - `DELETE /api/admin/amenities/[id]`: Xóa an toàn tiện nghi.
- **Task 3: Mở rộng API Hạng phòng với `policies`**:
  - `POST` & `PATCH /api/admin/room-types`: Lưu trữ trường `policies`.

### Phase 2: Giao diện Quản trị
- **Task 4: Thêm Menu "Danh mục tiện nghi" vào Admin Sidebar**:
  - Cập nhật [src/components/admin/AdminSidebar.tsx](file:///c:/Users/MSI%20RAIDER%20GE76/Documents/Project/songngoc/src/components/admin/AdminSidebar.tsx) bổ sung icon & route `/admin/amenities` dưới mục `QUẢN TRỊ HỆ THỐNG`.
- **Task 5: Xây dựng Trang Quản trị Tiện nghi (`/admin/amenities/page.tsx`)**:
  - Chuẩn hóa layout theo định dạng hệ thống: Action Header (+ Thêm tiện nghi mới, Làm mới), Filter Card (Tìm kiếm, Lọc nhóm, Lọc trạng thái), Table chuẩn hóa hiển thị Icon, Mã code, Tên hiển thị, Nhóm, Thứ tự, Trạng thái, Thao tác Sửa/Xóa.
  - Modal Thêm / Chỉnh sửa Tiện nghi (`AmenityModal.tsx`): Chọn icon trực quan, nhập tên tiếng Việt, chọn nhóm danh mục.
- **Task 6: Tích hợp Danh mục Tiện nghi Động vào `RoomTypeModal.tsx`**:
  - Tải danh sách tiện nghi trực tiếp từ API `/api/admin/amenities`.
  - Nhóm các tiện nghi theo từng danh mục trực quan.
  - Bổ sung **Mục 5: Chính Sách Khách Sạn & Nhận Phòng** với ô soạn thảo và nút *"Nạp chính sách mặc định"*.

### Phase 3: Hiển thị Storefront & Kiểm thử
- **Task 7: Hiển thị Chính sách & Tiện nghi ngoài Storefront**:
  - Cập nhật [src/app/(public)/rooms/[slug]/page.tsx](file:///c:/Users/MSI%20RAIDER%20GE76/Documents/Project/songngoc/src/app/(public)/rooms/%5Bslug%5D/page.tsx): Đọc `roomType.policies` và hiển thị các gạch đầu dòng do Admin thiết lập (tự fallback về mặc định nếu chưa cấu hình).
- **Task 8: Kiểm thử toàn diện Pipeline**:
  - Viết test suite `tests/amenities-policies.test.ts`.
  - Chạy `npm run check:rules`, `npm run check:types`, `vitest run`.
