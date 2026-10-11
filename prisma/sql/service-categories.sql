-- Tạo bảng danh mục dịch vụ (PostgreSQL / Neon) - an toàn khi chạy nhiều lần
-- Chạy thủ công trước khi dùng chức năng "Quản lý danh mục" trên trang Minibar & Dịch vụ.

CREATE TABLE IF NOT EXISTS "ServiceCategory" (
  "id"        TEXT         NOT NULL,
  "code"      TEXT         NOT NULL,
  "name"      TEXT         NOT NULL,
  "icon"      TEXT         NOT NULL DEFAULT 'coffee',
  "sortOrder" INTEGER      NOT NULL DEFAULT 0,
  "isActive"  BOOLEAN      NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ServiceCategory_code_key" ON "ServiceCategory" ("code");
CREATE INDEX IF NOT EXISTS "ServiceCategory_sortOrder_idx" ON "ServiceCategory" ("sortOrder");

-- Nạp 4 danh mục mặc định (khớp dữ liệu Service.category hiện có), bỏ qua nếu mã đã tồn tại
INSERT INTO "ServiceCategory" ("id", "code", "name", "icon", "sortOrder", "isActive")
VALUES
  (gen_random_uuid()::text, 'MINIBAR',   'Minibar đồ uống', 'coffee',   1, TRUE),
  (gen_random_uuid()::text, 'LAUNDRY',   'Giặt ủi',         'shirt',    2, TRUE),
  (gen_random_uuid()::text, 'FOOD',      'Đồ ăn',           'utensils', 3, TRUE),
  (gen_random_uuid()::text, 'TRANSPORT', 'Thuê phương tiện', 'car',      4, TRUE)
ON CONFLICT ("code") DO NOTHING;
