# Tối Ưu Hóa Toàn Diện Hệ Thống Homestay Song Ngọc Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Triển khai gói tối ưu hóa toàn diện 4-trong-1 cho Homestay Song Ngọc Phan Thiết bao gồm: Compound Indexes & SQLite WAL, Atomic Booking Concurrency với Prisma `$transaction`, Next.js 15 bundle & caching performance, và UI/UX date cascading cùng loading skeletons.

**Architecture:** Mở rộng schema Prisma với các chỉ mục tổng hợp (compound indexes) phục vụ truy vấn phòng trống theo thời gian thực; đóng gói quy trình tạo đơn vào database transaction ACID; cấu hình HTTP caching headers & optimizePackageImports trên Next.js; cải tiến FloatingBookingBar với logic cascade ngày thông minh và Skeleton UI.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Prisma ORM, SQLite WAL, Vitest, Vanilla CSS Tokens.

**Spec:** `docs/superpowers/specs/2026-10-08-system-optimization-design.md`

## Global Constraints
- Preserve brand name "Song Ngọc" (chữ 'o', tuyệt đối không dùng 'ô').
- No external CSS frameworks (zero Tailwind, zero arbitrary inline HEX colors outside defined tokens).
- Maintain 100% passing status for all existing 19 test suites.

## Review Focus
1. Concurrency double-booking: Two simultaneous requests for the last available room — exactly one must succeed, one must fail with friendly error.
2. Past-date booking: Selecting check-in in the past — blocked at both frontend input (`min={today}`) and API route validation.
3. Date inversion: Setting check-in after check-out — auto-cascaded on frontend, rejected with 400 on backend.
4. SQLite WAL lock: High-frequency reads/writes must not trigger `database is locked`.
5. Skeleton CLS: Loading states must occupy exact dimensions to ensure Cumulative Layout Shift is 0.

---

### Task 1: Database Compound Indexes & SQLite WAL Tuning

**Files:**
- Modify: `prisma/schema.prisma:145-155, 70-75`
- Test: `tests/db-optimization.test.ts`

**Interfaces:**
- Produces: Compound index `Booking_roomTypeId_status_checkIn_checkOut_idx`, `Booking_createdAt_idx`, `RoomType_isActive_basePrice_idx`.

- [ ] **Step 1: Write test verifying schema indexes in `tests/db-optimization.test.ts`**
- [ ] **Step 2: Run test to verify it fails before schema update**
  Run: `npx vitest run tests/db-optimization.test.ts`
- [ ] **Step 3: Add compound indexes to `prisma/schema.prisma` and execute `npx prisma db push`**
- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run tests/db-optimization.test.ts`
- [ ] **Step 5: Commit changes**
  `git add prisma/schema.prisma tests/db-optimization.test.ts && git commit -m "perf(db): add compound indexes for real-time booking availability"`

---

### Task 2: Backend Concurrency Control & Atomic Booking Transaction

**Files:**
- Modify: `src/app/api/booking/create/route.ts:50-135`
- Test: `tests/booking-concurrency.test.ts`

**Interfaces:**
- Consumes: `db.$transaction`, `getRoomTypeAvailability`
- Produces: Atomic booking creation with strict input validation (phone regex, date constraints).

- [ ] **Step 1: Write test for booking validation and transactional creation in `tests/booking-concurrency.test.ts`**
- [ ] **Step 2: Run test to verify failures**
  Run: `npx vitest run tests/booking-concurrency.test.ts`
- [ ] **Step 3: Wrap booking flow in `db.$transaction` and implement strict validations in `src/app/api/booking/create/route.ts`**
- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run tests/booking-concurrency.test.ts`
- [ ] **Step 5: Commit changes**
  `git add src/app/api/booking/create/route.ts tests/booking-concurrency.test.ts && git commit -m "fix(backend): atomic booking transaction and strict validation"`

---

### Task 3: Performance, Bundle & Caching Optimization

**Files:**
- Modify: `next.config.ts:1-25`
- Test: `tests/performance-config.test.ts`

**Interfaces:**
- Produces: `compress: true`, `optimizePackageImports: ['lucide-react']`, immutable static asset headers.

- [ ] **Step 1: Write test checking nextConfig optimizations in `tests/performance-config.test.ts`**
- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run tests/performance-config.test.ts`
- [ ] **Step 3: Update `next.config.ts` with compression, headers, and package import optimizations**
- [ ] **Step 4: Run test to verify it passes**
  Run: `npx vitest run tests/performance-config.test.ts`
- [ ] **Step 5: Commit changes**
  `git add next.config.ts tests/performance-config.test.ts && git commit -m "perf(next): enable compression, headers and optimizePackageImports"`

---

### Task 4: UI/UX Date Cascading, Loading Skeletons & Micro-interactions

**Files:**
- Create: `src/components/ui/Skeleton.tsx`
- Modify: `src/components/booking/FloatingBookingBar.tsx:40-80`
- Modify: `src/app/admin/page.tsx:40-60`
- Test: `tests/ui-ux-optimization.test.ts`

**Interfaces:**
- Produces: `<Skeleton width="..." height="..." />`, `FloatingBookingBar` auto-date cascade.

- [ ] **Step 1: Write test for date cascading and Skeleton component in `tests/ui-ux-optimization.test.ts`**
- [ ] **Step 2: Run test to verify it fails**
  Run: `npx vitest run tests/ui-ux-optimization.test.ts`
- [ ] **Step 3: Create `src/components/ui/Skeleton.tsx` and enhance `FloatingBookingBar.tsx` date cascading**
- [ ] **Step 4: Integrate loading skeletons into `src/app/admin/page.tsx`**
- [ ] **Step 5: Run test to verify it passes**
  Run: `npx vitest run tests/ui-ux-optimization.test.ts`
- [ ] **Step 6: Commit changes**
  `git add src/components/ui/Skeleton.tsx src/components/booking/FloatingBookingBar.tsx src/app/admin/page.tsx tests/ui-ux-optimization.test.ts && git commit -m "feat(ui): add date cascading logic and zero-CLS skeleton loaders"`

---

### Task 5: End-to-End System Integration & Production Build Validation

**Files:**
- Test: All 20+ test files in `tests/`
- Build: Next.js production build

- [ ] **Step 1: Run full Vitest test suite**
  Run: `npm test`
  Expected: ALL test files pass.
- [ ] **Step 2: Run production build verification**
  Run: `npm run build`
  Expected: Exit code 0, 30+ static/dynamic routes compiled.
- [ ] **Step 3: Verify dev server response**
  Run: `curl -s http://localhost:3001/`
  Expected: 200 OK with "Song Ngọc" branding and responsive layout intact.
- [ ] **Step 4: Final commit and wrap-up**
