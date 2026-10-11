# 🌟 BỘ QUY CHUẨN KỸ THUẬT & CÔNG NGHỆ DỰ ÁN (PROJECT RULES & ARCHITECTURE BLUEPRINT)

> **Mục đích**: Tài liệu này đóng gói toàn bộ kiến trúc, công nghệ và **bộ nguyên tắc kỹ thuật cốt lõi (Core Engineering Mindset)** được kế thừa từ tiêu chuẩn Enterprise cao cấp.  
> Chuẩn hóa 100% cho hệ sinh thái **Next.js 15 Fullstack (App Router) + React 19 + TypeScript + Neon Serverless PostgreSQL + Prisma ORM + Vanilla CSS Design System**.  
> Sử dụng làm kim chỉ nam (`PROJECT_RULES.md`, `AGENTS.md` hoặc `.cursorrules`) khi khởi tạo hoặc chuyển giao bất kỳ dự án mới nào để làm **CORE ARCHITECTURE**.

---

## 🧠 PHẦN I: CÁC NGUYÊN TẮC VÀNG & TƯ DUY CỐT LÕI (CORE ENGINEERING MINDSET)

Đây là những tư duy bất biến bắt buộc phải tuân thủ trong mọi quyết định kiến trúc và từng dòng mã nguồn:

### 1. Tư duy Dữ liệu lớn (10.000+ Records Mindset)
* **Bắt buộc tự vấn trước khi query**: *"Nếu bảng này tăng lên 10.000 - 100.000 bản ghi, câu lệnh này có làm sập RAM Serverless Function hay đơ trình duyệt của người dùng không?"*.
* **Tuyệt đối cấm**:
  - Không truy vấn dữ liệu thả phanh (`findMany()` không có `take` và `skip`).
  - Không kéo toàn bộ dữ liệu bảng về RAM Node.js hoặc mảng JavaScript ở Client để lọc (`filter`), đếm (`length`), hoặc tính tổng (`reduce`).
* **Bắt buộc tính toán trực tiếp tại CSDL (Database Aggregations)**:
  - Dùng `prisma.model.count({ where })` để lấy tổng số bản ghi.
  - Dùng `prisma.model.aggregate({ _sum: { ... }, where })` để tính tổng tiền, doanh thu.
  - Dùng `prisma.model.groupBy({ by: ['...'], _sum: { ... }, orderBy: { ... }, take: 5 })` khi làm báo cáo Top/Thống kê.
* **Bắt buộc Phân trang & Lọc từ Server**:
  - Mọi danh sách hiển thị đều phải có phân trang từ Server (Server-side Pagination qua URL search params: `?page=1&limit=15`).
  - Mọi trường tìm kiếm danh mục có từ 50 bản ghi trở lên **bắt buộc dùng dropdown tìm kiếm động (Ajax/Server Action Dynamic Search)**. Cấm render toàn bộ hàng trăm thẻ `<option>` thô vào HTML làm nghẽn DOM.

### 2. Tư duy Trải nghiệm tức thì 0ms & Non-Blocking UI
* **Chống Double Submit / Spam Click**:
  - Nút hành động (Thanh toán, Đặt hàng, Thêm giỏ hàng, Lưu, Xóa...) **bắt buộc phải vô hiệu hóa (`disabled`) và hiển thị biểu tượng loading ngay lập tức** trong lúc thao tác đang diễn ra (`isPending` hoặc `isSubmitting`).
  - Thêm chốt chặn logic: nếu đang gửi request thì `return` ngay lập tức, ngăn người dùng click liên tục làm cạn kiệt connection pool hoặc tạo bản ghi trùng lặp.
* **Phân biệt rạch ròi 4 trạng thái giao diện (4 UI States)**:
  1. `initial loading`: Tải trang lần đầu (**Bắt buộc dùng Skeleton Shimmer tùy biến theo từng trang - Tailored Route-level Skeleton**).
     - **Nguyên tắc "Mỗi trang một Skeleton riêng biệt"**: Tuyệt đối không dùng 1 khung skeleton chung cho toàn bộ website (không để skeleton của trang chủ đè lên trang chi tiết, danh mục, checkout hay admin). Mỗi trang con (`/products`, `/products/[id]`, `/account`, `/admin`, `/checkout`, `/orders/[id]`, `/quiz`) bắt buộc có file `loading.tsx` với tỷ lệ kích thước và wireframe khớp 100% với layout thực tế của trang đó.
     - **Triệt tiêu hoàn toàn Cumulative Layout Shift (CLS = 0)**: Khung xương shimmer giữ đúng vị trí, khi dữ liệu nạp xong giao diện không bị giật, nhảy khung hình hay lệch bố cục.
     - **Cấm dùng text loader thô**: Tuyệt đối không dùng các dòng chữ trần như *"Đang tải..."*, *"Vui lòng chờ..."* hoặc một spinner xoay đơn độc giữa trang trống.
  2. `refreshing`: Làm mới dữ liệu nền qua Server Actions / Router Refresh (không khóa màn hình hay chặn thao tác của user).
  3. `mutation pending`: Đang xử lý sau click (chỉ xoay loading tại chính nút bấm đó).
  4. `empty`: Không có dữ liệu (bắt buộc render Empty State component chuyên nghiệp kèm nút kêu gọi hành động, không để khoảng trống vô nghĩa).
* **Chống Flash màn hình bảo vệ (Zero Flash of Unauthenticated Content - FOUC)**:
  - Mọi route nhạy cảm hoặc yêu cầu đăng nhập/phân quyền (như `/admin`, `/account`) **bắt buộc phải được chặn và kiểm tra ngay từ Edge Middleware (`src/middleware.ts`)** trước khi Next.js render hoặc trả về giao diện.
  - Tuyệt đối không để xảy ra lỗi: Người dùng chưa đăng nhập bấm vào `/admin` bị nhìn thấy giao diện quản trị trong 1-2 giây rồi mới bị giật màn hình chuyển về `/admin/login`.
* **Phản hồi tức thì (Optimistic UI với React 19)**:
  - Với các tương tác toggle (Like, Yêu thích, Toggle trạng thái, Check hoàn thành...): Áp dụng `useOptimistic` để đổi giao diện trong 0ms, sau đó mới đồng bộ ngầm xuống DB. Nếu lỗi, tự động rollback.
* **Non-Blocking UI với `useTransition`**:
  - Bọc các thao tác chuyển tab, filter danh mục hoặc gọi action nặng vào `startTransition` để không chặn luồng vẽ giao diện (main thread) của trình duyệt.
* **Chống Race Condition & Debounce Tìm kiếm**:
  - Ô tìm kiếm gõ phím bắt buộc gắn `debounce` từ **300ms - 500ms** để gom request, triệt tiêu tình trạng request cũ chậm trả về ghi đè request mới.
* **Tải trước dữ liệu (Prefetching)**:
  - Sử dụng `<Link href="..." prefetch={true}>` cho các liên kết quan trọng.
  - Sử dụng sự kiện `onMouseEnter` (hover) để prefetch trước dữ liệu chi tiết modal/trang đích trong khoảng 200ms trước khi người dùng nhấn chuột.

### 3. Kỷ luật Toàn vẹn Dữ liệu & Concurrency (Data Integrity & Transactions)
* **Bắt buộc dùng Database Transactions (`prisma.$transaction`)**:
  - Khi một luồng nghiệp vụ thay đổi từ 2 bảng trở lên (ví dụ: Tạo đơn hàng + Trừ số lượng tồn kho + Cập nhật lượt mua Flash Sale + Lưu lịch sử), **bắt buộc bọc trong transaction**.
  - Nếu bất kỳ bước nào thất bại, toàn bộ thao tác phải tự động rollback 100%, không để sót dữ liệu rác.
* **Triệt tiêu N+1 Query**:
  - Tuyệt đối cấm đặt lệnh query database bên trong vòng lặp `for`/`forEach`/`map`.
  - Bắt buộc gom danh sách ID và query 1 lần duy nhất bằng toán tử `in`:
    ```typescript
    const items = await prisma.product.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, price: true, stock: true },
    });
    const itemMap = new Map(items.map(item => [item.id, item]));
    ```

