# Đặc Tả Thiết Kế Hệ Thống Quản Lý Khách Sạn Sông Ngọc (Song Ngoc Hotel Management System)

- **Ngày ban hành:** 2026-10-08
- **Phiên bản:** 1.0 (MVP)
- **Tác giả:** Antigravity & Kiet
- **Trạng thái:** Đã phê duyệt (Approved)

---

## 1. TỔNG QUAN HỆ THỐNG (PROJECT OVERVIEW)

Hệ thống Quản lý Khách sạn **Sông Ngọc** (`songngoc`) là giải pháp toàn diện all-in-one phục vụ 2 nhóm đối tượng cốt lõi:
1. **Khách hàng bên ngoài (Storefront Booking Engine)**: Trang web giới thiệu khách sạn sang trọng, chuẩn SEO, cho phép xem hình ảnh phòng ốc, kiểm tra phòng trống theo khoảng ngày, đặt phòng trực tuyến và thanh toán đặt cọc tiện lợi qua mã **VietQR Napas247**.
2. **Nội bộ khách sạn (Admin PMS - Property Management System)**: Trung tâm điều hành dành cho Lễ tân, Quản lý và Buồng phòng với sơ đồ phòng trực quan dạng Grid, thao tác Check-in / Check-out siêu tốc, ghi nhận dịch vụ minibar/giặt ủi, lập hóa đơn tự động và quản lý phân quyền nhân viên theo vai trò (RBAC).

---

## 2. NGUYÊN TẮC KỸ THUẬT CỐT LÕI (CORE ENGINEERING MINDSET)

Toàn bộ quá trình lập trình và kiến trúc bắt buộc tuân thủ 4 nguyên tắc vàng:

### 2.1. Tư duy dữ liệu lớn (> 10.000 bản ghi)
* Mọi danh sách hiển thị (Booking, Hóa đơn, Khách hàng, Lịch sử phòng) bắt buộc phải có phân trang (`Pagination`) và bộ lọc tìm kiếm có debounce.
* Tuyệt đối không truy vấn dữ liệu thả phanh (`findMany()` không giới hạn `take`).
* Cấm dùng thẻ select nguyên thủy (`<select>` HTML thô) cho danh mục hoặc dữ liệu lớn. Bắt buộc dùng `CustomSelect` có ô tìm kiếm tích hợp, hỗ trợ đóng khi click ra ngoài hoặc nhấn `Escape`.

### 2.2. Kỷ luật Bảo mật & Phân quyền (RBAC)
* Quyền hạn đi liền tính năng. Mọi API Route và Server Action bắt buộc phải kiểm tra quyền (`requirePermission`) trước khi can thiệp vào cơ sở dữ liệu.
* Đồng bộ phân quyền lên giao diện: Kiểm tra quyền trước khi render nút bấm hoặc module tính năng. Nút hành động phải tự động ẩn hoặc vô hiệu hóa nếu tài khoản không đủ quyền, không để người dùng bấm vào rồi mới báo lỗi.

### 2.3. Kỷ luật Thẩm mỹ & Màu sắc (Vanilla CSS Tokens)
* **Nói KHÔNG với việc bịa mã màu HEX**: Tuyệt đối không tự ý viết các mã HEX ngẫu nhiên rải rác trong file.
* Toàn bộ mã màu phải lấy từ biến Design Tokens chuẩn tại `src/app/globals.css`.
* Không sử dụng Tailwind CSS, sử dụng Native Vanilla CSS module hoặc styled component classes kế thừa tokens.
* Hiệu ứng kính mờ (Glassmorphism) `backdrop-filter: blur(12px)` kết hợp background bán trong suốt cho Header và Modal.

### 2.4. Kỷ luật Quy trình phát triển
* Luôn tuân theo nguyên tắc Plan-first (Kế hoạch trước khi thực thi).
* Chuẩn hiển thị công thức bằng `->` thay vì ký hiệu toán khó đọc. Viết công thức bằng tiếng Việt rõ ràng kèm ví dụ số liệu thực tế.
* Quản lý tiến độ bằng checklist đầu việc trong `task.md`.

---

