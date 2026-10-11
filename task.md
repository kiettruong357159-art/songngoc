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
