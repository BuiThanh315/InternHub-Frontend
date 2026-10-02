# Đặc Tả Kỹ Thuật Giao Diện (Frontend Spec): TM-19 Mentor Giao Nhiệm Vụ Cho Thực Tập Sinh

## 1. Tổng Quan & Mục Tiêu Nghiệp Vụ
- **Mã tính năng:** TM-19 (Mentor Task Assignment & Mission Board).
- **Phân hệ:** Dành riêng cho `ROLE_MENTOR` (và `ADMIN`).
- **Mục tiêu cốt lõi:**
  1. Cung cấp không gian làm việc (Engineering Project Workspace) trực quan, hiện đại cho Mentor để quản lý và giao việc cho các thực tập sinh trong các chương trình thực tập (`Internship Program`) mà mình phụ trách.
  2. Tổ chức công việc thông qua mô hình **Bảng Nhiệm Vụ (Mission Board)** với các mục công việc chi tiết (**Mission Items**).
  3. Quản lý luồng công việc qua **3 cột trạng thái chuẩn**: `"Chưa làm"` (`TODO`), `"Đang làm"` (`IN_PROGRESS`), `"Hoàn thiện"` (`COMPLETED`).
  4. Cho phép gán **1 hoặc nhiều Thực tập sinh** trong Chương trình tham gia vào một mục công việc chi tiết.
  5. Cung cấp báo cáo tiến độ thời gian thực (% hoàn thành, số lượng đầu việc) và bộ lọc linh hoạt.

---

## 2. Triết Lý Thiết Kế Visual & UX (Áp Dụng Skill Frontend Design)

### 2.1. Bản Sắc Thiết Kế (Subject Matter Identity)
- Mang phong cách của các công cụ quản lý dự án công nghệ chuẩn quốc tế (như Linear, GitHub Projects) nhưng được tinh chỉnh tinh tế, gần gũi với văn hóa quản lý đào tạo thực tập sinh tại doanh nghiệp Việt Nam.
- Tránh xa các giao diện quản trị dạng bảng tính khô cứng (Data-grid thuần túy) hoặc các SaaS template rập khuôn (SaaS-card kit với viền bóng mờ cẩu thả).
- **"Spend your boldness in one place"**: Tập trung điểm nhấn thị giác vào **Triple-Column Kanban Board** với các thẻ công việc hiển thị Avatar Stack của TTS, Deadline Indicator đổi màu thông minh, và Quick Status Transition mượt mà.

### 2.2. Hệ Màu Tokens (Trích xuất từ `src/index.css`)
- **Nền & Bề mặt:**
  - Nền trang: `var(--bg-body)` (`#f8fafc` Light / `#090d16` Dark).
  - Thẻ & Bảng: `var(--bg-card)` (`#ffffff` Light / `#131d33` Dark), viền `var(--border-default)`.
- **Màu thương hiệu & Điểm nhấn:**
  - `var(--primary)`: `#4f46e5` (Indigo), `var(--primary-glow)`.
  - Gradient tiêu đề & tiến độ: `var(--primary-gradient)` (`linear-gradient(135deg, #4f46e5, #7c3aed)`).
- **Trạng thái 3 cột công việc (Semantic Status Colors):**
  - **Cột Chưa Làm (`TODO`):**
    - Header & Icon: `var(--text-secondary)` (`#475569` / `#94a3b8`).
    - Card Accent: Viền trung tính mảnh `var(--border-default)`, nền sạch sẽ.
  - **Cột Đang Làm (`IN_PROGRESS`):**
    - Header & Icon: `var(--info)` (`#3b82f6` / `#0284c7`).
    - Card Accent: Viền trái màu xanh dương 3px, badge phát sáng nhẹ.
  - **Cột Hoàn Thiện (`COMPLETED`):**
    - Header & Icon: `var(--success)` (`#10b981`).
    - Card Accent: Viền trái màu ngọc bích 3px, tiêu đề có tùy chọn gạch nhẹ tinh tế, badge tick xanh.
