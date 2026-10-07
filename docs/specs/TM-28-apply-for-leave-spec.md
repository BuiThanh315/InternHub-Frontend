# Đặc Tả Kỹ Thuật Giao Diện (Frontend Spec): TM-28 Đăng Ký Xin Nghỉ Phép Của Thực Tập Sinh (Intern Apply For Leave & Request Management)

> **Trạng thái tài liệu:** DRAFT / SẴN SÀNG CHỜ PHÊ DUYỆT (PENDING APPROVAL)  
> **Lưu trữ tại:** `InternHub-Frontend/docs/specs/TM-28-apply-for-leave-spec.md`  
> **Dự án:** [InternHub-Frontend](file:///d:/Module_6/InternHub-Frontend) (React 19, TypeScript, Vite, CSS Modules, Axios)  
> **Tương thích Backend:** [InternHub Backend TM-28](file:///d:/Module_6/InternHub/docs/specs/TM-28-apply-for-leave-spec.md) (`intern-and-program-service`, `LeaveRequestController`, `leave_requests` table)  
> **Mã Jira Ticket:** [TM-28](https://robluccibn9935.atlassian.net/browse/TM-28)  
> **Tiêu đề Jira:** *Intern - Đăng ký xin nghỉ phép (Intern Apply for Leave & Request Management)*  
> **Nhánh Git dự kiến:** `feature/TM-28/apply-for-leave`  
> **Cấp độ thay đổi (Change Level):** **L3** (Xây dựng phân hệ Quản lý & Nộp đơn xin nghỉ phép cho Thực tập sinh, Modal nộp đơn 3 khối chuẩn UX, Bảng lịch sử đơn 10 dòng tự ẩn phân trang, Modal xem chi tiết tiến trình xét duyệt, Modal xác nhận hủy đơn nguy hiểm, Phân hệ xem và xét duyệt đơn dành cho Mentor/HR).  
> **Tuân thủ quy chuẩn:** Tuân thủ 100% [AGENTS.md](file:///d:/Module_6/InternHub-Frontend/AGENTS.md) (Toàn bộ 34 nguyên tắc bất biến của Frontend), tài liệu [08-ui-ux-guidelines.md](file:///d:/Module_6/InternHub-Frontend/.agents/08-ui-ux-guidelines.md) và kỹ năng thiết kế chuyên sâu [Frontend Design](file:///d:/Module_6/InternHub-Frontend/.agents/skills/frontend-design/SKILL.md).

---

## 0. Nhật Ký Thay Đổi & Giải Trình Kỹ Thuật (Revision History & Change Rationale)

> [!IMPORTANT]
> **BẮT BUỘC ĐIỀN ĐẦY ĐỦ**: Bất kể khi nào Lập trình viên hay AI Agent thay đổi mã nguồn ảnh hưởng đến logic, giao diện, API, routing hay modal (từ cấp độ L2 trở lên), **bắt buộc** phải ghi thêm một dòng vào bảng này để giải trình lý do trước khi coi nhiệm vụ là hoàn tất (Tuân thủ Rule 30 trong AGENTS.md).

| Phiên bản | Ngày | Người thực hiện | Task / Jira | Loại thay đổi | Lý do & Giải trình kỹ thuật (Rationale) |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **v1.0.0** | 2026-10-05 | AI Senior Pair-Programmer | `TM-28` | Tạo mới đặc tả Frontend | Khởi tạo tài liệu đặc tả kỹ thuật Frontend cho TM-28 dựa trên Backend Microservices `intern-and-program-service` đã triển khai và nghiệm thu. Áp dụng chuẩn **Frontend Design** (Minimalist Enterprise UI) và **34 nguyên tắc Frontend**: Xây dựng màn hình quản lý đơn nghỉ phép của TTS (`InternLeavePage`), 4 Thẻ KPI thống kê số ngày nghỉ, Modal Nộp đơn 3 khối (`CreateLeaveModal`) có preview tính ngày công tự động, Modal Xem chi tiết (`LeaveDetailModal`), Confirmation Modal hủy đơn (`CancelLeaveConfirmModal`), Modal xét duyệt cho Mentor/HR (`LeaveApprovalModal`), xử lý đủ 5 trạng thái giao diện (Skeleton, Empty có CTA, Error Retry, Success Toast, Disabled), 100% CSS Variables ngữ nghĩa từ `src/index.css`. |

---

## 1. Feature Overview & Tuyên Ngôn Nghiệp Vụ Cốt Lõi

- **Mã tính năng:** TM-28 (Intern Apply for Leave & Leave Request Management).
- **Phân hệ người dùng tham gia:**
  1. **Thực tập sinh (`ROLE_INTERN` / `ROLE_USER`):** Đối tượng khởi tạo và quản lý đơn xin nghỉ cá nhân.
  2. **Mentor (`ROLE_MENTOR`):** Người hướng dẫn trực tiếp tiếp nhận, kiểm tra lý do và phê duyệt/từ chối đơn của TTS trong chương trình.
  3. **HR & Quản trị viên (`ROLE_HR` / `ROLE_ADMIN`):** Giám sát tình hình chuyên cần tổng thể và có quyền phê duyệt/từ chối thay thế khi cần.

- **Tuyên ngôn nghiệp vụ cốt lõi (Core Business Statement):**
  > **"QUY TRÌNH NGHỈ PHÉP MINH BẠCH, CHẶT CHẼ, ĐẢM BẢO CHUYÊN CẦN VÀ BẢO TOÀN TRẢI NGHIỆM NGƯỜI DÙNG"**
  >
  > - **Quyền hạn Thực tập sinh:** Được phép nộp đơn xin nghỉ phép trước khi nghỉ với 5 nhóm lý do chính đáng:
  >   1. `SICK`: Nghỉ ốm đau / Khám bệnh.
  >   2. `PERSONAL`: Nghỉ việc riêng gia đình / cá nhân.
  >   3. `ACADEMIC_EXAM`: Nghỉ thi cử / Đồ án tốt nghiệp / Bảo vệ khóa luận tại trường.
  >   4. `BEREAVEMENT`: Nghỉ việc hiếu hỉ / Tang lễ gia đình.
  >   5. `OTHER`: Lý do chính đáng khác.
  > - **Khung thời gian xin nghỉ (`durationType`):**
  >   1. `FULL_DAY`: Nghỉ cả ngày (tính 1.0 ngày công / ngày làm việc).
  >   2. `MORNING`: Nửa ngày buổi sáng (08:00 - 12:00, tính 0.5 ngày công).
  >   3. `AFTERNOON`: Nửa ngày buổi chiều (13:30 - 17:30, tính 0.5 ngày công).
  > - **Ràng buộc nghiệp vụ quan trọng từ Backend:**
  >   - Nếu `durationType` là `MORNING` hoặc `AFTERNOON` (nửa ngày) thì `startDate` bắt buộc phải bằng `endDate`.
  >   - `startDate <= endDate`. Hệ thống tự động trừ Thứ Bảy và Chủ Nhật khi tính tổng ngày công (`totalDays`).
  >   - Không cho phép nộp đơn trùng lặp thời gian với các đơn đã tồn tại ở trạng thái `PENDING` hoặc `APPROVED`.
  >   - Độ dài lý do (`reason`): Bắt buộc từ 10 đến 500 ký tự.
  >   - Đính kèm (`attachmentUrl`): Tùy chọn, tối đa 500 ký tự (link Drive/hình ảnh giấy khám bệnh, giấy triệu tập thi...).
  > - **Vòng đời trạng thái đơn (State Machine):**
  >   - `PENDING` (Chờ xét duyệt) ➔ `APPROVED` (Đã duyệt): Mentor/HR duyệt kèm lời dặn (`approvalNote`). Dữ liệu liên kết sang hệ thống chuyên cần TM-25.
  >   - `PENDING` ➔ `REJECTED` (Bị từ chối): Mentor/HR từ chối bắt buộc nêu rõ lý do (`rejectionReason` 5-500 ký tự).
  >   - `PENDING` ➔ `CANCELLED` (Đã hủy): Thực tập sinh chủ động hủy đơn khi kế hoạch thay đổi (chỉ hủy được khi còn `PENDING`).
  >   - Các trạng thái `APPROVED`, `REJECTED`, `CANCELLED` là trạng thái cuối cùng (Terminal state), không thể thay đổi tiếp.

- **Mục tiêu kỹ thuật & Trải nghiệm người dùng:**
  1. Xây dựng không gian quản lý nghỉ phép trực quan, liền mạch, tích hợp chặt chẽ với phân hệ Chấm công & Chuyên cần (`InternAttendancePage`).
  2. Áp dụng chuẩn **Modal-First UX (Quy tắc 29)**: Thao tác tạo đơn, xem chi tiết và hủy đơn đều thực hiện ngay trên trang hiện tại, bảo toàn 100% bộ lọc và phân trang.
  3. Form tạo đơn thông minh: Tự động tính toán trước số ngày nghỉ dự kiến (`totalDays preview`) ngay khi người dùng chọn ngày bắt đầu, ngày kết thúc và khung thời gian.
  4. Bảng danh sách chuẩn **10 dòng / trang**, tự động ẩn phân trang khi `<= 10 dòng` (Quy tắc 31).
  5. Đạt chuẩn WCAG AA, responsive mượt mà trên Desktop/Tablet/Mobile, tương thích hoàn hảo Dark Mode và Light Mode.

---

## 2. Khảo Sát Hiện Trạng Mã Nguồn & Đánh Giá Tái Sử Dụng (Rule 15 - Project Scan & Reuse Analysis)

> [!CAUTION]
> ### CHỈ THỊ TUÂN THỦ NGUYÊN TẮC BẤT BIẾN (RULE 15 & MANDATORY WORKSPACE DIRECTIVE)
> **"ĐẢM BẢO SẼ QUÉT DỰ ÁN, TRÁNH VIỆC TẠO THÊM CODE MỚI KHÔNG CẦN THIẾT, SỬ DỤNG TỐI ĐA NHỮNG GÌ ĐÃ CÓ ĐỂ PHÁT TRIỂN"**

Sau khi quét toàn diện mã nguồn `InternHub-Frontend`, cấu trúc tái sử dụng và kế thừa được thiết lập như sau:

### 2.1. Đánh Giá Thành Phần Sẵn Có & Tái Sử Dụng 100%

| Danh mục | Thành phần hiện có trong dự án | Tình trạng | Kế hoạch tái sử dụng cho TM-28 |
| :--- | :--- | :---: | :--- |
| **Common Components** | `Modal` (`src/components/common/Modal`) | Đã có | Tái sử dụng 100% cho `CreateLeaveModal`, `LeaveDetailModal`, `CancelLeaveConfirmModal`, `LeaveApprovalModal` (hỗ trợ 3 khối: Header cố định, Body cuộn độc lập, Sticky Footer). |
| **Common Components** | `Button` (`src/components/common/Button`) | Đã có | Tái sử dụng cho toàn bộ nút: primary, secondary, danger, outline, ghost kèm spinner loading. |
| **Common Components** | `Input` (`src/components/common/Input`) | Đã có | Tái sử dụng cho các ô nhập liệu ngày tháng, link đính kèm, hỗ trợ `error?: string`. |
| **Common Components** | `Select` (`src/components/common/Select`) | Đã có | Tái sử dụng cho dropdown chọn Loại nghỉ phép (`leaveType`), Khung thời gian (`durationType`), Lọc trạng thái (`status`), Lọc năm (`year`). |
| **Common Components** | `SearchBar` (`src/components/common/SearchBar`) | Đã có | Tái sử dụng cho thanh tìm kiếm nhanh trong bảng đơn của Mentor/HR. |
| **Common Components** | `Pagination` (`src/components/common/Pagination`) | Đã có | Tái sử dụng phân trang tự động chuyển đổi 0-indexed (backend) ↔ 1-indexed (UI), tự ẩn khi `<= 10 dòng`. |
| **Common Components** | `Skeleton` (`src/components/common/Skeleton`) | Đã có | Tái sử dụng cho Skeleton Shimmer loading khi đang tải dữ liệu bảng hoặc thẻ KPI. |
| **Common Components** | `Alert` (`src/components/common/Alert`) | Đã có | Tái sử dụng cho banner thông báo chính sách nghỉ phép và hiển thị lỗi. |
| **Common Components** | `ErrorBoundary` (`src/components/common/ErrorBoundary`) | Đã có | Tái sử dụng bao bọc toàn bộ trang chống lỗi trắng trang (White Screen of Death). |
| **Design Tokens & Theme** | `src/index.css` (CSS Variables) | Đã có | Tái sử dụng 100% biến ngữ nghĩa: `--bg-body`, `--bg-card`, `--text-main`, `--text-secondary`, `--text-muted`, `--border-default`, `--primary`, `--primary-glow`, `--info`, `--success`, `--warning`, `--danger`. Cấm hardcode màu hex. |
| **Formatters** | `formatDate`, `formatDateTime` (`src/utils/formatters.ts`) | Đã có | Tái sử dụng để hiển thị ngày bắt đầu, ngày kết thúc, thời điểm nộp đơn, thời điểm phê duyệt. |
| **Toast Notifications** | `sonner` (`toast.success`, `toast.error`, `toast.warning`) | Đã có | Tái sử dụng thông báo tức thời khi nộp đơn, hủy đơn, duyệt đơn thành công hoặc thất bại. |
| **API Client** | `apiClient`, `AppError` (`src/services/api.ts`) | Đã có | Tái sử dụng Axios instance 4 tầng, tự động đính kèm Bearer token và chuẩn hóa lỗi nghiệp vụ. |

### 2.2. Đánh Giá Các Thành Phần Cần Mở Rộng (Extension Without Breaking Changes)

| Thành phần | Đường dẫn | Thay đổi dự kiến | Lý do kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Types** | `src/types/leave.types.ts` & `src/types/index.ts` | Tạo mới file `leave.types.ts` và export tại `types/index.ts`. | Định nghĩa toàn bộ Enums (`LeaveType`, `LeaveDurationType`, `LeaveStatus`) và DTOs (`CreateLeaveRequest`, `LeaveRequestResponse`, `LeaveRequestSummaryResponse`, `ApproveLeaveRequest`, `RejectLeaveRequest`). |
| **Endpoints** | `src/constants/endpoints/leave.endpoints.ts` & `index.ts` | Tạo file `leave.endpoints.ts` và export tại `endpoints/index.ts`. | Quản lý tập trung URL `/api/v1/leave-requests`, triệt tiêu magic strings theo Rule 19. |
| **Routes** | `src/constants/routes/intern.routes.ts` & `mentor.routes.ts` | Thêm `LEAVE_REQUESTS: '/intern/leave-requests'` vào `INTERN_ROUTES`; thêm `LEAVE_REQUESTS: '/mentor/leave-requests'` vào `MENTOR_ROUTES`. | Cung cấp định tuyến chuẩn doanh nghiệp cho phân hệ nghỉ phép. |
| **Services** | `src/services/leaveService.ts` & `index.ts` | Tạo `leaveService.ts` với đầy đủ 7 API methods hỗ trợ `AbortSignal`. | Tách biệt domain service theo kiến trúc Domain-Driven Modular (Rule 18, 20). |
| **Sidebar Navigation** | `src/components/layout/Sidebar.tsx` | Bổ sung menu item `"Đơn Xin Nghỉ Phép"` (Icon: `CalendarOff` hoặc `CalendarX`) cho role `INTERN`/`USER`; bổ sung `"Duyệt Nghỉ Phép"` cho `MENTOR` và `HR`. | Cung cấp lối tắt điều hướng trực tiếp trên Sidebar. |
| **App Routing** | `src/routes/AppRoutes.tsx` | Đăng ký `<Route path={ROUTES.INTERN.LEAVE_REQUESTS} element={<InternLeavePage />} />` và route duyệt đơn cho Mentor/HR. | Kích hoạt màn hình trong vùng phân quyền `ProtectedRoute`. |
| **Attendance Quick Action** | `src/pages/intern/InternAttendancePage.tsx` | Bổ sung nút Quick Action `"Xin Nghỉ Phép"` dẫn đến trang hoặc mở modal tạo đơn. | Kết nối ngữ cảnh chuyên cần TM-25 và nghỉ phép TM-28 liền mạch. |

### 2.3. Danh Mục Thành Phần Mới Cần Xây Dựng

Các component được phân rã theo Domain-Driven Modular tại `src/pages/intern/leave/` và `src/pages/mentor/leave/`:

1. **Phân hệ Thực tập sinh (`src/pages/intern/leave/`):**
   - `InternLeavePage.tsx`: Trang chính quản lý đơn nghỉ phép cá nhân (chuẩn Standard Page Composition 4 lớp).
   - `InternLeavePage.module.css`: Định kiểu CSS Modules cô lập phạm vi.
   - `components/LeaveSummaryCards/`: 4 Thẻ KPI thống kê số đơn và ngày nghỉ (Tổng đơn, Chờ duyệt, Đã duyệt, Bị từ chối/Đã hủy).
   - `components/LeaveRequestTable/`: Bảng dữ liệu danh sách đơn, tối đa 10 dòng/trang, tự ẩn phân trang khi `<= 10 dòng`, cột thao tác ghim cố định (`sticky right`).
   - `components/CreateLeaveModal/`: Modal 3 khối nộp đơn xin nghỉ phép mới (chọn loại nghỉ, khung thời gian, tính trước số ngày công preview, validation lý do và link đính kèm).
   - `components/LeaveDetailModal/`: Modal 3 khối xem chi tiết đơn, timeline xử lý, lời dặn của người duyệt hoặc lý do từ chối.
   - `components/CancelLeaveConfirmModal/`: Destructive Confirmation Modal xác nhận hủy đơn khi còn `PENDING` (Rule 33).
   - `hooks/useInternLeaveRequests.ts`: Custom hook quản lý state dữ liệu, bộ lọc và mutations (giới hạn tối đa 3-4 useState).

2. **Phân hệ Duyệt đơn Mentor / HR (`src/pages/mentor/leave/`):**
   - `MentorLeaveApprovalPage.tsx`: Trang duyệt đơn dành cho Mentor/HR.
   - `components/LeaveApprovalModal/`: Modal duyệt đơn với 2 hành động: Phê duyệt (nhập lời dặn tùy chọn) hoặc Từ chối (bắt buộc nhập lý do từ 5 đến 500 ký tự).
   - `hooks/useLeaveApproval.ts`: Custom hook quản lý danh sách đơn chờ duyệt và các thao tác duyệt/từ chối.

---

## 3. Triết Lý Thiết Kế Visual & UX (Áp Dụng Skill Frontend Design & 08-ui-ux-guidelines.md)

### 3.1. Bản Sắc Thiết Kế (Subject Matter Identity)
- **Tư duy thiết kế:** Tối giản, trang nhã, tin cậy (Minimalist Enterprise Workspace). Trải nghiệm tương tự các sản phẩm quản trị nhân sự hiện đại như BambooHR, Deel, Linear.
- **Tính nhân bản & minh bạch:**
  - Thực tập sinh nắm rõ tiến trình xét duyệt của đơn (ai là người duyệt, duyệt lúc nào, lời dặn là gì).
  - Tự động tính toán số ngày nghỉ làm việc (`Working Days`) loại trừ Thứ Bảy và Chủ Nhật ngay trên giao diện tạo đơn để TTS không bị bối rối về số công.
- **Tránh xa các lỗi rập khuôn AI:**
  - Không dùng viền bóng xám đậm thô bạo; dùng viền `1px solid var(--border-default)`.
  - Không dùng gradient màu mè che khuất thông tin.
  - Sử dụng Sentence case tiếng Việt chuẩn mực ("Chờ xét duyệt", "Đã phê duyệt", "Bị từ chối", "Đã hủy bỏ").
  - Đảm bảo độ tương phản chữ WCAG AA (>= 4.5:1).

### 3.2. Bảng Màu Ngữ Nghĩa (Semantic Design Tokens từ `src/index.css`)

> [!CAUTION]
> **CẤM HARDCODE MÃ MÀU HEX (RULE 28)**: 100% màu sắc phải dùng biến CSS Variables từ `src/index.css`. Nghiêm cấm xuất hiện mã hex `#...` trong các file `.module.css`.

| Thành phần | Token Sử Dụng | Light Mode | Dark Mode (`[data-theme='dark']`) | Ý Nghĩa Ngữ Nghĩa |
| :--- | :--- | :--- | :--- | :--- |
| **Nền ứng dụng** | `var(--bg-body)` | `#f8fafc` | `#090d16` | Nền tổng thể trang |
| **Nền Thẻ & Modal** | `var(--bg-card)` / `var(--bg-surface)` | `#ffffff` | `#131d33` | Bề mặt hiển thị thẻ thống kê, bảng và modal |
| **Đường viền mặc định** | `var(--border-default)` | `#e2e8f0` | `#26354a` | Viền mảnh 1px phân cách các khối |
| **Chữ tiêu đề chính** | `var(--text-main)` | `#0f172a` | `#f8fafc` | Chữ sắc nét, độ tương phản cao đạt WCAG AA |
| **Chữ phụ / nhãn** | `var(--text-secondary)` | `#475569` | `#cbd5e1` | Nhãn form, mô tả phụ |
| **Chữ mờ / placeholder**| `var(--text-muted)` | `#94a3b8` | `#64748b` | Timestamp, placeholder ô nhập liệu |
| **Trạng thái PENDING** | `var(--warning)` & `rgba(245, 158, 11, 0.12)` | `#f59e0b` | `#fbbf24` | Chờ duyệt - Màu vàng cam hổ phách dịu |
| **Trạng thái APPROVED**| `var(--success)` & `rgba(16, 185, 129, 0.12)` | `#10b981` | `#34d399` | Đã duyệt - Màu xanh ngọc bích tin cậy |
| **Trạng thái REJECTED**| `var(--danger)` & `rgba(239, 68, 68, 0.12)` | `#ef4444` | `#f87171` | Bị từ chối - Màu đỏ san hô nhạt cảnh báo |
| **Trạng thái CANCELLED**| `var(--text-muted)` & `var(--border-subtle)` | `#64748b` | `#94a3b8` | Đã hủy - Màu xám trung tính |
| **Nút Focus Glow (Rule 30)**| `box-shadow: 0 0 0 3px var(--primary-glow)` | Viền đổi sang `var(--primary)` kèm hào quang ánh sáng bao quanh |

### 3.3. Typography & Hệ Thống Khoảng Cách 8pt Grid
- **Tiêu đề trang & Tên khối:** Font `Outfit`, `font-weight: 600/700`, `letter-spacing: -0.01em`.
- **Nội dung bảng & Chi tiết:** Font `Inter`, `font-weight: 400` cho mô tả, `font-weight: 500/600` cho tiêu đề và mã đơn, `font-size: 14px`, `line-height: 1.5`.
- **Hệ thống khoảng cách 8pt:**
  - `4px (0.25rem)`: Gap icon và text nhỏ trong badge.
  - `8px (0.5rem)`: Gap giữa các nút hành động nhỏ.
  - `12px (0.75rem)`: Padding ô input, select control.
  - `16px (1rem)`: Padding thẻ KPI, hàng bảng dữ liệu.
  - `24px (1.5rem)`: Khoảng cách giữa các khối nội dung và padding modal.

---

## 4. Kiến Trúc Trải Nghiệm Người Dùng (UX Wireframes & Standard Page Composition)

Tuân thủ chuẩn **Standard Page Composition 4 lớp** (Rule 20):
1. **Lớp 1: Page Header & Action Bar:** Tiêu đề trang, phụ đề và nút hành động chính **`"+ Tạo Đơn Xin Nghỉ Phép"`** (`variant="primary"`).
2. **Lớp 2: Filter Toolbar & KPI Metrics Strip:** 4 thẻ KPI tóm tắt số liệu chuyên cần nghỉ phép, thanh công cụ lọc trạng thái (`Tất cả`, `Chờ duyệt`, `Đã duyệt`, `Bị từ chối`, `Đã hủy`) và lọc theo năm.
3. **Lớp 3: Content Data Table:** Bảng danh sách đơn nghỉ phép tối đa 10 dòng, tự động ẩn phân trang khi `<= 10 dòng` (Rule 31).
4. **Lớp 4: Modals Layer (Modal-First UX):** `CreateLeaveModal`, `LeaveDetailModal`, `CancelLeaveConfirmModal`.

### 4.1. Bố Cục Tổng Thể Màn Hình TTS (`InternLeavePage`)

```text
+---------------------------------------------------------------------------------------------------+
| [Header] Quản Lý Đơn Xin Nghỉ Phép (Intern Leave Requests)                                        |
| Nộp đơn xin nghỉ có lý do chính đáng, theo dõi tiến trình phê duyệt của Mentor và lịch sử nghỉ    |
|                                                          [ ⟳ Làm mới ]  [ + Tạo Đơn Xin Nghỉ Phép ]|
+---------------------------------------------------------------------------------------------------+
| [Lớp 2: 4 Thẻ KPI Tóm Tắt Nghỉ Phép]                                                              |
| +--------------------+ +--------------------+ +--------------------+ +--------------------+       |
| | 📄 TỔNG SỐ ĐƠN     | | ⏳ CHỜ XÉT DUYỆT   | | ✓ ĐÃ ĐƯỢC DUYỆT    | | 📅 SỐ NGÀY ĐÃ NGHỈ |       |
| |      5 đơn         | |      1 đơn         | |      3 đơn         | |     2.5 ngày công  |       |
| +--------------------+ +--------------------+ +--------------------+ +--------------------+       |
+---------------------------------------------------------------------------------------------------+
| [Lớp 2: Filter Toolbar]                                                                           |
| [ Trạng thái: Tất cả ▼ ]  [ Năm: 2026 ▼ ]                                [ Đặt lại bộ lọc ]       |
+---------------------------------------------------------------------------------------------------+
| [Lớp 3: Data Table - Tối đa 10 dòng/trang]                                                        |
| +-----------------------------------------------------------------------------------------------+ |
| | MÃ ĐƠN | LOẠI NGHỈ       | KHUNG THỜI GIAN | TỪ NGÀY ➔ ĐẾN NGÀY | SỐ NGÀY | TRẠNG THÁI | THAO TÁC   | |
| +--------+-----------------+-----------------+--------------------+---------+------------+----------+ |
| | #LR-12 | 🎓 Thi cử đồ án | Cả ngày         | 15/10/26 ➔ 16/10/26| 2.0 ngày| [CHỜ DUYỆT]| [Xem][Hủy] | |
| | #LR-10 | 🏥 Khám bệnh    | Buổi sáng       | 02/10/26 ➔ 02/10/26| 0.5 ngày| [ĐÃ DUYỆT] | [Xem]    | |
| | #LR-08 | 🏠 Việc gia đình| Cả ngày         | 20/09/26 ➔ 20/09/26| 1.0 ngày| [ĐÃ DUYỆT] | [Xem]    | |
| | #LR-05 | 📌 Lý do khác   | Buổi chiều      | 10/09/26 ➔ 10/09/26| 0.5 ngày| [TỪ CHỐI]  | [Xem]    | |
| | #LR-01 | 🏠 Việc riêng   | Cả ngày         | 05/08/26 ➔ 05/08/26| 1.0 ngày| [ĐÃ HỦY]   | [Xem]    | |
| +-----------------------------------------------------------------------------------------------+ |
| [Thanh Phân Trang - Tự động ẩn khi tổng số đơn <= 10]                                             |
+---------------------------------------------------------------------------------------------------+
```

---

## 5. Quy Chuẩn Modal-First UX (Quy Tắc 29, 30 & 33)

Toàn bộ thao tác nộp đơn, xem chi tiết và hủy đơn được thực hiện ngay trên trang hiện tại qua Modal. Không chuyển trang, bảo toàn 100% bộ lọc và vị trí phân trang.

### 5.1. Modal Nộp Đơn Xin Nghỉ Phép (`CreateLeaveModal`)

- **Kích thước modal:** `size="lg"` (680px - 720px).
- **Cấu trúc 3 khối bắt buộc (Rule 29):**
  - **Khối 1: Header cố định:**
    - Icon `CalendarPlus` màu `var(--primary)`.
    - Tiêu đề: `"Tạo Đơn Xin Nghỉ Phép Mới"`.
    - Phụ đề: *"Vui lòng cung cấp đầy đủ lý do chính đáng và thời gian xin nghỉ để Mentor xem xét."*
    - Nút đóng `X` có `aria-label="Đóng modal"`.
  - **Khối 2: Body cuộn độc lập (`overflow-y: auto`):**
    - **Hộp lưu ý chính sách:**
      > *"Đơn xin nghỉ phép cần được gửi trước ngày nghỉ dự kiến. Nếu nghỉ từ 2 ngày trở lên, vui lòng trao đổi trước với Mentor phụ trách."*
    - **Trường Loại nghỉ phép (`leaveType` - Bắt buộc):**
      - Dropdown `<Select>` với 5 tùy chọn:
        - `SICK`: Nghỉ ốm đau / Khám bệnh
        - `PERSONAL`: Nghỉ việc riêng cá nhân
        - `ACADEMIC_EXAM`: Nghỉ thi cử / Đồ án tốt nghiệp
        - `BEREAVEMENT`: Nghỉ việc gia đình / Tang lễ
        - `OTHER`: Lý do chính đáng khác
    - **Trường Khung thời gian (`durationType` - Bắt buộc):**
      - Dropdown `<Select>` hoặc Radio Tabs:
        - `FULL_DAY`: Cả ngày (08:00 - 17:30)
        - `MORNING`: Buổi sáng (08:00 - 12:00)
        - `AFTERNOON`: Buổi chiều (13:30 - 17:30)
      - **Logic tự động khóa ngày:** Nếu chọn `MORNING` hoặc `AFTERNOON`, hệ thống tự động gán `endDate = startDate` và vô hiệu hóa ô chọn `endDate` (kèm chú thích: *"Nghỉ nửa ngày chỉ áp dụng trong cùng 1 ngày làm việc"*).
    - **Khối chọn Ngày bắt đầu (`startDate`) & Ngày kết thúc (`endDate`):**
      - Grid 2 cột: `<Input type="date">` cho ngày bắt đầu và ngày kết thúc.
      - Tối thiểu: Không được chọn ngày trong quá khứ quá 7 ngày (trừ trường hợp nghỉ ốm đột xuất).
      - Ràng buộc: `startDate <= endDate`.
    - **Hộp tính toán tự động số ngày công (Live Working Days Preview):**
      - Hiển thị badge nổi bật: **`Dự kiến nghỉ: X ngày công làm việc`** (Tự động trừ Thứ Bảy và Chủ Nhật).
      - Nếu rơi hoàn toàn vào ngày nghỉ cuối tuần: Cảnh báo *"Khoảng thời gian bạn chọn rơi vào cuối tuần (không có ca làm việc tiêu chuẩn)"*.
    - **Trường Lý do xin nghỉ (`reason` - Bắt buộc):**
      - Textarea từ 10 đến 500 ký tự. Có bộ đếm ký tự `(X / 500)`.
      - Placeholder: *"Nêu rõ lý do cụ thể bạn xin nghỉ (tối thiểu 10 ký tự)..."*
      - Validation: Bắt lỗi đỏ ngay dưới ô nhập nếu `< 10` ký tự khi submit hoặc blur.
    - **Trường Tài liệu / Minh chứng (`attachmentUrl` - Tùy chọn):**
      - `<Input>` nhập đường dẫn (Google Drive, hình ảnh giấy báo thi, đơn thuốc...).
      - Placeholder: `https://drive.google.com/...`
  - **Khối 3: Sticky Footer cố định ở đáy:**
    - Nút **`"Hủy bỏ"`** (`variant="outline"`, đóng modal).
    - Nút **`"Gửi Đơn Xin Nghỉ"`** (`variant="primary"`, có icon `Send` và spinner loading khi submit).
- **Cơ chế chống mất dữ liệu (Safe Dismissal Guard):** Khi người dùng đã nhập lý do hoặc chọn ngày (`isDirty`), click vào backdrop nền sẽ không làm tắt modal để tránh mất thông tin vô ý.

```text
+-----------------------------------------------------------------------+
| [Header] 📅 Tạo Đơn Xin Nghỉ Phép Mới                             [X] |
| Điền thông tin và lý do chính đáng để gửi Mentor phụ trách duyệt     |
+-----------------------------------------------------------------------+
| [Body - Scrollable]                                                   |
| ℹ Đơn xin nghỉ phép cần được gửi sớm để Mentor tiện sắp xếp công việc. |
|                                                                       |
| Loại nghỉ phép (*):                                                   |
| [ Nghỉ thi cử / Đồ án tốt nghiệp                                  ▼ ] |
|                                                                       |
| Khung thời gian (*):                                                  |
| (•) Cả ngày          ( ) Nửa ngày buổi sáng      ( ) Nửa ngày buổi chiều |
|                                                                       |
| Ngày bắt đầu (*):                     Ngày kết thúc (*):              |
| [ 15/10/2026            📅 ]          [ 16/10/2026             📅 ]   |
|                                                                       |
| 💡 Dự kiến nghỉ: 2.0 ngày công (Loại trừ Thứ 7 & Chủ Nhật)             |
|                                                                       |
| Lý do xin nghỉ (*) (10 - 500 ký tự):                       (85 / 500) |
| +-------------------------------------------------------------------+ |
| | Em xin phép nghỉ để tham gia kỳ thi vấn đáp tốt nghiệp chuyên     | |
| | ngành Công nghệ Thông tin tại Trường Đại học Bách Khoa.           | |
| +-------------------------------------------------------------------+ |
|                                                                       |
| Link tài liệu / Minh chứng đính kèm (Tùy chọn):                       |
| [ https://drive.google.com/file/d/lich-thi-tot-nghiep...           ]  |
+-----------------------------------------------------------------------+
| [Sticky Footer]                                                       |
|                                  [ Hủy bỏ ]   [ Gửi Đơn Xin Nghỉ ➔ ]  |
+-----------------------------------------------------------------------+
```

### 5.2. Modal Xem Chi Tiết Đơn Nghỉ Phép (`LeaveDetailModal`)

- **Kích thước modal:** `size="md"` (580px - 620px).
- **Cấu trúc 3 khối:**
  - **Khối 1: Header cố định:**
    - Badge trạng thái: `[CHỜ DUYỆT]` / `[ĐÃ DUYỆT]` / `[BỊ TỪ CHỐI]` / `[ĐÃ HỦY]`.
    - Tiêu đề: `"Chi Tiết Đơn Xin Nghỉ Phép #LR-{id}"`.
    - Phụ đề: Ngày tạo đơn (`formatDateTime(createdAt)`).
    - Nút đóng `X`.
  - **Khối 2: Body cuộn độc lập:**
    - **Thông tin người làm đơn:** Mã TTS, Họ tên, Email, Số điện thoại.
    - **Thông tin kỳ nghỉ (Grid 2 cột):**
      - Loại nghỉ phép: Tên loại + Mô tả tiếng Việt.
      - Khung thời gian: Cả ngày / Buổi sáng / Buổi chiều.
      - Thời gian nghỉ: `Từ DD/MM/YYYY đến DD/MM/YYYY`.
      - Tổng số ngày công tính: `totalDays` ngày.
    - **Lý do xin nghỉ:** Hộp text nền dịu hiển thị đầy đủ nội dung lý do.
    - **Tài liệu minh chứng (nếu có):** Link liên kết ngoài mở tab mới (`target="_blank"`).
    - **Tiến trình xét duyệt (Approval Progress Timeline):**
      - Nếu `PENDING`: Hiện chỉ báo đang chờ Mentor phê duyệt.
      - Nếu `APPROVED`: Hiện icon xanh `CheckCircle`, tên Người duyệt (`approverName`), Thời điểm duyệt (`approvedAt`), và Lời dặn / Ghi chú của người duyệt (`approvalNote`).
      - Nếu `REJECTED`: Hiện icon đỏ `XCircle`, tên Người từ chối (`approverName`), Thời điểm từ chối, và **Lý do từ chối bắt buộc (`rejectionReason`)**.
      - Nếu `CANCELLED`: Hiện icon xám `AlertCircle`, thời điểm hủy đơn (`cancelledAt`).
  - **Khối 3: Sticky Footer:**
    - Nút `"Đóng"` (`variant="outline"`).
    - Nếu đơn đang ở trạng thái `PENDING` và người xem là chính TTS chủ đơn: Footer hiển thị thêm nút **`"Hủy Đơn Này"`** (`variant="danger"`).

### 5.3. Confirmation Modal Hủy Đơn Nguy Hiểm (`CancelLeaveConfirmModal` - Rule 33)

- **Mục đích:** Ngăn chặn việc bấm nhầm làm hủy đơn đang chờ duyệt. Nghiêm cấm dùng `window.confirm()`.
- **Thiết kế:**
  - Tiêu đề: `"Xác Nhận Hủy Đơn Xin Nghỉ Phép"`.
  - Icon cảnh báo: `AlertTriangle` màu `var(--danger)`.
  - Nội dung: *"Bạn có chắc chắn muốn hủy đơn xin nghỉ phép từ ngày **{startDate}** đến ngày **{endDate}** ({totalDays} ngày công)? Hành động này không thể hoàn tác."*
  - Nút bấm:
    - `"Giữ Lại Đơn"` (`variant="outline"`).
    - `"Xác Nhận Hủy Đơn"` (`variant="danger"`, có loading spinner).

### 5.4. Modal Xét Duyệt Đơn Dành Cho Mentor / HR (`LeaveApprovalModal`)

- **Kích thước modal:** `size="lg"` (640px).
- **Mục đích:** Cho phép Mentor/HR xem xét đơn của TTS, sau đó thực hiện 1 trong 2 hành động:
  1. **Phê duyệt (`Approve`):** Có ô nhập Lời dặn / Ghi chú phê duyệt (`approvalNote`, tùy chọn, tối đa 500 ký tự). Bấm nút `"Phê Duyệt Đơn"` (`variant="success"`).
  2. **Từ chối (`Reject`):** Chuyển sang form từ chối, **bắt buộc nhập Lý do từ chối** (`rejectionReason` từ 5 đến 500 ký tự). Bấm nút `"Xác Nhận Từ Chối"` (`variant="danger"`).

---

## 6. Xử Lý 5 Trạng Thái Giao Diện Bắt Buộc (Rule 32)

Toàn bộ bảng dữ liệu và khối KPI bắt buộc xử lý đầy đủ 5 trạng thái giao diện:

| STT | Trạng thái giao diện | Quy chuẩn thực thi trực quan (Visual Specification) |
| :---: | :--- | :--- |
| **1** | **Loading State (Đang tải)** | Cấm chữ `"Loading..."` thô sơ. Bắt buộc hiển thị **Skeleton Shimmer** mô phỏng 4 thẻ KPI và 5 hàng bảng dữ liệu với các khối xám nhấp nháy êm dịu, giữ nguyên chiều cao chuẩn để triệt tiêu hiện tượng giật layout (CLS = 0). |
| **2** | **Empty State (Chưa có dữ liệu)** | - **Khi TTS chưa từng nộp đơn nào:** Icon minh họa `CalendarOff` + Tiêu đề `"Bạn chưa có đơn xin nghỉ phép nào"` + Hướng dẫn *"Khi cần nghỉ ốm, thi cử hoặc việc riêng, bạn có thể tạo đơn tại đây để gửi Mentor xem xét."* + Nút CTA `variant="primary"`: **`"+ Tạo Đơn Xin Nghỉ Mới"`**.<br>- **Khi bộ lọc không tìm thấy kết quả:** Tiêu đề `"Không tìm thấy đơn phù hợp"` + Hướng dẫn *"Thử thay đổi bộ lọc trạng thái hoặc năm."* + Nút CTA `variant="outline"`: **`"Đặt lại bộ lọc"`**. |
| **3** | **Error State (Lỗi kết nối / Máy chủ)** | Hiển thị thông báo lỗi `Alert` biến thể `error` (`var(--danger)` nhạt) nêu rõ nguyên nhân và nút **`"Thử lại"`** (`variant="outline"`) để gọi lại `refetch()`. |
| **4** | **Success State (Thành công)** | Hiển thị Toast thông báo qua thư viện `sonner` góc trên bên phải: *"Nộp đơn xin nghỉ phép thành công. Đơn đã được chuyển tới Mentor phụ trách."*, *"Đã hủy đơn xin nghỉ phép thành công."*, *"Phê duyệt đơn thành công."*. Tự động đóng modal và gọi `refetch()` làm mới bảng. |
| **5** | **Disabled State (Vô hiệu hóa)** | Trong quá trình gửi request API (`isSubmitting = true` hoặc `isCancelling = true`), toàn bộ nút bấm trong modal bị vô hiệu hóa (`disabled`, `pointer-events: none`), đổi cursor thành `not-allowed`, hiển thị spinner con để ngăn chặn hoàn toàn lỗi **Double-Click**. |

---

## 7. Cơ Chế Bảo Mật & Ràng Buộc Nghiệp Vụ (RBAC & IDOR Mitigations)

1. **Bảo vệ phân quyền RBAC tại Frontend:**
   - Trang `/intern/leave-requests`: Chỉ tài khoản có role `INTERN` hoặc `USER` mới được truy cập.
   - Trang `/mentor/leave-requests`: Dành riêng cho `MENTOR`, `HR`, `ADMIN`.
2. **Bảo vệ IDOR tại tầng Frontend (Client-side IDOR Guard):**
   - Nút `"Hủy đơn"` chỉ hiển thị trên những đơn mà `internId` trùng khớp với ID của TTS đang đăng nhập và đơn đang ở trạng thái `PENDING`.
   - Nếu Backend trả về `403 Forbidden` (do IDOR hoặc đơn đã được duyệt trước đó): Frontend bắt lỗi, hiển thị Toast cảnh báo rõ ràng: *"Bạn không có quyền thao tác trên đơn này hoặc đơn đã thay đổi trạng thái."*, đồng thời tải lại bảng dữ liệu mới nhất.
3. **Bảo toàn dữ liệu khi có lỗi (Error Mutation UX - Rule 24):**
   - Khi submit form tạo đơn thất bại (ví dụ: trùng khoảng thời gian, lý do quá ngắn): Giữ nguyên Modal và toàn bộ dữ liệu người dùng đã gõ, bôi đỏ trường bị lỗi để người dùng sửa đổi, **tuyệt đối không đóng modal làm mất dữ liệu**.

---

## 8. Kiến Trúc Kỹ Thuật & Cấu Trúc Tệp Tin (Domain-Driven Architecture)

Tuân thủ kiến trúc phân tầng chuẩn Domain-Driven Modular (Rule 18, 19, 20):

```text
src/
├── constants/
│   ├── endpoints/
│   │   ├── leave.endpoints.ts                  # URL endpoints: LEAVE_ENDPOINTS
│   │   └── index.ts                            # Export tập trung
│   └── routes/
│       ├── intern.routes.ts                    # Thêm LEAVE_REQUESTS: '/intern/leave-requests'
│       ├── mentor.routes.ts                    # Thêm LEAVE_REQUESTS: '/mentor/leave-requests'
│       └── index.ts
├── types/
│   ├── leave.types.ts                          # Toàn bộ Enums & DTOs cho Leave Domain
│   └── index.ts
├── services/
│   ├── leaveService.ts                         # Axios 4 tầng gọi API có AbortSignal
│   └── index.ts
├── pages/
│   └── intern/
│       └── leave/
│           ├── InternLeavePage.tsx             # Standard Page Composition 4 lớp
│           ├── InternLeavePage.module.css
│           ├── components/
│           │   ├── LeaveSummaryCards/
│           │   │   ├── LeaveSummaryCards.tsx
│           │   │   ├── LeaveSummaryCards.types.ts
│           │   │   ├── LeaveSummaryCards.module.css
│           │   │   └── index.ts
│           │   ├── LeaveRequestTable/
│           │   │   ├── LeaveRequestTable.tsx   # Tối đa 10 dòng, tự ẩn phân trang
│           │   │   ├── LeaveRequestTable.types.ts
│           │   │   ├── LeaveRequestTable.module.css
│           │   │   └── index.ts
│           │   ├── CreateLeaveModal/
│           │   │   ├── CreateLeaveModal.tsx    # Modal 3 khối nộp đơn
│           │   │   ├── CreateLeaveModal.types.ts
│           │   │   ├── CreateLeaveModal.module.css
│           │   │   └── index.ts
│           │   ├── LeaveDetailModal/
│           │   │   ├── LeaveDetailModal.tsx    # Modal xem chi tiết
│           │   │   ├── LeaveDetailModal.types.ts
│           │   │   ├── LeaveDetailModal.module.css
│           │   │   └── index.ts
│           │   ├── CancelLeaveConfirmModal/
│           │   │   ├── CancelLeaveConfirmModal.tsx # Confirmation modal nguy hiểm
│           │   │   ├── CancelLeaveConfirmModal.types.ts
│           │   │   ├── CancelLeaveConfirmModal.module.css
│           │   │   └── index.ts
│           │   └── index.ts
│           ├── hooks/
│           │   ├── useInternLeaveRequests.ts   # Custom hook (<= 3-4 useState)
│           │   └── index.ts
│           └── index.ts
└── routes/
    └── AppRoutes.tsx                           # Đăng ký routes mới
```

---

## 9. Định Nghĩa Kiểu Dữ Liệu TypeScript (TypeScript DTOs Contract)

Khớp 100% với DTOs của Backend TM-28 (`LeaveRequestController`, `CreateLeaveRequest`, `LeaveRequestResponse`):

```typescript
// src/types/leave.types.ts

/**
 * Phân loại lý do xin nghỉ phép (Khớp LeaveType trong Java)
 */
export type LeaveType =
  | 'SICK'           // Nghỉ ốm đau / Khám bệnh
  | 'PERSONAL'       // Nghỉ việc riêng cá nhân
  | 'ACADEMIC_EXAM'  // Nghỉ thi cử / Đồ án tốt nghiệp
  | 'BEREAVEMENT'    // Nghỉ việc gia đình / Tang lễ
  | 'OTHER';         // Lý do chính đáng khác

/**
 * Khung thời gian xin nghỉ phép (Khớp LeaveDurationType trong Java)
 */
export type LeaveDurationType =
  | 'FULL_DAY'       // Cả ngày (08:00 - 17:30)
  | 'MORNING'        // Nửa ngày buổi sáng (08:00 - 12:00)
  | 'AFTERNOON';     // Nửa ngày buổi chiều (13:30 - 17:30)

/**
 * Trạng thái xét duyệt đơn xin nghỉ phép (Khớp LeaveStatus trong Java)
 */
export type LeaveStatus =
  | 'PENDING'        // Chờ xét duyệt
  | 'APPROVED'       // Đã phê duyệt
  | 'REJECTED'       // Bị từ chối
  | 'CANCELLED';     // Đã hủy bỏ

/**
 * Request DTO khi Thực tập sinh nộp đơn mới (POST /api/v1/leave-requests)
 */
export interface CreateLeaveRequest {
  leaveType: LeaveType;
  durationType: LeaveDurationType;
  startDate: string;         // Định dạng YYYY-MM-DD
  endDate: string;           // Định dạng YYYY-MM-DD
  reason: string;            // Từ 10 đến 500 ký tự
  attachmentUrl?: string;    // Tùy chọn, tối đa 500 ký tự
}

/**
 * Request DTO khi Mentor / HR duyệt đơn (PATCH /api/v1/leave-requests/{id}/approve)
 */
export interface ApproveLeaveRequest {
  approvalNote?: string;     // Tùy chọn, tối đa 500 ký tự
}

/**
 * Request DTO khi Mentor / HR từ chối đơn (PATCH /api/v1/leave-requests/{id}/reject)
 */
export interface RejectLeaveRequest {
  rejectionReason: string;   // Bắt buộc, từ 5 đến 500 ký tự
}

/**
 * Response DTO rút gọn cho danh sách bảng (LeaveRequestSummaryResponse trong Java)
 */
export interface LeaveRequestSummaryResponse {
  id: number;
  internId: number;
  internCode: string;
  internName: string;
  leaveType: LeaveType;
  leaveTypeDescription: string;
  durationType: LeaveDurationType;
  durationTypeDescription: string;
  startDate: string;
  endDate: string;
  totalDays: number;         // 0.5, 1.0, 2.0...
  reason: string;
  status: LeaveStatus;
  statusDescription: string;
  approverName?: string | null;
  approvedAt?: string | null;
  createdAt: string;
}

/**
 * Response DTO chi tiết đầy đủ của đơn xin nghỉ phép (LeaveRequestResponse trong Java)
 */
export interface LeaveRequestResponse extends LeaveRequestSummaryResponse {
  internEmail?: string;
  internPhone?: string;
  attachmentUrl?: string | null;
  approverId?: number | null;
  rejectionReason?: string | null;
  approvalNote?: string | null;
  cancelledAt?: string | null;
  updatedAt: string;
}

/**
 * Thông số lọc danh sách đơn của Thực tập sinh
 */
export interface LeaveRequestFilterParams {
  status?: LeaveStatus;
  year?: number;
  page?: number;
  size?: number;
}
```

---

## 10. Định Nghĩa URL Endpoints & Service Contract

### 10.1. Constants Endpoints (`src/constants/endpoints/leave.endpoints.ts`)

```typescript
export const LEAVE_ENDPOINTS = {
  BASE: '/api/v1/leave-requests',
  MY_REQUESTS: '/api/v1/leave-requests/my-requests',
  PENDING: '/api/v1/leave-requests/pending',
  DETAIL: (id: number | string) => `/api/v1/leave-requests/${id}`,
  CANCEL: (id: number | string) => `/api/v1/leave-requests/${id}/cancel`,
  APPROVE: (id: number | string) => `/api/v1/leave-requests/${id}/approve`,
  REJECT: (id: number | string) => `/api/v1/leave-requests/${id}/reject`,
} as const;
```

### 10.2. Service Contract (`src/services/leaveService.ts`)

```typescript
// Tuân thủ kiến trúc Axios 4 tầng, hỗ trợ AbortSignal cho mọi request

export const leaveService = {
  // TTS nộp đơn mới
  createLeaveRequest: (data: CreateLeaveRequest, signal?: AbortSignal): Promise<LeaveRequestResponse> => ...

  // TTS lấy lịch sử đơn của mình (phân trang 0-indexed)
  getMyLeaveRequests: (params?: LeaveRequestFilterParams, signal?: AbortSignal): Promise<PageResponse<LeaveRequestSummaryResponse>> => ...

  // TTS chủ động hủy đơn
  cancelLeaveRequest: (id: number, signal?: AbortSignal): Promise<LeaveRequestResponse> => ...

  // Xem chi tiết đơn bất kỳ (TTS, Mentor, HR)
  getLeaveRequestDetail: (id: number, signal?: AbortSignal): Promise<LeaveRequestResponse> => ...

  // Mentor / HR lấy danh sách đơn chờ duyệt
  getPendingRequests: (page?: number, size?: number, signal?: AbortSignal): Promise<PageResponse<LeaveRequestSummaryResponse>> => ...

  // Mentor / HR duyệt đơn
  approveLeaveRequest: (id: number, data?: ApproveLeaveRequest, signal?: AbortSignal): Promise<LeaveRequestResponse> => ...

  // Mentor / HR từ chối đơn
  rejectLeaveRequest: (id: number, data: RejectLeaveRequest, signal?: AbortSignal): Promise<LeaveRequestResponse> => ...
};
```

---

## 11. Tiêu Chuẩn Đa Thiết Bị & Khả Năng Tiếp Cận (Responsive & Accessibility WCAG AA)

- **Desktop (>= 1024px):**
  - Khung sườn App Shell cố định, bảng cuộn ngang cục bộ nếu nhiều cột.
  - Cột Mã Đơn bên trái và Cột Thao Tác bên phải luôn ghim cố định (`sticky`) khi cuộn ngang.
  - Thanh cuộn siêu mảnh Custom Sleek Scrollbar (6px-8px) bo tròn 9999px theo Quy tắc 34.
- **Mobile (< 768px):**
  - Tự động chuyển đổi bảng dữ liệu sang **Danh Sách Dạng Thẻ Card dọc**. Mỗi thẻ hiển thị đầy đủ thông tin: Mã đơn, Badge trạng thái, Khoảng thời gian, Số ngày công và các nút bấm lớn dễ thao tác bằng ngón tay (Touch target >= 44px x 44px).
- **Khả năng tiếp cận (Accessibility - WCAG AA):**
  - Hỗ trợ đóng Modal bằng phím `Escape`.
  - Hỗ trợ submit form bằng phím `Enter` khi đang focus trên input hợp lệ.
  - Độ tương phản chữ đạt chuẩn WCAG AA (>= 4.5:1).
  - Thuộc tính `aria-label` cho toàn bộ nút icon-only (nút xem, nút hủy, nút đóng X).

---

## 12. Kế Hoạch Kiểm Thử Nghiệm Thu (Acceptance Criteria & Test Matrix)

| Mã test | Kịch bản kiểm thử | Hành vi kỳ vọng (Expected Behavior) | Kết quả |
| :---: | :--- | :--- | :---: |
| **TC-01** | Truy cập trang Quản lý đơn nghỉ phép từ Sidebar | Đăng nhập tài khoản TTS (`ROLE_INTERN`), click menu `"Đơn Xin Nghỉ Phép"`. Chuyển hướng đến `/intern/leave-requests`. Hiển thị Skeleton shimmer rồi tải dữ liệu thẻ KPI và bảng lịch sử đơn. | Chờ duyệt |
| **TC-02** | Xem danh sách đơn nghỉ phép cá nhân | Bảng hiển thị danh sách đơn của chính tài khoản đăng nhập. Tối đa 10 dòng/trang. Tự động ẩn thanh phân trang khi tổng số đơn `<= 10`. | Chờ duyệt |
| **TC-03** | Mở Modal tạo đơn và kiểm tra Preview ngày công | Click nút `"+ Tạo Đơn Xin Nghỉ Phép"`. Mở `CreateLeaveModal`. Chọn từ 15/10/2026 đến 16/10/2026 (Thứ 5 - Thứ 6). Hộp tính toán hiển thị: `Dự kiến nghỉ: 2.0 ngày công`. | Chờ duyệt |
| **TC-04** | Kiểm tra logic khóa ngày khi chọn nghỉ nửa ngày | Chọn `durationType` là `Buổi sáng (MORNING)`. Ô `endDate` tự động nhận giá trị của `startDate` và bị disabled. Preview hiển thị: `Dự kiến nghỉ: 0.5 ngày công`. | Chờ duyệt |
| **TC-05** | Validation form tạo đơn (Lý do < 10 ký tự) | Nhập lý do 5 ký tự và bấm `"Gửi Đơn"`. Hiển thị lỗi đỏ: *"Lý do xin nghỉ phải từ 10 đến 500 ký tự"*. Modal giữ nguyên, không đóng và không mất dữ liệu. | Chờ duyệt |
| **TC-06** | Nộp đơn thành công | Nhập lý do hợp lệ (> 10 ký tự), bấm `"Gửi Đơn"`. Gọi `POST /api/v1/leave-requests`. Toast thông báo thành công: *"Nộp đơn xin nghỉ phép thành công. Đơn của bạn đã được gửi tới Mentor phụ trách."*. Đóng modal, bảng tự động refetch thêm đơn mới ở trạng thái `PENDING`. | Chờ duyệt |
| **TC-07** | Xem chi tiết đơn nghỉ phép | Click nút `"Xem"` trên hàng đơn bất kỳ. Mở `LeaveDetailModal` hiển thị đầy đủ thông tin: Mã đơn, Loại nghỉ, Thời gian, Số ngày công, Lý do chi tiết, Lời dặn của người duyệt. | Chờ duyệt |
| **TC-08** | Hủy đơn đang ở trạng thái PENDING | Click nút `"Hủy"` trên hàng đơn có trạng thái `PENDING`. Mở `CancelLeaveConfirmModal`. Bấm `"Xác Nhận Hủy Đơn"`. Gọi `PATCH /api/v1/leave-requests/{id}/cancel`. Toast thành công, trạng thái đơn chuyển thành `CANCELLED`. Nút Hủy tự biến mất. | Chờ duyệt |
| **TC-09** | Không cho phép hủy đơn đã APPROVED / REJECTED | Các đơn ở trạng thái `ĐÃ DUYỆT`, `BỊ TỪ CHỐI`, `ĐÃ HỦY` không hiển thị nút Hủy trên bảng hoặc trong modal chi tiết. | Chờ duyệt |
| **TC-10** | Lọc theo trạng thái và năm | Chọn lọc trạng thái `Chờ xét duyệt`. Bảng chỉ hiển thị các đơn `PENDING`. Khi không có kết quả, hiển thị Empty State kèm nút `"Đặt lại bộ lọc"`. | Chờ duyệt |
| **TC-11** | Chống Double-Click khi nộp hoặc hủy đơn | Khi đang gửi request, các nút bấm chuyển sang disabled, hiển thị spinner xoay, không thể click lần 2. | Chờ duyệt |
| **TC-12** | Tương thích Dark/Light Mode 2 chiều | Chuyển đổi giữa chế độ Sáng và Tối. Toàn bộ nền bảng, màu chữ, viền và badge trạng thái tự động thích ứng hoàn hảo, không có lỗi tương phản màu. | Chờ duyệt |

---

## 13. Xác Nhận Tuân Thủ Ranh Giới (Boundary Isolation Guarantee)

- [x] **100% Frontend Only:** Toàn bộ đặc tả và triển khai giao diện chỉ diễn ra trong thư mục `InternHub-Frontend/`. Tuyệt đối không can thiệp, chỉnh sửa bất kỳ tệp tin nào thuộc `InternHub/` (Backend Java).
- [x] **Zero Mock Bypass:** Kết nối và kiểm thử tích hợp trực tiếp với API Microservice thực tế qua Spring Boot Backend TM-28 (`LeaveRequestController`) và tài khoản thật.
- [x] **No Git Commit/Push:** Không tự tiện commit hay push mã nguồn lên repository.
- [x] **Sẵn sàng chờ phê duyệt:** Sau khi người dùng phê duyệt tài liệu Đặc tả này, Agent sẽ lập Kế hoạch Triển khai (`Plan`) trước khi viết mã nguồn giao diện.
