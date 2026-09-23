# 08. Quy Chuẩn Thiết Kế UX/UI & Trải Nghiệm Người Dùng (UI/UX Design Guidelines)

Tài liệu này thiết lập toàn bộ quy chuẩn thiết kế giao diện người dùng (**UI**) và trải nghiệm người dùng (**UX**) cho dự án **InternHub-Frontend**. Mọi thành phần giao diện, trang màn hình và biểu mẫu khi được xây dựng hoặc chỉnh sửa bắt buộc phải tuân thủ nghiêm ngặt các nguyên tắc trong tài liệu này để bảo đảm tính thẩm mỹ, nhất quán và đẳng cấp doanh nghiệp hiện đại (ngang tầm các sản phẩm quốc tế như Stripe, Linear, Vercel).

---

## 1. Triết Lý Trực Quan & Thẩm Mỹ (Visual Excellence & 8pt Spacing Grid)

### 1.1. Triết Lý Thiết Kế Trực Quan (Visual Philosophy)
1. **Hiện Đại & Tinh Tế (Clean & Sleek)**: Giao diện phải mang lại cảm giác thoáng đãng, sắc sảo, không rườm rà. Sử dụng các đường viền mảnh (`1px solid var(--border-default)`), độ bo góc vừa phải (`--radius-md: 10px`, `--radius-lg: 14px`) và đổ bóng đa tầng mềm mại.
2. **Không Gian Thở & Nhịp Điệu Thị Giác (Visual Rhythm)**: Mọi phần tử phải có khoảng cách hợp lý để mắt người dùng dễ quét nội dung mà không cảm thấy ngột ngạt hoặc rời rạc.
3. **Phân Cấp Thị Giác Rõ Ràng (Visual Hierarchy)**: Người dùng phải nhận biết ngay nội dung chính qua kích thước font, độ đậm (`font-weight: 700` cho tiêu đề, `500/600` cho nhãn và dữ liệu quan trọng, `400` cho nội dung phụ), và màu sắc tương phản.

### 1.2. Quy Tắc Nhịp Thở Không Gian Chuẩn 8pt Grid (The 8pt Spacing System)
Toàn bộ thuộc tính `padding`, `margin`, và `gap` trong hệ thống bắt buộc phải là bội số của **4px hoặc 8px**:
- **4px (`0.25rem`)**: Khoảng cách vi mô (gap giữa icon và text nhỏ, padding badge).
- **8px (`0.5rem`)**: Khoảng cách hẹp (gap giữa các nút con, padding nút cỡ nhỏ).
- **12px (`0.75rem`)**: Khoảng cách trung bình nhỏ (padding trong ô input, gap form đơn giản).
- **16px (`1rem`)**: Khoảng cách chuẩn mặc định (padding card, gap giữa các trường form).
- **24px (`1.5rem`)**: Khoảng cách rộng (khoảng cách giữa các khối section, padding trong modal body).
- **32px (`2rem`)**: Khoảng cách lớn (margin dưới Page Header, khoảng cách giữa các phần lớn).
- **48px (`3rem`)**: Khoảng cách phân cách vùng đặc biệt.

> [!CAUTION]
> **NGHIÊM CẤM DÙNG SỐ LẺ TẺ**: Tuyệt đối không dùng các khoảng cách tự do như `11px`, `13px`, `17px`, `23px`... làm phá vỡ nhịp điệu thị giác của giao diện.

---

## 2. Hệ Thống Design Tokens & Chuẩn Hóa Dark/Light Mode 2 Chiều

### 2.1. Quy Tắc Cấm Tuyệt Đối Hardcode Mã Màu Hex
> [!IMPORTANT]
> **100% MÀU SẮC BẮT BUỘC SỬ DỤNG CSS VARIABLES TỪ `src/index.css`.**
> 
> - **Nghiêm cấm**: Viết mã màu cứng như `color: #ffffff;`, `background: #0f172a;`, `border: 1px solid #e2e8f0;` bên trong các file `.module.css`.
> - **Bắt buộc**: Sử dụng token ngữ nghĩa tương ứng (`var(--text-main)`, `var(--bg-card)`, `var(--border-default)`...).