- **Mức độ ưu tiên (Priority Badges):**
  - **HIGH (Cao):** Đỏ ruby `var(--danger)` (`#ef4444`, nền `var(--danger-bg)`).
  - **MEDIUM (Trung bình):** Vàng hổ phách `var(--warning)` (`#f59e0b`, nền `var(--warning-bg)`).
  - **LOW (Thấp):** Xám trung tính `var(--text-muted)` (`#64748b`, nền `var(--border-subtle)`).

### 2.3. Typography & Bố Cục
- Tiêu đề Board & Cột: Font `Outfit`, font-weight 600/700, tracking -0.01em.
- Thẻ công việc & Meta: Font `Inter`, font-weight 400/500, line-height 1.5, cỡ chữ 13-14px.
- Tránh hoàn toàn các tells của AI: Không dùng all-caps vô tội vạ, không dùng monospace cho nhãn thường, không dùng các ký tự trang trí `→` hoặc `•` bừa bãi.

---

## 3. Kiến Trúc Trải Nghiệm Người Dùng (UX Wireframe)

### 3.1. Bố Cục Tổng Thể Trang (Master Workspace Layout)
```text
+-----------------------------------------------------------------------------------------------+
| Header: Quản Lý Nhiệm Vụ & Giao Việc (Mentor)                                                 |
| Subtitle: Phân công nhiệm vụ, theo dõi tiến độ và đánh giá kết quả thực tập sinh             |
+-----------------------------------------------------------------------------------------------+
| Program Selector Bar & Quick Stats:                                                           |
| [ Chương trình: Java Backend K28 ▼ ]  [ Trạng thái: Đang diễn ra ]   [ + Tạo Bảng Nhiệm Vụ ] |
| Tiến độ tổng thể: [████████████████░░░░░░░░] 62% (13/21 việc đã hoàn thiện)                  |
+-----------------------------------------------------------------------------------------------+
| Board Meta & Filter Toolbar:                                                                  |
| [ Bảng: Sprint 1 - Xây dựng REST API & Security ] (Hạn chót: 15/10/2026)                      |
| [ Search công việc...   ] [ Lọc TTS: Tất cả ▼ ] [ Độ ưu tiên: Tất cả ▼ ]   [ + Giao việc ]    |
+-----------------------------------------------------------------------------------------------+
| Triple-Column Kanban Board Area:                                                              |
|                                                                                               |
|  ⚪ CHƯA LÀM (4)                🔵 ĐANG LÀM (3)                🟢 HOÀN THIỆN (6)             |
|  +---------------------------+  +---------------------------+  +---------------------------+  |
|  | [Card 101]                |  | [Card 102]                |  | [Card 100]                |  |
|  | [HIGH] [Hạn: 08/10]       |  | [MEDIUM] [Hạn: 10/10]     |  | [HIGH] [Xong: 02/10]      |  |
|  | Cấu hình Spring Security  |  | Viết Unit Test Controller |  | Khởi tạo Repo & Gradle    |  |
|  | Cài đặt JWT & filter...   |  | Mockito test suite...     |  | Setup multi-module...     |  |
|  | Assignees: (A) (B)        |  | Assignees: (C)            |  | Assignees: (A) (D)        |  |
|  | [-> Chuyển Đang làm]      |  | [<- Chưa làm] [Xong ->]   |  | [✓ Đã nghiệm thu]         |  |
|  +---------------------------+  +---------------------------+  +---------------------------+  |
|  | [Card 104]                |  |                           |  |                           |  |
|  | [LOW] [Hạn: 12/10]        |  |                           |  |                           |  |
|  | Viết API Docs OpenAPI     |  |                           |  |                           |  |
|  | Assignees: (B)            |  |                           |  |                           |  |
|  +---------------------------+  +---------------------------+  +---------------------------+  |
|  | + Thêm công việc nhanh    |  |                           |  |                           |  |
+-----------------------------------------------------------------------------------------------+
```