### 4. Kỷ luật Bảo mật & Phân quyền (Security & Strict RBAC)
* **Quyền hạn đi liền tính năng**: Mọi tính năng, API Route, Server Action bắt buộc phải có bước xác thực danh tính và phân quyền.
* **Kiểm tra quyền trước khi can thiệp DB (Backend-first)**:
  - Tuyệt đối không tin tưởng `userId` hay `role` được truyền từ client trong body/params.
  - Luôn lấy danh tính từ Cookie Session / JWT đã được verify chữ ký số bí mật (`process.env.SESSION_SECRET`).
* **Đồng bộ phân quyền lên UI**:
  - Kiểm tra quyền trước khi render nút bấm. Nút hành động nhạy cảm (Sửa, Xóa, Export, Cấu hình) phải tự động ẩn hoặc disabled nếu người dùng không đủ quyền. Không để người dùng bấm vào rồi mới báo lỗi `403 Forbidden`.

### 5. Kỷ luật Thẩm mỹ & Giao diện (Strict Taste & Design Discipline)
* **Nói KHÔNG với việc bịa mã màu HEX tùy tiện**:
  - Tuyệt đối không tự ý viết các mã màu HEX rải rác trong component.
  - 100% màu sắc, bo góc, bóng đổ phải lấy từ Design Tokens chuẩn tại `globals.css` (ví dụ: `var(--color-primary)`).
* **Component-based & Micro-animations**:
  - Chia nhỏ component rõ ràng, dễ tái sử dụng.
  - Micro-animation tinh tế (0.2s - 0.3s `cubic-bezier(0.16, 1, 0.3, 1)`), hỗ trợ hover nâng nhẹ thẻ card (`translateY(-2px)`).
* **Nói KHÔNG với Placeholder tạm bợ & Ảnh vỡ (System-Wide Image Resiliency)**:
  - Luôn dùng dữ liệu demo thực tế, hình ảnh chuẩn sắc nét, câu chữ thương mại chỉnh chu.
  - **Quy chuẩn Fallback Ảnh Mặc Định Toàn Hệ Thống**: 100% component hiển thị hình ảnh (`ProductCard`, `ProductDetail`, `Wishlist`, `CartDrawer`, `OrderItem`, `AdminTable`) bắt buộc phải có ảnh mặc định dự phòng (`/images/placeholder-product.svg`).
  - **Tuyệt đối cấm để vỡ ảnh (Broken Images)**: Khi URL ảnh từ database bị 404, lỗi kết nối mạng hoặc không tồn tại, Client Component bắt buộc phải bắt sự kiện `onError` để fallback sang ảnh mặc định ngay lập tức, không để lại icon vỡ ảnh của trình duyệt hay khung trắng làm mất thẩm mỹ.

### 6. Kỷ luật Quy trình phát triển (AI Workflow & Engineering Constraints)
* **Plan-first (Lên kế hoạch trước khi code)**: Luôn trình bày kế hoạch chi tiết (Schema -> Backend Action -> UI States -> Verification) để thống nhất trước khi code.
* **Bảo toàn mã nguồn cũ**: Tuyệt đối **KHÔNG** tự ý xóa hay sửa các hàm cũ ngoài phạm vi yêu cầu khi chưa có sự xác nhận.
* **Tối đa hóa tái sử dụng**: Ưu tiên tái sử dụng helper, utility, UI component có sẵn trong `@/lib` và `@/components/ui`.
* **Nói KHÔNG với suy đoán lý thuyết**: Phải kiểm tra file thực tế, schema thực tế, chạy build test xác minh trước khi báo hoàn thành.
* **Chuẩn hiển thị công thức & Ký hiệu**:
  - Dùng `->` thay vì ký hiệu toán học khó đọc.
  - Viết công thức bằng tiếng Việt rõ ràng, dạng khung code block kèm ví dụ số liệu thực tế:
    ```text
    Tổng thanh toán = Tạm tính - Giảm giá voucher + Phí vận chuyển
    Ví dụ: 500.000₫ - 50.000₫ (Voucher 10%) + 0₫ (Freeship) = 450.000₫
    ```
* **Không tự ý chụp ảnh màn hình**: Yêu cầu hỗ trợ bằng text nếu cần kiểm tra UI. Quản lý tiến độ trong file `task.md`.

### 7. Kỷ luật Dọn dẹp Mã nguồn & Chống Dead Code (Code Hygiene & Zero Unused Elements)
* **Tuyệt đối cấm Dead Code & Biến/Hàm Thừa**:
  - Không để lại bất kỳ biến cục bộ, hàm, kiểu dữ liệu (`type`/`interface`), hoặc `import` thư viện nào được khai báo mà không sử dụng.
  - Bắt buộc kích hoạt cờ `"noUnusedLocals": true` và `"noUnusedParameters": true` trong `tsconfig.json`.
  - **Tuyệt đối CẤM dùng tiền tố "_" để lấp liếm biến/tham số không dùng**: Nghiêm cấm đặt tên `_request`, `_event`, `_index`, `_res`, hay tham số callback giả `(_, i)` để lách qua trình biên dịch hoặc pipeline. Nếu tham số/biến không dùng, **bắt buộc phải xóa bỏ hoàn toàn**; nếu là tham số cần thiết, **bắt buộc phải sử dụng thực tế** vào logic nghiệp vụ (phân trang, lọc, validation...).
  - Xóa triệt để các import thừa và biến rác ngay khi refactor hoặc đổi logic code.
* **Cấm Debugger & Console Log Rác (Zero Debug Logs in Production)**:
  - Cấm tuyệt đối lệnh `debugger;` trong toàn bộ codebase.
  - Cấm rải các lệnh `console.log()` debug tùy tiện trong thư mục `src/`. Chỉ cho phép `console.error()` và `console.warn()` trong các khối `try...catch` để ghi nhận lỗi ngoại lệ hoặc giám sát telemetry.
* **Cấm Hàm Rỗng Không Mục Đích (No Empty Functions)**:
  - Tránh khai báo các hàm rỗng `() => {}` làm logic giả hoặc placeholder chưa hoàn thiện. Nếu là noop callback có chủ đích, bắt buộc phải có comment giải thích rõ ràng.
* **Tự động hóa qua Pre-push Verification**:
  - Bộ kiểm tra `scripts/verify-code-rules.ts` kết hợp với `npx tsc --noEmit` được tự động chạy trước mỗi lệnh `git push` qua Git Hook để đảm bảo 100% không có dead code lọt vào repository.

### 8. Kỷ luật Admin Dashboard dạng SPA nhiều Tab (Tab State, Data Reuse & No Duplicate Fetch)

> **Đúc kết từ thực tế**: Admin dạng 1 trang nhiều tab (`/admin`) rất dễ mắc 4 lỗi: F5 mất tab, mỗi lần bấm menu lại gọi API, gọi API 2 lần cho cùng 1 dữ liệu, dropdown trong bảng bị cắt.

* **Tab phải đồng bộ lên URL (F5 không được mất tab)**:
  - `activeTab` không được chỉ nằm trong `useState`. Khi đổi tab, ghi `?tab=<id>` lên URL bằng `window.history.replaceState` (không reload, không thêm history entry), đồng thời lưu `localStorage`.
  - Khi mount, đọc lại `?tab=` (ưu tiên) rồi đến `localStorage`, và **phải validate** giá trị nằm trong danh sách tab hợp lệ trước khi dùng.
  - Mọi nơi chuyển tab (sidebar, nút "Xem tất cả" ở Dashboard...) đều phải gọi **cùng một hàm** `handleSelectTab`, không gọi trực tiếp `setActiveTab`.
* **Lazy-Mount + Keep-Alive để chuyển tab 0ms**:
  - Chỉ mount tab lần đầu khi người dùng mở (`visitedTabs[tab] && ...`), sau đó ẩn/hiện bằng `display: none/block`. Không unmount để giữ scroll, filter, trang đang xem, form nhập dở.
  - Giữ nguyên chuỗi `activeTab === '<id>'` trong JSX để các contract test vẫn qua.
