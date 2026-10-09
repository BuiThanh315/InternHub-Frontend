# Implementation Plan: TM-102 Nâng Cấp Không Gian Làm Việc & Giao Việc Cho Mentor (Frontend Implementation)

> **Mã công việc:** TM-102  
> **Nhánh Git dự kiến:** `feature/TM-102/mentor-task-delegation-and-workspace`  
> **Tài liệu đặc tả:** [TM-102 Frontend Spec v1.0](file:///d:/codegym_final_project/InternHub-Frontend/docs/specs/TM-102-mentor-task-delegation-and-workspace-spec.md)  
> **Phạm vi tác động:** `InternHub-Frontend` (React 19 + TypeScript + Vite + CSS Modules)  
> **Tuân thủ quy chuẩn:** Tuân thủ 100% [AGENTS.md](file:///d:/codegym_final_project/InternHub-Frontend/AGENTS.md), thư mục [`.agents/`](file:///d:/codegym_final_project/InternHub-Frontend/.agents/) và kỹ năng Thiết kế Giao diện Độc bản ([`frontend-design`](file:///d:/codegym_final_project/InternHub-Frontend/.agents/skills/frontend-design/SKILL.md)).

---

## 1. Khảo Sát Hiện Trạng & Đánh Giá Tái Sử Dụng Mã Nguồn (Mandatory Reuse Audit)

> [!IMPORTANT]
> **Tuân thủ triệt để Quy tắc 15 & Chỉ thị cốt lõi:** *"ĐẢM BẢO SẼ QUÉT DỰ ÁN, TRÁNH VIỆC TẠO THÊM CODE MỚI KHÔNG CẦN THIẾT, SỬ DỤNG TỐI ĐA NHỮNG GÌ ĐÃ CÓ ĐỂ PHÁT TRIỂN"*.

| Thành phần giao diện / mã nguồn | Hiện trạng quét được trong dự án Frontend | Đánh giá & Quyết định tái sử dụng | Lý do kỹ thuật & Giải trình |
| :--- | :--- | :--- | :--- |
| **Quản lý Nhóm (`ProgramGroupModal`)** | Đã có sẵn tại [`ProgramGroupModal.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/components/ProgramGroupModal/ProgramGroupModal.tsx) với đầy đủ logic tạo nhóm, kéo thả thành viên, Round-Robin chia tự động, disband nhóm. | **TÁI SỬ DỤNG 100%** (Tuyệt đối không viết Modal nhóm mới) | Tái sử dụng trọn vẹn modal đã hoàn thiện của HR, nhúng thẳng vào Workspace của Mentor qua adapter mapper `AssigneeResponse` ➔ `InternProfile`. |
| **API Quản lý Nhóm (`groupService`)** | Đã có `getGroups`, `createGroup`, `updateGroup`, `disbandGroup`, `batchApplyGroups` trong [`groupService.ts`](file:///d:/codegym_final_project/InternHub-Frontend/src/services/groupService.ts). | **TÁI SỬ DỤNG 100%** | Gọi trực tiếp API microservice `intern-and-program-service` đã chuẩn hóa, không tạo service trùng lặp. |
| **API Nhiệm Vụ (`missionService`)** | Đầy đủ các hàm tương tác `getMyMentoredPrograms`, `getProgramInterns`, `getBoardsByProgram`, `getBoardDetail`, `createItem`, `updateItemStatus`... trong [`missionService.ts`](file:///d:/codegym_final_project/InternHub-Frontend/src/services/missionService.ts). | **TÁI SỬ DỤNG 100%** | Giữ nguyên contract API Axios 4 tầng đã ổn định, tận dụng triệt để AbortSignal. |
| **Hook Điều Phối (`useMentorMissions`)** | Quản lý state boards, items, filter trong [`useMentorMissions.ts`](file:///d:/codegym_final_project/InternHub-Frontend/src/hooks/useMentorMissions.ts). | **KẾ THỪA & MỞ RỘNG** | Mở rộng bổ sung tích hợp nhóm qua `groupService`, tính toán ma trận tải trọng (Workload Map), hỗ trợ Quick Add task inline. |
| **Common UI Controls** | `Modal`, `Button`, `Input`, `Select`, `SearchBar`, `Skeleton`, `Alert` trong [`src/components/common/`](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/). | **TÁI SỬ DỤNG 100%** | Toàn bộ nút bấm, form controls dùng chung, tuân thủ WCAG AA, viền glow `var(--primary)` khi focus. |
| **Avatar & Icons** | Hàm tiện ích `getAvatarUrl` ([`avatar.ts`](file:///d:/codegym_final_project/InternHub-Frontend/src/utils/avatar.ts)) và thư viện `lucide-react` đã tích hợp. | **TÁI SỬ DỤNG 100%** | Đồng bộ avatar fallback chữ cái và bộ icon chuẩn của hệ thống. |
| **Design Tokens & Theme** | Hệ thống CSS Variables ngữ nghĩa trong [`src/index.css`](file:///d:/codegym_final_project/InternHub-Frontend/src/index.css). | **TUÂN THỦ 100%** | Cấm hardcode mã Hex `#...` trong file `.module.css`. Tương thích 100% Light/Dark Mode. |

---

## 2. Mục Tiêu & Định Hướng Thiết Kế Giao Diện Độc Bản (Frontend Design Direction)

Áp dụng chuyên sâu kỹ năng **[frontend-design](file:///d:/codegym_final_project/InternHub-Frontend/.agents/skills/frontend-design/SKILL.md)**:

### 2.1. Bản Sắc & Đối Tượng Sử Dụng (Subject Matter & Persona)
- **Đối tượng:** Các Mentor kỹ thuật (Tech Lead, Senior Engineers, Team Leads) đang trực tiếp hướng dẫn và phân công công việc cho các thực tập sinh.
- **Tính cách thiết kế:** Tinh gọn, quyết đoán, trật tự, năng suất cao (Productivity-focused), lấy cảm hứng từ các công cụ quản lý dự án kỹ thuật đẳng cấp như Linear và GitHub Projects nhưng vẫn hòa hợp với bộ nhận diện InternHub.
- **Tránh xa các lỗi thiết kế AI rập khuôn (Anti-clichés):**
  - Tuyệt đối không dùng phong cách nền kem ấm (#F4F1EA) + cam đất terracotta (#D97757).
  - Không băm nhỏ màn hình thành các ô card tròn nhạt nhẽo giống hệt nhau (SaaS-card kit cliché).
  - Không lạm dụng nhãn ALL-CAPS tracking rộng vô tội vạ.
  - Không chèn biểu tượng mũi tên `→` máy móc ở mọi nút bấm.

### 2.2. Hệ Thống Token Màu Sắc & Ngữ Nghĩa (Base Token Palette)
Tận dụng triệt để hệ thống CSS Variables ngữ nghĩa của InternHub:
- **Tone màu chủ đạo (Primary & Brand):** `var(--primary)` (#4338ca / #6366f1) mang lại cảm giác kỹ thuật vững chãi, tin cậy.
- **Bề mặt & Chiều sâu (Surfaces & Elevation):** `var(--bg-main)`, `var(--bg-card)`, viền siêu mảnh `var(--border-default)`.
- **Thước đo tải trọng học viên (Workload Density Spectrum):**
  - 🟢 **Bình thường (0 - 2 tasks):** `var(--success-bg)` / `var(--success)` - Học viên đang có nhịp độ làm việc lý tưởng.
  - 🟡 **Đầy tải (3 - 4 tasks):** `var(--warning-bg)` / `var(--warning)` - Học viên đang có khối lượng công việc đáng kể.
  - 🔴 **Quá tải (≥ 5 tasks):** `var(--danger-bg)` / `var(--danger)` - Cảnh báo Mentor cân nhắc san sẻ bớt task.
- **Trạng thái kỳ thực tập (Program Status Indicators):**
  - `ONGOING`: Xanh dương trầm tĩnh (`var(--primary-light)` + `var(--primary)`).
  - `UPCOMING`: Tím nhạt đón đầu (`rgba(168, 85, 247, 0.12)` + `#9333ea`).
  - `COMPLETED`: Xanh lá hoàn tất (`var(--success-bg)` + `var(--success)`).

### 2.3. Hệ Thống Phân Cấp Typography (Typographic Hierarchy)
- **Tên chương trình & Tiêu đề màn hình:** `font-weight: 700`, `letter-spacing: -0.02em`, size 20-24px nổi bật uy quyền quản lý.
- **Hero Metrics (Số liệu thống kê cốt lõi):** Số đếm hiển thị lớn `font-weight: 700`, size 24-28px, đặt nhãn phụ đề tiếng Việt ngay bên dưới bằng chữ thường trang nhã (`font-size: 13px`, `var(--text-muted)`).
- **Thẻ Kanban & Form Controls:** `font-weight: 500/600`, size 14-15px, viền glow mượt mà khi focus theo Rule 30.

### 2.4. Khái Niệm Bố Cục (Layout Concepts & Wireframes)

#### Màn hình 1: Trung Tâm Điều Phối Kỳ Thực Tập (`MentorProgramHub`)
> **Khái niệm:** *Một bảng tổng hành dinh dạng Bento Grid bất đối xứng, nơi Mentor bao quát tức thì toàn bộ các kỳ thực tập mình nắm quyền, thấy rõ quy mô nhân sự, tiến độ công việc và 1 click bước ngay vào không gian làm việc chuyên sâu.*

```text
+----------------------------------------------------------------------------------------------------+
| [Icon Compass] TRUNG TÂM ĐIỀU PHỐI NHIỆM VỤ ĐÀO TẠO (MENTOR PROGRAM HUB)                           |
| Quản lý các chương trình thực tập bạn đang phụ trách và phân công công việc cho học viên           |
+----------------------------------------------------------------------------------------------------+
| [ 3 Kỳ thực tập phụ trách ]   [ 28 Thực tập sinh ]   [ 42 Nhiệm vụ đào tạo ]   [ 85% Tiến độ chung]|
+----------------------------------------------------------------------------------------------------+
| [🔍 Tìm kiếm theo tên hoặc mã kỳ thực tập...]                   [ Bộ lọc: Tất cả trạng thái ▼ ]    |
+----------------------------------------------------------------------------------------------------+
| LƯỚI THẺ CHƯƠNG TRÌNH (BENTO GRID):                                                                |
| +-----------------------------------+ +-----------------------------------+ +---------------------+ |
| | [Ban Công Nghệ IT]      [ONGOING] | | [Phòng R&D AI]          [ONGOING] | | [Trung Tâm Cloud]   | |
| | Kỳ Thực Tập Backend Java K12      | | Kỹ Sư Trí Tuệ Nhân Tạo K05        | | DevOps & SRE K04    | |
| | PRG-2026-F12                      | | PRG-2026-AI05                     | | PRG-2026-CL04       | |
| | 📅 01/10/2026 - 31/12/2026        | | 📅 15/09/2026 - 15/12/2026        | | 📅 01/11/2026 - ... | |
| | 👥 12 TTS  •  📂 3 Nhóm dự án     | | 👥 8 TTS   •  📂 2 Nhóm dự án     | | 👥 8 TTS  • 📂 2 N  | |
| | Tiến độ hoàn thành: 65%           | | Tiến độ hoàn thành: 80%           | | Tiến độ: 30%        | |
| | [==========----------] 8/12 task  | | [================----] 16/20 task | | [=====------]       | |
| |                                   | |                                   | |                     | |
| | [ Nút: Vào không gian làm việc ]  | | [ Nút: Vào không gian làm việc ]  | | [ Nút: Vào không g..| |
| +-----------------------------------+ +-----------------------------------+ +---------------------+ |
+----------------------------------------------------------------------------------------------------+
```

#### Màn hình 2: Không Gian Làm Việc Đa Tab (`MentorProgramWorkspace`)
> **Khái niệm:** *Một không gian làm việc liền mạch (App Shell Workspace) tích hợp thanh Breadcrumb quay lại, điều hướng 3 tab chuyên biệt: Kanban kéo thả mượt mà, Bảng ma trận tải trọng & chia nhóm dự án, và Thống kê tiến độ.*

```text
+----------------------------------------------------------------------------------------------------+
| [← Quay lại danh sách kỳ]   KỲ THỰC TẬP BACKEND JAVA K12 (PRG-2026-F12)                            |
| Ban Công Nghệ IT  •  12 Học viên  •  3 Nhóm dự án               [+ Quản Lý Nhóm] [+ Giao Việc Mới] |
+----------------------------------------------------------------------------------------------------+
| [📌 Tab 1: Bảng Nhiệm Vụ (Kanban)]   |   [👥 Tab 2: Học Viên & Chia Nhóm (12)]   |   [📊 Tiến Độ]  |
+----------------------------------------------------------------------------------------------------+
| [Tuần 1: Khởi động (100%)]  [Tuần 2: Spring Boot (65%)]*  [Tuần 3: Microservice (0%)]  [+ Thêm Tuần]
+----------------------------------------------------------------------------------------------------+
| [🔍 Tìm task...]              [Lọc theo TTS: Tất cả ▼]              [Lọc theo Nhóm: Tất cả ▼]      |
+----------------------------------------------------------------------------------------------------+
|   🟡 CHƯA LÀM (TODO) (4)    |    🔵 ĐANG LÀM (IN_PROGRESS) (3)    |   🟢 HOÀN THIỆN (COMPLETED) (8)   |
| +-------------------------+ | +---------------------------------+ | +-----------------------------+ |
| | [Ưu tiên cao]  [Hạn: T6]| | | [Trung bình]  [Hạn: Ngày mai]   | | | [Hoàn thành]                | |
| | Cấu hình Spring Security| | | Viết Unit Test cho Service      | | | Setup Docker Compose DB     | |
| | (Draggable thẻ công việc)| | | (Kéo sang hoàn thiện để xong)   | | | 👥 (Cả nhóm 12 TTS)         | |
| | 👥 (Nhóm 1 - 3 bạn)     | | | 👥 (Trần Văn B)                 | | +-----------------------------+ |
| +-------------------------+ | +---------------------------------+ |                                 |
| | [+ Tạo nhanh công việc] | |                                     |                                 |
+----------------------------------------------------------------------------------------------------+
```

#### Bố cục Tab 2: Học Viên & Chia Nhóm Trong Workspace
```text
+----------------------------------------------------------------------------------------------------+
| [Thống kê: 12 Học viên | 3 Nhóm đã chia | 1 Học viên chưa có nhóm]         [Mở Quản Lý Nhóm (Modal)]|
+----------------------------------------------------------------------------------------------------+
| 📂 DANH SÁCH NHÓM DỰ ÁN:                                                                           |
| +---------------------------------+ +---------------------------------+ +------------------------+ |
| | Nhóm 1: Core Service (4 bạn)    | | Nhóm 2: Authentication (4 bạn)  | | Nhóm 3: Data ETL (3)   | |
| | Thành viên: A, B, C, D          | | Thành viên: E, F, G, H          | | Thành viên: I, K, L    | |
| +---------------------------------+ +---------------------------------+ +------------------------+ |
+----------------------------------------------------------------------------------------------------+
| 👥 MA TRẬN PHÂN BỔ TẢI TRỌNG CÔNG VIỆC:                                                            |
| Mã TTS     | Họ và Tên         | Email                | Nhóm   | Số Task | Tải Trọng | Thao Tác    |
| INT-26-001 | Nguyễn Văn A      | vana@internhub.vn    | Nhóm 1 | 2 việc  | 🟢 Vừa sức| [+ Giao việc|
| INT-26-002 | Trần Thị B        | thib@internhub.vn    | Nhóm 1 | 5 việc  | 🔴 Quá tải| [+ Giao việc|
| INT-26-003 | Lê Văn C          | vanc@internhub.vn    | Chưa gán| 0 việc | 🟡 Chưa có| [+ Giao việc|
+----------------------------------------------------------------------------------------------------+
```

### 2.5. Chuyển Động & Tương Tác Có Ý Đồ (Intentional Motion & Drag Feedback)
- **HTML5 Drag-and-Drop:**
  - Thẻ nguồn mờ xuống `opacity: 0.45` khi bắt đầu kéo (`onDragStart`).
  - Vùng thả đích (`drop-target`) đổi màu viền sang nét đứt `var(--primary)` kèm nền sáng dịu `var(--primary-light)` (`transition: all 0.15s ease`).
  - Thả thẻ: Cập nhật ngay lập tức (Optimistic Update). Nếu API thất bại, rollback thẻ về vị trí ban đầu và hiển thị Toast lỗi nhẹ nhàng (Edge Case 3).
- **Inline Quick Add:** Ô nhập nhanh ở chân cột TODO mượt mà, nhấn Enter tạo ngay task với tiêu đề vừa gõ mà không cần mở modal đầy đủ.

---

## 3. Danh Sách Tệp Tác Động (Impacted Files Checklist)

### 3.1. Hook & State Management:
- `[MODIFY]` [`src/hooks/useMentorMissions.ts`](file:///d:/codegym_final_project/InternHub-Frontend/src/hooks/useMentorMissions.ts):
  - Bổ sung state `groups: InternGroup[]`, `isLoadingGroups: boolean`.
  - Tích hợp gọi `groupService.getGroups(programId)`.
  - Cung cấp hàm `batchApplyGroups` và `disbandGroup` thông qua `groupService`.
  - Bổ sung `internWorkloadMap`: map `internId` ➔ số lượng active task (`TODO` + `IN_PROGRESS`).
  - Cung cấp hàm `quickCreateItem(title: string)` cho ô nhập nhanh chân cột TODO.

### 3.2. Container Page:
- `[MODIFY]` [`src/pages/mentor/missions/MentorMissionPage.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/mentor/missions/MentorMissionPage.tsx):
  - Tích hợp `useSearchParams` từ `react-router-dom` để điều phối hiển thị URL-driven:
    - Nếu không có `programId`: hiển thị `MentorProgramHub`.
    - Nếu có `programId`: hiển thị `MentorProgramWorkspace`.
  - Kết nối `ProgramGroupModal` hiện có từ `src/pages/hr/components/ProgramGroupModal/ProgramGroupModal.tsx`.
- `[MODIFY]` [`src/pages/mentor/missions/MentorMissionPage.module.css`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/mentor/missions/MentorMissionPage.module.css): Tinh chỉnh style layout tổng thể.

### 3.3. Các Sub-components Mới Thuộc Domain `MentorProgramHub`:
- `[NEW]` `src/pages/mentor/missions/components/MentorProgramHub/ProgramBentoCard.types.ts`: Props interface cho thẻ kỳ thực tập.
- `[NEW]` `src/pages/mentor/missions/components/MentorProgramHub/ProgramBentoCard.module.css`: CSS Modules thẻ Bento card với progress bar và status badge.
- `[NEW]` `src/pages/mentor/missions/components/MentorProgramHub/ProgramBentoCard.tsx`: Thẻ chương trình chuyên nghiệp.
- `[NEW]` `src/pages/mentor/missions/components/MentorProgramHub/MentorProgramHub.types.ts`: Props interface cho Hub.
- `[NEW]` `src/pages/mentor/missions/components/MentorProgramHub/MentorProgramHub.module.css`: CSS Modules cho Grid và Toolbar tìm kiếm.
- `[NEW]` `src/pages/mentor/missions/components/MentorProgramHub/MentorProgramHub.tsx`: Giao diện Trung tâm quản lý các kỳ thực tập.

### 3.4. Các Sub-components Mới Thuộc Domain `MentorProgramWorkspace`:
- `[NEW]` `src/pages/mentor/missions/components/MentorProgramWorkspace/MentorProgramWorkspace.types.ts`: Props interface cho Workspace.
- `[NEW]` `src/pages/mentor/missions/components/MentorProgramWorkspace/MentorProgramWorkspace.module.css`: CSS Modules cho Workspace và Tab Navigation.
- `[NEW]` `src/pages/mentor/missions/components/MentorProgramWorkspace/MentorProgramWorkspace.tsx`: Không gian làm việc đa tab của kỳ.
- `[NEW]` `src/pages/mentor/missions/components/MentorProgramWorkspace/tabs/MentorInternsAndGroupsTab.types.ts`: Props interface cho Tab Học viên & Nhóm.
- `[NEW]` `src/pages/mentor/missions/components/MentorProgramWorkspace/tabs/MentorInternsAndGroupsTab.module.css`: Style bảng ma trận tải trọng và danh sách nhóm.
- `[NEW]` `src/pages/mentor/missions/components/MentorProgramWorkspace/tabs/MentorInternsAndGroupsTab.tsx`: Tab quản lý học viên, ma trận tải trọng và danh sách nhóm.
- `[NEW]` `src/pages/mentor/missions/components/MentorProgramWorkspace/tabs/MentorAnalyticsTab.module.css`: Style bảng tiến độ đào tạo.
- `[NEW]` `src/pages/mentor/missions/components/MentorProgramWorkspace/tabs/MentorAnalyticsTab.tsx`: Tab tổng quan tiến độ đào tạo.

### 3.5. Nâng Cấp Các Components Hiện Có:
- `[MODIFY]` [`src/pages/mentor/missions/components/MissionCard/MissionCard.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/mentor/missions/components/MissionCard/MissionCard.tsx) & `.module.css`:
  - Thêm thuộc tính `draggable` và sự kiện `onDragStart`.
  - Loại bỏ các nút bấm text chật chội ở chân thẻ, giữ thẻ thoáng đãng, tinh tế.
- `[MODIFY]` [`src/pages/mentor/missions/components/MissionKanbanColumn/MissionKanbanColumn.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/mentor/missions/components/MissionKanbanColumn/MissionKanbanColumn.tsx) & `.module.css`:
  - Bổ sung `onDragOver`, `onDragLeave`, `onDrop` để highlight cột nhận thẻ.
  - Thêm ô nhập nhanh Inline Quick Add ở chân cột TODO.
- `[MODIFY]` [`src/pages/mentor/missions/components/MissionKanbanBoard/MissionKanbanBoard.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/mentor/missions/components/MissionKanbanBoard/MissionKanbanBoard.tsx):
  - Truyền sự kiện thả thẻ (`onDropItem(itemId, targetStatus)`) và Quick Add xuống các cột.
- `[MODIFY]` [`src/pages/mentor/missions/components/MissionItemModal/MissionItemModal.tsx`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/mentor/missions/components/MissionItemModal/MissionItemModal.tsx) & `.types.ts` & `.module.css`:
  - Nút **"Chọn tất cả"** & **"Bỏ chọn tất cả"** 1-click.
  - **Lọc theo Nhóm** và tự động tick chọn thành viên nhóm.
  - **Thước đo tải trọng (Workload Badge)** cạnh tên mỗi TTS.
  - **Selected Assignee Chips** có nút x gỡ nhanh.
  - Checkbox **"Tiếp tục tạo công việc khác"** (giữ mở form sau submit).
- `[MODIFY]` [`src/pages/mentor/missions/components/index.ts`](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/mentor/missions/components/index.ts): Barrel export các component mới.

---

## 4. Kế Hoạch Triển Khai Chi Tiết Từng Bước (Implementation Steps)

### Bước 1: Mở Rộng Hook Quản Lý `useMentorMissions.ts`
1. Khai báo state `groups: InternGroup[]` và `isLoadingGroups: boolean`.
2. Bổ sung `loadGroups(programId)` gọi `groupService.getGroups(programId)`. Tự động gọi mỗi khi `selectedProgramId` thay đổi.
3. Bổ sung các hàm hành động:
   - `batchApplyGroups(groups)` ➔ `groupService.batchApplyGroups(selectedProgramId, { groups })` ➔ làm mới danh sách nhóm.
   - `disbandGroup(groupId)` ➔ `groupService.disbandGroup(selectedProgramId, groupId)` ➔ làm mới danh sách nhóm.
4. Tính toán `internWorkloadMap`: Map đếm số lượng công việc đang xử lý (`status !== 'COMPLETED'`) của từng TTS trong kỳ.
5. Cung cấp hàm `quickCreateItem(title: string)` để tạo nhanh công việc ở cột TODO với độ ưu tiên mặc định `MEDIUM`.

### Bước 2: Xây Dựng Sub-Components Trung Tâm Quản Lý Kỳ Thực Tập (`MentorProgramHub`)
1. Tạo thư mục `src/pages/mentor/missions/components/MentorProgramHub/`.
2. Xây dựng `ProgramBentoCard.tsx`:
   - Hiển thị badge phòng ban, trạng thái (`ONGOING`, `UPCOMING`, `COMPLETED`).
   - Tên chương trình đậm nét, mã kỳ thực tập.
   - Thời gian diễn ra (`startDate` ➔ `endDate`).
   - Thống kê nhân sự: Số lượng TTS, số lượng nhóm đã chia.
   - Thanh tiến độ (Progress bar) hoàn thành nhiệm vụ với hiệu ứng gradient mềm mại.
   - Nút hành động nổi bật: *"Vào Không Gian Làm Việc"*.
3. Xây dựng `MentorProgramHub.tsx`:
   - Hero header thống kê tổng hợp (Tổng kỳ, Tổng TTS, Tổng task, Tỷ lệ hoàn thành).
   - Thanh tìm kiếm và bộ lọc trạng thái.
   - Bố cục Bento Grid responsive (1 cột trên mobile, 2-3 cột trên tablet/desktop).
   - Xử lý đầy đủ Skeleton loading và Empty State chuẩn Rule 32.

### Bước 3: Nâng Cấp Bảng Kanban Kéo Thả HTML5 Drag & Drop Native
1. Trong `MissionCard.tsx`:
   - Thêm thuộc tính `draggable` trên thẻ container.
   - Bắt sự kiện `onDragStart`: Lưu `itemId` vào `event.dataTransfer.setData('text/plain', String(item.id))`.
   - Làm mờ nhẹ thẻ đang kéo (`opacity: 0.5`).
   - Tối giản hóa thẻ: Loại bỏ các nút text chuyển trạng thái cồng kềnh, chỉ giữ lại priority badge, avatar stack, countdown deadline và nút menu hành động gọn gàng.
2. Trong `MissionKanbanColumn.tsx`:
   - Thêm state `isDragOver: boolean`.
   - Bắt sự kiện `onDragOver`: `e.preventDefault()`, đổi viền sang nét đứt `var(--primary)` và background dịu nhẹ.
   - Bắt sự kiện `onDrop`: Lấy `itemId` từ dataTransfer và gọi callback `onDropItem(itemId, status)`.
   - Chân cột TODO: Thêm form nhập nhanh *"Nhập tiêu đề & Enter để tạo nhanh task..."* kèm icon `<Plus size={14} />`.
3. Trong `MissionKanbanBoard.tsx`:
   - Kết nối sự kiện `onDropItem` và xử lý Optimistic update + Rollback an toàn (Edge Case 3).

### Bước 4: Xây Dựng Tab "Học Viên & Chia Nhóm" Trong Workspace
1. Tạo thư mục `src/pages/mentor/missions/components/MentorProgramWorkspace/tabs/`.
2. Xây dựng `MentorInternsAndGroupsTab.tsx`:
   - Khối 1: Tổng quan phân bổ nhóm (Cards các nhóm dự án đã tạo, sĩ số từng nhóm, nút mở Modal quản lý nhóm).
   - Khối 2: Ma trận tải trọng học viên (Workload Matrix Table):
     - Danh sách 100% TTS của kỳ (tối đa 10 dòng/trang, tự ẩn phân trang khi <= 10 dòng theo Rule 31).
     - Các cột: Mã TTS, Họ tên, Email, Vị trí thực tập, Nhóm dự án, Số task đang phụ trách, Badge tải trọng (🟢 Bình thường / 🟡 Rảnh rỗi / 🔴 Quá tải).
     - Nút hành động nhanh: `+ Giao task cho bạn này` ➔ Mở Modal Giao Việc với bạn này được chọn sẵn.

### Bước 5: Xây Dựng Không Gian Làm Việc Đa Tab (`MentorProgramWorkspace`)
1. Tạo thư mục `src/pages/mentor/missions/components/MentorProgramWorkspace/`.
2. Xây dựng `MentorProgramWorkspace.tsx`:
   - Header Workspace: Nút `← Quay lại danh sách chương trình`, Tiêu đề kỳ thực tập, Phòng ban, Nút `+ Quản Lý Nhóm` và `+ Giao Việc Mới`.
   - Tab Navigation dạng Segmented Control:
     - `Tab 1: Bảng Nhiệm Vụ (Kanban)` kèm Pills chọn tuần/board.
     - `Tab 2: Đội Ngũ TTS & Chia Nhóm (N)` hiển thị tổng số học viên.
     - `Tab 3: Tổng Quan Tiến Độ` hiển thị phân tích hoàn thành.
   - Xử lý chuyển đổi tab mượt mà, lưu tab đang chọn trong state.

### Bước 6: Nâng Cấp Modal Giao Việc Thông Minh (`MissionItemModal Pro`)
1. Mở rộng `MissionItemModal.types.ts`:
   - Bổ sung prop `groups?: InternGroup[]`.
   - Bổ sung prop `internWorkloadMap?: Record<number, number>`.
2. Cập nhật `MissionItemModal.tsx`:
   - Thêm nút tiện ích: **"Chọn tất cả"** & **"Bỏ chọn tất cả"** 1-click.
   - Thêm bộ lọc dropdown theo Nhóm: Khi chọn nhóm, tự động tick toàn bộ thành viên của nhóm đó.
   - Cạnh tên mỗi TTS trong danh sách chọn: Hiển thị Workload badge thể hiện số lượng task hiện tại.
   - Hiển thị danh sách chips những người đã chọn ở đầu ô tìm kiếm kèm nút x để gỡ nhanh.
   - Thêm checkbox: **"Tiếp tục tạo công việc khác"** ở footer (khi submit thành công, giữ modal mở và reset form để nhập tiếp).

### Bước 7: Tích Hợp Vào `MentorMissionPage.tsx` & Kết Nối `ProgramGroupModal`
1. Đọc và cập nhật URL query params `?programId=...` thông qua `useSearchParams`:
   - Nếu chưa chọn kỳ ➔ Hiển thị `<MentorProgramHub />`.
   - Nếu đã chọn kỳ ➔ Hiển thị `<MentorProgramWorkspace />`.
2. Kết nối `ProgramGroupModal`:
   - Tái sử dụng 100% `ProgramGroupModal` từ `src/pages/hr/components/ProgramGroupModal/ProgramGroupModal.tsx`.
   - Adapter map `programInterns` sang `InternProfile[]` để truyền vào `interns` prop.
   - Truyền các handler `onBatchApply` và `onDisbandGroup` đã viết ở hook.

### Bước 8: Kiểm Thử Nghiệm Thu & Đảm Bảo Chất Lượng (Quality Verification)
1. Chạy kiểm tra tĩnh TypeScript & Vite build: `npm run build` (`tsc -b && vite build`) đảm bảo 0 lỗi kiểu dữ liệu và 0 cảnh báo.
2. Kiểm tra Responsive & Dark/Light Mode: Đảm bảo không vỡ layout trên mobile/desktop, 100% dùng CSS Variables.
3. Kiểm thử kéo thả Kanban: Kiểm tra thả đúng cột và kiểm tra cơ chế Rollback khi có lỗi mạng.
4. Kiểm thử luồng giao việc Pro: Chọn tất cả, chọn theo nhóm, giữ form mở để tạo liên tiếp.

---

## 5. Rủi Ro Tiềm Ẩn & Phương Án Phòng Ngừa (Risks & Mitigations)

1. **Rủi ro tương thích dữ liệu giữa `AssigneeResponse` và `ProgramGroupModal`:**
   - *Phòng ngừa:* Sử dụng Adapter Memoized mapping các trường cơ bản (`id`, `fullName`, `internCode`, `email`, `programId`) sang `InternProfile` mà không làm thay đổi contract gốc.
2. **Rủi ro giật lag giao diện khi kéo thả nhiều thẻ công việc (CLS / Drag Performance):**
   - *Phòng ngừa:* Sử dụng HTML5 Native Drag & Drop với CSS `contain: layout style`, không cài thêm thư viện kéo thả nặng gây bloat bundle.
3. **Rủi ro mất đồng bộ URL khi Mentor reload trang:**
   - *Phòng ngừa:* Đồng bộ 2 chiều `selectedProgramId` với `useSearchParams` (`?programId=123`), giúp F5 vẫn giữ nguyên kỳ đang xem.