## 3. CÔNG NGHỆ CỐT LÕI (CORE TECH STACK)

| Thành phần | Công nghệ / Thư viện | Phiên bản | Mục đích & Ghi chú |
| :--- | :--- | :--- | :--- |
| **Framework** | **Next.js (App Router)** | `^15.2.0` | Server Components cho SEO Storefront, Client Components cho tương tác PMS |
| **Giao diện** | **React** | `^19.0.0` | React 19 Actions, Server Functions, Context API |
| **Ngôn ngữ** | **TypeScript** | `^5.7.3` | Strict mode type-safe 100% |
| **Database & ORM** | **Prisma ORM** | `^6.4.1` | PostgreSQL / SQLite, type-safe queries, CUID, Singleton pattern |
| **Styling** | **Vanilla CSS & Tokens** | Native CSS | Quản lý tập trung qua CSS Variables tại `globals.css` |
| **Typography** | **Google Fonts** | Hosted | `Plus Jakarta Sans` (nội dung chính) & `Playfair Display` (tiêu đề sang trọng) |
| **Iconography** | **Lucide React** | `^0.475.0` | Bộ icon SVG nhẹ, đồng bộ và trực quan |
| **State Global** | **React Context** | Built-in | `ToastContext`, `AuthContext` |
| **Xác thực** | **Crypto Session + RBAC** | Node Native | Session token HMAC SHA-256 qua Cookie `songngoc_session`, hash PBKDF2 |
| **Thanh toán** | **VietQR Napas247** | Napas247 | Sinh mã QR động theo chuẩn ngân hàng Việt Nam tự động |
| **Kiểm thử** | **Vitest** | `^3.0.7` | Test suite tự động cho tính tiền, QR, auth và kiểm tra phòng trống |

---

## 4. CẤU TRÚC THƯ MỤC CHUẨN (PROJECT STRUCTURE)