* **Một dữ liệu – một lần gọi API (Parent tải, Child tái sử dụng)**:
  - Parent đã gọi API để đếm badge sidebar thì **phải giữ lại dữ liệu và truyền xuống Child** qua props (`initialX`), không được chỉ lấy `.length` rồi bỏ.
  - Child nhận `initialX !== undefined` thì hiển thị ngay và **bỏ qua fetch**; chỉ fetch khi `initialX === undefined`.
  - **Phân biệt rạch ròi "chưa tải" (`undefined`) với "đã tải nhưng rỗng" (`[]`)**. TUYỆT ĐỐI cấm kiểm tra `initialX.length > 0` để quyết định có fetch hay không, vì bảng rỗng hợp lệ (VD: Flash Sale = 0) sẽ bị gọi API lại mỗi lần mở tab. State cache ở Parent khởi tạo là `undefined`, không phải `[]`.
  - Child đồng bộ từ props mỗi khi props đổi (sau CRUD / nút Làm mới), **không dùng cờ `hasInitialized`** vì sẽ kích hoạt fetch lại khi props cập nhật. Chỉ fetch thật sự khi đổi filter/tìm kiếm/phân trang (điều kiện cần dữ liệu mới theo tham số).
  - Sau mỗi mutation (thêm/sửa/xóa) Child gọi `onRefreshCounts?.()` để Parent đồng bộ lại badge + cache.
* **Dữ liệu luôn mới nhất khi cần (SWR thủ công)**: Header admin luôn có nút **"Làm mới"** (`isRefreshing`, disabled khi đang chạy) đồng bộ lại toàn bộ master data + đơn hàng bằng 1 click, không cần F5.
* **Badge đồng nhất**: Mọi mục menu có dữ liệu dạng danh sách đều phải có badge đếm; không để mục thì có mục thì không.
* **Tắt prefetch thừa**: `<Link>` tới route nặng hoặc route đã nằm trong SPA (logo `/admin` trong sidebar) đặt `prefetch={false}` để tránh request `?_rsc=` không cần thiết.
* **Kiểm tra bằng DevTools trước khi báo xong**: F5 -> mở Network (Fetch/XHR) -> bấm qua từng tab. Phải đạt: mỗi endpoint chỉ xuất hiện **1 lần sau F5**, bấm menu **0 request mới**.

### 9. Kỷ luật UI Overlay (Dropdown / Popover / Tooltip trong Bảng & Modal)
* **Overlay KHÔNG được dùng `position: absolute` bên trong container có `overflow`** (bảng cuộn ngang, card `overflow: hidden`, modal cuộn) vì sẽ bị cắt mất phần tràn.
* **Chuẩn bắt buộc**: render menu qua **React Portal ra `document.body`** (`createPortal`), định vị `position: fixed` theo `getBoundingClientRect()` của nút kích hoạt.
  - Tự lật lên trên (`openUp`) khi không đủ chỗ phía dưới viewport; kẹp `left` trong màn hình.
  - Tính lại vị trí khi `scroll` (capture `true`) và `resize`; bỏ qua scroll xảy ra bên trong chính menu.
  - "Click ra ngoài để đóng" phải kiểm tra **cả trigger lẫn menu portal** (menu không còn nằm trong DOM của trigger).
  - `z-index` của overlay phải **cao hơn mọi modal/toast** của dự án (VD modal tối đa 9999 -> overlay 10000) để dropdown trong form modal vẫn hiển thị.
* Sửa **một lần tại component dùng chung** (`CustomSelect`), không vá từng màn hình.

### 10. Kỷ luật Test & Pre-push Ổn định (No Flaky Cleanup)
* Test chạy song song (Vitest) cùng dùng chung 1 DB có thể xoá đè nhau. Bước **dọn dẹp test data bắt buộc dùng `deleteMany({ where })`** (idempotent, không ném lỗi khi bản ghi đã bị xoá), không dùng `delete({ where: { id } })`.
* Pre-push hook chạy đủ: rules -> types -> test -> build. Test fail là push bị hủy; không được bypass bằng `--no-verify`, phải sửa nguyên nhân rồi push lại.
* Trên Windows PowerShell cũ không hỗ trợ `&&`; nối lệnh git bằng `;`.

### 11. Pipeline Chất lượng 3 Lớp (Local Hook -> GitHub CI -> Vercel Deploy)

> **Đúc kết từ thực tế**: Quy tắc chỉ nằm trong tài liệu thì sẽ bị quên. Phải biến thành cổng kiểm tra tự động ngay từ ngày đầu dự án.

```text
[Lớp 1: Git pre-push hook (máy dev)]  -> rules -> types -> test -> build. Fail = không push được.
[Lớp 2: GitHub Actions (ci.yml)]       -> chạy lại đúng 4 bước trên ubuntu, bắt lỗi khi hook bị bỏ qua.
[Lớp 3: Vercel (auto deploy main)]     -> build production. Chỉ push main khi lớp 1 và 2 đã xanh.
```

* **Lớp 1 – Hook**: `scripts/setup-hooks.ts` ghi `.git/hooks/pre-push` (chạy qua `npm run prepare:hooks` / `postinstall`) để mọi thành viên đều có hook. Script `npm run verify` = `check:rules` + `check:types` + `npm test`; `npm run pre-push` = `verify` + `build`.
* **Lớp 2 – CI**: `.github/workflows/ci.yml` chạy trên `push` và `pull_request` vào `main`/`develop`: `npm ci` -> `npx prisma generate` -> 4 gateway (rules, types, test, build). Đặt tên step theo dạng `[Gateway n/4]` để nhìn log biết ngay bước nào đỏ.
* **Vercel không phụ thuộc CI**: push `main` là tự deploy, kể cả khi CI đỏ. Vì vậy quy trình bắt buộc: làm trên `develop` -> hook xanh -> CI xanh -> merge vào `main`.
* **`scripts/verify-code-rules.ts` là nơi biến rule thành code**: kiểm tra `debugger`, `console.log` trong `src/`, tiền tố `_` giả lập biến không dùng, hàm rỗng... Mỗi rule mới được thống nhất phải thêm vào script này và có test song hành (`tests/code-rules-pipeline.test.ts`).
* **Bật `noUnusedLocals` + `noUnusedParameters`** ngay từ đầu. Bật muộn sẽ phải sửa hàng chục file cùng lúc (thực tế phải dọn 35 file trong 1 commit).
* **Không chạy `npm run dev` khi đang build/push**: dev server giữ file Prisma query engine, bước `prisma generate` trong build báo `EPERM: operation not permitted, rename ...query_engine-windows.dll.node`. Tắt dev server rồi push lại.
* **Không bao giờ `--no-verify`**. Hook đỏ là tín hiệu, phải sửa nguyên nhân.

### 12. Kỷ luật Xác thực Session Cookie trong API & Server Component
* Helper lấy user từ cookie (`getCurrentUserFromCookie`) phải hỗ trợ **2 nguồn**: header `Cookie` của `Request` (API route) và `cookies()` của `next/headers` (Server Component, Server Action) khi không truyền header. Chỉ hỗ trợ 1 nguồn sẽ gây lỗi 401 giả ở wishlist/account dù đã đăng nhập.
* `cookies()` của Next 15 là **async**: phải `await`, và bọc `try/catch` vì ngoài request scope sẽ ném lỗi.
* Client phải **chờ `authLoading` xong** rồi mới quyết định "chưa đăng nhập" (`if (authLoading) return;`), tránh báo "Vui lòng đăng nhập" trong lúc session đang tải.
* Khi API trả `401`, hiển thị thông báo riêng "Phiên đăng nhập đã hết hạn", không dùng chung thông báo lỗi chung.
* **Chặn truy cập ở tầng Edge Middleware** cho `/admin`, `/account` (redirect trước khi render) kết hợp guard phía client; chỉ guard client sẽ bị nháy giao diện admin trước khi chuyển về login.
* Test API xác thực phải đi qua đường cookie thật (không chỉ truyền user giả) để bắt được lỗi này.

### 13. Lỗi chỉ lộ trên Vercel (Build Production nghiêm hơn Dev)
* Mảng khởi tạo rỗng (`const items = []`) rồi `push` có thể bị suy ra `any[]`/`never[]` và **chỉ vỡ khi build production**. Luôn khai báo kiểu tường minh (`const items: { productId: string; ... }[] = []`).
* Trường tùy chọn đưa vào Prisma phải chuẩn hóa giá trị mặc định (`image: item.image || ''`) cho khớp kiểu cột bắt buộc.
* Quy tắc vàng: **luôn chạy `npm run build` cục bộ trước khi merge `main`**, không chỉ `npm run dev`. Hook pre-push đã tự làm việc này.