### 2.2. Bảng Ánh Xạ Tokens Ngữ Nghĩa (Semantic Tokens Palette)

| Tên Biến Token | Light Mode | Dark Mode (`[data-theme='dark']`) | Mục Đích Sử Dụng |
| :--- | :--- | :--- | :--- |
| `--bg-body` | `#f8fafc` (Xám tro nhạt) | `#090d16` (Xanh than thẫm) | Nền tổng thể của toàn bộ ứng dụng |
| `--bg-surface` / `--bg-card` | `#ffffff` (Trắng thuần) | `#131d33` (Xanh đen card) | Nền của Thẻ Card, Bảng, Modal, Dropdown |
| `--text-main` | `#0f172a` (Đen đậm sắc nét) | `#f8fafc` (Trắng sáng) | Văn bản chính, tiêu đề, chữ khi gõ vào input |
| `--text-secondary` | `#475569` (Xám đậm) | `#cbd5e1` (Xám sáng) | Nhãn label, mô tả quan trọng |
| `--text-muted` | `#94a3b8` (Xám vừa) | `#64748b` (Xám dịu) | Placeholder, text phụ, timestamp, icon mờ |
| `--border-default` | `#e2e8f0` (Viền xám nhạt) | `#26354a` (Viền xanh tối) | Đường viền bảng, viền card, viền input mặc định |
| `--border-focus` | `#818cf8` (Tím nhạt) | `#6366f1` (Tím sáng) | Viền khi select/focus vào form controls |
| `--primary` | `#4f46e5` (Indigo chuẩn) | `#4f46e5` / `#6366f1` | Màu thương hiệu chính, nút hành động, active |
| `--primary-glow` | `rgba(79, 70, 229, 0.25)` | `rgba(99, 102, 241, 0.35)` | Hào quang phát sáng khi focus hoặc hover |
| `--success` | `#10b981` (Xanh lục) | `#10b981` | Hoàn thành, đã duyệt, đạt yêu cầu, thành công |
| `--warning` | `#f59e0b` (Vàng cam) | `#f59e0b` | Chờ duyệt, cảnh báo, nhắc nhở |
| `--danger` | `#ef4444` (Đỏ tươi) | `#ef4444` | Xóa, từ chối, lỗi validation, hành động nguy hiểm |
| `--info` | `#3b82f6` (Xanh dương) | `#3b82f6` | Hướng dẫn, thông tin đính kèm, đang thực tập |

---

## 3. Triết Lý Modal-First UX & Cấu Trúc Modal 3 Khối (Sticky Footer & Zero Context-Switching)

### 3.1. Triết Lý Hạn Chế Chuyển Trang (Zero Context-Switching)
- **Quy tắc vàng**: 90% thao tác quản lý dữ liệu (Thêm mới, Xem chi tiết, Chỉnh sửa, Upload CV, Duyệt/Từ chối hồ sơ, Xóa) **bắt buộc phải thực hiện thông qua Modal hoặc Slide-over Drawer ngay trên trang hiện tại**.
- **Lợi ích tối thượng**: Giữ nguyên vẹn 100% bối cảnh làm việc của người dùng (từ khóa tìm kiếm, bộ lọc trường/trạng thái và vị trí phân trang hiện tại không bị mất đi). Khi đóng modal, bảng tự động làm mới (`refetch`) tại chỗ.
- **Ranh giới chuyển trang**: Chỉ chuyển trang (`navigate()`) đối với các phân hệ độc lập hoàn toàn (Đăng nhập/Đăng ký, Chuyển quyền Dashboard, Màn hình báo cáo phân tích toàn diện).

