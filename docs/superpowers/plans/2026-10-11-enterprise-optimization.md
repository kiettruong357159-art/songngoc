# Song Ngọc Homestay - Kế Hoạch Tối Ưu Toàn Diện Theo Chuẩn Enterprise (PROJECT_RULES_TEMPLATE.md)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nâng cấp và tối ưu hóa toàn diện dự án Song Ngọc Homestay đáp ứng 100% tiêu chuẩn Enterprise từ `PROJECT_RULES_TEMPLATE.md`, bao gồm: Database Composite Indexes, Direct URL cho Neon, SQL Aggregations triệt tiêu load RAM cho Dashboard, React.cache() query deduplication, Envelope Type Safety, Anti-double submit guards, Edge CDN caching và 0ms Skeleton Shimmer / Error boundaries.

**Architecture:** 
1. CSDL & Hạ tầng: Thêm `directUrl` tách biệt kênh migration và query qua PgBouncer pooler trên Neon; bổ sung Composite Indexes cho `Booking`, `Invoice`, `Room` tăng tốc độ lọc và sắp xếp.
2. Backend & Performance: Tối ưu triệt để Route Handler Dashboard bằng SQL `groupBy` và `aggregate` (`_sum`), chạy song song qua `Promise.all`. Tạo `src/lib/types/api.ts` chuẩn hóa envelopes và `src/lib/cached-queries.ts` với `React.cache()`.
3. Frontend & UX: Bổ sung chốt chặn anti-double submit trên các form và modal, gắn Edge CDN caching cho public availability API, xây dựng `loading.tsx` Skeleton Shimmer (CLS = 0) và `error.tsx` error boundary an toàn.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Prisma ORM, Neon PostgreSQL Serverless, Vitest, Vanilla CSS Design Tokens.

**Spec:** `PROJECT_RULES_TEMPLATE.md`

## Global Constraints
- Tuân thủ nghiêm ngặt 100% các nguyên tắc cốt lõi trong `PROJECT_RULES_TEMPLATE.md`.
- Bảo toàn mã nguồn và nghiệp vụ cũ, không phá vỡ bất kỳ test suite nào đang pass (53/53 tests).
- 100% màu sắc và giao diện phải lấy từ Design Tokens tại `src/app/globals.css`.
- Đảm bảo `npm test`, `npx tsc --noEmit` và `npm run build` thành công tuyệt đối trước khi hoàn tất.

## Review Focus
1. `dashboard-ram-exhaustion`: Bảng `Room` hoặc `Invoice` có 10.000+ bản ghi không được load toàn bộ vào RAM Node.js.
2. `double-submit-race`: Nhấn đúp nhanh vào nút "Tiến hành đặt phòng" hoặc "Tạo đơn nhận phòng" không được gửi 2 requests song song.
3. `seo-metadata-deduplication`: Trang chi tiết phòng `/rooms/[slug]` lấy dữ liệu cho cả `generateMetadata` và Page component chỉ thực thi đúng 1 truy vấn DB duy nhất nhờ `React.cache()`.
4. `database-direct-migration`: Prisma migration và db push sử dụng `DIRECT_URL` (port 5432) trong khi ứng dụng runtime sử dụng `DATABASE_URL` (pooler).
5. `edge-caching-headers`: Endpoint lấy tình trạng phòng công khai có header `Cache-Control` cho Edge CDN.

---

### Task 1: CSDL & Hạ Tầng Neon Serverless (Direct URL & Composite Indexes)

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `.env`
- Modify: `.env.example`
- Create: `tests/database-indexes.test.ts`

**Interfaces:**
- Consumes: Neon PostgreSQL connection strings (`DATABASE_URL`, `DIRECT_URL`).
- Produces: Composite Indexes trên các bảng `Booking`, `Invoice`, `Room`.

- [ ] **Step 1: Write test kiểm tra cấu hình schema & composite indexes**
  Viết file `tests/database-indexes.test.ts` kiểm tra file `prisma/schema.prisma` có khai báo `directUrl = env("DIRECT_URL")` và các composite indexes: `[status, createdAt]`, `[paymentStatus, createdAt]`, `[paymentMethod, createdAt]`, `[roomTypeId, status]`, `[floorId, status]`.

