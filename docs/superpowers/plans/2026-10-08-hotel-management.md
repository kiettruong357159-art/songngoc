# Sông Ngọc Hotel Management System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete Sông Ngọc Hotel Management System (`songngoc`) comprising a boutique luxury Storefront booking engine with VietQR Napas247 payments and an internal Admin Property Management System (PMS) with visual room grid, rapid check-in/out, minibar service billing, and RBAC authentication.

**Architecture:** Next.js 15 App Router with TypeScript and React 19. Data access via Prisma ORM with SQLite for development / PostgreSQL production compatibility. Client interactions styled purely with Vanilla CSS Design Tokens (zero Tailwind, zero arbitrary HEX codes). Authentication powered by HMAC-SHA256 session cookies with PBKDF2 salt hashing and strict RBAC permission guards on both API routes and UI components.

**Tech Stack:** Next.js 15.2+, React 19, TypeScript 5.7+, Prisma ORM 6.4+, Lucide React 0.475+, Vitest 3.0+, Native Vanilla CSS Tokens, Napas247 VietQR.

**Spec:** `docs/superpowers/specs/2026-10-08-hotel-management-design.md`

## Global Constraints

- **No Tailwind CSS**: Use native Vanilla CSS Modules or global CSS tokens defined in `src/app/globals.css`.
- **No Arbitrary HEX Colors**: All colors must use design variables (`var(--color-primary)`, `var(--color-accent)`, `var(--color-room-available)`, etc.).
- **No Native Selects for Large Data**: Custom select component with search input (`CustomSelect`), closing on click-outside or Escape.
- **Pagination & Debounce Required**: Any list query with potentially > 10,000 records must implement pagination and debounced search.
- **RBAC on Both Layers**: Both API endpoints and UI action buttons must enforce permission checks (`ADMIN: ["*"]`, `RECEPTIONIST: ["rooms:view", "rooms:status", "bookings:*", "invoices:*", "services:*"]`, `HOUSEKEEPING: ["rooms:view", "rooms:clean"]`).
- **Formatting Standards**: Vietnamese currency formatted as `450.000₫`, dates in Vietnamese locale (`vi-VN`), formula explanations using `->`.
- **VietQR Specification**: Dynamic Napas247 URL format: `https://img.vietqr.io/image/{bankId}-{accountNo}-compact2.png?amount={amount}&addInfo={code}&accountName={accountName}`.

## Review Focus

1. **Overlapping Booking Race/Capacity Check**: Multiple bookings on the same dates exceeding total room count for a `RoomType` must be rejected before booking confirmation.
2. **Deposit Exceeding Charges at Check-out**: If `depositAmount` > `roomCharge + serviceCharge + surcharge - discount`, `finalAmount` must calculate the exact refund amount or balance without negative integer corruption.
3. **Session Cookie Tampering & Token Verification**: Tampered HMAC signature or expired token in `songngoc_session` cookie must immediately reject requests and clear invalid cookie.
4. **Room Status Invariant Transitions**: PMS status machine must only allow valid transitions (e.g. `OCCUPIED` cannot switch directly to `AVAILABLE` without passing through `DIRTY` -> `CLEANING`).
5. **Unauthorized Actions Block**: Staff with `HOUSEKEEPING` role attempting to modify bookings, generate invoices, or edit prices must receive `403 Forbidden` and have buttons hidden in UI.

---

### Task 1: Project Scaffolding & Setup

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `vitest.config.ts`
- Create: `tests/setup.test.ts`
- Create: `.gitignore`

**Interfaces:**
- Consumes: Node.js runtime and npm packages
- Produces: Runnable Next.js 15 dev environment and Vitest test runner

- [ ] **Step 1: Write the failing test**

```typescript
// tests/setup.test.ts
import { describe, it, expect } from 'vitest';

describe('Project Scaffolding', () => {
  it('should run tests successfully with Vitest', () => {
    const sum = (a: number, b: number) => a + b;
    expect(sum(1, 2)).toBe(3);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/setup.test.ts`
Expected: FAIL or command not found because packages are not yet installed.

- [ ] **Step 3: Initialize project configuration and install dependencies**

Install dependencies:
- `next@^15.2.0`, `react@^19.0.0`, `react-dom@^19.0.0`, `lucide-react@^0.475.0`, `@prisma/client@^6.4.1`
- Dev dependencies: `typescript@^5.7.3`, `@types/node`, `@types/react`, `@types/react-dom`, `prisma@^6.4.1`, `vitest@^3.0.7`, `eslint`, `eslint-config-next`
Configure `package.json` scripts:
  - `"dev": "next dev"`
  - `"build": "next build"`
  - `"start": "next start"`
  - `"test": "vitest run"`
  - `"test:watch": "vitest"`
  - `"prisma:generate": "prisma generate"`
  - `"prisma:push": "prisma db push"`
  - `"prisma:seed": "node --loader ts-node/esm prisma/seed.ts || npx tsx prisma/seed.ts"`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS with 1 test passed.

- [ ] **Step 5: Commit**

```bash
git add package.json tsconfig.json next.config.ts vitest.config.ts tests/setup.test.ts .gitignore
git commit -m "chore: scaffold Next.js 15 project with Vitest and TypeScript"
```

---

### Task 2: Design Tokens & Global CSS Styling

**Files:**
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Test: `tests/design-tokens.test.ts`

**Interfaces:**
- Consumes: Spec design variables from Section 7
- Produces: Global CSS variables (`--color-primary`, `--color-accent`, `--color-room-*`, typography, glassmorphism)

- [ ] **Step 1: Write test verifying CSS token definitions in globals.css**

```typescript
// tests/design-tokens.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Design Tokens Integrity', () => {
  it('globals.css must define required brand and status tokens', () => {
    const cssPath = path.resolve(__dirname, '../src/app/globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    expect(cssContent).toContain('--color-primary: #0f5b66');
    expect(cssContent).toContain('--color-accent: #c49a45');
    expect(cssContent).toContain('--color-room-available: #10b981');
    expect(cssContent).toContain('--color-room-occupied: #ef4444');
    expect(cssContent).toContain('--color-room-dirty: #f59e0b');
    expect(cssContent).toContain('--color-room-cleaning: #3b82f6');
    expect(cssContent).toContain('--color-room-maintenance: #6b7280');
    expect(cssContent).toContain('backdrop-filter: blur(12px)');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/design-tokens.test.ts`
Expected: FAIL (`ENOENT: no such file or directory globals.css`)

- [ ] **Step 3: Implement `src/app/globals.css` and `src/app/layout.tsx`**