```text
songngoc/
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-10-08-hotel-management-design.md
├── prisma/
│   ├── schema.prisma              # Khai báo Models: Room, RoomType, Floor, Booking, Invoice, Service, User, Role
│   └── seed.ts                    # Dữ liệu khởi tạo (Tầng, Loại phòng, Phòng mẫu, Dịch vụ, Tài khoản Admin & Lễ tân)
├── src/
│   ├── app/
│   │   ├── (auth)/                # Xác thực nhân viên & lễ tân
│   │   │   └── login/             # Trang đăng nhập quản trị
│   │   ├── (public)/              # Giao diện Khách hàng (Storefront)
│   │   │   ├── page.tsx           # Trang chủ Khách sạn Sông Ngọc (Hero, Giới thiệu, Loại phòng)
│   │   │   ├── rooms/             # Danh sách loại phòng, bộ lọc tiện nghi, số người, khoảng giá
│   │   │   │   └── [slug]/        # Chi tiết loại phòng (Hình ảnh, tiện nghi, chính sách)
│   │   │   ├── booking/           # Form đặt phòng trực tuyến
│   │   │   │   └── confirmation/  # Xác nhận đặt phòng, mã booking & VietQR Napas247
│   │   │   └── track/             # Tra cứu đơn đặt phòng bằng SĐT hoặc Mã Booking
│   │   ├── admin/                 # Giao diện Lễ tân & Quản trị (Admin PMS)
│   │   │   ├── layout.tsx         # Admin Layout (AdminSidebar, AdminHeader, Auth Guard)
│   │   │   ├── page.tsx           # Dashboard tổng quan (Công suất phòng, doanh thu ngày, lượt check-in/out)
│   │   │   ├── rooms/             # 🌟 SƠ ĐỒ PHÒNG TRỰC QUAN (Grid tầng/phòng, màu sắc trạng thái)
│   │   │   ├── bookings/          # Danh sách đặt phòng (Table Pagination, Lọc trạng thái, Gán phòng)
│   │   │   ├── checkin/           # Nghiệp vụ Check-in khách nhanh tại quầy
│   │   │   ├── services/          # Quản lý danh mục dịch vụ (Minibar, giặt ủi, thuê xe)
│   │   │   ├── invoices/          # Lịch sử hóa đơn & in/xuất chi tiết thanh toán
│   │   │   ├── room-types/        # Cấu hình loại phòng, giá theo ngày thường / cuối tuần
│   │   │   └── users/             # Quản lý tài khoản nhân viên & Phân quyền Role (RBAC)
│   │   ├── api/                   # API Handlers (RESTful JSON nhất quán { success, data } / { success, error })
│   │   │   ├── auth/              # login, logout, me
│   │   │   ├── booking/           # API đặt phòng công khai, tra cứu booking
│   │   │   └── admin/             # API nội bộ được bảo vệ bởi middleware & check permission
│   │   │       ├── rooms/         # CRUD phòng, đổi trạng thái
│   │   │       ├── bookings/      # Xác nhận đơn, hủy đơn, xếp phòng
│   │   │       ├── invoices/      # Tạo hóa đơn, tính phụ thu, chốt thanh toán
│   │   │       └── reports/       # Báo cáo doanh thu & tỷ lệ lấp đầy
│   │   ├── globals.css            # Toàn bộ CSS Tokens, Reset, Micro-animations (Vanilla CSS, no Tailwind)
│   │   └── layout.tsx             # Root Layout (Fonts: Plus Jakarta Sans & Playfair Display, ToastProvider)
│   ├── components/
│   │   ├── ui/                    # UI Atoms: CustomSelect, Pagination, Toast, Modal, Badge, Button
│   │   ├── layout/                # PublicHeader, PublicFooter, AdminSidebar, AdminHeader
│   │   ├── pms/                   # PMS Core: RoomCard, FloorSection, QuickActionModal, RoomStatusBadge
│   │   ├── booking/               # DateRangePicker, RoomTypeCard, BookingSummary, VietQRDisplay
│   │   └── admin/                 # BookingTable, InvoiceDetailModal, ServiceSelector
│   ├── context/                   # ToastContext, AuthContext
│   └── lib/                       # Singletons & Helpers
│       ├── db.ts                  # Prisma Client Singleton
│       ├── auth.ts                # Session token (HMAC-SHA256, PBKDF2 hash, RBAC gate)
│       ├── vietqr.ts              # Generator URL VietQR Napas247 động
│       ├── pricing.ts             # Logic tính giá phòng: số đêm, phụ thu quá giờ, dịch vụ phát sinh
│       ├── constants.ts           # Trạng thái phòng, trạng thái booking, cấu hình ngân hàng VietQR
│       └── utils.ts               # Format tiền tệ VNĐ (ví dụ: `450.000₫`), format ngày giờ tiếng Việt
└── tests/                         # Vitest test suite (*.test.ts)
```

---

## 5. MÔ HÌNH DỮ LIỆU CHI TIẾT (PRISMA SCHEMA)

