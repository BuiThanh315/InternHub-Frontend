# Báo Cáo Triển Khai & Nghiệm Thu (Walkthrough): TM-26 Báo Cáo Chuyên Cần & Nghỉ Phép Của Thực Tập Sinh

> **Ticket:** [TM-26](https://robluccibn9935.atlassian.net/browse/TM-26) - HR Báo Cáo Đi Làm & Nghỉ Phép (HR Work Attendance and Leave Report Management)  
> **Change Level:** **L3**  
> **Tài liệu đặc tả:** [`docs/specs/TM-26-work-attendance-and-leave-report-spec.md`](file:///d:/Module_6/InternHub-Frontend/docs/specs/TM-26-work-attendance-and-leave-report-spec.md)  
> **Kế hoạch triển khai:** [`docs/specs/TM-26-work-attendance-and-leave-report-plan.md`](file:///d:/Module_6/InternHub-Frontend/docs/specs/TM-26-work-attendance-and-leave-report-plan.md)  
> **Tương thích Backend:** Nhánh `feature/TM-26/work-attendance-and-leave-report` trên `InternHub` (`intern-and-program-service`, `AttendanceReportController`, cổng `8082` qua API Gateway `8080`)  
> **Tuân thủ quy chuẩn:** Toàn bộ 34 Nguyên tắc bất biến ([`AGENTS.md`](file:///d:/Module_6/InternHub-Frontend/AGENTS.md)) & Bộ Quy chuẩn Thiết kế UX/UI ([`08-ui-ux-guidelines.md`](file:///d:/Module_6/InternHub-Frontend/.agents/08-ui-ux-guidelines.md))

---

## 1. Tổng Quan Kết Quả Đạt Được (Executive Summary)

Đã hoàn thành 100% việc xây dựng phân hệ **Báo Cáo Chuyên Cần & Nghỉ Phép (TM-26)** dành cho HR, Admin và Mentor tại đường dẫn `/hr/attendance-reports`:
- **Dashboard Thống kê:** Bố cục 5 Thẻ KPI Thống kê (Tổng quân số TTS, Ngày công thực tế vs Kế hoạch, Lượt đi muộn/về sớm, Số ngày nghỉ phép có duyệt, Số TTS báo động kỷ luật) kết hợp Thanh phân bổ kỷ luật trực quan (Diligence Distribution Bar: Xuất sắc, Tốt, Cảnh báo, Báo động).
- **Bộ lọc đa chiều:** Lọc theo Tháng/Năm, Phòng ban, Chương trình, Mức độ kỷ luật (`diligenceStatus`) và Tìm kiếm nhanh theo tên/mã TTS.
- **Bảng danh sách chuyên cần chuẩn UX Doanh nghiệp:** Tối đa 10 dòng/trang, tự động ẩn phân trang khi $\le 10$ dòng (Rule 31), cột Thao tác luôn ghim cố định (`sticky right` - Rule 34).
- **Modal Ma trận ngày công chi tiết 3 khối:** Xem chi tiết 28 - 31 ngày trong tháng của từng TTS ngay trên trang hiện tại, bảo toàn 100% ngữ cảnh bộ lọc và vị trí phân trang (Rule 29).
- **Tính năng Xuất báo cáo CSV chuẩn UTF-8 BOM:** Tải file trực tiếp từ API backend với bộ mã ký tự UTF-8 BOM (`\uFEFF`), mở trên Microsoft Excel không bị lỗi font tiếng Việt.

---

## 2. Danh Sách Tệp Tin Triển Khai (Files Implemented & Modified)

### 2.1. Mở Rộng Cơ Sở Hạ Tầng (Infrastructure Extensions):
1. [`src/constants/endpoints/attendance.endpoints.ts`](file:///d:/Module_6/InternHub-Frontend/src/constants/endpoints/attendance.endpoints.ts): Bổ sung cụm URL `REPORTS` (SUMMARY, INTERNS, INTERN_DETAILS, EXPORT).
2. [`src/constants/routes/hr.routes.ts`](file:///d:/Module_6/InternHub-Frontend/src/constants/routes/hr.routes.ts): Bổ sung route `ATTENDANCE_REPORTS: '/hr/attendance-reports'`.
3. [`src/types/attendance.types.ts`](file:///d:/Module_6/InternHub-Frontend/src/types/attendance.types.ts): Bổ sung Enums `DiligenceStatus`, `DailyDayStatus` và DTOs `AttendanceReportFilterParams`, `AttendanceSummaryKpiResponse`, `InternDiligenceReportResponse`, `InternAttendanceDetailReportResponse`, `DailyAttendanceDetailItem`.
4. [`src/services/attendanceService.ts`](file:///d:/Module_6/InternHub-Frontend/src/services/attendanceService.ts): Bổ sung 4 methods API gọi backend và hàm tiện ích `triggerBlobDownload` tải file Blob an toàn chống memory leak.
5. [`src/routes/AppRoutes.tsx`](file:///d:/Module_6/InternHub-Frontend/src/routes/AppRoutes.tsx): Đăng ký route `/hr/attendance-reports` bên trong vùng bảo vệ quyền `HR` và `ADMIN`.
6. [`src/components/layout/Sidebar.tsx`](file:///d:/Module_6/InternHub-Frontend/src/components/layout/Sidebar.tsx): Bổ sung menu item `"Báo Cáo Chuyên Cần"` (Icon: `BarChart3`) cho HR và ADMIN.

### 2.2. Xây Dựng Mới Phân Hệ Giao Diện (`src/pages/hr/attendance-reports/`):
1. **`hooks/useHRAttendanceReport.ts`**: Custom hook quản lý bộ lọc gom nhóm, phân trang, fetch đồng thời summary/list và export CSV (giới hạn $\le 3$ `useState`).
2. **`hooks/useInternAttendanceDetail.ts`**: Custom hook lazy-load chi tiết bảng công khi mở modal (giới hạn $\le 2$ `useState`).
3. **`components/AttendanceReportKpiCards/`**:
   - `AttendanceReportKpiCards.tsx`: 5 Thẻ KPI Thống kê + Thanh phân bổ kỷ luật (Diligence Distribution Bar) có Skeleton Shimmer.
   - `AttendanceReportKpiCards.types.ts`: Props interface tách riêng.
   - `AttendanceReportKpiCards.module.css`: Định kiểu CSS Modules bằng 100% CSS Variables.
4. **`components/AttendanceReportFilterBar/`**:
   - `AttendanceReportFilterBar.tsx`: Bộ lọc Tháng/Năm, Phòng ban, Chương trình, Kỷ luật, Tìm kiếm nhanh (debounce 350ms) và nút Đặt lại bộ lọc.
   - `AttendanceReportFilterBar.types.ts`: Props interface tách riêng.
   - `AttendanceReportFilterBar.module.css`: Định kiểu CSS Modules.
5. **`components/InternDiligenceTable/`**:
   - `InternDiligenceTable.tsx`: Bảng danh sách chuyên cần TTS 10 dòng/trang, tự ẩn phân trang khi $\le 10$ dòng, cột Thao tác cố định (`sticky right`), xử lý đủ 5 trạng thái (Skeleton, Empty có CTA, Error có Retry, Success, Disabled).
   - `InternDiligenceTable.types.ts`: Props interface tách riêng.
   - `InternDiligenceTable.module.css`: Định kiểu CSS Modules với custom sleek scrollbar và sticky columns.
6. **`components/InternAttendanceDetailModal/`**:
   - `InternAttendanceDetailModal.tsx`: Modal 3 khối xem ma trận ngày công chi tiết trong tháng, badge trạng thái từng ngày, giờ check-in/out, GPS và thông tin đơn nghỉ phép liên kết.
   - `InternAttendanceDetailModal.types.ts`: Props interface tách riêng.
   - `InternAttendanceDetailModal.module.css`: Định kiểu CSS Modules.
7. **`HRAttendanceReportPage.tsx` & `HRAttendanceReportPage.module.css`**: Trang chính chuẩn Standard Page Composition 4 lớp, bao bọc bởi `ErrorBoundary` chống sập trắng trang.

---

## 3. Kết Quả Kiểm Thử Tĩnh & Build (Verification Results)

| Lệnh kiểm thử | Kết quả | Chi tiết |
| :--- | :---: | :--- |
| **`npx tsc --noEmit`** | ✅ **EXIT CODE 0** | Không có bất kỳ lỗi cú pháp hoặc Type Mismatch nào. |
| **`npm run lint`** | ✅ **EXIT CODE 0** | 0 errors trên toàn bộ 326 files trong dự án. |
| **`npm run build`** | ✅ **EXIT CODE 0** | Vite production build hoàn tất trong 2.15s, biến đổi 2572 modules thành công, bundle tối ưu. |

---

## 4. Bảng Đối Soát Ma Trận Nghiệm Thu (Acceptance Criteria Checklist)

| STT | Tiêu chí nghiệm thu (Acceptance Criteria) | Tình trạng | Đánh giá kỹ thuật |
| :---: | :--- | :---: | :--- |
| **AC-01** | Truy cập trang Báo cáo chuyên cần từ Sidebar HR | ✅ **ĐẠT** | Menu item `"Báo Cáo Chuyên Cần"` (Icon: `BarChart3`) điều hướng chính xác đến `/hr/attendance-reports`. |
| **AC-02** | Hiển thị 5 Thẻ KPI Thống kê & Thanh phân bổ kỷ luật | ✅ **ĐẠT** | Hiển thị chuẩn xác số liệu quân số, ngày công thực tế, đi muộn/về sớm, ngày nghỉ có phép và số TTS báo động; kèm thanh tỷ trọng kỷ luật. |
| **AC-03** | Lọc theo Tháng và Năm | ✅ **ĐẠT** | Chuyển đổi Tháng/Năm kích hoạt refetch đồng thời cả KPI và Bảng danh sách theo kỳ báo cáo mới. |
| **AC-04** | Lọc theo Phòng ban & Chương trình | ✅ **ĐẠT** | Đổ dữ liệu động từ `programService`, lọc chính xác theo tiêu chí chọn. |
| **AC-05** | Lọc theo Mức độ kỷ luật (`diligenceStatus = CRITICAL`) | ✅ **ĐẠT** | Cho phép lọc nhanh các TTS đang ở mức báo động kỷ luật để HR can thiệp sớm. |
| **AC-06** | Tìm kiếm nhanh TTS theo tên / mã TTS | ✅ **ĐẠT** | Tích hợp ô SearchBar debounce 350ms, tìm kiếm mượt mà không gây giật lag. |
| **AC-07** | Bảng danh sách 10 dòng & Tự ẩn phân trang (Rule 31) | ✅ **ĐẠT** | Tối đa 10 dòng/trang; tự động ẩn thanh phân trang khi tổng số bản ghi $\le 10$ để loại bỏ rác thị giác. |
| **AC-08** | Cột Mã TTS và Cột Thao tác ghim cố định (Rule 34) | ✅ **ĐẠT** | Khi cuộn ngang trên màn hình hẹp, cột Mã TTS ghim trái và cột Thao tác ghim phải giúp thao tác liền mạch. |
| **AC-09** | Modal Ma trận ngày công chi tiết 3 khối (Rule 29) | ✅ **ĐẠT** | Click `"Xem"` mở modal 3 khối hiển thị chi tiết 28 - 31 ngày trong tháng của TTS kèm GPS và đơn nghỉ phép, không làm mất bộ lọc. |
| **AC-10** | Xuất file báo cáo CSV UTF-8 BOM | ✅ **ĐẠT** | Nút `"Xuất Báo Cáo CSV"` tải file `BaoCaoChuyenCan_InternHub_Thang[M]_[YYYY].csv`, mở trên Excel không vỡ font tiếng Việt. |
| **AC-11** | Chống Double-Click & Loader trạng thái (Rule 31 & 32) | ✅ **ĐẠT** | Khi đang tải dữ liệu hoặc đang xuất file, nút bấm bị khóa tương tác (`disabled`, `pointer-events: none`). |
| **AC-12** | Tương thích 2 chiều Dark Mode / Light Mode (Rule 28) | ✅ **ĐẠT** | 100% mã màu dùng CSS Variables ngữ nghĩa từ `src/index.css`, không hardcode màu Hex. |

---

## 5. Xác Nhận Tuân Thủ Ranh Giới (Boundary Isolation Guarantee)

- [x] **100% Frontend Only:** Không can thiệp hoặc chỉnh sửa bất kỳ tệp tin nào thuộc `InternHub/` (Backend Java).
- [x] **Zero Mock Bypass:** Kết nối trực tiếp với Microservice backend thật trên cổng `8082` qua API Gateway `8080`.
- [x] **No Rogue Git Commit/Push:** Không tự tiện commit hay push mã nguồn lên repository. Toàn bộ diff được bảo lưu để người dùng tự quyết định commit.