### 3.2. Cấu Trúc Thẻ Công Việc (Mission Card Anatomy)
Mỗi thẻ công việc được thiết kế với sự phân cấp rõ ràng:
1. **Header thẻ:**
   - Tag độ ưu tiên (`Cao`, `Trung bình`, `Thấp`) có màu sắc ngữ nghĩa.
   - Nút hành động phụ (Menu 3 chấm hoặc nút Sửa / Xóa) mở khi hover hoặc click.
2. **Body thẻ:**
   - Tiêu đề công việc: In đậm, cỡ chữ 14px, rõ ràng.
   - Mô tả ngắn gọn: Tối đa 2 dòng (`line-clamp-2`), chữ màu secondary.
3. **Footer thẻ:**
   - **Avatar Stack:** Hiển thị tối đa 3 avatar tròn của TTS được gán, nếu nhiều hơn thì hiển thị `+N`. Hover vào avatar sẽ có tooltip hiển thị `[Tên TTS] - [Mã TTS]`.
   - **Deadline Badge:** Icon đồng hồ + ngày hết hạn (`dd/MM/yyyy`). Nếu quá hạn sẽ chuyển đỏ nổi bật.
4. **Quick Transition Bar:**
   - Các nút icon nhỏ gọn cho phép chuyển nhanh trạng thái sang cột liền kề mà không cần mở modal:
     - Tại cột `TODO`: Nút "Bắt đầu làm" $\rightarrow$ chuyển sang `IN_PROGRESS`.
     - Tại cột `IN_PROGRESS`: Nút "Lùi lại" $\leftarrow$ `TODO` và nút "Hoàn thành" $\rightarrow$ `COMPLETED`.
     - Tại cột `COMPLETED`: Nút "Mở lại" $\leftarrow$ `IN_PROGRESS`.

---

## 4. Modal-First Workflow (Tuân Thủ Quy Tắc 29 & 33)

### 4.1. Modal Tạo / Chỉnh Sửa Bảng Nhiệm Vụ (`MissionBoardModal`)
- **Cấu trúc 3 khối:**
  - Header: Tiêu đề `"Tạo Bảng Nhiệm Vụ Mới"` hoặc `"Chỉnh Sửa Bảng Nhiệm Vụ"`.
  - Body (cuộn độc lập):
    - Tên bảng nhiệm vụ (`title`): Bắt buộc, 3 - 150 ký tự.
    - Mô tả bảng (`description`): Tùy chọn, textarea.
    - Ngày hết hạn (`dueDate`): Date picker, tùy chọn.
  - Sticky Footer: Nút `"Hủy"` (variant outline) và `"Lưu Bảng Nhiệm Vụ"` (variant primary, có loading state).

### 4.2. Modal Giao Việc Mới / Chỉnh Sửa Công Việc (`MissionItemModal`)
- **Cấu trúc 3 khối:**
  - Header: `"Giao Công Việc Mới"` hoặc `"Chỉnh Sửa Mục Công Việc"`.
  - Body:
    - Tiêu đề công việc (`title`): Bắt buộc.
    - Mô tả chi tiết (`description`): Textarea.
    - Mức độ ưu tiên (`priority`): Select (`LOW`, `MEDIUM`, `HIGH`).
    - Hạn hoàn thành (`dueDate`): Date input.
    - **Danh Sách Gán Thực Tập Sinh (Assignees Multi-Select):**
      - Hiển thị danh sách TTS trong Chương trình hiện tại dạng checklist trực quan.
      - Mỗi mục có: Checkbox, Avatar, Tên đầy đủ, Mã TTS, Email.
      - Có thanh tìm kiếm nhanh TTS trong modal.
      - Cho phép tick chọn 1 hoặc nhiều TTS dễ dàng.
  - Sticky Footer: Nút `"Hủy"` và `"Lưu Công Việc"`.

