# Kế Hoạch Triển Khai Giao Diện (Frontend Plan): TM-19 Mentor Giao Nhiệm Vụ Cho Thực Tập Sinh

## 1. Mục Đích & Phạm Vi
- **Mục đích:** Xây dựng giao diện phân hệ Bảng nhiệm vụ & Giao việc cho Mentor (`ROLE_MENTOR`), cho phép Mentor quản lý tiến độ thực tập sinh theo Chương trình, tạo Bảng nhiệm vụ, giao công việc chi tiết và theo dõi qua 3 cột trạng thái (`TODO`, `IN_PROGRESS`, `COMPLETED`).
- **Phạm vi kỹ thuật:**
  - Áp dụng các quy chuẩn của `InternHub-Frontend` (34 quy tắc bất biến trong `AGENTS.md`).
  - Áp dụng triết lý thiết kế từ skill `Frontend Design` (Subject matter identity, visual hierarchy, restrained palette, ASCII wireframes, responsive, accessibility).
  - Tái sử dụng tối đa Common Components sẵn có trong `src/components/common/`.

---

## 2. Kế Hoạch Thực Hiện 7 Bước Chuẩn Hóa

### Bước 1: Khai Báo Endpoints & Routes (Tầng Hạ Tầng)
- **Tệp tin tạo/sửa:**
  - Tạo mới `src/constants/endpoints/mission.endpoints.ts`:
    - `PROGRAMS: '/api/mentor/programs'`
    - `PROGRAM_INTERNS: (programId: number) => '/api/mentor/programs/${programId}/interns'`
    - `PROGRAM_BOARDS: (programId: number) => '/api/programs/${programId}/mission-boards'`
    - `BOARDS: '/api/mission-boards'`
    - `BOARD_DETAIL: (boardId: number) => '/api/mission-boards/${boardId}''`
    - `BOARD_STATUS: (boardId: number) => '/api/mission-boards/${boardId}/status'`
    - `BOARD_ITEMS: (boardId: number) => '/api/mission-boards/${boardId}/items'`
    - `ITEMS: (itemId: number) => '/api/mission-items/${itemId}'`
    - `ITEM_STATUS: (itemId: number) => '/api/mission-items/${itemId}/status'`
  - Xuất ra `src/constants/endpoints/index.ts`.
  - Cập nhật `src/constants/routes/mentor.routes.ts`: Thêm `MISSIONS: '/mentor/missions'`.

### Bước 2: Định Nghĩa Kiểu Dữ Liệu TypeScript (Tầng Types)
- **Tệp tin tạo mới:**
  - `src/types/mission.types.ts`:
    - Enums: `MissionItemStatus` (`TODO`, `IN_PROGRESS`, `COMPLETED`), `MissionPriority` (`LOW`, `MEDIUM`, `HIGH`), `BoardStatus` (`ACTIVE`, `ARCHIVED`).
    - DTO Interfaces: `AssigneeResponse`, `MissionItemResponse`, `MissionBoardResponse`, `MissionBoardDetailResponse`, `MentorProgramResponse`.
    - Request Payload Interfaces: `CreateMissionBoardRequest`, `UpdateMissionBoardRequest`, `CreateMissionItemRequest`, `UpdateMissionItemRequest`, `UpdateItemStatusRequest`.
  - Xuất ra `src/types/index.ts`.

### Bước 3: Xây Dựng Domain Service (Tầng API Service)
- **Tệp tin tạo mới:**
  - `src/services/missionService.ts`:
    - Sử dụng `apiClient` và `AppError` từ `src/services/api.ts`.
    - Hỗ trợ đầy đủ `AbortSignal` cho các request GET.
    - Đóng gói toàn bộ các hàm gọi API cho Board và Item.

### Bước 4: Xây Dựng Custom Hook Quản Lý Trạng Thái (Tầng Business Hook)
- **Tệp tin tạo mới:**
  - `src/hooks/useMentorMissions.ts`:
    - Tải danh sách các Program mà Mentor phụ trách.
    - Quản lý Program đang được chọn (`selectedProgramId`).
    - Tải danh sách TTS thuộc Program đang chọn.
    - Quản lý danh sách Board trong Program và Board đang mở chi tiết (`activeBoardId`).
    - Xử lý các mutation: Tạo board, sửa board, xóa board, thêm item, sửa item, xóa item, chuyển nhanh trạng thái item (`updateItemStatus`).
    - Phản hồi Toast qua `sonner`.

### Bước 5: Xây Dựng Các Sub-Components (Tầng UI Components)
- **Thư mục:** `src/pages/mentor/missions/components/`
- **Các thành phần:**
  1. `AssigneeAvatarStack`: Hiển thị avatar tròn xếp chồng của các TTS được gán kèm Tooltip hiển thị họ tên + mã TTS.
  2. `MissionCard`: Thẻ công việc chi tiết hiển thị priority badge, deadline (đổi màu khi gần hạn/quá hạn), avatar stack, nút chuyển trạng thái 1-click.
  3. `MissionKanbanColumn`: Cột trạng thái (TODO, IN_PROGRESS, COMPLETED) có header đếm số lượng, viền màu nhận diện, và vùng chứa các cards.
  4. `MissionKanbanBoard`: Vùng bảng 3 cột hiển thị toàn bộ nhiệm vụ.
  5. `MissionBoardHeader`: Header điều khiển gồm Selector chọn Program, thanh tiến độ tổng thể (% hoàn thành), nút `+ Tạo Bảng`, và thanh công cụ tìm kiếm / lọc.
  6. `MissionBoardModal`: Modal 3 khối tạo/sửa bảng nhiệm vụ.
  7. `MissionItemModal`: Modal 3 khối giao việc, có checklist đa chọn TTS dạng visual.
  8. `DeleteConfirmModal`: Modal xác nhận xóa an toàn theo Rule 33.

### Bước 6: Lắp Ráp Trang & Tích Hợp Router (Tầng Page & Navigation)
- **Tệp tin tạo/sửa:**
  - Tạo mới `src/pages/mentor/missions/MentorMissionPage.tsx`: Trang trung tâm kết nối hook và các sub-components.
  - Cập nhật `src/routes/AppRoutes.tsx`: Thêm route `ROUTES.MENTOR.MISSIONS` bọc trong `ProtectedRoute allowedRoles={['MENTOR', 'ADMIN']}`.
  - Cập nhật `src/components/layout/Sidebar.tsx`: Bổ sung menu `"Bảng Nhiệm Vụ & Giao Việc"` cho `ROLE_MENTOR`.

### Bước 7: Kiểm Thử, Thẩm Mỹ & Đánh Giá Chất Lượng (Tầng Verification)
- Chạy `npm run lint` hoặc `npx oxlint` để đảm bảo không có cảnh báo/lỗi lint.
- Chạy `npm run build` để kiểm tra toàn bộ kiểu dữ liệu TypeScript và build bundle.
- Kiểm tra tính tương thích 2 chiều Dark Mode / Light Mode.
- Kiểm tra hiển thị responsive trên màn hình Desktop và Tablet/Mobile.
- Báo cáo kết quả chi tiết cho người dùng.
