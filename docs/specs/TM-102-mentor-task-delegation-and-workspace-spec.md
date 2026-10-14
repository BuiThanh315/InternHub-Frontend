# Specification: Cập Nhật Mentor Giao Việc Cho Thực Tập Sinh & Không Gian Làm Việc Chương Trình (TM-102 Frontend)

> **Tài liệu Đặc Tả Kỹ Thuật (Frontend Specification)**  
> **Dự án:** [InternHub-Frontend](file:///d:/codegym_final_project/InternHub-Frontend) (React 19, Vite, TypeScript, CSS Modules)  
> **Mã Jira Ticket:** [TM-102](https://robluccibn9935.atlassian.net/browse/TM-102) - *Mentor Task Delegation & Program Mission Workspace Enhancement*  
> **Trạng thái:** DRAFT / PENDING APPROVAL  
> **Lưu trữ tại:** `InternHub-Frontend/docs/specs/TM-102-mentor-task-delegation-and-workspace-spec.md`  
> **Change Level:** **L3** (Tái cấu trúc luồng giao việc của Mentor: thay thế Dropdown bằng Program CardView Hub, xây dựng Program Mission Workspace đa tab, tích hợp quản lý nhóm & xem toàn bộ TTS cho Mentor, tối ưu Modal giao việc Pro, tích hợp HTML5 Native Drag-and-Drop trên Kanban).  
> **Tiêu chuẩn tuân thủ:** 34 Nguyên tắc bất biến ([`AGENTS.md`](file:///d:/codegym_final_project/InternHub-Frontend/AGENTS.md)), Quy chuẩn UX/UI ([`08-ui-ux-guidelines.md`](file:///d:/codegym_final_project/InternHub-Frontend/.agents/08-ui-ux-guidelines.md)) & Kỹ năng Thiết kế Giao diện Độc bản ([`frontend-design`](file:///d:/codegym_final_project/InternHub-Frontend/.agents/skills/frontend-design/SKILL.md)).

---

## 0. Nhật Ký Thay Đổi & Giải Trình Kỹ Thuật (Revision History & Change Rationale)

| Phiên bản | Ngày | Người thực hiện | Task / Jira | Loại thay đổi | Lý do & Giải trình kỹ thuật (Rationale) |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **v1.0** | 2026-10-09 | AI Senior Frontend Pair-Programmer & User | `TM-102` | Tạo mới Đặc Tả | Tái thiết kế trải nghiệm giao việc cho Mentor sau đợt kiểm tra thực tế: Thay thế dropdown Program bằng Program CardView Grid, xây dựng Program Mission Workspace riêng biệt, bổ sung tính năng quản lý nhóm & xem 100% TTS cho Mentor, bổ sung kéo thả Drag-and-Drop và nâng cấp Modal giao việc Pro. |

---

## 1. Feature Overview (Tổng Quan Tính Năng)

- **Tên tính năng:** Không Gian Điều Phối Nhiệm Vụ & Quản Lý Thực Tập Sinh Dành Cho Mentor (Mentor Program Mission Workspace & Task Delegation).
- **Hệ thống liên quan:**
  - **Frontend:** `InternHub-Frontend` (React 19, TypeScript, CSS Modules, Lucide React, Axios client).
  - **Backend API:** `intern-and-program-service` (Port `8082`) qua API Gateway (Port `8080`).
- **Điểm truy cập trên giao diện (Entry Points):**
  - Thanh Sidebar điều hướng: Mục **"Nhiệm vụ đào tạo"** (`/mentor/missions`).
  - Đường dẫn trực tiếp có mã chương trình: `/mentor/missions?programId=:id`.
- **Đối tượng người dùng & Phân quyền:** `ROLE_MENTOR`, `ROLE_ADMIN` (Người hướng dẫn chuyên môn và Quản trị viên).

---

## 2. Business Goal & Core Objectives (Mục Tiêu Nghiệp Vụ)

1. **Xóa bỏ ma sát giao diện & Tối ưu hóa Luồng tư duy của Mentor (Reduce Cognitive Friction):**
   - Thay vì nhảy thẳng vào bảng Kanban của một chương trình ngẫu nhiên qua Dropdown, Mentor tiếp cận qua **Program CardView Hub** — nơi hiển thị trực quan toàn bộ các kỳ thực tập mà mình đang phụ trách, nắm bắt ngay tổng số học viên, số lượng nhóm và tiến độ chung.
2. **Tập trung hóa Không Gian Làm Việc (Dedicated Program Workspace):**
   - Mỗi kỳ thực tập trở thành một "Không gian làm việc độc lập" (Workspace) với các công cụ tích hợp sẵn: Bảng Kanban theo tuần/sprint, Danh sách thành viên, Tạo/chia nhóm làm việc, và Ma trận tải trọng.
3. **Trao quyền Quản lý Nhóm & Xem toàn bộ Học viên cho Mentor (Mentor Group Management):**
   - Mentor có thể quan sát 100% TTS trong kỳ mình quản lý, phân chia các em thành các nhóm dự án (Team Frontend, Team Backend, Team Tester...), chỉ định nhóm trưởng và giao việc tập trung theo nhóm.
4. **Nâng tầm trải nghiệm Giao việc (Pro Task Delegation UX):**
   - Hỗ trợ chọn nhanh tất cả TTS, chọn theo Nhóm dự án, cảnh báo tải trọng (Workload Indicator: tránh giao dồn task cho một bạn), và tùy chọn tạo liên tiếp nhiều việc mà không bị đóng Modal.
5. **Trải nghiệm Kanban Kéo Thả Mượt Mà (Native HTML5 Drag & Drop):**
   - Cho phép Mentor kéo thả trực tiếp các thẻ công việc giữa các cột *Chưa làm* (`TODO`), *Đang làm* (`IN_PROGRESS`), *Hoàn thiện* (`COMPLETED`), loại bỏ hoàn toàn các nút bấm text chuyển trạng thái chật chội.

---

## 3. Scope of Work (Phạm Vi Tính Năng)

### 3.1. Trong phạm vi (In Scope)

1. **Màn hình 1 - Trung Tâm Các Kỳ Thực Tập (Program CardView Hub):**
   - Hiển thị danh sách các chương trình mà Mentor phụ trách dưới dạng **Bento Card Grid**.
   - Mỗi thẻ thể hiện: Tên chương trình, Mã kỳ, Phòng ban, Thời lượng đào tạo, Số lượng TTS đang hướng dẫn, Số lượng nhóm, Tỷ lệ hoàn thành công việc (Progress bar), và Badge trạng thái (`ONGOING`, `UPCOMING`, `COMPLETED`).
   - Thanh tìm kiếm và bộ lọc trạng thái chương trình.
   - Nút CTA chuyển hướng: **"Vào Không Gian Làm Việc →"** (Mở Workspace của kỳ đó).
2. **Màn hình 2 - Không Gian Làm Việc Chương Trình (Program Mission Workspace):**
   - Thanh Header Workspace: Nút `← Quay lại danh sách chương trình`, Tiêu đề kỳ, Bộ phận, Nút hành động nhanh `+ Giao Việc Mới` và `+ Tạo Nhóm Mới`.
   - **Tab 1: Bảng Nhiệm Vụ (Mission Kanban Tab):**
     - Thanh chuyển tuần/sprint dạng **Horizontal Pills Tabs** (`[Tuần 1 (100%)]`, `[Tuần 2 (65%)]`, `[+ Thêm tuần]`).
     - Bảng Kanban 3 cột với **HTML5 Drag-and-Drop Native**.
     - Thẻ nhiệm vụ hiện đại: Đếm ngược hạn chót, Tag độ ưu tiên, Avatar stack người nhận việc.
     - Ô nhập nhanh ở chân cột TODO: *"Nhập tiêu đề & Enter để tạo nhanh task..."*.
   - **Tab 2: Đội Ngũ Thực Tập Sinh & Nhóm (Interns & Groups Tab):**
     - Tích hợp xem 100% danh sách TTS của kỳ (kèm avatar, mã TTS, email, vị trí).
     - Quản lý nhóm: Tái sử dụng `ProgramGroupModal` cho phép Mentor tạo nhóm mới, đổi tên nhóm, giải tán nhóm, gán thành viên hoặc chia nhóm tự động.
     - Ma trận tải trọng (Workload Matrix): Hiển thị số lượng task đang phụ trách của từng TTS, cảnh báo người quá tải / người chưa có việc, nút nhanh `+ Giao task cho bạn này`.
   - **Tab 3: Tổng Quan Tiến Độ (Program Analytics Tab):**
     - Thống kê hoàn thành nhiệm vụ theo từng tuần, tỷ lệ đúng hạn của học viên.
3. **Nâng cấp Modal Giao Việc (`MissionItemModal Pro`):**
   - Nút tiện ích: **"Chọn tất cả"** & **"Bỏ chọn tất cả"**.
   - **Lọc nhanh theo Nhóm**: Chọn 1 click toàn bộ thành viên trong nhóm (VD: *Nhóm 1*, *Team Frontend*).
   - **Thước đo tải trọng (Workload Badge)**: Hiển thị bên cạnh tên mỗi TTS số task đang thực hiện (🟢 0-2 việc, 🟡 3-4 việc, 🔴 ≥ 5 việc).
   - **Selected Assignee Chips**: Hiển thị danh sách badge những người đã chọn ở đầu ô tìm kiếm kèm nút x để gỡ nhanh.
   - Checkbox: **"Tiếp tục tạo công việc khác"** (giữ form mở sau khi lưu thành công để nhập tiếp task mới).

### 3.2. Ngoài phạm vi (Out of Scope)

- Chưa can thiệp sửa đổi Backend Java trong giai đoạn thiết kế Frontend này (tuân thủ chỉ thị "Thiết kế Frontend trước").
- Chưa hỗ trợ kéo thả chỉnh sửa thứ tự thẻ bên trong cùng một cột (chỉ tập trung kéo thả chuyển cột trạng thái `TODO` ↔ `IN_PROGRESS` ↔ `COMPLETED`).
- Không cài thêm thư viện kéo thả nặng từ bên ngoài; sử dụng HTML5 Drag & Drop Native để tối ưu hiệu năng và kích thước bundle.

---

## 4. Potential Edge Cases & Frontend Mitigations (Tối Thiểu 5 Edge Cases)

### 4.1. Edge Case 1: Mentor Không Được Phân Công Chương Trình Nào (`programs.length === 0`)
- **Vấn đề:** Tài khoản Mentor mới kích hoạt chưa được HR gán vào chương trình thực tập nào.
- **Giải pháp:** Hiển thị Empty State chuẩn Rule 32 tại Program Hub:
  - Icon minh họa: `<FolderX size={48} />`
  - Tiêu đề: *"Bạn chưa được phân công phụ trách chương trình thực tập nào"*
  - Hướng dẫn: *"Vui lòng liên hệ Bộ phận Tuyển dụng / Quản lý Đào tạo (HR) để được gán vào chương trình phụ trách."*
  - Nút CTA: *"Làm mới danh sách"* (`RefreshCw`).

### 4.2. Edge Case 2: Chương Trình Đã Có TTS Nhưng Chưa Có Bảng Nhiệm Vụ Nào (`boards.length === 0`)
- **Vấn đề:** Mentor mở Workspace của một kỳ mới, kỳ chưa có Board/Tuần nào. Trước đây bị chặn đứng và không cho giao task.
- **Giải pháp:** 
  - Tự động hiển thị Empty State thân thiện bên trong Tab Kanban với 2 lựa chọn:
    1. Nút `+ Tạo Tuần/Bảng Nhiệm Vụ Mới`.
    2. Nút `+ Tạo Nhanh Bảng Mặc Định (Tuần 1: Khởi Động & Hội Nhập)`.
  - Mentor có thể bấm 1 click để sinh ngay bảng đầu tiên và bắt đầu giao việc ngay lập tức.

### 4.3. Edge Case 3: Kéo Thả Thẻ Thất Bại Do Mất Mạng Hoặc Lỗi Server (Drag & Drop Rollback)
- **Vấn đề:** Mentor kéo thẻ từ `TODO` sang `IN_PROGRESS`, UI cập nhật lạc quan (Optimistic UI) nhưng API Backend trả về lỗi mạng hoặc 500.
- **Giải pháp:**
  - Áp dụng cơ chế **Rollback State**: Lưu lại trạng thái trước khi kéo (`previousStatus`).
  - Nếu API lỗi: Hiển thị Toast thông báo lỗi, lập tức đưa thẻ công việc quay trở về cột ban đầu một cách êm ái.

### 4.4. Edge Case 4: Chương Trình Chưa Được Phân Nhóm (Chưa Có Groups)
- **Vấn đề:** Mentor mở Tab *"Thực Tập Sinh & Nhóm"* hoặc mở Modal Giao Việc nhưng kỳ chưa chia nhóm nào (`groups.length === 0`).
- **Giải pháp:**
  - Trong Modal Giao Việc: Dropdown lọc theo nhóm hiển thị nhãn *"Chưa chia nhóm"* và cho phép chọn theo danh sách TTS bình thường.
  - Trong Tab Quản Lý Nhóm: Hiển thị banner khuyến khích: *"Chương trình hiện có {N} thực tập sinh nhưng chưa được chia nhóm. Hãy bấm [Chia nhóm tự động] hoặc [Tạo nhóm mới] để quản lý theo tổ đội hiệu quả hơn!"*.

### 4.5. Edge Case 5: Giao Việc Nhưng Không Chọn TTS Nào (`assigneeInternIds.length === 0`)
- **Vấn đề:** Mentor nhập tiêu đề, mô tả rồi bấm Lưu mà quên chọn học viên nhận việc.
- **Giải pháp:**
  - Client-side validation: Hiển thị viền đỏ khu vực chọn TTS kèm thông báo lỗi: *"Vui lòng chọn ít nhất 1 thực tập sinh tham gia công việc"*.
  - Nút bấm *"Giao việc"* tự động cuộn (scrollIntoView) tới danh sách TTS và rung nhẹ (shake animation) để thu hút sự chú ý.

---

## 5. Technical Architecture & Code Reuse Survey (Khảo Sát Tái Sử Dụng Mã Nguồn)

Tuân thủ nghiêm ngặt **Chỉ thị cốt lõi của Workspace**: *"Đảm bảo quét dự án, tránh việc tạo thêm code mới không cần thiết, sử dụng tối đa những gì đã có để phát triển"*.

| Thành phần hệ thống | Hiện trạng khảo sát | Chiến lược tái sử dụng trong TM-102 |
| :--- | :--- | :--- |
| **`ProgramGroupModal`** | Đã có sẵn trong `src/pages/hr/components/ProgramGroupModal/ProgramGroupModal.tsx`. Hỗ trợ tạo nhóm, sửa nhóm, xóa nhóm, gán thành viên, chia nhóm tự động (batch apply). | **Tái sử dụng 100%**. Nhúng trực tiếp vào Workspace của Mentor để cung cấp tính năng quản lý nhóm mà không phải viết lại một dòng code modal mới nào. |
| **`groupService`** | Đã có `getGroups`, `createGroup`, `updateGroup`, `disbandGroup`, `batchApplyGroups` trong `src/services/groupService.ts`. | **Tái sử dụng 100%**. Gọi trực tiếp các method API đã có sẵn. |
| **`missionService`** | Đã có đầy đủ các method tương tác với Board, Item và Program Interns trong `src/services/missionService.ts`. | **Tái sử dụng 100%**. Bổ sung thêm API lấy thống kê nếu cần. |
| **`useMentorMissions`** | Hook điều phối trạng thái dữ liệu trong `src/hooks/useMentorMissions.ts`. | **Kế thừa & Mở rộng**. Thêm state `activeView: 'hub' \| 'workspace'` và `activeTab: 'kanban' \| 'interns' \| 'analytics'` để điều phối 2 màn hình liền mạch. |
| **Common Components** | `Modal`, `Button`, `Input`, `Select`, `SearchBar`, `Badge`, `Skeleton`, `EmptyState` trong `src/components/common/`. | **Tái sử dụng 100%**. Tuân thủ Design Tokens và CSS Variables. |

---

## 6. UI/UX Design System & Wireframes

### 6.1. Bố Cục Màn Hình 1: Program CardView Hub (`MentorProgramHub`)

```text
+----------------------------------------------------------------------------------------------------+
| Header: Trung Tâm Điều Phối Nhiệm Vụ Đào Tạo (Mentor Mission Hub)                                  |
| "Quản lý các chương trình thực tập bạn đang phụ trách và phân công công việc cho học viên"         |
+----------------------------------------------------------------------------------------------------+
| [ 3 Chương Trình Đang Phụ Trách ]   [ 28 Thực Tập Sinh ]   [ 42 Nhiệm Vụ ]   [ 85% Tỷ Lệ Hoàn Thành]|
+----------------------------------------------------------------------------------------------------+
| [🔍 Tìm kiếm chương trình...]                         [ Bộ lọc: Tất cả trạng thái ▼ ]              |
+----------------------------------------------------------------------------------------------------+
| +-----------------------------------+ +-----------------------------------+ +---------------------+ |
| | [Ban Công Nghệ IT]  [ONGOING]     | | [Phòng R&D AI]      [ONGOING]     | | [Trung Tâm Cloud]   | |
| | Kỳ Thực Tập Backend Java K12      | | Thực Tập Kỹ Sư Trí Tuệ Nhân Tạo   | | DevOps & Cloud K04  | |
| | 📅 01/10/2026 -> 31/12/2026       | | 📅 15/09/2026 -> 15/12/2026       | | 📅 01/11/2026 -> ...| |
| | 👥 12 TTS  •  📂 3 Nhóm           | | 👥 8 TTS   •  📂 2 Nhóm           | | 👥 8 TTS  •  📂 2 N | |
| | Tiến độ: [========------] 65%     | | Tiến độ: [==========----] 80%     | | Tiến độ: [===-----] | |
| |                                   | |                                   | |                     | |
| | [ Vào Không Gian Làm Việc -> ]    | | [ Vào Không Gian Làm Việc -> ]    | | [ Vào Không Gian.. ]| |
| +-----------------------------------+ +-----------------------------------+ +---------------------+ |
+----------------------------------------------------------------------------------------------------+
```

### 6.2. Bố Cục Màn Hình 2: Program Mission Workspace (`MentorProgramWorkspace`)

```text
+----------------------------------------------------------------------------------------------------+
| [<- Quay lại danh sách chương trình]   KỲ THỰC TẬP BACKEND JAVA K12 (PRG-2026-F1)                  |
| Ban Công Nghệ IT  •  12 Thực tập sinh  •  3 Nhóm dự án                 [+ Tạo Nhóm] [+ Giao Việc]  |
+----------------------------------------------------------------------------------------------------+
|  [Tab 1: Bảng Nhiệm Vụ (Kanban)]   |   [Tab 2: Đội Ngũ TTS & Chia Nhóm (12)]   |   [Tab 3: Tiến Độ]  |
+----------------------------------------------------------------------------------------------------+
| [Tuần 1: Onboarding (100%)]  [Tuần 2: Spring Boot API (65%)]*  [Tuần 3: Security (0%)]  [+ Thêm Tuần]
+----------------------------------------------------------------------------------------------------+
| [🔍 Tìm task...]           [Lọc theo TTS: Tất cả ▼]           [Lọc theo Nhóm: Tất cả ▼]            |
+----------------------------------------------------------------------------------------------------+
|   🟡 CHƯA LÀM (TODO) (4)    |    🔵 ĐANG LÀM (IN_PROGRESS) (3)   |    🟢 HOÀN THIỆN (COMPLETED) (8)  |
| +-------------------------+ | +--------------------------------+ | +-------------------------------+ |
| | [Ưu tiên cao]  [Hạn: T6]| | | [Trung bình]  [Hạn: Ngày mai]  | | | [Hoàn thành]                  | |
| | Cấu hình Spring Security| | | Viết Unit Test cho Service     | | | Setup Docker Compose Database | |
| | 👥 (3 TTS - Nhóm BE 1)  | | | 👥 (1 TTS: Trần Văn B)         | | | 👥 (Cả nhóm 12 TTS)           | |
| +-------------------------+ | +--------------------------------+ | +-------------------------------+ |
| | [Thả thẻ vào đây...]    | | | [Thả thẻ vào đây...]           | | | [Thả thẻ vào đây...]          | |
| | [+ Thêm nhanh task...]  | |                                  | |                                 | |
+----------------------------------------------------------------------------------------------------+
```

### 6.3. Bố Cục Tab 2: Đội Ngũ TTS & Chia Nhóm Trong Workspace

```text
+----------------------------------------------------------------------------------------------------+
| [Thống kê: 12 Học viên | 3 Nhóm đã chia | 1 Học viên chưa có nhóm]       [Chia Tự Động] [+ Tạo Nhóm]|
+----------------------------------------------------------------------------------------------------+
| 📂 DANH SÁCH NHÓM DỰ ÁN:                                                                           |
| +-------------------------------+ +-------------------------------+ +----------------------------+ |
| | Nhóm 1: Microservice Core (4) | | Nhóm 2: Authentication (4)    | | Nhóm 3: Data Migration (3) | |
| | Leader: Nguyễn Văn A          | | Leader: Lê Thị C              | | Leader: Hoàng Văn D        | |
| | [Xem thành viên] [Sửa] [Giải] | | [Xem thành viên] [Sửa] [Giải] | | [Xem thành viên] [Sửa]...  | |
| +-------------------------------+ +-------------------------------+ +----------------------------+ |
+----------------------------------------------------------------------------------------------------+
| 👥 MA TRẬN PHÂN BỔ CÔNG VIỆC TỪNG HỌC VIÊN:                                                         |
| STT | Họ và Tên         | Vị trí       | Nhóm       | Số task đang làm | Trạng thái tải | Thao tác  |
| 1   | Nguyễn Văn A      | Backend Dev  | Nhóm 1     | 2 task đang làm  | 🟢 Bình thường | [+ Giao]  |
| 2   | Trần Thị B        | Backend Dev  | Nhóm 1     | 5 task đang làm  | 🔴 Quá tải     | [+ Giao]  |
| 3   | Phạm Văn C        | Tester       | Chưa nhóm  | 0 task đang làm  | 🟡 Rảnh việc   | [+ Giao]  |
+----------------------------------------------------------------------------------------------------+
```

---

## 7. User Stories & Acceptance Criteria

### User Story 1: Xem Danh Sách Chương Trình Dạng Thẻ & Vào Workspace
- **Là một:** Mentor hướng dẫn thực tập.
- **Tôi muốn:** Nhìn thấy toàn bộ các kỳ thực tập mình đang phụ trách dưới dạng các thẻ trực quan (CardView) và bấm vào để mở Workspace của kỳ đó.
- **Tiêu chí nghiệm thu (Acceptance Criteria):**
  - **AC-1.1:** Khi truy cập `/mentor/missions`, hiển thị lưới thẻ (Bento Grid) của tất cả các chương trình phụ trách lấy từ API `GET /api/mentor/programs`.
  - **AC-1.2:** Mỗi thẻ hiển thị đầy đủ: Tên kỳ, mã kỳ, phòng ban, khoảng thời gian đào tạo, số lượng TTS, số lượng nhóm và thanh tiến độ hoàn thành nhiệm vụ (%).
  - **AC-1.3:** Khi bấm vào bất kỳ thẻ chương trình nào, giao diện chuyển mượt mà sang Không Gian Làm Việc (Workspace) của chương trình đó, hiển thị thanh breadcrumb quay lại danh sách.
  - **AC-1.4:** Hỗ trợ tìm kiếm theo tên/mã kỳ và lọc theo trạng thái (`ONGOING`, `UPCOMING`, `COMPLETED`).
  - **AC-1.5:** Khi Mentor chưa có chương trình nào, hiển thị Empty State chuẩn Rule 32 kèm icon minh họa và nút thử lại.

### User Story 2: Kéo Thả Trực Quan Trên Bảng Kanban (Drag & Drop)
- **Là một:** Mentor theo dõi tiến độ đào tạo.
- **Tôi muốn:** Kéo thả các thẻ nhiệm vụ trực tiếp giữa 3 cột `TODO`, `IN_PROGRESS`, `COMPLETED`.
- **Tiêu chí nghiệm thu (Acceptance Criteria):**
  - **AC-2.1:** Thẻ công việc có thể được click-giữ và kéo (draggable) bằng HTML5 Drag & Drop Native.
  - **AC-2.2:** Khi kéo thẻ qua các cột, cột mục tiêu đổi màu viền nhẹ để báo hiệu vùng thả hợp lệ (drop zone highlight).
  - **AC-2.3:** Khi thả thẻ vào cột mới, giao diện cập nhật ngay lập tức (Optimistic Update) và gọi API `PATCH /api/mission-items/{itemId}/status`.
  - **AC-2.4:** Nếu API cập nhật thất bại, hệ thống tự động hoàn tác (Rollback) thẻ về cột cũ và hiển thị Toast thông báo lỗi.
  - **AC-2.5:** Loại bỏ hoàn toàn các nút bấm text chuyển trạng thái chật chội ở chân thẻ, chỉ giữ lại thẻ gọn gàng, đẹp mắt.

### User Story 3: Xem Toàn Bộ TTS & Tạo/Chia Nhóm Cho Mentor
- **Là một:** Mentor quản lý chương trình.
- **Tôi muốn:** Xem 100% học viên trong kỳ và có thể chia các em thành các nhóm dự án chuyên trách.
- **Tiêu chí nghiệm thu (Acceptance Criteria):**
  - **AC-3.1:** Trong Workspace của kỳ, Tab *"Đội Ngũ TTS & Chia Nhóm"* hiển thị đầy đủ danh sách học viên lấy từ `GET /api/mentor/programs/{programId}/interns`.
  - **AC-3.2:** Hiển thị danh sách các nhóm đã tạo trong kỳ từ `GET /api/programs/{programId}/groups`.
  - **AC-3.3:** Nút *"Tạo nhóm mới"* và *"Chia nhóm"* mở `ProgramGroupModal` hiện có, cho phép Mentor tạo nhóm, đặt tên nhóm và phân bổ thành viên.
  - **AC-3.4:** Bảng ma trận tải trọng hiển thị rõ số lượng task đang phụ trách của mỗi học viên kèm badge cảnh báo (🟢 Bình thường, 🟡 Rảnh việc, 🔴 Quá tải).
  - **AC-3.5:** Nút hành động nhanh `+ Giao task` trên từng dòng học viên mở Modal Giao Việc với học viên đó đã được chọn sẵn.

### User Story 4: Modal Giao Việc Thông Minh (Pro Task Delegation Modal)
- **Là một:** Mentor giao nhiệm vụ cho học viên.
- **Tôi muốn:** Giao việc nhanh cho cả nhóm hoặc toàn bộ học viên một cách thuận tiện, có cảnh báo tải trọng và không bị đóng form khi cần giao nhiều việc.
- **Tiêu chí nghiệm thu (Acceptance Criteria):**
  - **AC-4.1:** Modal có nút **"Chọn tất cả"** (tích toàn bộ TTS trong kỳ) và nút **"Bỏ chọn tất cả"** chỉ với 1 click.
  - **AC-4.2:** Có dropdown lọc theo Nhóm dự án: Khi chọn một nhóm (VD: *Nhóm 1*), hệ thống tự động tick chọn toàn bộ thành viên của nhóm đó.
  - **AC-4.3:** Cạnh tên mỗi TTS trong danh sách chọn có hiển thị Badge tải trọng thể hiện số task hiện tại.
  - **AC-4.4:** Có khu vực hiển thị các chip tags những người đã chọn ở đầu ô tìm kiếm kèm nút x để gỡ nhanh.
  - **AC-4.5:** Có checkbox *"Tiếp tục tạo công việc khác"*: khi tick chọn, sau khi submit thành công, Modal giữ nguyên mở và reset form để Mentor nhập tiếp task mới.

---

## 8. Implementation Plan & File Checklist (Frontend-First)

### 8.1. Các file tạo mới (Sub-components & Views)
1. `src/pages/mentor/missions/components/MentorProgramHub/`:
   - `MentorProgramHub.tsx`: Màn hình Lưới thẻ các chương trình.
   - `MentorProgramHub.types.ts`: Props interface.
   - `MentorProgramHub.module.css`: CSS Modules với Grid responsive, Design Tokens.
   - `ProgramBentoCard.tsx`: Thẻ chương trình chuyên nghiệp.
   - `ProgramBentoCard.module.css`: Style thẻ chương trình với progress bar và status badge.
2. `src/pages/mentor/missions/components/MentorProgramWorkspace/`:
   - `MentorProgramWorkspace.tsx`: Không gian làm việc đa tab của kỳ.
   - `MentorProgramWorkspace.types.ts`: Props interface.
   - `MentorProgramWorkspace.module.css`: CSS Modules cho Workspace.
   - `tabs/MentorInternsAndGroupsTab.tsx`: Tab quản lý học viên, ma trận tải trọng và nhóm.
   - `tabs/MentorInternsAndGroupsTab.module.css`: Style bảng ma trận tải trọng và thẻ nhóm.

### 8.2. Các file chỉnh sửa & nâng cấp
1. `src/hooks/useMentorMissions.ts`:
   - Bổ sung state `viewMode: 'hub' | 'workspace'` và `activeTab: 'kanban' | 'interns' | 'analytics'`.
   - Hỗ trợ chọn/bỏ chọn tất cả TTS, tải dữ liệu nhóm qua `groupService.getGroups(programId)`.
2. `src/pages/mentor/missions/MentorMissionPage.tsx`:
   - Điều phối hiển thị giữa `MentorProgramHub` (khi chưa chọn kỳ) và `MentorProgramWorkspace` (khi đã chọn kỳ).
   - Hỗ trợ đồng bộ `programId` qua URL query params (`?programId=123`).
3. `src/pages/mentor/missions/components/MissionItemModal/MissionItemModal.tsx`:
   - Bổ sung nút Select All / Clear All.
   - Bổ sung bộ lọc Group và auto-select theo Group.
   - Bổ sung Workload badge và Selected Assignee Chips.
   - Bổ sung checkbox "Tiếp tục tạo công việc khác".
4. `src/pages/mentor/missions/components/MissionKanbanBoard/` & `MissionCard/`:
   - Thêm sự kiện `onDragStart`, `onDragOver`, `onDrop` để hỗ trợ Native Drag & Drop.
   - Tối giản hóa thẻ, bỏ các nút bấm text chật chội.
   - Thêm ô nhập nhanh Inline Quick Add ở chân cột TODO.
5. `src/pages/mentor/missions/components/index.ts`: Re-export các component mới.

---

## 9. Verification & Quality Gates (Kiểm Thử & Nghiệm Thu)

1. **Kiểm tra biên dịch tĩnh (TypeScript & Vite Build):**
   - Chạy `npm run build` (`tsc -b && vite build`) bảo đảm 100% không có lỗi kiểu dữ liệu hay lint warning.
2. **Kiểm tra Responsive & Dark/Light Mode:**
   - Hoạt động mượt mà từ màn hình Desktop (1920x1080) đến Tablet/Mobile.
   - Toàn bộ màu sắc dùng CSS Variables semantic tokens (`var(--bg-card)`, `var(--text-main)`, `var(--border-default)`...).
3. **Kiểm tra tính bảo toàn dữ liệu & Rollback:**
   - Thử nghiệm kéo thả thẻ trong điều kiện mạng bình thường và mạng ngắt kết nối để kiểm tra cơ chế Rollback.
4. **Kiểm tra tái sử dụng:**
   - Xác nhận `ProgramGroupModal` hoạt động chính xác trong ngữ cảnh Workspace của Mentor mà không tạo thêm component trùng lặp.
