# Đặc Tả Kỹ Thuật Giao Diện (Frontend Spec): TM-26 Báo Cáo Chuyên Cần & Nghỉ Phép Của Thực Tập Sinh (HR Work Attendance & Leave Report Management)

> **Trạng thái tài liệu:** DRAFT / SẴN SÀNG CHỜ PHÊ DUYỆT (PENDING APPROVAL)  
> **Lưu trữ tại:** `InternHub-Frontend/docs/specs/TM-26-work-attendance-and-leave-report-spec.md`  
> **Dự án:** [InternHub-Frontend](file:///d:/Module_6/InternHub-Frontend) (React 19, TypeScript, Vite, CSS Modules, Axios)  
> **Tương thích Backend:** [InternHub Backend TM-26](file:///d:/Module_6/InternHub/docs/specs/TM-26-work-attendance-and-leave-report-spec.md) (Nhánh `feature/TM-26/work-attendance-and-leave-report`, `intern-and-program-service`, `AttendanceReportController`, package `attendance/report`)  
> **Mã Jira Ticket:** [TM-26](https://robluccibn9935.atlassian.net/browse/TM-26)  
> **Tiêu đề Jira:** *HR - Báo cáo đi làm và nghỉ phép (Work attendance and leave report)*  
> **Nhánh Git dự kiến (Frontend):** `feature/TM-26/work-attendance-and-leave-report`  
> **Cấp độ thay đổi (Change Level):** **L3** (Xây dựng phân hệ Dashboard Báo cáo chuyên cần & nghỉ phép toàn diện dành cho HR/Admin/Mentor: 5 Thẻ KPI Thống kê & Thanh phân bổ kỷ luật, Bộ lọc đa chiều, Bảng danh sách 10 dòng tự ẩn phân trang với cột Thao tác cố định, Modal Ma trận ngày công & nghỉ phép chi tiết 3 khối chuẩn UX, Tính năng Xuất file CSV UTF-8 BOM tải trực tiếp tương thích Microsoft Excel).  
> **Tuân thủ quy chuẩn:** Tuân thủ 100% [AGENTS.md](file:///d:/Module_6/InternHub-Frontend/AGENTS.md) (Toàn bộ 34 nguyên tắc bất biến của Frontend), tài liệu [08-ui-ux-guidelines.md](file:///d:/Module_6/InternHub-Frontend/.agents/08-ui-ux-guidelines.md) và kỹ năng thiết kế chuyên sâu [Frontend Design](file:///d:/Module_6/InternHub-Frontend/.agents/skills/frontend-design/SKILL.md).

---

## 0. Nhật Ký Thay Đổi & Giải Trình Kỹ Thuật (Revision History & Change Rationale)

> [!IMPORTANT]
> **BẮT BUỘC ĐIỀN ĐẦY ĐỦ**: Bất kể khi nào Lập trình viên hay AI Agent thay đổi mã nguồn ảnh hưởng đến logic, giao diện, API, routing hay modal (từ cấp độ L2 trở lên), **bắt buộc** phải ghi thêm một dòng vào bảng này để giải trình lý do trước khi coi nhiệm vụ là hoàn tất (Tuân thủ Rule 30 trong AGENTS.md).

| Phiên bản | Ngày | Người thực hiện | Task / Jira | Loại thay đổi | Lý do & Giải trình kỹ thuật (Rationale) |
| :---: | :--- :| :---: | :---: | :---: | :--- |
| **v1.0.0** | 2026-10-07 | AI Senior Pair-Programmer | `TM-26` | Khởi tạo đặc tả Frontend | Khởi tạo tài liệu đặc tả kỹ thuật Frontend cho TM-26 dựa trên kết quả rà soát toàn diện nhánh Backend `feature/TM-26/work-attendance-and-leave-report` (`AttendanceReportController`, các DTOs, Enums và Business Rules BR-1 đến BR-5). Thiết kế giao diện Dashboard phân tích chuyên cần cấp độ Doanh nghiệp (Enterprise Analytics UI) với 5 Thẻ KPI, Thanh phân bổ kỷ luật, Bộ lọc đa chiều, Bảng dữ liệu 10 dòng/trang tự ẩn phân trang (Rule 31), Modal Ma trận bảng công 3 khối bảo toàn ngữ cảnh (Rule 29), nút Xuất CSV UTF-8 BOM, xử lý đủ 5 trạng thái giao diện (Skeleton Shimmer, Empty có CTA, Error Retry, Success Toast, Disabled) và 100% Design Tokens CSS Variables từ `src/index.css` (Rule 28). |

---

## 1. Feature Overview & Tuyên Ngôn Nghiệp Vụ Cốt Lõi

- **Mã tính năng:** TM-26 (HR Work Attendance & Leave Report Management).
- **Phân hệ người dùng tham gia:**
  1. **Nhân sự & Quản trị viên (`ROLE_HR` / `ROLE_ADMIN`):** Đối tượng giám sát chính, có toàn quyền xem Dashboard KPI toàn công ty, lọc theo mọi phòng ban/chương trình/kỷ luật, xem ma trận chi tiết của từng TTS và xuất file CSV báo cáo.
  2. **Người hướng dẫn (`ROLE_MENTOR`):** Được cấp quyền xem danh sách và chi tiết bảng công của các TTS thuộc quyền quản lý trực tiếp trong chương trình/phòng ban.
  3. **Thực tập sinh (`ROLE_INTERN`):** **Tuyệt đối không có quyền truy cập** phân hệ báo cáo quản trị này (Backend chặn bằng `@PreAuthorize` trả về HTTP 403 Forbidden; Frontend chặn tại `ProtectedRoute` và ẩn menu Sidebar).
- **Tuyên ngôn nghiệp vụ cốt lõi (Core Business Statement):**
  > **"DASHBOARD CHUYÊN CẦN MINH BẠCH, TRỰC QUAN HÓA KỶ LUẬT THỰC TẬP SINH, CẢNH BÁO SỚM NGUY CƠ VI PHẠM VÀ TỐI ƯU HÓA QUẢN TRỊ NHÂN SỰ"**
  >
  > - **Tổng hợp tự động 2 nguồn dữ liệu lớn:** Tích hợp đồng thời dữ liệu Chấm công hàng ngày (`attendances` - TM-25) và Đơn xin nghỉ phép đã phê duyệt (`leave_requests` - TM-28) trong cùng một kỳ báo cáo.
  > - **Quy tắc ngày làm việc tiêu chuẩn (`expectedWorkDays` - BR-1):**
    Loại trừ Thứ Bảy và Chủ Nhật. Xử lý thông minh đối với TTS onboard giữa tháng: chỉ tính số ngày làm việc từ ngày bắt đầu thực tế của TTS đến ngày kết thúc hoặc ngày hiện tại.
  > - **Quy tắc tính ngày công và ngày vắng (`actualWorkDays`, `approvedLeaveDays`, `unexcusedAbsenceDays` - BR-2):**
    Nghỉ cả ngày tính 1.0 ngày; nghỉ nửa ngày (sáng/chiều) và có check-in nửa ngày còn lại tính 0.5 ngày làm việc và 0.5 ngày nghỉ phép hợp lệ. Ngày làm việc không có check-in và không có đơn duyệt tính là vắng không phép.
  > - **Công thức tính tỷ lệ chuyên cần (`diligenceRate` - BR-3):**
    $$\text{diligenceRate} = \text{round}\left(\frac{\text{actualWorkDays} + \text{approvedLeaveDays}}{\text{expectedWorkDays}} \times 100, 2\right)$$
  > - **Hệ thống phân bậc kỷ luật 4 cấp độ (`DiligenceStatus` - BR-4):**
    + **Xuất sắc (`EXCELLENT`):** Chuyên cần $\ge 95\%$, 0 lần đi muộn, 0 ngày vắng không phép.
    + **Tốt (`GOOD`):** Chuyên cần $\ge 85\%$, đi muộn $\le 2$ lần, 0 ngày vắng không phép.
    + **Cảnh báo (`WARNING`):** Chuyên cần từ $70\%$ đến $< 85\%$, HOẶC đi muộn 3-5 lần, HOẶC vắng không phép 1 ngày.
    + **Báo động (`CRITICAL`):** Chuyên cần $< 70\%$, HOẶC đi muộn $> 5$ lần, HOẶC vắng không phép $\ge 2$ ngày.
  > - **Xuất báo cáo CSV chuẩn Microsoft Excel (BR-6):** Đính kèm tiền tố UTF-8 BOM (`\uFEFF`) để khi mở trên Microsoft Excel không bị vỡ font chữ tiếng Việt có dấu.

- **Mục tiêu kỹ thuật & Trải nghiệm người dùng:**
  1. Xây dựng trang Dashboard Báo cáo chuyên cần dành cho HR tại `/hr/attendance-reports` theo chuẩn **Standard Page Composition 4 lớp** (Rule 20).
  2. Bố cục 5 Thẻ KPI Thống kê trực quan kèm Thanh tiến trình phân bổ kỷ luật (Diligence Distribution Bar) giúp HR nhận diện ngay quân số có nguy cơ bị cảnh báo.
  3. Áp dụng chuẩn **Modal-First UX (Rule 29)**: Xem chi tiết ma trận bảng công và đơn nghỉ phép của từng ngày trong tháng ngay trong Modal 3 khối, không chuyển trang, bảo toàn 100% bộ lọc và phân trang hiện tại.
  4. Bảng danh sách chuẩn **10 dòng / trang**, tự động ẩn phân trang khi `<= 10 dòng` (Rule 31), cột Thao tác luôn ghim cố định (`sticky right`) khi cuộn ngang (Rule 34).
  5. Đạt chuẩn WCAG AA, tương thích 100% Dark Mode / Light Mode bằng CSS Variables ngữ nghĩa từ `src/index.css` (Rule 28).

---

## 2. Khảo Sát Hiện Trạng Mã Nguồn & Đánh Giá Tái Sử Dụng (Rule 15 - Project Scan & Reuse Analysis)

> [!CAUTION]
> ### CHỈ THỊ TUÂN THỦ NGUYÊN TẮC BẤT BIẾN (RULE 15 & MANDATORY WORKSPACE DIRECTIVE)
> **"ĐẢM BẢO SẼ QUÉT DỰ ÁN, TRÁNH VIỆC TẠO THÊM CODE MỚI KHÔNG CẦN THIẾT, SỬ DỤNG TỐI ĐA NHỮNG GÌ ĐÃ CÓ ĐỂ PHÁT TRIỂN"**

Sau khi quét toàn diện mã nguồn `InternHub-Frontend`, kế hoạch tái sử dụng và mở rộng được thiết lập như sau:

### 2.1. Đánh Giá Thành Phần Sẵn Có & Tái Sử Dụng 100%

| Danh mục | Thành phần hiện có trong dự án | Tình trạng | Kế hoạch tái sử dụng cho TM-26 |
| :--- | :--- | :---: | :--- |
| **Common Components** | `Modal` (`src/components/common/Modal`) | Đã có | Tái sử dụng 100% cho `InternAttendanceDetailModal` (hỗ trợ cấu trúc 3 khối: Header cố định, Body cuộn độc lập, Sticky Footer ghim đáy). |
| **Common Components** | `Button` (`src/components/common/Button`) | Đã có | Tái sử dụng cho nút `"Xuất CSV"`, `"Làm mới"`, `"Đặt lại bộ lọc"`, `"Xem bảng công"`, hỗ trợ prop `loading` và biến thể `primary`, `outline`, `ghost`. |
| **Common Components** | `Select` (`src/components/common/Select`) | Đã có | Tái sử dụng cho các dropdown: chọn Tháng, chọn Năm, chọn Phòng ban, chọn Chương trình, chọn Trạng thái kỷ luật (`diligenceStatus`). |
| **Common Components** | `SearchBar` (`src/components/common/SearchBar`) | Đã có | Tái sử dụng cho ô tìm kiếm nhanh TTS theo tên, mã `internCode`, email. |
| **Common Components** | `Pagination` (`src/components/common/Pagination`) | Đã có | Tái sử dụng phân trang 0-indexed (Spring Boot) ↔ 1-indexed (UI), tự động ẩn khi `<= 10 dòng` (Rule 31). |
| **Common Components** | `Skeleton` (`src/components/common/Skeleton`) | Đã có | Tái sử dụng cho Skeleton Shimmer loading mô phỏng thẻ KPI và các hàng của bảng dữ liệu. |
| **Common Components** | `Alert` (`src/components/common/Alert`) | Đã có | Tái sử dụng cho banner cảnh báo quân số xếp loại `CRITICAL` và hiển thị thông báo lỗi khi tải dữ liệu thất bại. |
| **Common Components** | `ErrorBoundary` (`src/components/common/ErrorBoundary`) | Đã có | Tái sử dụng bao bọc toàn bộ trang chống hiện tượng sập trắng trang (White Screen of Death - Rule 24). |
| **Design Tokens & Theme** | `src/index.css` (CSS Variables) | Đã có | Tái sử dụng 100% token ngữ nghĩa: `--bg-body`, `--bg-card`, `--bg-surface`, `--text-main`, `--text-secondary`, `--text-muted`, `--border-default`, `--primary`, `--primary-glow`, `--info`, `--success`, `--warning`, `--danger`. Cấm hardcode màu hex (Rule 28). |
| **Formatters** | `formatDate`, `formatTime` (`src/utils/formatters.ts`) | Đã có | Tái sử dụng để định dạng ngày tháng `DD/MM/YYYY`, giờ check-in/out `HH:mm`. |
| **Toast Notifications** | `sonner` (`toast.success`, `toast.error`, `toast.info`) | Đã có | Tái sử dụng thông báo tức thời khi xuất file CSV thành công hoặc khi xảy ra sự cố mạng. |
| **API Client** | `apiClient`, `AppError` (`src/services/api.ts`) | Đã có | Tái sử dụng Axios instance 4 tầng, tự động đính kèm JWT Bearer token và chuẩn hóa lỗi nghiệp vụ (Rule 18). |
| **Department / Program Services** | `departmentService`, `programService` | Đã có | Tái sử dụng để tải danh sách phòng ban và chương trình phục vụ các dropdown lọc. |

### 2.2. Đánh Giá Các Thành Phần Cần Mở Rộng (Extension Without Breaking Changes)

| Thành phần | Đường dẫn | Thay đổi dự kiến | Lý do kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Constants Endpoints** | `src/constants/endpoints/attendance.endpoints.ts` | Bổ sung cụm URL `REPORTS`: `SUMMARY: '/api/v1/attendances/reports/summary'`, `INTERNS: '/api/v1/attendances/reports/interns'`, `INTERN_DETAILS: (id: number \| string) => ...`, `EXPORT: '/api/v1/attendances/reports/export'`. | Quy tụ toàn bộ URL về Constants, triệt tiêu magic strings theo Rule 19. |
| **Constants Routes** | `src/constants/routes/hr.routes.ts` | Bổ sung `ATTENDANCE_REPORTS: '/hr/attendance-reports'`. | Quản lý route tập trung theo Domain-Driven Modular (Rule 19, 20). |
| **TypeScript Types** | `src/types/attendance.types.ts` & `src/types/index.ts` | Bổ sung Enums (`DiligenceStatus`, `DailyDayStatus`) và DTOs (`AttendanceReportFilterParams`, `AttendanceSummaryKpiResponse`, `InternDiligenceReportResponse`, `InternAttendanceDetailReportResponse`, `DailyAttendanceDetailItem`). | Đảm bảo Type Safety chuẩn hóa, khớp 100% với Spring Boot backend DTOs. |
| **Domain Services** | `src/services/attendanceService.ts` | Bổ sung 4 phương thức gọi API báo cáo: `getAttendanceSummaryKpi`, `getInternDiligenceReports`, `getInternAttendanceDetailReport`, `exportAttendanceReportCsv` (hỗ trợ `AbortSignal` và Blob download). | Hoàn thiện tầng 3 của kiến trúc Axios 4 tầng (Rule 18). |
| **Sidebar Navigation** | `src/components/layout/Sidebar.tsx` | Bổ sung menu item `"Báo Cáo Chuyên Cần"` (Icon: `FileBarChart` hoặc `BarChart3`) trong khối menu dành cho `HR` và `ADMIN`. | Cung cấp lối tắt điều hướng trực tiếp trên thanh điều hướng chính. |
| **App Routing** | `src/routes/AppRoutes.tsx` | Đăng ký route `<Route path={ROUTES.HR.ATTENDANCE_REPORTS} element={<HRAttendanceReportPage />} />` trong vùng bảo vệ `ROLE_HR`, `ROLE_ADMIN`. | Kích hoạt màn hình trong vùng phân quyền `ProtectedRoute`. |

### 2.3. Danh Mục Thành Phần Mới Cần Xây Dựng

Các component được tổ chức theo kiến trúc Domain-Driven Modular tại `src/pages/hr/attendance-reports/`:

```text
src/pages/hr/attendance-reports/
├── HRAttendanceReportPage.tsx             # Trang chính (Standard Page Composition 4 lớp)
├── HRAttendanceReportPage.module.css      # CSS Modules cô lập phạm vi (Rule 23)
├── components/
│   ├── AttendanceReportKpiCards/          # Khối 5 thẻ KPI thống kê + Thanh phân bổ kỷ luật
│   │   ├── AttendanceReportKpiCards.tsx
│   │   ├── AttendanceReportKpiCards.types.ts
│   │   ├── AttendanceReportKpiCards.module.css
│   │   └── index.ts
│   ├── AttendanceReportFilterBar/         # Thanh công cụ lọc đa chiều (Tháng/Năm, Phòng ban, Chương trình, Kỷ luật, Tìm kiếm)
│   │   ├── AttendanceReportFilterBar.tsx
│   │   ├── AttendanceReportFilterBar.types.ts
│   │   ├── AttendanceReportFilterBar.module.css
│   │   └── index.ts
│   ├── InternDiligenceTable/              # Bảng danh sách chuyên cần TTS (Tối đa 10 dòng, tự ẩn phân trang, sticky cột)
│   │   ├── InternDiligenceTable.tsx
│   │   ├── InternDiligenceTable.types.ts
│   │   ├── InternDiligenceTable.module.css
│   │   └── index.ts
│   ├── InternAttendanceDetailModal/       # Modal 3 khối xem ma trận ngày công & đơn nghỉ phép chi tiết trong tháng
│   │   ├── InternAttendanceDetailModal.tsx
│   │   ├── InternAttendanceDetailModal.types.ts
│   │   ├── InternAttendanceDetailModal.module.css
│   │   └── index.ts
│   └── index.ts
├── hooks/
│   ├── useHRAttendanceReport.ts           # Custom hook quản lý state bộ lọc, KPI, phân trang và xuất CSV (<= 3-4 state)
│   ├── useInternAttendanceDetail.ts       # Custom hook lazy-load chi tiết bảng công của 1 TTS khi mở modal
│   └── index.ts
└── index.ts
```

---

## 3. Triết Lý Thiết Kế Visual & UX (Áp Dụng Skill Frontend Design & 08-ui-ux-guidelines.md)

### 3.1. Bản Sắc Thiết Kế (Subject Matter Identity)
- **Tư duy thiết kế:** Minimalist Enterprise Analytics Workspace. Mang phong cách trang nhã, hiện đại, sắc sảo tương tự các nền tảng quản trị nhân sự hàng đầu như BambooHR, Deel, Lattice, Datadog.
- **Tính trực quan hóa số liệu:**
  - Không để các con số thô nằm rời rạc; kết hợp thẻ KPI với mini trend, tỷ lệ % và biểu đồ thanh xếp đoạn (Distribution Segment Bar) thể hiện trực quan phân bổ kỷ luật: Xuất sắc (Xanh lá) ➔ Tốt (Xanh ngọc/dương) ➔ Cảnh báo (Vàng hổ phách) ➔ Báo động (Đỏ san hô).
  - Badge xếp loại kỷ luật có màu sắc nổi bật, chữ viết in hoa nhẹ nhàng (`font-weight: 600`, size 12px, bo góc tròn 9999px).
- **Tránh xa các lỗi rập khuôn AI:**
  - Không sử dụng viền đổ bóng xám đậm thô bạo; sử dụng viền mảnh `1px solid var(--border-default)`.
  - Không sử dụng gradient cầu vồng làm nhiễu thị giác; sử dụng tông màu HSL ngữ nghĩa nhất quán.
  - Sentence case tiếng Việt chuẩn mực ("Báo cáo chuyên cần", "Xuất file CSV", "Tất cả phòng ban", "Xem bảng công").

### 3.2. Bảng Màu Ngữ Nghĩa (Semantic Design Tokens từ `src/index.css`)

> [!CAUTION]
> **CẤM HARDCODE MÃ MÀU HEX (RULE 28)**: 100% màu sắc phải dùng biến CSS Variables từ `src/index.css`. Nghiêm cấm xuất hiện mã hex `#...` trong các file `.module.css`.

| Thành phần giao diện | Token Sử Dụng | Light Mode | Dark Mode (`[data-theme='dark']`) | Ý Nghĩa Ngữ Nghĩa |
| :--- | :--- | :--- | :--- | :--- |
| **Nền ứng dụng** | `var(--bg-body)` | `#f8fafc` | `#090d16` | Nền tổng thể trang báo cáo |
| **Nền Thẻ & Bảng** | `var(--bg-card)` / `var(--bg-surface)` | `#ffffff` | `#131d33` | Bề mặt hiển thị thẻ KPI, bảng dữ liệu và modal |
| **Đường viền mặc định** | `var(--border-default)` | `#e2e8f0` | `#26354a` | Viền mảnh 1px phân cách các khối |
| **Chữ tiêu đề chính** | `var(--text-main)` | `#0f172a` | `#f8fafc` | Chữ sắc nét, độ tương phản cao đạt WCAG AA |
| **Chữ phụ / nhãn** | `var(--text-secondary)` | `#475569` | `#cbd5e1` | Nhãn form, mô tả phụ |
| **Chữ mờ / timestamp** | `var(--text-muted)` | `#94a3b8` | `#64748b` | Chú thích ngày, placeholder |
| **Xếp loại EXCELLENT** | `var(--success)` & `rgba(16, 185, 129, 0.12)` | `#10b981` | `#34d399` | Xuất sắc - Màu xanh ngọc bích tin cậy |
| **Xếp loại GOOD** | `var(--info)` & `rgba(59, 130, 246, 0.12)` | `#3b82f6` | `#60a5fa` | Tốt - Màu xanh dương ổn định |
| **Xếp loại WARNING** | `var(--warning)` & `rgba(245, 158, 11, 0.12)` | `#f59e0b` | `#fbbf24` | Cảnh báo - Màu vàng cam hổ phách |
| **Xếp loại CRITICAL** | `var(--danger)` & `rgba(239, 68, 68, 0.12)` | `#ef4444` | `#f87171` | Báo động - Màu đỏ san hô cảnh báo nghiêm trọng |
| **Nút Focus Glow (Rule 30)** | `box-shadow: 0 0 0 3px var(--primary-glow)` | Viền đổi sang `var(--primary)` kèm hào quang ánh sáng bao quanh |

### 3.3. Typography & Hệ Thống Khoảng Cách 8pt Grid
- **Tiêu đề trang & Số liệu KPI chính:** Font `Outfit`, `font-weight: 700`, `letter-spacing: -0.02em`, size 24px - 28px.
- **Tiêu đề cột & Nội dung bảng:** Font `Inter`, `font-weight: 500/600` cho mã TTS và họ tên, `font-weight: 400` cho các chỉ số, size 13px - 14px.
- **Hệ thống khoảng cách 8pt:**
  - `4px (0.25rem)`: Gap icon và text nhỏ trong badge.
  - `8px (0.5rem)`: Gap giữa các nút hành động.
  - `12px (0.75rem)`: Padding ô select, ô search.
  - `16px (1rem)`: Padding hàng trong bảng dữ liệu.
  - `20px - 24px (1.25rem - 1.5rem)`: Padding thẻ KPI, khoảng cách giữa các lớp bố cục.

---

## 4. Kiến Trúc Trải Nghiệm Người Dùng (UX Wireframes & Standard Page Composition)

Tuân thủ chuẩn **Standard Page Composition 4 lớp** (Rule 20):
1. **Lớp 1: Page Header & Action Bar:** Tiêu đề trang, phụ đề và các nút tác vụ cấp cao: **`"[ ⟳ Làm mới ]"`** và **`"[ 📥 Xuất Báo Cáo CSV ]"`**.
2. **Lớp 2: Filter Toolbar & KPI Metrics Strip:** Bộ lọc thời gian (Tháng/Năm), Phòng ban, Chương trình, Mức kỷ luật, Tìm kiếm nhanh; 5 Thẻ KPI thống kê chuyên cần và Thanh phân bổ kỷ luật.
3. **Lớp 3: Content Data Table:** Bảng danh sách chuyên cần TTS tối đa 10 dòng, tự động ẩn phân trang khi `<= 10 dòng` (Rule 31), cột Thao tác luôn ghim cố định (`sticky right`).
4. **Lớp 4: Modals Layer (Modal-First UX - Rule 29):** `InternAttendanceDetailModal` (Ma trận ngày công chi tiết trong tháng).

### 4.1. Bố Cục Tổng Thể Màn Hình HR (`HRAttendanceReportPage`)

```text
+-------------------------------------------------------------------------------------------------------------------------+
| [Header] Báo Cáo Chuyên Cần & Nghỉ Phép (Attendance & Leave Report)                                                     |
| Giám sát tỷ lệ chuyên cần, ngày công thực tế, đi muộn/về sớm và tình hình nghỉ phép của thực tập sinh                   |
|                                                                     [ ⟳ Làm mới ]   [ 📥 Xuất Báo Cáo CSV ]             |
+-------------------------------------------------------------------------------------------------------------------------+
| [Lớp 2: Bộ Lọc Đa Chiều (Filter Toolbar)]                                                                               |
| [ Tháng: 10 ▼ ] [ Năm: 2026 ▼ ] [ Phòng ban: Tất cả ▼ ] [ Chương trình: Tất cả ▼ ] [ Kỷ luật: Tất cả ▼ ] [🔍 Tìm kiếm...] |
+-------------------------------------------------------------------------------------------------------------------------+
| [Lớp 2: 5 Thẻ KPI Thống Kê Chuyên Cần]                                                                                  |
| +--------------------+ +--------------------+ +--------------------+ +--------------------+ +--------------------+     |
| | 👥 TỔNG QUÂN SỐ    | | 💼 NGÀY CÔNG THỰC  | | ⏰ ĐI MUỘN / VỀ SỚM| | 🏖 NGHỈ CÓ PHÉP    | | 🚨 CẢNH BÁO KỶ LUẬT|     |
| |      24 TTS        | |   462.5 / 528 ngày | |  21 muộn • 6 về sớm| |    20.5 ngày       | |   2 TTS Báo động   |     |
| | Tỷ lệ: 91.45%      | | Đạt 87.6% kế hoạch | | Trung bình 0.9 l/ng| | 8 ốm • 6.5 việc • 5| | 45 ngày vắng K.phép|     |
| +--------------------+ +--------------------+ +--------------------+ +--------------------+ +--------------------+     |
| [Thanh Phân Bổ Kỷ Luật: [====== Xuất sắc: 12 ======][==== Tốt: 7 ====][== Cảnh báo: 3 ==][= Báo động: 2 =] ]            |
+-------------------------------------------------------------------------------------------------------------------------+
| [Lớp 3: Bảng Danh Sách Chuyên Cần TTS - Tối đa 10 dòng / trang]                                                         |
| +---------------------------------------------------------------------------------------------------------------------+ |
| | MÃ TTS      | HỌ VÀ TÊN      | PHÒNG BAN • CHƯƠNG TRÌNH     | NGÀY CÔNG | ĐI MUỘN | NGHỈ PHÉP | VẮNG K.P | TỶ LỆ | XẾP LOẠI | THAO TÁC   | |
| +-------------+----------------+------------------------------+-----------+---------+-----------+----------+-------+----------+------------+ |
| | INT-26-0042 | Nguyễn Văn An  | Phần mềm • Java Fullstack    | 16.0 / 22 | 5 lần   | 2.0 ngày  | 4.0 ngày | 81.8% | [CẢNH BÁO]| [👁 Xem]   | |
| | INT-26-0015 | Lê Thị Bình    | Thiết kế • UI/UX Design      | 22.0 / 22 | 0 lần   | 0.0 ngày  | 0.0 ngày | 100%  | [XUẤT SẮC]| [👁 Xem]   | |
| | INT-26-0088 | Trần Quang Cường| QA/QC • Manual & Automation | 12.0 / 22 | 8 lần   | 1.0 ngày  | 7.0 ngày | 59.1% | [BÁO ĐỘNG]| [👁 Xem]   | |
| | ...         | ...            | ...                          | ...       | ...     | ...       | ...      | ...   | ...      | ...        | |
| +---------------------------------------------------------------------------------------------------------------------+ |
| [Thanh Phân Trang - Tự động ẩn khi tổng số TTS <= 10]                                                                  |
+-------------------------------------------------------------------------------------------------------------------------+
```

---

## 5. Quy Chuẩn Modal-First UX & Ma Trận Ngày Công (Quy Tắc 29, 30 & 34)

Thao tác xem chi tiết bảng công của từng thực tập sinh được thực hiện ngay trên trang hiện tại thông qua Modal 3 khối. Không chuyển trang, bảo toàn 100% bộ lọc và vị trí trang của bảng danh sách.

### 5.1. Modal Ma Trận Ngày Công Chi Tiết Của TTS (`InternAttendanceDetailModal`)

- **Kích thước modal:** `size="xl"` (khoảng 920px - 960px).
- **Cấu trúc 3 khối bắt buộc (Rule 29):**
  - **Khối 1: Header cố định:**
    - Icon `CalendarDays` màu `var(--primary)`.
    - Tiêu đề: `"Chi Tiết Bảng Công & Chuyên Cần Tháng {month}/{year}"`.
    - Phụ đề: Họ tên TTS (`fullName`) • Mã TTS (`internCode`) • Phòng ban (`departmentName`) • Chương trình (`programTitle`).
    - Badge Xếp loại kỷ luật: `[XUẤT SẮC]`, `[TỐT]`, `[CẢNH BÁO]`, `[BÁO ĐỘNG]`.
    - Nút đóng `X` có `aria-label="Đóng modal"`.
  - **Khối 2: Body cuộn độc lập (`overflow-y: auto`):**
    - **Thanh tổng kết mini (Mini Summary Strip):** 4 ô nhỏ hiển thị:
      1. Ngày công thực tế: `{actualWorkDays} / {expectedWorkDays}` ngày.
      2. Đi muộn / Về sớm: `{lateCount}` lần muộn • `{earlyLeaveCount}` lần về sớm.
      3. Nghỉ phép có duyệt: `{approvedLeaveDays}` ngày.
      4. Vắng không phép: `{unexcusedAbsenceDays}` ngày • Tỷ lệ chuyên cần: **`{diligenceRate}%`**.
    - **Bảng Ma Trận Chi Tiết Từng Ngày Trong Tháng (`dailyDetails`):**
      - Hiển thị danh sách từ ngày 1 đến ngày cuối cùng của tháng (28 - 31 ngày).
      - Cột dữ liệu:
        1. **Ngày:** `DD/MM` kèm Thứ trong tuần (`Thứ Hai`, `Thứ Ba`...). Nếu là Thứ Bảy/Chủ Nhật: làm mờ nền nhẹ.
        2. **Trạng thái ngày (`dayStatus`):** Badge màu sắc ngữ nghĩa:
           - `PRESENT_ON_TIME`: Badge xanh ngọc *"Đúng giờ"*
           - `PRESENT_LATE`: Badge vàng cam *"Đi muộn"*
           - `PRESENT_EARLY_LEAVE`: Badge cam *"Về sớm"*
           - `PRESENT_LATE_AND_EARLY_LEAVE`: Badge đỏ cam *"Muộn & Về sớm"*
           - `LEAVE_APPROVED`: Badge xanh dương *"Nghỉ phép"*
           - `LEAVE_PENDING`: Badge xám nhạt *"Đơn chờ duyệt"*
           - `ABSENT_UNEXCUSED`: Badge đỏ nổi bật *"Vắng không phép"*
           - `WEEKEND`: Badge xám mờ *"Cuối tuần"*
           - `NOT_ENROLLED`: Badge xám *"Chưa onboard"*
           - `FUTURE_DAY`: Badge xám *"Chưa diễn ra"*
        3. **Giờ Check-in / Check-out:** Ví dụ `08:05 - 17:35` (Nếu không có: hiển thị dấu `-`).
        4. **Tổng giờ làm:** Ví dụ `8.5h`.
        5. **GPS:** Khoảng cách chấm công ví dụ `12.4m` (hợp lệ trong bán kính).
        6. **Thông tin nghỉ phép liên kết (nếu có):**
           - Loại nghỉ: Ốm đau / Việc riêng / Thi cử...
           - Lý do: Diễn giải vắn tắt.
           - Người duyệt: Tên Mentor/HR đã phê duyệt.
           - Minh chứng đính kèm: Link mở tài liệu trong tab mới.
  - **Khối 3: Sticky Footer cố định ở đáy:**
    - Nút **`"Đóng"`** (`variant="outline"`, phím tắt `Esc`).

```text
+---------------------------------------------------------------------------------------------------------+
| [Header] 📅 Chi Tiết Bảng Công Tháng 10/2026 - Nguyễn Văn An (INT-26-0042)                          [X] |
| Phòng ban: Phát triển phần mềm • Mentor: Trần Văn Bình                 [ XẾP LOẠI: CẢNH BÁO (81.8%) ]   |
+---------------------------------------------------------------------------------------------------------+
| [Body - Scrollable]                                                                                     |
| [Mini Strip: Ngày công: 16/22 ngày | Đi muộn: 5 lần | Nghỉ có phép: 2.0 ngày | Vắng K.phép: 4.0 ngày]   |
|                                                                                                         |
| MA TRẬN ĐI LÀM & NGHỈ PHÉP TỪNG NGÀY:                                                                   |
| +----------+----------+-----------------------+---------------+---------+---------+-------------------+ |
| | NGÀY     | THỨ      | TRẠNG THÁI            | CHECK-IN/OUT  | GIỜ LÀM | GPS     | GHI CHÚ / ĐƠN NGHỈ| |
| +----------+----------+-----------------------+---------------+---------+---------+-------------------+ |
| | 01/10/26 | Thứ Năm  | [✓ ĐÚNG GIỜ]          | 08:05 - 17:35 | 8.5h    | 12.4m   | -                 | |
| | 02/10/26 | Thứ Sáu  | [🏖 NGHỈ CÓ PHÉP]     | -             | -       | -       | Nghỉ ốm (Đã duyệt)| |
| | 03/10/26 | Thứ Bảy  | [CUỐI TUẦN]           | -             | -       | -       | Ngày nghỉ tuần    | |
| | 04/10/26 | Chủ Nhật | [CUỐI TUẦN]           | -             | -       | -       | Ngày nghỉ tuần    | |
| | 05/10/26 | Thứ Hai  | [🚨 VẮNG KHÔNG PHÉP]  | -             | -       | -       | Không check-in    | |
| | 06/10/26 | Thứ Ba   | [⚠ ĐI MUỘN]           | 08:42 - 17:40 | 8.0h    | 15.1m   | Muộn 12 phút      | |
| | ...      | ...      | ...                   | ...           | ...     | ...     | ...               | |
| +----------+----------+-----------------------+---------------+---------+---------+-------------------+ |
+---------------------------------------------------------------------------------------------------------+
| [Sticky Footer]                                                                                [ Đóng ] |
+---------------------------------------------------------------------------------------------------------+
```

---

## 6. Xử Lý 5 Trạng Thái Giao Diện Bắt Buộc (Rule 32)

Toàn bộ phân hệ báo cáo bắt buộc xử lý triệt để 5 trạng thái giao diện:

| STT | Trạng thái giao diện | Quy chuẩn thực thi trực quan (Visual Specification) |
| :---: | :--- | :--- |
| **1** | **Loading State (Đang tải)** | Nghiêm cấm dùng chữ `"Đang tải..."` thô sơ. Bắt buộc hiển thị **Skeleton Shimmer** dạng sóng nhấp nháy êm dịu cho 5 thẻ KPI và 5 hàng bảng dữ liệu. Chiều cao cố định chính xác để triệt tiêu hiện tượng giật giao diện (CLS = 0). |
| **2** | **Empty State (Chưa có dữ liệu)** | - **Khi công ty chưa có dữ liệu chấm công:** Icon minh họa `BarChart3` + Tiêu đề `"Chưa có dữ liệu báo cáo chuyên cần"` + Hướng dẫn *"Không tìm thấy dữ liệu điểm danh hoặc đơn nghỉ phép trong tháng đã chọn."* + Nút CTA: **`"Chọn tháng khác"`**.<br>- **Khi bộ lọc phòng ban / từ khóa không có kết quả:** Tiêu đề `"Không tìm thấy thực tập sinh phù hợp"` + Hướng dẫn *"Thử xóa từ khóa tìm kiếm hoặc đặt lại các tiêu chí lọc."* + Nút CTA `variant="outline"`: **`"Đặt lại bộ lọc"`**. |
| **3** | **Error State (Lỗi kết nối / Máy chủ)** | Hiển thị banner `Alert` biến thể `error` (`var(--danger)` nhạt) nêu rõ nguyên nhân và nút **`"Thử lại"`** (`variant="outline"`) để gọi lại hàm `refetch()`. |
| **4** | **Success State (Thành công)** | Hiển thị Toast thông báo qua thư viện `sonner` góc trên bên phải khi xuất file CSV thành công: *"Đã xuất báo cáo chuyên cần Tháng {M}/{YYYY} thành công. File đang được tải về."*. |
| **5** | **Disabled State (Vô hiệu hóa)** | Trong quá trình tải dữ liệu trang mới hoặc đang xuất file CSV (`isExporting = true`), nút bấm chuyển sang trạng thái disabled (`pointer-events: none`), con trỏ đổi thành `not-allowed`, hiển thị spinner loading xoay tròn để chống lỗi **Double-Click**. |

---

## 7. Cơ Chế Bảo Mật & Ràng Buộc Nghiệp Vụ (RBAC & Safe Export)

1. **Bảo vệ phân quyền RBAC tại Frontend:**
   - Trang `/hr/attendance-reports`: Chỉ người dùng mang vai trò `HR` hoặc `ADMIN` hoặc `MENTOR` mới được truy cập qua `ProtectedRoute`.
   - Nút `"Xuất Báo Cáo CSV"`: Chỉ hiển thị cho `HR` và `ADMIN`. Đối với `MENTOR`, nút này bị ẩn đi (hoặc disabled kèm tooltip) do Backend chặn quyền export chỉ cho HR/Admin.
   - Tài khoản `INTERN`: Tuyệt đối không thấy menu Báo cáo chuyên cần trên Sidebar và bị chặn ngay lập tức nếu cố tình gõ trực tiếp URL.
2. **Quy chuẩn tải file an toàn (Safe CSV Blob Download):**
   - Khi gọi API `GET /api/v1/attendances/reports/export`, frontend nhận luồng byte dạng `Blob` với `responseType: 'blob'`.
   - Tạo Object URL tạm thời (`window.URL.createObjectURL(blob)`), gắn vào thẻ `<a>` ảo với thuộc tính `download`, kích hoạt sự kiện click và giải phóng bộ nhớ ngay sau đó (`window.URL.revokeObjectURL(url)`).
   - Đảm bảo giữ nguyên tiền tố UTF-8 BOM do Backend trả về để file CSV hiển thị trọn vẹn tiếng Việt có dấu khi người dùng mở bằng Microsoft Excel.

---

## 8. Kiến Trúc Kỹ Thuật & Cấu Trúc Tệp Tin (Domain-Driven Architecture)

Tuân thủ kiến trúc phân tầng chuẩn Domain-Driven Modular (Rule 18, 19, 20):

```text
src/
├── constants/
│   ├── endpoints/
│   │   ├── attendance.endpoints.ts             # Mở rộng ATTENDANCE_ENDPOINTS.REPORTS
│   │   └── index.ts
│   └── routes/
│       ├── hr.routes.ts                        # Thêm ATTENDANCE_REPORTS: '/hr/attendance-reports'
│       └── index.ts
├── types/
│   ├── attendance.types.ts                     # Mở rộng DTOs & Enums báo cáo chuyên cần
│   └── index.ts
├── services/
│   ├── attendanceService.ts                    # Bổ sung 4 phương thức Axios 4 tầng
│   └── index.ts
├── pages/
│   └── hr/
│       └── attendance-reports/
│           ├── HRAttendanceReportPage.tsx      # Standard Page Composition 4 lớp
│           ├── HRAttendanceReportPage.module.css
│           ├── components/
│           │   ├── AttendanceReportKpiCards/
│           │   │   ├── AttendanceReportKpiCards.tsx
│           │   │   ├── AttendanceReportKpiCards.types.ts
│           │   │   ├── AttendanceReportKpiCards.module.css
│           │   │   └── index.ts
│           │   ├── AttendanceReportFilterBar/
│           │   │   ├── AttendanceReportFilterBar.tsx
│           │   │   ├── AttendanceReportFilterBar.types.ts
│           │   │   ├── AttendanceReportFilterBar.module.css
│           │   │   └── index.ts
│           │   ├── InternDiligenceTable/
│           │   │   ├── InternDiligenceTable.tsx
│           │   │   ├── InternDiligenceTable.types.ts
│           │   │   ├── InternDiligenceTable.module.css
│           │   │   └── index.ts
│           │   ├── InternAttendanceDetailModal/
│           │   │   ├── InternAttendanceDetailModal.tsx
│           │   │   ├── InternAttendanceDetailModal.types.ts
│           │   │   ├── InternAttendanceDetailModal.module.css
│           │   │   └── index.ts
│           │   └── index.ts
│           ├── hooks/
│           │   ├── useHRAttendanceReport.ts    # Quản lý state bộ lọc, danh sách & export
│           │   ├── useInternAttendanceDetail.ts# Lazy-load chi tiết của 1 TTS
│           │   └── index.ts
│           └── index.ts
├── components/
│   └── layout/
│       └── Sidebar.tsx                         # Thêm menu item "Báo Cáo Chuyên Cần" cho HR
└── routes/
    └── AppRoutes.tsx                           # Đăng ký route /hr/attendance-reports
```

---

## 9. Định Nghĩa Kiểu Dữ Liệu TypeScript (TypeScript DTOs Contract)

Khớp 100% với các DTOs và Enums của Backend TM-26 (`AttendanceReportController`, `AttendanceSummaryKpiResponse`, `InternDiligenceReportResponse`, `InternAttendanceDetailReportResponse`):

```typescript
// src/types/attendance.types.ts (Phần bổ sung cho TM-26)

import { LeaveDurationType, LeaveType } from './leave.types';

/**
 * Phân loại mức độ chuyên cần và kỷ luật đào tạo của Thực tập sinh (BR-4)
 */
export type DiligenceStatus =
  | 'EXCELLENT'  // Xuất sắc (Chuyên cần >= 95%, 0 muộn, 0 vắng K.phép)
  | 'GOOD'       // Tốt (Chuyên cần >= 85%, muộn <= 2, 0 vắng K.phép)
  | 'WARNING'    // Cảnh báo (70% <= Chuyên cần < 85%, hoặc muộn 3-5 lần, hoặc vắng 1 ngày)
  | 'CRITICAL';  // Báo động (Chuyên cần < 70%, hoặc muộn > 5 lần, hoặc vắng >= 2 ngày)

/**
 * Trạng thái công việc và sự hiện diện của TTS trong từng ngày cụ thể (BR-5)
 */
export type DailyDayStatus =
  | 'PRESENT_ON_TIME'              // Đi làm đúng giờ
  | 'PRESENT_LATE'                 // Đi làm muộn
  | 'PRESENT_EARLY_LEAVE'          // Về sớm
  | 'PRESENT_LATE_AND_EARLY_LEAVE' // Vừa đi muộn vừa về sớm
  | 'LEAVE_APPROVED'               // Nghỉ phép có duyệt
  | 'LEAVE_PENDING'                // Đơn xin nghỉ chờ duyệt
  | 'ABSENT_UNEXCUSED'             // Vắng mặt không phép
  | 'WEEKEND'                      // Ngày nghỉ cuối tuần
  | 'NOT_ENROLLED'                 // Chưa onboard / Đã kết thúc
  | 'FUTURE_DAY';                  // Ngày chưa diễn ra

/**
 * Tham số lọc báo cáo chuyên cần
 */
export interface AttendanceReportFilterParams {
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
  departmentId?: number;
  programId?: number;
  mentorId?: number;
  diligenceStatus?: DiligenceStatus | 'ALL';
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Response Dashboard KPI tổng quan toàn công ty (GET /api/v1/attendances/reports/summary)
 */
export interface AttendanceSummaryKpiResponse {
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  totalInterns: number;
  overallDiligenceRate: number;
  totalExpectedWorkDays: number;
  totalActualWorkDays: number;
  totalOnTimeCount: number;
  totalLateCount: number;
  totalEarlyLeaveCount: number;
  totalApprovedLeaveDays: number;
  totalUnexcusedAbsenceDays: number;
  leaveReasonBreakdown: Record<LeaveType, number>;
  statusDistribution: Record<DiligenceStatus, number>;
  criticalInternsCount: number;
}

/**
 * Response từng TTS trong danh sách phân trang (GET /api/v1/attendances/reports/interns)
 */
export interface InternDiligenceReportResponse {
  internId: number;
  internCode: string;
  fullName: string;
  email: string;
  departmentName: string;
  programTitle: string;
  mentorName: string;
  expectedWorkDays: number;
  actualWorkDays: number;
  onTimeCount: number;
  lateCount: number;
  earlyLeaveCount: number;
  totalWorkingHours: number;
  approvedLeaveDays: number;
  unexcusedAbsenceDays: number;
  diligenceRate: number;
  diligenceStatus: DiligenceStatus;
  diligenceStatusTitle: string;
  warningNotes: string;
}

/**
 * Chi tiết công việc và điểm danh của 1 ngày trong tháng
 */
export interface DailyAttendanceDetailItem {
  date: string;
  dayOfWeek: string;
  dayOfWeekVietnamese: string;
  isWeekend: boolean;
  dayStatus: DailyDayStatus;
  dayStatusDescription: string;
  attendance: {
    id: number;
    checkInTime: string | null;
    checkOutTime: string | null;
    totalWorkingHours: number | null;
    checkInDistance: number | null;
    notes: string | null;
  } | null;
  leaveRequest: {
    id: number;
    leaveType: LeaveType;
    leaveTypeDescription: string;
    durationType: LeaveDurationType;
    reason: string;
    approverName: string;
    attachmentUrl: string | null;
  } | null;
}

/**
 * Response chi tiết bảng công của 1 TTS (GET /api/v1/attendances/reports/interns/{id}/details)
 */
export interface InternAttendanceDetailReportResponse {
  internId: number;
  internCode: string;
  fullName: string;
  email: string;
  departmentName: string;
  programTitle: string;
  mentorName: string;
  month: number;
  year: number;
  summary: {
    expectedWorkDays: number;
    actualWorkDays: number;
    onTimeCount: number;
    lateCount: number;
    earlyLeaveCount: number;
    totalWorkingHours: number;
    approvedLeaveDays: number;
    unexcusedAbsenceDays: number;
    diligenceRate: number;
    diligenceStatus: DiligenceStatus;
  };
  dailyDetails: DailyAttendanceDetailItem[];
}
```

---

## 10. Định Nghĩa URL Endpoints & Service Contract

### 10.1. Constants Endpoints (`src/constants/endpoints/attendance.endpoints.ts`)

```typescript
export const ATTENDANCE_ENDPOINTS = {
  BASE: '/api/v1/attendances',
  TODAY: '/api/v1/attendances/today',
  CHECK_IN: '/api/v1/attendances/check-in',
  CHECK_IN_INITIATE: '/api/v1/attendances/check-in/initiate',
  CHECK_IN_CONFIRM: '/api/v1/attendances/check-in/confirm',
  CHECK_OUT: '/api/v1/attendances/check-out',
  MY_HISTORY: '/api/v1/attendances/my-history',
  
  // Phân hệ Báo cáo chuyên cần HR (TM-26)
  REPORTS: {
    SUMMARY: '/api/v1/attendances/reports/summary',
    INTERNS: '/api/v1/attendances/reports/interns',
    INTERN_DETAILS: (internId: number | string) => `/api/v1/attendances/reports/interns/${internId}/details`,
    EXPORT: '/api/v1/attendances/reports/export',
  },
} as const;
```

### 10.2. Service Contract (`src/services/attendanceService.ts`)

```typescript
// Tuân thủ kiến trúc Axios 4 tầng, hỗ trợ AbortSignal và xử lý file tải về

export const attendanceService = {
  // ... Các phương thức check-in/out hiện có ...

  /**
   * Lấy Dashboard KPI tổng quan toàn công ty về chuyên cần (TM-26)
   */
  getAttendanceSummaryKpi: async (
    filter?: AttendanceReportFilterParams,
    signal?: AbortSignal
  ): Promise<AttendanceSummaryKpiResponse> => {
    const response = await apiClient.get<ApiResponse<AttendanceSummaryKpiResponse>>(
      ATTENDANCE_ENDPOINTS.REPORTS.SUMMARY,
      { params: filter, signal }
    );
    return response.data.data;
  },

  /**
   * Lấy danh sách bảng tổng hợp chuyên cần của các TTS (phân trang 0-indexed - TM-26)
   */
  getInternDiligenceReports: async (
    filter?: AttendanceReportFilterParams,
    signal?: AbortSignal
  ): Promise<PageResponse<InternDiligenceReportResponse>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<InternDiligenceReportResponse>>>(
      ATTENDANCE_ENDPOINTS.REPORTS.INTERNS,
      { params: filter, signal }
    );
    return response.data.data;
  },

  /**
   * Lấy chi tiết bảng công và các ngày nghỉ phép của 1 TTS trong tháng (TM-26)
   */
  getInternAttendanceDetailReport: async (
    internId: number,
    month?: number,
    year?: number,
    signal?: AbortSignal
  ): Promise<InternAttendanceDetailReportResponse> => {
    const response = await apiClient.get<ApiResponse<InternAttendanceDetailReportResponse>>(
      ATTENDANCE_ENDPOINTS.REPORTS.INTERN_DETAILS(internId),
      { params: { month, year }, signal }
    );
    return response.data.data;
  },

  /**
   * Xuất báo cáo chuyên cần ra file CSV UTF-8 BOM chuẩn tiếng Việt (TM-26)
   */
  exportAttendanceReportCsv: async (
    filter?: AttendanceReportFilterParams,
    signal?: AbortSignal
  ): Promise<Blob> => {
    const response = await apiClient.get(
      ATTENDANCE_ENDPOINTS.REPORTS.EXPORT,
      {
        params: filter,
        responseType: 'blob',
        signal,
      }
    );
    return response.data;
  },
};
```

---

## 11. Tiêu Chuẩn Đa Thiết Bị & Khả Năng Tiếp Cận (Responsive & Accessibility WCAG AA)

- **Desktop (>= 1024px):**
  - Khung sườn App Shell cố định, bảng dữ liệu chỉ cuộn ngang cục bộ bên trong khung (`overflow-x: auto`), không làm vỡ bố cục trang (Rule 34).
  - Cột Mã TTS bên trái và Cột Thao Tác bên phải luôn ghim cố định (`sticky`) khi cuộn ngang.
  - Sử dụng thanh cuộn siêu mảnh Custom Sleek Scrollbar (6px - 8px) bo tròn 9999px.
- **Mobile (< 768px):**
  - Tự động chuyển đổi bảng dữ liệu sang **Danh Sách Dạng Thẻ Card dọc**. Mỗi thẻ thể hiện: Mã TTS, Họ tên, Phòng ban, Tỷ lệ chuyên cần, Badge xếp loại và nút `"Xem bảng công"` lớn dễ thao tác bằng ngón tay (Touch target >= 44px x 44px).
  - Khối 5 thẻ KPI tự động xếp thành 1-2 cột cuộn dọc gọn gàng.
- **Khả năng tiếp cận (Accessibility - WCAG AA):**
  - Hỗ trợ đóng Modal bằng phím `Escape`.
  - Độ tương phản chữ đạt chuẩn WCAG AA (>= 4.5:1).
  - Toàn bộ nút icon-only có thuộc tính `aria-label` mô tả rõ ràng.

---

## 12. Kế Hoạch Kiểm Thử Nghiệm Thu (Acceptance Criteria & Test Matrix)

| Mã test | Kịch bản kiểm thử | Hành vi kỳ vọng (Expected Behavior) | Kết quả |
| :---: | :--- | :--- | :---: |
| **TC-01** | Truy cập trang Báo cáo chuyên cần từ Sidebar | Đăng nhập tài khoản HR (`ROLE_HR`), click menu `"Báo Cáo Chuyên Cần"`. Chuyển hướng đến `/hr/attendance-reports`. Hiển thị Skeleton Shimmer rồi hiển thị đầy đủ 5 Thẻ KPI và Bảng danh sách TTS. | Chờ duyệt |
| **TC-02** | Hiển thị 5 Thẻ KPI và Thanh phân bổ kỷ luật | Dữ liệu thống kê tổng quân số, tổng ngày công, lượt đi muộn, ngày nghỉ phép và số TTS báo động hiển thị chuẩn xác khớp với API summary. | Chờ duyệt |
| **TC-03** | Lọc theo Tháng và Năm | Thay đổi dropdown Tháng sang `Tháng 9/2026`. Bảng danh sách và 5 Thẻ KPI tự động cập nhật lại số liệu tương ứng của Tháng 9. | Chờ duyệt |
| **TC-04** | Lọc theo Phòng ban và Chương trình | Chọn lọc theo phòng ban `Phát triển phần mềm`. Bảng danh sách chỉ hiển thị các TTS thuộc phòng ban này. | Chờ duyệt |
| **TC-05** | Lọc theo Mức độ kỷ luật | Chọn lọc `diligenceStatus = CRITICAL`. Bảng chỉ hiển thị các TTS có nguy cơ kỷ luật cao (Báo động). | Chờ duyệt |
| **TC-06** | Tìm kiếm nhanh TTS theo tên / mã TTS | Nhập từ khóa `"An"` hoặc `"INT-26-0042"` vào ô SearchBar. Bảng lọc ra kết quả chính xác sau debounce 300ms. | Chờ duyệt |
| **TC-07** | Bảng danh sách 10 dòng & Tự ẩn phân trang (Rule 31) | Khi tổng số TTS `<= 10`, thanh phân trang tự động ẩn đi để loại bỏ rác thị giác; khi `> 10`, hiển thị phân trang hoạt động mượt mà. | Chờ duyệt |
| **TC-08** | Mở Modal Ma trận ngày công chi tiết (Rule 29) | Bấm nút `"Xem"` trên một dòng TTS. Mở `InternAttendanceDetailModal` hiển thị đầy đủ các ngày trong tháng, badge trạng thái từng ngày, giờ check-in/out, GPS và thông tin đơn nghỉ phép liên kết. | Chờ duyệt |
| **TC-09** | Xuất báo cáo CSV chuẩn UTF-8 BOM | Bấm nút `"Xuất Báo Cáo CSV"`. Nút hiển thị spinner loading, gọi API export và tải file `BaoCaoChuyenCan_InternHub_Thang[M]_[YYYY].csv` về máy. Mở trên Excel tiếng Việt không bị lỗi font. | Chờ duyệt |
| **TC-10** | Chống Double-Click (Rule 31 & 32) | Trong khi API đang tải hoặc đang xuất CSV, nút bấm bị disabled, con trỏ chuột đổi thành `not-allowed`, không thể click lần 2. | Chờ duyệt |
| **TC-11** | Chặn phân quyền tài khoản INTERN | Đăng nhập tài khoản TTS (`ROLE_INTERN`), kiểm tra Sidebar không thấy menu báo cáo. Cố tình truy cập `/hr/attendance-reports` bị chuyển hướng hoặc chặn 403 Forbidden. | Chờ duyệt |
| **TC-12** | Tương thích Dark Mode và Light Mode (Rule 28) | Chuyển đổi giữa giao diện Sáng và Tối. Toàn bộ nền bảng, màu chữ, viền và các badge kỷ luật tự thích ứng hoàn hảo, không có lỗi tương phản màu. | Chờ duyệt |

---

## 13. Xác Nhận Tuân Thủ Ranh Giới (Boundary Isolation Guarantee)

- [x] **100% Frontend Only:** Toàn bộ đặc tả và triển khai giao diện chỉ diễn ra trong thư mục `InternHub-Frontend/`. Tuyệt đối không can thiệp, chỉnh sửa bất kỳ tệp tin nào thuộc `InternHub/` (Backend Java).
- [x] **Zero Mock Bypass:** Kết nối và kiểm thử tích hợp trực tiếp với API Microservice thực tế qua Spring Boot Backend TM-26 (`AttendanceReportController`) và tài khoản thật.
- [x] **No Git Commit/Push:** Không tự tiện commit hay push mã nguồn lên repository.
- [x] **Sẵn sàng chờ phê duyệt:** Sau khi người dùng phê duyệt tài liệu Đặc tả này, Agent sẽ lập Kế hoạch Triển khai (`Plan`) trước khi viết mã nguồn giao diện.
