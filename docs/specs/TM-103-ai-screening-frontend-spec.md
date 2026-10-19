# Specification: Giao Diện Xét Duyệt Ứng Viên Bằng AI & Thanh Tiến Độ Nền Toàn Cục (TM-103 Frontend)

> **Tài liệu Đặc Tả Kỹ Thuật (Frontend Specification)**  
> **Dự án:** [InternHub-Frontend](file:///d:/codegym_final_project/InternHub-Frontend) (React 19, Vite, TypeScript, CSS Modules)  
> **Mã Jira Ticket:** [TM-103](https://robluccibn9935.atlassian.net/browse/TM-103) - *AI-Powered Intern Application Screening & Floating Progress Indicator*  
> **Trạng thái:** IMPLEMENTED (v1.1)  
> **Lưu trữ tại:** [TM-103-ai-screening-frontend-spec.md](file:///d:/codegym_final_project/InternHub-Frontend/docs/specs/TM-103-ai-screening-frontend-spec.md)  
> **Change Level:** **L3** (Tích hợp AI Screening Copilot: Điều kiện tiên quyết nộp CV & CV Gating, Chọn hàng loạt thông minh trong ApplicationsTab, FloatingProgressWidget góc màn hình không gián đoạn công việc, Tab Dossier phân tích AI chuyên sâu trong DetailInternModal kèm cơ chế Thẩm Định Lại - Re-evaluate).  
> **Tiêu chuẩn tuân thủ:** 34 Nguyên tắc bất biến ([`AGENTS.md`](file:///d:/codegym_final_project/InternHub-Frontend/AGENTS.md)), Quy chuẩn UX/UI ([`08-ui-ux-guidelines.md`](file:///d:/codegym_final_project/InternHub-Frontend/.agents/08-ui-ux-guidelines.md)) & Kỹ năng Thiết kế Giao diện Độc bản ([`frontend-design`](file:///d:/codegym_final_project/InternHub-Frontend/.agents/skills/frontend-design/SKILL.md)).

---

## 0. Nhật Ký Thay Đổi & Giải Trình Kỹ Thuật (Revision History & Change Rationale)

| Phiên bản | Ngày | Người thực hiện | Task / Jira | Loại thay đổi | Lý do & Giải trình kỹ thuật (Rationale) |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **v1.0** | 2026-10-12 | AI Senior Frontend Pair-Programmer & User | `TM-103` | Tạo mới Đặc Tả | Khởi tạo tài liệu đặc tả kỹ thuật Frontend cho tính năng xét duyệt hồ sơ thực tập sinh bằng AI, tích hợp FloatingProgressWidget góc màn hình không chặn thao tác của người dùng, nâng cấp ApplicationsTab và DetailInternModal theo chuẩn `frontend-design`. |
| **v1.1** | 2026-10-19 | AI Senior Frontend Pair-Programmer & User | `TM-103` | Cập nhật CV Gating & Cơ Chế Thẩm Định Lại (Re-evaluate) | Chuẩn hóa tên microservice Backend thành `ai-service` (Port 8086); bổ sung cờ `hasCv` trên `InternProfile`, chặn chọn và vô hiệu hóa nút AI với TTS chưa nộp CV (kèm tooltip cảnh báo); cập nhật Wireframe 1 (Checkbox placeholder, Badge trạng thái CV "Đã nộp CV" / "Chưa có CV", nút Select All chỉ chọn ứng viên có CV); cập nhật Wireframe 3 (Nút `[ 🔄 Thẩm Định Lại ]` & Empty State "Kích Hoạt Thẩm Định AI Ngay"); bổ sung trường `forceReevaluate?: boolean` vào DTO `BatchScreeningRequest` và hàm `startJob` trong `AiJobContext` để bypass cache khi ứng viên vừa bổ sung CV mới; đồng bộ tiêu chuẩn kiểm thử. |

---

## 1. Feature Overview (Tổng Quan Tính Năng)

- **Tên tính năng:** Giao diện xét duyệt hồ sơ ứng viên bằng AI & Thanh tiến độ nền toàn cục (AI Screening UI & Global Floating Progress Indicator).
- **Hệ thống liên quan:**
  - **Frontend:** `InternHub-Frontend` (React 19, TypeScript, CSS Modules, Lucide React, Axios client).
  - **Backend API:** `ai-service` (Port `8086`) định tuyến qua API Gateway (Port `8080`) tại prefix `/api/ai/screening/**`.
  - **Core Service:** `intern-and-program-service` (Port `8082`) cung cấp hồ sơ và tệp tài liệu CV.
- **Điểm truy cập trên giao diện (Entry Points):**
  - Không gian quản lý chương trình thực tập của HR: `HrProgramWorkspacePage` -> Tab **"Đơn chờ tiếp nhận"** (`ApplicationsTab.tsx`).
  - Modal xem chi tiết hồ sơ ứng viên: `DetailInternModal.tsx` -> Tab **"Đánh Giá Tuyển Dụng AI"** (`AiScreeningDossierTab.tsx`).
  - Khung ứng dụng toàn cục (`App.tsx`): Widget tiến trình nền ghim ở góc phải dưới (`FloatingProgressWidget`).
- **Đối tượng người dùng & Phân quyền:** `ROLE_HR`, `ROLE_ADMIN`.

---

## 2. Business Goal & Core Objectives (Mục Tiêu Nghiệp Vụ)

1. **Xét duyệt hàng loạt 1 chạm (Multi-Candidate Batch Screening):**
   - Cho phép HR tick chọn nhiều ứng viên cùng lúc (hoặc chọn tất cả có CV) và bấm nút *"✦ Đánh giá AI đã chọn (N)"* thay vì phải duyệt thủ công từng hồ sơ.
2. **Không làm gián đoạn công việc của HR (Non-Blocking Multi-Tasking UX theo `frontend-design`):**
   - Quá trình phân tích AI chạy nền không bắt HR phải chờ đợi ở màn hình hiện tại.
   - Hiển thị **`FloatingProgressWidget`** thu nhỏ ở góc màn hình. HR có thể tự do chuyển sang tạo Program, phân công Mentor, hay duyệt hồ sơ khác mà tiến trình vẫn tiếp tục và cập nhật tỷ lệ hoàn thành theo thời gian thực.
3. **Minh bạch hóa Điểm số & Khuyến nghị (Actionable AI Insights):**
   - Hiển thị huy hiệu điểm số trực quan theo dải màu ngữ nghĩa:
     - **$\ge 75$**: `var(--success)` - Khuyến nghị tiếp nhận (`RECOMMENDED_APPROVE`).
     - **$50 - 74$**: `var(--warning)` - Cân nhắc phỏng vấn (`CONSIDER`).
     - **$< 50$**: `var(--danger)` - Chưa đạt tiêu chuẩn (`RECOMMENDED_REJECT`).
   - Trong `DetailInternModal` (`AiScreeningDossierTab`), HR xem được bảng đối soát kỹ năng, điểm mạnh cốt lõi, điểm cần lưu ý và 3 câu hỏi phỏng vấn chọn lọc.
4. **Hỗ trợ sinh sẵn Lý do từ chối mẫu (Draft Rejection Reason Quick Action):**
   - Nếu ứng viên không đạt, HR bấm nút *"Từ chối"* sẽ được hệ thống gợi ý điền sẵn lý do mẫu lịch sự, chuyên nghiệp do AI tổng hợp từ CV đối chiếu với tiêu chuẩn kỳ thực tập.
5. **Điều kiện tiên quyết nộp CV & CV Gating (v1.1):**
   - Chỉ cho phép thẩm định AI khi ứng viên **đã nộp file CV hợp lệ** (`intern.hasCv === true`).
   - Chặn đứng hoàn toàn việc gửi yêu cầu thẩm định dữ liệu rỗng lên Gemini API, bảo vệ chi phí token và tránh phát sinh đánh giá ảo giác.
6. **Cơ chế Thẩm định lại tức thời (On-Demand Force Re-evaluate - v1.1):**
   - Cho phép HR yêu cầu đánh giá lại ứng viên bất cứ lúc nào (ví dụ sau khi ứng viên bổ sung CV mới) qua nút *"Thẩm Định Lại"* trên `AiScreeningDossierTab` với cờ `forceReevaluate = true`, bỏ qua cache cũ và cập nhật điểm số ngay lập tức.

---

## 3. Khảo Sát Hiện Trạng & Đánh Giá Tái Sử Dụng Mã Nguồn (Mandatory Scan & Reuse Assessment)

Tuân thủ nghiêm ngặt chỉ thị: *"Đảm bảo sẽ quét dự án, tránh việc tạo thêm code mới không cần thiết, sử dụng tối đa những gì đã có để phát triển"*:

### 3.1. Các thành phần Frontend hiện hữu được tái sử dụng

- **[ApplicationsTab.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/programs/workspace/components/tabs/ApplicationsTab.tsx):**
  - Tái sử dụng bảng dữ liệu ứng viên `PENDING`, bộ lọc, logic fetch danh sách và modal từ chối hồ sơ hiện hữu của TM-11.
  - Tích hợp thêm Checkbox chọn nhiều dòng (ẩn với ứng viên chưa nộp CV), thanh tác vụ hàng loạt AI, nút *"Chọn tất cả có CV"*, badge trạng thái CV (`Đã nộp CV` / `Chưa có CV`) và cột hiển thị điểm số AI Match.
- **[DetailInternModal.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/components/DetailInternModal.tsx):**
  - Tái sử dụng cấu trúc modal 3 khối (Header, Body cuộn độc lập, Sticky Footer cố định đáy) và thanh Tab Navigation.
  - Thêm tab thứ 3: `ai-screening` (*"Đánh Giá Tuyển Dụng AI"*) tích hợp component chuyên biệt [AiScreeningDossierTab.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/components/AiScreeningDossierTab.tsx).
- **Hạ tầng API & Client:** Tái sử dụng [api.ts](file:///d:/codegym_final_project/InternHub-Frontend/src/services/api.ts) (Axios client tích hợp token JWT, interceptor và chuẩn hóa lỗi `AppError`).
- **Design Tokens:** Tái sử dụng 100% CSS Variables từ [src/index.css](file:///d:/codegym_final_project/InternHub-Frontend/src/index.css) (`var(--primary)`, `var(--primary-glow)`, `var(--bg-card)`, `var(--border-default)`, `var(--text-main)`, `var(--success)`, `var(--warning)`, `var(--danger)`).
- **Common UI:** Tái sử dụng `Button`, `Modal`, `Skeleton`, `Badge` từ `src/components/common/`.
- **Toast Notification:** Tái sử dụng `sonner` (`toast.success`, `toast.error`, `toast.info`).

### 3.2. Các thành phần tạo mới và mở rộng theo chuẩn Domain-Driven Modular

1. `src/constants/endpoints/ai.endpoints.ts`: Khai báo hằng số URL endpoint AI (`/api/ai/screening/**`).
2. `src/types/ai.types.ts`: Khai báo các interface DTO khớp 100% với Backend Java `ai-service`, bao gồm cờ `forceReevaluate?: boolean` trong `BatchScreeningRequest`.
3. `src/types/intern.types.ts`: Mở rộng interface `InternProfile` với các trường `hasCv?: boolean` và `cvDocumentId?: number | null`.
4. `src/services/aiService.ts`: Tầng Axios service gọi API screening (`startBatchScreening`, `getBatchJobStatus`, `getInternEvaluation`).
5. `src/contexts/AiJobContext.tsx`: Context toàn cục quản lý danh sách batch job đang chạy nền, hàm `startJob(programId, internIds, forceReevaluate?)` và polling tự động (2.5s/lần).
6. `src/components/common/FloatingProgressWidget/`: Component thanh tiến độ nền góc màn hình với 2 chế độ (Pill thu nhỏ & Card mở rộng).
7. `src/pages/hr/components/AiScreeningDossierTab.tsx`: Component hiển thị chi tiết hồ sơ thẩm định AI trong `DetailInternModal`, hỗ trợ nút *"Thẩm Định Lại"* và Empty state khi chưa thẩm định.
8. `src/hooks/useAiScreening.ts`: Custom Hook quản lý selection state, select all có CV (`eligibleForAiIds`), batch trigger và lọc theo điểm AI, tuân thủ nghiêm ngặt **Rule 14 (Tối đa 3 - 4 State trong 1 Component)**.

---

## 4. Ngôn Ngữ Thiết Kế Độc Bản (Bespoke Visual Design theo `frontend-design`)

Áp dụng phương châm của kỹ năng `frontend-design`: **"Spend your boldness in one place"** và **"Ground your designs in the subject matter"**:

### 4.1. Bản Đồ Màu Ngữ Nghĩa (Semantic Design Tokens)
*Tuyệt đối không hardcode mã màu Hex trong CSS Modules (Rule 28)*:
- **Brand AI Accent:** `var(--primary)` (#4f46e5) và `var(--primary-glow)` (rgba(79, 70, 229, 0.25)).
- **Khuyến nghị Tiếp nhận ($\ge 75$):**
  - Nền: `var(--success-bg)` (#ecfdf5)
  - Chữ: `var(--success)` (#10b981)
  - Viền: `var(--success-border)` (#a7f3d0)
- **Khuyến nghị Cân nhắc ($50 - 74$):**
  - Nền: `var(--warning-bg)` (#fffbeb)
  - Chữ: `#b45309` (đảm bảo tương phản WCAG AA)
  - Viền: `var(--warning-border)` (#fde68a)
- **Khuyến nghị Chưa đạt ($< 50$):**
  - Nền: `var(--danger-bg)` (#fef2f2)
  - Chữ: `var(--danger)` (#ef4444)
  - Viền: `var(--danger-border)` (#fecaca)
- **Chưa Đánh Giá:**
  - Nền: `var(--border-subtle)` (#f1f5f9)
  - Chữ: `var(--text-muted)` (#94a3b8)
  - Viền: `var(--border-default)` (#e2e8f0)

---

### 4.2. ASCII Wireframes & Bố Cục Trực Quan

#### Wireframe 1: ApplicationsTab với Kiểm Soát CV Gating, Thanh Tác Vụ Hàng Loạt & AI Match Badge

```text
+---------------------------------------------------------------------------------------------------------------------------------------+
| [Clock] Hồ Sơ Đăng Ký Chờ Tiếp Nhận (12)                                                                   [ Refresh ]                |
| Xét duyệt các ứng viên đã ứng tuyển trực tiếp vào kỳ thực tập này.                                                                   |
+---------------------------------------------------------------------------------------------------------------------------------------+
|  [✓] Chọn tất cả có CV (2/3)  [ ✦ Đánh giá AI đã chọn (2) ]  [ ✦ Quét AI toàn bộ có CV (2) ]   Lọc AI: [ Tất cả điểm ▾ ]              |
+---------------------------------------------------------------------------------------------------------------------------------------+
| [ ] | Ứng Viên / Trạng Thái CV              | Trường & Ngành          | GPA  | Ngày Nộp   | Đánh Giá AI        | Thao Tác             |
|-----+---------------------------------------+-------------------------+------+------------+--------------------+----------------------|
| [✓] | (NV) Nguyễn Văn An  [ 📄 Đã nộp CV ]   | ĐH Bách Khoa - CNTT     | 3.65 | 10/10/2026 | [ ✦ 88% Phù hợp ]  | [👁] [✦]   [✓] [✗]   |
| [ ] | (TT) Trần Thị Bình  [ 📄 Đã nộp CV ]   | ĐH KHTN - Phần mềm      | 3.10 | 11/10/2026 | [ ✦ 65% Cân nhắc ] | [👁] [✦]   [✓] [✗]   |
| [ - ] (LV) Lê Văn Cường  [ ⚠ Chưa có CV ]   | ĐH Sư Phạm Kỹ Thuật     | 2.45 | 11/10/2026 | [ -- Chưa quét ]   | [👁] [✦🔒] [✓] [✗]   |
+---------------------------------------------------------------------------------------------------------------------------------------+
Ghi chú: TTS chưa có CV bị ẩn checkbox (thay bằng placeholder), nút [✦🔒] bị vô hiệu hóa kèm tooltip cảnh báo.
```

#### Wireframe 2: FloatingProgressWidget (Thu Nhỏ Pill & Mở Rộng Card)

```text
Trạng thái thu gọn (Collapsed Pill):
[ ✦ Đang thẩm định AI: 66% (2/3 ứng viên) ▬▬▬▬▬▬▬▬▬░░░░  [ ⤢ ] [ × ] ]
(Ghim cố định tại bottom: 24px, right: 24px, z-index: 1000)

Trạng thái mở rộng (Expanded Card):
+-----------------------------------------------------------------------+
| ✦ TIẾN TRÌNH ĐÁNH GIÁ HỒ SƠ BẰNG AI                         [ _ ] [ × ] |
| Kỳ thực tập: Spring Boot Developer Khóa 8                             |
|                                                                       |
| Tiến độ tổng thể: 66% (2/3 ứng viên)                                  |
| [=====================================>                 ] 66%         |
|                                                                       |
| DANH SÁCH ỨNG VIÊN ĐANG XỬ LÝ:                                        |
| • Nguyễn Văn An   ─── [ ✦ 88% - Phù hợp cao ]           ✓ Hoàn tất    |
| • Trần Thị Bình   ─── [ ✦ 65% - Cân nhắc ]              ✓ Hoàn tất    |
| • Lê Văn Cường    ─── [ Đang trích xuất & phân tích CV ] ⏳ Đang chạy  |
|                                                                       |
| (HR có thể tự do rời trang, hệ thống vẫn tiếp tục thẩm định ngầm)     |
+-----------------------------------------------------------------------+
```

#### Wireframe 3: Tab "Đánh Giá Tuyển Dụng AI" Trong DetailInternModal (AiScreeningDossierTab)

```text
Trường hợp 1: Đã có kết quả thẩm định (hỗ trợ nút Thẩm Định Lại)
+-------------------------------------------------------------------------------------------------------+
| Chi Tiết Hồ Sơ: Nguyễn Văn An (TTS-2026-0042)                                               [ PENDING ] [X] |
+-------------------------------------------------------------------------------------------------------+
| [ Hồ Sơ & Tài Liệu ]  |  [ Lịch Sử Mentor ]  |  [✦ Đánh Giá Tuyển Dụng AI]                            |
+-------------------------------------------------------------------------------------------------------+
| +---------------------------------------------------------------------------------------------------+ |
| |  [ 88 / 100 ]     KHUYẾN NGHỊ: PHÙ HỢP CAO    [ ⚡ Bộ nhớ đệm AI ]         [ 🔄 Thẩm Định Lại ]    | |
| |   (Vòng tròn)     Ứng viên đáp ứng xuất sắc các tiêu chí nền tảng Java & Spring Framework         | |
| |                   Thời gian thẩm định: 12/10/2026 10:15                                           | |
| +---------------------------------------------------------------------------------------------------+ |
|                                                                                                       |
| ĐỐI SOÁT NĂNG LỰC:                                                                                    |
| +---------------------------------------------+-----------------------------------------------------+ |
| | [✓] ĐIỂM MẠNH NỔI BẬT                       | [!] ĐIỂM CẦN LƯU Ý                                  | |
| | • GPA 3.65, kiến thức nền vững vàng         | • Chưa có kinh nghiệm thực tế với Docker            | |
| | • Dự án thực chiến dùng Spring Boot + JPA   | • Cần rèn luyện thêm kỹ năng viết Unit Test         | |
| | • Kỹ năng tư duy logic và thuật toán tốt    |                                                     | |
| +---------------------------------------------+-----------------------------------------------------+ |
|                                                                                                       |
| KỸ NĂNG ĐỐI CHIẾU VỚI KỲ THỰC TẬP:                                                                    |
| [ Java Core ]  [ Spring Boot ]  [ MySQL ]  [ RESTful API ]  [ Git ]                                   |
|                                                                                                       |
| GỢI Ý CÂU HỎI PHỎNG VẤN CHUYÊN MÔN:                                                                   |
| 1. Em hãy giải thích cơ chế Dependency Injection và IoC Container trong Spring Framework?            |
| 2. Trong dự án quản lý thư viện, em đã tối ưu truy vấn JPA/Hibernate như thế nào?                    |
| 3. Em xử lý Exception handling toàn cục trong REST API bằng Annotation nào?                           |
|                                                                                                       |
| [ ⚡ Áp dụng lý do từ chối mẫu của AI vào form ]                                                      |
+-------------------------------------------------------------------------------------------------------+
|                                        [ Tiếp Nhận Hồ Sơ ]   [ Từ Chối Hồ Sơ ]   [ Đóng ]             |
+-------------------------------------------------------------------------------------------------------+

Trường hợp 2: Chưa có kết quả thẩm định (Empty State)
+-------------------------------------------------------------------------------------------------------+
|                                    [ ✦ Biểu tượng Sparkles ]                                          |
|                                  Chưa Có Kết Quả Thẩm Định AI                                         |
|   Hồ sơ này chưa được thẩm định bằng AI. Nhấn nút bên dưới để hệ thống trích xuất CV và đối           |
|   soát năng lực với tiêu chuẩn kỳ thực tập.                                                           |
|                                                                                                       |
|                                [ ✦ Kích Hoạt Thẩm Định AI Ngay ]                                      |
+-------------------------------------------------------------------------------------------------------+
```

---

## 5. Cấu Trúc Types & API Contracts (Types Definition)

Khai báo file `src/types/ai.types.ts` ánh xạ chuẩn xác với Backend Java DTOs (`ai-service`):

```typescript
export type AiRecommendation =
  | 'RECOMMENDED_APPROVE'
  | 'CONSIDER'
  | 'RECOMMENDED_REJECT'
  | 'ERROR';

export type BatchJobStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface BatchScreeningRequest {
  programId: number;
  internIds: number[];
  forceReevaluate?: boolean; // cờ ép AI thẩm định lại, bỏ qua cache
}

export interface BatchJobCreatedResponse {
  jobId: string;
  programId: number;
  totalCandidates: number;
  status: string;
  createdAt: string;
}

export interface ScreeningResultDto {
  internId: number;
  programId: number;
  overallScore: number; // 0 - 100
  recommendation: AiRecommendation;
  matchSummary: string;
  strengths: string[];
  weaknesses: string[];
  skillsMatched: string[];
  draftRejectionReason?: string;
  suggestedInterviewQuestions: string[];
  evaluatedAt: string;
  fromCache: boolean;
  errorMessage?: string;
}

export interface BatchJobStatusResponse {
  jobId: string;
  programId: number;
  status: BatchJobStatus;
  totalCount: number;
  processedCount: number;
  percent: number; // 0 - 100
  results: ScreeningResultDto[];
  createdAt: string;
  updatedAt: string;
}
```

Mở rộng `InternProfile` trong `src/types/intern.types.ts`:

```typescript
export interface InternProfile {
  id: number;
  internCode: string;
  fullName: string;
  email: string;
  phone: string;
  status: InternStatus;
  programId?: number | null;
  hasCv?: boolean;              // Xác định TTS đã nộp file CV
  cvDocumentId?: number | null; // ID tài liệu CV để tải về hoặc đối soát
  // ... các trường khác
}
```

---

## 6. Quản Lý State & Giới Hạn Component (Rule 14 Compliance)

Tuân thủ nghiêm ngặt **Rule 14 (Tối đa 3 - 4 State trong 1 Component)**:

1. **`useAiScreening(applicants, programId)` Custom Hook:**
   - Quản lý 4 state cục bộ của luồng chọn lọc:
     1. `selectedIds`: `Set<number>` hoặc `number[]`
     2. `isSelectAll`: `boolean`
     3. `aiScoreFilter`: `'ALL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNRATED'`
     4. `isSubmittingBatch`: `boolean`
   - Tính toán danh sách đủ điều kiện có CV: `eligibleForAiIds = applicants.filter(a => a.hasCv).map(a => a.id)`.
   - Cung cấp các action: `toggleSelect(id)`, `toggleSelectAll(eligibleForAiIds)`, `triggerBatch(ids)`, `filterApplicants(list)`.
2. **`ApplicationsTab.tsx`:** Giữ nguyên các state cơ bản (`applicants`, `isLoading`, `actionInternId`, `rejectingIntern`), tiếp nhận logic lọc và batch từ `useAiScreening` mà không bị vượt ngưỡng 4 state.

---

## 7. Flow Tương Tác & Polling Tự Động (Interaction Architecture)

### 7.1. Luồng Thẩm Định Hàng Loạt Từ ApplicationsTab (Có CV Gating)

1. Hệ thống nạp danh sách ứng viên, kiểm tra cờ `intern.hasCv`. Các ứng viên chưa có CV bị ẩn checkbox và vô hiệu hóa nút đánh giá AI đơn lẻ.
2. HR tick chọn danh sách ứng viên hoặc bấm *"Chọn tất cả có CV"* -> Bấm nút *"✦ Đánh giá AI đã chọn"*.
3. `useAiScreening` gọi `aiService.startBatchScreening({ programId, internIds })`.
4. Nhận về `jobId` -> Đưa vào `AiJobContext`. Bắn `toast.info("Bắt đầu thẩm định N ứng viên bằng AI...")`.
5. `FloatingProgressWidget` tự động xuất hiện ở góc phải dưới (`bottom: 24px; right: 24px`).
6. `AiJobContext` thiết lập timer polling ngầm mỗi `2500ms` gọi `aiService.getBatchJobStatus(jobId)`.
7. HR tự do di chuyển qua các trang khác mà không hề bị chặn giao diện hay gián đoạn tiến độ.
8. Khi `percent === 100` hoặc `status === 'COMPLETED'`:
   - Bắn `toast.success("Đã hoàn tất thẩm định AI cho N hồ sơ!")`.
   - Tăng `completedVersion` để trigger tự động refetch bảng ứng viên và tab chi tiết.
   - Bảng `ApplicationsTab` cập nhật huy hiệu điểm số AI Match mới nhất.

### 7.2. Luồng Thẩm Định Lại Đơn Lẻ Bỏ Qua Cache (Force Re-evaluation)

1. Khi ứng viên vừa bổ sung CV mới hoặc HR muốn làm mới nhận xét AI: HR mở `DetailInternModal`, chuyển sang tab *"Đánh Giá Tuyển Dụng AI"*.
2. Nhấn nút **`[ 🔄 Thẩm Định Lại ]`** trên Hero Header của `AiScreeningDossierTab`.
3. Hàm `handleTriggerScreening(true)` gọi `startJob(intern.programId, [intern.id], true)`.
4. `aiService.startBatchScreening` gửi payload `{ programId, internIds: [intern.id], forceReevaluate: true }`.
5. Backend `ai-service` bỏ qua bản ghi cache trong `intern_ai_evaluations`, tải tệp CV mới nhất qua Feign Client từ `intern-and-program-service`, bóc tách nội dung và gửi Gemini AI đánh giá lại.
6. `FloatingProgressWidget` hiển thị tiến trình. Khi hoàn tất, `completedVersion` tăng lên kích hoạt `fetchEvaluation()` tự động cập nhật kết quả mới mà HR không cần tải lại trang.

### 7.3. Luồng Thẩm Định Lần Đầu Cho Hồ Sơ Đơn Lẻ (Empty State CTA)

1. Khi mở modal chi tiết của ứng viên chưa từng được quét AI, tab hiển thị màn hình Empty State với nút *"✦ Kích Hoạt Thẩm Định AI Ngay"*.
2. Bấm nút kích hoạt: gọi `startJob(intern.programId, [intern.id], false)`. Tiến trình chạy nền và hiển thị kết quả ngay khi phân tích xong.

---

## 8. Test Matrix & Acceptance Criteria (Tiêu Chí Nghiệm Thu)

| Mã Test | Kịch Bản Kiểm Thử | Kết Quả Kỳ Vọng |
| :---: | :--- | :--- |
| **TC-F01** | Chọn 3 ứng viên đã có CV và bấm "Đánh giá AI đã chọn" | Tiếp nhận thành công, FloatingProgressWidget xuất hiện hiển thị 0% -> 33% -> 66% -> 100% |
| **TC-F02** | Rời khỏi tab ApplicationsTab sang trang khác khi AI đang chạy | Floating Widget vẫn ghim cố định góc dưới, polling tiếp tục bình thường, không gián đoạn |
| **TC-F03** | AI hoàn tất phân tích batch | Bắn Toast thông báo thành công, cột "Đánh giá AI" hiển thị huy hiệu điểm số và màu sắc chuẩn |
| **TC-F04** | Mở Modal chi tiết ứng viên đã thẩm định | Tab "✦ Đánh Giá Tuyển Dụng AI" hiển thị trọn vẹn điểm số, điểm mạnh, điểm yếu, câu hỏi phỏng vấn |
| **TC-F05** | Bấm nút "Áp dụng lý do từ chối mẫu" | Nội dung lý do mẫu từ AI được tự động điền vào form từ chối của TM-11 |
| **TC-F06** | Kiểm tra Dark Mode và Light Mode | 100% màu sắc và độ tương phản chữ đạt chuẩn WCAG AA (>= 4.5:1), không hardcode mã màu hex |
| **TC-F07** | Ứng viên chưa nộp CV trong bảng tiếp nhận | Checkbox bị ẩn (thay bằng placeholder), nút Thẩm định AI đơn lẻ bị disabled kèm tooltip cảnh báo |
| **TC-F08** | Bấm ô "Chọn tất cả" tại Header bảng | Chỉ các ứng viên có `hasCv === true` được tích chọn; ứng viên chưa có CV tuyệt đối không bị chọn |
| **TC-F09** | Bấm nút "Thẩm Định Lại" trong `AiScreeningDossierTab` | Request gửi `forceReevaluate: true`, widget chạy nền, kết quả mới được cập nhật ghi đè không lấy từ cache |
| **TC-F10** | Hồ sơ chưa từng được quét AI mở tab Đánh giá | Hiển thị Empty State với CTA "Kích Hoạt Thẩm Định AI Ngay"; bấm CTA kích hoạt thẩm định thành công |
