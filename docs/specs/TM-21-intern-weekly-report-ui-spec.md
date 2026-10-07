# Đặc Tả Kỹ Thuật Giao Diện (Frontend Spec): TM-21 Thực Tập Sinh - Soạn Thảo & Nộp Báo Cáo Tuần (Intern Weekly Report Workspace)

> **Trạng thái tài liệu:** DRAFT / SẴN SÀNG CHỜ PHÊ DUYỆT (PENDING APPROVAL)  
> **Lưu trữ tại:** `InternHub-Frontend/docs/specs/TM-21-intern-weekly-report-ui-spec.md`  
> **Dự án:** [InternHub-Frontend](file:///d:/codegym_final_project/InternHub-Frontend) (React 19, TypeScript, Vite, CSS Modules)  
> **Tương thích Backend:** [InternHub Backend TM-21](file:///d:/codegym_final_project/InternHub/docs/specs/TM-21-intern-weekly-report-spec.md) (`intern-and-program-service`, `api-gateway`)  
> **Mã Jira Ticket:** [TM-21](https://robluccibn9935.atlassian.net/browse/TM-21)  
> **Tiêu đề Jira:** *Intern - Soạn thảo và nộp báo cáo tuần (Weekly Report Creation & Submission)*  
> **Nhánh Git dự kiến:** `feature/TM-21/intern-weekly-report-frontend`  
> **Cấp độ thay đổi (Change Level):** **L3** (Xây dựng phân hệ Báo cáo tuần & Trục thời gian thực tập cho Thực tập sinh, kết nối gợi ý Kanban TM-20, modal xác nhận nộp, tích hợp API Backend TM-21).  
> **Tuân thủ quy chuẩn:** Tuân thủ 100% [AGENTS.md](file:///d:/codegym_final_project/InternHub-Frontend/AGENTS.md) (34 nguyên tắc bất biến của Frontend), tài liệu [08-ui-ux-guidelines.md](file:///d:/codegym_final_project/InternHub-Frontend/.agents/08-ui-ux-guidelines.md) và kỹ năng thiết kế chuyên sâu [Frontend Design](file:///d:/codegym_final_project/InternHub-Frontend/.agents/skills/frontend-design/SKILL.md).

---

## 0. Nhật Ký Thay Đổi & Giải Trình Kỹ Thuật (Revision History & Change Rationale)

> [!IMPORTANT]
> **BẮT BUỘC ĐIỀN ĐẦY ĐỦ**: Bất kể khi nào Lập trình viên hay AI Agent thay đổi mã nguồn ảnh hưởng đến logic, giao diện, API, routing hay modal (từ cấp độ L2 trở lên), **bắt buộc** phải ghi thêm một dòng vào bảng này để giải trình lý do trước khi hoàn tất nhiệm vụ (Tuân thủ Rule 30).

| Phiên bản | Ngày | Người thực hiện | Task / Jira | Loại thay đổi | Lý do & Giải trình kỹ thuật (Rationale) |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **v1.0.0** | 2026-10-07 | AI Senior Pair-Programmer | `TM-21` | Tạo mới đặc tả Frontend | Khởi tạo tài liệu đặc tả kỹ thuật Frontend cho TM-21 dựa trên Backend TM-21 đã nghiệm thu (100% pass 7 unit tests). Áp dụng triết lý **Frontend Design** (Editorial Reflection Workspace & Learning Journey Timeline Rail) và **34 nguyên tắc Frontend**: Trục thời gian tiến độ (Timeline Rail), 4 trụ cột báo cáo tuần, tích hợp tự động lấy dữ liệu từ bảng Kanban TM-20, Modal xác nhận nộp chính thức, xử lý đủ 5 trạng thái giao diện, đảm bảo tính bất biến (khóa báo cáo khi Mentor đã công bố đánh giá), 100% CSS Variables từ `src/index.css`. |

---

## 1. Feature Overview & Tuyên Ngôn Nghiệp Vụ Cốt Lõi

- **Mã tính năng:** TM-21 (Intern Weekly Report Workspace & Submission).
- **Phân hệ người dùng:** Dành riêng cho Thực tập sinh (`ROLE_INTERN` / `ROLE_USER`) và Quản trị viên (`ADMIN`).
- **Tuyên ngôn nghiệp vụ cốt lõi (Core Business Statement):**
  > **"BÁO CÁO TUẦN LÀ KHÔNG GIAN ĐÚC KẾT HỌC TẬP VÀ PHẢN ÁNH THỰC TẾ TIẾN ĐỘ CỦA THỰC TẬP SINH GỬI TỚI MENTOR"**
  >
  > - **Thực tập sinh ([TM-21](file:///d:/codegym_final_project/InternHub/docs/specs/TM-21-intern-weekly-report-spec.md)):** Sau 1 tuần làm việc, kéo thẻ Kanban ([TM-20](file:///d:/codegym_final_project/InternHub/docs/specs/TM-20-intern-update-task-progress-spec.md)) và giải quyết các bài toán kỹ thuật, TTS cần một không gian làm việc tập trung để:
  >   1. **Theo dõi Trục hành trình thực tập (Learning Journey Timeline):** Nắm rõ vị trí tuần hiện tại trong toàn bộ kỳ thực tập, trạng thái các tuần trước (`CHƯA NỘP`, `BẢN NHÁP`, `ĐÃ NỘP`, `ĐÃ ĐÁNH GIÁ`) kèm điểm số định kỳ.
  >   2. **Liên kết thông minh với Bảng Kanban TM-20:** Bấm 1 nút để tự động nhập danh sách nhiệm vụ đã hoàn thành (`COMPLETED`) và nhiệm vụ dở dang (`IN_PROGRESS`/`TODO`) vào báo cáo, không mất công gõ tay thủ công.
  >   3. **Soạn thảo 4 Trụ cột phản tư chuyên sâu:**
  >      - **Trụ cột 1:** Nhiệm vụ đã hoàn thành (`completedTasksSummary`)
  >      - **Trụ cột 2:** Nhiệm vụ chưa hoàn thành & Lý do chậm tiến độ (`unfinishedTasksSummary`)
  >      - **Trụ cột 3:** Khó khăn, vướng mắc & Đề xuất hỗ trợ kỹ thuật (`difficultiesAndChallenges`)
  >      - **Trụ cột 4:** Kiến thức & Bài học chuyên môn mới thu nạp (`learningsAndKnowledge`)
  >   4. **Lưu nháp & Nộp chính thức:** Hỗ trợ lưu nháp an toàn bất kỳ lúc nào; khi nộp chính thức, hệ thống gửi thông báo thời gian thực đến Mentor.
  >   5. **Quy tắc bất biến (Immutability):** Báo cáo có thể chỉnh sửa sau khi nộp, nhưng sẽ bị khóa cứng (Read-Only) ngay khi Mentor công bố đánh giá (`PUBLISHED`). Khi đó, màn hình sẽ vinh danh nhận xét và điểm số của Mentor.
  > - **Mentor ([TM-22](file:///d:/codegym_final_project/InternHub/docs/specs/TM-22-mentor-review-weekly-report-spec.md)):** Xem báo cáo và chấm điểm phản hồi (thuộc phạm vi phân hệ TM-22 riêng biệt).

---

## 2. Khảo Sát Hiện Trạng Mã Nguồn & Đánh Giá Tái Sử Dụng (Rule 15)

> [!CAUTION]
> ### CHỈ THỊ BẮT BUỘC (MANDATORY DIRECTIVE)
> **"ĐẢM BẢO SẼ QUÉT DỰ ÁN, TRÁNH VIỆC TẠO THÊM CODE MỚI KHÔNG CẦN THIẾT, SỬ DỤNG TỐI ĐA NHỮNG GÌ ĐÃ CÓ ĐỂ PHÁT TRIỂN"**

Sau khi khảo sát toàn bộ dự án `InternHub-Frontend`, phương án tái sử dụng được thiết lập như sau:

### 2.1. Thành Phần Tái Sử Dụng 100% (Zero Redundancy)

| Danh mục | Thành phần hiện có | Kế hoạch tái sử dụng cho TM-21 |
| :--- | :--- | :--- |
| **Common UI** | [Modal](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Modal) | Tái sử dụng cho Modal xác nhận nộp (`SubmitConfirmationModal`) và Modal gợi ý nhiệm vụ (`SuggestedTasksModal`) theo chuẩn 3 khối: Header cố định, Body cuộn, Sticky Footer. |
| **Common UI** | [Button](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Button) | Tái sử dụng cho các nút "Lưu nháp", "Nộp báo cáo", "Gợi ý từ Kanban", "Thử lại", hỗ trợ loading spinner và khóa double-click. |
| **Common UI** | [Skeleton](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Skeleton) | Tái sử dụng để hiển thị Skeleton Shimmer khi đang tải dữ liệu timeline và chi tiết tuần (chống giật CLS - Rule 32). |
| **Common UI** | [Alert](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Alert) | Tái sử dụng cho cảnh báo báo cáo đã khóa, lỗi kết nối hoặc nhắc nhở hạn chót. |
| **Common UI** | [ErrorBoundary](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/ErrorBoundary) | Bao bọc toàn bộ trang `InternWeeklyReportPage` chống sập trắng màn hình (Rule 24). |
| **Layout & Shell** | [Header](file:///d:/codegym_final_project/InternHub-Frontend/src/components/layout/Header.tsx) | Header chuẩn cấp 1 của dashboard với title và subtitle. |
| **Design Tokens** | [index.css](file:///d:/codegym_final_project/InternHub-Frontend/src/index.css) | Tái sử dụng 100% biến CSS ngữ nghĩa (`--bg-body`, `--bg-card`, `--text-main`, `--text-secondary`, `--primary`, `--emerald-gradient`, `--border-default`). Tuyệt đối không hardcode hex (Rule 28). |
| **Utilities** | [formatters.ts](file:///d:/codegym_final_project/InternHub-Frontend/src/utils/formatters.ts) | Tái sử dụng `formatDate`, `formatDateTime` định dạng ngày tháng hiển thị tuần. |
| **Toast UX** | `sonner` (`toast.success`, `toast.error`, `toast.warning`) | Thông báo tức thời khi lưu nháp hoặc nộp báo cáo thành công. |
| **HTTP Client** | [apiClient & AppError](file:///d:/codegym_final_project/InternHub-Frontend/src/services/api.ts) | Kiến trúc Axios 4 tầng có đính kèm JWT Token và hỗ trợ `AbortSignal`. |

### 2.2. Thành Phần Cần Mở Rộng (Extension Without Breaking Changes)

| Thành phần | Đường dẫn | Thay đổi dự kiến |
| :--- | :--- | :--- |
| **Endpoints** | `src/constants/endpoints/intern.endpoints.ts` | Bổ sung các constant endpoint: `MY_WEEKLY_REPORTS_TIMELINE`, `MY_WEEKLY_REPORTS_SUGGESTED_TASKS`, `MY_WEEKLY_REPORT_DETAIL`, `MY_WEEKLY_REPORT_DRAFT`, `MY_WEEKLY_REPORT_SUBMIT`, `MY_WEEKLY_REPORT_UPDATE`. |
| **Routes** | `src/constants/routes/intern.routes.ts` | Bổ sung `WEEKLY_REPORTS: '/intern/weekly-reports'`. |
| **Sidebar Menu** | `src/components/layout/Sidebar.tsx` | Bổ sung mục `"Báo Cáo Tuần"` (Icon: `CalendarCheck2` hoặc `FileText`) trong phân hệ Thực tập sinh. |
| **App Routing** | `src/routes/AppRoutes.tsx` | Đăng ký route `<Route path={ROUTES.INTERN.WEEKLY_REPORTS} element={<InternWeeklyReportPage />} />`. |
| **Trang Kanban TTS** | `src/pages/intern/missions/InternMissionPage.tsx` | Bổ sung nút bấm `"Báo cáo tuần"` (Icon: `FileText` / `BookOpenCheck`) tại thanh công cụ hành động (`actionButtons`), bấm vào sẽ dùng `useNavigate` điều hướng ngay sang `/intern/weekly-reports`. |

### 2.3. Thành Phần Mới Cần Xây Dựng (Specific to TM-21)

Để bảo đảm tính module hóa, không tạo God Files (Rule 20) và quản lý state tinh gọn (Rule 14), các file mới được đặt trong `src/pages/intern/reports/`:
1. `src/types/weeklyReport.types.ts`: Định nghĩa Type/Interface chuẩn hóa đồng bộ với Backend DTO.
2. `src/services/weeklyReportService.ts`: Tầng dịch vụ gọi API Backend TM-21 có `AbortSignal`.
3. `src/hooks/useInternWeeklyReport.ts`: Custom Hook điều phối dữ liệu timeline, nạp gợi ý Kanban, lưu nháp/nộp.
4. `src/pages/intern/reports/InternWeeklyReportPage.tsx`: Trang chính kết hợp Standard Page Composition 4 lớp.
5. `src/pages/intern/reports/components/WeeklyTimelineRail/`: Thanh trượt/cột danh sách các tuần trong kỳ thực tập.
6. `src/pages/intern/reports/components/MentorFeedbackShowcase/`: Khối vinh danh nhận xét & điểm số khi Mentor đã publish.
7. `src/pages/intern/reports/components/ReportPillarEditor/`: Khối soạn thảo 4 trụ cột có gợi ý hướng dẫn và bộ đếm ký tự.
8. `src/pages/intern/reports/components/SuggestedTasksModal/`: Modal xem và chọn chèn các task Kanban TM-20.
9. `src/pages/intern/reports/components/SubmitConfirmationModal/`: Modal xác nhận nộp chính thức an toàn.

---

## 3. Triết Lý Thiết Kế Visual & UX (Áp Dụng Skill Frontend Design & 08-ui-ux-guidelines.md)

### 3.1. Bản Sắc Thiết Kế (Subject Matter Identity)
- **Đối tượng:** Sinh viên thực tập công nghệ / Kỹ sư phần mềm tập sự.
- **Bản chất công việc:** Đây là một **Editorial Learning Canvas (Bàn làm việc đúc kết học tập)**. Giao diện phải mang cảm giác nghiêm túc, khích lệ tư duy phản biện, chứ không phải một biểu mẫu hành chính khô cứng hay một form khảo sát tầm thường.
- **"Spend your boldness in one place" (Dành sự táo bạo cho một điểm nhấn chính):** Điểm nhấn thị giác là **Trục thời gian thực tập (Learning Journey Rail)** kết hợp với **Khung phản tư 4 trụ cột (4-Pillar Reflection Canvas)**. Mỗi tuần là một cột mốc trong hành trình trưởng thành nghề nghiệp.

### 3.2. Bảng Màu Ngữ Nghĩa & Design Tokens
Tuân thủ 100% biến ngữ nghĩa từ `src/index.css`:
- **Nền chính:** `var(--bg-body)` và `var(--bg-card)`.
- **Đường viền:** `var(--border-default)` và `var(--border-subtle)`.
- **Màu trạng thái tuần:**
  - `NOT_SUBMITTED`: Badge xám nhạt (`var(--text-muted)`), viền nét đứt.
  - `DRAFT`: Badge vàng cam (`var(--warning)`, nền `var(--warning-bg)`).
  - `SUBMITTED`: Badge xanh dương công nghệ (`var(--primary)`, nền `var(--primary-light)`).
  - `REVIEWED`: Badge xanh ngọc lục bảo (`var(--success)`, nền `var(--success-bg)`) kèm biểu tượng sao điểm số.
- **4 Khối Trụ Cột:**
  - Trụ cột 1 (Hoàn thành): Viền điểm xuyết xanh ngọc (`var(--success)`), icon `CheckCircle2`.
  - Trụ cột 2 (Chưa xong): Viền điểm xuyết cam vàng (`var(--warning)`), icon `Clock`.
  - Trụ cột 3 (Khó khăn): Viền điểm xuyết đỏ dịu (`var(--danger)`), icon `AlertTriangle`.
  - Trụ cột 4 (Kiến thức mới): Viền điểm xuyết tím chàm (`var(--primary)`), icon `Sparkles` / `Lightbulb`.

### 3.3. Typography & Trải Nghiệm Nhập Liệu
- Font chữ: `var(--font-heading)` cho tiêu đề tuần và `var(--font-sans)` cho nội dung soạn thảo.
- Độ dài dòng chữ (Line length): Khống chế `< 80` ký tự cho mô tả hướng dẫn để tối ưu khả năng đọc hiểu.
- Các ô Textarea hỗ trợ:
  - Viền đổi màu mượt sang `var(--primary)` kèm viền hào quang ánh sáng (`box-shadow: 0 0 0 3px var(--primary-glow)`) khi focus (Rule 30).
  - Placeholder chứa câu hỏi gợi mở định hướng (Prompt Questions). Ví dụ: *"Bạn đã học được cú pháp, thư viện hay tư duy kiến trúc nào mới trong tuần này? Hãy ghi lại các điểm nhấn kỹ thuật..."*
  - Bộ đếm ký tự trực quan và tự động mở rộng độ cao theo nội dung.

---

## 4. Kiến Trúc Kỹ Thuật & Luồng Dữ Liệu Chi Tiết

### 4.1. Kiến Trúc Axios 4 Tầng
```text
1. Endpoints: INTERN_ENDPOINTS (MY_WEEKLY_REPORTS_*)
       ↓
2. HTTP Client: apiClient (Axios instance với Interceptor Bearer JWT & AppError)
       ↓
3. Domain Service: weeklyReportService (hỗ trợ AbortSignal cho mọi request GET)
       ↓
4. Custom Hook: useInternWeeklyReport (quản lý state, AbortController, validation & mutation)
       ↓
5. Presentation: InternWeeklyReportPage & Sub-components (CSS Modules)
```

### 4.2. Khế Ước Dữ Liệu (TypeScript Interfaces)

```typescript
export type WeeklyReportStatus = 'NOT_SUBMITTED' | 'DRAFT' | 'SUBMITTED' | 'REVIEWED';

export interface WeeklyReportTimelineItem {
  weekNumber: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: WeeklyReportStatus;
  submittedAt: string | null;
  isCurrentWeek: boolean;
  isEditable: boolean;
  score: number | null;
  hasAssessment: boolean;
}

export interface WeeklyReportTaskItem {
  id?: number;
  missionItemId: number;
  taskTitle: string;
  taskStatus: string; // 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
  taskType: string;
  submissionUrl?: string | null;
  completionNote?: string | null;
}

export interface SuggestedKanbanTaskItem {
  missionItemId: number;
  taskTitle: string;
  taskStatus: string;
  taskType: string;
  submissionUrl?: string | null;
  completionNote?: string | null;
}

export interface SuggestedKanbanTasksResponse {
  completedTasks: SuggestedKanbanTaskItem[];
  unfinishedTasks: SuggestedKanbanTaskItem[];
}

export interface WeeklyReportDetail {
  id: number | null;
  weekNumber: number;
  startDate: string;
  endDate: string;
  status: WeeklyReportStatus;
  completedTasksSummary: string;
  unfinishedTasksSummary: string;
  difficultiesAndChallenges: string;
  learningsAndKnowledge: string;
  submittedAt: string | null;
  isEditable: boolean;
  tasks: WeeklyReportTaskItem[];
  mentorFeedback?: string | null;
  mentorScore?: number | null;
  mentorName?: string | null;
  reviewedAt?: string | null;
}

export interface SaveWeeklyReportPayload {
  completedTasksSummary: string;
  unfinishedTasksSummary: string;
  difficultiesAndChallenges: string;
  learningsAndKnowledge: string;
  tasks?: WeeklyReportTaskItem[];
}
```

---

## 5. Cấu Trúc Bố Cục Giao Diện (Layout Architecture)

Áp dụng chuẩn **Standard Page Composition 4 lớp**:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Lớp 1: Header Bar (Title: Báo Cáo Tuần, Subtitle: Đúc kết tiến độ)      │
├────────────────────────────────────────────────────────────────────────┤
│ Lớp 2: Metrics Strip (Tổng số tuần, Đã nộp, Đang nháp, Điểm trung bình)│
├──────────────────────────────────┬─────────────────────────────────────┤
│ Lớp 3A: Weekly Timeline Rail     │ Lớp 3B: Active Reflection Canvas    │
│ (Trục thời gian các tuần)        │ - Banner Trạng Thái & Hạn Chót      │
│ - Tuần 1: Đã đánh giá (⭐ 4.8)   │ - Showcase Nhận xét của Mentor      │
│ - Tuần 2: [Đang chọn] (Bản nháp) │ - Toolbar: [Gợi ý từ Kanban TM-20]  │
│ - Tuần 3: Chưa nộp               │ - 4 Khối Trụ Cột Soạn Thảo          │
│ - Tuần 4..12: Khóa tương lai     │ - Sticky Action Bar: [Lưu] [Nộp]   │
├──────────────────────────────────┴─────────────────────────────────────┤
│ Lớp 4: Modals (Gợi ý Kanban Modal, Xác nhận nộp chính thức Modal)     │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.1. Bố Cục Đáp Ứng Đa Thiết Bị (Responsive - Rule 34)
- **Desktop (>= 1024px):** Layout 2 cột (Cột trái 280px cố định trục Timeline Rail, Cột phải tự co giãn làm Canvas soạn thảo).
- **Tablet (768px - 1023px):** Trục Timeline Rail chuyển thành thanh trượt ngang có thể cuộn (`overflow-x: auto`) ở trên cùng; Canvas soạn thảo ở dưới.
- **Mobile (< 768px):** Thanh chọn tuần dạng Dropdown hoặc cuộn ngang pill tabs; các khối soạn thảo xếp chồng dọc dễ thao tác ngón tay (Touch target >= 44px).

---

## 6. Xử Lý 5 Trạng Thái Giao Diện Bắt Buộc (Rule 32)

1. **Trạng thái Đang tải (Skeleton Loading):** Khi đang gọi API lấy timeline hoặc chi tiết tuần, hiển thị Skeleton Shimmer mô phỏng Trục thời gian và 4 thẻ soạn thảo, cấm dùng spinner đơn điệu giật layout.
2. **Trạng thái Trống (Empty State):** Khi sinh viên chưa được xếp vào Chương trình thực tập hoặc chưa có ngày bắt đầu: Hiển thị icon minh họa `CalendarOff`, tiêu đề thông báo và nút CTA liên hệ HR/Mentor.
3. **Trạng thái Lỗi có nút Thử lại (Error State with Retry):** Khi mất kết nối máy chủ hoặc API lỗi: Hiển thị `Alert type="error"` kèm nút "Thử lại" gọi hàm reload.
4. **Trạng thái Thành công (Success Feedback):** Khi lưu nháp hoặc nộp bài thành công: Hiển thị thông báo Toast `sonner` nổi bật, cập nhật ngay badge trạng thái trên timeline mà không cần F5 trang.
5. **Trạng thái Vô hiệu hóa (Disabled / Locked State):** Khi báo cáo đã được Mentor công bố đánh giá (`REVIEWED`) hoặc tuần trong tương lai:
   - Các ô Textarea chuyển sang chế độ `readOnly`.
   - Các nút Lưu / Nộp bị disable kèm tooltip giải thích lý do.
   - Hiển thị Alert thông tin: *"Báo cáo tuần này đã được Mentor hoàn tất đánh giá và khóa chỉnh sửa."*

---

## 7. Kế Hoạch Kiểm Thử & Nghiệm Thu Giao Diện (Verification Plan)

| STT | Kịch Bản Kiểm Thử | Hành Động & Kỳ Vọng | Kết Quả |
| :---: | :--- | :--- | :---: |
| 1 | **Hiển thị Timeline các tuần** | Vào màn hình `/intern/weekly-reports`, nạp danh sách tuần chính xác, highlight đúng tuần hiện tại. | Chờ kiểm thử |
| 2 | **Chuyển đổi tuần** | Click chọn tuần khác, nạp chi tiết báo cáo tuần tương ứng mà không làm giật giao diện. | Chờ kiểm thử |
| 3 | **Gợi ý nhiệm vụ Kanban** | Bấm nút "Gợi ý từ Kanban", modal mở ra phân loại rõ `completedTasks` và `unfinishedTasks`, bấm chèn sẽ tự động điền vào 2 trụ cột tương ứng. | Chờ kiểm thử |
| 4 | **Lưu nháp báo cáo** | Nhập nội dung, bấm "Lưu nháp", gọi API `/draft` thành công, toast thông báo, trạng thái tuần chuyển sang `DRAFT`. | Chờ kiểm thử |
| 5 | **Nộp chính thức báo cáo** | Bấm "Nộp báo cáo", mở `SubmitConfirmationModal`, xác nhận nộp, gọi API `/submit`, trạng thái chuyển sang `SUBMITTED`. | Chờ kiểm thử |
| 6 | **Khóa báo cáo khi đã đánh giá** | Chọn tuần có trạng thái `REVIEWED`, form bị khóa read-only, hiển thị khối nhận xét và điểm số của Mentor. | Chờ kiểm thử |
| 7 | **Chặn tuần tương lai** | Chọn tuần vượt quá thời gian thực tế, nút nộp bị khóa và có thông báo rõ ràng. | Chờ kiểm thử |
| 8 | **Đồng bộ Theme Dark/Light** | Chuyển đổi giao diện sáng/tối, màu sắc thích ứng hoàn hảo qua CSS Variables, tương phản WCAG AA. | Chờ kiểm thử |
