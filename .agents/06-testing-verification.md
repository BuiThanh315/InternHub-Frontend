# 06. Quy Trình Kiểm Thử & Xác Minh Chất Lượng (Testing & Verification)

Tài liệu này quy định các bước kiểm tra tự động và danh mục kiểm thử thủ công với dữ liệu thực tế bắt buộc phải thực hiện trước khi bàn giao bất kỳ tính năng hoặc bản sửa lỗi nào trong **InternHub-Frontend**.

---

## 1. Kiểm Tra Tự Động (Automated Checks)

Trước khi lập bản báo cáo hoàn thành (`walkthrough.md`), Agent **bắt buộc** phải chạy và vượt qua các lệnh kiểm tra tự động sau tại thư mục `InternHub-Frontend` (nhớ nêu rõ lý do trước khi chạy lệnh):

### 1.1. Kiểm tra Linter (`oxlint`)
- **Lệnh thực thi**:
  ```powershell
  npm run lint
  ```
- **Yêu cầu**: Kết quả trả về phải sạch sẽ, không có lỗi nghiêm trọng (0 errors) về cú pháp, biến không sử dụng hoặc vi phạm cú pháp React Hooks.

### 1.2. Kiểm tra Tính Toàn Vẹn Kiểu Dữ Liệu (`TypeScript Compiler`)
- **Lệnh thực thi**:
  ```powershell
  npm run build
  # Hoặc kiểm tra riêng lẻ kiểu dữ liệu:
  npx tsc --noEmit
  ```
- **Yêu cầu**: Dự án phải build thành công 100%, không được có bất kỳ lỗi xung đột kiểu (`type mismatch`) hay thiếu thuộc tính bắt buộc.

### 1.3. Kiểm Tra Đơn Vị Logic Cục Bộ (`Vitest`)
- **Lệnh thực thi**:
  ```powershell
  npx vitest run
  ```
- **Yêu cầu**: Toàn bộ unit tests cho các hàm thuần túy (Pure Functions) phải pass 100%:
  - Các hàm tiện ích tại `src/utils/formatters.ts` (formatDate, formatPhoneNumber, formatScore, formatMoney).
  - Thuật toán chuyển đổi phân trang `pageUI - 1` (Backend) và `pageBE + 1` (Frontend).

---

## 2. Tiêu Chuẩn Kiểm Thử Bằng Dữ Liệu Thực Tế (Real Data Testing)

> [!CAUTION]
> **MỌI HOẠT ĐỘNG KIỂM THỬ PHẢI SỬ DỤNG DỮ LIỆU THỰC TẾ TRONG DATABASE:**
>
> 1. **Cấm chạy lệnh SQL**: Tuyệt đối không được tự ý thực thi các lệnh SQL (`INSERT`, `UPDATE`, `DELETE`) để tạo dữ liệu kiểm thử giả.
> 2. **Yêu cầu người dùng cung cấp**: Nếu cần tài khoản (Admin, HR, Mentor, Intern) hoặc dữ liệu cụ thể (mã thực tập sinh, ID tài liệu...), Agent bắt buộc phải hỏi người dùng để được cung cấp thông tin thực tế.
> 3. **Cấm bypass bằng mock**: Tuyệt đối không dùng mock token hoặc fake role để giả lập việc kiểm thử thành công.
> 4. **Dừng lại báo cáo ngay khi Database gặp sự cố**: Nếu trong quá trình kiểm thử phát hiện Backend/Database bị lỗi (500, chết kết nối, thiếu schema), Agent **bắt buộc dừng lại lập tức, trích xuất log và gửi báo cáo cho người dùng**. Tuyệt đối không tự ý bật mock để "lách" kiểm thử.

---

## 3. Danh Mục Kiểm Thử Thủ Công (Manual Verification Checklist)

Agent hoặc người kiểm thử cần rà soát qua các tiêu chí sau:

### Giao Diện & Tương Tác (UI / UX)
- [ ] **Khả năng hiển thị**: Giao diện không bị tràn khung (`horizontal scrollbar` ngoài ý muốn), các khối nội dung căn chỉnh thẳng hàng.
- [ ] **Tái sử dụng Component**: Toàn bộ nút bấm, modal, alert, ô search sử dụng đúng common component từ `src/components/common/`, không sinh component trùng lặp.
- [ ] **Phản hồi tương tác**: Các nút bấm có hiệu ứng hover, cursor pointer, disabled state khi đang xử lý action.
- [ ] **Biểu mẫu (Forms)**: Validate dữ liệu đầu vào (báo lỗi khi để trống trường bắt buộc, sai định dạng email, mật khẩu quá ngắn...).
- [ ] **Cửa sổ bật lên (Modal / Dialog)**: Đóng mở mượt mà, có thể đóng bằng nút X hoặc click ra ngoài vùng backdrop.

### Trạng Thái Mạng & Dữ Liệu Thực Tế (Network & Real Data States)
- [ ] **Happy Path với dữ liệu thật**: Dữ liệu thật từ Backend hiển thị chính xác khi API trả về mã `200 OK`.
- [ ] **Loading State**: Có biểu tượng xoay hoặc khung xương (Skeleton) khi đang chờ máy chủ phản hồi.
- [ ] **Error State**: Có thông báo lỗi thân thiện khi API trả về mã lỗi (`400`, `404`, `500`).
- [ ] **Auth Check**: Khi API trả về `401 Unauthorized`, hệ thống dọn dẹp token và chuyển hướng về trang `/login`.
- [ ] **Empty State**: Khi danh sách rỗng, có thông báo và nút hành động (ví dụ: *"Chưa có dữ liệu. Nhấn vào đây để tạo mới"*).
- [ ] **Khả năng chịu lỗi mạng (Network Resilience)**: Khi rớt mạng, hệ thống hiển thị thông báo offline cố định thay vì vỡ giao diện; khi timeout 10s có thông báo thân thiện.
- [ ] **Kiểm thử Error Boundary**: Khi một component con bị lỗi render đột ngột, Fallback UI xuất hiện kèm nút "Thử lại", không làm sập trắng toàn bộ ứng dụng.

### Kiểm Tra Hồi Quy (Regression Check)
- [ ] Mở Console trình duyệt và bảo đảm **không có lỗi đỏ (Uncaught Errors)** hay cảnh báo thiếu `key` (`Each child in a list should have a unique "key" prop`).
- [ ] Các màn hình khác có dùng chung service hoặc component đã sửa đổi vẫn hoạt động bình thường, không bị ảnh hưởng tiêu cực.

