# Kế Hoạch Triển Khai (Implementation Plan) - TM-28: Đăng Ký Xin Nghỉ Phép Của Thực Tập Sinh

> **Ticket:** [TM-28](https://robluccibn9935.atlassian.net/browse/TM-28) - Đăng Ký Xin Nghỉ Phép & Quản Lý Đơn Nghỉ Phép (Intern Apply for Leave & Request Management)  
> **Change Level:** **L3**  
> **Tài liệu đặc tả liên quan:** [`docs/specs/TM-28-apply-for-leave-spec.md`](file:///d:/Module_6/InternHub-Frontend/docs/specs/TM-28-apply-for-leave-spec.md)  
> **Backend Service:** `intern-and-program-service` (Port `8082` qua API Gateway `8080`)  
> **Tuân thủ quy chuẩn:** 34 Nguyên tắc bất biến ([`AGENTS.md`](file:///d:/Module_6/InternHub-Frontend/AGENTS.md)) & Bộ Quy chuẩn Thiết kế UX/UI ([`08-ui-ux-guidelines.md`](file:///d:/Module_6/InternHub-Frontend/.agents/08-ui-ux-guidelines.md))

---

## 1. Mục Tiêu & Kiến Trúc Dự Kiến (Architecture & Goals)

Xây dựng toàn diện giao diện và luồng nghiệp vụ phía Frontend cho tính năng **TM-28 (Intern Apply for Leave & Leave Request Management)**:
- Cho phép Thực tập sinh (`ROLE_INTERN` / `ROLE_USER`) khởi tạo đơn xin nghỉ phép với 5 nhóm lý do chính đáng (`SICK`, `PERSONAL`, `ACADEMIC_EXAM`, `BEREAVEMENT`, `OTHER`) và 3 khung thời gian (`FULL_DAY`, `MORNING`, `AFTERNOON`).
- Quản lý lịch sử đơn cá nhân kèm 4 thẻ KPI thống kê số ngày nghỉ và bảng danh sách tuân thủ chuẩn tối đa 10 dòng tự ẩn phân trang (Rule 31).
- Cho phép TTS chủ động hủy đơn khi còn ở trạng thái `PENDING` thông qua Destructive Confirmation Modal (Rule 33).
- Cung cấp phân hệ xem chi tiết tiến trình xét duyệt và màn hình duyệt đơn dành cho Mentor/HR (`ROLE_MENTOR`, `ROLE_HR`, `ROLE_ADMIN`).
- Tích hợp chặt chẽ với phân hệ Chấm công & Chuyên cần (`InternAttendancePage`).

### Phê Duyệt Endpoint & Route (Bắt buộc theo Nguyên tắc 11 & 17):
- **API Endpoints (Backend Spring Boot):**
  1. `POST /api/v1/leave-requests`: TTS nộp đơn xin nghỉ mới
  2. `GET /api/v1/leave-requests/my-requests`: TTS tra cứu danh sách đơn cá nhân (params: `status`, `year`, `page`, `size`, `sort`)
  3. `PATCH /api/v1/leave-requests/{id}/cancel`: TTS chủ động hủy đơn khi còn `PENDING`
  4. `GET /api/v1/leave-requests/{id}`: Xem chi tiết đơn xin nghỉ phép
  5. `GET /api/v1/leave-requests/pending`: Mentor / HR lấy danh sách đơn chờ duyệt
  6. `PATCH /api/v1/leave-requests/{id}/approve`: Mentor / HR duyệt đơn (payload: `{ approvalNote?: string }`)
  7. `PATCH /api/v1/leave-requests/{id}/reject`: Mentor / HR từ chối đơn (payload: `{ rejectionReason: string }`)
- **Routes:**
  1. `ROUTES.INTERN.LEAVE_REQUESTS = '/intern/leave-requests'`: Trang quản lý đơn nghỉ phép của TTS
  2. `ROUTES.MENTOR.LEAVE_REQUESTS = '/mentor/leave-requests'`: Trang xét duyệt đơn của Mentor/HR

---

## 2. Khảo Sát Hiện Trạng & Đánh Giá Tái Sử Dụng (Rule 15 - Project Scan & Reuse Analysis)

| Danh mục | Thành phần sẵn có | Kế hoạch tái sử dụng 100% |
| :--- | :--- | :--- |
| **Common UI** | `Modal` (`src/components/common/Modal`) | Dùng cho `CreateLeaveModal`, `LeaveDetailModal`, `CancelLeaveConfirmModal`, `LeaveApprovalModal` |
| **Common UI** | `Button` (`src/components/common/Button`) | Dùng cho tất cả nút bấm primary, secondary, danger, outline kèm loading spinner |
| **Common UI** | `Input` (`src/components/common/Input`) | Dùng cho ngày tháng, link đính kèm, hỗ trợ `error?: string` |
| **Common UI** | `Select` (`src/components/common/Select`) | Dùng cho dropdown chọn loại nghỉ, buổi nghỉ, bộ lọc trạng thái và năm |
| **Common UI** | `Pagination` (`src/components/common/Pagination`) | Phân trang tự động chuyển đổi 0-indexed ↔ 1-indexed, tự ẩn khi `<= 10 dòng` |
| **Common UI** | `Skeleton` (`src/components/common/Skeleton`) | Hiển thị Shimmer loading cho KPI cards và hàng bảng dữ liệu |
| **Common UI** | `Alert` & `ErrorBoundary` | Thông báo chính sách, cảnh báo lỗi và bảo vệ trang chống sập trắng |
| **Design Tokens** | `src/index.css` (CSS Variables) | 100% biến màu ngữ nghĩa (`var(--primary)`, `var(--warning)`, `var(--success)...`), cấm hex |
| **Formatters** | `src/utils/formatters.ts` | Tái sử dụng `formatDate`, `formatDateTime` |
| **Toast** | `sonner` | Toast thông báo mutation UX tức thì |
| **API Client** | `apiClient`, `AppError` (`src/services/api.ts`) | Axios 4 tầng đính kèm JWT và chuẩn hóa lỗi |

---

## 3. Các Bước Triển Khai Chi Tiết (Implementation Steps)

### Bước 1: Khai Báo Endpoints, Routes & Types Chuẩn Doanh Nghiệp
1. Tạo [`src/constants/endpoints/leave.endpoints.ts`](file:///d:/Module_6/InternHub-Frontend/src/constants/endpoints/leave.endpoints.ts) và export tại [`src/constants/endpoints/index.ts`](file:///d:/Module_6/InternHub-Frontend/src/constants/endpoints/index.ts).
2. Cập nhật [`src/constants/routes/intern.routes.ts`](file:///d:/Module_6/InternHub-Frontend/src/constants/routes/intern.routes.ts) (`LEAVE_REQUESTS: '/intern/leave-requests'`) và [`src/constants/routes/mentor.routes.ts`](file:///d:/Module_6/InternHub-Frontend/src/constants/routes/mentor.routes.ts) (`LEAVE_REQUESTS: '/mentor/leave-requests'`).
3. Tạo [`src/types/leave.types.ts`](file:///d:/Module_6/InternHub-Frontend/src/types/leave.types.ts):
   - Enums: `LeaveType`, `LeaveDurationType`, `LeaveStatus`.
   - DTOs: `CreateLeaveRequest`, `LeaveRequestResponse`, `LeaveRequestSummaryResponse`, `ApproveLeaveRequest`, `RejectLeaveRequest`, `LeaveRequestFilterParams`.
   - Cập nhật barrel export tại [`src/types/index.ts`](file:///d:/Module_6/InternHub-Frontend/src/types/index.ts).

### Bước 2: Tầng Dịch Vụ API (`leaveService.ts`) & Working Days Calculator Helper
1. Tạo [`src/services/leaveService.ts`](file:///d:/Module_6/InternHub-Frontend/src/services/leaveService.ts):
   - Tuân thủ chuẩn Axios 4 tầng, nhận `AbortSignal` cho toàn bộ 7 phương thức API.
   - Thêm helper tiện ích `calculateWorkingDays(startDate: string, endDate: string, durationType: LeaveDurationType): number`:
     - Tự động trừ Thứ Bảy (thứ 6 trong JS date: getDay() === 6) và Chủ Nhật (getDay() === 0).
     - Nếu `MORNING` hoặc `AFTERNOON` ➔ trả về `0.5` ngày công.
     - Dùng cho tính toán trước (Live Preview) trong form tạo đơn.

### Bước 3: Xây Dựng Custom Hooks Chuyên Trách
1. Tạo [`src/pages/intern/leave/hooks/useInternLeaveRequests.ts`](file:///d:/Module_6/InternHub-Frontend/src/pages/intern/leave/hooks/useInternLeaveRequests.ts):
   - Quản lý state bộ lọc (`status`, `year`, `page`), phân trang dữ liệu từ `PageResponse`.
   - Quản lý state modals: `isCreateOpen`, `selectedDetailId`, `cancellingItem`.
   - Hàm `handleCreateRequest`, `handleCancelRequest`, `refetch`.
   - Đảm bảo giới hạn 3-4 `useState` (gom các modal flags hoặc query filters vào object state).
2. Tạo [`src/pages/mentor/leave/hooks/useLeaveApproval.ts`](file:///d:/Module_6/InternHub-Frontend/src/pages/mentor/leave/hooks/useLeaveApproval.ts):
   - Quản lý danh sách đơn chờ duyệt `pendingRequests`, `handleApprove`, `handleReject`.

### Bước 4: Xây Dựng Sub-components Cho Thực Tập Sinh (`src/pages/intern/leave/components/`)
1. **`LeaveSummaryCards/`**: 4 thẻ KPI tóm tắt (Tổng đơn, Chờ duyệt, Đã duyệt, Số ngày công đã nghỉ). Hỗ trợ Skeleton khi đang tải.
2. **`LeaveRequestTable/`**: Bảng danh sách đơn:
   - Tối đa 10 dòng / trang. Tự ẩn phân trang khi `<= 10 dòng` (Rule 31).
   - Badge trạng thái màu sắc ngữ nghĩa từ `index.css`.
   - Cột Thao tác ghim cố định (`sticky right`). Nút "Xem" và nút "Hủy" (chỉ hiện khi `PENDING`).
   - Xử lý đủ 5 trạng thái UI: Skeleton Shimmer, Empty có CTA, Error Retry, Success Toast, Disabled.
3. **`CreateLeaveModal/`**: Modal 3 khối nộp đơn (Rule 29):
   - Header cố định, Body cuộn độc lập, Sticky Footer.
   - Select Loại nghỉ phép, Radio Buttons Khung thời gian (`FULL_DAY`, `MORNING`, `AFTERNOON`).
   - Tự động gán `endDate = startDate` và disable `endDate` khi chọn nghỉ nửa ngày.
   - Live Preview số ngày công dự kiến nghỉ.
   - Textarea lý do có bộ đếm ký tự `(X / 500)`, validation client-side tối thiểu 10 ký tự.
   - Ô nhập link tài liệu minh chứng (tùy chọn).
   - Safe dismissal guard: Ngăn đóng modal khi click backdrop nếu form đã nhập liệu (`isDirty`).
4. **`LeaveDetailModal/`**: Modal 3 khối xem chi tiết đơn:
   - Thông tin TTS, loại nghỉ, thời gian, số ngày công, lý do chi tiết.
   - Timeline tiến trình: Ai duyệt, duyệt lúc nào, ghi chú của người duyệt hoặc lý do từ chối.
   - Nút "Hủy đơn này" ở footer nếu đơn còn `PENDING`.
5. **`CancelLeaveConfirmModal/`**: Destructive Confirmation Modal (Rule 33):
   - Nền đỏ nhạt, nêu đích danh khoảng thời gian và số ngày công bị hủy.
   - Nút xác nhận `variant="danger"` kèm spinner loading chống double-click.

### Bước 5: Hoàn Thiện Màn Hình TTS `InternLeavePage.tsx`
1. Tạo [`src/pages/intern/leave/InternLeavePage.tsx`](file:///d:/Module_6/InternHub-Frontend/src/pages/intern/leave/InternLeavePage.tsx):
   - Tuân thủ **Standard Page Composition 4 lớp** (Rule 20).
   - Bao bọc bởi `ErrorBoundary` chống lỗi trắng trang.
   - CSS Modules [`InternLeavePage.module.css`](file:///d:/Module_6/InternHub-Frontend/src/pages/intern/leave/InternLeavePage.module.css).

### Bước 6: Phân Hệ Duyệt Đơn Cho Mentor / HR (`src/pages/mentor/leave/`)
1. Tạo [`src/pages/mentor/leave/MentorLeaveApprovalPage.tsx`](file:///d:/Module_6/InternHub-Frontend/src/pages/mentor/leave/MentorLeaveApprovalPage.tsx).
2. Tạo [`src/pages/mentor/leave/components/LeaveApprovalModal/`](file:///d:/Module_6/InternHub-Frontend/src/pages/mentor/leave/components/LeaveApprovalModal/):
   - Cho phép phê duyệt kèm lời dặn (`approvalNote` tùy chọn).
   - Cho phép từ chối với trường lý do bắt buộc (`rejectionReason` từ 5 đến 500 ký tự).

### Bước 7: Điều Hướng, Quick Action & Đăng Ký Route
1. Cập nhật [`src/components/layout/Sidebar.tsx`](file:///d:/Module_6/InternHub-Frontend/src/components/layout/Sidebar.tsx):
   - Bổ sung menu item `"Đơn Xin Nghỉ Phép"` (Icon: `CalendarOff`) cho `INTERN`/`USER`.
   - Bổ sung menu item `"Duyệt Nghỉ Phép"` (Icon: `CalendarCheck2`) cho `MENTOR` và `HR`.
2. Bổ sung nút Quick Action `"Xin Nghỉ Phép"` trên [`src/pages/intern/InternAttendancePage.tsx`](file:///d:/Module_6/InternHub-Frontend/src/pages/intern/InternAttendancePage.tsx) để liên kết ngữ cảnh chuyên cần TM-25.
3. Cập nhật [`src/routes/AppRoutes.tsx`](file:///d:/Module_6/InternHub-Frontend/src/routes/AppRoutes.tsx) đăng ký các routes bảo vệ.

---

## 4. Kế Hoạch Kiểm Thử Nghiệm Thu (Acceptance Test Plan)

- Kiểm thử TC-01: Truy cập trang từ Sidebar navigation.
- Kiểm thử TC-02: Bảng hiển thị tối đa 10 dòng, tự ẩn phân trang khi `<= 10`.
- Kiểm thử TC-03: Modal tạo đơn tính toán đúng số ngày công làm việc (trừ T7, CN).
- Kiểm thử TC-04: Khóa ngày kết thúc khi chọn nghỉ nửa ngày.
- Kiểm thử TC-05: Validation lý do < 10 ký tự bôi đỏ trường lỗi, giữ nguyên modal.
- Kiểm thử TC-06: Nộp đơn thành công ➔ Toast thông báo ➔ Đóng modal ➔ Bảng tự động refetch đơn mới `PENDING`.
- Kiểm thử TC-07: Xem chi tiết đơn và timeline phê duyệt.
- Kiểm thử TC-08: Hủy đơn qua confirmation modal nguy hiểm.
- Kiểm thử TC-09: Đơn `APPROVED`/`REJECTED`/`CANCELLED` không hiển thị nút Hủy.
- Kiểm thử TC-10: Lọc theo trạng thái và năm hoạt động chính xác.
- Kiểm thử TC-11: Chống double-click và hiển thị loading spinner khi gửi mutation.
- Kiểm thử TC-12: Tương thích 100% Dark Mode & Light Mode 2 chiều.
