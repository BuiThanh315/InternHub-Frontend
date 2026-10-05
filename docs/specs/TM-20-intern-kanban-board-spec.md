# Đặc Tả Kỹ Thuật Giao Diện (Frontend Spec): TM-20 Thực Tập Sinh Chuyển Đổi Tiến Độ Nhiệm Vụ Trên Bảng Kanban (Intern Kanban Board & Task Execution)

> **Trạng thái tài liệu:** DRAFT / SẴN SÀNG CHỜ PHÊ DUYỆT (PENDING APPROVAL)  
> **Lưu trữ tại:** `InternHub-Frontend/docs/specs/TM-20-intern-kanban-board-spec.md`  
> **Dự án:** [InternHub-Frontend](file:///d:/codegym_final_project/InternHub-Frontend) (React 19, TypeScript, Vite, CSS Modules)  
> **Tương thích Backend:** [InternHub Backend TM-20](file:///d:/codegym_final_project/InternHub/docs/specs/TM-20-intern-update-task-progress-spec.md) (`intern-and-program-service`, `api-gateway`)  
> **Mã Jira Ticket:** [TM-20](https://robluccibn9935.atlassian.net/browse/TM-20)  
> **Tiêu đề Jira:** *Intern - Chuyển đổi trạng thái nhiệm vụ Kanban (Mission Kanban Transition & Task Execution)*  
> **Nhánh Git dự kiến:** `feature/TM-20/intern-kanban-board-frontend`  
> **Cấp độ thay đổi (Change Level):** **L3** (Xây dựng phân hệ Bảng nhiệm vụ Kanban 3 cột cho Thực tập sinh, modal nộp sản phẩm hoàn thành, modal xem chi tiết yêu cầu của Mentor, tích hợp API Backend TM-20, xử lý bảo mật IDOR & đồng thời nhiều Assignee).  
> **Tuân thủ quy chuẩn:** Tuân thủ 100% [AGENTS.md](file:///d:/codegym_final_project/InternHub-Frontend/AGENTS.md) (34 nguyên tắc bất biến của Frontend), tài liệu [08-ui-ux-guidelines.md](file:///d:/codegym_final_project/InternHub-Frontend/.agents/08-ui-ux-guidelines.md) và kỹ năng thiết kế chuyên sâu [Frontend Design](file:///d:/codegym_final_project/InternHub-Frontend/.agents/skills/frontend-design/SKILL.md).

---

## 0. Nhật Ký Thay Đổi & Giải Trình Kỹ Thuật (Revision History & Change Rationale)

> [!IMPORTANT]
> **BẮT BUỘC ĐIỀN ĐẦY ĐỦ**: Bất kể khi nào Lập trình viên hay AI Agent thay đổi mã nguồn ảnh hưởng đến logic, giao diện, API, routing hay modal (từ cấp độ L2 trở lên), **bắt buộc** phải ghi thêm một dòng vào bảng này để giải trình lý do trước khi coi nhiệm vụ là hoàn tất (Tuân thủ Rule 30).

| Phiên bản | Ngày | Người thực hiện | Task / Jira | Loại thay đổi | Lý do & Giải trình kỹ thuật (Rationale) |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **v1.0.0** | 2026-10-04 | AI Senior Pair-Programmer | `TM-20` | Tạo mới đặc tả Frontend | Khởi tạo tài liệu đặc tả kỹ thuật Frontend cho TM-20 dựa trên Backend TM-20 đã nghiệm thu. Áp dụng chuẩn **Frontend Design** (Linear/Notion-inspired minimalist enterprise UI) và **34 nguyên tắc Frontend**: Xây dựng bảng Kanban 3 cột (`TODO`, `IN_PROGRESS`, `COMPLETED`), **loại bỏ hoàn toàn thanh trượt % (0%-100%)** theo chỉ đạo người dùng, thiết kế Task Card có chỉ báo Deadline & Avatar đồng đội, Modal Nộp bài (`TaskSubmissionModal`) hỗ trợ Link nộp bài & Ghi chú, Modal Chi tiết (`TaskDetailModal`), xử lý đủ 5 trạng thái giao diện (Skeleton, Empty có CTA, Error Retry, Success Toast, Disabled), 100% CSS Variables ngữ nghĩa từ `src/index.css`. |

---

## 1. Feature Overview & Tuyên Ngôn Nghiệp Vụ Cốt Lõi

- **Mã tính năng:** TM-20 (Intern Mission Kanban Board & Task Execution).
- **Phân hệ người dùng:** Dành riêng cho Thực tập sinh (`ROLE_INTERN` / `ROLE_USER`) và Quản trị viên (`ADMIN`).
- **Tuyên ngôn nghiệp vụ cốt lõi (Core Business Statement):**
  > **"THỰC TẬP SINH LÀ NGƯỜI NHẬN VIỆC (ASSIGNEE) TRỰC TIẾP THỰC THI VÀ ĐIỀU PHỐI CÔNG VIỆC TRÊN BẢNG KANBAN 3 NẤC"**
  >
  > - **Mentor ([TM-19](file:///d:/codegym_final_project/InternHub/docs/specs/TM-19-mentor-assign-tasks-spec.md)):** Đóng vai trò là **Người giao việc (Assigner & Delegator)** — thiết lập Bảng nhiệm vụ, tạo đầu việc, đặt hạn chót và giao cho Thực tập sinh trong Chương trình.
  > - **Thực tập sinh ([TM-20](file:///d:/codegym_final_project/InternHub/docs/specs/TM-20-intern-update-task-progress-spec.md)):** Đóng vai trò là **Người thực thi (Executor)**. Thay vì phải ước lượng các con số % phức tạp (10%, 25%, 70%), Thực tập sinh chỉ cần quản lý công việc của mình thông qua việc **chuyển đổi giữa 3 cột trạng thái Kanban rõ ràng**:
  >   1. **Cột 1: "Chưa làm" (`TODO`):** Nhiệm vụ Mentor mới giao, TTS tiếp nhận yêu cầu, tài liệu và phân tích việc cần làm.
  >   2. **Cột 2: "Đang làm" (`IN_PROGRESS`):** TTS bắt đầu bắt tay vào nghiên cứu, thiết kế và viết code (chuyển từ `TODO` sang `IN_PROGRESS` bằng 1 click hoặc kéo thả).
  >   3. **Cột 3: "Hoàn thiện" (`COMPLETED`):** TTS đã hoàn thành sản phẩm/code, bấm nút hoàn thành để mở `TaskSubmissionModal`, đính kèm link nộp bài (GitHub PR, Figma, Google Docs) và ghi chú hoàn thành để gửi cho Mentor nghiệm thu.

- **Mục tiêu kỹ thuật & Trải nghiệm người dùng:**
  1. Xây dựng không gian làm việc nhiệm vụ tập trung (Personal Mission Workspace) giúp Thực tập sinh nắm bắt toàn bộ công việc cá nhân trong một giao diện duy nhất.
  2. Bố cục **Triple-Column Kanban Board** tối giản, trực quan, hỗ trợ chuyển đổi trạng thái tức thời không cần tải lại trang.
  3. Áp dụng chuẩn **Modal-First UX (Quy tắc 29)**: Xem chi tiết yêu cầu của Mentor (`TaskDetailModal`) và nộp kết quả công việc (`TaskSubmissionModal`) ngay trên màn hình hiện tại, không làm mất bối cảnh làm việc hay bộ lọc.
  4. Đảm bảo bảo mật IDOR & làm việc nhóm: Thực tập sinh chỉ có quyền chuyển trạng thái các công việc mà mình được gán (`assignees`). Nếu công việc có nhiều TTS làm chung (Pair/Group task), bất kỳ TTS nào được gán cũng có thể cập nhật trạng thái.
  5. Đạt chuẩn WCAG AA, responsive mượt mà trên cả Desktop, Tablet và Mobile, hỗ trợ hoàn hảo Dark Mode và Light Mode 2 chiều.

---

## 2. Khảo Sát Hiện Trạng Mã Nguồn & Đánh Giá Tái Sử Dụng (Rule 15 - Project Scan & Reuse Analysis)

> [!CAUTION]
> ### CHỈ THỊ TUÂN THỦ NGUYÊN TẮC BẤT BIẾN (RULE 15 & MANDATORY WORKSPACE DIRECTIVE)
> **"ĐẢM BẢO SẼ QUÉT DỰ ÁN, TRÁNH VIỆC TẠO THÊM CODE MỚI KHÔNG CẦN THIẾT, SỬ DỤNG TỐI ĐA NHỮNG GÌ ĐÃ CÓ ĐỂ PHÁT TRIỂN"**

Sau khi quét toàn bộ mã nguồn `InternHub-Frontend`, cấu trúc tái sử dụng và kế thừa được thiết lập như sau:

### 2.1. Đánh Giá Thành Phần Sẵn Có & Tái Sử Dụng 100%

| Danh mục | Thành phần hiện có trong dự án | Tình trạng | Kế hoạch tái sử dụng cho TM-20 |
| :--- | :--- | :---: | :--- |
| **Common Components** | `Modal` (`src/components/common/Modal`) | Đã có | Tái sử dụng 100% cho `TaskDetailModal` và `TaskSubmissionModal` (hỗ trợ 3 khối: Header cố định, Body cuộn, Sticky Footer). |
| **Common Components** | `Button` (`src/components/common/Button`) | Đã có | Tái sử dụng cho toàn bộ nút bấm: primary, secondary, danger, outline, kèm trạng thái loading spinner. |
| **Common Components** | `Input` (`src/components/common/Input`) | Đã có | Tái sử dụng cho ô nhập Link nộp bài (`submissionUrl`) kèm thông báo lỗi `error?: string`. |
| **Common Components** | `Select` (`src/components/common/Select`) | Đã có | Tái sử dụng cho dropdown lọc độ ưu tiên (`priority`). |
| **Common Components** | `SearchBar` (`src/components/common/SearchBar`) | Đã có | Tái sử dụng cho ô tìm kiếm nhanh từ khóa công việc trên thanh công cụ. |
| **Common Components** | `Skeleton` (`src/components/common/Skeleton`) | Đã có | Tái sử dụng cho Skeleton loading dạng thẻ Shimmer khi đang tải dữ liệu Kanban. |
| **Common Components** | `Alert` (`src/components/common/Alert`) | Đã có | Tái sử dụng cho thông báo cảnh báo lỗi và hướng dẫn. |
| **Common Components** | `ErrorBoundary` (`src/components/common/ErrorBoundary`) | Đã có | Tái sử dụng bao bọc toàn bộ trang `InternMissionPage` chống sập trắng trang. |
| **Mentor Sub-Components** | `AssigneeAvatarStack` (`src/pages/mentor/missions/components/AssigneeAvatarStack`) | Đã có | Tái sử dụng để hiển thị avatar của các đồng đội cùng thực hiện công việc. |
| **Design Tokens & Theme** | `src/index.css` (CSS Variables) | Đã có | Tái sử dụng 100% các biến ngữ nghĩa: `--bg-body`, `--bg-card`, `--text-main`, `--text-secondary`, `--text-muted`, `--border-default`, `--primary`, `--info`, `--success`, `--warning`, `--danger`. Cấm hardcode màu hex. |
| **Formatters** | `formatDate`, `formatDateTime` (`src/utils/formatters.ts`) | Đã có | Tái sử dụng để hiển thị ngày hết hạn (`dueDate`) và thời điểm nộp bài (`submittedAt`). |
| **Toast Notifications** | `sonner` (`toast.success`, `toast.error`, `toast.warning`) | Đã có | Tái sử dụng thông báo tức thời khi hoàn thành thao tác hoặc phát hiện lỗi. |
| **API Client** | `apiClient`, `AppError` (`src/services/api.ts`) | Đã có | Tái sử dụng tầng gọi HTTP Axios 4 tầng, tự động đính kèm JWT Token và xử lý lỗi chuẩn hóa. |

### 2.2. Đánh Giá Các Thành Phần Cần Mở Rộng (Extension Without Breaking Changes)

| Thành phần | Đường dẫn | Thay đổi dự kiến | Lý do kỹ thuật |
| :--- | :--- | :--- | :--- |
| **Types** | `src/types/mission.types.ts` | Thêm các trường vào `MissionItemResponse`: `boardTitle?: string; submissionUrl?: string; completionNote?: string; submittedAt?: string;`. Thêm interface `InternKanbanBoardResponse` và `UpdateKanbanStatusRequest`. | Khớp 100% với DTO trả về từ Backend TM-20 đã triển khai và kiểm thử. |
| **Endpoints** | `src/constants/endpoints/mission.endpoints.ts` | Bổ sung `MY_MISSIONS: '/api/mission-items/my-missions'`, `MY_KANBAN: '/api/mission-items/my-missions/kanban'`. | Tập trung URL API, triệt tiêu magic strings theo Rule 19. |
| **Routes** | `src/constants/routes/intern.routes.ts` | Bổ sung `MISSIONS: '/intern/missions'`. | Đăng ký route chuyên biệt cho Bảng nhiệm vụ của Thực tập sinh. |
| **Service** | `src/services/missionService.ts` | Thêm các hàm `getMyMissionItems`, `getMyMissionKanban`, `updateMyMissionStatus`. | Tái sử dụng service hiện có, bổ sung logic kết nối backend có hỗ trợ `AbortSignal`. |
| **Sidebar Navigation** | `src/components/layout/Sidebar.tsx` | Bổ sung menu item `"Nhiệm Vụ Của Tôi"` (Icon: `Kanban`) cho role `INTERN` và `USER`. | Cung cấp lối tắt điều hướng trực tiếp cho TTS. |
| **App Routing** | `src/routes/AppRoutes.tsx` | Khai báo `<Route path={ROUTES.INTERN.MISSIONS} element={<InternMissionPage />} />`. | Kích hoạt màn hình trong vùng phân quyền `ProtectedRoute`. |

### 2.3. Danh Mục Thành Phần Mới Cần Xây Dựng (Specific to Intern Role)

Do vai trò và quyền hạn của Thực tập sinh khác biệt hoàn toàn so với Mentor (TTS **không có quyền** tạo bảng, sửa tiêu đề/mô tả của Mentor, xóa item; TTS chỉ xem và chuyển trạng thái kèm nộp link bài làm), các component giao diện dành riêng cho TTS sẽ được xây dựng mới tại `src/pages/intern/missions/components/`:
1. `InternMissionPage.tsx`: Trang chính quản lý nhiệm vụ của TTS (chuẩn Standard Page Composition 4 lớp).
2. `InternKanbanBoard.tsx`: Container chứa 3 cột Kanban (`TODO`, `IN_PROGRESS`, `COMPLETED`).
3. `InternKanbanColumn.tsx`: Cột Kanban hiển thị danh sách thẻ, icon nhận diện và badge đếm số lượng.
4. `InternTaskCard.tsx`: Thẻ nhiệm vụ của TTS với badge độ ưu tiên, deadline indicator thông minh, avatar đồng đội và thanh chuyển trạng thái tức thì.
5. `TaskDetailModal.tsx`: Modal xem chi tiết toàn bộ yêu cầu của Mentor, hạn chót, danh sách đồng đội và thông tin nộp bài (chế độ chỉ đọc).
6. `TaskSubmissionModal.tsx`: Modal nộp sản phẩm khi chuyển task sang `COMPLETED` (nhập Link nộp bài & Ghi chú hoàn thành).
7. `useInternKanban.ts`: Custom hook quản lý dữ liệu Kanban, bộ lọc và thao tác chuyển trạng thái (tuân thủ giới hạn 3-4 useState).

---

## 3. Triết Lý Thiết Kế Visual & UX (Áp Dụng Skill Frontend Design & 08-ui-ux-guidelines.md)

### 3.1. Bản Sắc Thiết Kế (Subject Matter Identity)
- **Tư duy thiết kế:** Không gian làm việc cá nhân của kỹ sư công nghệ (Personal Engineering Workspace). Giao diện mang hơi thở hiện đại của các công cụ như Linear, GitHub Issue Projects và Notion — tối giản, thanh lịch, tập trung cao độ vào công việc cần làm mà không bị phân tâm bởi các thành phần đồ họa thừa thãi.
- **Tránh xa các tells rập khuôn của AI:**
  - Tuyệt đối không dùng gradient bừa bãi làm mờ nhạt nội dung.
  - Không dùng viền bóng mờ xám cẩu thả (`rgba(0,0,0,0.1)`). Thay vào đó dùng viền mảnh sắc nét `1px solid var(--border-default)`.
  - Không viết ALL-CAPS cho toàn bộ nhãn; sử dụng Sentence case tự nhiên ("Chưa làm", "Đang làm", "Hoàn thiện").
  - Không trang trí bằng các ký tự `→` hay `•` vô nghĩa. Mọi icon và ký hiệu đều phải mang giá trị ngữ nghĩa rõ ràng.

### 3.2. Bảng Màu Ngữ Nghĩa (Semantic Design Tokens từ `src/index.css`)

> [!CAUTION]
> **CẤM HARDCODE MÃ MÀU HEX (RULE 28)**: 100% màu sắc phải dùng biến CSS Variables. Không được xuất hiện bất kỳ mã hex `#...` nào trong các file `.module.css`.

| Thành phần | Token Sử Dụng | Light Mode | Dark Mode (`[data-theme='dark']`) | Ý Nghĩa Ngữ Nghĩa |
| :--- | :--- | :--- | :--- | :--- |
| **Nền ứng dụng** | `var(--bg-body)` | `#f8fafc` | `#090d16` | Nền tổng thể thoáng đãng |
| **Nền Thẻ & Modal** | `var(--bg-card)` / `var(--bg-surface)` | `#ffffff` | `#131d33` | Bề mặt hiển thị thẻ công việc và modal |
| **Đường viền mặc định** | `var(--border-default)` | `#e2e8f0` | `#26354a` | Viền mảnh 1px phân cách các khối |
| **Chữ tiêu đề chính** | `var(--text-main)` | `#0f172a` | `#f8fafc` | Chữ sắc nét, độ tương phản cao đạt WCAG AA |
| **Chữ phụ / nhãn** | `var(--text-secondary)` | `#475569` | `#cbd5e1` | Mô tả công việc, thông tin phụ |
| **Chữ mờ / placeholder**| `var(--text-muted)` | `#94a3b8` | `#64748b` | Timestamp, icon trạng thái chờ |
| **Cột "Chưa làm" (TODO)** | `var(--text-secondary)` / `var(--border-default)` | `#475569` | `#94a3b8` | Trạng thái trung tính, sẵn sàng thực hiện |
| **Cột "Đang làm" (IN_PROGRESS)** | `var(--info)` / `var(--primary)` | `#3b82f6` | `#38bdf8` | Điểm nhấn màu xanh dương, biểu thị dòng chảy công việc đang diễn ra |
| **Cột "Hoàn thiện" (COMPLETED)** | `var(--success)` | `#10b981` | `#34d399` | Xanh ngọc bích, biểu thị hoàn tất, sẵn sàng nghiệm thu |
| **Ưu tiên CAO (HIGH)** | `var(--danger)` & `rgba(239, 68, 68, 0.12)` | `#ef4444` | `#f87171` | Cảnh báo việc gấp, nổi bật tức thì |
| **Ưu tiên TRUNG BÌNH (MEDIUM)** | `var(--warning)` & `rgba(245, 158, 11, 0.12)` | `#f59e0b` | `#fbbf24` | Việc quan trọng cần theo dõi |
| **Ưu tiên THẤP (LOW)** | `var(--text-muted)` & `var(--border-subtle)` | `#64748b` | `#94a3b8` | Việc thông thường |
| **Cảnh báo Quá Hạn** | `var(--danger)` | `#ef4444` | `#f87171` | Nổi bật ngày hết hạn kèm icon `AlertCircle` |
| **Cảnh báo Khẩn Cấp (<= 2 ngày)** | `var(--warning)` | `#f59e0b` | `#fbbf24` | Nhắc nhở hạn chót sắp đến kèm icon `Clock` |

### 3.3. Typography & Hệ Thống Nhịp Điệu Không Gian (8pt Grid)
- **Tiêu đề trang & Tên cột:** Font `Outfit`, `font-weight: 600/700`, `letter-spacing: -0.01em`.
- **Nội dung thẻ & Mô tả:** Font `Inter`, `font-weight: 400` cho mô tả, `font-weight: 500/600` cho tiêu đề công việc, `font-size: 14px`, `line-height: 1.5`. Giới hạn mô tả tối đa 2 dòng (`display: -webkit-box; -webkit-line-clamp: 2`).
- **Hệ thống khoảng cách 8pt:** Toàn bộ `padding`, `margin`, `gap` tuân thủ nghiêm ngặt bội số của 4px/8px:
  - `4px (0.25rem)`: Gap giữa icon và text nhỏ trong badge.
  - `8px (0.5rem)`: Gap giữa các nút bấm hành động trên thẻ.
  - `12px (0.75rem)`: Padding trong ô input modal.
  - `16px (1rem)`: Padding chuẩn bên trong thẻ công việc `InternTaskCard`.
  - `20px - 24px (1.25rem - 1.5rem)`: Khoảng cách giữa các cột Kanban và padding modal body.

---

## 4. Kiến Trúc Trải Nghiệm Người Dùng (UX Wireframes & Standard Page Composition)

Tuân thủ **Standard Page Composition 4 lớp** (Rule 20):
1. **Lớp 1: Page Container & Header Bar:** Tiêu đề trang, phụ đề và nút làm mới (`Refetch`).
2. **Lớp 2: Filter Toolbar & Metrics Strip:** Thống kê nhanh số lượng task theo trạng thái, ô tìm kiếm từ khóa và dropdown lọc theo độ ưu tiên.
3. **Lớp 3: Content Board (Triple-Column Kanban):** 3 cột phân loại trạng thái hiển thị toàn bộ nhiệm vụ của TTS.
4. **Lớp 4: Modals Layer:** `TaskDetailModal` (xem chi tiết) và `TaskSubmissionModal` (nộp link bài làm & ghi chú khi hoàn thành).

### 4.1. Bố Cục Tổng Thể Màn Hình (Master Workspace Layout)

```text
+---------------------------------------------------------------------------------------------------+
| [Header] Nhiệm Vụ Của Tôi (My Missions & Tasks)                                                   |
| Theo dõi tiến độ công việc được giao, điều phối trạng thái thực thi và nộp kết quả hoàn thành    |
+---------------------------------------------------------------------------------------------------+
| [Metrics Bar & Filter Toolbar]                                                                    |
| Tổng số việc: [ 9 ]  |  Chưa làm: [ 3 ]  |  Đang làm: [ 2 ]  |  Hoàn thiện: [ 4 ]                 |
| [ Search công việc hoặc mentor...        ] [ Độ ưu tiên: Tất cả ▼ ] [ Hạn chót: Tất cả ▼ ] [⟳ Làm mới]|
+---------------------------------------------------------------------------------------------------+
| [Triple-Column Kanban Board]                                                                      |
|                                                                                                   |
|  ⚪ CHƯA LÀM (3)                 🔵 ĐANG LÀM (2)                 🟢 HOÀN THIỆN (4)                |
|  +-----------------------------+ +-----------------------------+ +------------------------------+ |
|  | [Card #101]                 | | [Card #102]                 | | [Card #099]                  | |
|  | [ƯU TIÊN CAO] [Hạn: 08/10]  | | [TRUNG BÌNH] [Hạn: 10/10]   | | [ƯU TIÊN CAO] [Xong: 02/10]  | |
|  | Tích hợp Spring Security    | | Viết Unit Test Controller   | | Khởi tạo Microservice Repo   | |
|  | Cấu hình JWT filter & RBAC  | | Viết Mockito cho Service... | | Setup Gradle multi-project.. | |
|  | Bảng: Sprint 1 - Core Auth  | | Bảng: Sprint 1 - Core Auth  | | Bảng: Sprint 1 - Core Auth   | |
|  | Đồng đội: (Avatar A) (B)    | | Đồng đội: (Avatar A)        | | Link nộp: [github.com/pr/42] | |
|  |                             | |                             | | Đồng đội: (Avatar A) (C)     | |
|  | [ Xem chi tiết ]            | | [ Xem chi tiết ]            | | [ Xem chi tiết ]             | |
|  | [ Bắt đầu làm  ➔ ]          | | [ ⮌ Chưa làm ] [ Hoàn thành➔] | | [ ⟲ Mở lại làm tiếp ]       | |
|  +-----------------------------+ +-----------------------------+ +------------------------------+ |
|  | [Card #105]                 | |                             | |                              | |
|  | [THẤP] [Hạn: 15/10]         | |                             | |                              | |
|  | Viết tài liệu Swagger API   | |                             | |                              | |
|  +-----------------------------+ +-----------------------------+ +------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

### 4.2. Giải Phẫu Thẻ Nhiệm Vụ (Intern Task Card Anatomy)

Mỗi thẻ `InternTaskCard` được phân cấp rõ ràng theo chiều dọc:

```text
+-------------------------------------------------------------+
| [Ưu tiên: Cao]                             [Hạn: 08/10/2026]| -> Header: Priority Badge & Deadline
+-------------------------------------------------------------+
| Tích hợp Spring Security & JWT Filter                       | -> Title: 14px semi-bold, đen đậm
| Cấu hình bộ lọc kiểm tra token Bearer và phân quyền theo... | -> Description: line-clamp-2
| 📁 Bảng: Sprint 1 - Nền tảng Backend                        | -> Board Title: Nhận diện nguồn gốc
+-------------------------------------------------------------+
| 👥 Đồng đội: [Avatar 1] [Avatar 2]                          | -> Footer: Assignee Stack (nếu pair)
| 🔗 Link: github.com/codegym/pr/12 (chỉ hiện ở COMPLETED)   | -> Submission Indicator
+-------------------------------------------------------------+
| [ Xem chi tiết ]                       [ Bắt đầu làm  ➔ ]  | -> Interactive Action Bar
+-------------------------------------------------------------+
```

### 4.3. Logic Chuyển Đổi Trạng Thái 3 Cột (Quick Transition Actions)

Thực tập sinh có thể chuyển trạng thái nhanh chóng qua các nút bấm ngữ nghĩa trên thẻ:

1. **Tại cột "Chưa làm" (`TODO`):**
   - Nút hành động chính: **`"Bắt đầu làm ➔"`** (Variant: `primary` hoặc `outline-primary`).
   - Hành vi: Gửi ngay `PATCH /api/mission-items/{id}/status` với `{ status: 'IN_PROGRESS' }`.
   - Kết quả: Thẻ lập tức chuyển sang cột `"Đang làm"`, hiện thông báo Toast *"Đã bắt đầu thực hiện nhiệm vụ"*, đồng thời kích hoạt thông báo cho Mentor.

2. **Tại cột "Đang làm" (`IN_PROGRESS`):**
   - Nút hành động lùi: **`"⮌ Chưa làm"`** (Variant: `ghost`). Chuyển ngược về `TODO` nếu TTS chưa kịp làm hoặc muốn tạm hoãn.
   - Nút hành động tiến: **`"Hoàn thành ➔"`** (Variant: `success`).
   - Hành vi: **Mở `TaskSubmissionModal`** để TTS xác nhận hoàn thành, cho phép dán link nộp sản phẩm (GitHub PR, link drive tài liệu) và ghi chú hoàn thành (tùy chọn). Sau khi bấm *"Nộp & Hoàn thành"*, thẻ chuyển sang cột `"Hoàn thiện"`.

3. **Tại cột "Hoàn thiện" (`COMPLETED`):**
   - Nút hành động: **`"⟲ Mở lại làm tiếp"`** (Variant: `ghost`).
   - Hành vi: Nếu cần sửa đổi code hoặc làm lại theo yêu cầu góp ý của Mentor, TTS có thể bấm mở lại để chuyển về `IN_PROGRESS`.

---

## 5. Quy Chuẩn Modal-First UX (Quy Tắc 29, 30 & 33)

Toàn bộ thao tác xem chi tiết và nộp bài được thực hiện thông qua Modal ngay trên trang hiện tại. Không chuyển trang, bảo toàn 100% bối cảnh tìm kiếm và bộ lọc của người dùng.

### 5.1. Modal Nộp Bài & Hoàn Thành Nhiệm Vụ (`TaskSubmissionModal`)

- **Kích thước modal:** `size="md"` (560px - 600px).
- **Cấu trúc 3 khối bắt buộc (Rule 29):**
  - **Khối 1: Header cố định:**
    - Icon `CheckCircle2` màu `var(--success)`.
    - Tiêu đề: `"Nộp Sản Phẩm & Hoàn Thành Nhiệm Vụ"`.
    - Phụ đề: Tên nhiệm vụ đang hoàn thành.
    - Nút đóng `X` có `aria-label="Đóng modal"`.
  - **Khối 2: Body cuộn độc lập (`overflow-y: auto`):**
    - Hộp thông báo hướng dẫn: *"Chúc mừng bạn đã hoàn thành nhiệm vụ! Vui lòng cung cấp link sản phẩm hoặc ghi chú để Mentor dễ dàng kiểm tra và nghiệm thu."*
    - **Trường Link nộp bài (`submissionUrl`):**
      - Ô input hỗ trợ placeholder: `https://github.com/.../pull/12 hoặc https://docs.google.com/...`
      - Validation: Tùy chọn (optional), nhưng nếu nhập thì phải đúng định dạng URL hợp lệ (bắt đầu bằng `http://` hoặc `https://`). Nếu sai định dạng, hiển thị lỗi đỏ `error="Đường dẫn không hợp lệ. Vui lòng nhập link URL đầy đủ (ví dụ: https://...)"`.
    - **Trường Ghi chú hoàn thành (`completionNote`):**
      - Textarea tối đa 500 ký tự.
      - Placeholder: *"Tóm tắt ngắn gọn các việc đã hoàn thành hoặc lưu ý cho Mentor khi review..."*
  - **Khối 3: Sticky Footer cố định ở đáy:**
    - Nút **`"Hủy bỏ"`** (`variant="outline"`, đóng modal).
    - Nút **`"Nộp & Hoàn Thành"`** (`variant="success"`, có spinner loading khi đang submit).
- **Cơ chế chống mất dữ liệu (Safe Dismissal Guard):** Khi người dùng đã gõ link hoặc ghi chú (`isDirty`), click vào lớp phủ nền (backdrop) sẽ không làm đóng modal để tránh mất thông tin vô ý.

```text
+---------------------------------------------------------------+
| [Header] ✓ Nộp Sản Phẩm & Hoàn Thành Nhiệm Vụ             [X] |
| Nhiệm vụ: Tích hợp Spring Security & JWT Filter               |
+---------------------------------------------------------------+
| [Body - Scrollable]                                           |
| ℹ Bạn sắp chuyển nhiệm vụ sang trạng thái "Hoàn thiện".       |
|                                                               |
| Link nộp bài (GitHub PR, Figma, Drive...) [Tùy chọn]:         |
| [ https://github.com/company/repo/pull/42                   ] |
|                                                               |
| Ghi chú gửi Mentor [Tùy chọn]:                                |
| +-----------------------------------------------------------+ |
| | Em đã viết xong JWT Filter và cấu hình phân quyền RBAC.   | |
| | Đã pass 8/8 unit tests trong class InternMissionTest.     | |
| +-----------------------------------------------------------+ |
+---------------------------------------------------------------+
| [Sticky Footer]                                               |
|                             [ Hủy bỏ ]   [ Nộp & Hoàn Thành ] |
+---------------------------------------------------------------+
```

### 5.2. Modal Xem Chi Tiết Nhiệm Vụ (`TaskDetailModal`)

- **Kích thước modal:** `size="lg"` (720px - 768px).
- **Mục đích:** Cung cấp cho TTS góc nhìn toàn diện về yêu cầu công việc do Mentor giao phó.
- **Cấu trúc 3 khối:**
  - **Khối 1: Header cố định:**
    - Badge trạng thái hiện tại (`Chưa làm` / `Đang làm` / `Hoàn thiện`).
    - Tiêu đề nhiệm vụ (`title`) cỡ chữ lớn 18px đậm.
    - Nút đóng `X`.
  - **Khối 2: Body cuộn độc lập:**
    - **Thông tin tổng quan (Grid 2 cột):**
      - Bảng nhiệm vụ: Tên bảng nhiệm vụ (`boardTitle`).
      - Mức độ ưu tiên: Badge `HIGH` / `MEDIUM` / `LOW`.
      - Hạn chót hoàn thành: Ngày hết hạn kèm tính toán thời gian còn lại (hoặc cảnh báo quá hạn).
      - Ngày giao việc: Ngày tạo item.
    - **Yêu cầu chi tiết từ Mentor:**
      - Khối mô tả (`description`) với định dạng văn bản rõ ràng.
    - **Danh sách người cùng thực hiện (Assignees):**
      - Hiển thị danh sách TTS được gán: Avatar, Tên đầy đủ, Mã TTS, Email.
    - **Kết quả nộp bài (nếu có):**
      - Link nộp bài (`submissionUrl`) hiển thị dạng liên kết bấm mở tab mới (`target="_blank"`, `rel="noopener noreferrer"`).
      - Ghi chú hoàn thành (`completionNote`).
      - Thời điểm nộp bài (`submittedAt`).
  - **Khối 3: Sticky Footer:**
    - Nút `"Đóng"` (`variant="outline"`).
    - Nút hành động nhanh tương ứng với trạng thái hiện tại (ví dụ: nếu đang là `TODO`, footer có thêm nút `"Bắt đầu làm việc"`).

---

## 6. Xử Lý 5 Trạng Thái Giao Diện Bắt Buộc (Rule 32)

Mọi danh sách và cột dữ liệu Kanban bắt buộc phải xử lý trọn vẹn 5 trạng thái giao diện:

| STT | Trạng thái giao diện | Quy chuẩn thực thi trực quan (Visual Specification) |
| :---: | :--- | :--- |
| **1** | **Loading State (Đang tải)** | Cấm tuyệt đối chữ `"Loading..."` thô sơ. Bắt buộc hiển thị **Skeleton Shimmer** mô phỏng 3 cột Kanban với các khối thẻ xám phát xung nhịp nhàng (pulsing/shimmering), giữ nguyên kích thước chuẩn để triệt tiêu hiện tượng giật giật layout (CLS = 0). |
| **2** | **Empty State (Chưa có dữ liệu)** | - **Khi TTS chưa được giao bất kỳ công việc nào:** Hiển thị illustration minh họa hiện đại + Tiêu đề `"Bạn chưa có nhiệm vụ nào"` + Phụ đề `"Mentor sẽ phân công nhiệm vụ cho bạn trong suốt quá trình thực tập. Hãy kiểm tra lại sau hoặc liên hệ Mentor của bạn."`<br>- **Khi tìm kiếm không ra kết quả:** Tiêu đề `"Không tìm thấy nhiệm vụ phù hợp"` + Phụ đề `"Không có công việc nào khớp với từ khóa tìm kiếm của bạn"` + Nút CTA `variant="outline"` mang nhãn `"Xóa bộ lọc"`.<br>- **Khi một cột Kanban trống:** Khối viền nét đứt mảnh `1px dashed var(--border-default)`, icon nhỏ và chữ dịu `"Không có công việc nào trong cột này"`. |
| **3** | **Error State (Lỗi mạng / Máy chủ)** | Hiển thị thông báo lỗi `Alert` biến thể `error` (`var(--danger)` nhạt) nêu rõ nguyên nhân và nút **`"Thử lại"`** (`variant="outline"`) để gọi lại `refetch()`. |
| **4** | **Success State (Thành công)** | Hiển thị Toast thông báo qua thư viện `sonner` góc trên bên phải: *"Đã chuyển trạng thái sang Đang làm"* hoặc *"Nộp bài và hoàn thành công việc thành công"*. |
| **5** | **Disabled State (Vô hiệu hóa)** | Trong quá trình gửi request API cập nhật trạng thái (`isMutating = true`), toàn bộ nút chuyển trạng thái trên thẻ công việc hoặc trong modal sẽ bị vô hiệu hóa (`disabled`, `pointer-events: none`), đổi cursor thành `not-allowed`, hiển thị spinner con để ngăn chặn hoàn toàn lỗi **Double-Click**. |

---

## 7. Cơ Chế Bảo Mật & Ràng Buộc Nghiệp Vụ (RBAC & IDOR Mitigations)

1. **Bảo vệ IDOR tại tầng Frontend (Client-side Guard):**
   - Frontend lấy thông tin `user` và `profile` từ `useAuth()` và `internService.getMyProfile()`.
   - Các nút chuyển trạng thái trên thẻ chỉ khả dụng đối với những task mà ID thực tập sinh của người đăng nhập nằm trong danh sách `assignees`.
   - Nếu phát sinh tình huống bất thường (Backend trả về `403 Forbidden` do IDOR): Frontend bắt lỗi, giữ nguyên modal (nếu đang mở), không đóng modal và hiển thị Toast lỗi: *"Bạn không được phân công thực hiện nhiệm vụ này, không có quyền chuyển trạng thái."*
2. **Cơ chế cộng tác nhóm (Pair / Group Concurrency):**
   - Khi một công việc có 2 hoặc nhiều TTS cùng làm (Pair Programming / Group Project), bất kỳ thành viên nào được gán cũng có quyền chuyển trạng thái task và nộp bài.
   - Khi một thành viên cập nhật thành công, hệ thống hỗ trợ nút **`"Làm mới"`** (`Refetch`) trên thanh công cụ để đồng đội cập nhật trạng thái tức thời theo dữ liệu mới nhất từ server.
3. **Kiểm soát trạng thái hồ sơ TTS (Intern Status Guard):**
   - Nếu hồ sơ TTS đang ở trạng thái không hoạt động (`TERMINATED`, `REJECTED`, `PENDING`), toàn bộ thao tác chuyển trạng thái trên Kanban sẽ bị khóa kèm banner thông báo: *"Hồ sơ thực tập sinh của bạn hiện không ở trạng thái hoạt động để thực hiện nhiệm vụ."*

---

## 8. Kiến Trúc Kỹ Thuật & Cấu Trúc Tệp Tin (Domain-Driven Architecture)

Tuân thủ kiến trúc phân tầng chuẩn Domain-Driven Modular (Rule 18, 19, 20):

```text
src/
├── constants/
│   ├── endpoints/
│   │   ├── mission.endpoints.ts       # Thêm MY_MISSIONS & MY_KANBAN
│   │   └── index.ts
│   └── routes/
│       ├── intern.routes.ts          # Thêm MISSIONS: '/intern/missions'
│       └── index.ts
├── types/
│   ├── mission.types.ts              # Mở rộng MissionItemResponse, InternKanbanBoardResponse, UpdateKanbanStatusRequest
│   └── index.ts
├── services/
│   ├── missionService.ts             # Thêm getMyMissionItems, getMyMissionKanban, updateMyMissionStatus
│   └── index.ts
├── hooks/
│   ├── useInternKanban.ts            # Custom hook quản lý state Kanban của TTS (tối đa 3-4 useState)
│   └── index.ts
├── pages/
│   └── intern/
│       └── missions/
│           ├── InternMissionPage.tsx                 # Standard Page Composition 4 lớp
│           ├── InternMissionPage.module.css
│           ├── components/
│           │   ├── InternKanbanBoard/
│           │   │   ├── InternKanbanBoard.tsx
│           │   │   ├── InternKanbanBoard.types.ts
│           │   │   ├── InternKanbanBoard.module.css
│           │   │   └── index.ts
│           │   ├── InternKanbanColumn/
│           │   │   ├── InternKanbanColumn.tsx
│           │   │   ├── InternKanbanColumn.types.ts
│           │   │   ├── InternKanbanColumn.module.css
│           │   │   └── index.ts
│           │   ├── InternTaskCard/
│           │   │   ├── InternTaskCard.tsx
│           │   │   ├── InternTaskCard.types.ts
│           │   │   ├── InternTaskCard.module.css
│           │   │   └── index.ts
│           │   ├── TaskDetailModal/
│           │   │   ├── TaskDetailModal.tsx
│           │   │   ├── TaskDetailModal.types.ts
│           │   │   ├── TaskDetailModal.module.css
│           │   │   └── index.ts
│           │   ├── TaskSubmissionModal/
│           │   │   ├── TaskSubmissionModal.tsx
│           │   │   ├── TaskSubmissionModal.types.ts
│           │   │   ├── TaskSubmissionModal.module.css
│           │   │   └── index.ts
│           │   └── index.ts
│           └── index.ts
└── routes/
    └── AppRoutes.tsx                 # Đăng ký route /intern/missions
```

---

## 9. Định Nghĩa Kiểu Dữ Liệu TypeScript (TypeScript DTOs Contract)

Khớp 100% với DTOs của Backend TM-20:

```typescript
// src/types/mission.types.ts

export type MissionItemStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
export type MissionPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AssigneeResponse {
  id: number;
  userId?: number;
  internCode: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

export interface MissionItemResponse {
  id: number;
  boardId: number;
  boardTitle?: string;
  title: string;
  description?: string | null;
  status: MissionItemStatus;
  priority: MissionPriority;
  dueDate?: string | null;
  assignees: AssigneeResponse[];
  submissionUrl?: string | null;
  completionNote?: string | null;
  submittedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InternKanbanBoardResponse {
  todoItems: MissionItemResponse[];
  inProgressItems: MissionItemResponse[];
  completedItems: MissionItemResponse[];
  totalCount: number;
  todoCount: number;
  inProgressCount: number;
  completedCount: number;
}

export interface UpdateKanbanStatusRequest {
  status: MissionItemStatus;
  submissionUrl?: string | null;
  completionNote?: string | null;
}
```

---

## 10. Tiêu Chuẩn Đa Thiết Bị & Khả Năng Tiếp Cận (Responsive & Accessibility WCAG AA)

- **Desktop (>= 1024px):** Bố cục 3 cột Kanban dàn đều ngang, tỷ lệ tương quan hoàn hảo. Thanh cuộn dọc trong các cột sử dụng **Custom Sleek Scrollbar** siêu mảnh (6px), bo tròn 9999px, tự làm đậm khi hover theo đúng Quy chuẩn 34.
- **Tablet & Laptop nhỏ (768px - 1023px):** 3 cột co giãn linh hoạt, thanh cuộn ngang cục bộ (`overflow-x: auto`) không làm tràn trang tổng thể.
- **Mobile (< 768px):** Tự động chuyển đổi thành dạng danh sách cột dọc hoặc tab chuyển đổi giữa 3 cột (`Chưa làm` | `Đang làm` | `Hoàn thiện`). Các nút bấm có kích thước vùng chạm tối thiểu **44px x 44px** (Touch target >= 44px) hỗ trợ thao tác bằng ngón tay tiện lợi.
- **Khả năng tiếp cận (Accessibility):**
  - Mọi nút bấm icon-only bắt buộc có thuộc tính `aria-label` và `title`.
  - Hỗ trợ đóng Modal bằng phím `Escape`.
  - Tỷ lệ tương phản chữ đạt tối thiểu 4.5:1 (WCAG AA).
  - Viền phát sáng (`box-shadow: 0 0 0 3px var(--primary-glow)`) khi `focus-visible` vào các nút bấm và ô nhập liệu.

---

## 11. Kế Hoạch Kiểm Thử Nghiệm Thu (Acceptance Criteria & Test Matrix)

| Mã test | Kịch bản kiểm thử | Hành vi kỳ vọng (Expected Behavior) | Kết quả |
| :---: | :--- | :--- | :---: |
| **TC-01** | Truy cập trang Nhiệm vụ từ Sidebar | Đăng nhập tài khoản TTS (`ROLE_INTERN`), click menu `"Nhiệm Vụ Của Tôi"`. Chuyển hướng đến `/intern/missions`. Hiển thị Skeleton shimmer rồi tải dữ liệu 3 cột Kanban. | Chờ duyệt |
| **TC-02** | Xem danh sách công việc cá nhân | Chỉ hiển thị các công việc mà tài khoản TTS đang đăng nhập có tên trong danh sách `assignees`. Không hiển thị công việc của TTS khác. | Chờ duyệt |
| **TC-03** | Chuyển task từ `TODO` sang `IN_PROGRESS` | Tại thẻ cột `TODO`, click `"Bắt đầu làm ➔"`. Nút chuyển sang trạng thái loading, gọi API `PATCH /api/mission-items/{id}/status` với `{ status: 'IN_PROGRESS' }`. Toast thông báo thành công, thẻ tự chuyển sang cột `IN_PROGRESS`. | Chờ duyệt |
| **TC-04** | Chuyển task từ `IN_PROGRESS` sang `COMPLETED` | Tại thẻ cột `IN_PROGRESS`, click `"Hoàn thành ➔"`. Mở `TaskSubmissionModal`. Nhập link GitHub PR và ghi chú. Bấm `"Nộp & Hoàn Thành"`. Thẻ chuyển sang cột `COMPLETED`, hiển thị link nộp bài. | Chờ duyệt |
| **TC-05** | Chuyển ngược task về `TODO` | Tại thẻ cột `IN_PROGRESS`, click `"⮌ Chưa làm"`. Thẻ lập tức quay về cột `TODO`. | Chờ duyệt |
| **TC-06** | Mở lại task đã hoàn thiện | Tại thẻ cột `COMPLETED`, click `"⟲ Mở lại làm tiếp"`. Thẻ chuyển về cột `IN_PROGRESS`. | Chờ duyệt |
| **TC-07** | Xem chi tiết nhiệm vụ | Click `"Xem chi tiết"` trên thẻ bất kỳ. Mở `TaskDetailModal` hiển thị đầy đủ thông tin: Tiêu đề, Mô tả của Mentor, Hạn chót, Độ ưu tiên, Đồng đội, Link nộp bài. | Chờ duyệt |
| **TC-08** | Tìm kiếm và lọc theo độ ưu tiên | Gõ từ khóa vào ô search hoặc chọn lọc `Ưu tiên cao`. Bảng Kanban lọc theo thời gian thực các thẻ khớp điều kiện. Khi không có kết quả, hiển thị Empty state kèm nút `"Xóa bộ lọc"`. | Chờ duyệt |
| **TC-09** | Xử lý lỗi bảo mật IDOR | Giả lập request chuyển trạng thái cho item mà TTS không được gán. Hệ thống bắt lỗi 403, hiển thị thông báo lỗi rõ ràng, không làm gián đoạn ứng dụng. | Chờ duyệt |
| **TC-10** | Tương thích Dark/Light Mode 2 chiều | Chuyển đổi giữa chế độ Sáng và Tối. Toàn bộ nền thẻ, màu chữ, viền và badge tự động thích ứng hoàn hảo, không có hiện tượng mất chữ hoặc chữ tối trên nền tối. | Chờ duyệt |

---

## 12. Xác Nhận Tuân Thủ Ranh Giới (Boundary Isolation Guarantee)

- [x] **100% Frontend Only:** Toàn bộ công việc chỉ diễn ra trong thư mục `InternHub-Frontend/`. Tuyệt đối không can thiệp, chỉnh sửa bất kỳ tệp tin nào thuộc `InternHub/` (Backend Java).
- [x] **Zero Mock Bypass:** Kiểm thử tích hợp trực tiếp với API Microservice thực tế qua Spring Boot Backend TM-20 và tài khoản thật.
- [x] **No Git Commit/Push:** Không tự tiện commit hay push mã nguồn.
- [x] **Sẵn sàng chờ phê duyệt:** Sau khi người dùng phê duyệt tài liệu Đặc tả này, Agent sẽ lập Kế hoạch Triển khai (`Plan`) trước khi viết bất kỳ dòng mã nguồn nào.