- [ ] **Step 2: Run test để xác nhận test fails**
  Run: `npx vitest run tests/database-indexes.test.ts`
  Expected: FAIL do chưa bổ sung `directUrl` và composite indexes mới.

- [ ] **Step 3: Cập nhật `prisma/schema.prisma` và `.env`**
  - Thêm `directUrl = env("DIRECT_URL")` vào datasource block trong `prisma/schema.prisma`.
  - Thêm `@@index([status, createdAt])` và `@@index([paymentStatus, createdAt])` vào model `Booking`.
  - Thêm `@@index([paymentMethod, createdAt])` vào model `Invoice`.
  - Thêm `@@index([roomTypeId, status])` và `@@index([floorId, status])` vào model `Room`.
  - Cập nhật `.env` & `.env.example` với `DIRECT_URL` và `DATABASE_URL`.
  - Đồng bộ schema lên Neon DB: `npx prisma db push`.

- [ ] **Step 4: Run test để xác nhận test passes**
  Run: `npx vitest run tests/database-indexes.test.ts`
  Expected: PASS

---

### Task 2: Tối Ưu Triệt Để Dashboard Bằng SQL Aggregations (Triệt Tiêu Load RAM)

**Files:**
- Modify: `src/app/api/admin/dashboard/route.ts`
- Create: `tests/admin-dashboard-aggregation.test.ts`

**Interfaces:**
- Consumes: `db.room`, `db.booking`, `db.invoice`.
- Produces: API response `/api/admin/dashboard` với dữ liệu tính toán hoàn toàn bằng SQL Server-side aggregations (`groupBy`, `_sum`, `count`), không load row vào Node.js RAM.

- [ ] **Step 1: Write test kiểm tra hiệu năng & tính chính xác của aggregation**
  Viết file `tests/admin-dashboard-aggregation.test.ts` gọi route GET `/api/admin/dashboard` và kiểm tra cấu trúc thống kê `statusCounts`, `totalRooms`, `occupancyRate`, `todayRevenue`.

- [ ] **Step 2: Run test để kiểm tra hiện trạng**
  Run: `npx vitest run tests/admin-dashboard-aggregation.test.ts`

- [ ] **Step 3: Tối ưu hóa `src/app/api/admin/dashboard/route.ts`**
  - Thay thế `db.room.findMany()` bằng `db.room.groupBy({ by: ['status'], _count: { status: true } })` kết hợp `db.room.count()`.
  - Thay thế `db.invoice.findMany()` và `.reduce()` bằng `db.invoice.aggregate({ _sum: { finalAmount: true }, where: ... })`.
  - Chạy tất cả 5 truy vấn song song qua `Promise.all`.

- [ ] **Step 4: Run test để xác nhận test passes**
  Run: `npx vitest run tests/admin-dashboard-aggregation.test.ts`
  Expected: PASS

---

### Task 3: Envelopes Chuẩn Hóa, Type Safety & Query Deduplication với React.cache()

**Files:**
- Create: `src/lib/types/api.ts`
- Create: `src/lib/cached-queries.ts`
- Modify: `src/app/(public)/rooms/[slug]/page.tsx`
- Create: `tests/cached-queries.test.ts`

**Interfaces:**
- Produces:
  - `ActionResponse<T>` và `PaginatedResponse<T>` trong `src/lib/types/api.ts`.
  - `getCachedRoomTypeBySlug(slug: string)` và `getCachedRoomTypes()` trong `src/lib/cached-queries.ts`.
  - `generateMetadata()` trong `src/app/(public)/rooms/[slug]/page.tsx` dùng `getCachedRoomTypeBySlug`.

- [ ] **Step 1: Write test kiểm tra cached-queries & api types**
  Viết file `tests/cached-queries.test.ts` xác thực hàm `getCachedRoomTypeBySlug` và các types `ActionResponse`, `PaginatedResponse`.

- [ ] **Step 2: Run test để verify fail**
  Run: `npx vitest run tests/cached-queries.test.ts`
  Expected: FAIL