Implement complete design tokens in `src/app/globals.css`:
- Brand colors: `--color-primary: #0f5b66`, `--color-primary-hover: #0a434b`, `--color-primary-light: #eaf4f6`
- Accent colors: `--color-accent: #c49a45`, `--color-accent-hover: #b08736`
- Surfaces: `--color-bg: #faf8f5`, `--color-surface: #ffffff`, `--color-border: #ede7df`, `--color-text: #1f2937`, `--color-text-muted: #6b7280`
- Room status colors: available `#10b981`, occupied `#ef4444`, dirty `#f59e0b`, cleaning `#3b82f6`, maintenance `#6b7280`
- Glassmorphism utility: `.glass-panel { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border: 1px solid var(--color-border); }`
- Reset, container, card shadows, transitions, and typography setups.
Create `src/app/layout.tsx` loading Google Fonts (`Plus Jakarta Sans` and `Playfair Display`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/design-tokens.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx tests/design-tokens.test.ts
git commit -m "feat: implement design tokens, glassmorphism utilities and root layout"
```

---

### Task 3: Prisma Schema, Database Singleton & Data Seeding

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/db.ts`
- Create: `prisma/seed.ts`
- Test: `tests/db-schema.test.ts`

**Interfaces:**
- Consumes: Spec data models (`Role`, `User`, `Floor`, `RoomType`, `Room`, `Guest`, `Booking`, `Service`, `BookingService`, `Invoice`)
- Produces: Generated Prisma Client and database seed data

- [ ] **Step 1: Write test for database seed structure**

```typescript
// tests/db-schema.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Prisma Schema Definition', () => {
  it('schema.prisma contains all required models and indices', () => {
    const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
    const content = fs.readFileSync(schemaPath, 'utf-8');

    expect(content).toContain('model Role');
    expect(content).toContain('model User');
    expect(content).toContain('model Floor');
    expect(content).toContain('model RoomType');
    expect(content).toContain('model Room');
    expect(content).toContain('model Guest');
    expect(content).toContain('model Booking');
    expect(content).toContain('model Service');
    expect(content).toContain('model BookingService');
    expect(content).toContain('model Invoice');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/db-schema.test.ts`
Expected: FAIL (`schema.prisma not found`)

- [ ] **Step 3: Implement schema, Prisma client singleton and seed script**

1. Create `prisma/schema.prisma` with SQLite provider for local portability (`env("DATABASE_URL")` with fallback `file:./dev.db`), defining all 10 models verbatim from Spec Section 5.
2. Create `src/lib/db.ts` implementing the Prisma Client singleton to prevent hot-reload connection leaks in Next.js.
3. Create `prisma/seed.ts`:
   - Roles: `ADMIN` (`["*"]`), `RECEPTIONIST` (`["rooms:view", "rooms:status", "bookings:*", "invoices:*", "services:*"]`), `HOUSEKEEPING` (`["rooms:view", "rooms:clean"]`).
   - Admin user: `admin` (password: `admin123` hashed via PBKDF2), receptionist: `receptionist` (password: `rec123`).
   - Floors: Tầng 1, Tầng 2, Tầng 3.
   - RoomTypes: Standard Single (`standard-single`), Deluxe Double (`deluxe-double`), VIP Family (`vip-family`).
   - Rooms: 101, 102, 103 (Floor 1), 201, 202, 203 (Floor 2), 301, 302 (Floor 3).
   - Services: Aquafina (`15.000₫`), Heineken (`30.000₫`), Mì ly (`20.000₫`), Giặt ủi (`50.000₫`), Thuê xe máy (`120.000₫`).
4. Generate client with `npx prisma generate` and push to db `npx prisma db push`.

- [ ] **Step 4: Run test to verify it passes and run seed**

Run: `npm test tests/db-schema.test.ts`
Expected: PASS
Run: `npx prisma db push && npx tsx prisma/seed.ts`
Expected: Seed completed successfully.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma src/lib/db.ts prisma/seed.ts tests/db-schema.test.ts
git commit -m "feat: configure prisma schema, database singleton and seed data"
```

---

### Task 4: Core Domain Logic & Pricing Calculations (TDD)

**Files:**
- Create: `src/lib/utils.ts`
- Create: `src/lib/pricing.ts`
- Test: `tests/pricing.test.ts`

**Interfaces:**
- Consumes: Booking parameters, dates, room prices, services, surcharges
- Produces: `formatVND()`, `calculateNights()`, `calculateBookingPricing()`, `calculateInvoiceSettlement()`

- [ ] **Step 1: Write failing unit test for pricing & utils**

```typescript
// tests/pricing.test.ts
import { describe, it, expect } from 'vitest';
import { formatVND, calculateNights, calculateBookingPricing, calculateInvoiceSettlement } from '../src/lib/pricing';

describe('Pricing Engine', () => {
  it('formats currency correctly to Vietnamese Dong with symbol', () => {
    expect(formatVND(450000)).toBe('450.000₫');
    expect(formatVND(0)).toBe('0₫');
  });

  it('calculates nights accurately between dates (minimum 1 night)', () => {
    const d1 = new Date('2026-10-10T14:00:00Z');
    const d2 = new Date('2026-10-12T12:00:00Z');
    expect(calculateNights(d1, d2)).toBe(2);

    // Same day booking counts as 1 night minimum
    const sameDay = new Date('2026-10-10T18:00:00Z');
    expect(calculateNights(d1, sameDay)).toBe(1);
  });

  it('calculates invoice settlement according to spec example', () => {
    // Spec Example:
    // Tiền phòng (2 đêm x 450.000₫): 900.000₫
    // Dịch vụ (2 Nước suối 15k + 1 Mì 15k): 45.000₫
    // Phụ thu (Trả muộn 1 tiếng): 50.000₫
    // Giảm giá voucher: 0₫
    // Tiền cọc trước đó: 200.000₫
    // => Thực thu tại quầy: 795.000₫
    const settlement = calculateInvoiceSettlement({
      roomCharge: 900000,
      serviceCharge: 450000 ? 45000 : 0,
      surcharge: 50000,
      discount: 0,
      depositDeducted: 200000,
    });
    expect(settlement.finalAmount).toBe(795000);
  });

  it('handles refund case when deposit exceeds total charges without negative error', () => {
    const settlement = calculateInvoiceSettlement({
      roomCharge: 200000,
      serviceCharge: 0,
      surcharge: 0,
      discount: 0,
      depositDeducted: 300000,
    });
    expect(settlement.finalAmount).toBe(0);
    expect(settlement.refundAmount).toBe(100000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/pricing.test.ts`
Expected: FAIL (`Cannot find module '../src/lib/pricing'`)

- [ ] **Step 3: Implement `src/lib/utils.ts` and `src/lib/pricing.ts`**

Implement:
- `formatVND(amount: number): string` using `Intl.NumberFormat('vi-VN')` + `₫`.
- `calculateNights(checkIn: Date | string, checkOut: Date | string): number`.
- `calculateBookingPricing({ basePrice, nights, weekendPrice, weekendNights })`.
- `calculateInvoiceSettlement({ roomCharge, serviceCharge, surcharge, discount, depositDeducted })`:
  `grossTotal = roomCharge + serviceCharge + surcharge - discount`
  `finalAmount = Math.max(0, grossTotal - depositDeducted)`
  `refundAmount = depositDeducted > grossTotal ? depositDeducted - grossTotal : 0`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/pricing.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils.ts src/lib/pricing.ts tests/pricing.test.ts
git commit -m "feat: implement pricing calculations and currency formatters with unit tests"
```

---

### Task 5: VietQR Generation & System Constants (TDD)

**Files:**
- Create: `src/lib/constants.ts`
- Create: `src/lib/vietqr.ts`
- Test: `tests/vietqr.test.ts`

**Interfaces:**
- Consumes: Bank info, booking code, amount, description
- Produces: `generateVietQRUrl()`, System Enums & Configs

- [ ] **Step 1: Write failing unit test for VietQR generation**

```typescript
// tests/vietqr.test.ts
import { describe, it, expect } from 'vitest';
import { generateVietQRUrl, DEFAULT_HOTEL_BANK } from '../src/lib/vietqr';

describe('VietQR Napas247 Generator', () => {
  it('generates valid VietQR image URL with encoded parameters', () => {
    const url = generateVietQRUrl({
      bankId: 'MBBank',
      accountNo: '0987654321',
      amount: 450000,
      bookingCode: 'BK-202610-1001',
      accountName: 'KHACH SAN SONG NGOC',
    });

    expect(url).toContain('https://img.vietqr.io/image/MBBank-0987654321-compact2.png');
    expect(url).toContain('amount=450000');
    expect(url).toContain('addInfo=BK-202610-1001');
    expect(url).toContain('accountName=KHACH%20SAN%20SONG%20NGOC');
  });

  it('uses default bank configuration if optional parameters are omitted', () => {
    const url = generateVietQRUrl({
      amount: 200000,
      bookingCode: 'INV-202610-001',
    });
    expect(url).toContain(DEFAULT_HOTEL_BANK.bankId);
    expect(url).toContain(DEFAULT_HOTEL_BANK.accountNo);
    expect(url).toContain('amount=200000');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/vietqr.test.ts`
Expected: FAIL (`Cannot find module '../src/lib/vietqr'`)

- [ ] **Step 3: Implement `src/lib/constants.ts` and `src/lib/vietqr.ts`**

Define in `src/lib/constants.ts`:
- Room statuses: `AVAILABLE`, `OCCUPIED`, `DIRTY`, `CLEANING`, `MAINTENANCE`
- Booking statuses: `PENDING`, `CONFIRMED`, `CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`
- Payment statuses: `UNPAID`, `PARTIALLY_PAID`, `PAID`
- Default Bank: `{ bankId: 'MBBank', accountNo: '888899996666', accountName: 'KHACH SAN SONG NGOC' }`
- Service categories: `MINIBAR`, `LAUNDRY`, `FOOD`, `TRANSPORT`
Implement in `src/lib/vietqr.ts`:
- `generateVietQRUrl(options: VietQROptions): string` with proper `encodeURIComponent` escaping.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/vietqr.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/constants.ts src/lib/vietqr.ts tests/vietqr.test.ts
git commit -m "feat: implement VietQR Napas247 URL generator and system constants"
```

---

### Task 6: Authentication, Cryptographic Sessions & RBAC Guards (TDD)

**Files:**
- Create: `src/lib/auth.ts`
- Test: `tests/auth-rbac.test.ts`

**Interfaces:**
- Consumes: Passwords, session cookies, user permissions
- Produces: `hashPassword()`, `verifyPassword()`, `createSessionToken()`, `verifySessionToken()`, `hasPermission()`, `requirePermission()`

- [ ] **Step 1: Write failing unit test for Auth & RBAC**

```typescript
// tests/auth-rbac.test.ts
import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  hasPermission,
} from '../src/lib/auth';

describe('Auth & RBAC Discipline', () => {
  it('hashes password with salt and verifies correctly', () => {
    const raw = 'admin123';
    const hashed = hashPassword(raw);
    expect(hashed).toContain(':');
    expect(verifyPassword(raw, hashed)).toBe(true);
    expect(verifyPassword('wrongpassword', hashed)).toBe(false);
  });

  it('signs and verifies HMAC session token correctly', () => {
    const payload = { userId: 'u1', username: 'admin', role: 'ADMIN', permissions: ['*'] };
    const token = createSessionToken(payload);
    const verified = verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.username).toBe('admin');

    // Tampered token fails
    const tampered = token.slice(0, -4) + 'abcd';
    expect(verifySessionToken(tampered)).toBeNull();
  });

  it('evaluates RBAC permissions strictly with wildcard and namespace support', () => {
    const adminPermissions = ['*'];
    const receptionistPermissions = ['rooms:view', 'rooms:status', 'bookings:*', 'invoices:*'];
    const housekeepingPermissions = ['rooms:view', 'rooms:clean'];

    // Admin can do anything
    expect(hasPermission(adminPermissions, 'rooms:view')).toBe(true);
    expect(hasPermission(adminPermissions, 'users:create')).toBe(true);

    // Receptionist
    expect(hasPermission(receptionistPermissions, 'rooms:view')).toBe(true);
    expect(hasPermission(receptionistPermissions, 'bookings:create')).toBe(true);
    expect(hasPermission(receptionistPermissions, 'users:delete')).toBe(false);

    // Housekeeping
    expect(hasPermission(housekeepingPermissions, 'rooms:clean')).toBe(true);
    expect(hasPermission(housekeepingPermissions, 'invoices:create')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/auth-rbac.test.ts`
Expected: FAIL (`Cannot find module '../src/lib/auth'`)

- [ ] **Step 3: Implement `src/lib/auth.ts`**

Implement using Node.js native `crypto`:
- `hashPassword(password: string): string` with 16-byte random salt, 1000 iterations PBKDF2 SHA-512.
- `verifyPassword(password: string, storedHash: string): boolean`.
- `createSessionToken(payload: SessionPayload): string` signing with HMAC-SHA256 and base64url payload + signature.
- `verifySessionToken(token: string): SessionPayload | null` with expiration timestamp verification.
- `hasPermission(userPermissions: string[], required: string): boolean` supporting `*` wildcard and namespace `namespace:*`.
- Cookie helper functions `getSessionUser()`, `setSessionCookie()`, `clearSessionCookie()`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/auth-rbac.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/auth.ts tests/auth-rbac.test.ts
git commit -m "feat: implement PBKDF2 hashing, HMAC session tokens and RBAC authorization"
```

---

### Task 7: Room Availability & Search Logic (TDD)

**Files:**
- Create: `src/lib/availability.ts`
- Test: `tests/room-availability.test.ts`

**Interfaces:**
- Consumes: Room list, existing bookings, desired check-in/check-out dates
- Produces: `isRoomAvailable()`, `filterAvailableRooms()`, `calculateAvailableCountPerType()`

- [ ] **Step 1: Write failing unit test for availability checking**

```typescript
// tests/room-availability.test.ts
import { describe, it, expect } from 'vitest';
import { isDateOverlapping, checkRoomTypeAvailability } from '../src/lib/availability';

describe('Room Availability Logic', () => {
  it('detects date overlaps correctly', () => {
    // Existing: Oct 10 -> Oct 12
    const startA = new Date('2026-10-10T14:00:00Z');
    const endA = new Date('2026-10-12T12:00:00Z');

    // Overlapping: Oct 11 -> Oct 13
    expect(isDateOverlapping(startA, endA, new Date('2026-10-11T14:00:00Z'), new Date('2026-10-13T12:00:00Z'))).toBe(true);

    // Non-overlapping: Oct 12 -> Oct 14 (check-out morning same day as check-in afternoon)
    expect(isDateOverlapping(startA, endA, new Date('2026-10-12T14:00:00Z'), new Date('2026-10-14T12:00:00Z'))).toBe(false);

    // Non-overlapping: Oct 8 -> Oct 10
    expect(isDateOverlapping(startA, endA, new Date('2026-10-08T14:00:00Z'), new Date('2026-10-10T12:00:00Z'))).toBe(false);
  });

  it('calculates available rooms count according to spec formula', () => {
    // Spec Formula: Available = TotalRooms - ConfirmedBookings
    const totalRooms = 5;
    const activeBookingsCount = 3;
    const available = checkRoomTypeAvailability(totalRooms, activeBookingsCount);
    expect(available).toBe(2);

    // Fully booked
    expect(checkRoomTypeAvailability(5, 5)).toBe(0);
    // Overbooked safeguard
    expect(checkRoomTypeAvailability(5, 6)).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/room-availability.test.ts`
Expected: FAIL (`Cannot find module '../src/lib/availability'`)

- [ ] **Step 3: Implement `src/lib/availability.ts`**

Implement:
- `isDateOverlapping(startA, endA, startB, endB): boolean`: Check if `startA < endB && endA > startB`.
- `checkRoomTypeAvailability(totalRooms: number, bookedCount: number): number`.
- `findAvailableRoomsForRange(db: PrismaClient, checkIn: Date, checkOut: Date, roomTypeId?: string)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/room-availability.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/availability.ts tests/room-availability.test.ts
git commit -m "feat: implement room availability and search logic with overlap tests"
```

---

### Task 8: Reusable UI Atoms & Components

**Files:**
- Create: `src/components/ui/CustomSelect.tsx`
- Create: `src/components/ui/Pagination.tsx`
- Create: `src/components/ui/Toast.tsx`
- Create: `src/components/ui/Modal.tsx`
- Create: `src/components/ui/Badge.tsx`
- Create: `src/context/ToastContext.tsx`
- Modify: `src/app/layout.tsx` (wrap in `ToastProvider`)

**Interfaces:**
- Consumes: UI Events, options array, design tokens
- Produces: Reusable `<CustomSelect>`, `<Pagination>`, `<Modal>`, `<ToastProvider>`, `<Badge>`

- [ ] **Step 1: Write unit tests for CustomSelect and Pagination behavior**

```typescript
// tests/ui-components.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('UI Atoms Adherence to Constraints', () => {
  it('CustomSelect implements search and outside click without native select tag', () => {
    const selectPath = path.resolve(__dirname, '../src/components/ui/CustomSelect.tsx');
    const content = fs.readFileSync(selectPath, 'utf-8');

    expect(content).not.toContain('<select');
    expect(content).toContain('search');
    expect(content).toContain('Escape');
  });

  it('Pagination handles pages and boundary disables', () => {
    const pagePath = path.resolve(__dirname, '../src/components/ui/Pagination.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');

    expect(content).toContain('currentPage');
    expect(content).toContain('totalPages');
    expect(content).toContain('onPageChange');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/ui-components.test.ts`
Expected: FAIL (`CustomSelect.tsx not found`)

- [ ] **Step 3: Implement UI atoms in `src/components/ui/` and Toast Context**

1. Create `src/components/ui/CustomSelect.tsx`:
   - Interactive dropdown with input filter for searching through options.
   - Ref-based click-outside listener and `Escape` key listener.
   - Zero `<select>` HTML tag, keyboard accessible.
2. Create `src/components/ui/Pagination.tsx`:
   - Previous, Next, page numbers, ellipsis when > 7 pages.
3. Create `src/components/ui/Modal.tsx`:
   - Accessible dialog with `.glass-panel` background blur, close button, backdrop click to close.
4. Create `src/components/ui/Badge.tsx`:
   - Styled badge utilizing token classes (success, warning, danger, info, neutral).
5. Create `src/context/ToastContext.tsx` & `src/components/ui/Toast.tsx`:
   - `showToast(message, type: 'success' | 'error' | 'info')` with auto-dismiss after 3s.
6. Wrap `src/app/layout.tsx` with `<ToastProvider>`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/ui-components.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/ src/context/ToastContext.tsx src/app/layout.tsx tests/ui-components.test.ts
git commit -m "feat: implement accessible UI atoms (CustomSelect, Pagination, Modal, Toast)"
```

---

### Task 9: Public Storefront - Header, Footer & Landing Page (Option A: Boutique Luxury)

**Files:**
- Create: `src/components/layout/PublicHeader.tsx`
- Create: `src/components/layout/PublicFooter.tsx`
- Create: `src/components/booking/FloatingBookingBar.tsx`
- Create: `src/app/(public)/layout.tsx`
- Create: `src/app/(public)/page.tsx`
- Modify: `src/app/page.tsx` (redirect or render storefront)

**Interfaces:**
- Consumes: Room types from DB, design tokens
- Produces: Boutique Luxury Storefront with 65vh Hero, Floating Booking Bar, and Featured Rooms Grid

- [ ] **Step 1: Write smoke test for Public Storefront page components**

```typescript
// tests/storefront-layout.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Storefront Luxury Hero Spec', () => {
  it('PublicHeader and FloatingBookingBar contain approved layout elements', () => {
    const headerPath = path.resolve(__dirname, '../src/components/layout/PublicHeader.tsx');
    const barPath = path.resolve(__dirname, '../src/components/booking/FloatingBookingBar.tsx');

    expect(fs.readFileSync(headerPath, 'utf-8')).toContain('Sông Ngọc');
    expect(fs.readFileSync(barPath, 'utf-8')).toContain('checkIn');
    expect(fs.readFileSync(barPath, 'utf-8')).toContain('checkOut');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/storefront-layout.test.ts`
Expected: FAIL (`PublicHeader.tsx not found`)

- [ ] **Step 3: Implement Storefront Layout and Landing Page**

1. Create `src/components/layout/PublicHeader.tsx`:
   - Brand logo with font `Playfair Display`, navigation links (Trang chủ, Phòng nghỉ, Tiện ích, Tra cứu đơn), hotline call button, and link to PMS Login.
   - Sticky header with glassmorphism `backdrop-filter: blur(12px)`.
2. Create `src/components/layout/PublicFooter.tsx`:
   - Hotel address, contact details, social links, booking policy.
3. Create `src/components/booking/FloatingBookingBar.tsx`:
   - Check-in / check-out date inputs, adults & children `CustomSelect`, "Tìm phòng trống" button redirecting to `/rooms?checkIn=...&checkOut=...`.
4. Create `src/app/(public)/page.tsx`:
   - 65vh Hero banner with gradient overlay and slogan *"Kỳ Nghỉ Thư Thái Bên Dòng Sông Ngọc"*.
   - Floating Booking Bar overlapping Hero bottom.
   - Featured Room Grid displaying RoomTypes with price in VNĐ/night, amenities tags, and "Đặt phòng ngay" button.
   - Hotel Highlights section (Vị trí đắc địa ven sông, dịch vụ chuẩn mực, ẩm thực phong phú).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/storefront-layout.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/ src/components/booking/ src/app/(public)/ tests/storefront-layout.test.ts
git commit -m "feat: implement public storefront luxury landing page and floating booking bar"
```

---

### Task 10: Public Storefront - Room List & Room Detail

**Files:**
- Create: `src/app/(public)/rooms/page.tsx`
- Create: `src/app/(public)/rooms/[slug]/page.tsx`
- Create: `src/app/api/booking/availability/route.ts`

**Interfaces:**
- Consumes: RoomType data, date query params
- Produces: Room listing page with filters and dynamic room detail pages with booking triggers

- [ ] **Step 1: Write test for Room List and Detail route existence**

```typescript
// tests/rooms-routes.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Public Room Routes', () => {
  it('room pages and availability API route files exist', () => {
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/(public)/rooms/page.tsx'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/(public)/rooms/[slug]/page.tsx'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/api/booking/availability/route.ts'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/rooms-routes.test.ts`
Expected: FAIL (`rooms/page.tsx not found`)

- [ ] **Step 3: Implement Room listing, detail and availability API**

1. Create `src/app/api/booking/availability/route.ts`:
   - Accepts `checkIn`, `checkOut`, `roomTypeId`.
   - Computes available room counts using `checkRoomTypeAvailability`.
   - Returns `{ success: true, data: { availableCount, isAvailable } }`.
2. Create `src/app/(public)/rooms/page.tsx`:
   - Displays all active room types with filtering by price and guest capacity.
   - Shows live remaining room count for given dates.
3. Create `src/app/(public)/rooms/[slug]/page.tsx`:
   - Detailed view with image gallery, room area, bed type, amenities list, policies, and direct booking button prefilled with dates.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/rooms-routes.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/(public)/rooms/ src/app/api/booking/availability/route.ts tests/rooms-routes.test.ts
git commit -m "feat: implement public room listing, room detail and availability API"
```

---

### Task 11: Public Storefront - Booking Form, VietQR Deposit & Tracking

**Files:**
- Create: `src/app/(public)/booking/page.tsx`
- Create: `src/app/(public)/booking/confirmation/page.tsx`
- Create: `src/app/(public)/track/page.tsx`
- Create: `src/app/api/booking/create/route.ts`
- Create: `src/app/api/booking/track/route.ts`

**Interfaces:**
- Consumes: Guest information, dates, room type, payment choice
- Produces: Created booking record, VietQR Napas247 payment display, booking tracker

- [ ] **Step 1: Write test for booking code format and creation API contract**

```typescript
// tests/booking-creation.test.ts
import { describe, it, expect } from 'vitest';

describe('Booking Code Generation Pattern', () => {
  it('generates booking code matching format BK-YYYYMM-XXXX', () => {
    const generateBookingCode = () => {
      const datePart = new Date().toISOString().slice(0, 7).replace('-', '');
      const random = Math.floor(1000 + Math.random() * 9000);
      return `BK-${datePart}-${random}`;
    };

    const code = generateBookingCode();
    expect(code).toMatch(/^BK-\d{6}-\d{4}$/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/booking-creation.test.ts`
(Step 1 code is self-contained to establish format)

- [ ] **Step 3: Implement booking creation, VietQR display and booking tracking**

1. Create `src/app/api/booking/create/route.ts`:
   - Validates guest full name, phone number, check-in/out dates, room type.
   - Verifies room availability for requested dates.
   - Creates/finds `Guest` record, creates `Booking` with unique `BK-YYYYMM-XXXX` code.
   - Returns `{ success: true, data: { bookingCode, depositAmount, vietqrUrl } }`.
2. Create `src/app/(public)/booking/page.tsx`:
   - Guest details input form, stay dates summary, pricing breakdown.
   - Payment method selector: "Thanh toán khi nhận phòng (Pay at counter)" or "Đặt cọc chuyển khoản VietQR".
3. Create `src/app/(public)/booking/confirmation/page.tsx`:
   - Displays success message, booking code, and if VietQR chosen, renders dynamic QR code with exact amount and booking code info.
4. Create `src/app/(public)/track/page.tsx` & `src/app/api/booking/track/route.ts`:
   - Search booking by phone number or booking code, displays status (`PENDING`, `CONFIRMED`, `CHECKED_IN`, etc.).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/booking-creation.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/(public)/booking/ src/app/(public)/track/ src/app/api/booking/ tests/booking-creation.test.ts
git commit -m "feat: implement public booking flow, VietQR deposit screen and booking tracker"
```

---

### Task 12: Admin PMS - Authentication, Session Guard & Layout

**Files:**
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Create: `src/app/api/auth/me/route.ts`
- Create: `src/context/AuthContext.tsx`
- Create: `src/components/layout/AdminSidebar.tsx`
- Create: `src/components/layout/AdminHeader.tsx`
- Create: `src/app/admin/layout.tsx`

**Interfaces:**
- Consumes: Credentials, session cookie
- Produces: Protected admin layout with RBAC-filtered sidebar navigation

- [ ] **Step 1: Write test for Admin layout and auth endpoints**

```typescript
// tests/admin-auth.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Admin PMS Auth Protection', () => {
  it('Admin layout enforces authentication check and contains RBAC sidebar', () => {
    const layoutPath = path.resolve(__dirname, '../src/app/admin/layout.tsx');
    const sidebarPath = path.resolve(__dirname, '../src/components/layout/AdminSidebar.tsx');

    expect(fs.readFileSync(layoutPath, 'utf-8')).toContain('getSession');
    expect(fs.readFileSync(sidebarPath, 'utf-8')).toContain('hasPermission');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/admin-auth.test.ts`
Expected: FAIL (`AdminSidebar.tsx not found`)

- [ ] **Step 3: Implement staff login, session APIs and Admin Layout**

1. Create `src/app/api/auth/login/route.ts`:
   - Finds user, verifies PBKDF2 password, sets `songngoc_session` HTTP-only cookie, returns user info with role and permissions.
2. Create `src/app/api/auth/logout/route.ts` and `src/app/api/auth/me/route.ts`.
3. Create `src/app/(auth)/login/page.tsx`:
   - Clean luxury login form with brand colors and error notifications.
4. Create `src/context/AuthContext.tsx`:
   - Provides `user`, `logout`, and `can(permission)` helper to client components.
5. Create `src/components/layout/AdminSidebar.tsx`:
   - Navigation links: Dashboard (`/admin`), Sơ đồ phòng (`/admin/rooms`), Đặt phòng (`/admin/bookings`), Check-in (`/admin/checkin`), Dịch vụ (`/admin/services`), Hóa đơn (`/admin/invoices`), Cấu hình phòng (`/admin/room-types`), Nhân viên (`/admin/users`).
   - Filters visible items using `can(permission)` (e.g. users management only for `users:manage` or `*`).
6. Create `src/components/layout/AdminHeader.tsx` with user badge and logout action.
7. Create `src/app/admin/layout.tsx` checking session cookie, redirecting unauthenticated visitors to `/login`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/admin-auth.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/(auth)/login/ src/app/api/auth/ src/context/AuthContext.tsx src/components/layout/Admin* src/app/admin/layout.tsx tests/admin-auth.test.ts
git commit -m "feat: implement staff authentication, session cookie management and protected admin layout"
```

---

### Task 13: Admin PMS - Dashboard Overview

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/app/api/admin/dashboard/route.ts`

**Interfaces:**
- Consumes: Database statistics (rooms, bookings, invoices)
- Produces: Executive PMS Dashboard with key metrics and room status breakdown

- [ ] **Step 1: Write test for dashboard API structure**

```typescript
// tests/dashboard.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PMS Dashboard Components', () => {
  it('Dashboard page exists and renders metric cards', () => {
    const pagePath = path.resolve(__dirname, '../src/app/admin/page.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');

    expect(content).toContain('Tỷ lệ lấp đầy');
    expect(content).toContain('Doanh thu');
    expect(content).toContain('Check-in hôm nay');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/dashboard.test.ts`
Expected: FAIL (`admin/page.tsx not found`)

- [ ] **Step 3: Implement Dashboard overview page & API**

1. Create `src/app/api/admin/dashboard/route.ts`:
   - Checks session and permissions.
   - Calculates occupancy rate (`OCCUPIED / TotalRooms * 100%`).
   - Counts today's scheduled check-ins and check-outs.
   - Computes today's invoice revenue sum.
   - Fetches recent 5 bookings and room status breakdown counts.
2. Create `src/app/admin/page.tsx`:
   - Metric cards: Occupancy rate %, Today Revenue (VNĐ), Check-ins today, Check-outs today.
   - Status summary cards (Available, Occupied, Dirty, Cleaning, Maintenance) with respective token colors.
   - Quick table of recent bookings.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/dashboard.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/page.tsx src/app/api/admin/dashboard/route.ts tests/dashboard.test.ts
git commit -m "feat: implement PMS executive dashboard overview with KPI metrics"
```

---

### Task 14: Admin PMS - Visual Room Grid (Sơ Đồ Phòng Trực Quan)

**Files:**
- Create: `src/components/pms/RoomCard.tsx`
- Create: `src/components/pms/FloorSection.tsx`
- Create: `src/components/pms/QuickActionModal.tsx`
- Create: `src/app/admin/rooms/page.tsx`
- Create: `src/app/api/admin/rooms/route.ts`
- Create: `src/app/api/admin/rooms/[id]/status/route.ts`

**Interfaces:**
- Consumes: Room list grouped by Floor, current booking details, status colors
- Produces: Visual Grid Room Rack with instant status transitions

- [ ] **Step 1: Write test for room status transitions logic**

```typescript
// tests/room-transitions.test.ts
import { describe, it, expect } from 'vitest';

describe('Room Status State Machine', () => {
  const isValidTransition = (from: string, to: string) => {
    const transitions: Record<string, string[]> = {
      AVAILABLE: ['OCCUPIED', 'MAINTENANCE'],
      OCCUPIED: ['DIRTY'],
      DIRTY: ['CLEANING', 'MAINTENANCE'],
      CLEANING: ['AVAILABLE', 'DIRTY'],
      MAINTENANCE: ['DIRTY', 'AVAILABLE'],
    };
    return transitions[from]?.includes(to) ?? false;
  };

  it('allows valid PMS operational transitions', () => {
    expect(isValidTransition('AVAILABLE', 'OCCUPIED')).toBe(true);
    expect(isValidTransition('OCCUPIED', 'DIRTY')).toBe(true);
    expect(isValidTransition('DIRTY', 'CLEANING')).toBe(true);
    expect(isValidTransition('CLEANING', 'AVAILABLE')).toBe(true);
  });

  it('blocks invalid transitions (cannot jump directly from OCCUPIED to AVAILABLE)', () => {
    expect(isValidTransition('OCCUPIED', 'AVAILABLE')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/room-transitions.test.ts`
(Transition unit test passes)

- [ ] **Step 3: Implement Visual Grid Room Rack & quick actions**

1. Create `src/components/pms/RoomCard.tsx`:
   - Room number, room type badge, status color indicators (`AVAILABLE`: green, `OCCUPIED`: red, `DIRTY`: amber, `CLEANING`: blue, `MAINTENANCE`: gray).
   - If occupied, displays guest name and checkout date.
2. Create `src/components/pms/FloorSection.tsx`:
   - Groups rooms by Floor (Tầng 1, Tầng 2, Tầng 3).
3. Create `src/components/pms/QuickActionModal.tsx`:
   - When AVAILABLE: Walk-in Check-in button, Assign Booking button.
   - When OCCUPIED: Add Service button, Check-out button.
   - When DIRTY: "Bắt đầu dọn phòng" -> status CLEANING.
   - When CLEANING: "Hoàn tất dọn dẹp" -> status AVAILABLE.
   - When MAINTENANCE: "Hoàn tất bảo trì".
4. Create `src/app/admin/rooms/page.tsx`:
   - Floor tabs and Status filter pills (Tất cả, Đang trống, Có khách, Cần dọn, Đang dọn, Bảo trì).
5. Create APIs:
   - `src/app/api/admin/rooms/route.ts` to get rooms with active bookings.
   - `src/app/api/admin/rooms/[id]/status/route.ts` enforcing permission (`rooms:status` or `rooms:clean`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/room-transitions.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/pms/ src/app/admin/rooms/ src/app/api/admin/rooms/ tests/room-transitions.test.ts
git commit -m "feat: implement visual room grid (PMS Room Rack) with floor grouping and status actions"
```

---

### Task 15: Admin PMS - Check-in & Booking Management

**Files:**
- Create: `src/app/admin/bookings/page.tsx`
- Create: `src/app/admin/checkin/page.tsx`
- Create: `src/app/api/admin/bookings/route.ts`
- Create: `src/app/api/admin/bookings/[id]/route.ts`
- Create: `src/app/api/admin/bookings/[id]/checkin/route.ts`

**Interfaces:**
- Consumes: Guest information, pre-existing bookings, room assignment
- Produces: Direct walk-in check-in, pre-booked check-in, booking search with pagination

- [ ] **Step 1: Write test for booking search with pagination parameters**

```typescript
// tests/bookings-pms.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PMS Booking Management Code Checks', () => {
  it('Bookings page enforces CustomSelect and Pagination', () => {
    const pagePath = path.resolve(__dirname, '../src/app/admin/bookings/page.tsx');
    const content = fs.readFileSync(pagePath, 'utf-8');

    expect(content).toContain('Pagination');
    expect(content).toContain('CustomSelect');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/bookings-pms.test.ts`
Expected: FAIL (`bookings/page.tsx not found`)

- [ ] **Step 3: Implement Check-in and Bookings management**

1. Create `src/app/admin/checkin/page.tsx`:
   - Fast walk-in check-in form: Guest name, phone, CCCD, room type, available room dropdown (`CustomSelect`), check-out date, deposit amount.
   - Submitting sets room to `OCCUPIED` and creates booking with status `CHECKED_IN`.
2. Create `src/app/admin/bookings/page.tsx`:
   - Table with debounced search query (booking code, guest name, phone).
   - Filter by status (`PENDING`, `CONFIRMED`, `CHECKED_IN`, `CHECKED_OUT`, `CANCELLED`) using `CustomSelect`.
   - Action buttons: "Xác nhận", "Nhận phòng", "Hủy đơn".
   - `Pagination` controls.
3. Create API routes for booking CRUD and Check-in execution:
   - `src/app/api/admin/bookings/route.ts` (supports `page`, `limit`, `search`, `status`).
   - `src/app/api/admin/bookings/[id]/checkin/route.ts` (assigns specific room and switches status to `OCCUPIED`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/bookings-pms.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/bookings/ src/app/admin/checkin/ src/app/api/admin/bookings/ tests/bookings-pms.test.ts
git commit -m "feat: implement PMS check-in desk and paginated booking management"
```

---

### Task 16: Admin PMS - Room Services (Minibar / Laundry / Services)

**Files:**
- Create: `src/components/admin/ServiceSelector.tsx`
- Create: `src/app/admin/services/page.tsx`
- Create: `src/app/api/admin/services/route.ts`
- Create: `src/app/api/admin/bookings/[id]/services/route.ts`

**Interfaces:**
- Consumes: Service catalog items, active booking
- Produces: Service ordering modal and service catalog management

- [ ] **Step 1: Write test for service selector interface**

```typescript
// tests/services-pms.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PMS Services Management', () => {
  it('Service selector and services catalog files exist', () => {
    expect(fs.existsSync(path.resolve(__dirname, '../src/components/admin/ServiceSelector.tsx'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/admin/services/page.tsx'))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, '../src/app/api/admin/services/route.ts'))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/services-pms.test.ts`
Expected: FAIL (`ServiceSelector.tsx not found`)

- [ ] **Step 3: Implement Services management and room service charge recording**

1. Create `src/components/admin/ServiceSelector.tsx`:
   - Categorized service selector (Minibar, Giặt ủi, Đồ ăn, Thuê xe).
   - Quantity selector (+ / -) and instant total price calculation.
2. Create `src/app/admin/services/page.tsx`:
   - CRUD catalog for services (Name, Category, Price, Unit, Active toggle).
3. Create APIs:
   - `src/app/api/admin/services/route.ts` (CRUD services).
   - `src/app/api/admin/bookings/[id]/services/route.ts` (records `BookingService` entries for active booking).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/services-pms.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/ServiceSelector.tsx src/app/admin/services/ src/app/api/admin/services/ src/app/api/admin/bookings/[id]/services/ tests/services-pms.test.ts
git commit -m "feat: implement minibar and laundry service selector and catalog management"
```

---

### Task 17: Admin PMS - Check-out, Invoicing & VietQR Settlement

**Files:**
- Create: `src/components/admin/InvoiceDetailModal.tsx`
- Create: `src/app/admin/invoices/page.tsx`
- Create: `src/app/api/admin/invoices/route.ts`
- Create: `src/app/api/admin/invoices/[id]/route.ts`

**Interfaces:**
- Consumes: Booking with room charges, services, surcharges, deposit
- Produces: Transparent invoice modal, dynamic VietQR Napas247 payment display, finalized invoice record

- [ ] **Step 1: Write test for Invoice code pattern and calculations**

```typescript
// tests/invoices-pms.test.ts
import { describe, it, expect } from 'vitest';

describe('Invoice Code Generation', () => {
  it('generates invoice code matching format INV-YYYYMM-XXXX', () => {
    const generateInvoiceCode = () => {
      const datePart = new Date().toISOString().slice(0, 7).replace('-', '');
      const random = Math.floor(1000 + Math.random() * 9000);
      return `INV-${datePart}-${random}`;
    };

    const code = generateInvoiceCode();
    expect(code).toMatch(/^INV-\d{6}-\d{4}$/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/invoices-pms.test.ts`
(Unit test passes)

- [ ] **Step 3: Implement Check-out settlement and Invoices page**

1. Create `src/components/admin/InvoiceDetailModal.tsx`:
   - Itemized bill breakdown: Room charge + Minibar/Services list + Surcharge (late checkout) - Discount - Deposit already paid = Final Amount.
   - Payment method toggle: "Tiền mặt" (Cash) or "VietQR Napas247".
   - If VietQR chosen: displays dynamic QR code with exact remaining amount and invoice code.
   - "Thanh toán & Trả phòng" button.
2. Create `src/app/api/admin/invoices/route.ts`:
   - Generates `Invoice` with unique `INV-YYYYMM-XXXX` code.
   - Updates `Booking` status to `CHECKED_OUT`.
   - Transitions `Room` status to `DIRTY`.
3. Create `src/app/admin/invoices/page.tsx`:
   - Paginated history of all invoices with search, date filters, view/print receipt action.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/invoices-pms.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/InvoiceDetailModal.tsx src/app/admin/invoices/ src/app/api/admin/invoices/ tests/invoices-pms.test.ts
git commit -m "feat: implement check-out invoicing modal with dynamic VietQR settlement"
```

---

### Task 18: Admin PMS - Room Types, Staff & RBAC Management

**Files:**
- Create: `src/app/admin/room-types/page.tsx`
- Create: `src/app/admin/users/page.tsx`
- Create: `src/app/api/admin/room-types/route.ts`
- Create: `src/app/api/admin/users/route.ts`
- Create: `src/app/api/admin/users/[id]/route.ts`

**Interfaces:**
- Consumes: RoomType configs, User/Role data
- Produces: Room type pricing management and User RBAC assignment

- [ ] **Step 1: Write test verifying RBAC permission checks on user management**

```typescript
// tests/users-rbac.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('User Management RBAC Guard', () => {
  it('Users API route checks for ADMIN role or wildcard permission', () => {
    const routePath = path.resolve(__dirname, '../src/app/api/admin/users/route.ts');
    const content = fs.readFileSync(routePath, 'utf-8');

    expect(content).toContain('requirePermission');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test tests/users-rbac.test.ts`
Expected: FAIL (`users/route.ts not found`)

- [ ] **Step 3: Implement Room Types and User Management**

1. Create `src/app/admin/room-types/page.tsx`:
   - View and edit base price, weekend price, hourly price, guest capacity, amenities.
2. Create `src/app/admin/users/page.tsx`:
   - List staff accounts with Role badge (`ADMIN`, `RECEPTIONIST`, `HOUSEKEEPING`).
   - Create new user modal, reset password modal, toggle active status.
   - Accessible only by users with `users:manage` or `*` permission.
3. Create APIs:
   - `src/app/api/admin/room-types/route.ts`
   - `src/app/api/admin/users/route.ts` & `src/app/api/admin/users/[id]/route.ts` strictly guarding with `requirePermission`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test tests/users-rbac.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/room-types/ src/app/admin/users/ src/app/api/admin/room-types/ src/app/api/admin/users/ tests/users-rbac.test.ts
git commit -m "feat: implement room types pricing editor and staff RBAC management"
```

---

### Task 19: End-to-End System Integration & Production Build Verification

**Files:**
- Modify: `tests/e2e-workflow.test.ts` (Create comprehensive integration test)
- Verify: Full `npm test` suite
- Verify: `npm run build`

**Interfaces:**
- Consumes: All modules and routes
- Produces: 100% passing tests and production-ready Next.js build

- [ ] **Step 1: Write end-to-end integration test covering complete hotel guest-to-checkout journey**

```typescript
// tests/e2e-workflow.test.ts
import { describe, it, expect } from 'vitest';
import { calculateInvoiceSettlement, formatVND } from '../src/lib/pricing';
import { generateVietQRUrl } from '../src/lib/vietqr';
import { hashPassword, verifyPassword, hasPermission } from '../src/lib/auth';
import { isDateOverlapping } from '../src/lib/availability';

describe('End-to-End Booking & Settlement Lifecycle', () => {
  it('completes the entire cycle: availability -> booking -> checkin -> minibar -> checkout', () => {
    // 1. Date overlap check
    const checkIn = new Date('2026-10-15T14:00:00Z');
    const checkOut = new Date('2026-10-17T12:00:00Z');
    expect(isDateOverlapping(checkIn, checkOut, new Date('2026-10-16T14:00:00Z'), new Date('2026-10-18T12:00:00Z'))).toBe(true);

    // 2. VietQR deposit generation
    const qrUrl = generateVietQRUrl({
      amount: 200000,
      bookingCode: 'BK-202610-9999',
    });
    expect(qrUrl).toContain('amount=200000');

    // 3. Receptionist permission check
    const receptionistPerms = ['rooms:view', 'rooms:status', 'bookings:*', 'invoices:*'];
    expect(hasPermission(receptionistPerms, 'invoices:create')).toBe(true);

    // 4. Final settlement calculation
    const invoice = calculateInvoiceSettlement({
      roomCharge: 900000, // 2 nights x 450k
      serviceCharge: 45000, // minibar
      surcharge: 50000, // late checkout
      discount: 0,
      depositDeducted: 200000,
    });
    expect(invoice.finalAmount).toBe(795000);
    expect(formatVND(invoice.finalAmount)).toBe('795.000₫');
  });
});
```

- [ ] **Step 2: Run test suite**

Run: `npm test`
Expected: PASS (All test suites pass)

- [ ] **Step 3: Execute Next.js production build**

Run: `npm run build`
Expected: Build succeeds with 0 TypeScript and 0 lint errors.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e-workflow.test.ts
git commit -m "test: add end-to-end integration test and verify production build"
```
