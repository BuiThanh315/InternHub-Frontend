# 03. Quy Định Cần Tuân Thủ & Bảo Mật (Compliance & Constraints)

Tài liệu này nêu rõ các tiêu chuẩn về an toàn bảo mật, bảo vệ dữ liệu, bảo toàn cơ sở dữ liệu, chống bypass quyền hạn và ranh giới phạm vi dự án bắt buộc phải tuân theo trong quá trình phát triển **InternHub-Frontend**.

---

## 1. Bảo Mật & Xác Thực (Authentication & Security)

### Quản lý Token & Phiên Đăng Nhập
- **Khóa lưu trữ chuẩn trong `localStorage`**:
  - `internhub_token`: Chứa JWT Access Token cấp từ Backend.
  - `internhub_user`: Chứa thông tin tài khoản người dùng đã giải mã/lưu trữ dạng JSON.
- **Quy tắc gắn Token**:
  - Không tự gán header `Authorization` thủ công trong từng component.
  - Instance `apiClient` trong `src/services/api.ts` tự động gắn Bearer Token thông qua `request interceptor`.
- **Xử lý khi Token hết hạn (401 Unauthorized)**:
  - Interceptor tại `src/services/api.ts` tự động dọn dẹp `internhub_token` và `internhub_user`.
  - Điều hướng người dùng về `/login?expired=true` ngoại trừ trường hợp đang ở trang đăng nhập hoặc đăng ký.
- **Xử lý quyền hạn (403 Forbidden)**:
  - Hiển thị thông báo thân thiện: *"Bạn không có quyền thực hiện thao tác này"* thay vì để giao diện bị đơ hoặc vỡ layout.

### Nghiêm Cấm Dùng Mock DB / Mock Data Để Bypass Bảo Mật
> [!CAUTION]
> **TUYỆT ĐỐI CẤM TẠO TÀI KHOẢN ẢO HOẶC TOKEN GIẢ ĐỂ NÉ TRÁNH XÁC THỰC:**
> 
> 1. **Không fake token**: Cấm tự viết script nhét token chuỗi tĩnh hoặc token giả vào `localStorage` nhằm mục đích vượt qua màn hình đăng nhập.
> 2. **Xác thực thật 100%**: Mọi phiên làm việc bắt buộc phải gửi yêu cầu đăng nhập thật tới API của Spring Boot và nhận JWT Token hợp lệ.
> 3. **Báo cáo khi Auth Backend lỗi**: Nếu dịch vụ xác thực của Backend chưa chạy hoặc bị lỗi (500, DB offline), Agent phải báo cáo ngay cho người dùng, không được tự ý chuyển sang chế độ "mock login" để tiếp tục code một cách thiếu an toàn.

### Chính Sách Contract-Driven Mocking Có Kiểm Soát (UI-First Development)
Khi Backend chưa kịp hoàn thiện API hoặc môi trường Backend tạm thời chưa khả dụng, dự án cho phép mô phỏng dữ liệu với các điều kiện ngặt nghèo sau:
1. **Chỉ mô phỏng tại tầng Network**: Sử dụng Mock Service Worker (MSW) hoặc cờ môi trường `VITE_ENABLE_MOCK=false`. Không được hardcode dữ liệu giả trực tiếp vào Component hay Service.
2. **Khớp 100% hợp đồng OpenAPI/Swagger**: Cấu trúc payload mock bắt buộc phải tuân theo đúng DTO và quy ước Pagination (`PageResponse<T>`) của Backend Spring Boot.
3. **Tuyệt đối cấm mock phân quyền & đăng nhập**: Không mock endpoint `/api/v1/auth/login` hay các token bảo mật. Mọi phân quyền phải chạy qua backend thật.
4. **Bắt buộc tắt khi nghiệm thu**: Cờ mock chỉ dùng tạm thời để render và kiểm thử giao diện tĩnh. Bắt buộc phải tắt hoàn toàn khi tiến hành kiểm thử tích hợp (Integration Test) và bàn giao cho người dùng.