### 3.2. Cấu Trúc Bắt Buộc 3 Khối Của Modal
Mọi component Modal trong hệ thống bắt buộc phải tuân theo cấu trúc 3 khối:
1. **Header cố định**: Chứa Tiêu đề trang trọng (`font-weight: 700`) + Nút đóng `X` (`size={20}`, có `aria-label="Đóng"`). Luôn hiển thị trên đỉnh khi cuộn.
2. **Body cuộn độc lập (`overflow-y: auto`)**: Chứa form hoặc nội dung chi tiết. Khi nội dung vượt quá chiều cao màn hình, chỉ phần Body này được phép cuộn. Sử dụng thanh cuộn siêu mảnh.
3. **Sticky Footer (Chân đế dính cố định)**: Chứa các nút bấm hành động (Nút *"Hủy"* và Nút *"Lưu thay đổi"* / *"Xác nhận"*). **Footer luôn luôn ghim dính ở đáy modal**, cấm để nút bấm trôi xuống đáy body khiến người dùng phải cuộn chuột mỏi tay mới bấm được.

```css
/* Chuẩn cấu trúc CSS Modal 3 khối */
.modal {
  display: flex;
  flex-direction: column;
  max-height: 85vh; /* Không vượt quá 85% chiều cao viewport */
  background-color: var(--bg-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

.header {
  flex-shrink: 0;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-default);
}

.body {
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 1.5rem;
}

.footer {
  flex-shrink: 0;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border-default);
  background-color: var(--bg-surface);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
```

### 3.3. Kích Thước Modal Thích Ứng (Adaptive Sizing)
- `size="sm"` (420px - 480px): Hộp thoại xác nhận nguy hiểm (Xóa, Từ chối).
- `size="md"` (560px - 640px): Biểu mẫu ngắn (Tạo nhanh, Upload tài liệu, Đổi mật khẩu).
- `size="lg"` (768px - 840px): Biểu mẫu chi tiết hoặc Xem thông tin hồ sơ tổng hợp.
- `size="xl"` (900px - 1000px): Hồ sơ chuyên sâu nhiều tab (Thông tin cá nhân, Học vấn, Hợp đồng, Đánh giá).

### 3.4. Cơ Chế Chống Mất Dữ Liệu (Safe Dismissal Guard)
- Khi form đã có dữ liệu người dùng gõ vào (`isDirty = true`): Nếu người dùng vô tình click ra ngoài lớp phủ nền mờ (Backdrop), **Modal TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ ĐỘNG ĐÓNG**. Chỉ đóng khi người dùng chủ động click nút *"Hủy"* hoặc nút `X`.
- Hỗ trợ phím tắt `Escape` để đóng modal khi form chưa bị chỉnh sửa.

### 3.5. Nghiêm Cấm "Modal Lồng Modal" (No Nested Modals)
- Tuyệt đối không mở một modal khác đè lên modal đang có. Nếu quy trình cần nhiều bước, phải sử dụng Stepper (Bước 1 ➔ Bước 2 ➔ Bước 3) ngay bên trong 1 modal duy nhất.

---

## 4. Quy Chuẩn Độ Rõ Nét Chữ & UX Đổi Màu Border Khi Select Toàn Bộ Form Controls

### 4.1. Độ Rõ Nét Chữ & Tương Phản Toàn Hệ Thống (Typography Legibility)
- **Tỷ lệ tương phản (Contrast Ratio)**: Bắt buộc đạt chuẩn **WCAG 2.1 AA (>= 4.5:1)** cho văn bản phụ và **>= 7:1** cho văn bản chính. Tuyệt đối không dùng chữ xám nhạt mờ trên nền trắng hoặc chữ xám tối chìm trên Dark Mode.
- **Kích thước & Độ cao dòng**: Body text không nhỏ hơn 14px (`0.875rem`), line-height từ `1.5` đến `1.6` để chữ thông thoáng, không dính dòng.
- **Dữ liệu số (Numbers & Scores)**: Sử dụng `font-variant-numeric: tabular-nums` để các chữ số có độ rộng đồng đều, thẳng hàng tăm tắp theo cột dọc.

