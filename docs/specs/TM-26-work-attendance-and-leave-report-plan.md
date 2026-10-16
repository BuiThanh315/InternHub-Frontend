# Kế Hoạch Triển Khai (Implementation Plan) - TM-26: Báo Cáo Chuyên Cần & Nghỉ Phép Của Thực Tập Sinh

> **Ticket:** [TM-26](https://robluccibn9935.atlassian.net/browse/TM-26) - HR Báo Cáo Đi Làm & Nghỉ Phép (HR Work Attendance and Leave Report Management)  
> **Change Level:** **L3**  
> **Tài liệu đặc tả liên quan:** [`docs/specs/TM-26-work-attendance-and-leave-report-spec.md`](file:///d:/Module_6/InternHub-Frontend/docs/specs/TM-26-work-attendance-and-leave-report-spec.md)  
> **Tương thích Backend:** Nhánh `feature/TM-26/work-attendance-and-leave-report` trên `InternHub` (`intern-and-program-service`, `AttendanceReportController`, cổng `8082` qua API Gateway `8080`)  
> **Tuân thủ quy chuẩn:** Toàn bộ 34 Nguyên tắc bất biến ([`AGENTS.md`](file:///d:/Module_6/InternHub-Frontend/AGENTS.md)) & Bộ Quy chuẩn Thiết kế UX/UI ([`08-ui-ux-guidelines.md`](file:///d:/Module_6/InternHub-Frontend/.agents/08-ui-ux-guidelines.md))

---

## 1. Mục Tiêu & Kiến Trúc Dự Kiến (Architecture & Goals)

Xây dựng toàn diện phân hệ Dashboard Báo cáo chuyên cần & nghỉ phép phía Frontend cho tính năng **TM-26 (HR Work Attendance & Leave Report Management)** dành cho Nhân sự (`ROLE_HR`), Quản trị viên (`ROLE_ADMIN`) và Người hướng dẫn (`ROLE_MENTOR`):
- **Dashboard Thống kê chuyên cần:** Bố cục 5 Thẻ KPI Thống kê (Tổng quân số TTS, Ngày công thực tế vs Kế hoạch, Lượt đi muộn/về sớm, Số ngày nghỉ phép có duyệt, Số TTS báo động kỷ luật) kết hợp Thanh phân bổ kỷ luật trực quan (Diligence Distribution Bar: Xuất sắc, Tốt, Cảnh báo, Báo động).
- **Bộ lọc đa chiều:** Hỗ trợ lọc theo Tháng/Năm, Phòng ban, Chương trình, Mức độ kỷ luật (`diligenceStatus`) và Tìm kiếm nhanh theo tên/mã TTS.
- **Bảng danh sách chuyên cần chuẩn UX Doanh nghiệp:** Tối đa 10 dòng/trang, tự động ẩn phân trang khi $\le 10$ dòng (Rule 31), cột Thao tác luôn ghim cố định (`sticky right` - Rule 34).
- **Modal Ma trận ngày công chi tiết 3 khối:** Xem toàn bộ lịch sử điểm danh và đơn nghỉ phép của 28 - 31 ngày trong tháng của từng TTS ngay trên trang hiện tại, bảo toàn 100% ngữ cảnh bộ lọc và vị trí phân trang (Rule 29).
- **Tính năng Xuất báo cáo CSV chuẩn UTF-8 BOM:** Tải file trực tiếp từ API backend với bộ mã ký tự UTF-8 BOM (`\uFEFF`), mở trên Microsoft Excel không bị lỗi font tiếng Việt.

---

### Phê Duyệt Endpoint & Route (Bắt buộc theo Nguyên tắc 11 & 17):

#### A. Danh mục API Endpoints (Backend Spring Boot):
1. `GET /api/v1/attendances/reports/summary`: Lấy Dashboard KPI tổng quan toàn công ty theo tháng, năm, phòng ban, chương trình.
2. `GET /api/v1/attendances/reports/interns`: Lấy danh sách phân trang 0-indexed tổng hợp chuyên cần của các TTS (params: `month`, `year`, `departmentId`, `programId`, `mentorId`, `diligenceStatus`, `keyword`, `page`, `size`, `sort`).
3. `GET /api/v1/attendances/reports/interns/{internId}/details`: Lấy chi tiết ma trận bảng công và ngày nghỉ phép theo từng ngày trong tháng của 1 TTS.
4. `GET /api/v1/attendances/reports/export`: Xuất báo cáo chuyên cần ra file stream CSV UTF-8 BOM (params tương tự danh sách).

#### B. Danh mục Routes Frontend:
1. `ROUTES.HR.ATTENDANCE_REPORTS = '/hr/attendance-reports'`: Trang Dashboard Báo cáo chuyên cần dành cho HR và Admin.

---

## 2. Khảo Sát Hiện Trạng & Đánh Giá Tái Sử Dụng (Rule 15 - Project Scan & Reuse Analysis)

> [!CAUTION]
> ### CHỈ THỊ CỐT LÕI (RULE 15 - REUSE FIRST & ZERO REDUNDANCY)
> **"ĐẢM BẢO SẼ QUÉT DỰ ÁN, TRÁNH VIỆC TẠO THÊM CODE MỚI KHÔNG CẦN THIẾT, SỬ DỤNG TỐI ĐA NHỮNG GÌ ĐÃ CÓ ĐỂ PHÁT TRIỂN"**

Sau khi quét toàn diện mã nguồn `InternHub-Frontend`, các thành phần được tái sử dụng 100% và các điểm cần mở rộng được xác định như sau:

### 2.1. Thành Phần Sẵn Có Tái Sử Dụng 100%

| Danh mục | Thành phần sẵn có | Kế hoạch tái sử dụng cho TM-26 |
| :--- | :--- | :--- |
| **Common UI** | `Modal` (`src/components/common/Modal`) | Dùng cho `InternAttendanceDetailModal` (3 khối: Header cố định, Body cuộn, Sticky Footer) |
| **Common UI** | `Button` (`src/components/common/Button`) | Dùng cho các nút: `"Xuất Báo Cáo CSV"`, `"Làm mới"`, `"Đặt lại bộ lọc"`, `"Xem bảng công"`, hỗ trợ loading spinner |
| **Common UI** | `Select` (`src/components/common/Select`) | Dùng cho các dropdown: Tháng, Năm, Phòng ban, Chương trình, Mức kỷ luật (`diligenceStatus`) |
| **Common UI** | `SearchBar` (`src/components/common/SearchBar`) | Dùng cho ô tìm kiếm nhanh TTS theo tên hoặc mã `internCode` |
| **Common UI** | `Pagination` (`src/components/common/Pagination`) | Phân trang tự động chuyển đổi 0-indexed ↔ 1-indexed, tự ẩn khi $\le 10$ dòng |
| **Common UI** | `Skeleton` (`src/components/common/Skeleton`) | Shimmer loading cho 5 thẻ KPI và các hàng của bảng dữ liệu (CLS = 0) |
| **Common UI** | `Alert` & `ErrorBoundary` | Banner cảnh báo số TTS báo động và chống sập trắng trang |
| **Design Tokens** | `src/index.css` (CSS Variables) | 100% biến màu ngữ nghĩa (`var(--bg-body)`, `var(--bg-card)`, `var(--text-main)`, `var(--primary)`, `var(--success)`, `var(--warning)`, `var(--danger)`...) |
| **Formatters** | `src/utils/formatters.ts` | Tái sử dụng `formatDate`, `formatTime` |
| **Toast** | `sonner` | Toast thông báo xuất file CSV thành công hoặc thông báo lỗi |
| **API Client** | `apiClient`, `AppError` (`src/services/api.ts`) | Axios 4 tầng đính kèm JWT Bearer token và chuẩn hóa lỗi |
| **Domain Services** | `departmentService`, `programService` | Tải danh sách phòng ban và chương trình thực tập cho bộ lọc |

### 2.2. Thành Phần Cần Mở Rộng (Extension)

1. `src/constants/endpoints/attendance.endpoints.ts`: Thêm cụm URL `REPORTS` gồm 4 endpoints.
2. `src/constants/routes/hr.routes.ts`: Thêm route `ATTENDANCE_REPORTS: '/hr/attendance-reports'`.
3. `src/types/attendance.types.ts`: Thêm `DiligenceStatus`, `DailyDayStatus`, `AttendanceReportFilterParams`, `AttendanceSummaryKpiResponse`, `InternDiligenceReportResponse`, `InternAttendanceDetailReportResponse`, `DailyAttendanceDetailItem`.
4. `src/services/attendanceService.ts`: Thêm 4 phương thức gọi API báo cáo (`getAttendanceSummaryKpi`, `getInternDiligenceReports`, `getInternAttendanceDetailReport`, `exportAttendanceReportCsv`).
5. `src/components/layout/Sidebar.tsx`: Thêm menu item `"Báo Cáo Chuyên Cần"` trong danh mục dành cho `HR` và `ADMIN`.
6. `src/routes/AppRoutes.tsx`: Đăng ký route mới cho `HRAttendanceReportPage`.

---

## 3. Các Bước Triển Khai Chi Tiết (Implementation Steps - 7 Chuẩn Hóa)

### Bước 1: Khai Báo Endpoints, Routes & TypeScript Types Chuẩn Doanh Nghiệp
- Cập nhật [`src/constants/endpoints/attendance.endpoints.ts`](file:///d:/Module_6/InternHub-Frontend/src/constants/endpoints/attendance.endpoints.ts):
  ```typescript
  REPORTS: {
    SUMMARY: '/api/v1/attendances/reports/summary',
    INTERNS: '/api/v1/attendances/reports/interns',
    INTERN_DETAILS: (internId: number | string) => `/api/v1/attendances/reports/interns/${internId}/details`,
    EXPORT: '/api/v1/attendances/reports/export',
  }
  ```
- Cập nhật [`src/constants/routes/hr.routes.ts`](file:///d:/Module_6/InternHub-Frontend/src/constants/routes/hr.routes.ts):
  ```typescript
  ATTENDANCE_REPORTS: '/hr/attendance-reports',
  ```
- Cập nhật [`src/types/attendance.types.ts`](file:///d:/Module_6/InternHub-Frontend/src/types/attendance.types.ts) và barrel export [`src/types/index.ts`](file:///d:/Module_6/InternHub-Frontend/src/types/index.ts):
  - Định nghĩa đầy đủ `DiligenceStatus`, `DailyDayStatus`, `AttendanceReportFilterParams`, `AttendanceSummaryKpiResponse`, `InternDiligenceReportResponse`, `InternAttendanceDetailReportResponse`, `DailyAttendanceDetailItem`.

---

### Bước 2: Bổ Sung Tầng Dịch Vụ API (`attendanceService.ts`) & Xử Lý Tải Blob CSV
- Cập nhật [`src/services/attendanceService.ts`](file:///d:/Module_6/InternHub-Frontend/src/services/attendanceService.ts):
  1. `getAttendanceSummaryKpi(filter, signal)`: Trả về `AttendanceSummaryKpiResponse`.
  2. `getInternDiligenceReports(filter, signal)`: Trả về `PageResponse<InternDiligenceReportResponse>`.
  3. `getInternAttendanceDetailReport(internId, month, year, signal)`: Trả về `InternAttendanceDetailReportResponse`.
  4. `exportAttendanceReportCsv(filter, signal)`: Trả về `Blob` với `responseType: 'blob'`.
- Thêm tiện ích kích hoạt tải file CSV tự động:
  - Sử dụng `window.URL.createObjectURL(blob)`, tạo thẻ `<a download="BaoCaoChuyenCan_InternHub_Thang[M]_[YYYY].csv">` ảo, kích hoạt click và gọi ngay `revokeObjectURL` để chống rò rỉ bộ nhớ.

---

### Bước 3: Xây Dựng Custom Hooks Chuyên Trách
1. **`useHRAttendanceReport.ts`** (`src/pages/hr/attendance-reports/hooks/useHRAttendanceReport.ts`):
   - Quản lý state bộ lọc gom nhóm (`month`, `year`, `departmentId`, `programId`, `diligenceStatus`, `keyword`, `page`, `size`) $\rightarrow$ đảm bảo giới hạn $\le 3-4$ `useState`.
   - Gọi đồng thời 2 API: Dashboard Summary KPI và Danh sách chuyên cần TTS bằng `Promise.allSettled` hoặc chạy tuần tự an toàn.
   - Quản lý trạng thái xuất file CSV (`isExporting`) và thông báo Toast.
   - Hỗ trợ hàm `refetch`, `handleFilterChange`, `handleResetFilter`, `handleExportCsv`.
2. **`useInternAttendanceDetail.ts`** (`src/pages/hr/attendance-reports/hooks/useInternAttendanceDetail.ts`):
   - Lazy-load chi tiết bảng công của 1 TTS khi mở Modal chi tiết.
   - Quản lý `selectedInternId`, `detailData`, `isLoading`, `error`.

---

### Bước 4: Xây Dựng Sub-components Báo Cáo
Tổ chức tại `src/pages/hr/attendance-reports/components/`:
1. **`AttendanceReportKpiCards/`**:
   - 5 Thẻ KPI Thống kê: Tổng quân số TTS (kèm tỷ lệ trung bình), Tổng ngày công thực tế vs Kế hoạch, Lượt đi muộn & về sớm, Số ngày nghỉ phép có duyệt (kèm breakdown lý do), Số TTS báo động kỷ luật (`CRITICAL` bôi đỏ).
   - Thanh phân bổ kỷ luật (Diligence Distribution Bar) thể hiện trực quan tỷ trọng: Xuất sắc (xanh ngọc), Tốt (xanh dương), Cảnh báo (vàng hổ phách), Báo động (đỏ san hô).
   - Hỗ trợ Skeleton Shimmer khi đang tải.
2. **`AttendanceReportFilterBar/`**:
   - Thanh công cụ lọc đa chiều: Dropdown chọn Tháng (1-12), Năm (hiện tại và các năm trước), Dropdown chọn Phòng ban, Dropdown chọn Chương trình, Dropdown chọn Mức kỷ luật (`Tất cả`, `Xuất sắc`, `Tốt`, `Cảnh báo`, `Báo động`), Ô tìm kiếm SearchBar (debounce 350ms) và Nút `"Đặt lại bộ lọc"`.
3. **`InternDiligenceTable/`**:
   - Bảng danh sách chuyên cần TTS: Mã TTS, Họ tên, Phòng ban / Chương trình, Ngày công, Đi muộn, Nghỉ phép, Vắng K.phép, Tỷ lệ chuyên cần (%), Xếp loại kỷ luật (Badge tương ứng), Ghi chú cảnh báo, Cột Thao tác ghim cố định (`sticky right`).
   - Tối đa 10 dòng / trang. Tự động ẩn thanh phân trang khi tổng số TTS $\le 10$ dòng (Rule 31).
   - Xử lý đủ 5 trạng thái: Skeleton Shimmer, Empty có CTA, Error có Retry, Success, Disabled.
4. **`InternAttendanceDetailModal/`**:
   - Modal 3 khối xem ma trận ngày công chi tiết (Rule 29):
     - *Header cố định:* Họ tên TTS, Mã TTS, Phòng ban, Tháng/Năm, Badge Xếp loại kỷ luật.
     - *Body cuộn độc lập:* Mini Summary Strip + Bảng Ma trận ngày công từng ngày trong tháng (Ngày, Thứ, Badge `DailyDayStatus`, Giờ check-in/out, Giờ làm, GPS, Thông tin đơn nghỉ phép liên kết).
     - *Sticky Footer:* Nút `"Đóng"` (`variant="outline"`, phím tắt `Esc`).

---

### Bước 5: Ghép Nối Trang Chính (`HRAttendanceReportPage.tsx`)
- Tạo [`src/pages/hr/attendance-reports/HRAttendanceReportPage.tsx`](file:///d:/Module_6/InternHub-Frontend/src/pages/hr/attendance-reports/HRAttendanceReportPage.tsx) theo chuẩn **Standard Page Composition 4 lớp**:
  - *Lớp 1:* Header trang & Nút `"Làm mới"`, Nút `"Xuất Báo Cáo CSV"`.
  - *Lớp 2:* `AttendanceReportFilterBar` & `AttendanceReportKpiCards`.
  - *Lớp 3:* `InternDiligenceTable`.
  - *Lớp 4:* `InternAttendanceDetailModal`.
- Bao bọc toàn bộ nội dung bằng `ErrorBoundary` (Rule 24).
- Định kiểu bằng `HRAttendanceReportPage.module.css` sử dụng 100% CSS Variables ngữ nghĩa (Rule 23 & 28).

---

### Bước 6: Tích Hợp Định Tuyến (AppRoutes) & Điều Hướng Sidebar
1. Cập nhật [`src/routes/AppRoutes.tsx`](file:///d:/Module_6/InternHub-Frontend/src/routes/AppRoutes.tsx): Đăng ký route `/hr/attendance-reports` bên trong vùng bảo vệ quyền `HR` và `ADMIN`.
2. Cập nhật [`src/components/layout/Sidebar.tsx`](file:///d:/Module_6/InternHub-Frontend/src/components/layout/Sidebar.tsx): Bổ sung mục `"Báo Cáo Chuyên Cần"` (Icon: `BarChart3` hoặc `FileBarChart`) cho menu `HR` và `ADMIN`.

---

### Bước 7: Kiểm Thử, Rà Soát Lỗi Lint & Nghiệm Thu
1. Chạy lệnh kiểm tra TypeScript và Lint (`npm run lint` hoặc `npx tsc --noEmit`).
2. Kiểm thử xác nhận 12 Test Cases theo ma trận nghiệm thu (tải trang, lọc đa chiều, tìm kiếm, xem ma trận modal, xuất CSV, tự ẩn phân trang khi $\le 10$ dòng, chống double-click, kiểm tra Dark/Light Mode).
3. Lập báo cáo kết quả thực hiện (`walkthrough.md`).

---

## 4. Ma Trận Kiểm Thử Nghiệm Thu (Acceptance Test Matrix)

| STT | Kịch bản kiểm thử | Hành vi kỳ vọng (Expected Behavior) | Kết quả |
| :---: | :--- | :--- | :---: |
| **TC-01** | Điều hướng từ Sidebar vào Báo cáo chuyên cần | Click menu `"Báo Cáo Chuyên Cần"`, chuyển đến `/hr/attendance-reports`. Hiển thị Skeleton rồi hiển thị 5 thẻ KPI và bảng TTS. | Chờ thực thi |
| **TC-02** | Hiển thị 5 Thẻ KPI & Thanh phân bổ kỷ luật | Số liệu quân số, ngày công, lượt muộn, ngày nghỉ và phân bổ kỷ luật hiển thị khớp 100% với API Summary. | Chờ thực thi |
| **TC-03** | Lọc theo Tháng và Năm | Chọn tháng khác (ví dụ Tháng 9/2026), dữ liệu KPI và bảng danh sách cập nhật theo tháng mới. | Chờ thực thi |
| **TC-04** | Lọc theo Phòng ban / Chương trình | Chọn phòng ban/chương trình, bảng danh sách chỉ hiển thị các TTS thuộc tiêu chí đã chọn. | Chờ thực thi |
| **TC-05** | Lọc theo Mức độ kỷ luật (CRITICAL) | Chọn `diligenceStatus = CRITICAL`, bảng chỉ hiển thị các TTS ở mức báo động kỷ luật. | Chờ thực thi |
| **TC-06** | Tìm kiếm nhanh TTS theo tên / mã TTS | Gõ tên hoặc mã TTS vào ô SearchBar, bảng lọc ra kết quả sau debounce 350ms. | Chờ thực thi |
| **TC-07** | Bảng danh sách 10 dòng & Tự ẩn phân trang (Rule 31) | Khi tổng số TTS $\le 10$, thanh phân trang tự động ẩn đi; khi $> 10$, thanh phân trang hiển thị chuẩn. | Chờ thực thi |
| **TC-08** | Mở Modal Ma trận ngày công chi tiết (Rule 29) | Bấm `"Xem bảng công"`, mở modal 3 khối hiển thị chi tiết 28 - 31 ngày trong tháng của TTS kèm badge trạng thái và GPS. | Chờ thực thi |
| **TC-09** | Xuất file báo cáo CSV UTF-8 BOM | Bấm `"Xuất Báo Cáo CSV"`, tải file `BaoCaoChuyenCan_InternHub_Thang[M]_[YYYY].csv`, mở trên Excel không lỗi tiếng Việt. | Chờ thực thi |
| **TC-10** | Chống Double-Click (Rule 31 & 32) | Trong khi API đang tải hoặc đang xuất CSV, nút bấm bị disabled, con trỏ đổi thành `not-allowed`. | Chờ thực thi |
| **TC-11** | Chặn phân quyền tài khoản INTERN | Tài khoản TTS không thấy menu trên Sidebar và bị chặn 403 Forbidden nếu cố tình truy cập route. | Chờ thực thi |
| **TC-12** | Tương thích 2 chiều Dark/Light Mode (Rule 28) | Chuyển đổi giao diện Sáng / Tối, màu nền thẻ, chữ, viền và các badge kỷ luật tự thích ứng hoàn hảo. | Chờ thực thi |

---

## 5. Cam Kết Ranh Giới An Toàn (Boundary Isolation Guarantee)

- [x] **100% Frontend Only:** Toàn bộ công việc chỉ thực hiện trong `InternHub-Frontend/`. Không sửa bất kỳ file Java nào thuộc `InternHub/`.
- [x] **Zero Mock Bypass:** Kết nối trực tiếp với Microservice backend thật trên cổng `8082` qua API Gateway `8080`.
- [x] **No Git Commit/Push:** Không tự tiện commit hay push mã nguồn lên repository.
- [x] **Tuân thủ quy trình chờ duyệt:** Chờ sự phê duyệt rõ ràng từ người dùng đối với Kế hoạch triển khai này trước khi tiến hành viết code.
