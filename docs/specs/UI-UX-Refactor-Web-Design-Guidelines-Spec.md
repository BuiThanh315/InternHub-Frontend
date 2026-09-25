# Specification: Refactor UI/UX Nâng Cấp Giao Diện Chuẩn Web Interface Guidelines

- **Mã Task/Feature**: `FE-UIUX-REFACTOR-01`
- **Mục tiêu**: Chuẩn hóa trải nghiệm người dùng, khả năng tiếp cận (Accessibility), phân cấp thị giác (Visual Hierarchy) và chi tiết Typography cho hệ thống quản trị `InternHub-Frontend`.
- **Tài liệu tham chiếu**:
  - `web-design-guidelines` (Vercel Labs)
  - `frontend-design` & `senior-frontend` principles

---

## 1. Trụ Cột 1: Tối Ưu Trải Nghiệm Form & Modal (Form & Modal UX)

### 1.1 Liên kết Thẻ Label & Form Controls
- **Vấn đề**: Hiện tại `<label>` và các thẻ `<input>`, `<select>`, `<textarea>` không có `id` và `htmlFor` liên kết với nhau, làm mất khả năng click vào nhãn để focus vào trường.
- **Giải pháp**:
  - Mọi trường nhập liệu đều được cấp một `id` duy nhất và có tiền tố theo form (ví dụ: `program-name`, `program-dept`, `program-start-date`).
  - Thẻ `<label>` tương ứng phải có `htmlFor="tên-id"`.

### 1.2 Trạng Thái Nạp Danh Mục (Async Select Skeleton / Loading)
- **Vấn đề**: Khi API danh mục phòng ban chưa phản hồi, ô `<select>` hiển thị rỗng hoặc nhảy giật dữ liệu khi nạp xong.
- **Giải pháp**:
  - Khi `isDepartmentsLoading = true`, thẻ `<select>` được đặt thuộc tính `disabled` kèm option hiển thị text placeholder sinh động: `"Đang tải danh sách phòng ban…"`.
  - Hiển thị hiệu ứng loading shimmer nhẹ nhàng để báo hiệu người dùng chờ đợi dữ liệu sẵn sàng.

### 1.3 Phân Tách Lỗi Inline Từng Trường (Inline Field Errors)
- **Vấn đề**: Toàn bộ lỗi form chỉ hiển thị tập trung ở thanh banner đỏ trên cùng của modal, buộc người dùng phải đối chiếu và cuộn trang.
- **Giải pháp**:
  - Xây dựng state `fieldErrors: Record<string, string>`:
    - Lỗi tên chương trình: hiện ngay dưới ô `name`.
    - Lỗi phòng ban: hiện ngay dưới ô `departmentId`.
    - Lỗi ngày tháng/thời lượng: hiện ngay dưới cụm trường `startDate` & `endDate`.
  - Input bị lỗi được bổ sung class viền đỏ cảnh báo (`style={{ borderColor: 'var(--danger)' }}`) và `aria-invalid="true"`.
  - Tự động `focus()` vào trường đầu tiên bị lỗi khi submit form không thành công.

### 1.4 Chuyển Đổi Checkbox Card Thành Control Thân Thiện Bàn Phím
- **Vấn đề**: Checkbox "Chương trình thực tập lưu trữ (Lịch sử)" đang dùng `<div onClick>` thiếu khả năng tương tác phím (Space/Enter).
- **Giải pháp**:
  - Đổi thẻ bọc ngoài thành `<label className={styles.historicalCard}>` để toàn bộ diện tích card đều là hit-target chuẩn HTML.
  - Khi người dùng bấm phím `Space` hoặc click chuột vào bất kỳ đâu trên card, checkbox tự động bật/tắt mượt mà.

---

## 2. Trụ Cột 2: Bảng Dữ Liệu & Nhịp Điệu Không Gian (Data Table & Spacing)

### 2.1 Căn Chỉnh Số Liệu Bằng `tabular-nums`
- **Vấn đề**: Khi chữ số thay đổi (như phân trang `1/10` -> `10/10` hoặc chỉ tiêu tuyển dụng `8/10` -> `18/20`), chiều rộng chữ số không cố định gây rung lắc layout.
- **Giải pháp**:
  - Thêm thuộc tính CSS `font-variant-numeric: tabular-nums` vào:
    - Cột chỉ tiêu tuyển dụng (`currentInterns / maxInterns`).
    - Cột thời lượng kỳ thực tập (`X tuần`).
    - Các ô hiển thị ngày bắt đầu / ngày kết thúc (`dd/MM/yyyy`).
    - Bộ đếm phân trang và số liệu thống kê ở header/metrics.

### 2.2 Quy Chuẩn Khoảng Thở & Padding (Hệ Thống 8pt Grid)
- **Vấn đề**: Khoảng cách padding trong modal, table cell và các khối thẻ (card) đang dùng giá trị phân tán (`0.85rem`, `1.15rem`, `1.25rem`).
- **Giải pháp**:
  - Quy chuẩn lại toàn bộ khoảng cách nội vi (padding) và khoảng cách ngoại vi (margin/gap) theo bội số 4px/8px:
    - `gap: 0.5rem (8px)` / `1rem (16px)` / `1.5rem (24px)`.
    - Modal body padding: `1.5rem (24px)`.
    - Table cell padding: `0.75rem 1rem (12px 16px)`.