```prisma
datasource db {
  provider = "postgresql" // Hoặc sqlite khi chạy local
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ----------------------------------------------------
// 1. PHÂN QUYỀN & TÀI KHOẢN (RBAC & AUTH)
// ----------------------------------------------------
model Role {
  id          String   @id @default(cuid())
  code        String   @unique // ADMIN, RECEPTIONIST, HOUSEKEEPING, MANAGER
  name        String   // "Quản trị viên", "Lễ tân", "Buồng phòng"
  permissions String   // JSON string: '["*"]' hoặc '["rooms:view", "bookings:manage"]'
  description String?
  users       User[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model User {
  id          String    @id @default(cuid())
  username    String    @unique
  email       String?   @unique
  name        String
  password    String    // Lưu dạng "salt:hash" mã hóa PBKDF2
  phone       String?
  roleId      String
  role        Role      @relation(fields: [roleId], references: [id])
  isActive    Boolean   @default(true)
  invoices    Invoice[] // Hóa đơn do nhân viên này lập
  bookings    Booking[] // Đơn đặt phòng do lễ tân tạo tại quầy
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([roleId])
}

// ----------------------------------------------------
// 2. KHÔNG GIAN KHÁCH SẠN & PHÒNG (HOTEL PROPERTY)
// ----------------------------------------------------
model Floor {
  id          String   @id @default(cuid())
  name        String   // "Tầng 1", "Tầng 2", "Tầng 3", "Tầng Thượng"
  floorNumber Int      @unique // 1, 2, 3...
  rooms       Room[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model RoomType {
  id           String    @id @default(cuid())
  name         String    // "Phòng Đơn Tiêu Chuẩn", "Phòng Đôi Deluxe", "Phòng Gia Đình VIP"
  slug         String    @unique // standard-single, deluxe-double, vip-family
  basePrice    Int       // Giá ngày thường (VNĐ/đêm), ví dụ: 450000
  weekendPrice Int?      // Giá cuối tuần (VNĐ/đêm)
  hourlyPrice  Int?      // Giá nghỉ ngắn giờ (ví dụ: 150000 / 2 giờ đầu)
  maxAdults    Int       @default(2)
  maxChildren  Int       @default(1)
  bedType      String    // "1 Giường đôi King", "2 Giường đơn"
  roomArea     Float     // Diện tích (m2), ví dụ: 28.5
  amenities    String    // JSON string: '["wifi", "air_con", "tv_smart", "hot_water", "balcony"]'
  images       String    // JSON string mảng URL ảnh chất lượng cao
  description  String    @db.Text
  isActive     Boolean   @default(true)
  rooms        Room[]
  bookings     Booking[]
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Room {
  id         String    @id @default(cuid())
  roomNumber String    @unique // "101", "102", "201", "202"
  floorId    String
  floor      Floor     @relation(fields: [floorId], references: [id], onDelete: Cascade)
  roomTypeId String
  roomType   RoomType  @relation(fields: [roomTypeId], references: [id], onDelete: Restrict)
  
  // Trạng thái vận hành PMS:
  // AVAILABLE: Phòng trống sạch sẽ, sẵn sàng đón khách
  // OCCUPIED: Đang có khách ở
  // DIRTY: Khách vừa check-out, cần dọn dẹp
  // CLEANING: Nhân viên buồng phòng đang dọn
  // MAINTENANCE: Đang bảo trì/hỏng hóc
  status     String    @default("AVAILABLE") 
  note       String?   // Ghi chú phòng (vd: "Điều hòa hơi kêu", "Vừa thay chăn ga")
  bookings   Booking[]
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@index([floorId])
  @@index([roomTypeId])
  @@index([status])
}

// ----------------------------------------------------
// 3. KHÁCH HÀNG & ĐẶT PHÒNG (GUESTS & BOOKINGS)
// ----------------------------------------------------
model Guest {
  id        String    @id @default(cuid())
  fullName  String
  phone     String
  email     String?
  idCard    String?   // CCCD/Hộ chiếu (quản lý lưu trú khai báo)
  address   String?
  notes     String?   // Ghi chú sở thích khách (thích phòng yên tĩnh, tầng cao)
  bookings  Booking[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([phone])
}

model Booking {
  id              String           @id @default(cuid())
  bookingCode     String           @unique // Mã dễ nhớ: "BK-202610-1001"
  source          String           @default("ONLINE_WEB") // ONLINE_WEB, DIRECT_COUNTER, PHONE
  
  guestId         String
  guest           Guest            @relation(fields: [guestId], references: [id], onDelete: Cascade)
  
  roomTypeId      String
  roomType        RoomType         @relation(fields: [roomTypeId], references: [id], onDelete: Restrict)
  
  roomId          String?          // Nullable: khi đặt trên web chỉ giữ chỗ loại phòng; khi xếp phòng/check-in sẽ gán phòng cụ thể
  room            Room?            @relation(fields: [roomId], references: [id], onDelete: SetNull)
  
  checkIn         DateTime         // Ngày giờ nhận phòng dự kiến
  checkOut        DateTime         // Ngày giờ trả phòng dự kiến
  actualCheckIn   DateTime?        // Thời điểm thực tế khách nhận chìa khóa
  actualCheckOut  DateTime?        // Thời điểm thực tế khách bàn giao chìa khóa
  adults          Int              @default(1)
  children        Int              @default(0)
  
  // PENDING (Chờ duyệt) -> CONFIRMED (Đã xác nhận) -> CHECKED_IN (Đang ở) -> CHECKED_OUT (Đã trả phòng) -> CANCELLED (Đã hủy)
  status          String           @default("PENDING") 
  
  totalRoomAmount Int              // Dự tính tiền phòng ban đầu
  depositAmount   Int              @default(0) // Tiền cọc đã trả (nếu có)
  paymentStatus   String           @default("UNPAID") // UNPAID, PARTIALLY_PAID, PAID
  
  specialRequests String?          // Yêu cầu đặc biệt của khách
  createdById     String?          // Nhân viên tạo đơn (nếu tạo tại quầy)
  createdBy       User?            @relation(fields: [createdById], references: [id], onDelete: SetNull)
  
  services        BookingService[] // Dịch vụ phát sinh trong quá trình ở (minibar, nước ngọt, giặt là)
  invoice         Invoice?         // Hóa đơn thanh toán khi check-out
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@index([bookingCode])
  @@index([status])
  @@index([checkIn, checkOut])
  @@index([roomId])
  @@index([guestId])
}

// ----------------------------------------------------
// 4. DỊCH VỤ & HÓA ĐƠN (SERVICES & INVOICING)
// ----------------------------------------------------
model Service {
  id        String           @id @default(cuid())
  name      String           // "Nước suối Aquafina", "Bia Heineken", "Mì ly", "Giặt ủi đồ bộ", "Thuê xe máy ga"
  category  String           // "MINIBAR", "LAUNDRY", "FOOD", "TRANSPORT"
  price     Int              // Đơn giá (VNĐ)
  unit      String           // "chai", "lon", "bộ", "ngày"
  isActive  Boolean          @default(true)
  items     BookingService[]
  createdAt DateTime         @default(now())
  updatedAt DateTime         @updatedAt
}

model BookingService {
  id         String   @id @default(cuid())
  bookingId  String
  booking    Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  serviceId  String
  service    Service  @relation(fields: [serviceId], references: [id], onDelete: Restrict)
  quantity   Int      @default(1)
  unitPrice  Int      // Giá tại thời điểm phát sinh
  totalPrice Int      // quantity * unitPrice
  note       String?
  addedAt    DateTime @default(now())

  @@index([bookingId])
  @@index([serviceId])
}

model Invoice {
  id              String    @id @default(cuid())
  invoiceCode     String    @unique // Mã hóa đơn: "INV-202610-1001"
  bookingId       String    @unique
  booking         Booking   @relation(fields: [bookingId], references: [id], onDelete: Restrict)
  
  // Chi tiết tính toán minh bạch:
  roomCharge      Int       // Tổng tiền phòng thực tế
  serviceCharge   Int       // Tổng tiền dịch vụ phát sinh
  surcharge       Int       @default(0) // Phụ thu quá giờ hoặc hỏng hóc
  surchargeReason String?   // Lý do phụ thu
  discount        Int       @default(0) // Giảm giá / Khuyến mãi
  depositDeducted Int       @default(0) // Trừ tiền cọc đã thanh toán trước
  finalAmount     Int       // Thực thu còn lại tại quầy
  
  paymentMethod   String    // CASH (Tiền mặt), VIETQR (Chuyển khoản Napas247), CARD (Quẹt thẻ)
  paidAt          DateTime?
  createdById     String
  createdBy       User      @relation(fields: [createdById], references: [id], onDelete: Restrict)
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@index([invoiceCode])
  @@index([createdAt])
}
```

