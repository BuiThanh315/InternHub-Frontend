# Specification: Điểm Danh & Chấm Công Thực Tập Sinh Bằng Định Vị GPS (TM-25)

> **Tài liệu Đặc Tả Kỹ Thuật Giao Diện & Trải Nghiệm Người Dùng (Frontend UI/UX Specification)**  
> **Dự án:** `InternHub-Frontend` (React 19 + TypeScript + Vite + CSS Modules)  
> **Mã Jira Ticket:** [TM-25](https://robluccibn9935.atlassian.net/browse/TM-25) - Quản lý Chấm công & Điểm danh Thực tập sinh qua GPS (Intern GPS Check-in / Check-out & Attendance Tracking)  
> **Backend Microservice:** `intern-and-program-service` (Port `8082` qua API Gateway `8080`)  
> **Nhánh Git dự kiến:** `feat/TM-25-check-in-check-out`  
> **Change Level:** **L3** (Hạ tầng Endpoints mới, Types TypeScript chuẩn hóa, Attendance Domain Service, Custom Hook `useGeolocation` & `useAttendance`, Dashboard Widget Chấm công thời gian thực, Attendance Action Modal chuẩn 3 khối kèm Radar quét GPS, Trang/Modal Lịch sử Chấm công cá nhân & Báo cáo tổng hợp tháng)  
> **Tuân thủ quy chuẩn:** 34 Nguyên tắc bất biến ([`AGENTS.md`](file:///d:/Module_6/InternHub-Frontend/AGENTS.md)) & Toàn bộ 11 chương Hướng dẫn Thiết kế UX/UI ([`08-ui-ux-guidelines.md`](file:///d:/Module_6/InternHub-Frontend/.agents/08-ui-ux-guidelines.md))

---

## 0. Nhật Ký Thay Đổi & Giải Trình Kỹ Thuật (Revision History)

| Phiên bản | Ngày | Người thực hiện | Task / Story | Loại thay đổi | Lý do & Giải trình kỹ thuật (Rationale) |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **v1.0** | 2026-09-29 | Senior Frontend AI Pair-Programmer | `TM-25` | Tạo mới (Draft) | Đặc tả toàn diện giao diện Frontend kết nối trực tiếp bộ API Backend TM-25 (`intern-and-program-service`), bảo đảm trải nghiệm chấm công GPS mượt mà, trực quan, chính xác và an toàn. |

---

## 1. Feature Overview (Tổng Quan Tính Năng)

- **Tên tính năng:** Điểm Danh & Chấm Công Thực Tập Sinh Hàng Ngày Bằng Định Vị Toạ Độ GPS (Intern GPS Attendance Tracking).
- **Mục đích:** Cung cấp cho Thực tập sinh (`ROLE_INTERN`) công cụ điểm danh vào ca (Check-in) và tan ca (Check-out) ngay trên giao diện Web thông qua toạ độ địa lý thực tế (HTML5 Geolocation API), đồng thời tra cứu bảng chấm công chi tiết và thống kê ngày công/giờ làm việc cá nhân theo từng tháng.
- **Đối tượng người dùng & Phân quyền:**
  - **Thực tập sinh (`ROLE_INTERN`):**
    - Kiểm tra trạng thái chấm công của ngày hiện tại ngay tại màn hình chính `intern/dashboard`.
    - Thực hiện **Check-in** buổi sáng: Trình duyệt lấy toạ độ GPS (Kinh độ/Vĩ độ) và tính khoảng cách tới văn phòng làm việc. Nếu hợp lệ ($\le 25\text{m}$), hệ thống ghi nhận thời gian vào làm và trạng thái (`ON_TIME` nếu $\le 08:15$, hoặc `LATE` nếu $> 08:15$).
    - Thực hiện **Check-out** buổi chiều: Xác thực toạ độ GPS, ghi nhận thời gian ra về, tự động tính tổng giờ làm việc (`totalWorkingHours`), cập nhật trạng thái (`EARLY_LEAVE` hoặc `LATE_AND_EARLY_LEAVE` nếu về trước $17:30$).
    - Xem **Lịch sử chấm công cá nhân (`my-history`)**: Bộ lọc Tháng/Năm, 4 thẻ thống kê trực quan (Tổng ngày công, Đi đúng giờ, Đi muộn, Về sớm, Tổng giờ tích luỹ) và bảng chấm công chi tiết từng ngày.
  - **Cán bộ Nhân sự & Mentor (`ROLE_HR`, `ROLE_MENTOR`, `ROLE_ADMIN`):**
    - Đọc dữ liệu chấm công của TTS phục vụ đánh giá chuyên cần và tính phụ cấp hàng tháng (đặc tả mở rộng ở các ticket quản trị tiếp theo).

---

## 2. Business Goal & Core Objectives (Mục Tiêu Nghiệp Vụ)

1. **Số hoá quy trình chuyên cần 100%:** Loại bỏ việc chấm công thủ công bằng giấy tờ hoặc máy chấm công vân tay cồng kềnh, giúp TTS thao tác nhanh chóng bằng laptop hoặc điện thoại thông minh chỉ trong 5 giây.
2. **Minh bạch & Chống gian lận vị trí (Geo-Fencing Integrity):** Kết hợp toạ độ thực tế từ trình duyệt với thuật toán khoảng cách Haversine ở Backend, kiểm soát chặt chẽ bán kính cho phép $25\text{m}$ quanh toạ độ trụ sở doanh nghiệp.
3. **Phản hồi trạng thái thời gian thực (Zero-Friction Realtime UX):** Dashboard hiển thị đồng hồ số nhảy giây chuẩn mực, nhận diện tức thì tình trạng *"Chưa điểm danh"*, *"Đang làm việc (Đã vào ca)"*, *"Đã tan ca"* kèm cảnh báo khung giờ quy định ($08:00 - 08:15$ và $17:30$).
4. **Modal-First & Bảo toàn ngữ cảnh (Zero Context-Switching):** Quá trình lấy toạ độ, quét vị trí và xác nhận diễn ra gọn gàng trong Modal chuẩn 3 khối, không chuyển trang gây mất trạng thái đang làm việc.
5. **Khả năng phục hồi & Xử lý sự cố phần cứng/trình duyệt cao:** Xử lý triệt để các tình huống TTS tắt định vị, từ chối cấp quyền Geolocation, sóng GPS yếu, hoặc độ chính xác chưa đạt yêu cầu.

---

## 3. Scope of Work (Phạm Vi Công Việc Frontend)

### 3.1. Trong phạm vi (In Scope)

1. **Hạ tầng Constants & TypeScript Types:**
   - Tạo `src/constants/endpoints/attendance.endpoints.ts`:
     - `TODAY`: `/api/v1/attendances/today` (Lấy trạng thái chấm công hôm nay).
     - `CHECK_IN`: `/api/v1/attendances/check-in` (Gửi toạ độ check-in).
     - `CHECK_OUT`: `/api/v1/attendances/check-out` (Gửi toạ độ check-out).
     - `MY_HISTORY`: `/api/v1/attendances/my-history` (Lịch sử chấm công theo tháng/năm).
   - Barrel export tại `src/constants/endpoints/index.ts`.
   - Cập nhật `src/constants/routes/intern.routes.ts`: Thêm `ATTENDANCE: '/intern/attendance'` (Trang chuyên sâu tra cứu lịch sử chấm công).
   - Tạo `src/types/attendance.types.ts`:
     - Enum `AttendanceStatus`: `'ON_TIME' | 'LATE' | 'EARLY_LEAVE' | 'LATE_AND_EARLY_LEAVE' | 'ABSENT'`.
     - Interfaces: `TodayAttendanceResponse`, `CheckInRequest`, `CheckOutRequest`, `AttendanceRecordResponse`, `MonthlyAttendanceSummaryResponse`, `GeolocationCoordinates`, `GeolocationState`.
   - Barrel export tại `src/types/index.ts`.

2. **Tầng Dịch Vụ Domain Service (`src/services/attendanceService.ts`):**
   - Tuân thủ kiến trúc Axios 4 tầng, nhận `AbortSignal` chống rò rỉ bộ nhớ:
     - `getTodayAttendance(signal?: AbortSignal): Promise<TodayAttendanceResponse>`
     - `checkIn(data: CheckInRequest, signal?: AbortSignal): Promise<AttendanceRecordResponse>`
     - `checkOut(data: CheckOutRequest, signal?: AbortSignal): Promise<AttendanceRecordResponse>`
     - `getMyAttendanceHistory(params?: { month?: number; year?: number }, signal?: AbortSignal): Promise<MonthlyAttendanceSummaryResponse>`
   - Utility tính khoảng cách Haversine phía Client (`calculateClientDistance`) nhằm cung cấp phản hồi trước (pre-validation UX) ngay trước khi gửi request.

3. **Custom Hooks:**
   - `src/hooks/useGeolocation.ts`: Hook lấy toạ độ trình duyệt an toàn (`navigator.geolocation.getCurrentPosition`), xử lý quyền truy cập (`permissionStatus`), cờ `highAccuracy: true`, timeout và thông điệp lỗi tiếng Việt chuẩn xác.
   - `src/pages/intern/hooks/useAttendanceToday.ts`: Quản lý fetching trạng thái chấm công ngày hiện tại, timer đồng hồ số thời gian thực (nhảy từng giây), tự động làm mới khi đổi ngày.
   - `src/pages/intern/hooks/useAttendanceHistory.ts`: Quản lý bộ lọc Tháng/Năm, tải dữ liệu tổng hợp lịch sử công, caching kết quả và refetching.

4. **Widget Chấm Công Trên `InternDashboard.tsx` (`InternAttendanceWidget.tsx`):**
   - Vị trí: Đặt ở khu vực hàng đầu (Hero Position) trên `InternDashboard.tsx` để TTS nhìn thấy ngay khi mở ứng dụng.
   - Hiển thị:
     - Đồng hồ số thời gian thực (`HH:mm:ss`) kèm ngày tháng hiện tại (Format: *"Thứ Ba, ngày 29 tháng 09 năm 2026"*).
     - Khối thông tin trạng thái ca làm việc hiện tại:
       - **Chưa Check-in:** Badge xám *"Chưa vào ca"*, nút CTA chính **"Điểm Danh Vào Ca (Check-in)"** nổi bật với hiệu ứng hào quang (`primary-glow`).
       - **Đã Check-in (Đang làm việc):** Badge xanh/cam *"Đã vào ca lúc HH:mm:ss"* (`ON_TIME` hoặc `LATE`), thời gian đã làm việc tạm tính, nút CTA phụ **"Điểm Danh Tan Ca (Check-out)"**.
       - **Đã Check-out (Hoàn thành ca):** Badge xanh đậm *"Hoàn thành ca làm việc"*, hiển thị chi tiết giờ vào, giờ ra và tổng giờ làm việc thực tế (`X.XX giờ`). Khóa nút bấm cho ngày hôm nay.
     - Nút liên kết phụ: *"Xem bảng chấm công tháng này"* mở Modal Lịch sử hoặc điều hướng tới `/intern/attendance`.

5. **Modal Thao Tác Chấm Công GPS Chuẩn 3 Khối (`AttendanceActionModal.tsx`):**
   - Áp dụng cấu trúc 3 khối bất biến:
     - **Header cố định:** Tiêu đề động *"Xác Nhận Điểm Danh Vào Ca"* hoặc *"Xác Nhận Điểm Danh Tan Ca"*, đồng hồ đếm giờ, nút đóng `X` và phím tắt `Esc`.
     - **Body cuộn độc lập:**
       - Vùng mô phỏng Radar định vị GPS (Radar Scan Animation) với icon vệ tinh xoay mượt mà.
       - Thẻ vị trí hiện tại: Toạ độ (`Latitude`, `Longitude`), độ chính xác đo lường ($\pm X\text{m}$).
       - Thẻ trụ sở làm việc: Tên văn phòng (`officeName`), bán kính quy định ($25.0\text{m}$), khoảng cách hiện tại tính từ máy TTS tới văn phòng.
       - Đánh giá cự ly trực quan:
         - **Hợp lệ ($\le 25\text{m}$):** Khung viền xanh lá, thông điệp *"Vị trí hợp lệ để chấm công (Cách văn phòng X m)"*.
         - **Ngoài phạm vi ($> 25\text{m}$):** Khung viền cam/đỏ, thông điệp *"Bạn đang cách văn phòng X m, vượt quá bán kính quy định (25m). Vui lòng di chuyển lại gần văn phòng"*.
       - Ô nhập ghi chú công việc (`notes`, tùy chọn, tối đa 255 ký tự).
     - **Sticky Footer ghim đáy:** Nút "Hủy bỏ", Nút "Lấy lại vị trí (Quét lại GPS)", Nút hành động chính "Xác Nhận Check-in" / "Xác Nhận Check-out" (có spinner loader, khóa tương tác chống double-click).

6. **Trang / Modal Lịch Sử Chấm Công Cá Nhân (`InternAttendancePage.tsx` / `AttendanceHistoryModal.tsx`):**
   - **Bộ điều khiển thời gian:** Dropdown chọn Tháng (1 - 12) và Năm (2025, 2026, 2027), nút "Tháng hiện tại".
   - **4 Thẻ Thống Kê Tổng Hợp (KPI Cards):**
     1. Tổng ngày công thực tế (`presentDays` / `totalWorkingDays`).
     2. Số lần đúng giờ (`presentDays - lateDays`).
     3. Số lần đi muộn (`lateDays`) & Về sớm (`earlyLeaveDays`).
     4. Tổng số giờ làm việc tích lũy trong tháng (`totalWorkingHours` giờ).
   - **Bảng Chi Tiết Ngày Chấm Công:**
     - Các cột: Ngày làm việc, Giờ Check-in, Giờ Check-out, Tổng giờ làm việc, Trạng thái chuyên cần (Badges: Đúng giờ, Đi muộn, Về sớm, Cả hai), Ghi chú.
     - Tuân thủ Nguyên tắc 31: Tối đa 10 dòng/trang, tự động ẩn phân trang khi $\le 10$ dòng.
     - Xử lý đủ 5 trạng thái: Skeleton Shimmer khi tải, Empty State có CTA, Error State có nút Thử lại, Toast phản hồi thành công, Disabled State.

7. **Điều hướng Menu Sidebar & App Shell:**
   - Bổ sung mục *"Chấm Công & Chuyên Cần"* (Icon `ClockCheck` hoặc `CalendarCheck`) vào menu bên trái của vai trò `INTERN` trong `src/components/layout/Sidebar.tsx`.

### 3.2. Ngoài phạm vi (Out of Scope)

- Chấm công nhận diện khuôn mặt (FaceID / AI Camera).
- Chấm công qua mạng Wi-Fi BSSID / IP Router (ticket nâng cao tương lai).
- Quản lý ca làm việc linh hoạt hoặc làm việc từ xa (Remote / Work From Home) cần quy trình phê duyệt đơn từ của HR.
- Tự ý can thiệp mã nguồn Java Backend (tuân thủ Nguyên tắc 7).

---

## 4. Potential Logic Loopholes & Mitigations (Lỗ Hổng Logic & Giải Pháp Frontend)

| STT | Tình huống ngoại lệ (Edge Case) | Rủi ro kỹ thuật & UX | Giải pháp thiết kế & Xử lý Frontend triệt để |
| :---: | :--- | :--- | :--- |
| **1** | Trình duyệt bị người dùng chặn quyền truy cập vị trí (`GeolocationPositionError.PERMISSION_DENIED`) | Client không thể lấy toạ độ, hàm `getCurrentPosition` ném lỗi | Bắt lỗi phân loại `code === 1`: Hiển thị Banner hướng dẫn người dùng từng bước cấp lại quyền vị trí (Biểu tượng ổ khoá trên thanh URL $\rightarrow$ Cho phép vị trí $\rightarrow$ Bấm nút "Thử lại"). Khóa nút Chấm công kèm tooltip giải thích. |
| **2** | Độ chính xác GPS của thiết bị quá thấp (Ví dụ thiết bị báo toạ độ với `accuracy > 100m`) | Bán kính sai số thực tế có thể khiến toạ độ nhảy ra ngoài 25m dù TTS đang ngồi trong văn phòng | Client kiểm tra giá trị `coords.accuracy`: Nếu `accuracy > 50m`, hiển thị cảnh báo vàng *"Độ chính xác GPS hiện tại là $\pm X\text{m}$ (Khá thấp). Bạn hãy bật kết nối Wi-Fi hoặc ra gần cửa sổ để thiết bị định vị chính xác hơn"*. Cung cấp nút "Đo lại toạ độ". |
| **3** | Toạ độ nằm ngoài bán kính cho phép ($> 25\text{m}$) | Gửi request lên Backend sẽ bị ném `400 Bad Request` ("Vượt quá bán kính cho phép") | **Pre-validation UX:** Client tính khoảng cách ước tính trước bằng Haversine. Nếu $> 25\text{m}$, hiển thị thông điệp cảnh báo đỏ rõ ràng trên Modal, hiển thị khoảng cách hiện tại (ví dụ: *"Bạn đang cách văn phòng 54.2m"*). Nút submit đổi trạng thái cảnh báo và yêu cầu xác nhận, tránh việc người dùng bỡ ngỡ khi Backend từ chối. |
| **4** | Người dùng nhấn liên tiếp nhiều lần vào nút Check-in/Check-out (Double-Click / Race Condition) | Gửi nhiều request song song, dẫn tới lỗi `409 Conflict` ở Backend ("Đã check-in cho ngày hôm nay rồi") | **Tuân thủ Nguyên tắc 31 & 24:** Ngay khi bấm submit, lập tức set `isSubmitting = true`, vô hiệu hóa nút bấm (`disabled`), khóa tương tác (`pointer-events: none`), đổi nhãn thành *"Đang xác thực toạ độ..."* kèm loader spinner. |
| **5** | Lệch múi giờ giữa máy tính người dùng và máy chủ (Client Timezone vs Server Timezone) | Máy tính đặt sai giờ hoặc múi giờ khác GMT+7 khiến giao diện hiển thị giờ đi làm không đồng nhất | Toàn bộ mốc thời gian hiển thị (`checkInTime`, `checkOutTime`, `workDate`) phải parse từ chuỗi ISO trả về từ Server và format qua bộ tiện ích `formatTime` / `formatDate` chuẩn hoá múi giờ `Asia/Ho_Chi_Minh`. Đồng hồ đếm giờ Client chỉ dùng để hiển thị nhịp sống, không dùng làm căn cứ kiểm tra thời gian nghiệp vụ. |
| **6** | TTS mở màn hình từ hôm trước qua đêm đến sáng hôm sau (Stale Date State) | Dashboard vẫn giữ trạng thái của ngày hôm trước, không cho phép check-in ngày mới | Triển khai timer kiểm tra chuyển giao ngày (`midnight watcher`). Khi ngày hiện tại thay đổi, tự động kích hoạt `refetch()` API `GET /api/v1/attendances/today` để cập nhật form ngày mới sạch sẽ. |
| **7** | Mất kết nối Internet hoặc Server trả lỗi 500 khi đang gửi toạ độ | Modal bị đóng đột ngột, người dùng không biết đã được ghi nhận hay chưa | **Tuân thủ Nguyên tắc 24 (Safe Mutation UX):** Tuyệt đối giữ nguyên Modal và nội dung ghi chú đã nhập. Hiển thị Error Alert nền đỏ kèm chi tiết thông báo lỗi từ Spring Boot và nút *"Thử lại"*. |
| **8** | Thiết bị di động màn hình nhỏ (Mobile 375px) | Bảng lịch sử chấm công tràn ngang, nút bấm quá nhỏ khó chạm | Chuyển đổi bảng dữ liệu thành danh sách thẻ dọc (Card-based list) trên mobile (`<= 768px`), nút bấm to rõ ràng đạt chuẩn touch target $\ge 44\text{px}$, thanh cuộn ngang cục bộ nếu xem bảng (`overflow-x: auto`). |

---

## 5. Functional Requirements (Yêu Cầu Chức Năng Chi Tiết)

### FR-1: Widget Trạng Thái Chấm Công Hôm Nay (`InternAttendanceWidget`)
- Nằm tại vị trí trên cùng của `InternDashboard.tsx`.
- **Thành phần hiển thị:**
  1. Đồng hồ thời gian thực: Giờ, Phút, Giây nhảy liên tục theo thời gian thực tế của ngày hôm nay.
  2. Ngày trong tuần và ngày tháng năm đầy đủ.
  3. Huy hiệu trạng thái ngày công:
     - `CHƯA CHECK-IN`: Nền xám nhạt, viền xám, icon đồng hồ chờ.
     - `ĐÚNG GIỜ`: Nền xanh lục nhạt (`badge-success`), text xanh lục đậm, icon tick xanh.
     - `ĐI MUỘN`: Nền cam nhạt (`badge-warning`), text cam đậm, icon cảnh báo giờ.
     - `VỀ SỚM` / `VỪA MUỘN VỪA VỀ SỚM`: Nền cam đỏ nhạt, text cam đỏ.
     - `HOÀN THÀNH NGÀY CÔNG`: Nền xanh dương dịu (`badge-info`), hiển thị tổng số giờ làm việc thực tế.
  4. Thông tin tóm tắt:
     - Giờ Check-in (nếu có): Hiển thị dạng `HH:mm:ss`.
     - Giờ Check-out (nếu có): Hiển thị dạng `HH:mm:ss`.
     - Tên văn phòng quy định và bán kính kiểm tra ($25\text{m}$).
  5. Các nút hành động chính:
     - Nút **"Điểm Danh Vào Ca (Check-in)"** (chỉ hiển thị khi `hasCheckedIn === false`).
     - Nút **"Điểm Danh Tan Ca (Check-out)"** (chỉ hiển thị khi `hasCheckedIn === true && hasCheckedOut === false`).
     - Trạng thái vô hiệu hóa (disabled): Khi `hasCheckedIn === true && hasCheckedOut === true` (hiển thị nhãn *"Đã hoàn thành ca làm việc hôm nay"*).
     - Nút liên kết phụ: *"Xem lịch sử chấm công"* kèm icon mũi tên chuyển trang hoặc mở modal.

---

### FR-2: Modal Xác Nhận Điểm Danh GPS (`AttendanceActionModal`)
- Áp dụng chuẩn Modal-First 3 khối cố định:
- **Khối 1: Header Cố Định (Fixed Header)**
  - Tiêu đề động: *"Xác Nhận Điểm Danh Vào Ca"* (khi Check-in) hoặc *"Xác Nhận Điểm Danh Tan Ca"* (khi Check-out).
  - Huy hiệu loại hành động kèm icon định vị vệ tinh (`MapPin` / `Navigation`).
  - Nút đóng `X` ở góc phải, hỗ trợ đóng qua phím `Esc` và click nền ngoài (có kiểm tra an toàn khi form bận).
- **Khối 2: Body Cuộn Độc Lập (Scrollable Body)**
  - **Khối Radar quét GPS:** Hiệu ứng Radar xoay mượt mà, hiển thị vòng tròn toạ độ trực quan biểu thị bán kính văn phòng $25\text{m}$ và chấm định vị vị trí của người dùng.
  - **Thông số toạ độ chi tiết:**
    - Toạ độ hiện tại: `Vĩ độ: 21.028515`, `Kinh độ: 105.854440`.
    - Sai số đo lường: `Độ chính xác: ± 12m`.
    - Văn phòng đích: `Trụ sở chính InternHub` ($25.0\text{m}$).
    - Khoảng cách đo được: `Khoảng cách: ~ 5.4m` (Hợp lệ, hiển thị tích xanh).
  - **Trường hợp lỗi vị trí (Location Errors):**
    - Nếu từ chối quyền: Hiển thị hộp cảnh báo màu đỏ với hướng dẫn mở quyền Geolocation.
    - Nếu khoảng cách $> 25\text{m}$: Hiển thị hộp cảnh báo màu vàng cam, nêu rõ khoảng cách vượt mức và khuyên di chuyển vào văn phòng.
  - **Khối nhập ghi chú (`notes`):**
    - Textarea ghi chú tùy chọn (tối đa 255 ký tự).
    - Placeholder: *"Nhập ghi chú cho ngày làm việc hôm nay (nếu có)..."*.
- **Khối 3: Sticky Footer Ghim Đáy (Fixed Bottom Actions)**
  - Bên trái: Nút *"Lấy lại toạ độ"* (Icon `RefreshCw`, quay tròn khi đang quét lại GPS).
  - Bên phải:
    - Nút *"Hủy bỏ"* (`variant="secondary"`).
    - Nút *"Xác Nhận Check-in"* hoặc *"Xác Nhận Check-out"* (`variant="primary"`).
    - Nút tự động disabled khi chưa lấy được toạ độ hoặc đang gửi request.

---

### FR-3: Trang Tra Cứu Lịch Sử Chấm Công Cá Nhân (`InternAttendancePage`)
- Route: `/intern/attendance` (Hoặc mở Modal chuyên sâu từ Dashboard).
- **Header trang:** Tiêu đề *"Bảng Chấm Công & Chuyên Cần Cá Nhân"*, mô tả tóm tắt quy định thời gian làm việc ($08:00 - 17:30$).
- **Bộ lọc & Điều khiển:**
  - Dropdown chọn Tháng (Tháng 1 đến Tháng 12).
  - Dropdown chọn Năm (Năm hiện tại mặc định).
  - Nút "Tháng này" để quay về tháng hiện hành tức thì.
- **4 Thẻ Tổng Hợp Chỉ Số Chuyên Cần (KPI Metrics):**
  1. **Số ngày có mặt:** `${presentDays} / ${totalWorkingDays} ngày` (Kèm tỷ lệ phần trăm %).
  2. **Đúng giờ tuyệt đối:** `${presentDays - lateDays} ngày` (Tỷ lệ hoàn hảo).
  3. **Số lần đi muộn / Về sớm:** `${lateDays} lần muộn / ${earlyLeaveDays} lần về sớm` (Nền cảnh báo).
  4. **Tổng giờ làm việc tích lũy:** `${totalWorkingHours} giờ` (Format 2 chữ số thập phân).
- **Bảng dữ liệu chi tiết (`AttendanceHistoryTable`):**
  - Cột 1: **Ngày làm việc** (Định dạng: `DD/MM/YYYY`, hiển thị thứ trong tuần).
  - Cột 2: **Giờ Check-in** (Định dạng: `HH:mm:ss`).
  - Cột 3: **Giờ Check-out** (Định dạng: `HH:mm:ss`, hoặc gạch ngang `-` nếu chưa check-out).
  - Cột 4: **Tổng giờ làm** (Ví dụ: `8.50 giờ`).
  - Cột 5: **Trạng thái** (Badge: Đúng giờ `ON_TIME`, Đi muộn `LATE`, Về sớm `EARLY_LEAVE`, Cả hai `LATE_AND_EARLY_LEAVE`).
  - Cột 6: **Ghi chú** (Hiển thị text ghi chú hoặc tooltip nếu dài).
- **Quy chuẩn phân trang & hiển thị:**
  - Mặc định 10 dòng/trang.
  - Tự động ẩn phân trang khi $\le 10$ bản ghi.
  - Bo góc đáy liền mạch với Card khi phân trang ẩn (tuân thủ Nguyên tắc 31).

---

## 6. UX/UI Design Specifications & Design Tokens (Quy Chuẩn Giao Diện)

### 6.1. Tuân thủ 100% Hệ Thống Biến Màu Semantics (Design Tokens)
Nghiêm cấm tuyệt đối mã màu Hex hardcode trong CSS Modules (Nguyên tắc 28). Toàn bộ màu sắc dùng biến CSS hệ thống:
- Màu nền thẻ & bảng: `var(--bg-card)`
- Màu viền chuẩn: `var(--border-default)`
- Màu viền khi focus/select: `var(--primary)` kèm `box-shadow: 0 0 0 3px var(--primary-glow)`
- Màu chữ chính: `var(--text-main)` (Tương phản WCAG AA $\ge 4.5:1$)
- Màu chữ phụ/nhãn: `var(--text-muted)`
- Huy hiệu Đúng giờ (`ON_TIME`): Nền `var(--color-success-bg, rgba(16, 185, 129, 0.12))`, viền `var(--color-success-border, rgba(16, 185, 129, 0.3))`, chữ `var(--color-success, #10b981)`.
- Huy hiệu Đi muộn (`LATE`): Nền `var(--color-warning-bg, rgba(245, 158, 11, 0.12))`, viền `var(--color-warning-border, rgba(245, 158, 11, 0.3))`, chữ `var(--color-warning, #f59e0b)`.
- Huy hiệu Về sớm / Vi phạm kép: Nền `var(--color-danger-bg, rgba(239, 68, 68, 0.12))`, viền `var(--color-danger-border, rgba(239, 68, 68, 0.3))`, chữ `var(--color-danger, #ef4444)`.

### 6.2. 5 Trạng Thái Giao Diện Bắt Buộc (Nguyên tắc 32)
1. **Loading State:** Sử dụng Skeleton Shimmer Loader đồng bộ cho Widget và Bảng dữ liệu, tuyệt đối không dùng chữ "Loading..." thô sơ chống giật layout (Zero CLS).
2. **Empty State:** Khi tháng được chọn chưa có dữ liệu chấm công nào: Hiển thị hình minh hoạ calendar rỗng + Tiêu đề *"Chưa có dữ liệu chấm công"* + Hướng dẫn *"Dữ liệu sẽ được ghi nhận tự động mỗi khi bạn thực hiện check-in"* + Nút CTA *"Về tháng hiện tại"*.
3. **Error State:** Khi mất kết nối hoặc API trả về lỗi: Hiển thị Card cảnh báo có Icon lỗi màu đỏ + Chi tiết lỗi + Nút CTA *"Thử lại"* (Retry).
4. **Success Toast:** Khi Check-in hoặc Check-out thành công: Bắn Sonner Toast xanh chúc mừng kèm thời gian và trạng thái ghi nhận, đóng Modal tức thì và refetch dữ liệu Dashboard.
5. **Disabled State:** Nút Check-in/Check-out bị mờ và khóa con trỏ (`cursor: not-allowed; opacity: 0.6`) khi ngoài giờ hoặc toạ độ chưa sẵn sàng.

### 6.3. Sleek Scrollbar & Sticky Columns (Nguyên tắc 34)
- Bảng lịch sử chấm công có thanh cuộn ngang cục bộ (`overflow-x: auto`) với Custom Sleek Scrollbar mảnh 6px bo tròn 9999px.
- Cột "Ngày làm việc" ghim cố định bên trái (`sticky left: 0`) khi bảng cuộn ngang.

---

## 7. API Contract Mapping (Ánh Xạ REST API Backend TM-25)

### 7.1. API Lấy Trạng Thái Chấm Công Hôm Nay
- **Endpoint:** `GET /api/v1/attendances/today`
- **Quyền:** `ROLE_INTERN`
- **Response Success (200 OK):**
```typescript
interface TodayAttendanceResponse {
  workDate: string;             // YYYY-MM-DD (e.g. "2026-09-29")
  hasCheckedIn: boolean;         // true/false
  hasCheckedOut: boolean;        // true/false
  checkInTime: string | null;    // ISO-8601 (e.g. "2026-09-29T08:10:15")
  checkOutTime: string | null;   // ISO-8601 (e.g. "2026-09-29T17:35:00")
  totalWorkingHours: number | null; // Số giờ làm (e.g. 9.41)
  status: AttendanceStatus | null;  // 'ON_TIME' | 'LATE' | 'EARLY_LEAVE' | 'LATE_AND_EARLY_LEAVE'
  officeName: string;            // "Trụ sở chính InternHub"
  allowedRadiusMeters: number;   // 25.0
}
```

---

### 7.2. API Điểm Danh Vào Ca (Check-in)
- **Endpoint:** `POST /api/v1/attendances/check-in`
- **Request Body:**
```typescript
interface CheckInRequest {
  latitude: number;   // Vĩ độ (e.g. 21.028515)
  longitude: number;  // Kinh độ (e.g. 105.854440)
  notes?: string;     // Ghi chú tuỳ chọn
}
```
- **Response Success (201 Created):**
```typescript
interface AttendanceRecordResponse {
  id: number;
  workDate: string;
  checkInTime: string;
  checkOutTime: string | null;
  totalWorkingHours: number | null;
  status: AttendanceStatus;
  distanceMeters?: number;
  notes?: string;
}
```
- **Mã lỗi Backend xử lý tại Client:**
  - `400 Bad Request`: Vượt quá bán kính 25m $\rightarrow$ Hiển thị thông báo đỏ chi tiết khoảng cách hiện tại.
  - `409 Conflict`: Đã check-in trong ngày $\rightarrow$ Toast cảnh báo và cập nhật lại state `hasCheckedIn = true`.

---

### 7.3. API Điểm Danh Tan Ca (Check-out)
- **Endpoint:** `POST /api/v1/attendances/check-out`
- **Request Body:**
```typescript
interface CheckOutRequest {
  latitude: number;
  longitude: number;
  notes?: string;
}
```
- **Response Success (200 OK):**
```typescript
// Trả về AttendanceRecordResponse đã được cập nhật checkOutTime, totalWorkingHours và status mới
```
- **Mã lỗi Backend xử lý tại Client:**
  - `400 Bad Request`: Chưa từng check-in trong ngày hoặc đã check-out rồi.

---

### 7.4. API Lịch Sử Chấm Công Cá Nhân (My History)
- **Endpoint:** `GET /api/v1/attendances/my-history`
- **Query Params:** `month` (1 - 12), `year` (e.g. 2026).
- **Response Success (200 OK):**
```typescript
interface MonthlyAttendanceSummaryResponse {
  month: number;
  year: number;
  totalWorkingDays: number;
  presentDays: number;
  lateDays: number;
  earlyLeaveDays: number;
  totalWorkingHours: number;
  attendances: AttendanceRecordResponse[];
}
```

---

## 8. State Management & Component Architecture (Kiến Trúc Thành Phần)

### 8.1. Sơ Đồ Cấu Trúc Thành Phần Frontend
```text
src/
├── constants/
│   ├── endpoints/
│   │   ├── attendance.endpoints.ts   <-- MỚI: Khai báo 4 endpoints chuẩn REST
│   │   └── index.ts                  <-- Cập nhật barrel export
│   └── routes/
│       ├── intern.routes.ts          <-- Bổ sung route ATTENDANCE
│       └── index.ts
├── types/
│   ├── attendance.types.ts           <-- MỚI: Enums & Interfaces DTOs
│   └── index.ts                      <-- Cập nhật barrel export
├── services/
│   ├── attendanceService.ts          <-- MỚI: Gọi Axios 4 tầng kèm AbortSignal & Haversine client helper
│   └── index.ts
├── hooks/
│   └── useGeolocation.ts             <-- MỚI: Hook định vị trình duyệt an toàn
├── pages/intern/
│   ├── InternDashboard.tsx           <-- Tích hợp InternAttendanceWidget
│   ├── InternAttendancePage.tsx      <-- MỚI: Trang tra cứu lịch sử chấm công & KPI
│   ├── InternAttendancePage.module.css
│   ├── hooks/
│   │   ├── useAttendanceToday.ts     <-- MỚI: Hook quản lý chấm công hôm nay & realtime clock
│   │   └── useAttendanceHistory.ts   <-- MỚI: Hook quản lý lịch sử theo tháng/năm
│   └── components/
│       ├── Attendance/
│       │   ├── InternAttendanceWidget.tsx          <-- MỚI: Widget Hero trên Dashboard
│       │   ├── InternAttendanceWidget.types.ts
│       │   ├── InternAttendanceWidget.module.css
│       │   ├── AttendanceActionModal.tsx           <-- MỚI: Modal Check-in/Check-out GPS 3 khối
│       │   ├── AttendanceActionModal.types.ts
│       │   ├── AttendanceActionModal.module.css
│       │   ├── AttendanceRadarScan.tsx             <-- MỚI: Hoạt ảnh radar toạ độ trực quan
│       │   ├── AttendanceRadarScan.module.css
│       │   ├── AttendanceSummaryCards.tsx          <-- MỚI: 4 Thẻ KPI thống kê chuyên cần
│       │   ├── AttendanceSummaryCards.module.css
│       │   ├── AttendanceHistoryTable.tsx          <-- MỚI: Bảng lịch sử <= 10 dòng tự ẩn phân trang
│       │   ├── AttendanceHistoryTable.types.ts
│       │   └── AttendanceHistoryTable.module.css
│       └── index.ts
```

### 8.2. Quy Định Giới Hạn State (Nguyên tắc 14 & 25)
- Mỗi component con tối đa 3-4 `useState`.
- Toàn bộ trạng thái toạ độ phức tạp gom trong `useGeolocation`: `{ coords, loading, error, accuracy, permissionStatus }`.
- Toàn bộ bộ lọc lịch sử gom trong Object State: `{ month: number; year: number }`.
- Toàn bộ props được tách riêng ra file `*.types.ts` tương ứng (Nguyên tắc 13).

---

## 9. Core User Flows (Luồng Thao Tác Chi Tiết)

### 9.1. Luồng Check-in Vào Ca Sáng
```text
1. TTS truy cập /intern/dashboard.
2. InternAttendanceWidget tải dữ liệu hôm nay:
   - status: Chưa Check-in (hasCheckedIn = false).
   - Nút "Điểm Danh Vào Ca" hiển thị nổi bật.
3. TTS bấm "Điểm Danh Vào Ca":
   - Mở AttendanceActionModal.
   - useGeolocation kích hoạt navigator.geolocation.getCurrentPosition().
   - Radar hiển thị hiệu ứng quét toạ độ.
4. Trình duyệt phản hồi toạ độ:
   - Client tính khoảng cách tới trụ sở văn phòng.
   - Nếu <= 25m: Hiển thị badge xanh "Trong vùng hợp lệ", nút "Xác Nhận Check-in" kích hoạt.
   - Nếu > 25m: Hiển thị cảnh báo đỏ "Ngoài vùng 25m", nêu chi tiết số mét.
5. TTS bấm "Xác Nhận Check-in":
   - Nút đổi trạng thái loading, vô hiệu hoá tương tác chống double-click.
   - Gửi POST /api/v1/attendances/check-in với { latitude, longitude, notes }.
6. Backend trả về 201 Created:
   - Hiển thị Toast thành công: "Check-in thành công lúc HH:mm (Trạng thái: Đúng giờ)".
   - Đóng AttendanceActionModal.
   - Widget trên Dashboard tự động làm mới, chuyển sang trạng thái "Đang làm việc".
```

### 9.2. Luồng Check-out Tan Ca Chiều
```text
1. Buổi chiều, TTS truy cập Dashboard.
2. Widget hiển thị: Đã vào ca lúc HH:mm, nút "Điểm Danh Tan Ca" kích hoạt.
3. TTS bấm "Điểm Danh Tan Ca":
   - Mở AttendanceActionModal ở chế độ CHECK_OUT.
   - Nếu thời gian hiện tại < 17:30: Modal hiển thị thêm cảnh báo vàng "Hiện tại chưa đến giờ kết thúc ca làm việc (17:30). Bạn có chắc chắn muốn về sớm?".
4. Lấy toạ độ GPS hợp lệ (<= 25m).
5. TTS bấm "Xác Nhận Check-out":
   - Gửi POST /api/v1/attendances/check-out.
6. Backend trả về 200 OK kèm tổng số giờ làm việc:
   - Toast chúc mừng hoàn thành ngày làm việc kèm tổng số giờ (ví dụ: "Đã check-out thành công. Tổng giờ làm việc: 8.5 giờ").
   - Đóng Modal.
   - Widget Dashboard hiển thị hoàn thành ngày công, nút bấm vô hiệu hoá cho ngày hôm nay.
```

---

## 10. Acceptance Criteria Checklist (Tiêu Chí Nghiệm Thu Frontend)

- [ ] **AC-FE-01 (Hiển thị Widget Dashboard):** Widget chấm công hiển thị chính xác đồng hồ thời gian thực, ngày hiện tại và trạng thái hôm nay từ API `GET /api/v1/attendances/today`.
- [ ] **AC-FE-02 (Cấp quyền Geolocation):** Khi bấm Check-in/Check-out, trình duyệt yêu cầu quyền truy cập vị trí. Nếu bị từ chối, hiển thị hộp cảnh báo màu đỏ hướng dẫn cụ thể cách cấp quyền.
- [ ] **AC-FE-03 (Bán kính 25m & Radar):** Hiển thị toạ độ, độ chính xác và khoảng cách thực tế. Cảnh báo rõ ràng nếu khoảng cách vượt quá bán kính $25\text{m}$.
- [ ] **AC-FE-04 (Check-in Thành Công):** TTS trong bán kính $25\text{m}$ thực hiện Check-in thành công, nhận Toast xanh, Modal tự đóng, Widget Dashboard cập nhật giờ vào và trạng thái (`ON_TIME` hoặc `LATE`).
- [ ] **AC-FE-05 (Cảnh báo Về Sớm khi Check-out):** Khi Check-out trước $17:30$, Modal hiển thị thông điệp cảnh báo về sớm để người dùng xác nhận.
- [ ] **AC-FE-06 (Check-out Thành Công):** Check-out thành công hiển thị tổng số giờ làm việc, cập nhật Widget sang trạng thái hoàn thành và khóa nút bấm trong ngày.
- [ ] **AC-FE-07 (Chống Double-Click):** Khi đang gửi request Check-in/Check-out, nút bấm bị khóa (`disabled`) và hiển thị spinner xoay tròn, không cho phép bấm lặp lại.
- [ ] **AC-FE-08 (Tra Cứu Lịch Sử & KPI):** Trang/Modal Lịch sử hiển thị đầy đủ 4 thẻ KPI của tháng được chọn, danh sách chi tiết các ngày công với badge màu chuẩn mực.
- [ ] **AC-FE-09 (Tự Ẩn Phân Trang):** Bảng lịch sử tự động ẩn thanh phân trang khi tổng số bản ghi $\le 10$ dòng, hoàn thiện bo góc đáy bảng liền mạch.
- [ ] **AC-FE-10 (Xử Lý 5 Trạng Thái):** Trang và Widget xử lý hoàn hảo đủ 5 trạng thái (Skeleton, Empty có CTA, Error Retry, Success Toast, Disabled) không có runtime error.
- [ ] **AC-FE-11 (Tuân Thủ 100% Design Tokens):** Không có mã màu Hex nào trong CSS Modules, toàn bộ dùng biến CSS semantics (`var(--bg-card)`, `var(--primary)`, `var(--text-main)`).
- [ ] **AC-FE-12 (Responsive Mobile):** Giao diện hiển thị trực quan, không vỡ layout trên cả màn hình di động ($375\text{px}$) và máy tính bàn ($1920\text{px}$).

---

## 11. Implementation File Checklist (Danh Sách File Sẽ Triển Khai)

### Giai đoạn 1: Hạ tầng Constants & Types
- [ ] `src/constants/endpoints/attendance.endpoints.ts`
- [ ] `src/constants/endpoints/index.ts` (cập nhật barrel export)
- [ ] `src/constants/routes/intern.routes.ts` (bổ sung route `ATTENDANCE`)
- [ ] `src/types/attendance.types.ts`
- [ ] `src/types/index.ts` (cập nhật barrel export)

### Giai đoạn 2: Service & Custom Hooks
- [ ] `src/services/attendanceService.ts`
- [ ] `src/hooks/useGeolocation.ts`
- [ ] `src/pages/intern/hooks/useAttendanceToday.ts`
- [ ] `src/pages/intern/hooks/useAttendanceHistory.ts`

### Giai đoạn 3: UI Components (Widget, Modal & History)
- [ ] `src/pages/intern/components/Attendance/AttendanceRadarScan.tsx` + `.module.css`
- [ ] `src/pages/intern/components/Attendance/AttendanceActionModal.tsx` + `.types.ts` + `.module.css`
- [ ] `src/pages/intern/components/Attendance/InternAttendanceWidget.tsx` + `.types.ts` + `.module.css`
- [ ] `src/pages/intern/components/Attendance/AttendanceSummaryCards.tsx` + `.module.css`
- [ ] `src/pages/intern/components/Attendance/AttendanceHistoryTable.tsx` + `.types.ts` + `.module.css`
- [ ] `src/pages/intern/components/Attendance/index.ts`

### Giai đoạn 4: Tích Hợp Trang & Routing
- [ ] `src/pages/intern/InternDashboard.tsx` (Tích hợp `InternAttendanceWidget`)
- [ ] `src/pages/intern/InternAttendancePage.tsx` + `.module.css`
- [ ] `src/routes/AppRoutes.tsx` (Đăng ký route `/intern/attendance` bảo vệ bởi `ROLE_INTERN`)
- [ ] `src/components/layout/Sidebar.tsx` (Bổ sung menu item "Chấm Công")