### 4.3. Modal Xác Nhận Xóa Nguy Hiểm (`DeleteConfirmModal`)
- Áp dụng Quy tắc 33: Cấm tuyệt đối `window.confirm()`.
- Nêu rõ tên Board hoặc tiêu đề Item sắp xóa.
- Nút xác nhận `variant="danger"` ("Xác nhận xóa").

---

## 5. Quy Chuẩn 5 Trạng Thái Giao Diện (Quy Tắc 32)
1. **Loading State:** Sử dụng Skeleton Loader dạng thẻ Shimmer mô phỏng 3 cột Kanban, loại bỏ giật layout (CLS).
2. **Empty State:**
   - Khi Mentor chưa được gán vào Program nào: Icon minh họa `FolderGit2` + Tiêu đề `"Bạn chưa được phân công vào chương trình thực tập nào"` + Lời nhắn `"Vui lòng liên hệ HR để được gán phụ trách chương trình."`.
   - Khi Program chưa có Bảng nhiệm vụ nào: Icon `LayoutKanban` + Tiêu đề `"Chưa có bảng nhiệm vụ nào trong chương trình này"` + Nút CTA `"+ Tạo Bảng Nhiệm Vụ Đầu Tiên"`.
   - Khi Cột Kanban chưa có công việc: Khối viền nét đứt nhẹ nhàng + Tiêu đề `"Chưa có công việc nào"` + Nút `"+ Thêm việc"`.
3. **Error State:** Hiển thị `Alert` biến thể error kèm nút `"Thử lại"`.
4. **Success State:** Thông báo Toast qua `sonner` (`"Tạo bảng nhiệm vụ thành công"`, `"Đã cập nhật trạng thái công việc"`).
5. **Disabled State:** Vô hiệu hóa nút và hiện spinner khi đang gửi dữ liệu (chống double-click).

---

## 6. Danh Mục Tệp Tin Dự Kiến Xây Dựng (Kiến Trúc Modular 4 Tầng)

| Tầng | Đường dẫn tệp tin | Mô tả trách nhiệm |
| :--- | :--- | :--- |
| **Endpoints** | `src/constants/endpoints/mission.endpoints.ts`<br>`src/constants/endpoints/index.ts` | Khai báo các API URL chuẩn TM-19 |
| **Routes** | `src/constants/routes/mentor.routes.ts`<br>`src/constants/routes/index.ts` | Thêm route `/mentor/missions` |
| **Types** | `src/types/mission.types.ts`<br>`src/types/index.ts` | Định nghĩa toàn bộ interfaces & enums của TM-19 |
| **Service** | `src/services/missionService.ts` | Gọi API Axios 4 tầng có AbortSignal |
| **Hooks** | `src/hooks/useMentorMissions.ts` | Custom hook quản lý state dữ liệu, load board, đổi trạng thái |
| **Components** | `src/pages/mentor/missions/components/MissionBoardHeader.tsx`<br>`src/pages/mentor/missions/components/MissionKanbanBoard.tsx`<br>`src/pages/mentor/missions/components/MissionKanbanColumn.tsx`<br>`src/pages/mentor/missions/components/MissionCard.tsx`<br>`src/pages/mentor/missions/components/AssigneeAvatarStack.tsx`<br>`src/pages/mentor/missions/components/MissionBoardModal.tsx`<br>`src/pages/mentor/missions/components/MissionItemModal.tsx`<br>`src/pages/mentor/missions/components/DeleteConfirmModal.tsx` | Các sub-components độc lập, mỗi component có CSS Module và `.types.ts` riêng |
| **Page** | `src/pages/mentor/missions/MentorMissionPage.tsx` | Trang trung tâm quản lý Bảng nhiệm vụ của Mentor |
| **Sidebar** | `src/components/layout/Sidebar.tsx` | Thêm mục menu `"Bảng Nhiệm Vụ & Giao Việc"` cho Mentor |
