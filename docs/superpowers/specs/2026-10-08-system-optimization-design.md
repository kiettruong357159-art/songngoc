# Đặc Tả Kỹ Thuật Tối Ưu Hóa Toàn Diện Hệ Thống (Song Ngọc Homestay)
*(Comprehensive System Optimization: Database, Backend, Performance, UI/UX)*

## 1. Mục Tiêu & Phạm Vi (Goals & Scope)
Nâng cấp và tối ưu hóa toàn diện ứng dụng **Homestay Song Ngọc Phan Thiết** trên cả 4 trục:
1. **Database**: Bổ sung compound indexes cho các truy vấn tần suất cao, tối ưu chế độ SQLite WAL (Write-Ahead Logging).
2. **Backend**: Concurrency control với Prisma `$transaction` ngăn chặn tình trạng đặt trùng phòng (double-booking race condition), chuẩn hóa validation và format response.
3. **Performance**: Tối ưu hóa cấu hình Next.js (`compress`, `optimizePackageImports`), caching header cho assets tĩnh, tải ảnh tối ưu.
4. **UI/UX**: Dynamic date cascading & min-date clamping trên `FloatingBookingBar`, loading skeletons chống layout shift (CLS), micro-interactions mượt mà.

---

## 2. Thiết Kế Chi Tiết Từng Trục

### Trục 1: Database Optimization (Prisma & SQLite)
* **Compound Indexes trong `prisma/schema.prisma`:**
  * `Booking`:
    * `@@index([roomTypeId, status, checkIn, checkOut])`: Tối ưu hóa cực đại cho hàm `getRoomTypeAvailability`, cho phép SQLite thực hiện Index-Only Scan thay vì quét toàn bảng.
    * `@@index([createdAt])`: Tối ưu hóa truy vấn đơn hàng mới nhất trên Admin Dashboard.
  * `RoomType`:
    * `@@index([isActive, basePrice])`: Tối ưu hóa truy vấn lọc phòng hiển thị trên Storefront.
  * `Invoice`:
    * `@@index([createdAt])`: Tối ưu báo cáo doanh thu theo ngày/tháng.
* **SQLite PRAGMA tuning:**
  * Bật `journal_mode = WAL` và `synchronous = NORMAL` để tăng tốc độ ghi đồng thời (concurrency write) mà không bị khóa database (database locked).

### Trục 2: Backend Architecture & Concurrency Control
* **Atomic Booking Creation với `$transaction`:**
  * Trong `src/app/api/booking/create/route.ts`:
    * Bọc toàn bộ quy trình kiểm tra phòng trống + tạo/cập nhật thông tin khách (Guest) + tạo đơn đặt phòng (Booking) trong một khối `db.$transaction(...)`.
    * Đảm bảo tính nhất quán (ACID), nếu xảy ra xung đột hoặc lỗi mạng ở bất kỳ bước nào thì tự động rollback, loại bỏ 100% rủi ro tạo khách mà không có đơn hoặc 2 khách cùng chiếm slot cuối cùng.
* **Định Dạng Dữ Liệu & Validation Chặt Chẽ:**
  * Validate số điện thoại Việt Nam (10 chữ số bắt đầu bằng 0).
  * Validate ngày nhận phòng `checkIn >= today`, ngày trả phòng `checkOut > checkIn`, số đêm tối đa 30 ngày.

### Trục 3: Web Performance & Asset Delivery
* **Cấu hình `next.config.ts`:**
  * Bật `compress: true`.
  * Bổ sung `experimental: { optimizePackageImports: ['lucide-react'] }` để loại bỏ tree-shaking overhead của icon library.
  * Bổ sung headers cấu hình cache: Static assets nhận `Cache-Control: public, max-age=31536000, immutable`.
* **Zero CLS & Bundle Tuning:**
  * Sử dụng thẻ hình ảnh với tỷ lệ khung hình cố định (aspect-ratio), tránh hiện tượng giật cục giao diện khi ảnh đang tải.

### Trục 4: UI/UX & Micro-Interactions
* **Dynamic Date Range Handling trên `FloatingBookingBar`:**
  * `checkIn` có `min={today}` (không cho chọn ngày trong quá khứ).
  * `checkOut` có `min={dayAfterCheckIn}`.
  * Khi người dùng thay đổi ngày nhận phòng mà ngày trả phòng hiện tại nhỏ hơn hoặc bằng ngày nhận phòng, hệ thống tự động đẩy ngày trả phòng lên `checkIn + 1 ngày`.
* **Loading Skeletons:**
  * Bổ sung component `Skeleton` tái sử dụng tại `src/components/ui/Skeleton.tsx`.
  * Tích hợp skeleton placeholder trong danh sách phòng và bảng điều khiển Admin khi đang fetch dữ liệu.
* **Micro-interactions:**
  * Hiệu ứng hover nổi nhẹ (card hover elevation) và active ripple trên các button.

---

## 3. Kế Hoạch Kiểm Thử & Tiêu Chí Nghiệm Thu (Verification Criteria)
1. `npx prisma db push` cập nhật schema với indexes mới thành công.
2. Tất cả 19 test files Vitest hiện tại giữ nguyên trạng thái 100% passed.
3. Viết bổ sung test case xác thực compound index và transaction concurrency.
4. `npm run build` xuất bản không có bất kỳ warning hoặc type error nào.