### 4.2. Độ Nổi Bật Chữ Khi Người Dùng Nhập / Chọn Dữ Liệu
- **Màu chữ khi gõ/chọn**: Bắt buộc dùng `var(--text-main)` (đen đậm `#0f172a` trên Light Mode, trắng sáng `#f8fafc` trên Dark Mode).
- **Độ đậm nét**: Đặt `font-weight: 500` hoặc `600` cho nội dung người dùng nhập hoặc chọn, giúp nổi bật tách bạch hoàn toàn khỏi dòng gợi ý (Placeholder màu nhạt `var(--text-muted)`).
- **Cỡ chữ trong Input & Select**: Đạt chuẩn **15px – 16px (1rem)**. Trên Mobile iOS, cỡ chữ >= 16px triệt tiêu hoàn toàn lỗi tự động zoom in màn hình của trình duyệt Safari khi chạm vào ô nhập liệu.

### 4.3. Hiệu Ứng Border Đổi Màu Mượt Mà Khi Select/Focus (Dynamic Border Focus UX)
Áp dụng đồng bộ cho toàn bộ Form Controls: `<Input>`, `<Select>`, `<textarea>`, `<SearchBar>`, `DatePicker`:
1. **Trạng thái bình thường**:
   - `border: 1px solid var(--border-default);`
   - `transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;`
2. **Trạng thái khi Select / Focus (`:focus`, `:focus-within`)**:
   - Viền đổi sang màu thương hiệu sắc nét: `border-color: var(--primary);`
   - Đổ bóng hào quang phát sáng: `box-shadow: 0 0 0 3px var(--primary-glow);`
   - Con trỏ chuột mang màu thương hiệu: `caret-color: var(--primary);`
   - Đối với thẻ `<Select>`: Mũi tên chỉ xuống (Chevron Icon) tự động chuyển sang màu `var(--primary)` khi được select.
3. **Trạng thái khi có lỗi Validation**:
   - `border-color: var(--danger);`
   - `box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);`

---

## 5. Quy Chuẩn Bảng Dữ Liệu 10 Dòng, Phân Trang Tự Ẩn & Nút Bấm Chống Double-Click

### 5.1. Kích Thước Trang Chuẩn Vàng (Default Page Size = 10)
- Mọi bảng dữ liệu trong hệ thống quy định hiển thị mặc định tối đa **10 dòng / trang**.
- Chiều cao 10 dòng (~520px - 560px) cộng với Header và Filter bar vừa khít trong khung nhìn màn hình máy tính 1080p, giúp người dùng xem trọn vẹn dữ liệu mà **không cần cuộn chuột**.

### 5.2. Cơ Chế Tự Động Ẩn Thanh Phân Trang Có Điều Kiện (Conditional Auto-Hide Pagination)
- **Quy tắc bắt buộc**: Khi danh sách có **10 dòng trở xuống** (`totalItems <= 10` hoặc `totalPages <= 1`), hệ thống **bắt buộc phải ẩn hoàn toàn thanh điều hướng phân trang**.
- **Lý do**: Loại bỏ hoàn toàn sự thừa thãi thị giác (nút Trước/Sau bị mờ vô nghĩa, dòng chữ "Trang 1/1" gây nhiễu).
- **Tinh chỉnh giao diện khi ẩn phân trang**:
  + Hàng cuối cùng của bảng (`tbody tr:last-child td`) tự động bo tròn góc đáy mềm mại và có viền đáy tinh tế (`border-bottom: 1px solid var(--border-default)`), giữ khối Card trọn vẹn, không bị hẫng hoặc cụt đáy.
  + Hiển thị dòng đếm số lượng trang nhã (*"Hiển thị toàn bộ 7 hồ sơ"*).

