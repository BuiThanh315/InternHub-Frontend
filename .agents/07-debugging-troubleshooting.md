# 07. Hướng Dẫn Sửa Chữa & Xử Lý Sự Cố (Debugging & Troubleshooting)

Tài liệu này hướng dẫn phương pháp chuẩn để điều tra, cô lập và sửa chữa lỗi kỹ thuật trong dự án **InternHub-Frontend**.

---

## 1. Nguyên Tắc Cốt Lõi Khi Sửa Lỗi (Core Principles)

1. **Tìm Nguyên Nhân Gốc Rễ (Root Cause Analysis)**:
   - Tuyệt đối không áp dụng các giải pháp "chữa cháy" tạm thời (monkey patch), không giấu lỗi bằng `catch (e) {}` rỗng.
   - Luôn đặt câu hỏi: *Tại sao lỗi này xảy ra? Lỗi do dữ liệu từ backend, do logic state ở frontend hay do cấu hình mạng?*
2. **Tuân thủ quy trình xin phép trước khi sửa**:
   - Dù là lỗi nhỏ hay lớn, sau khi tìm ra nguyên nhân, Agent phải lập Kế hoạch đề xuất (`Implementation Plan`) giải thích rõ nguyên nhân và cách khắc phục để người dùng phê duyệt trước khi sửa code.
3. **NGHIÊM CẤM TỰ Ý SỬA CODE BACKEND KHI PHÁT HIỆN LỖI BACKEND**:
   - Khi điều tra thấy lỗi xuất phát từ máy chủ (Spring Boot, database, API Gateway), **CẤM** tự ý chuyển sang thư mục Backend để sửa mã nguồn Java.
   - Bắt buộc phải thông báo và giải trình chi tiết cho người dùng.

---

## 2. Quy Trình 5 Bước Xử Lý Sự Cố (5-Step Troubleshooting Protocol)

```
[1. Tái hiện lỗi] ➔ [2. Kiểm tra các lớp] ➔ [3. Phân loại lỗi (FE vs BE)] ➔ [4. Báo cáo / Đề xuất Plan] ➔ [5. Sửa & Kiểm tra hồi quy]
```

### Bước 1: Tái Hiện Lỗi (Reproduce)
- Xác định chính xác các bước người dùng thực hiện dẫn đến lỗi.
- Thu thập thông tin: Màn hình bị lỗi, tài khoản/role đang đăng nhập, dữ liệu đầu vào.

### Bước 2: Kiểm Tra Từng Lớp Kỹ Thuật (Inspect Layers)
1. **Kiểm tra Network (Mạng & API)**:
   - Endpoint URL có đúng không?
   - Header có chứa `Authorization: Bearer <token>` hợp lệ không?
   - Payload gửi lên (Request Body) có khớp với DTO của Backend Spring Boot không?
   - Mã HTTP trả về là gì (`400`, `401`, `403`, `404`, `500`)? Nội dung JSON trong Response là gì?
2. **Kiểm tra Console Trình Duyệt**:
   - Đọc kỹ Stack Trace để định vị chính xác file và dòng code gây lỗi.
   - Kiểm tra xem có lỗi `TypeError`, `undefined is not a function`, hay cảnh báo của React không.
3. **Kiểm tra State & Props của React**:
   - State có bị cập nhật chậm (asynchronous) không?
   - Props truyền vào component con có bị `null` hoặc `undefined` khi chưa kịp fetch dữ liệu không?

### Bước 3: Phân Loại Nguồn Gốc Lỗi (Frontend vs Backend)

> [!CAUTION]
> #### NẾU LỖI XUẤT PHÁT TỪ PHÍA BACKEND:
> Dấu hiệu: HTTP Status 500, lỗi SQL/Hibernate trong response, thiếu API Endpoint ở Gateway, lỗi Spring Security Filter chain...
>
> 1. **DỪNG LẠI NGAY LẬP TỨC**, không tự động chỉnh sửa bất kỳ file Java nào.
> 2. **LẬP BÁO CÁO GỬI NGƯỜI DÙNG**:
>    - Mô tả endpoint bị lỗi và HTTP Status code.
>    - Trích dẫn chính xác Request Payload và Response Body nhận được.
>    - Giải thích rõ tại sao đây là lỗi Backend (ví dụ: Service bị crash, vi phạm ràng buộc khóa ngoại database, thiếu API route...).
>    - Đề xuất giải pháp khắc phục ở Backend để người dùng quyết định.
> 3. **CHỜ CHỈ THỊ TỪ NGƯỜI DÙNG**: Chỉ can thiệp mã nguồn Backend khi người dùng yêu cầu rõ ràng.

### Bước 4: Lập Kế Hoạch Sửa Lỗi Frontend & Trình Người Dùng Duyệt
- Nếu lỗi thuộc phạm vi Frontend:
  - Cập nhật `implementation_plan.md` tóm tắt nguyên nhân và giải pháp đề xuất.
  - Chờ người dùng duyệt.

### Bước 5: Sửa Code & Kiểm Tra Hồi Quy (Verify & Regression)
- Sau khi được duyệt, tiến hành chỉnh sửa.
- Chạy lại luồng bị lỗi để bảo đảm lỗi đã biến mất.
- Kiểm tra các màn hình liên quan để bảo đảm không gây ra lỗi mới.

