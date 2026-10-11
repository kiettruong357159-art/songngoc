# Song Ngọc Homestay Management System - Task Checklist

## Phase 1: Core System Features (Completed)
- [x] Task 1: Project Scaffolding & Setup (Next.js 15, TypeScript, Vitest)
- [x] Task 2: Design Tokens & Global CSS Styling (globals.css, layout.tsx, fonts)
- [x] Task 3: Prisma Schema, Database Singleton & Data Seeding (SQLite dev.db, seed.ts)
- [x] Task 4: Core Domain Logic & Pricing Calculations (TDD pricing.test.ts)
- [x] Task 5: VietQR Generation & System Constants (TDD vietqr.test.ts)
- [x] Task 6: Authentication, Cryptographic Sessions & RBAC Guards (TDD auth-rbac.test.ts)
- [x] Task 7: Room Availability & Search Logic (TDD room-availability.test.ts)
- [x] Task 8: Reusable UI Atoms & Components (CustomSelect, Pagination, Toast, Modal, Badge)
- [x] Task 9: Public Storefront - Header, Footer & Landing Page (Boutique Luxury Hero, Floating Bar)
- [x] Task 10: Public Storefront - Room List & Room Detail (Availability filter, room cards, slug)
- [x] Task 11: Public Storefront - Booking Form, VietQR Deposit & Tracking
- [x] Task 12: Admin PMS - Authentication, Session Guard & Layout
- [x] Task 13: Admin PMS - Dashboard Overview (KPI cards, room status counts)
- [x] Task 14: Admin PMS - Visual Room Grid (PMS Room Rack, floor sections, status transitions)
- [x] Task 15: Admin PMS - Check-in & Booking Management (walk-in checkin, paginated table)
- [x] Task 16: Admin PMS - Room Services (Minibar, Laundry, service selector)
- [x] Task 17: Admin PMS - Check-out, Invoicing & VietQR Settlement
- [x] Task 18: Admin PMS - Room Types, Staff & RBAC Management
- [x] Task 19: End-to-End System Integration & Production Build Verification

## Phase 2: Enterprise Optimization (Theo PROJECT_RULES_TEMPLATE.md)
- [x] Task 20: CSDL & Hạ tầng Neon Serverless (Direct URL & Composite Indexes)
- [x] Task 21: Tối ưu triệt để Dashboard bằng SQL Aggregations (Triệt tiêu load RAM)
- [x] Task 22: Envelopes chuẩn hóa, Type Safety & Query Deduplication với React.cache()
- [x] Task 23: Chốt chặn Anti-double submit & Edge CDN Caching Headers
- [x] Task 24: UX Resilience - Global 0ms Skeleton Shimmer & Safe Error Boundary
- [x] Task 25: Kiểm thử toàn diện, Type Check & Nghiệm thu sản phẩm

## Phase 3: Nâng cấp Toàn diện theo Quy chuẩn Mới (Edge Security, Image Resiliency & Tailored Skeletons)
- [x] Task 26: Edge Middleware (src/middleware.ts) & Chống FOUC (< 5ms redirect HTTP 307 cho /admin)
- [x] Task 27: System-Wide Image Resiliency (placeholder-room.svg & SafeImage.tsx với onError fallback)
- [x] Task 28: Per-Page Tailored Skeleton System (loading.tsx theo từng route, SkeletonBox, AdminDashboardSkeleton, RoomCardSkeleton)
- [x] Task 29: Kiểm thử tích hợp toàn diện, Type Check & Production Build Verification

## Phase 4: Tối ưu hóa Toàn diện Mobile & Tablet (Taste Skill Responsive UI)
- [x] Task 30: Admin PMS Mobile Drawer & Header Responsive (AdminUIContext, AdminSidebar, AdminHeader, admin/layout.tsx)
- [x] Task 31: Public Storefront Mobile & Tablet Layout (FloatingBookingBar, rooms/[slug], booking/page.tsx)
- [x] Task 32: Table & PMS Room Rack Mobile Horizontal Scrolling & Grid Adaptive
- [x] Task 33: Responsive UI Testing & Production Build Verification

## Phase 5: Đồng bộ Quy chuẩn Mới (Pipeline, Hiệu năng API, UI Overlay)
- [x] Task 34: Bật noUnusedLocals/noUnusedParameters, dọn import/biến thừa, bỏ tiền tố _ (Skeletons.tsx)
- [x] Task 35: Pipeline 3 lớp: scripts/verify-code-rules.ts, scripts/setup-hooks.ts, .github/workflows/ci.yml, npm scripts (check:rules, check:types, verify, pre-push)
- [x] Task 36: Zod validation (booking/create, admin/services POST), giới hạn MAX_LIST_LIMIT cho users/services, helper successResponse/errorResponse
- [x] Task 37: CustomSelect render qua Portal + position fixed + z-index 10000, tự lật lên, click-outside cả menu
- [x] Task 38: Build production xác nhận (cần tắt dev server giữ Prisma engine nếu chạy npm run build)
- [-] Bỏ qua: Admin SPA nhiều tab (mục 8) không áp dụng vì admin dùng route riêng