```tsx
// Pattern JSX chuẩn cho Conditional Auto-Hide Pagination
{totalPages > 1 && (
  <Pagination
    currentPage={page + 1}
    totalPages={totalPages}
    onPageChange={handlePageChange}
    isLoading={loading}
  />
)}
```

### 5.3. Tiêu Chuẩn Nút Bấm Phân Trang, Khóa Chống Double-Click & Loader Chuyển Trang
1. **Tiêu chuẩn Nút bấm**: Kích thước nút phân trang tối thiểu 36px, bo góc `var(--radius-md)`. Nút trang hiện tại (`active`) mang màu nền `var(--primary)`, chữ trắng sáng, đổ bóng nhẹ.
2. **Khóa tương tác chống Double-Click (Interaction Lock)**:
   - Ngay khi người dùng click chuyển trang, toàn bộ thanh phân trang lập tức chuyển sang trạng thái `isLoading = true` (tạm khóa `pointer-events: none`).
   - Ngăn chặn 100% việc người dùng click 2–3 lần liên tiếp gây xung đột request hoặc race-condition.
3. **Hiển thị Loader khi tải trang mới**:
   - Hiển thị mini-spinner xoay trên nút số trang đang được tải hoặc thông báo trạng thái *"Đang tải trang N..."*.
   - Khung bảng phía trên phủ một lớp mờ nhẹ (Opacity 0.6) hoặc Skeleton Shimmer trong khi chờ dữ liệu mới từ backend.

---

## 6. Quy Chuẩn 5 Trạng Thái Giao Diện Bắt Buộc (The Zero-Jank 5 UI States)