### 14. Kỷ luật Hiệu năng API (Aggregate tại DB, Batch, Transaction)
* **Dashboard/thống kê KHÔNG được `findMany()` cả bảng rồi `reduce/filter` trong RAM.** Dùng `prisma.<model>.aggregate` (`_sum`, `_count`), `count({ where })`, `groupBy`, và danh sách gần đây chỉ `take: 5`. Bản cũ tải toàn bộ `order` + `orderItem` -> chậm tuyến tính theo dữ liệu.
* Gom các truy vấn độc lập vào **một `Promise.all`** thay vì `await` tuần tự.
* **Chống N+1**: không `findUnique` trong vòng `for`. Gom id (`Array.from(new Set(ids))`), gọi 1 lần `findMany({ where: { id: { in: ids } } })`, rồi tra bằng `Map`.
* Luồng tạo đơn: giá luôn lấy từ DB (không tin giá client), và gói **tạo đơn + cập nhật `soldQuantity` Flash Sale trong cùng `prisma.$transaction`** để không bị lệch số liệu khi một bước lỗi.
* **Tuyệt đối không bịa số liệu hiển thị** (VD doanh thu danh mục = `số sản phẩm * 320000`, biểu đồ 7 ngày nhân hệ số cố định). Số giả chỉ được phép khi gắn nhãn rõ "dữ liệu mẫu"; còn lại phải tính thật từ DB (`groupBy` trên `orderItem`).
* Mọi tối ưu hiệu năng phải có test song hành (`admin-dashboard-aggregation`, `order-performance-batch`) để không bị hồi quy.

### 15. Bảo vệ Route Admin: Middleware Edge là hàng rào UX, không phải bảo mật
* Edge runtime không có `crypto` của Node nên middleware chỉ **giải mã payload (`atob`) để kiểm tra có cookie, chưa hết hạn, đúng role** rồi redirect sớm. Nó **không xác minh chữ ký** token.
* Vì vậy **quyền thật luôn phải kiểm tra lại ở từng API** bằng `getCurrentUserFromCookie` + role. Không coi middleware là lớp bảo mật duy nhất.
* Redirect kèm `?redirect=<đường dẫn cũ>` để login xong quay lại đúng trang; user đã đăng nhập mà vào `/admin/login` thì redirect về `/admin`; `matcher` chỉ `['/admin/:path*']`.
* Phía client dùng `router.replace` (không `push`, tránh nút Back quay lại trang vừa bị chặn) và **trả về màn hình "Đang kiểm tra quyền truy cập..." khi `authLoading || !user || sai role`** để không nháy nội dung quản trị.

### 16. Chuẩn hóa UI Admin theo Component Mẫu (Golden Reference)
* Chọn **một màn hình làm chuẩn** (ở đây `ProductListTable`) cho layout: thanh tìm kiếm + bộ lọc, bảng, phân trang, badge trạng thái, modal. Mọi Manager mới/sửa (Flash Sale, Review, Banner, User...) phải **giống chuẩn đó**; lệch format là lỗi cần sửa ngay, không để mỗi tab một kiểu.
* Quy tắc dọn UI: một hành động chỉ xuất hiện **một chỗ** (VD bỏ nút Đăng xuất trùng ở banner hồ sơ, giữ nút ở vị trí chuẩn); chỉ hiện nút theo role (nút "Trang Quản Trị" chỉ cho `ADMIN`/`STAFF`).
* Khi sửa UI hàng loạt, vẫn giữ nguyên chuỗi/ID mà contract test đang kiểm tra, rồi chạy lại `npm test`.

### 17. Kỷ luật Hiệu năng Storefront (RSC, Cache, Live Search)
* **Trang Server Component chỉ `select` đúng cột card cần** (id, name, price, images...), không lấy `description`, `ingredients`, `usage` dài. Dùng chung 1 object `productCardSelect` cho mọi danh sách.
* Nhiều query độc lập trong 1 trang (best seller + hàng mới) gom vào `Promise.all`, không `await` nối đuôi.
* **Cùng 1 dữ liệu dùng ở `generateMetadata` và `Page` -> bọc bằng `React.cache`** (`src/lib/cached-queries.ts`) để mỗi request chỉ query DB 1 lần.
* **Live Search phải debounce (400ms)** rồi mới `router.replace(..., { scroll: false })`; phải `clearTimeout` ở cleanup và bỏ qua khi `query === initialValue` để không bắn request thừa lúc mount. Dùng `replace`, không `push`, để không làm đầy lịch sử trình duyệt.
* **`Cache-Control` đặt theo độ "tươi" cần thiết của từng endpoint**, không dùng 1 số cho tất cả: endpoint có đếm ngược/suất bán (Flash Sale active) dùng `s-maxage=10, stale-while-revalidate=59` kèm `serverTime` để client tự canh giờ; danh sách ít đổi mới dùng `s-maxage=60`. Trang ISR dùng `export const revalidate = 60`.
* Envelope trả về thống nhất `ActionResponse<T>` / `PaginatedResponse<T>` + helper `successResponse` / `errorResponse` tại `src/lib/types/api.ts`.

---

## 🚀 PHẦN II: HẠ TẦNG CLOUD SERVERLESS & EDGE (MODERN INFRASTRUCTURE)

Hệ thống được thiết kế theo kiến trúc chuẩn **Serverless Stateless** trên Vercel + Neon:

```text
+-------------------------------------------------------------------------------------------------+
|                                  NGƯỜI DÙNG TOÀN CẦU (BROWSER / CLIENT)                         |
+-----------------------------------------------+-------------------------------------------------+
                                                |
                                                | HTTPS / HTTP2
                                                v
+-------------------------------------------------------------------------------------------------+
|                                     VERCEL EDGE NETWORK (CDN)                                   |
|  - Tự động tối ưu định dạng ảnh WebP/AVIF qua Next.js Image Optimization                         |
|  - Cache tĩnh các trang ISR, CSS, JS bundles tại 300+ PoPs trên toàn cầu                         |
|  - Edge Middleware xử lý định tuyến, phân tách thiết bị (Mobile/Desktop) trong < 10ms           |
|  - Edge Caching qua Cache-Control: s-maxage=60, stale-while-revalidate=300 cho public API       |
+-----------------------------------------------+-------------------------------------------------+
                                                |
                                                v
+-------------------------------------------------------------------------------------------------+
|                                 VERCEL SERVERLESS FUNCTIONS (NODE.JS)                           |
|                                                                                                 |
|  [ FRONTEND LAYER ]                                                                             |
|  - Next.js 15 App Router + React 19 (Server Components RSC & Client Components)                 |
|  - Vanilla CSS Design Tokens (hoặc CSS Module) tối ưu tốc độ render tức thì                     |
|                                                                                                 |
|  [ DATA & QUERY DEDUPLICATION ]                                                                 |
|  - React.cache() gom nhóm và tái sử dụng kết quả query giữa generateMetadata và Page RSC       |
|                                                                                                 |
|  [ BACKEND LAYER (MUTATIONS & APIS) ]                                                           |
|  - Server Actions ('use server') bọc Zod Validation, Transaction và revalidateTag/revalidatePath |
|  - Route Handlers (/api/**) cho Public Endpoints, Webhooks, Export File Streaming              |
+--------------------+--------------------------+-------------------------+-----------------------+
                     |                          |                         |
                     | Neon HTTP / Pooler (6543)| REST (HTTP API)         | Pre-signed S3 API
                     v                          v                         v
+--------------------+----+  +------------------+----+  +-----------------+-----------------------+
|  NEON SERVERLESS DB     |  |   UPSTASH REDIS /     |  |       OBJECT STORAGE (MEDIA)            |
|  - PgBouncer Pooler     |  |   UPSTASH QSTASH      |  |  - Vercel Blob / Cloudflare R2 / AWS S3 |
|  - Port 6543 (App pool) |  |  - Cache Serverless   |  |  - Ảnh sản phẩm, Avatar, Chứng từ       |
|  - Port 5432 (Migrate)  |  |  - Hàng đợi Async Job |  |  - Phân phối qua CDN công khai an toàn  |
|  - Branching per PR     |  |  - Rate Limiting      |  |  - Tải ảnh siêu tốc, cache vĩnh viễn    |
|  - Scale-to-Zero        |  |  - Không sợ nghẽn pool|  |                                         |
+-------------------------+  +-----------------------+  +-----------------------------------------+
```

### 1. Bảng đối chiếu: Mô hình truyền thống vs Serverless hiện đại