## Phase 6: Quản lý Tầng & Phòng (Thêm / Sửa / Xóa)
- [x] Task 39: Backend APIs: CRUD Tầng (`/api/admin/floors` & `[id]`), CRUD Phòng (`/api/admin/rooms` & `[id]`), kiểm tra RBAC và ràng buộc an toàn (không xóa phòng có khách, không xóa tầng có phòng).
- [x] Task 40: UI Modals: `FloorModal.tsx` (Thêm/Sửa Tầng) và `RoomModal.tsx` (Thêm/Sửa Phòng, chọn tầng & hạng phòng).
- [x] Task 41: UI Integration: Nút thêm tầng/phòng ở header trang `/admin/rooms`, nút thêm phòng/sửa/xóa ở từng `FloorSection.tsx`, nút sửa/xóa trong `QuickActionModal.tsx`.
- [x] Task 42: Kiểm thử logic API, Type check `npx tsc --noEmit` & Xác nhận với Toast notifications.

## Phase 7: Chuẩn hóa Toàn diện Định dạng (Format) Giao diện Quản trị
- [x] Task 43: Bổ sung CSS design tokens & utilities chuẩn hóa (`.admin-action-header`, `.admin-filter-card`, `.admin-table-card`, `.admin-table-footer`, `.admin-action-btns`) trong `globals.css`.
- [x] Task 44: Chuẩn hóa format trang Đặt phòng (`/admin/bookings`) & Hóa đơn (`/admin/invoices`): Action Bar, Filter Bar với dropdown trạng thái, bảng chuẩn hóa header/rows/empty state, và pagination.
- [x] Task 45: Chuẩn hóa format trang Dịch vụ (`/admin/services`) & Nhân viên (`/admin/users`): Tích hợp đầy đủ Bộ lọc nhiều tiêu chí (Search, Category/Role, Status) và Phân trang chuẩn (`<Pagination>`).
- [x] Task 46: Chuẩn hóa format trang Hạng phòng (`/admin/room-types`) & Sơ đồ phòng (`/admin/rooms`): Đồng bộ Action Bar, Search & Filter Bar, card grid format.
- [x] Task 47: Kiểm thử toàn diện `npx tsc --noEmit`, test suite `npx vitest run`, và rule check `npm run check:rules`.

## Phase 8: Quản lý Hạng phòng & Hình ảnh Phòng (Room Types CRUD & Images)
- [x] Task 48: API Upload ảnh & Quản lý thư mục tĩnh (`POST /api/admin/upload`, lưu vào `public/uploads/rooms/`).
- [x] Task 49: Backend API CRUD Hạng phòng: Thêm mới `POST /api/admin/room-types`, sửa đầy đủ ảnh/tiện nghi `PATCH /api/admin/room-types`, xóa có ràng buộc an toàn `DELETE /api/admin/room-types/[id]`.
- [x] Task 50: Component Modal Quản lý Hạng phòng `RoomTypeModal.tsx` (Tải ảnh từ máy, thêm URL, xóa ảnh, đặt cover, bộ chọn tiện nghi badges, form bảng giá).
- [x] Task 51: Nâng cấp Giao diện `/admin/room-types/page.tsx` (Nút thêm hạng phòng, ảnh đại diện + badge số lượng ảnh, nút xóa kèm Confirm Modal).
- [x] Task 52: Kiểm thử Unit Tests `tests/room-types-crud.test.ts`, Type Check & Code Rules Verification.

## Phase 9: Quản lý Danh mục Tiện nghi & Cấu hình Chính sách Nhận phòng
- [x] Task 53: CSDL Neon & Migration (Model `Amenity` & trường `policies` trong `RoomType`, dừng dev server tránh DLL lock, nạp 20 tiện nghi mặc định).
- [x] Task 54: Backend APIs: CRUD Tiện nghi (`/api/admin/amenities` & `[id]`), cập nhật API Hạng phòng lưu `policies`.
- [x] Task 55: Giao diện Quản trị: Thêm menu `/admin/amenities` vào `AdminSidebar.tsx`, xây dựng trang `/admin/amenities/page.tsx` và `AmenityModal.tsx`.
- [x] Task 56: Tích hợp Tiện nghi động & Quản lý Chính sách vào `RoomTypeModal.tsx` (Mục 5: Chính sách nhận phòng kèm nút "Nạp chính sách mặc định").
- [x] Task 57: Cập nhật Storefront `/rooms/[slug]` hiển thị chính sách động từ `roomType.policies`.
- [x] Task 58: Kiểm thử toàn diện (`tests/amenities-policies.test.ts`), `npm run verify` (`check:rules`, `check:types`, `vitest`).

## Phase 10: Trình Chiếu Ảnh Dạng Carousel Cho Hạng Phòng
- [x] Task 59: Xây dựng Client Component `RoomImageCarousel.tsx` (Trượt slide mượt mà, nút Prev/Next Glassmorphism, badge đếm ảnh `1/N`, dải thumbnail thu nhỏ có thể click chuyển slide, hỗ trợ touch swipe và lightbox phóng to).
- [x] Task 60: Tích hợp `RoomImageCarousel` vào trang chi tiết hạng phòng `src/app/(public)/rooms/[slug]/page.tsx` thay thế layout grid tĩnh cũ.
- [x] Task 61: Viết kiểm thử `tests/room-image-carousel.test.ts` và chạy toàn diện `npm run verify` (`check:rules`, `check:types`, `vitest run`).