Mọi danh sách, bảng dữ liệu hoặc thẻ card bắt buộc phải xử lý trọn vẹn 5 trạng thái:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. LOADING: Skeleton Shimmer (Chống giật khung hình CLS)   │
│ 2. EMPTY:   Icon 48px + Tiêu đề + Hướng dẫn + Nút CTA      │
│ 3. ERROR:   Thông báo lịch sự + Nút "Thử lại" (Retry)       │
│ 4. SUCCESS: Toast góc phải tự tắt sau 3s + Tự refetch bảng │
│ 5. ACTION:  In-Button Spinner xoay + Khóa double click      │
└─────────────────────────────────────────────────────────────┘
```

### 6.1. Loading State Với Skeleton Shimmer (Chống Giật Khung Hình CLS)
- **Nghiêm cấm**: Để màn hình trắng trơn, hoặc chỉ hiển thị 1 dòng chữ thô sơ: *"Đang tải danh sách..."*.
- **Bắt buộc**: Dựng Skeleton Loader mô phỏng chính xác số cột và số dòng của bảng thật với hiệu ứng sóng ánh sáng Shimmer lướt qua mượt mà. Giữ nguyên kích thước khung bảng để khi dữ liệu về, giao diện không bị giật nảy (Zero Cumulative Layout Shift).

### 6.2. Empty State Có Tính Định Hướng & Thẩm Mỹ
- **Nghiêm cấm**: Hiển thị dòng text xám trơ trọi: *"Không tìm thấy dữ liệu"*.
- **Bắt buộc có đủ 4 thành phần**:
  1. Icon minh họa sinh động (Lucide icon kích thước 48px, tone màu dịu nhẹ).
  2. Tiêu đề thân thiện (*"Chưa có hồ sơ thực tập sinh nào"* hoặc *"Không tìm thấy kết quả phù hợp"*).
  3. Mô tả nguyên nhân và giải pháp ngắn gọn.
  4. Nút bấm hành động trực tiếp (CTA): Nút *"Tạo mới hồ sơ"* hoặc *"Đặt lại bộ lọc tìm kiếm"*.

### 6.3. Error State Kèm Nút Thử Lại (Retry Action)
- Hiển thị cảnh báo lịch sự, an toàn (không lộ stack trace thô với người dùng cuối).
- Luôn luôn đi kèm nút bấm **"Thử lại" (Retry Action)** cho phép gọi lại API mà không cần F5 tải lại toàn bộ trang web.

### 6.4. Success State & Phản Hồi Mutation Tức Thì
- Hiển thị Toast thông báo thành công ở góc phải trên màn hình, tự động ẩn mượt sau 3–4 giây.
- Tự động đóng Modal và tự động kích hoạt `refetch()` làm mới dữ liệu trên bảng.

### 6.5. In-Button Loading Spinner (Chống Double Click Nút Hành Động)
- Khi bấm nút Submit/Lưu/Xóa: Nút giữ nguyên kích thước, chữ chuyển thành *"Đang xử lý..."*, xuất hiện spinner xoay tròn bên trong nút, đồng thời khóa click (`disabled`).

---

## 7. Quy Chuẩn Thiết Kế Đa Thiết Bị (Responsive Desktop/Mobile & Table-to-Card)

### 7.1. Breakpoints Chuẩn Toàn Hệ Thống
- **Desktop lớn**: `>= 1280px`
- **Laptop / Màn hình chuẩn**: `1024px – 1279px`
- **Tablet**: `768px – 1023px`
- **Mobile**: `< 768px` (ưu tiên tối ưu cho 375px - 430px)

### 7.2. Giao Diện Máy Tính (Desktop / Laptop)
1. **Khung sườn cố định (App Shell Layout)**: Header phía trên và Sidebar bên trái luôn được giữ cố định. Toàn bộ thanh cuộn chỉ hoạt động bên trong vùng làm việc chính (Main Content Area).
2. **Hiển thị bao quát & không cắt cụt**: Mọi thông tin quan trọng được dàn trải rõ ràng. Khi bảng có nhiều cột trên laptop nhỏ, chỉ cuộn ngang trong khối `table-container`, **tuyệt đối không để tràn ngang toàn màn hình trình duyệt**.

### 7.3. Giao Diện Điện Thoại: Chuyển Đổi Bảng Sang Dạng Thẻ (Table-to-Card Transformation)
- Bảng 7–10 cột trên màn hình điện thoại rất khó theo dõi và dễ chạm nhầm.
- **Quy tắc bắt buộc trên Mobile**: Toàn bộ bảng dữ liệu tự động chuyển đổi thành **Danh sách Thẻ Card dọc**:
  + Mỗi thẻ card đại diện cho 1 thực tập sinh, có viền mảnh và bo góc mềm mại.
  + Thể hiện đầy đủ: Avatar + Họ tên, Badge trạng thái ở góc trên bên phải, Thông tin liên hệ và trường học bên dưới.
  + Các nút bấm hành động (Xem, Sửa, Upload) dàn ngang ở đáy thẻ với kích thước vùng chạm tối thiểu **44px x 44px** (chuẩn Touch Target).

---

## 8. Quy Chuẩn Thanh Cuộn & Cột Đinh Cố Định (Custom Sleek Scrollbar & Sticky Columns)

### 8.1. Thanh Cuộn Siêu Mảnh Tùy Biến (Custom Sleek Scrollbar)
> [!CAUTION]
> **NGHIÊM CẤM DÙNG THANH CUỘN MẶC ĐỊNH CỦA WINDOWS (TO 17PX, XÁM THÔ).**

- **Độ rộng**: Chỉ từ **6px đến 8px**.
- **Bo góc**: Hoàn toàn tròn viền (`border-radius: 9999px`).
- **Màu sắc**: Màu nhạt trong suốt (`var(--border-default)`), tự động làm đậm khi rê chuột (`var(--border-focus)`), tương thích 100% với cả Dark Mode và Light Mode.
- **Tự ẩn**: Tự động mờ hoặc ẩn khi không di chuột để trả lại không gian thoáng đãng cho giao diện.
- **Chống bẫy cuộn (Scroll Trap)**: Không lồng các khối cuộn dọc cạnh nhau làm kẹt con lăn chuột của người dùng.

```css
/* CSS chuẩn tùy biến thanh cuộn toàn hệ thống */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: var(--border-default);
  border-radius: 9999px;
  transition: background-color 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background-color: var(--text-muted);
}
```

### 8.2. Cột Đinh Cố Định Cho Bảng Dữ Liệu Nhiều Cột (Sticky Columns)
Khi bảng dữ liệu có nhiều cột cần cuộn ngang cục bộ:
- **Cột bên trái (Mã TTS)**: Được ghim cố định bằng `position: sticky; left: 0; z-index: 2;` kèm đổ bóng nhẹ ngăn cách.
- **Cột bên phải (Thao Tác Hồ Sơ)**: Được ghim cố định bằng `position: sticky; right: 0; z-index: 2;` kèm đổ bóng nhẹ ngăn cách bên trái.
- **Kết quả**: Khi người dùng cuộn ngang xem các cột ở giữa (Trường học, Email, Chuyên ngành...), mã thực tập sinh và các nút bấm hành động luôn hiển thị rõ ràng trước mắt, không bị trôi mất.

---

## 9. Quy Chuẩn Thao Tác Nguy Hiểm & Hộp Thoại Xác Nhận (Destructive UX & Data Safety)

### 9.1. Nghiêm Cấm Tuyệt Đối `window.confirm()` Của Trình Duyệt
Mọi thao tác mang tính chất xóa, từ chối, hủy liên kết hoặc thay đổi quyền hạn bắt buộc phải sử dụng **Confirmation Modal tùy biến của hệ thống**.

### 9.2. Tiêu Chuẩn Hộp Thoại Xác Nhận Nguy Hiểm
1. **Biểu tượng cảnh báo**: Sử dụng Icon `AlertTriangle` hoặc `Trash2` màu đỏ đặt trong khung tròn nền đỏ nhạt (`var(--danger-bg)`).
2. **Nội dung cảnh báo minh bạch**: Bắt buộc nêu đích danh tên hoặc mã đối tượng bị tác động (Ví dụ: *"Bạn có chắc chắn muốn xóa hồ sơ thực tập sinh **Nguyễn Văn A (Mã: TTS-2026-001)** không? Thao tác này sẽ xóa vĩnh viễn và không thể hoàn tác."*).
3. **Nút xác nhận hành động nguy hiểm**: Mang biến thể `variant="danger"` (nền đỏ tươi `var(--danger)`).
4. **Nút hủy bỏ an toàn**: Mang biến thể `variant="secondary"`, tự động nhận focus ban đầu để tránh người dùng nhấn nhầm phím `Enter` kích hoạt xóa ngoài ý muốn.

### 9.3. Bảo Toàn Dữ Liệu Khi Submit Lỗi (Data Loss Prevention)
Khi người dùng bấm Lưu/Submit form mà Backend trả về lỗi (400, 422, 500):
- **BẮT BUỘC GIỮ NGUYÊN FORM VÀ MODAL**: Tuyệt đối không đóng modal, không reset form làm mất dữ liệu người dùng đã tốn công nhập.
- **Bôi đỏ trường lỗi**: Ánh xạ chính xác `fieldErrors` từ Backend Spring Boot vào đúng ô input bị sai để người dùng nhận biết và chỉnh sửa lại ngay tại chỗ.

---

## 10. Quy Chuẩn Bảng Dữ Liệu Doanh Nghiệp (Enterprise Data Table UX)

1. **Avatar Nhận Diện Nhân Sự**: Cột Họ và Tên luôn đi kèm Avatar tròn (hình đại diện hoặc 2 chữ cái viết tắt của tên với nền màu ngẫu nhiên trang nhã).
2. **Status Badge Có Chấm Phát Sáng (Dot Indicator)**:
   - Bo tròn hoàn toàn (`border-radius: 9999px`), màu nền pastel nhạt.
   - Có một chấm tròn nhỏ (**Dot**) phát sáng phía trước để người dùng quét mắt là phân biệt được trạng thái ngay lập tức.
3. **Quy Chuẩn Căn Lề Cột Dữ Liệu Nghiêm Ngặt**:
   - **Căn trái (Left)**: Họ và tên, Email, Trường học, Vị trí ứng tuyển, Mô tả văn bản.
   - **Căn phải (Right)**: Điểm số, Tiền tệ, Số lượng, Phần trăm tiến độ.
   - **Căn giữa (Center)**: Mã TTS, Ngày tháng, Badge trạng thái, Cột nút bấm thao tác.
4. **Chống Vỡ Dòng (Text Clamping & Tooltip)**:
   - Các cột chứa văn bản dài (Địa chỉ, Ghi chú, Lý do từ chối) phải dùng `text-overflow: ellipsis; white-space: nowrap; overflow: hidden;` kèm thuộc tính `title` để hiển thị tooltip đầy đủ khi rê chuột.
5. **Sticky Table Header**: Thanh tiêu đề cột luôn ghim cố định ở đỉnh bảng khi cuộn danh sách dài.

---

## 11. Tiêu Chuẩn Tiếp Cận, Phím Tắt & Chống Giật Khung Hình (Accessibility & Micro-interactions)

### 11.1. Tiêu Chuẩn Tiếp Cận (Accessibility - WCAG 2.1 AA)
- **Tương phản màu sắc**: Luôn đạt tỷ lệ `>= 4.5:1` giữa màu chữ và màu nền.
- **Vùng chạm tối thiểu (Touch Target)**: Mọi nút bấm, icon action trên mobile phải có vùng bấm tối thiểu **44px x 44px**. Trên desktop tối thiểu **36px x 36px**.
- **Thuộc tính Hỗ Trợ Trợ Thính (Screen Readers)**:
  + Mọi nút bấm chỉ có icon (như nút Close `X`, nút Edit, nút Delete) bắt buộc phải có thuộc tính `aria-label` mô tả rõ hành động (ví dụ: `aria-label="Xóa hồ sơ thực tập sinh"`).
  + Modal bắt buộc có `role="dialog"` và `aria-modal="true"`.

### 11.2. Hỗ Trợ Điều Hướng Bằng Bàn Phím (Keyboard Navigation)
- **Phím `Escape`**: Tự động đóng Modal, Drawer hoặc Dropdown menu đang mở.
- **Phím `Enter`**: Kích hoạt submit form khi đang đứng trong ô input.
- **Focus Ring rõ nét**: Người dùng bấm phím `Tab` duyệt qua các nút, ô input phải luôn thấy viền hào quang phát sáng `box-shadow: 0 0 0 3px var(--primary-glow)`. Tuyệt đối không xóa bỏ `outline` mà không có focus style thay thế.

### 11.3. Hiệu Ứng Vi Mô (Micro-interactions) & Chống Giật Khung Hình (Zero-Jank CLS)
- **Transition chuẩn**: Mọi thay đổi màu sắc viền, hover nút bấm, nâng thẻ card dùng `transition: all 0.2s ease`.
- **Hover Lift Thẻ Metrics**: Thẻ thống kê khi rê chuột nâng nhẹ 2px (`transform: translateY(-2px)`) kèm bóng đổ đậm hơn (`var(--shadow-md)`).
- **Dành sẵn không gian báo lỗi (Zero-Shift Validation)**: Chiều cao tối thiểu của vùng hiển thị thông báo lỗi bên dưới ô input phải được tính toán diện tích sẵn sàng, tránh việc khi thông báo đỏ xuất hiện làm giật tụt toàn bộ form xuống dưới.
