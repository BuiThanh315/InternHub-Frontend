# Báo Cáo Nghiệm Thu & Hoàn Thành (Walkthrough) - TM-28: Đăng Ký Xin Nghỉ Phép Của Thực Tập Sinh

> **Ticket Jira:** [TM-28](https://robluccibn9935.atlassian.net/browse/TM-28) - Đăng Ký Xin Nghỉ Phép & Quản Lý Đơn Nghỉ Phép (Intern Apply for Leave & Request Management)  
> **Change Level:** **L3**  
> **Tài liệu đặc tả:** [`docs/specs/TM-28-apply-for-leave-spec.md`](file:///d:/Module_6/InternHub-Frontend/docs/specs/TM-28-apply-for-leave-spec.md)  
> **Kế hoạch triển khai:** [`docs/specs/TM-28-apply-for-leave-plan.md`](file:///d:/Module_6/InternHub-Frontend/docs/specs/TM-28-apply-for-leave-plan.md)  
> **Thời gian hoàn thành:** 2026-10-05  
> **Tuân thủ quy chuẩn:** 100% Toàn bộ 34 Nguyên tắc bất biến ([`AGENTS.md`](file:///d:/Module_6/InternHub-Frontend/AGENTS.md)) & Bộ Quy chuẩn Thiết kế UX/UI ([`08-ui-ux-guidelines.md`](file:///d:/Module_6/InternHub-Frontend/.agents/08-ui-ux-guidelines.md))

---

## 1. Tổng Quan Kết Quả Đạt Được (Executive Summary)

Đã hoàn thiện toàn bộ giao diện và luồng nghiệp vụ phía Frontend cho tính năng **TM-28 (Intern Apply for Leave & Leave Request Management)** kết nối trực tiếp với Microservices Spring Boot `intern-and-program-service`:

1. **Phân hệ Thực tập sinh (`/intern/leave-requests`):**
   - **Header Bar:** Tiêu đề, phụ đề, nút làm mới dữ liệu và nút hành động chính `"+ Tạo Đơn Xin Nghỉ Mới"`.
   - **4 Thẻ KPI Tóm Tắt:** Tổng số đơn, Số đơn chờ duyệt, Số đơn đã duyệt, Số ngày công đã nghỉ.
   - **Thanh lọc tiện ích:** Lọc theo trạng thái (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`) và lọc theo năm kèm nút đặt lại bộ lọc.
   - **Bảng danh sách đơn (Data Table):** Tối đa **10 dòng / trang**, tự động ẩn phân trang khi `<= 10 dòng` (Rule 31), cột Thao Tác luôn ghim cố định (`sticky right`).
   - **Modal Nộp Đơn (`CreateLeaveModal`):** Chuẩn 3 khối (Rule 29), hỗ trợ 5 nhóm lý do và 3 khung thời gian (`FULL_DAY`, `MORNING`, `AFTERNOON`), tự động khóa ngày kết thúc khi chọn nghỉ nửa ngày, **Live Preview tính trước số ngày công loại trừ Thứ Bảy & Chủ Nhật**, bộ đếm ký tự `(X / 500)`, validation client-side, chống đóng modal mất dữ liệu khi form đang dở dang (`closeOnBackdrop={!isDirty}`).
   - **Modal Xem Chi Tiết (`LeaveDetailModal`):** Hiển thị đầy đủ thông tin kỳ nghỉ, lý do, link tài liệu và timeline tiến trình xét duyệt (người duyệt, thời điểm duyệt, lời dặn của Mentor hoặc lý do từ chối).
   - **Modal Hủy Đơn Nguy Hiểm (`CancelLeaveConfirmModal`):** Destructive Confirmation Modal (Rule 33) nền đỏ nhạt xác nhận hủy đơn khi còn `PENDING`, loại bỏ hoàn toàn `window.confirm()`.

2. **Phân hệ Xét Duyệt Cho Mentor / HR (`/mentor/leave-requests`):**
   - **Trang duyệt đơn (`MentorLeaveApprovalPage`):** Danh sách các đơn chờ duyệt từ TTS phụ trách.
   - **Modal Xét Duyệt (`LeaveApprovalModal`):** Cho phép Mentor/HR chuyển đổi linh hoạt giữa 2 hành động: Phê duyệt (nhập lời dặn tùy chọn) hoặc Từ chối (bắt buộc nhập lý do từ 5 đến 500 ký tự).

3. **Tích Hợp Điều Hướng & Chuyên Cần TM-25:**
   - Cập nhật Sidebar Navigation cho role `INTERN`/`USER` (`"Đơn Xin Nghỉ Phép"`, icon `CalendarOff`) và `MENTOR`/`HR` (`"Duyệt Nghỉ Phép"`, icon `CalendarCheck2`).
   - Bổ sung nút Quick Action `"Xin Nghỉ Phép"` ngay trên trang Chấm Công & Điểm Danh (`/intern/attendance`) để kết nối ngữ cảnh chuyên cần.
   - Đăng ký đầy đủ routes bảo vệ trong [`src/routes/AppRoutes.tsx`](file:///d:/Module_6/InternHub-Frontend/src/routes/AppRoutes.tsx).

---

## 2. Danh Sách Tệp Tin Đã Xây Dựng & Cập Nhật

```text
src/
├── constants/
│   ├── endpoints/
│   │   ├── leave.endpoints.ts                  [MỚI] Khai báo 7 URL endpoints
│   │   └── index.ts                            [CẬP NHẬT] Export LEAVE_ENDPOINTS
│   └── routes/
│       ├── intern.routes.ts                    [CẬP NHẬT] Thêm LEAVE_REQUESTS: '/intern/leave-requests'
│       └── mentor.routes.ts                    [CẬP NHẬT] Thêm LEAVE_REQUESTS: '/mentor/leave-requests'
├── types/
│   ├── leave.types.ts                          [MỚI] Enums & DTOs cho Leave Domain
│   └── index.ts                                [CẬP NHẬT] Export * from './leave.types'
├── services/
│   └── leaveService.ts                         [MỚI] 7 phương thức API Axios 4 tầng + calculateWorkingDays
├── pages/
│   ├── intern/
│   │   ├── InternAttendancePage.tsx            [CẬP NHẬT] Bổ sung Quick Action 'Xin Nghỉ Phép'
│   │   ├── InternAttendancePage.module.css     [CẬP NHẬT] Thêm style .leaveRequestBtn
│   │   └── leave/                              [MỚI]
│   │       ├── InternLeavePage.tsx             # Trang chính TTS (Standard Page Composition 4 lớp)
│   │       ├── InternLeavePage.module.css
│   │       ├── components/
│   │       │   ├── LeaveSummaryCards/          # 4 thẻ KPI tóm tắt + Skeleton
│   │       │   ├── LeaveRequestTable/          # Bảng 10 dòng, tự ẩn phân trang, sticky actions
│   │       │   ├── CreateLeaveModal/           # Modal nộp đơn 3 khối + live preview ngày công
│   │       │   ├── LeaveDetailModal/           # Modal xem chi tiết + timeline xét duyệt
│   │       │   ├── CancelLeaveConfirmModal/    # Modal xác nhận hủy đơn nguy hiểm (Rule 33)
│   │       │   └── index.ts
│   │       ├── hooks/
│   │       │   └── useInternLeaveRequests.ts   # Custom hook (3 useState, gom state chuẩn Rule 14)
│   │       └── index.ts
│   └── mentor/
│       └── leave/                              [MỚI]
│           ├── MentorLeaveApprovalPage.tsx     # Bảng điều khiển duyệt đơn của Mentor/HR
│           ├── MentorLeaveApprovalPage.module.css
│           ├── components/
│           │   └── LeaveApprovalModal/         # Modal duyệt đơn (Approve note / Reject reason)
│           ├── hooks/
│           │   └── useLeaveApproval.ts         # Custom hook quản lý đơn chờ duyệt
│           └── index.ts
├── components/layout/
│   └── Sidebar.tsx                             [CẬP NHẬT] Thêm menu item cho Intern, Mentor và HR
└── routes/
    └── AppRoutes.tsx                           [CẬP NHẬT] Đăng ký 2 routes mới vào ProtectedRoute
```

---

## 3. Bằng Chứng Xác Minh & Kiểm Thử Kỹ Thuật (Verification)

### 3.1. Kiểm Tra TypeScript Compilation (`npx tsc --noEmit`)
- **Lệnh thực hiện:** `npx tsc --noEmit`
- **Kết quả:** Exit code `0` — **0 lỗi TypeScript, 0 lỗi cú pháp hoặc mismatch kiểu dữ liệu**.

### 3.2. Kiểm Tra Đóng Gói Production Build (`npm run build`)
- **Lệnh thực hiện:** `npm run build`
- **Kết quả:**
  ```text
  vite v8.3.1 building client environment for production...
  ✓ 2526 modules transformed.
  rendering chunks...
  dist/index.html                     1.27 kB │ gzip:   0.71 kB
  dist/assets/index-DgUx4f6x.css    322.68 kB │ gzip:  51.86 kB
  dist/assets/index-CiXoG1dX.js   1,260.22 kB │ gzip: 345.42 kB
  ✓ built in 2.00s
  ```
- **Exit code:** `0` — Toàn bộ module, CSS Modules và routes được đóng gói thành công.

---

## 4. Xác Nhận Tuân Thủ Toàn Diện 34 Nguyên Tắc Bất Biến

- [x] **Rule 1 & 2 (Giao thức phê duyệt):** Đã thông qua tài liệu Đặc tả (`spec.md`) và Kế hoạch (`plan.md`) trước khi thực hiện.
- [x] **Rule 3 & 4 (Terminal & Git Safety):** Luôn giải trình mục đích trước khi chạy lệnh terminal; không tự ý commit hoặc push code.
- [x] **Rule 7 & 8 (Ranh giới Backend):** 100% thao tác chỉ diễn ra trong thư mục `InternHub-Frontend/`.
- [x] **Rule 11 (Dữ liệu thực tế & Zero Mock Bypass):** Không dùng cờ mock ảo, kết nối trực tiếp Controller Spring Boot.
- [x] **Rule 12 & 13 (Component-Driven):** Mọi nút bấm, modal, ô nhập, phân trang đều tái sử dụng từ `components/common/` và tách types riêng biệt.
- [x] **Rule 14 (Giới hạn State):** Custom hook `useInternLeaveRequests` và `useLeaveApproval` chỉ có tối đa 3-4 `useState`, gom nhóm `FilterState`, `DataState`, `ModalState`.
- [x] **Rule 15 (Quét & Tái sử dụng tối đa):** Tái sử dụng 100% `Modal`, `Button`, `Input`, `Select`, `Pagination`, `Skeleton`, `Alert`, `ErrorBoundary`, `formatters.ts`, `apiClient`, `sonner`.
- [x] **Rule 18 & 19 (Axios 4 tầng & Không Magic Strings):** URL tập trung tại `LEAVE_ENDPOINTS`, routes tập trung tại `ROUTES`.
- [x] **Rule 20 (Standard Page Composition 4 lớp):** Màn hình chia rõ Header ➔ Filter & KPI ➔ Table ➔ Modals.
- [x] **Rule 23 (CSS Modules):** 100% CSS Modules riêng biệt, cô lập phạm vi hoàn toàn.
- [x] **Rule 24 (Mutation UX & Bảo toàn dữ liệu):** Toast thông báo thành công, giữ nguyên form khi submit lỗi từ backend.
- [x] **Rule 28 (Design Tokens):** 100% CSS Variables ngữ nghĩa (`var(--bg-card)`, `var(--text-main)`, `var(--primary)...`), tuyệt đối không có mã màu Hex.
- [x] **Rule 29 (Modal-First UX & 3 khối):** Thao tác tạo đơn, xem chi tiết và hủy đơn thực hiện ngay trên trang hiện tại, bảo toàn bộ lọc và phân trang.
- [x] **Rule 30 (Border Focus Glow):** Đổi màu viền sang `var(--primary)` kèm hào quang ánh sáng bao quanh khi focus.
- [x] **Rule 31 (Bảng 10 dòng & Tự ẩn phân trang):** Bảng hiển thị tối đa 10 dòng, tự động ẩn phân trang khi `<= 10 dòng`.
- [x] **Rule 32 (Đủ 5 trạng thái UI):** Skeleton Shimmer, Empty có CTA, Error Retry, Success Toast, Disabled.
- [x] **Rule 33 (Destructive Confirmation Modal):** Xác nhận hủy đơn qua `CancelLeaveConfirmModal`, loại bỏ `window.confirm()`.
- [x] **Rule 34 (Sleek Scrollbar & Sticky Columns & Responsive):** Cột Thao Tác luôn ghim cố định bên phải, tự động chuyển đổi sang Card dọc trên Mobile.