---

## 2. Kiểm Soát Phân Quyền (Role-Based Access Control - RBAC)

Dự án phục vụ 4 nhóm đối tượng người dùng chính với quyền hạn tách biệt:
1. **ADMIN**: Quản trị hệ thống, quản lý tài khoản người dùng toàn diện.
2. **HR**: Quản lý chương trình thực tập, điều phối hồ sơ, xem báo cáo tổng hợp.
3. **MENTOR**: Hướng dẫn thực tập sinh, đánh giá tiến độ, phê duyệt tài liệu/nhiệm vụ.
4. **INTERN**: Thực tập sinh tham gia chương trình, nộp báo cáo, quản lý hồ sơ cá nhân.

### Nghiêm Cấm Làm Suy Yếu Route Guard (Route Guard Integrity):
- **Cấm bypass Route Guard**: Không được chỉnh sửa component `ProtectedRoute` hoặc `RoleRoute` để luôn trả về `true` hoặc tự gán quyền ảo (fake role) cho người dùng.
- **Cấm dùng mock data che giấu lỗi quyền (401 / 403)**: Khi API trả về 401 hoặc 403, cấm chuyển sang fallback mock data để cho phép người dùng xem giao diện hoặc thao tác trái phép.

---

## 3. Tính Toàn Vẹn Mã Nguồn & Tương Thích Ngược (Code Integrity)

1. **Bảo tồn mã nguồn hiện có**:
   - Không được tự ý xóa bỏ các đoạn mã, mock data hoặc comment hiện hữu trừ khi có yêu cầu cụ thể từ người dùng.
   - Khi sửa đổi một component hoặc service, phải bảo đảm các màn hình đang phụ thuộc vào nó không bị lỗi (Backward Compatibility).
2. **Không làm thay đổi phiên bản dependencies**:
   - Giữ nguyên phiên bản trong `package.json`.
   - Không tự ý thực hiện `npm update` làm ảnh hưởng đến cấu hình tương thích của React 19 và Vite 8.
3. **Không sinh trùng lặp giao diện hoặc chức năng có sẵn**:
   - Phải khảo sát kỹ thư mục `src/components/`, `src/pages/`, `src/services/` trước khi bắt đầu viết mới.
   - Bắt buộc tái sử dụng các component UI, modal, button, và service đã có. Tuyệt đối không sinh ra code trùng lặp (duplication).

---

## 4. Ranh Giới Phạm Vi & Tuyệt Đối Không Can Thiệp Backend (Backend Scope Boundary)

> [!CAUTION]
> **NGHIÊM CẤM TỰ TIỆN SỬA ĐỔI MÃ NGUỒN BACKEND KHI ĐANG LÀM VIỆC TRÊN FRONTEND.**

1. **Ranh giới bất khả xâm phạm**:
   - Workspace có thể chứa cả thư mục Backend (`InternHub/` với các Java Spring Boot microservices). Tuy nhiên, phạm vi làm việc của Agent Frontend **CHỈ GIỚI HẠN trong `InternHub-Frontend/`**.
   - Cấm tự ý mở file Java, chỉnh sửa `application.yml`, thay đổi entity, controller, migration script, hoặc cấu hình Spring Security.
2. **Khi phát hiện lỗi từ Backend**:
   - Dừng ngay lập tức thao tác code.
   - Lập báo cáo chi tiết nguyên nhân gốc rễ (Root Cause Analysis) từ log API gửi cho người dùng và chờ chỉ thị. Chỉ can thiệp vào Backend khi người dùng yêu cầu rõ ràng.

---

## 5. Bảo Toàn Cơ Sở Dữ Liệu & Tiêu Chuẩn Dữ Liệu Thực Tế (Database & Real Data)

> [!CAUTION]
> **BẢO VỆ TUYỆT ĐỐI CƠ SỞ DỮ LIỆU & BẮT BUỘC DÙNG DỮ LIỆU THỰC TẾ:**