| Thành phần | Mô hình truyền thống (VPS / XAMPP) | Mô hình Serverless Chuẩn (Vercel + Neon) | Lợi ích vượt trội |
| :--- | :--- | :--- | :--- |
| **Kết nối CSDL** | Mỗi process giữ kết nối cố định | **Neon Connection Pooler (PgBouncer - Port 6543)** hoặc Neon Serverless Driver | Hàng nghìn function bật tắt liên tục không bao giờ làm cạn kiệt connection pool |
| **Quản lý Migration** | Chạy trực tiếp trên VPS | `prisma db push` / `prisma migrate deploy` qua **Neon Direct URL (Port 5432)** | Tách biệt hoàn toàn kênh migration và kênh query của ứng dụng |
| **Môi trường Test/PR** | Dùng chung 1 DB staging dễ xung đột | **Neon Database Branching (Zero-copy clone)** | Mỗi Pull Request có một database branch riêng biệt, test xong tự xóa |
| **Lưu trữ Tệp Upload** | Ổ cứng cục bộ máy chủ | **Vercel Blob** hoặc **Cloudflare R2 / AWS S3** | Không sợ mất file khi serverless container bị hủy, tải qua Edge CDN cực nhanh |
| **Hàng đợi & Cron Jobs** | Tiến trình `queue:work` chạy 24/7 ngốn RAM | **Upstash QStash** hoặc **Inngest / Vercel Cron** | Gọi webhook theo lịch hoặc hàng đợi không cần duy trì worker chạy ngầm |
| **Bộ nhớ đệm (Cache)** | Cài Redis service cục bộ | **Upstash Redis (Serverless HTTP)** | Kết nối qua HTTP REST, không làm tốn connection socket |

### 2. Cấu hình biến môi trường `.env` chuẩn Neon
```env
# Chuỗi kết nối qua PgBouncer (Dành riêng cho Ứng dụng chạy trên Vercel)
DATABASE_URL="postgresql://user:password@ep-cool-branch-pooler.us-east-2.aws.neon.tech/dbname?sslmode=require&pgbouncer=true&connect_timeout=15"

# Chuỗi kết nối trực tiếp (Dành riêng cho Prisma CLI / Migration)
DIRECT_URL="postgresql://user:password@ep-cool-branch.us-east-2.aws.neon.tech/dbname?sslmode=require"

# Khóa bảo mật Session / JWT (Tối thiểu 32 ký tự ngẫu nhiên)
SESSION_SECRET="generate_with_openssl_rand_base64_32"

# Storage & Third-party (nếu có)
BLOB_READ_WRITE_TOKEN="vercel_blob_token_..."
UPSTASH_REDIS_REST_URL="https://...upstash.io"
UPSTASH_REDIS_REST_TOKEN="upstash_token_..."
```