---

## 6. QUY TRÌNH NGHIỆP VỤ CHI TIẾT (BUSINESS FLOWS)

### 6.1. Giao diện Khách hàng & Luồng Đặt phòng (Storefront Booking Engine - Phương án A)
* **Định hướng giao diện đã phê duyệt: Phương án A (Boutique Luxury Hero & Floating Booking Bar)**:
  1. **Header**: Logo Sông Ngọc Hotel (font `Playfair Display`), Menu điều hướng (Trang chủ, Phòng nghỉ, Tiện ích, Tra cứu đơn), Hotline liên hệ nhanh.
  2. **Hero Banner**: Chiều cao 65vh, hình ảnh chất lượng cao kèm lớp phủ gradient `var(--color-primary)` sang trọng, slogan: *"Kỳ Nghỉ Thư Thái Bên Dòng Sông Ngọc"*.
  3. **Floating Booking Bar**: Thanh tìm kiếm đặt phòng nổi bật ghim giữa Hero và nội dung chính, bóng đổ `var(--shadow-lg)`:
     * Ô chọn khoảng ngày nhận/trả phòng (`DateRangePicker`).
     * Dropdown chọn số lượng người lớn và trẻ em (`CustomSelect`).
     * Nút bấm *"Tìm phòng trống"* màu `var(--color-primary)` với hiệu ứng hover.
  4. **Lưới phòng nổi bật (Featured Room Grid)**:
     * Card phòng 2-3 cột, bo góc `var(--radius-md)`, ảnh chất lượng cao.
     * Huy hiệu tag (Best Seller, View Sông, Ban công) sử dụng màu `var(--color-accent)`.
     * Hiển thị tiện ích cốt lõi (diện tích m², loại giường, ăn sáng, wifi).
     * Mức giá hiển thị nổi bật dạng `450.000₫/đêm` và nút *"Đặt phòng ngay"*.