### 2.3 Khoảng Thở Nhóm Nút Thao Tác (Actions Spacing)
- **Vấn đề**: Các nút Sửa, Chuyển trạng thái, Toggle nhận hồ sơ, Xóa nằm sát nhau, dễ bấm nhầm và rối mắt.
- **Giải pháp**:
  - Nhóm các nút hành động thành flex row có `gap: 0.5rem`.
  - Nút Xóa (hành động nguy hiểm) được tách biệt rõ ràng hoặc có icon cảnh báo khác biệt, không đặt liền kề nút thao tác thường xuyên.

---

## 3. Trụ Cột 3: Thẩm Mỹ & Kỹ Thuật Vi Mô Typography (Aesthetics & Micro-Typography)

### 3.1 Chuẩn Hóa Ký Tự Typography
- **Vấn đề**: Dùng dấu 3 chấm liền (`...`) và dấu nháy thẳng (`" "`).
- **Giải pháp**:
  - Thay thế toàn bộ dấu ba chấm trong placeholders và thông báo trạng thái bằng ký tự chuẩn typographic ellipsis `…` (`\u2026`).
    - Ví dụ: `"Đang tải dữ liệu…"`, `"Tìm theo tên hoặc mã chương trình…"`.
  - Thay thế dấu nháy thẳng bằng dấu ngoặc kép trích dẫn tiếng Việt / tiếng Anh chuẩn hoặc định dạng thẻ `<strong>`/`<code>` nổi bật.

### 3.2 Chống Trôi Chữ Mồ Côi Ở Tiêu Đề (Text Wrap Balance)
- **Vấn đề**: Các tiêu đề dài trên modal hoặc trang bị rớt 1 từ lẻ xuống dòng tiếp theo khi co giãn màn hình.
- **Giải pháp**:
  - Bổ sung `text-wrap: balance` cho các thẻ tiêu đề `<h2>`, `<h3>`, `<h4>` trong CSS Modules.

### 3.3 Phân Cấp Màu Chữ & Tương Phản Sắc Nét (Color Hierarchy)
- **Vấn đề**: Màu sắc các cấp độ chữ quá gần nhau khiến giao diện trông phẳng và mệt mắt.
- **Giải pháp**:
  - Định rõ 3 tầng hiển thị chữ:
    - Primary Headings / Core Data: `--text-main` (tối đậm, tương phản cao, `font-weight: 700/800`).
    - Form Labels / Table Headers: `--text-secondary` (độ rõ ràng cao, `font-weight: 600`).
    - Help text / Metadata / Timestamps: `--text-muted` (xám dịu, kích thước `0.75rem - 0.8125rem`).

---

## 4. Trụ Cột 4: Khả Năng Tiếp Cận & Focus States (A11y & Focus States)

### 4.1 Chuẩn Hóa Focus State Bằng `:focus-visible`
- **Vấn đề**: Khi bấm chuột vào các trường nhập liệu xuất hiện viền focus khó chịu, nhưng khi duyệt bằng bàn phím (phím `Tab`) lại thiếu chỉ báo rõ ràng cho người dùng.
- **Giải pháp**:
  - Thay thế quy tắc `.form-input:focus` cũ bằng:
    ```css
    .form-input:focus-visible,
    .form-select:focus-visible,
    .btn:focus-visible {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px var(--primary-glow);
    }
    ```
  - Đảm bảo khi dùng chuột click thì không hiện viền ring dư thừa, nhưng khi nhấn `Tab` điều hướng bàn phím thì viền xanh nổi bật tức thì.

### 4.2 Thẻ Hỗ Trợ Trợ Thính (Screen Readers - ARIA)
- **Vấn đề**: Screen readers đọc cả những icon trang trí (Search, Clock, Folder, v.v.).
- **Giải pháp**:
  - Bổ sung `aria-hidden="true"` vào tất cả icon trang trí của `lucide-react`.
  - Tất cả các nút chỉ có icon (như nút Đóng Modal `X`, nút Xóa tìm kiếm `Clear`, nút Hành động trong bảng) bắt buộc phải có `aria-label` mô tả rõ hành động (ví dụ: `aria-label="Đóng cửa sổ"`, `aria-label="Xóa nội dung tìm kiếm"`).

### 4.3 Thông Báo Động Bằng `aria-live`
- **Vấn đề**: Khi có thông báo toast thành công hoặc banner lỗi xuất hiện, người dùng khiếm thị sử dụng thiết bị đọc màn hình không nhận biết được nội dung mới phát sinh.
- **Giải pháp**:
  - Thẻ chứa thông báo lỗi / toast được gắn `role="status"` và `aria-live="polite"`.

---

## 5. Kế Hoạch Triển Khai (Execution Checklist)

- [ ] **Giai đoạn 1**: Cập nhật `src/index.css` (bổ sung token typography, `font-variant-numeric: tabular-nums`, quy chuẩn `:focus-visible` ring).
- [ ] **Giai đoạn 2**: Refactor `CreateProgramModal.tsx` & `EditProgramModal.tsx` (gắn `id`/`htmlFor`, inline errors, `aria-hidden` cho icons, clickable checkbox card).
- [ ] **Giai đoạn 3**: Refactor `ProgramFilterBar.tsx` & `ProgramTable.tsx` (chuẩn hóa placeholder typography `…`, `tabular-nums` cho số lượng, tách biệt khoảng thở cho action buttons).
- [ ] **Giai đoạn 4**: Build kiểm tra TypeScript (`tsc -b`), review lại visual và test điều hướng bàn phím (`Tab`, `Space`, `Enter`).