### 3. Cấu hình `schema.prisma` hỗ trợ Direct URL & Neon Adapter
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}
```

---

## 🗄️ PHẦN III: QUY CHUẨN CƠ SỞ DỮ LIỆU & PRISMA ORM

### 1. Quy ước Thiết kế Schema
* **Khóa chính**: Dùng CUID dạng chuỗi: `id String @id @default(cuid())`. Với mã chứng từ giao dịch cho người dùng xem, dùng mã tự sinh có prefix (ví dụ: `ORD-1712345678`).
* **Thời gian chuẩn**: Mọi bảng nghiệp vụ bắt buộc có:
  ```prisma
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ```
* **Chỉ mục đơn & Chỉ mục tổ hợp (Composite Indexes)**:
  - Khóa ngoại và các trường dùng để lọc/sắp xếp bắt buộc phải có index:
    ```prisma
    model Order {
      id            String   @id @default(cuid())
      orderNumber   String   @unique
      userId        String?
      orderStatus   String   @default("PENDING")
      paymentStatus String   @default("UNPAID")
      totalAmount   Int
      createdAt     DateTime @default(now())
      updatedAt     DateTime @updatedAt

      // Index đơn cho khóa ngoại
      @@index([userId])
      // Composite Index cho các truy vấn lọc kép kèm sắp xếp thời gian
      @@index([orderStatus, createdAt])
      @@index([paymentStatus, createdAt])
    }
    ```

### 2. Chuẩn Atomic Transactions (`prisma.$transaction`)
Khi cập nhật nhiều bảng hoặc trừ tồn kho/số lượng, bắt buộc dùng transaction:

```typescript
// src/app/api/orders/route.ts hoặc Server Action
const newOrder = await prisma.$transaction(async (tx) => {
  // 1. Tạo đơn hàng và chi tiết
  const order = await tx.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: user?.id ?? null,
      totalAmount: validatedData.totalAmount,
      items: {
        create: validatedData.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    },
  });

  // 2. Trừ tồn kho sản phẩm nguyên tử
  for (const item of validatedData.items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }

  return order;
});
```

### 3. Chuẩn Truy vấn Thống kê bằng Database Aggregations
Tuyệt đối không kéo toàn bộ records về RAM để tính toán. Dùng sức mạnh của SQL engine:

```typescript
// Chuẩn thống kê Dashboard tối ưu RAM
export async function getDashboardStats() {
  const [totalOrders, revenueAggregate, totalProducts, topSellingProducts] = await Promise.all([
    // Đếm tổng số đơn
    prisma.order.count(),

    // Tính tổng doanh thu trực tiếp từ DB
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { paymentStatus: 'PAID' },
    }),

    // Đếm tổng số sản phẩm
    prisma.product.count(),

    // Gom nhóm lấy top 5 sản phẩm bán chạy nhất trực tiếp từ DB
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ]);

  return {
    totalOrders,
    totalRevenue: revenueAggregate._sum.totalAmount || 0,
    totalProducts,
    topSellingProducts,
  };
}
```

---

## ⚡ PHẦN IV: QUY ƯỚC LẬP TRÌNH NEXT.JS 15 (APP ROUTER) & REACT 19

### 1. Phân định Server Components vs Client Components
* **Server Components (RSC - Mặc định)**: Toàn bộ layout, trang danh mục (`/products`), trang chi tiết (`/products/[id]`), trang chủ (`/`). Truy vấn trực tiếp Prisma trong Server Component để tối ưu SEO, không lộ API endpoint ra ngoài, giảm tải bundle JS xuống Client về 0KB.
* **Client Components (`"use client"`)**: Chỉ dùng khi cần:
  - Tương tác DOM, bắt sự kiện: `onClick`, `onChange`, `onSubmit`.
  - Dùng React Hooks: `useState`, `useReducer`, `useEffect`, `useContext`, `useOptimistic`, `useTransition`.
  - Các UI Atoms tương tác: `CustomSelect`, `Modal`, `Drawer`, `Toast`, `LiveSearch`.

### 2. Chống Waterfall & Trùng Lặp Truy Vấn (Deduplication)
* **Dùng `Promise.all` cho các truy vấn độc lập**:
  ```typescript
  // Tránh waterfall tuần tự await
  const [categories, featuredProducts, banners] = await Promise.all([
    prisma.category.findMany({ select: { id: true, name: true, slug: true } }),
    prisma.product.findMany({ where: { isFeatured: true }, take: 8, select: { ... } }),
    prisma.banner.findMany({ where: { isActive: true }, select: { ... } }),
  ]);
  ```
* **Dùng `React.cache()` để tái sử dụng query giữa Metadata và Page**:
  Khi cả `generateMetadata()` và `ProductDetailPage()` cùng cần dữ liệu của 1 sản phẩm:
  ```typescript
  // src/lib/cached-queries.ts
  import { cache } from 'react';
  import { prisma } from '@/lib/db';

  export const getCachedProduct = cache(async (id: string) => {
    return prisma.product.findUnique({
      where: { id },
      include: { categoryRel: true, brandRel: true },
    });
  });
  ```
  -> Dù được gọi 2 lần trong 1 request render, Next.js chỉ bắn đúng 1 câu query xuống CSDL.

### 3. Server Actions (`'use server'`) vs Route Handlers (`app/api/**`)
* **Server Actions**: Ưu tiên hàng đầu cho mọi thao tác Form, Tạo đơn hàng, Cập nhật trạng thái, Thêm giỏ hàng.
  - Sau khi mutation thành công, gọi `revalidatePath('/admin/orders')` hoặc `revalidateTag('products')` để làm mới dữ liệu tức thì.
* **Route Handlers**: Dùng cho:
  - Webhook thanh toán bên thứ ba (VietQR, SePay, Stripe...).
  - Public API có gắn Edge Caching Header:
    ```typescript
    // Endpoint dữ liệu công khai hỗ trợ Edge CDN Caching
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
    ```
  - Export file Excel/PDF dạng nhị phân streaming.

### 4. Edge Middleware & Kiểm soát Truy cập Route (`src/middleware.ts`)
* **Chạy tại Edge (< 5ms)**:
  - Middleware chạy trước toàn bộ Serverless Function và quá trình render trang.
  - Kiểm tra Cookie phiên làm việc (`session_token`) và giải mã chữ ký bảo mật.
  - Phân tách và bảo vệ các tuyến đường riêng tư: `/admin` (chỉ dành cho vai trò ADMIN) và `/account` (dành cho người dùng đã đăng nhập).
* **Triệt tiêu hoàn toàn hiện tượng Flash of Unauthenticated Content (FOUC)**:
  - Nếu người dùng chưa đăng nhập truy cập `/admin`, Middleware lập tức tạo `NextResponse.redirect(new URL('/admin/login', req.url))` tại Edge. Trình duyệt nhận HTTP 307/308 ngay lập tức, không bao giờ nhận HTML của trang quản trị.
* **Mẫu Middleware chuẩn**:
  ```typescript
  // src/middleware.ts
  import { NextResponse } from 'next/server';
  import type { NextRequest } from 'next/server';

  export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const sessionToken = req.cookies.get('session_token')?.value;

    // Bỏ qua trang login của admin
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    // Bảo vệ tuyến /admin
    if (pathname.startsWith('/admin')) {
      if (!sessionToken) {
        const loginUrl = new URL('/admin/login', req.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      try {
        // Parse payload từ token base64url để kiểm tra role tại Edge
        const [payloadB64] = sessionToken.split('.');
        const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
        if (payload.role !== 'ADMIN' || (payload.expiresAt && Date.now() > payload.expiresAt)) {
          return NextResponse.redirect(new URL('/admin/login', req.url));
        }
      } catch {
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    }

    return NextResponse.next();
  }

  export const config = {
    matcher: ['/admin/:path*', '/account/:path*'],
  };
  ```

### 5. Chuẩn Quản lý Hình ảnh (`next/image`) & Fallback Đàn Hồi Toàn Hệ Thống
* **Tối ưu tự động qua Vercel Image Optimization**:
  - Luôn sử dụng `<Image />` từ `next/image` thay vì thẻ `<img>` truyền thống để tự động chuyển đổi định dạng WebP/AVIF, nén dung lượng và tải lười (lazy loading).
* **Nguyên tắc Resilient Fallback (Cấm tuyệt đối vỡ ảnh)**:
  - Chuẩn bị file asset vector chuẩn tại `/public/images/placeholder-product.svg` tone màu thanh lịch, có icon mỹ phẩm/sản phẩm rõ nét.
  - Với Client Components (`'use client'`), bắt buộc triển khai fallback thông qua state hoặc sự kiện `onError`:
    ```tsx
    // src/components/ui/SafeImage.tsx
    'use client';
    import { useState } from 'react';
    import Image, { ImageProps } from 'next/image';

    const DEFAULT_PLACEHOLDER = '/images/placeholder-product.svg';

    export function SafeImage({ src, alt, ...props }: ImageProps) {
      const [imgSrc, setImgSrc] = useState(src || DEFAULT_PLACEHOLDER);

      return (
        <Image
          {...props}
          src={imgSrc}
          alt={alt}
          onError={() => setImgSrc(DEFAULT_PLACEHOLDER)}
        />
      );
    }
    ```
  - Với Server Components (RSC): Luôn kiểm tra `src = product.image || '/images/placeholder-product.svg'` trước khi truyền vào props component con.

---

## 📦 PHẦN V: QUY CHUẨN DỮ LIỆU TRẢ VỀ & TYPE SAFETY (ENVELOPES)

Mọi Server Action và API Route Handlers bắt buộc sử dụng Envelope chuẩn hóa:

```typescript
// src/lib/types/api.ts

// 1. Phản hồi cho các thao tác hành động (Mutations)
export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
}

// 2. Phản hồi cho các danh sách phân trang (Pagination)
export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    currentPage: number;
    perPage: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
```

### Validation với Zod (Single Source of Truth)
Mọi dữ liệu gửi lên Server Action hoặc API bắt buộc parse qua Zod:

```typescript
import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(3, 'Tên sản phẩm tối thiểu 3 ký tự'),
  price: z.number().int().positive('Giá phải là số nguyên dương'),
  stock: z.number().int().min(0, 'Tồn kho không được âm'),
  categoryId: z.string().cuid('Danh mục không hợp lệ'),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
```

---

## 📁 PHẦN VI: KIẾN TRÚC THƯ MỤC CHUẨN DỰ ÁN (CORE DIRECTORY)

```text
├── prisma/
│   ├── schema.prisma              # Database schema (Models, Relations, Indexes, DirectUrl)
│   └── seed.ts                    # Dữ liệu khởi tạo (Admin role, sample products, taxonomies)
├── src/
│   ├── app/                       # Next.js 15 App Router
│   │   ├── (auth)/                # Route groups xác thực (login, register)
│   │   ├── admin/                 # Quản trị Master Data, Sản phẩm, Đơn hàng, Voucher
│   │   ├── api/                   # Route Handlers (Webhooks, Public CDN APIs, File exports)
│   │   ├── products/              # Catalog sản phẩm, bộ lọc kết hợp & trang chi tiết [id]
│   │   ├── checkout/              # Thanh toán COD & mã VietQR
│   │   ├── layout.tsx             # Root Layout (Gắn Providers, Header, Footer)
│   │   ├── loading.tsx            # Global Skeleton Shimmer cho 0ms visual feedback
│   │   ├── error.tsx              # Error boundary an toàn cho App Router
│   │   ├── not-found.tsx          # Giao diện 404 tùy biến chuyên nghiệp
│   │   ├── globals.css            # Toàn bộ CSS Tokens, Variables, Reset & Animations
│   │   └── page.tsx               # Trang chủ Storefront (RSC song song)
│   ├── components/                # Component-based Architecture
│   │   ├── ui/                    # Reusable UI Atoms (CustomSelect, Pagination, Modal, Skeleton)
│   │   ├── layout/                # Header, Footer, PromoBar, AdminSidebar
│   │   ├── product/               # ProductCard, FilterSidebar, LiveSearch, QuickViewModal
│   │   ├── cart/                  # CartDrawer, CartItem, FreeShippingBar
│   │   ├── checkout/              # VietQRModal, CheckoutForm
│   │   └── admin/                 # ProductTable, OrderManager, DashboardChart
│   ├── context/                   # React Context Providers (CartContext, ToastContext, AuthContext)
│   └── lib/                       # Core Logic, Helpers & Singletons
│       ├── db.ts                  # Prisma Client Singleton (Hỗ trợ Adapter & Pooler)
│       ├── cached-queries.ts      # React.cache() query deduplication helpers
│       ├── auth.ts                # Session token HMAC-SHA256, PBKDF2 password hasher
│       ├── vietqr.ts              # Generator URL VietQR Napas247 động
│       ├── filter.ts              # Query builder cho bộ lọc danh mục và thuộc tính
│       ├── constants.ts           # Hạn mức Freeship, phí ship mặc định, cấu hình hệ thống
│       ├── utils.ts               # Format tiền tệ VNĐ, tính % giảm giá, helper chuỗi
│       └── types/                 # Type definitions tập trung
│           └── api.ts             # ActionResponse<T> & PaginatedResponse<T>
└── tests/                         # Thư mục kiểm thử tự động với Vitest (*.test.ts)
```

---

## 🎨 PHẦN VII: QUY CHUẨN DESIGN SYSTEM & GIAO DIỆN (VANILLA CSS)

### 1. Quản lý Design Tokens tập trung tại `globals.css`
```css
:root {
  /* Bảng màu nhận diện (Brand Colors) */
  --color-primary: #ff6b81;
  --color-primary-hover: #fa5252;
  --color-primary-light: #fff0f3;
  --color-gradient-brand: linear-gradient(135deg, #ff6b81 0%, #ffa07a 100%);

  /* Bề mặt & Nền (Surfaces & Backgrounds) */
  --color-bg: #fdfbf9;
  --color-surface: #ffffff;
  --color-border: #f0eae6;
  --color-border-hover: #e2d9d2;

  /* Văn bản (Typography) */
  --color-text-main: #1e1e24;
  --color-text-muted: #64748b;
  --color-text-subtle: #94a3b8;

  /* Trạng thái (Feedback) */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;

  /* Bo góc (Radius) */
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --radius-full: 9999px;

  /* Bóng đổ (Elevations) */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.08);
  --shadow-glow: 0 4px 20px rgba(255, 107, 129, 0.25);
}
```

### 2. Bộ UI Atoms Tiêu chuẩn
* **Dropdown tìm kiếm (`CustomSelect`)**:
  - Tích hợp ô lọc tìm kiếm tức thì.
  - Đóng khi click ngoài (backdrop) hoặc nhấn phím `Escape`.
  - Không render hàng ngàn `<option>` trực tiếp vào DOM.
  - **Menu render qua Portal (`document.body`) + `position: fixed`** để không bị cắt bởi `overflow` của bảng/modal, tự lật lên khi thiếu chỗ (xem Mục 9, Phần I).
* **Bảng dữ liệu & Phân trang (`Pagination`)**:
  - Luôn đi kèm hiển thị: `Trang X / Y`, `Tổng Z mục`, nút Trước/Sau và danh sách số trang có dấu chấm lửng `...`.
* **Ảnh an toàn có Fallback (`SafeImage` / `placeholder-product.svg`)**:
  - Tự động thay thế bằng ảnh vector default khi đường dẫn ảnh bị lỗi hoặc 404, ngăn vỡ giao diện.

### 3. Kiến Trúc Skeleton Shimmer Đa Dạng Theo Từng Trang (Per-Page Tailored Skeleton System)

> **Nguyên tắc bất biến**: Skeleton của mỗi trang phải là **bản sao kiến trúc (Wireframe Blueprint)** của chính trang đó. Tuyệt đối KHÔNG sử dụng một khung skeleton chung cho toàn bộ ứng dụng.

#### A. Ma trận Skeleton theo từng Route

| Tuyến đường (Route) | File Skeleton | Cấu trúc Wireframe Skeleton tương ứng |
| :--- | :--- | :--- |
| **Trang chủ (`/`)** | `src/app/loading.tsx` | **Hero Banner lớn** (chiều cao 460px) + Hàng 6 danh mục bo tròn + Khối Bento 2 cột + **Lưới Best Sellers 4 cột** |
| **Danh mục sản phẩm (`/products`)** | `src/app/products/loading.tsx` | **Search & Toolbar** phía trên + **Filter Sidebar (260px)** bên trái (danh mục, khoảng giá, thương hiệu) + **Lưới 8 Card sản phẩm** bên phải |
| **Chi tiết sản phẩm (`/products/[id]`)** | `src/app/products/[id]/loading.tsx` | **Breadcrumb** + **Khối Gallery ảnh 1:1 & 4 thumbnails** + **Buy Box** bên phải (Rating sao, Giá, Bộ chọn số lượng, 2 nút Mua/Giỏ hàng) + Tab thông số & Reviews |
| **Trang tài khoản (`/account`)** | `src/app/account/loading.tsx` | **Profile Header** (Avatar tròn 80px + Tên + Badge VIP) + **Cột Tab điều hướng (280px)** + **Thẻ danh sách đơn hàng & Lưới yêu thích** |
| **Cổng quản trị (`/admin`)** | `src/app/admin/loading.tsx` | **Admin Sidebar** (Logo + 7 menu items) + Header tìm kiếm/avatar + **4 KPI Stat Cards** + **Bảng dữ liệu quản trị (6 hàng)** |
| **Trang thanh toán (`/checkout`)** | `src/app/checkout/loading.tsx` | **Bố cục 2 cột**: Cột trái form địa chỉ & PT thanh toán; Cột phải Card tóm tắt đơn hàng (danh sách thumbnail, voucher, tổng tiền) |
| **Chi tiết đơn hàng (`/orders/[id]`)** | `src/app/orders/[id]/loading.tsx` | **Banner xác nhận** + **Thanh tiến trình 4 bước** (Chờ duyệt -> Đã duyệt -> Đang giao -> Đã giao) + Danh sách món hàng + Khối VietQR & Tiền |
| **Skin Routine Quiz (`/quiz`)** | `src/app/quiz/loading.tsx` | **Thanh tiến trình câu hỏi** + Khung câu hỏi trung tâm + **4 thẻ lựa chọn đáp án** |

#### B. CSS Shimmer Animation & Design Tokens
Định nghĩa animation shimmer ánh sáng chuyển động tone màu ấm sang trọng (Champagne-Rose) trong `globals.css`:

```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.skeleton-box {
  position: relative;
  overflow: hidden;
  background-color: #f1ede8;
}