- [ ] **Step 3: Implement `src/lib/types/api.ts` và `src/lib/cached-queries.ts`**
  - Khai báo `ActionResponse<T>` và `PaginatedResponse<T>` đúng chuẩn mục V trong `PROJECT_RULES_TEMPLATE.md`.
  - Tạo `src/lib/cached-queries.ts` bọc `React.cache()` cho `getCachedRoomTypeBySlug` và `getCachedActiveRoomTypes`.
  - Bổ sung `generateMetadata` vào `src/app/(public)/rooms/[slug]/page.tsx` sử dụng `getCachedRoomTypeBySlug` để deduplicate query giữa Metadata và Page component.

- [ ] **Step 4: Run test để xác nhận test passes**
  Run: `npx vitest run tests/cached-queries.test.ts`
  Expected: PASS

---

### Task 4: Chốt Chặn Anti-Double Submit & Edge CDN Caching Headers

**Files:**
- Modify: `src/app/(public)/booking/page.tsx`
- Modify: `src/app/api/booking/availability/route.ts`
- Create: `tests/anti-double-submit.test.ts`

**Interfaces:**
- Consumes: UI events & HTTP response headers.
- Produces: Chốt chặn `if (submitting) return;` trong Form đặt phòng, Header `Cache-Control` cho endpoint kiểm tra phòng trống.

- [ ] **Step 1: Write test kiểm tra Edge cache header & logic guard**
  Viết file `tests/anti-double-submit.test.ts` kiểm tra header của route `/api/booking/availability` có chứa `Cache-Control`.

- [ ] **Step 2: Run test verify fail**
  Run: `npx vitest run tests/anti-double-submit.test.ts`
  Expected: FAIL

- [ ] **Step 3: Triển khai các chốt chặn và cache headers**
  - Thêm `if (submitting) return;` vào đầu hàm `handleSubmit` trong `src/app/(public)/booking/page.tsx`.
  - Thêm header `Cache-Control: public, s-maxage=30, stale-while-revalidate=60` vào response của `src/app/api/booking/availability/route.ts`.

- [ ] **Step 4: Run test để xác nhận test passes**
  Run: `npx vitest run tests/anti-double-submit.test.ts`
  Expected: PASS

---

### Task 5: UX Resilience - Global 0ms Skeleton Shimmer & Safe Error Boundary

**Files:**
- Create: `src/app/loading.tsx`
- Create: `src/app/error.tsx`
- Create: `tests/ux-resilience.test.ts`

**Interfaces:**
- Produces: `loading.tsx` với hiệu ứng shimmer không giật layout (CLS = 0) và `error.tsx` giao diện khôi phục sự cố sang trọng.

- [ ] **Step 1: Write test kiểm tra cấu trúc component loading.tsx và error.tsx**
  Viết file `tests/ux-resilience.test.ts` xác thực `loading.tsx` và `error.tsx` export default đúng chuẩn React component và chứa các tokens nhận diện.

- [ ] **Step 2: Run test verify fail**
  Run: `npx vitest run tests/ux-resilience.test.ts`
  Expected: FAIL

- [ ] **Step 3: Tạo `src/app/loading.tsx` và `src/app/error.tsx`**
  - Tạo `src/app/loading.tsx` với Skeleton Shimmer cao cấp (hero skeleton, card skeleton) sử dụng CSS tokens từ `globals.css`.
  - Tạo `src/app/error.tsx` ('use client') hiển thị thông báo lỗi thân thiện, nút "Thử lại" (`reset()`) và nút quay về trang chủ.

- [ ] **Step 4: Run test để xác nhận test passes**
  Run: `npx vitest run tests/ux-resilience.test.ts`
  Expected: PASS

---

### Task 6: Kiểm Thử Toàn Diện, Type Check & Nghiệm Thu Sản Phẩm

**Files:**
- Modify: `task.md`

- [ ] **Step 1: Chạy toàn bộ test suites**
  Run: `npm test`
  Expected: PASS 100% tất cả các test files (cũ + mới).

- [ ] **Step 2: Kiểm tra lỗi TypeScript toàn dự án**
  Run: `npx tsc --noEmit`
  Expected: Không có bất kỳ lỗi type nào.

- [ ] **Step 3: Chạy build production nghiệm thu**
  Run: `npm run build`
  Expected: Thành công biên dịch toàn bộ các trang tĩnh & động.

- [ ] **Step 4: Cập nhật checklist trong `task.md`**
  Ghi nhận hoàn thành giai đoạn tối ưu Enterprise theo `PROJECT_RULES_TEMPLATE.md`.