---

## 3. Các Lỗi Phổ Biến & Hướng Xử Lý Nhanh (Common Gotchas)

### 1. Lỗi CORS (Cross-Origin Resource Sharing)
- **Triệu chứng**: Console báo lỗi `Access to XMLHttpRequest at ... has been blocked by CORS policy`.
- **Giải pháp**: Kiểm tra cấu hình Proxy trong `vite.config.ts`. Đảm bảo trong môi trường dev, frontend sử dụng đường dẫn tương đối để proxy chuyển tiếp tới đúng cổng của Backend (Gateway hoặc Service). Không tự ý sửa `CorsConfiguration` ở Backend khi chưa hỏi.

### 2. Vòng Lặp Điều Hướng Khi Hết Hạn Token (401 Infinite Loop)
- **Triệu chứng**: Trang liên tục tải lại hoặc nhấp nháy giữa `/login` và trang hiện tại.
- **Giải pháp**: Đảm bảo trong interceptor `api.ts`, chỉ điều hướng khi đường dẫn hiện tại không phải là `/login` hoặc `/register`, đồng thời phải xóa sạch `internhub_token` và `internhub_user` trước khi chuyển hướng.

### 3. Lỗi Crash Màn Hình Do `Cannot read properties of undefined`
- **Triệu chứng**: Giao diện trắng xóa khi mở trang.
- **Giải pháp**: Dữ liệu từ API là bất đồng bộ. Sử dụng toán tử optional chaining `?.` và cung cấp giá trị khởi tạo an toàn trong `useState`.

### 4. Lỗi Đè Phong Cách CSS (CSS Leakage / Conflict)
- **Triệu chứng**: Giao diện ở màn hình này đột nhiên đổi màu hoặc lệch padding khi mở một trang khác.
- **Giải pháp**: Lập tức chuyển file `.css` sang `.module.css`. Import qua `import styles from './[Name].module.css'` và dùng `className={styles.myClass}` để Vite tự băm hash class độc nhất.

### 5. Lỗi Vòng Lặp Re-render Vô Tận Khi Tách Custom Hook
- **Triệu chứng**: Trình duyệt bị đơ, console báo lỗi `Maximum update depth exceeded`.
- **Giải pháp**: Đảm bảo các hàm callback trả về từ Custom Hook (như `fetchData`, `refetch`) được bọc trong `useCallback()`, và các giá trị object/array được memoize bằng `useMemo()`. Tránh đưa object literal mới vào dependency array của `useEffect`.

### 6. Sự Cố Tải Lên Tệp (File Upload Timeout & Payload Too Large)
- **Triệu chứng**: Upload CV hoặc báo cáo thất bại với HTTP 413 hoặc bị treo vĩnh viễn.
- **Giải pháp**: Kiểm tra dung lượng file ở client trước khi gửi (`file.size <= 10 * 1024 * 1024`). Luôn truyền `onUploadProgress` để hiển thị thanh % và gắn `signal: abortController.signal` để hủy ngay khi người dùng đóng form.

### 7. Quy Trình Báo Cáo Sự Cố Database Khi Phát Triển
- **Hành động bắt buộc**: Dừng ngay thao tác code, tuyệt đối không tự ý bật mock hoặc sửa file backend. Gửi báo cáo theo mẫu:
  ```text
  [BÁO CÁO SỰ CỐ DATABASE / BACKEND CHO NGƯỜI DÙNG]
  - Endpoint & Service: <URL, Cổng, Service>
  - Mã lỗi / Stacktrace: <HTTP 500 / PSQLException / Hibernate error>
  - Hiện tượng: <Không thể lấy dữ liệu hoặc DB mất kết nối>
  - Tình trạng: Agent đã dừng code và chờ người dùng kiểm tra lại dịch vụ cơ sở dữ liệu.
  ```

---

## 4. Xử Lý Sự Cố Mạng & Ngoại Tuyến (Network Resilience & Offline Handling)

### 1. Mất Kết Nối Mạng Cục Bộ (Offline Detection)
- **Triệu chứng**: Người dùng bị rớt mạng Internet hoặc WiFi ngắt kết nối trong lúc thao tác.
- **Giải pháp chuẩn**: Lắng nghe sự kiện `window.addEventListener('offline', ...)` và `window.addEventListener('online', ...)`. Hiển thị thanh thông báo trạng thái ngoại tuyến cố định (Sticky Offline Banner) ở đầu trang thay vì để Axios báo lỗi hàng loạt.

### 2. Sự Cố Quá Thời Gian Phản Hồi (Request Timeout)
- **Cấu hình**: `apiClient` trong `src/services/api.ts` thiết lập `timeout: 10000` (10 giây).
- **Xử lý khi Timeout**: Khi mã lỗi là `ECONNABORTED` hoặc `code === 'ERR_NETWORK'`, Interceptor chuyển đổi thành thông báo thân thiện: *"Hệ thống máy chủ phản hồi chậm hoặc đang bận. Vui lòng kiểm tra lại kết nối và thử lại."*