.skeleton-shimmer::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.45) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  animation: shimmer 1.6s infinite ease-in-out;
}
```

#### C. Modular In-Component Skeletons
Thay vì hiển thị các dòng text thô như *"Đang tải dữ liệu..."* hoặc spinner quay tròn làm biến dạng layout, bắt buộc sử dụng các component skeleton chuyên biệt:
- `<SkeletonBox />`: Khối nguyên tử với các props `width`, `height`, `rounded`, `className`.
- `<ProductCardSkeleton />`: Khung card sản phẩm tỷ lệ 1:1, nhãn brand, tên 2 dòng, sao và giá.
- `<AccountOrdersSkeleton />`: Khung tải thẻ đơn hàng với mã đơn, ngày, thumbnail và tổng tiền.
- `<AccountWishlistSkeleton />`: Khung tải danh sách yêu thích dạng lưới card.
- `<AdminTableSkeleton rows={6} />`: Khung bảng dữ liệu quản trị với header và các hàng xen kẽ.
- `<AdminDashboardSkeleton />`: Khung tải cổng admin khi đang xác thực session người dùng.

---

## 🔒 PHẦN VIII: XÁC THỰC, PHÂN QUYỀN RBAC & BẢO MẬT

### 1. Cơ chế Session Token tự phát hành (Zero Third-Party Dependency)
* **Cấu trúc Token**: `base64url(payload).hmacSha256Signature`.
* **Payload tối giản**: `userId`, `email`, `name`, `role`, `permissions`, `expiresAt`.
* **Cookie an toàn**: Tên `session_token`, cấu hình `HttpOnly; Path=/; SameSite=Lax; Secure` (khi ở Production).
* **Mã hóa Mật khẩu**: PBKDF2 với Dynamic Salt 16 bytes ngẫu nhiên:
  ```typescript
  crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  ```
  Lưu trong DB dưới dạng: `${salt}:${hash}`.

### 2. Kiểm soát Phân quyền Vai trò (RBAC)
* Danh sách quyền lưu dưới dạng mảng JSON trong model `Role`:
  - Admin tối cao: `["*"]`.
  - Quản lý kho: `["products:*", "orders:view"]`.
  - Chăm sóc khách hàng: `["orders:*", "reviews:*"]`.
* **Hàm chặn quyền tại Server Action / Route Handler**:
  ```typescript
  export async function verifyUserPermission(request: Request, requiredPermission: string) {
    const user = await getCurrentUserFromCookie(request.headers.get('cookie'));
    if (!user) {
      throw new Error('UNAUTHORIZED');
    }
    const hasPermission = user.permissions.includes('*') || user.permissions.includes(requiredPermission);
    if (!hasPermission) {
      throw new Error('FORBIDDEN');
    }
    return user;
  }
  ```

### 3. Kiến Trúc Bảo Vệ Tuyến Kép (Dual-Layer Route Protection) & Chống FOUC

Để ngăn chặn 100% tình trạng người dùng trái phép nhìn thấy màn hình quản trị trong 1-2 giây rồi mới bị redirect (Flash of Unauthenticated Content - FOUC), hệ thống áp dụng cơ chế 2 lớp bảo vệ song hành:

```text
[ Người Dùng Yêu Cầu Tuyến /admin ]
                 │
                 ▼
┌─────────────────────────────────┐
│ Lớp 1: Edge Middleware (< 5ms)  │  Chưa có token hoặc không phải ADMIN?
│ (src/middleware.ts)             ├─────────────────────────────────────────┐
└────────────────┬────────────────┘                                         │
                 │ Hợp lệ                                                   │
                 ▼                                                          ▼