* **Luồng Kiểm tra phòng trống & Đặt phòng**:
  1. **Kiểm tra phòng trống**:
     * Hệ thống tính số phòng khả dụng cho từng loại phòng:
       ```text
       Số phòng khả dụng = Tổng số phòng của loại phòng - Số đơn đã giữ chỗ/đang ở trong khoảng ngày chọn
       Ví dụ: Loại phòng Deluxe có 5 phòng (101, 102, 103, 104, 105).
       Trong khoảng ngày 10/10 -> 12/10 đã có 3 đơn CONFIRMED/CHECKED_IN.
       -> Số phòng khả dụng = 5 - 3 = 2 phòng.
       ```
  2. **Tạo Booking & Thanh toán**:
     * Khách điền Họ tên, SĐT, Email, Yêu cầu đặc biệt.
     * Chọn hình thức: Thanh toán tại quầy khi nhận phòng hoặc Chuyển khoản VietQR.
     * Sinh mã `BK-202610-1001`. Nếu chọn cọc chuyển khoản, màn hình hiển thị mã VietQR động:
       `https://img.vietqr.io/image/{bankId}-{accountNo}-compact2.png?amount={deposit}&addInfo={bookingCode}&accountName={accountName}`.
     * Khách lưu mã để tra cứu tại trang `/track`.

### 6.2. Luồng Sơ đồ phòng trực quan (Visual Grid PMS)
* Màn hình `/admin/rooms` chia danh sách phòng theo từng `Floor` (Tầng 1, Tầng 2, Tầng 3).
* Mỗi thẻ phòng (`RoomCard`) hiển thị:
  * Số phòng (101, 102, ...)
  * Hạng phòng (Đơn, Đôi, VIP)
  * Trạng thái và màu sắc tương ứng:
    * `AVAILABLE` (Xanh lá): Phòng trống sạch sẽ -> Bấm vào để Check-in nhanh hoặc Gán đơn đặt trước.
    * `OCCUPIED` (Đỏ cam): Đang có khách -> Hiển thị tên khách và ngày check-out -> Bấm vào để thêm Dịch vụ hoặc Check-out.
    * `DIRTY` (Vàng hổ phách): Chờ dọn dẹp -> Bấm để chuyển sang `CLEANING`.
    * `CLEANING` (Xanh dương): Đang dọn -> Bấm "Hoàn tất dọn" để chuyển về `AVAILABLE`.
    * `MAINTENANCE` (Xám): Đang sửa chữa, khóa không cho xếp phòng.

### 6.3. Luồng Check-in, Thêm dịch vụ và Check-out Tính tiền
1. **Check-in**:
   * Khách có mã đặt trước: Lễ tân tìm mã `BK-...`, chọn số phòng trống thích hợp từ dropdown `CustomSelect` -> Bấm xác nhận nhận phòng.
   * Khách vãng lai: Bấm trực tiếp vào thẻ phòng `AVAILABLE`, nhập thông tin khách -> Bấm nhận phòng ngay.
   * Phòng chuyển sang `OCCUPIED`.
