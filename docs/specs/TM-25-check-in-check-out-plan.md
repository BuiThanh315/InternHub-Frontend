# Kế Hoạch Triển Khai (Implementation Plan) - TM-25: Điểm Danh & Chấm Công Thực Tập Sinh Bằng Định Vị GPS

> **Ticket:** [TM-25](https://robluccibn9935.atlassian.net/browse/TM-25) - Điểm Danh & Chấm Công Thực Tập Sinh Hàng Ngày Bằng Định Vị Toạ Độ GPS (Intern GPS Check-in / Check-out & Attendance Tracking)  
> **Change Level:** **L3**  
> **Tài liệu đặc tả liên quan:** [`docs/specs/TM-25-check-in-check-out-spec.md`](file:///d:/Module_6/InternHub-Frontend/docs/specs/TM-25-check-in-check-out-spec.md)  
> **Backend Service:** `intern-and-program-service` (Port `8082` qua API Gateway `8080`)  
> **Tuân thủ quy chuẩn:** 34 Nguyên tắc bất biến ([`AGENTS.md`](file:///d:/Module_6/InternHub-Frontend/AGENTS.md)) & Bộ Quy chuẩn Thiết kế UX/UI ([`08-ui-ux-guidelines.md`](file:///d:/Module_6/InternHub-Frontend/.agents/08-ui-ux-guidelines.md))

---

## 1. Mục Tiêu & Kiến Trúc Dự Kiến (Architecture & Goals)

Xây dựng toàn diện giao diện và luồng nghiệp vụ phía Frontend cho tính năng **TM-25 (Intern GPS Check-in / Check-out & Attendance Tracking)**:
- Cho phép Thực tập sinh (`ROLE_INTERN`) thực hiện điểm danh vào ca sáng (Check-in) và tan ca chiều (Check-out) qua toạ độ địa lý thực tế (HTML5 Geolocation API), xác thực bán kính quy định $25\text{m}$ quanh văn phòng doanh nghiệp.
- Cập nhật thời gian thực trạng thái chuyên cần (`ON_TIME`, `LATE`, `EARLY_LEAVE`, `LATE_AND_EARLY_LEAVE`) và tổng số giờ làm việc trong ngày.
- Cung cấp trang chuyên sâu tra cứu lịch sử chấm công cá nhân (`/intern/attendance`) kèm 4 thẻ KPI thống kê tháng và bảng chấm công chi tiết tuân thủ chuẩn tối đa 10 dòng tự ẩn phân trang.
- Kết nối trực tiếp với Microservice Backend `intern-and-program-service` (Port `8082`) qua API Gateway (Port `8080`).

### Phê Duyệt Endpoint & Route (Bắt buộc theo Nguyên tắc 11 & 17):
- **API Endpoints:**
  1. `GET /api/v1/attendances/today` (Lấy trạng thái chấm công của TTS trong ngày hôm nay)
  2. `POST /api/v1/attendances/check-in` (Gửi toạ độ check-in vào ca - payload: `{ latitude, longitude, notes }`)
  3. `POST /api/v1/attendances/check-out` (Gửi toạ độ check-out tan ca - payload: `{ latitude, longitude, notes }`)
  4. `GET /api/v1/attendances/my-history?month=M&year=Y` (Lấy dữ liệu tổng hợp lịch sử chấm công theo tháng/năm)
- **Routes:**
  1. `ROUTES.INTERN.ATTENDANCE = '/intern/attendance'` (Trang tra cứu lịch sử chấm công & chuyên cần)
  2. Widget chấm công trực tiếp tại `ROUTES.INTERN.DASHBOARD = '/intern/dashboard'`

---

## 2. Các Bước Triển Khai Chi Tiết (Implementation Steps)

### Bước 1: Khai Báo Endpoints & Types Chuẩn Doanh Nghiệp
1. Tạo [`src/constants/endpoints/attendance.endpoints.ts`](file:///d:/Module_6/InternHub-Frontend/src/constants/endpoints/attendance.endpoints.ts):
   - `TODAY: '/api/v1/attendances/today'`
   - `CHECK_IN: '/api/v1/attendances/check-in'`
   - `CHECK_OUT: '/api/v1/attendances/check-out'`
   - `MY_HISTORY: '/api/v1/attendances/my-history'`
   - Cập nhật barrel export tại [`src/constants/endpoints/index.ts`](file:///d:/Module_6/InternHub-Frontend/src/constants/endpoints/index.ts).
2. Cập nhật [`src/constants/routes/intern.routes.ts`](file:///d:/Module_6/InternHub-Frontend/src/constants/routes/intern.routes.ts):
   - Thêm `ATTENDANCE: '/intern/attendance'`.
3. Tạo [`src/types/attendance.types.ts`](file:///d:/Module_6/InternHub-Frontend/src/types/attendance.types.ts):
   - `AttendanceStatus`: `'ON_TIME' | 'LATE' | 'EARLY_LEAVE' | 'LATE_AND_EARLY_LEAVE' | 'ABSENT'`
   - `TodayAttendanceResponse`, `CheckInRequest`, `CheckOutRequest`, `AttendanceRecordResponse`, `MonthlyAttendanceSummaryResponse`.
   - `GeolocationCoordinates`, `GeolocationState`.
   - Cập nhật barrel export tại [`src/types/index.ts`](file:///d:/Module_6/InternHub-Frontend/src/types/index.ts).

---

### Bước 2: Tầng Dịch Vụ API (`attendanceService.ts`) & Haversine Client Helper
1. Tạo [`src/services/attendanceService.ts`](file:///d:/Module_6/InternHub-Frontend/src/services/attendanceService.ts):
   - Tuân thủ chuẩn Axios 4 tầng, nhận `AbortSignal` cho mọi call API.
   - `getTodayAttendance(signal?: AbortSignal): Promise<TodayAttendanceResponse>`
   - `checkIn(data: CheckInRequest, signal?: AbortSignal): Promise<AttendanceRecordResponse>`
   - `checkOut(data: CheckOutRequest, signal?: AbortSignal): Promise<AttendanceRecordResponse>`
   - `getMyAttendanceHistory(params?: { month?: number; year?: number }, signal?: AbortSignal): Promise<MonthlyAttendanceSummaryResponse>`
   - Helper tính khoảng cách Haversine client-side `calculateHaversineDistance(lat1, lon1, lat2, lon2): number` để kiểm tra cự ly trước khi gửi request (Pre-validation UX).

---

### Bước 3: Xây Dựng Bộ Custom Hooks Chuyên Trách
1. Tạo [`src/hooks/useGeolocation.ts`](file:///d:/Module_6/InternHub-Frontend/src/hooks/useGeolocation.ts):
   - Gọi an toàn `navigator.geolocation.getCurrentPosition`.
   - Quản lý trạng thái: `coords`, `loading`, `error`, `accuracy`, `permissionDenied`.
   - Tùy chọn cấu hình: `enableHighAccuracy: true`, `timeout: 10000`, `maximumAge: 0`.
   - Hàm `refreshLocation()` cho phép quét lại toạ độ tức thì.
2. Tạo [`src/pages/intern/hooks/useAttendanceToday.ts`](file:///d:/Module_6/InternHub-Frontend/src/pages/intern/hooks/useAttendanceToday.ts):
   - Gọi API lấy dữ liệu hôm nay, timer đồng hồ số chạy từng giây (`HH:mm:ss`).
   - Midnight watcher: Tự động tải lại dữ liệu khi qua 00:00 sáng ngày mới.
3. Tạo [`src/pages/intern/hooks/useAttendanceHistory.ts`](file:///d:/Module_6/InternHub-Frontend/src/pages/intern/hooks/useAttendanceHistory.ts):
   - Quản lý state tháng/năm, loading, fetching dữ liệu tổng hợp tháng, refetch.

---

### Bước 4: Widget Chấm Công Hero Trên `InternDashboard.tsx`
Tạo thư mục [`src/pages/intern/components/Attendance/`](file:///d:/Module_6/InternHub-Frontend/src/pages/intern/components/Attendance/):
1. `InternAttendanceWidget.types.ts`: Props gồm `todayData`, `loading`, `onOpenActionModal`, `onRefresh`.
2. `InternAttendanceWidget.module.css`: CSS Variables ngữ nghĩa 100%, Card Hero hiện đại, gradient tinh tế, đồng hồ số nổi bật.
3. `InternAttendanceWidget.tsx`:
   - Đồng hồ số thời gian thực (`HH:mm:ss`) kèm ngày tháng hiện tại.
   - Huy hiệu trạng thái ngày công (`CHƯA CHECK-IN`, `ĐÚNG GIỜ`, `ĐI MUỘN`, `VỀ SỚM`, `HOÀN THÀNH`).
   - Giờ vào / ra thực tế và tổng giờ làm việc tạm tính.
   - Nút hành động chính:
     - "Điểm Danh Vào Ca (Check-in)" khi chưa check-in.
     - "Điểm Danh Tan Ca (Check-out)" khi đã check-in nhưng chưa check-out.
     - Khóa nút khi đã hoàn thành cả 2 lượt trong ngày.
   - Liên kết mở trang Lịch Sử Chấm Công.

---

### Bước 5: Modal Thao Tác Chấm Công GPS Chuẩn 3 Khối (`AttendanceActionModal`)
1. Tạo `AttendanceRadarScan.tsx` + `AttendanceRadarScan.module.css`:
   - Hiệu ứng Radar xoay mượt mà với 3 vòng tròn đồng tâm biểu diễn toạ độ và vệ tinh định vị.
2. Tạo `AttendanceActionModal.types.ts`:
   - Type `actionType: 'CHECK_IN' | 'CHECK_OUT'`, toạ độ văn phòng mặc định, props modal.
3. Tạo `AttendanceActionModal.module.css`:
   - Chuẩn 3 khối (Fixed Header, Scrollable Body, Sticky Footer).
4. Tạo `AttendanceActionModal.tsx`:
   - **Header cố định:** Tiêu đề động ("Điểm Danh Vào Ca" / "Điểm Danh Tan Ca"), icon vệ tinh, nút đóng `X`.
   - **Body cuộn độc lập:**
     - Radar quét GPS động.
     - Toạ độ GPS thực tế: Vĩ độ, Kinh độ, Sai số đo lường ($\pm X\text{m}$).
     - Đánh giá khoảng cách: Hiển thị xanh nếu $\le 25\text{m}$, hiển thị đỏ cảnh báo nếu $> 25\text{m}$.
     - Cảnh báo về sớm nếu Check-out trước $17:30$.
     - Ô nhập ghi chú công việc tùy chọn (`notes`, tối đa 255 ký tự).
   - **Sticky Footer ghim đáy:** Nút "Lấy lại toạ độ (Quét lại)", nút "Hủy" và nút "Xác Nhận Check-in/Check-out" (kèm loader spinner, chống double-click).
   - **Xử lý Mutation UX (Nguyên tắc 24):** Giữ nguyên ghi chú khi API lỗi, hiển thị Alert đỏ và nút "Thử lại".

---

### Bước 6: Trang & Bảng Lịch Sử Chấm Công Cá Nhân (`InternAttendancePage`)
1. Tạo `AttendanceSummaryCards.tsx` + `AttendanceSummaryCards.module.css`:
   - 4 Thẻ KPI: Tổng ngày công, Đúng giờ tuyệt đối, Số lần đi muộn / về sớm, Tổng giờ tích luỹ.
2. Tạo `AttendanceHistoryTable.tsx` + `AttendanceHistoryTable.types.ts` + `AttendanceHistoryTable.module.css`:
   - Hiển thị danh sách ngày công: Ngày, Giờ vào, Giờ ra, Tổng giờ, Huy hiệu trạng thái, Ghi chú.
   - Tuân thủ Nguyên tắc 31: Tối đa 10 dòng/trang, tự động ẩn phân trang khi $\le 10$ bản ghi, bo góc liền mạch.
   - Cột ngày làm việc cố định (`sticky left: 0`), Custom Sleek Scrollbar mảnh 6px.
   - 5 trạng thái: Skeleton Shimmer, Empty State có icon và CTA, Error State Retry, Success Toast, Disabled.
3. Tạo `InternAttendancePage.tsx` + `InternAttendancePage.module.css`:
   - Header trang kèm quy định thời gian làm việc chuẩn ($08:00 - 17:30$).
   - Bộ chọn Tháng và Năm, nút "Tháng hiện tại".
   - Tích hợp 4 thẻ KPI và Bảng lịch sử chấm công.

---

### Bước 7: Tích Hợp Dashboard, Navigation Sidebar & Routing
1. Cập nhật [`src/pages/intern/InternDashboard.tsx`](file:///d:/Module_6/InternHub-Frontend/src/pages/intern/InternDashboard.tsx):
   - Đặt `InternAttendanceWidget` ở hàng đầu tiên (trên Stepper hoặc ngay dưới Header) khi TTS đã có Profile.
   - Kết nối `AttendanceActionModal` mở và đóng đồng bộ.
2. Cập nhật [`src/components/layout/Sidebar.tsx`](file:///d:/Module_6/InternHub-Frontend/src/components/layout/Sidebar.tsx):
   - Bổ sung menu item *"Chấm Công & Chuyên Cần"* (icon `CalendarCheck` từ `lucide-react`) cho role `INTERN` trỏ tới `/intern/attendance`.
3. Cập nhật [`src/routes/AppRoutes.tsx`](file:///d:/Module_6/InternHub-Frontend/src/routes/AppRoutes.tsx):
   - Khai báo route bảo vệ `<Route path={ROUTES.INTERN.ATTENDANCE} element={<InternAttendancePage />} />` trong nhóm quyền `['INTERN', 'USER', 'ADMIN']`.

---

### Bước 8: Kiểm Thử, Build Kiểm Tra & Báo Cáo
1. Chạy lệnh kiểm tra TypeScript và Build: `npm run build`.
2. Kiểm thử luồng trải nghiệm người dùng với tài khoản thực tế (`INTERN`):
   - Cấp quyền Geolocation trên trình duyệt $\rightarrow$ Radar quét thành công toạ độ.
   - Thử nghiệm Check-in hợp lệ $\rightarrow$ Trạng thái cập nhật, toast chúc mừng, Widget hiển thị đã vào ca.
   - Thử nghiệm Check-out chiều $\rightarrow$ Tính tổng giờ làm việc, khóa nút bấm.
   - Kiểm tra trang Lịch sử chấm công: Chuyển đổi Tháng/Năm, tự ẩn phân trang khi $\le 10$ dòng, hiển thị đầy đủ 4 thẻ KPI.
   - Kiểm tra các tình huống ngoại lệ: Chặn quyền vị trí (Banner hướng dẫn), mạng chập chờn giữ nguyên modal, chống double-click.
3. Tạo báo cáo nghiệm thu [`walkthrough.md`](file:///C:/Users/Admin/.gemini/antigravity-ide/brain/4271b5e0-1241-435f-b915-5e36f9622984/walkthrough.md).

---

## 3. Danh Sách File Sẽ Tạo & Chỉnh Sửa

| STT | File Path | Thao Tác | Mục Đích |
| :---: | :--- | :---: | :--- |
| 1 | `src/constants/endpoints/attendance.endpoints.ts` | Tạo mới | Khai báo 4 endpoint REST API chấm công |
| 2 | `src/constants/endpoints/index.ts` | Chỉnh sửa | Barrel export endpoint |
| 3 | `src/constants/routes/intern.routes.ts` | Chỉnh sửa | Bổ sung `ATTENDANCE` route |
| 4 | `src/types/attendance.types.ts` | Tạo mới | DTOs, Enums và Interfaces chấm công & vị trí |
| 5 | `src/types/index.ts` | Chỉnh sửa | Barrel export types |
| 6 | `src/services/attendanceService.ts` | Tạo mới | Axios 4 tầng, Haversine helper |
| 7 | `src/hooks/useGeolocation.ts` | Tạo mới | Hook lấy GPS trình duyệt an toàn |
| 8 | `src/pages/intern/hooks/useAttendanceToday.ts` | Tạo mới | Hook realtime clock & fetching hôm nay |
| 9 | `src/pages/intern/hooks/useAttendanceHistory.ts` | Tạo mới | Hook lọc và tải lịch sử tháng |
| 10 | `src/pages/intern/components/Attendance/AttendanceRadarScan.tsx` + `.module.css` | Tạo mới | Component radar quét GPS |
| 11 | `src/pages/intern/components/Attendance/AttendanceActionModal.tsx` + `.types.ts` + `.module.css` | Tạo mới | Modal check-in/out GPS chuẩn 3 khối |
| 12 | `src/pages/intern/components/Attendance/InternAttendanceWidget.tsx` + `.types.ts` + `.module.css` | Tạo mới | Hero Widget chấm công Dashboard |
| 13 | `src/pages/intern/components/Attendance/AttendanceSummaryCards.tsx` + `.module.css` | Tạo mới | 4 Thẻ KPI thống kê chuyên cần |
| 14 | `src/pages/intern/components/Attendance/AttendanceHistoryTable.tsx` + `.types.ts` + `.module.css` | Tạo mới | Bảng lịch sử <= 10 dòng tự ẩn phân trang |
| 15 | `src/pages/intern/components/Attendance/index.ts` | Tạo mới | Barrel export components chấm công |
| 16 | `src/pages/intern/InternAttendancePage.tsx` + `.module.css` | Tạo mới | Trang lịch sử chấm công cá nhân |
| 17 | `src/pages/intern/InternDashboard.tsx` | Chỉnh sửa | Tích hợp InternAttendanceWidget |
| 18 | `src/components/layout/Sidebar.tsx` | Chỉnh sửa | Menu item "Chấm Công & Chuyên Cần" |
| 19 | `src/routes/AppRoutes.tsx` | Chỉnh sửa | Khai báo route `/intern/attendance` |