┌─────────────────────────────────┐                       ┌──────────────────────────────────┐
│ Lớp 2: Page Component & Guard   │                       │ HTTP 307 Redirect Tức Thì        │
│ (src/app/admin/page.tsx)        │                       │ (về /admin/login?redirect=...)   │
│ - Hiển thị AdminDashboardSkeleton│                      │ Tuyệt đối không gửi HTML / DOM   │
│   ngay lập tức trong lúc verify │                       └──────────────────────────────────┘
│ - Không để lộ dữ liệu nhạy cảm  │
└─────────────────────────────────┘
```

1. **Lớp 1 (Edge Middleware)**:
   - Chặn đứng từ cổng vào, kiểm tra `session_token` tại Edge Network trước khi request chạm vào Serverless Lambda.
   - Trả về Header chuyển hướng tức thì (Redirect HTTP 307/308).
2. **Lớp 2 (Client/Server Guard & Skeleton Cover)**:
   - Khi trang đang trong trạng thái xác thực phiên hoặc refresh token (`isLoading`), **bắt buộc render `<AdminDashboardSkeleton />`** che phủ toàn bộ màn hình.
   - Tuyệt đối KHÔNG render giao diện Dashboard thật (danh sách đơn hàng, doanh thu, thông tin nhạy cảm) khi biến cờ `isAuthenticated` chưa được xác nhận là `true`.

---

## 💳 PHẦN IX: CÁC MẪU NGHIỆP VỤ THƯƠNG MẠI CHUẨN HÓA

### 1. Thanh toán VietQR Napas247 tức thì
* Sinh link ảnh mã QR chuẩn Napas247 không cần cài cổng thanh toán rườm rà:
  ```text
  https://img.vietqr.io/image/{bankId}-{accountNo}-compact2.png?amount={amount}&addInfo={orderNumber}&accountName={accountName}
  ```
* Tương thích với toàn bộ 40+ ứng dụng ngân hàng và ví MoMo, ZaloPay, ViettelMoney tại Việt Nam.

### 2. Giỏ hàng Client & Thanh tiến trình Freeship
* Tự động lưu và phục hồi từ `localStorage` (`app_cart_v1`).
* Tính toán tiến trình nhận Freeship trực quan:
  ```text
  Tiền còn thiếu = Ngưỡng Freeship - Tổng tiền hiện tại
  Phần trăm = (Tổng tiền hiện tại / Ngưỡng Freeship) * 100%
  Ví dụ: 399.000₫ - 300.000₫ = Cần mua thêm 99.000₫ để được Miễn phí vận chuyển (75%)
  ```

### 3. Flash Sale Đếm ngược & Edge CDN
* Realtime countdown hiển thị từng Giây / Phút / Giờ bằng Client hook nhẹ.
* Endpoint lấy danh sách Flash Sale đang kích hoạt (`/api/flash-sales/active`) được gắn header cache tại Edge CDN (`s-maxage=60`), giảm 99% tải truy vấn vào CSDL khi có lượng truy cập đột biến.

---

## 🧪 PHẦN X: QUY TRÌNH PHÁT TRIỂN, KIỂM THỬ & VERIFICATION

### 1. Quy trình phát triển 4 bước bắt buộc
```text
[1. Lên Kế Hoạch]    -> Xác định Schema, Zod validation, Server Action và 4 trạng thái UI.
[2. Triển Khai]      -> Viết code tuân thủ Strict Type, Không xóa code cũ, Tái sử dụng tối đa.
[3. Kiểm Thử Tự Động]-> Chạy test suite Vitest (npm test) đảm bảo 100% test cases pass.
[4. Xác Minh Cuối]   -> Chạy kiểm tra Type (npx tsc --noEmit) và test Slow 3G mạng yếu.
```

### 2. Tiêu chuẩn Kiểm thử với Vitest
* Đặt toàn bộ file test tại thư mục `tests/*.test.ts`.
* Kiểm tra bao phủ các mặt:
  1. **Contract Test**: Kiểm tra cấu trúc Component props, CSS classes, elements.
  2. **Logic Test**: Kiểm tra tính toán giảm giá, hạn mức Freeship, format tiền tệ.
  3. **API & Action Test**: Kiểm tra HTTP status codes, envelope `ActionResponse`, validation lỗi.
  4. **Security Test**: Kiểm tra phân quyền RBAC, hash mật khẩu PBKDF2, verify session token.

### 3. Lệnh Xác minh Bắt buộc Trước khi Bàn giao
```bash
# 1. Chạy toàn bộ test suites tự động
npm test

# 2. Kiểm tra lỗi biên dịch TypeScript toàn dự án
npx tsc --noEmit

# 3. Build thử nghiệm sản phẩm (Optional nhưng khuyến nghị)
npm run build
```

---

## 📝 TÓM TẮT: CHECKLIST KHI KHỞI TẠO DỰ ÁN MỚI

Khi sao chép file này sang dự án mới làm CORE:
- [ ] 1. Khởi tạo Next.js 15 App Router với TypeScript và React 19.
- [ ] 2. Cài đặt Prisma ORM, cấu hình `DATABASE_URL` (PgBouncer port 6543) và `DIRECT_URL` (Port 5432).
- [ ] 3. Thiết lập Design Tokens chuẩn tại `src/app/globals.css`.
- [ ] 4. Tạo thư mục `src/lib/types/api.ts` chứa `ActionResponse<T>` và `PaginatedResponse<T>`.
- [ ] 5. Thiết lập **Skeleton Shimmer tùy biến theo từng route** (`/`, `/products`, `/products/[id]`, `/account`, `/admin`, `/checkout`, `/orders/[id]`, `/quiz`), cam kết CLS = 0, tuyệt đối không dùng 1 skeleton chung.
- [ ] 6. Chuẩn bị file fallback ảnh mặc định (`/public/images/placeholder-product.svg`) và gắn xử lý `onError` cho 100% component hình ảnh, triệt tiêu lỗi vỡ ảnh.
- [ ] 7. Cấu hình **Edge Middleware (`src/middleware.ts`)** bảo vệ các tuyến `/admin` và `/account`, chống hiện tượng Flash of Unauthenticated Content (FOUC).
- [ ] 8. Áp dụng chốt chặn Anti-double submit và loading spinner cho tất cả các nút Form/Action.
- [ ] 9. Đảm bảo mọi câu query bảng lớn đều có `take`, `skip` và đánh Composite Index.
- [ ] 10. Bọc các mutation thay đổi từ 2 bảng trở lên bằng `prisma.$transaction`.
- [ ] 11. Viết test case Vitest song hành cho các module nghiệp vụ và API quan trọng; dọn test data bằng `deleteMany`.
- [ ] 12. Admin nhiều tab: đồng bộ `?tab=` lên URL (F5 không mất tab), Lazy-Mount + Keep-Alive, Parent tải 1 lần rồi truyền `initialX` cho Child (`undefined` = chưa tải, `[]` = rỗng), nút "Làm mới" trên header, badge đồng nhất.
- [ ] 13. Dropdown/popover trong bảng & modal render qua Portal + `position: fixed` + `z-index` cao hơn modal.
- [ ] 14. Trước khi báo xong, kiểm tra tab Network: sau F5 mỗi API chỉ 1 lần, bấm menu không phát sinh request mới.
- [ ] 15. Dựng **pipeline 3 lớp ngay ngày đầu**: `scripts/verify-code-rules.ts`, `scripts/setup-hooks.ts` (pre-push), `.github/workflows/ci.yml` (4 gateway), bật `noUnusedLocals`/`noUnusedParameters`.
- [ ] 16. Quy trình nhánh: làm trên `develop`, chỉ merge/push `main` khi hook + CI xanh (Vercel deploy `main` tự động, không chờ CI). Tắt `npm run dev` trước khi push.
- [ ] 17. Helper session cookie hỗ trợ cả `Cookie` header lẫn `next/headers`; client chờ `authLoading`; xử lý riêng lỗi 401.
- [ ] 18. Khai báo kiểu tường minh cho mảng rỗng được `push` sau đó (tránh lỗi chỉ xuất hiện khi build Vercel).
- [ ] 19. Thống kê/dashboard dùng `aggregate`/`count`/`groupBy` + `Promise.all`; chống N+1 bằng `findMany({ in })` + `Map`; tuyệt đối không bịa số liệu hiển thị.
- [ ] 20. Middleware Edge chỉ là hàng rào UX (không verify chữ ký); mọi API vẫn tự kiểm tra role. Client dùng `router.replace` + màn hình "đang kiểm tra quyền".
- [ ] 21. Chọn 1 màn hình admin làm chuẩn (golden reference); mọi Manager khác phải cùng format, một hành động chỉ xuất hiện một chỗ.