2. **Thêm dịch vụ phòng**:
   * Mở modal dịch vụ tại thẻ phòng đang có khách.
   * Chọn món (Nước suối, bia, giặt ủi) bằng `CustomSelect`, nhập số lượng -> Lưu vào `BookingService`.
3. **Check-out và Lập hóa đơn**:
   * Công thức tính tiền tại quầy:
     ```text
     Tổng thanh toán = Tiền phòng thực tế + Tiền dịch vụ phát sinh + Phụ thu quá giờ/hỏng hóc - Giảm giá - Tiền cọc đã trả
     ```
   * **Ví dụ thực tế**:
     ```text
     Tiền phòng (2 đêm x 450.000₫):   900.000₫
     + Dịch vụ (2 Nước suối + 1 Mì):    45.000₫
     + Phụ thu (Trả muộn 1 tiếng):     50.000₫
     - Giảm giá voucher:                    0₫
     - Tiền cọc trước đó:             200.000₫
     --------------------------------------------------
     = Thực thu còn lại tại quầy:     795.000₫
     ```
   * Lễ tân chọn:
     * Tiền mặt: Thu tiền và in hóa đơn.
     * VietQR: Sinh mã QR hiển thị ngay trên màn hình thu ngân với số tiền `795.000₫` và nội dung `INV-202610-1001`.
   * Chốt hóa đơn: Booking chuyển sang `CHECKED_OUT`, Phòng tự động đổi sang `DIRTY`.

---

## 7. DESIGN TOKENS & THẨM MỸ (VANILLA CSS)

Toàn bộ CSS Variables tập trung tại `src/app/globals.css`:
* **Brand Primary**: `--color-primary: #0f5b66;`, `--color-primary-hover: #0a434b;`, `--color-primary-light: #eaf4f6;`
* **Brand Accent**: `--color-accent: #c49a45;`, `--color-accent-hover: #b08736;`
* **Surfaces**: `--color-bg: #faf8f5;`, `--color-surface: #ffffff;`, `--color-border: #ede7df;`
* **Room Status**:
  * `--color-room-available: #10b981;`
  * `--color-room-occupied: #ef4444;`
  * `--color-room-dirty: #f59e0b;`
  * `--color-room-cleaning: #3b82f6;`
  * `--color-room-maintenance: #6b7280;`
* **Fonts**: `Plus Jakarta Sans` (chính) & `Playfair Display` (tiêu đề).

---

## 8. XÁC THỰC & PHÂN QUYỀN RBAC (AUTH SPEC)

* Token Session HMAC SHA-256 lưu trong Cookie `songngoc_session`.
* Mật khẩu hash PBKDF2 với Dynamic Salt 16 bytes: `crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512')`.
* Vai trò và Quyền hạn:
  * `ADMIN`: `["*"]`
  * `RECEPTIONIST`: `["rooms:view", "rooms:status", "bookings:*", "invoices:*", "services:*"]`
  * `HOUSEKEEPING`: `["rooms:view", "rooms:clean"]`
* Kiểm tra quyền:
  * Backend: Middleware & helper `requirePermission(user, permission)`.
  * Frontend: Helper `hasPermission(currentUser, permission)` ẩn các nút chức năng vượt quá thẩm quyền.

---

## 9. CHIẾN LƯỢC KIỂM THỬ (TESTING WITH VITEST)

Thư mục `tests/*.test.ts`:
1. `tests/pricing.test.ts`: Kiểm thử công thức tính tiền phòng, phụ thu quá giờ, dịch vụ minibar và trừ cọc.
2. `tests/vietqr.test.ts`: Kiểm thử cú pháp sinh URL VietQR Napas247 chính xác với ngân hàng, số tiền và nội dung.
3. `tests/auth-rbac.test.ts`: Kiểm thử mã hóa PBKDF2, tạo/giải mã token session HMAC SHA-256 và logic phân quyền RBAC.
4. `tests/room-availability.test.ts`: Kiểm thử thuật toán tìm kiếm phòng trống theo khoảng thời gian giao thoa.