1. **Nghiêm cấm tự ý chạy các lệnh SQL**:
   - Agent **tuyệt đối không được tự ý thực thi các lệnh SQL** (`ALTER`, `DROP`, `TRUNCATE`, `UPDATE`, `DELETE`, `INSERT`...) làm biến đổi cấu trúc bảng hoặc dữ liệu trong Database.
2. **Tiêu chuẩn dữ liệu thực tế khi Dev & Test**:
   - Mọi hoạt động phát triển hoặc kiểm thử API phải dựa trên dữ liệu thật hiện hữu trong Database.
   - Khi cần tài khoản đăng nhập (Admin, HR, Mentor, Intern) hoặc dữ liệu cụ thể (hồ sơ thực tập sinh, báo cáo, đánh giá), Agent **bắt buộc phải yêu cầu người dùng cung cấp**. Tuyệt đối không tự tạo data rác vào Database.
3. **Quy trình bắt buộc khi Database / Backend gặp sự cố (Chỉ thị đặc biệt)**:
   - Nếu trong quá trình phát triển, kiểm thử hoặc tái cấu trúc mà Database bị lỗi (không kết nối được, lỗi schema, thiếu dữ liệu, chết container), Agent **TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ Ý BẬT MOCK HAY TỰ SỬA DB**, mà **BẮT BUỘC PHẢI DỪNG LẠI VÀ BÁO CÁO NGAY CHO NGƯỜI DÙNG**.
   - **Mẫu báo cáo sự cố Database chuẩn mực**:
     ```text
     [CẢNH BÁO SỰ CỐ DATABASE / BACKEND]
     - Dịch vụ / Endpoint bị lỗi: <Tên service, URL>
     - Mã lỗi HTTP / Chi tiết lỗi: <500 / Connection Refused / SQL Exception>
     - Mô tả sự cố: <Database thiếu bảng, sai cột, hoặc không kết nối được>
     - Hành động của Agent: Đã tạm dừng toàn bộ thao tác code và chờ người dùng kiểm tra hạ tầng DB.
     ```
4. **Phê duyệt trước khi khai báo Route & API Endpoint**:
   - Mọi đường dẫn route mới (trong `routes.ts`) và endpoint API mới (trong `apiEndpoints.ts`) bắt buộc phải được người dùng phê duyệt trước khi khai báo vào mã nguồn.

---

## 6. Ràng Buộc An Toàn Khi Tải Lên Tập Tin (File Upload Constraints)

Khi triển khai các chức năng liên quan đến nộp CV, upload báo cáo thực tập, ảnh đại diện:

1. **Giới hạn kích thước tệp (File Size Limit)**:
   - Tài liệu CV, báo cáo thực tập: Tối đa **10 MB**.
   - Ảnh đại diện (Avatar): Tối đa **2 MB**.
   - Bắt buộc kiểm tra `file.size` ở Client trước khi kích hoạt request.
2. **Danh sách định dạng tệp cho phép (MIME Whitelist)**:
   - Văn bản: `.pdf`, `.doc`, `.docx` (`application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`).
   - Hình ảnh: `.jpg`, `.jpeg`, `.png`, `.webp` (`image/jpeg`, `image/png`, `image/webp`).
   - Cấm tải lên các file thực thi (`.exe`, `.sh`, `.bat`, `.js`).
3. **Khử trùng tên tệp (Sanitize Filename)**:
   - Tên file gửi lên máy chủ phải loại bỏ ký tự đặc biệt, dấu cách hoặc tiếng Việt có dấu để tránh lỗi mã hóa URL trên máy chủ.
4. **Hỗ trợ hủy thao tác (Upload Cancellation)**:
   - Mọi tác vụ upload file phải kết nối với `AbortController`. Nếu người dùng đóng Modal hoặc bấm nút "Hủy", request upload phải lập tức được hủy bỏ để giải phóng băng thông.
