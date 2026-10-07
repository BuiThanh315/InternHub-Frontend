# Đặc Tả Kỹ Thuật Giao Diện (Frontend Spec): TM-22 Mentor - Xem Báo Cáo Tuần & Đánh Giá Phản Hồi (Mentor Weekly Report Review & Assessment Workspace)

> **Trạng thái tài liệu:** DRAFT / SẴN SÀNG CHỜ PHÊ DUYỆT (PENDING APPROVAL)  
> **Lưu trữ tại:** `InternHub-Frontend/docs/specs/TM-22-mentor-review-weekly-report-ui-spec.md`  
> **Dự án:** [InternHub-Frontend](file:///d:/codegym_final_project/InternHub-Frontend) (React 19, TypeScript, Vite, CSS Modules)  
> **Tương thích Backend:** [InternHub Backend TM-22](file:///d:/codegym_final_project/InternHub/docs/specs/TM-22-mentor-review-weekly-report-spec.md) (`intern-and-program-service`, `api-gateway`)  
> **Mã Jira Ticket:** [TM-22](https://robluccibn9935.atlassian.net/browse/TM-22)  
> **Tiêu đề Jira:** *Mentor - Xem Báo Cáo Tuần & Đánh Giá Phản Hồi (Mentor Weekly Report Review & Assessment Workspace)*  
> **Nối tiếp trực tiếp:** [TM-21 Frontend (TTS nộp báo cáo tuần)](file:///d:/codegym_final_project/InternHub-Frontend/docs/specs/TM-21-intern-weekly-report-ui-spec.md) & [TM-20 (Kanban tasks)](file:///d:/codegym_final_project/InternHub/docs/specs/TM-20-intern-update-task-progress-spec.md)  
> **Nhánh Git dự kiến:** `feature/TM-22/mentor-review-weekly-report-frontend`  
> **Cấp độ thay đổi (Change Level):** **L3** (Mở rộng Drawer chi tiết TTS thành Không gian đối soát song song Dual-Pane, tích hợp API đối soát tuần và snapshot tasks của TTS, modal yêu cầu chỉnh sửa báo cáo `revisionNote`, cơ chế đồng bộ chấm điểm 4 tiêu chí rubrics và công bố đánh giá thời gian thực).  
> **Tuân thủ quy chuẩn:** Tuân thủ 100% [AGENTS.md](file:///d:/codegym_final_project/InternHub-Frontend/AGENTS.md) (34 nguyên tắc bất biến của Frontend), tài liệu [08-ui-ux-guidelines.md](file:///d:/codegym_final_project/InternHub-Frontend/.agents/08-ui-ux-guidelines.md) và kỹ năng thiết kế chuyên sâu [Frontend Design](file:///d:/codegym_final_project/InternHub-Frontend/.agents/skills/frontend-design/SKILL.md).

---

## 0. Nhật Ký Thay Đổi & Giải Trình Kỹ Thuật (Revision History & Change Rationale)

> [!IMPORTANT]
> **BẮT BUỘC ĐIỀN ĐẦY ĐỦ**: Bất kể khi nào Lập trình viên hay AI Agent thay đổi mã nguồn ảnh hưởng đến logic, giao diện, API, routing hay modal (từ cấp độ L2 trở lên), **bắt buộc** phải ghi thêm một dòng vào bảng này để giải trình lý do trước khi hoàn tất nhiệm vụ (Tuân thủ Rule 30).

| Phiên bản | Ngày | Người thực hiện | Task / Jira | Loại thay đổi | Lý do & Giải trình kỹ thuật (Rationale) |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **v1.0.0** | 2026-10-07 | AI Senior Pair-Programmer & User | `TM-22` | Tạo mới đặc tả Frontend | Khởi tạo tài liệu đặc tả kỹ thuật Frontend cho TM-22 dựa trên kế hoạch tiền-spec đã được Người dùng phê duyệt ([TM-22-frontend-pre-spec-discovery-plan.md](file:///C:/Users/admin/.gemini/antigravity-ide/brain/8646417a-8040-456e-a314-c050b7bac2bd/TM-22-frontend-pre-spec-discovery-plan.md)) và Backend TM-22 đã nghiệm thu (100% pass 7 unit tests). Áp dụng kiến trúc **Đối soát song song Dual-Pane Inspection Workspace**: Panel trái hiển thị 4 trụ cột báo cáo của TTS và snapshot tasks kèm link PR; Panel phải hiển thị form chấm điểm 4 sao rubrics, smart templates và nhận xét của Mentor. Bổ sung Modal yêu cầu làm lại báo cáo (`MentorRequestRevisionModal`). Khống chế nghiêm ngặt state $\le 3-4$ theo Rule 14, 100% CSS Variables từ `src/index.css`. |

---

## 1. Feature Overview & Tuyên Ngôn Nghiệp Vụ Cốt Lõi

- **Mã tính năng:** TM-22 (Mentor Weekly Report Review & Assessment Workspace).
- **Phân hệ người dùng:** Dành riêng cho Người hướng dẫn (`ROLE_MENTOR`), Giám sát nhân sự (`ROLE_HR`) và Quản trị viên (`ROLE_ADMIN`).
- **Tuyên ngôn nghiệp vụ cốt lõi (Core Business Statement):**
  > **"ĐỐI SOÁT VÀ PHẢN HỒI BÁO CÁO TUẦN LÀ ĐIỂM TỰA NÂNG CAO NĂNG LỰC THỰC TẬP SINH. NƠI MENTOR NHÌN RÕ MỌI NỖ LỰC, ĐỐI CHIẾU SỐ LIỆU MINH BẠCH VÀ ĐƯA RA CHỈ DẪN KỊP THỜI ĐỂ GIÚP THỰC TẬP SINH TIẾN BỘ TỪNG NGÀY."**
  >
  > - **Thực tập sinh ([TM-21](file:///d:/codegym_final_project/InternHub-Frontend/docs/specs/TM-21-intern-weekly-report-ui-spec.md)):** Soạn thảo và nộp báo cáo 4 trụ cột phản tư đính kèm snapshot tasks từ Kanban TM-20.
  > - **Mentor ([TM-22](file:///d:/codegym_final_project/InternHub/docs/specs/TM-22-mentor-review-weekly-report-spec.md)):**
  >   1. **Xóa bỏ tình trạng "đánh giá mù" (Zero Blind Evaluation):** Cung cấp không gian đối soát song song (Dual-Pane) ngay trong Drawer chi tiết TTS. Một bên là báo cáo thực tế của TTS, một bên là thang điểm rubrics và ô nhập góp ý của Mentor.
  >   2. **Kiểm tra minh chứng công việc:** Đọc trực tiếp danh sách tasks kéo từ Kanban kèm link PR/commit của TTS để kiểm chứng chất lượng và tiến độ.
  >   3. **Chấm điểm 4 tiêu chí rubrics chuẩn hóa:** Kỹ năng chuyên môn, Thái độ & Tác phong, Giao tiếp & Đồng đội, Tiến độ hoàn thành (thang điểm 1–5 sao). Tính điểm trung bình chuẩn thời gian thực.
  >   4. **Áp dụng Smart Templates:** Click 1 chạm để áp dụng nhận xét mẫu nhanh chóng (*Xuất sắc 5⭐*, *Đạt yêu cầu 4⭐*, *Cần cải thiện 2-3⭐*).
  >   5. **Cơ chế Kiểm soát chất lượng (Quality Gate):** Nếu báo cáo sơ sài hoặc sai lệch, Mentor có quyền bấm *"Yêu cầu chỉnh sửa lại"* (`REVISION_REQUESTED`) kèm ghi chú cụ thể. Hệ thống sẽ mở khóa cho TTS sửa và gửi thông báo tức thời.
  >   6. **Tính linh hoạt cao:** Nếu TTS chưa nộp báo cáo, Mentor vẫn có thể chủ động đánh giá chuyên cần cho tuần đó. Mentor có quyền cập nhật lại đánh giá tuần đã công bố trong suốt kỳ thực tập.

---

## 2. Khảo Sát Hiện Trạng Mã Nguồn & Đánh Giá Tái Sử Dụng (Rule 15 - Reuse First)

> [!CAUTION]
> ### CHỈ THỊ BẮT BUỘC (MANDATORY DIRECTIVE)
> **"ĐẢM BẢO SẼ QUÉT DỰ ÁN, TRÁNH VIỆC TẠO THÊM CODE MỚI KHÔNG CẦN THIẾT, SỬ DỤNG TỐI ĐA NHỮNG GÌ ĐÃ CÓ ĐỂ PHÁT TRIỂN"**

Sau khi khảo sát toàn bộ dự án `InternHub-Frontend`, phương án tái sử dụng được thiết lập như sau:

### 2.1. Thành Phần Tái Sử Dụng 100% (Zero Redundancy)

| Danh mục | Thành phần hiện có | Kế hoạch tái sử dụng cho TM-22 |
| :--- | :--- | :--- |
| **Common UI** | [Modal](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Modal) | Tái sử dụng cho Modal yêu cầu chỉnh sửa báo cáo (`MentorRequestRevisionModal`) với cấu trúc 3 khối: Header cố định, Body cuộn, Sticky Footer. |
| **Common UI** | [Button](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Button) | Nút bấm "Lưu nháp", "Gửi đánh giá cho TTS", "Yêu cầu chỉnh sửa lại", "Hủy bỏ", hỗ trợ spinner và chống double-click. |
| **Common UI** | [Badge](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Badge) | Hiển thị badge trạng thái báo cáo tuần (`SUBMITTED`, `REVISION_REQUESTED`, `REVIEWED`, `DRAFT`, `NOT_SUBMITTED`). |
| **Common UI** | [Skeleton](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Skeleton) | Tái sử dụng để hiển thị Skeleton Shimmer 2 cột song song khi đang tải dữ liệu tuần (chống giật layout CLS - Rule 32). |
| **Common UI** | [Alert](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Alert) | Cảnh báo khi TTS chưa nộp báo cáo tuần này, cảnh báo báo cáo đang bị yêu cầu sửa lại, hoặc thông báo báo cáo đã hoàn tất đánh giá. |
| **Common UI** | [ErrorBoundary](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/ErrorBoundary) | Bao bọc toàn bộ khối đánh giá tuần trong Drawer nhằm cô lập lỗi runtime (Rule 24). |
| **Layout & Shell** | [Header](file:///d:/codegym_final_project/InternHub-Frontend/src/components/layout/Header.tsx) | Header của `MentorDashboard` sẵn có. |
| **Design Tokens** | [index.css](file:///d:/codegym_final_project/InternHub-Frontend/src/index.css) | Tái sử dụng 100% biến CSS ngữ nghĩa (`--bg-body`, `--bg-card`, `--text-main`, `--text-secondary`, `--primary`, `--warning`, `--danger`, `--success`, `--border-default`). Tuyệt đối không hardcode hex (Rule 28). |
| **Utilities** | [formatters.ts](file:///d:/codegym_final_project/InternHub-Frontend/src/utils/formatters.ts) | Tái sử dụng `formatDate`, `formatDateTime` định dạng ngày tháng nộp báo cáo. |
| **Toast UX** | `sonner` (`toast.success`, `toast.error`, `toast.info`) | Thông báo tức thời khi lưu nháp, gửi đánh giá hoặc gửi yêu cầu revision thành công. |
| **HTTP Client** | [apiClient & AppError](file:///d:/codegym_final_project/InternHub-Frontend/src/services/api.ts) | Kiến trúc Axios 4 tầng có đính kèm JWT Token và hỗ trợ `AbortSignal`. |

### 2.2. Thành Phần Cần Mở Rộng & Kế Thừa (Extension)

| Thành phần | Đường dẫn | Thay đổi dự kiến |
| :--- | :--- | :--- |
| **Endpoints** | `src/constants/endpoints/intern.endpoints.ts` | Bổ sung các constant endpoint:<br>• `MENTOR_WEEKLY_REPORT_REVIEW: (internCode, weekNumber) => ...`<br>• `MENTOR_REQUEST_REPORT_REVISION: (internCode, weekNumber) => ...` |
| **Types** | `src/types/weeklyReport.types.ts` & `src/types/assessment.types.ts` | Mở rộng enum `WeeklyReportStatus` thêm `'REVISION_REQUESTED'`. Thêm interfaces: `MentorWeeklyReportReviewResponse`, `RequestReportRevisionPayload`, `ReportRevisionResponse`. |
| **Services** | `src/services/assessmentService.ts` | Bổ sung 2 phương thức gọi API có `AbortSignal`:<br>• `getMentorWeeklyReportReview()`<br>• `requestReportRevision()` |
| **Drawer TTS** | `src/pages/mentor/components/MentorInternDetailDrawer.tsx` | Điều chỉnh lớp CSS cho phép mở rộng kích thước Drawer khi ở tab Đánh giá tuần (`extra-wide: min(1200px, 95vw)`). |
| **Evaluation Hub** | `src/pages/mentor/components/MentorWeeklyEvaluationHub.tsx` | Tái cấu trúc thành **Panel Bên Phải (Form & Rubrics)**, nạp trước dữ liệu đánh giá đã lưu từ API review khi đổi tuần, tích hợp nút "Yêu cầu chỉnh sửa lại", cho phép cập nhật lại khi đã `PUBLISHED`. |

### 2.3. Thành Phần Mới Cần Xây Dựng (Specific to TM-22)

Để bảo đảm tính module hóa, không tạo God Files (Rule 20) và giới hạn state $\le 3-4$ (Rule 14):
1. `src/pages/mentor/hooks/useMentorWeeklyReview.ts`: Custom Hook điều phối toàn bộ việc tải báo cáo đối soát của TTS, nạp đánh giá tuần, gọi API revision và gọi API assessment, hỗ trợ `AbortController`.
2. `src/pages/mentor/components/MentorWeeklyReportInspectionView.tsx` (và `.module.css`, `.types.ts`): **Panel Bên Trái (Inspection View)** trình bày 4 trụ cột báo cáo của TTS, danh sách snapshot tasks kèm link PR, ngày nộp, trạng thái báo cáo, ghi chú sửa đổi trước đó.
3. `src/pages/mentor/components/MentorRequestRevisionModal.tsx` (và `.module.css`, `.types.ts`): Modal xác nhận và nhập lý do `revisionNote` yêu cầu TTS làm lại báo cáo (tuân thủ Rule 29, 30, 33).

---

## 3. Triết Lý Thiết Kế Visual & UX (Áp Dụng Skill Frontend Design & 08-ui-ux-guidelines.md)

### 3.1. Bản Sắc Thiết Kế (Subject Matter Identity)
- **Đối tượng:** Mentor (Chuyên gia công nghệ / Tech Lead / Kỹ sư phần mềm cao cấp).
- **Bản chất công việc:** Đây là một **Dual-Pane Evaluation Cockpit (Buồng lái đối soát & đánh giá tập trung)**. Mentor cần quét nhanh nội dung báo cáo, đối chiếu minh chứng tasks, chấm điểm và viết nhận xét có trọng lượng chỉ trong vòng 2-3 phút cho mỗi TTS.
- **"Spend your boldness in one place" (Dành sự táo bạo cho một điểm nhấn chính):** Điểm nhấn thị giác là **Bố cục đối soát song song (Dual-Pane Workspace)** với thanh cuộn độc lập cho mỗi bên. Panel trái tập trung vào nội dung học tập và minh chứng của TTS; Panel phải là công cụ chấm điểm với thẻ điểm trung bình nổi bật và các phím tắt template nhận xét thông minh.

### 3.2. Bảng Màu Ngữ Nghĩa & Design Tokens
Tuân thủ 100% biến ngữ nghĩa từ `src/index.css`:
- **Nền chính:** `var(--bg-body)` và `var(--bg-card)`.
- **Đường viền:** `var(--border-default)` và `var(--border-subtle)`.
- **Màu trạng thái tuần của TTS:**
  - `NOT_SUBMITTED`: Badge xám nhạt (`var(--text-muted)`), viền nét đứt.
  - `DRAFT`: Badge vàng cam (`var(--warning)`, nền `var(--warning-bg)`).
  - `SUBMITTED`: Badge xanh dương công nghệ (`var(--primary)`, nền `var(--primary-light)`).
  - `REVISION_REQUESTED`: Badge hổ phách đậm (`var(--warning)`, viền cảnh báo nổi bật).
  - `REVIEWED`: Badge xanh ngọc lục bảo (`var(--success)`, nền `var(--success-bg)`) kèm biểu tượng sao điểm số.
- **4 Khối Trụ Cột Báo Cáo:**
  - Trụ cột 1 (Hoàn thành): Viền điểm xuyết xanh ngọc (`var(--success)`), icon `CheckCircle2`.
  - Trụ cột 2 (Chưa xong): Viền điểm xuyết cam vàng (`var(--warning)`), icon `Clock`.
  - Trụ cột 3 (Khó khăn): Viền điểm xuyết đỏ dịu (`var(--danger)`), icon `AlertTriangle`.
  - Trụ cột 4 (Kiến thức mới): Viền điểm xuyết tím chàm (`var(--primary)`), icon `Sparkles`.

### 3.3. Typography & Trải Nghiệm Nhập Liệu
- Font chữ: `var(--font-heading)` cho tiêu đề tuần và `var(--font-sans)` cho nội dung đánh giá.
- Các ô Textarea hỗ trợ:
  - Viền đổi màu mượt sang `var(--primary)` kèm viền hào quang ánh sáng (`box-shadow: 0 0 0 3px var(--primary-glow)`) khi focus (Rule 30).
  - Bộ đếm ký tự trực quan và tự động mở rộng độ cao theo nội dung.
- Nút sao rubrics: Hiệu ứng phóng to nhẹ (`scale: 1.15`) khi hover, hiển thị màu vàng hổ phách (`#f59e0b`) khi được chọn.

---

## 4. Kiến Trúc Kỹ Thuật & Luồng Dữ Liệu Chi Tiết

### 4.1. Kiến Trúc Axios 4 Tầng
```text
1. Endpoints: INTERN_ENDPOINTS (MENTOR_WEEKLY_REPORT_REVIEW, MENTOR_REQUEST_REPORT_REVISION)
       ↓
2. HTTP Client: apiClient (Axios instance với Interceptor Bearer JWT & AppError)
       ↓
3. Domain Service: assessmentService (hỗ trợ AbortSignal cho mọi request GET)
       ↓
4. Custom Hook: useMentorWeeklyReview (quản lý state, AbortController, validation & mutation)
       ↓
5. Presentation: MentorInternDetailDrawer -> MentorWeeklyEvaluationHub (Dual-Pane CSS Modules)
```

### 4.2. Khế Ước Dữ Liệu (TypeScript Interfaces)

```typescript
// Trạng thái báo cáo tuần của TTS
export type WeeklyReportStatus = 'NOT_SUBMITTED' | 'DRAFT' | 'SUBMITTED' | 'REVISION_REQUESTED' | 'REVIEWED';

// Snapshot task từ Kanban gắn với báo cáo tuần
export interface MentorReportTaskSnapshot {
  id: number;
  missionItemId: number;
  taskTitle: string;
  taskStatus: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  submissionUrl?: string | null;
  note?: string | null;
  isCompleted: boolean;
}

// Báo cáo tuần chi tiết của TTS do Mentor xem
export interface MentorReportDetail {
  id: number;
  reportDate: string; // YYYY-MM-DD
  status: WeeklyReportStatus;
  statusDisplayName: string;
  submittedAt: string | null;
  completedTasksSummary: string;
  unfinishedTasksSummary?: string | null;
  difficultiesAndChallenges?: string | null;
  learningsAndKnowledge?: string | null;
  nextWeekPlan?: string | null;
  reportAttachmentUrl?: string | null;
  revisionNote?: string | null;
  tasks: MentorReportTaskSnapshot[];
}

// Bản ghi đánh giá của Mentor
export interface MentorAssessmentDetail {
  id?: number;
  mentorId?: number;
  mentorName?: string;
  technicalScore: number;
  attitudeScore: number;
  teamworkScore: number;
  productivityScore: number;
  averageScore: number;
  feedback: string;
  nextWeekGoals?: string | null;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string | null;
}

// Response trọn gói từ API GET /api/mentors/my-interns/{internCode}/weekly-reports/{weekNumber}
export interface MentorWeeklyReportReviewResponse {
  internCode: string;
  internName: string;
  programName?: string | null;
  appliedPosition?: string | null;
  weekNumber: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  report: MentorReportDetail | null;
  assessment: MentorAssessmentDetail | null;
}

// Payload gửi yêu cầu làm lại báo cáo
export interface RequestReportRevisionPayload {
  revisionNote: string;
}

// Response sau khi yêu cầu làm lại thành công
export interface ReportRevisionResponse {
  reportId: number;
  internCode: string;
  weekNumber: number;
  status: 'REVISION_REQUESTED';
  revisionNote: string;
  requestedAt: string;
}
```

---

## 5. Cấu Trúc Bố Cục Giao Diện (Layout Architecture)

Áp dụng bố cục **Dual-Pane Cockpit (Hai cột song song)** bên trong Drawer:

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Drawer Header: [Avatar] Nguyễn Văn An • TTS-2026-001 • Backend Java                     [Đóng X]│
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Tab Navigation: [✨ Đánh Giá Tuần (Active)]  [🏆 Tổng Kết Kỳ]  [📁 Hồ Sơ]  [👤 Thông Tin]         │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Week Selector Toolbar:                                                                           │
│ [◀] [Tuần 1] [Tuần 2] [Tuần 3 (Đang chọn)] [Tuần 4] ... [▶]  │ [Trạng thái tuần: Chờ đánh giá]   │
├─────────────────────────────────────────────────┬────────────────────────────────────────────────┤
│ 📋 PANEL TRÁI: ĐỐI SOÁT BÁO CÁO CỦA TTS         │ ⭐ PANEL PHẢI: CHẤM ĐIỂM & NHẬN XÉT CỦA MENTOR │
│ (Cuộn độc lập, max-height calc(100vh - 220px))  │ (Cuộn độc lập, max-height calc(100vh - 220px)) │
│ ─────────────────────────────────────────────── │ ────────────────────────────────────────────── │
│ 1. Header Báo Cáo Tuần:                         │ 1. 4 Tiêu Chí Rubrics (1-5 Sao):               │
│    - Ngày nộp: 07/10/2026 17:30                 │    - Chuyên môn & Kỹ thuật:  ⭐⭐⭐⭐☆ (4/5)   │
│    - Badge: SUBMITTED (Đã nộp)                  │    - Thái độ & Tác phong:    ⭐⭐⭐⭐⭐ (5/5)   │
│    - Banner Revision Note (nếu có)              │    - Giao tiếp & Đồng đội:   ⭐⭐⭐⭐☆ (4/5)   │
│ 2. 4 Trụ Cột Phản Tư:                           │    - Tiến độ hoàn thành:     ⭐⭐⭐⭐☆ (4/5)   │
│    - Trụ cột 1: Công việc đã xong (CheckCircle) │ 2. Thẻ Điểm Trung Bình:                        │
│    - Trụ cột 2: Công việc dở dang (Clock)       │    [ 4.3 / 5.0 ] - Thang điểm 5.0              │
│    - Trụ cột 3: Khó khăn, vướng mắc (Alert)     │ 3. Smart Template Chips:                       │
│    - Trụ cột 4: Kiến thức mới thu nạp (Sparkle) │    [🌟 Xuất sắc] [👍 Đạt] [⚠️ Cần cải thiện]   │
│ 3. Snapshot Tasks từ Kanban:                    │ 4. Nhận xét & Đánh giá chi tiết (*):           │
│    - [DONE] Entity TM-20 [🔗 PR #45] [Note...]  │    [Textarea nhập nhận xét...]                 │
│    - [IN_PROGRESS] Redis Cache [Ghi chú...]     │ 5. Mục tiêu tuần tới (Next-week Goals):        │
│ 4. Link tài liệu đính kèm (nếu có)              │    [Textarea nhập mục tiêu...]                 │
│ 5. Action Bar Panel Trái:                       │ 6. Sticky Footer Panel Phải:                   │
│    [⚠️ Yêu Cầu Chỉnh Sửa Lại (Mở Modal)]        │    [💾 Lưu Nháp]   [🚀 Gửi Đánh Giá Cho TTS]   │
└─────────────────────────────────────────────────┴────────────────────────────────────────────────┘
```

### 5.1. Bố Cục Đáp Ứng Đa Thiết Bị (Responsive - Rule 34)
- **Desktop (>= 1024px):**
  - Drawer mở rộng kích thước: `width: min(1200px, 95vw)`.
  - Hiển thị song song 2 cột (Cột trái 50%, Cột phải 50%) với khoảng cách `gap: 20px`. Cả 2 cột có thanh cuộn riêng biệt (`overflow-y: auto`, Sleek Scrollbar 6px).
- **Tablet (768px - 1023px):**
  - Drawer chiếm `width: 90vw`.
  - Hai panel chuyển sang chế độ xếp chồng dọc (Stacked layout). Panel trái ở trên, Panel phải ở dưới; hoặc có nút chuyển nhanh giữa 2 panel (Tab lồng vi mô: *Xem Báo Cáo* | *Chấm Điểm*).
- **Mobile (< 768px):**
  - Drawer toàn màn hình `width: 100vw`.
  - Dùng Switcher Tab 2 nút ở đầu: `[📋 Báo Cáo TTS]` và `[⭐ Chấm Điểm]`. Cho phép Mentor bấm qua lại dễ dàng trên màn hình điện thoại (Touch target $\ge 44$px).

---

## 6. Xử Lý 5 Trạng Thái Giao Diện Bắt Buộc (Rule 32)

1. **Trạng thái Đang tải (Skeleton Loading):**
   - Khi chuyển tuần hoặc nạp báo cáo, hiển thị Skeleton Shimmer 2 cột song song mô phỏng bố cục Dual-Pane (Panel trái: 4 thẻ chữ nhật; Panel phải: các hàng sao và ô textarea). Cấm dùng spinner đơn điệu giật layout.
2. **Trạng thái Trống khi TTS chưa nộp báo cáo (Empty State with Proactive CTA):**
   - Panel trái hiển thị thẻ thông báo thân thiện:
     - Icon minh họa: `FileQuestion`
     - Tiêu đề: *"Thực tập sinh chưa nộp báo cáo Tuần {weekNumber}"*
     - Hướng dẫn: *"Bạn vẫn có thể chủ động đánh giá chuyên cần và giao mục tiêu tuần tới cho TTS ở bảng bên phải."*
   - Panel phải vẫn mở đầy đủ để Mentor chấm điểm linh hoạt (không bị block).
   - Nút "Yêu cầu chỉnh sửa lại" trên Panel trái tự động ẩn đi vì chưa có báo cáo để yêu cầu sửa.
3. **Trạng thái Đang yêu cầu sửa lại (Revision Requested State):**
   - Panel trái hiển thị Banner màu hổ phách (`var(--warning)`) ở đầu:
     - Icon: `AlertCircle`
     - Tiêu đề: *"Báo cáo đang trong trạng thái Yêu Cầu Chỉnh Sửa"*
     - Nội dung: Hiển thị nguyên văn `revisionNote` mà Mentor đã yêu cầu trước đó.
4. **Trạng thái Lỗi có nút Thử lại (Error State with Retry Action):**
   - Khi xảy ra sự cố API hoặc mất kết nối: Hiển thị `Alert type="error"` kèm nút "Thử lại" gọi lại hook `refetch()`. Không đóng Drawer hay xóa dữ liệu đã nhập (Rule 24).
5. **Trạng thái Thành công (Success Mutation Feedback):**
   - Khi lưu nháp, gửi đánh giá hoặc yêu cầu sửa đổi thành công: Hiển thị thông báo Toast `sonner` nổi bật, cập nhật ngay badge trạng thái và danh sách lịch sử đánh giá mà không cần tải lại toàn bộ trang.

---

## 7. Quy Chuẩn Modal Yêu Cầu Chỉnh Sửa Báo Cáo (Modal-First UX - Rule 29, 33)

Component: `src/pages/mentor/components/MentorRequestRevisionModal.tsx`

### 7.1. Cấu Trúc 3 Khối Chuẩn Hóa
1. **Header Cố Định (Fixed Header):**
   - Tiêu đề: *"Yêu Cầu Chỉnh Sửa Báo Cáo Tuần {weekNumber}"*
   - Subtitle: *"Thực tập sinh: {internName} ({internCode})"*
   - Nút đóng `X` ở góc phải.
2. **Body Cuộn Độc Lập (Scrollable Body):**
   - Hộp cảnh báo màu vàng nhẹ (`var(--warning-bg)`):
     - *"Báo cáo sẽ được chuyển về trạng thái cần chỉnh sửa. Thực tập sinh sẽ nhận được thông báo thời gian thực kèm lý do bên dưới để bổ sung và nộp lại."*
   - Ô nhập liệu Textarea:
     - Nhãn: *"Lý do & Hướng dẫn chỉnh sửa cụ thể"* (bắt buộc `*`)
     - Placeholder: *"Nêu rõ phần nội dung cần bổ sung, minh chứng còn thiếu hoặc lý do chưa đạt yêu cầu (tối thiểu 10 ký tự)..."*
     - Bộ đếm ký tự: `[ 0 / 500 ký tự ]`
     - Focus effect: Viền ngoài đổi màu sang `var(--primary)` kèm hào quang ánh sáng (`box-shadow: 0 0 0 3px var(--primary-glow)`) (Rule 30).
     - Hiển thị lỗi validation `error` rõ ràng nếu người dùng chưa nhập hoặc nhập dưới 10 ký tự.
3. **Sticky Footer Ghim Cố Định (Fixed Sticky Footer):**
   - Nút "Hủy bỏ" (`variant="secondary"`).
   - Nút "Gửi Yêu Cầu Chỉnh Sửa" (`variant="warning"`), hiển thị icon `Send` hoặc `AlertTriangle`, có spinner loader khi đang gửi và khóa chống double-click.

### 7.2. An Toàn Thao Tác & Khả Năng Tiếp Cận (WCAG AA - Rule 33)
- Hỗ trợ phím tắt `Esc` để đóng modal (có cảnh báo nếu đã nhập text chưa gửi).
- Hỗ trợ phím tắt `Enter` (Ctrl + Enter) để submit nhanh.
- Khi gửi thất bại: Giữ nguyên modal và nội dung text đã nhập để người dùng không bị mất công gõ lại (Rule 24).

---

## 8. Quản Lý State Tinh Gọn & Phân Rã Component (Rule 14 & Rule 20)

### 8.1. Đóng Gói State Vào Custom Hook `useMentorWeeklyReview.ts`
Toàn bộ logic kết nối API được cô lập trong Custom Hook:

```typescript
export const useMentorWeeklyReview = (internCode: string, initialWeek: number) => {
  const [selectedWeek, setSelectedWeek] = useState<number>(initialWeek);
  const [data, setData] = useState<MentorWeeklyReportReviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Gọi API review tuần với AbortController
  // Hàm chuyển tuần
  // Hàm lưu nháp / công bố đánh giá
  // Hàm gửi yêu cầu revision

  return {
    selectedWeek,
    setSelectedWeek,
    data,
    loading,
    error,
    isSubmitting,
    handleSaveAssessment,
    handleRequestRevision,
    refetch,
  };
};
```

### 8.2. Giới Hạn State Trong Các Sub-Components ($\le 3-4$ State)
1. **`MentorInternDetailDrawer`:** Chỉ có 1 state `activeTab`.
2. **`MentorWeeklyEvaluationHub`:**
   - State 1: `isRevisionModalOpen: boolean`
   - State 2: `formScores: RubricsState` (object gom 4 điểm rubrics)
   - State 3: `feedbackText: string`
   - State 4: `nextWeekGoalsText: string`
3. **`MentorWeeklyReportInspectionView`:** Hoàn toàn là **Stateless Component** (0 state), nhận thuần túy qua props.
4. **`MentorRequestRevisionModal`:**
   - State 1: `note: string`
   - State 2: `isSubmitting: boolean`
   - State 3: `validationError: string | null`

---

## 9. Kế Hoạch Kiểm Thử & Nghiệm Thu Giao Diện (Verification Plan)

| STT | Kịch Bản Kiểm Thử Giao Diện | Hành Động & Kỳ Vọng | Kết Quả Kỳ Vọng |
| :---: | :--- | :--- | :---: |
| **1** | **Mở Drawer & Xem Bố Cục Dual-Pane** | Click mở chi tiết TTS trên Mentor Dashboard, chọn tab "Đánh Giá Tuần". Drawer mở rộng kích thước lớn, hiển thị đầy đủ 2 cột song song. | Pass |
| **2** | **Chuyển Đổi Giữa Các Tuần** | Click chọn các tuần khác nhau trên thanh công cụ tuần. Skeleton Shimmer hiển thị mượt mà, tải chính xác báo cáo và đánh giá tương ứng của tuần đó. | Pass |
| **3** | **Kiểm Tra Trạng Thái TTS Đã Nộp Báo Cáo** | Chọn tuần có TTS nộp (`SUBMITTED`). Panel trái hiển thị đủ 4 trụ cột phản tư, snapshot tasks có link PR. Panel phải hiển thị form chấm điểm sẵn sàng. | Pass |
| **4** | **Kiểm Tra Trạng Thái TTS Chưa Nộp Báo Cáo** | Chọn tuần chưa nộp. Panel trái hiển thị Empty State hướng dẫn thân thiện, nút "Yêu cầu sửa" ẩn đi. Panel phải vẫn cho phép Mentor chủ động chấm điểm và giao mục tiêu. | Pass |
| **5** | **Yêu Cầu Làm Lại Báo Cáo (Revision Flow)** | Bấm nút "Yêu cầu chỉnh sửa lại", modal mở ra. Nhập lý do hợp lệ ($\ge 10$ ký tự) và bấm gửi. Toast thành công hiển thị, trạng thái chuyển sang `REVISION_REQUESTED`, modal đóng an toàn. | Pass |
| **6** | **Chấm Điểm & Tính Điểm Trung Bình** | Click chọn số sao cho 4 tiêu chí rubrics. Thẻ điểm trung bình cập nhật giá trị chính xác tức thời theo thời gian thực (ví dụ 4, 5, 4, 4 -> 4.3). | Pass |
| **7** | **Áp Dụng Smart Templates** | Bấm các nút template "*Xuất sắc 5⭐*", "*Đạt yêu cầu 4⭐*". Nội dung mẫu tự động điền vào ô nhận xét và mục tiêu tuần tới. | Pass |
| **8** | **Lưu Nháp Đánh Giá** | Nhập nhận xét, bấm "Lưu Nháp". Gọi API với `isPublish = false`, toast thông báo thành công, badge chuyển sang bản nháp. | Pass |
| **9** | **Công Bố Đánh Giá (Publish Flow)** | Bấm "Gửi Đánh Giá Cho TTS" (`isPublish = true`). Báo cáo chuyển sang `REVIEWED`, cập nhật danh sách lịch sử đánh giá. | Pass |
| **10** | **Kiểm Tra Responsive Đa Thiết Bị** | Co nhỏ màn hình xuống Tablet (< 1024px) và Mobile (< 768px). Giao diện tự động thích ứng chuyển sang dạng xếp chồng hoặc tab switch mượt mà, không vỡ layout. | Pass |
| **11** | **Kiểm Tra Đồng Bộ Dark / Light Theme** | Chuyển đổi giao diện Sáng / Tối. Màu sắc thích ứng hoàn hảo qua CSS Variables, không có lỗi chói màu hoặc tương phản thấp (WCAG AA). | Pass |
