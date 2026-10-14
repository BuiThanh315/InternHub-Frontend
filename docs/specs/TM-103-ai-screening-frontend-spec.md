# Specification: Giao Diện Xét Duyệt Ứng Viên Bằng AI & Thanh Tiến Độ Nền Toàn Cục (TM-103 Frontend)

> **Tài liệu Đặc Tả Kỹ Thuật (Frontend Specification)**  
> **Dự án:** [InternHub-Frontend](file:///d:/codegym_final_project/InternHub-Frontend) (React 19, Vite, TypeScript, CSS Modules)  
> **Mã Jira Ticket:** [TM-103](https://robluccibn9935.atlassian.net/browse/TM-103) - *AI-Powered Intern Application Screening & Floating Progress Indicator*  
> **Trạng thái:** PROPOSED / PENDING APPROVAL  
> **Lưu trữ tại:** [TM-103-ai-screening-frontend-spec.md](file:///d:/codegym_final_project/InternHub-Frontend/docs/specs/TM-103-ai-screening-frontend-spec.md)  
> **Change Level:** **L3** (Tích hợp AI Screening Copilot: Chọn hàng loạt trong ApplicationsTab, FloatingProgressWidget góc màn hình không gián đoạn công việc, Tab Dossier phân tích AI chuyên sâu trong DetailInternModal).  
> **Tiêu chuẩn tuân thủ:** 34 Nguyên tắc bất biến ([`AGENTS.md`](file:///d:/codegym_final_project/InternHub-Frontend/AGENTS.md)), Quy chuẩn UX/UI ([`08-ui-ux-guidelines.md`](file:///d:/codegym_final_project/InternHub-Frontend/.agents/08-ui-ux-guidelines.md)) & Kỹ năng Thiết kế Giao diện Độc bản ([`frontend-design`](file:///d:/codegym_final_project/InternHub-Frontend/.agents/skills/frontend-design/SKILL.md)).

---

## 0. Nhật Ký Thay Đổi & Giải Trình Kỹ Thuật (Revision History & Change Rationale)

| Phiên bản | Ngày | Người thực hiện | Task / Jira | Loại thay đổi | Lý do & Giải trình kỹ thuật (Rationale) |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **v1.0** | 2026-10-12 | AI Senior Frontend Pair-Programmer & User | `TM-103` | Tạo mới Đặc Tả | Khởi tạo tài liệu đặc tả kỹ thuật Frontend cho tính năng xét duyệt hồ sơ thực tập sinh bằng AI, tích hợp FloatingProgressWidget góc màn hình không chặn thao tác của người dùng, nâng cấp ApplicationsTab và DetailInternModal theo chuẩn `frontend-design`. |

---

## 1. Feature Overview (Tổng Quan Tính Năng)

- **Tên tính năng:** Giao diện xét duyệt hồ sơ ứng viên bằng AI & Thanh tiến độ nền toàn cục (AI Screening UI & Global Floating Progress Indicator).
- **Hệ thống liên quan:**
  - **Frontend:** `InternHub-Frontend` (React 19, TypeScript, CSS Modules, Lucide React, Axios client).
  - **Backend API:** `ServiceAI` (Port `8086`) định tuyến qua API Gateway (Port `8080`) tại prefix `/api/ai/screening/**`.
- **Điểm truy cập trên giao diện (Entry Points):**
  - Không gian quản lý chương trình thực tập của HR: `HrProgramWorkspacePage` -> Tab **"Đơn chờ tiếp nhận"** (`ApplicationsTab.tsx`).
  - Modal xem chi tiết hồ sơ ứng viên: `DetailInternModal.tsx` -> Tab **"Đánh Giá Tuyển Dụng AI"** (`ai-screening`).
  - Khung ứng dụng toàn cục (`App.tsx`): Widget tiến trình nền ghim ở góc phải dưới (`FloatingProgressWidget`).
- **Đối tượng người dùng & Phân quyền:** `ROLE_HR`, `ROLE_ADMIN`.

---

## 2. Business Goal & Core Objectives (Mục Tiêu Nghiệp Vụ)

1. **Xét duyệt hàng loạt 1 chạm (Multi-Candidate Batch Screening):**
   - Cho phép HR tick chọn nhiều ứng viên cùng lúc (hoặc chọn tất cả) và bấm nút *"Đánh giá AI (N ứng viên)"* thay vì phải bấm duyệt thủ công từng người.
2. **Không làm gián đoạn công việc của HR (Non-Blocking Multi-Tasking UX theo `frontend-design`):**
   - Quá trình phân tích AI chạy nền không bắt HR phải chờ đợi ở màn hình hiện tại.
   - Hiển thị **`FloatingProgressWidget`** thu nhỏ ở góc màn hình. HR có thể tự do chuyển sang tạo Program, phân công Mentor, hay duyệt hồ sơ khác mà tiến trình vẫn tiếp tục và cập nhật tỷ lệ hoàn thành theo thời gian thực.
3. **Minh bạch hóa Điểm số & Khuyến nghị (Actionable AI Insights):**
   - Hiển thị huy hiệu điểm số trực quan theo dải màu ngữ nghĩa:
     - **$\ge 75$**: `var(--success)` - Khuyến nghị tiếp nhận (`RECOMMENDED_APPROVE`).
     - **$50 - 74$**: `var(--warning)` - Cân nhắc phỏng vấn (`CONSIDER`).
     - **$< 50$**: `var(--danger)` - Chưa đạt tiêu chuẩn (`RECOMMENDED_REJECT`).
   - Trong `DetailInternModal`, HR xem được bảng đối soát kỹ năng, điểm mạnh cốt lõi, điểm cần lưu ý và 3 câu hỏi phỏng vấn chọn lọc.
4. **Hỗ trợ sinh sẵn Lý do từ chối mẫu (Draft Rejection Reason Quick Action):**
   - Nếu ứng viên không đạt, HR bấm nút *"Từ chối"* sẽ được hệ thống gợi ý điền sẵn lý do mẫu lịch sự, chuyên nghiệp do AI tổng hợp từ CV đối chiếu với tiêu chuẩn kỳ thực tập.

---

## 3. Khảo Sát Hiện Trạng & Đánh Giá Tái Sử Dụng Mã Nguồn (Mandatory Scan & Reuse Assessment)

Tuân thủ nghiêm ngặt chỉ thị: *"Đảm bảo sẽ quét dự án, tránh việc tạo thêm code mới không cần thiết, sử dụng tối đa những gì đã có để phát triển"*:

### 3.1. Các thành phần Frontend hiện hữu được tái sử dụng:
* **[ApplicationsTab.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/programs/workspace/components/tabs/ApplicationsTab.tsx):**
  - Tái sử dụng bảng dữ liệu ứng viên `PENDING`, bộ lọc, logic fetch danh sách và modal từ chối hồ sơ hiện hữu của TM-11.
  - Tích hợp thêm Checkbox chọn nhiều dòng, thanh tác vụ hàng loạt AI và cột hiển thị điểm số AI Match.
* **[DetailInternModal.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/components/DetailInternModal.tsx):**
  - Tái sử dụng cấu trúc modal 3 khối (Header, Body cuộn độc lập, Sticky Footer cố định đáy) và thanh Tab Navigation.
  - Thêm tab thứ 3: `ai-screening` (*"Đánh Giá Tuyển Dụng AI"*) hiển thị hồ sơ phân tích chuyên sâu.
* **Hạ tầng API & Client:** Tái sử dụng [api.ts](file:///d:/codegym_final_project/InternHub-Frontend/src/services/api.ts) (Axios client tích hợp token JWT, interceptor và chuẩn hóa lỗi `AppError`).
* **Design Tokens:** Tái sử dụng 100% CSS Variables từ [src/index.css](file:///d:/codegym_final_project/InternHub-Frontend/src/index.css) (`var(--primary)`, `var(--primary-glow)`, `var(--bg-card)`, `var(--border-default)`, `var(--text-main)`, `var(--success)`, `var(--warning)`, `var(--danger)`).
* **Common UI:** Tái sử dụng `Button`, `Modal`, `Skeleton`, `Badge` từ `src/components/common/`.
* **Toast Notification:** Tái sử dụng `sonner` (`toast.success`, `toast.error`, `toast.info`).

### 3.2. Các thành phần tạo mới theo chuẩn Domain-Driven Modular:
1. `src/constants/endpoints/ai.endpoints.ts`: Khai báo hằng số URL endpoint AI (`/api/ai/screening/**`).
2. `src/types/ai.types.ts`: Khai báo các interface DTO khớp 100% với Backend Java `ServiceAI`.
3. `src/services/aiService.ts`: Tầng Axios service gọi API screening.
4. `src/contexts/AiJobContext.tsx`: Context toàn cục quản lý danh sách batch job đang chạy nền và polling tự động (2.5s/lần).
5. `src/components/common/FloatingProgressWidget/`: Component thanh tiến độ nền góc màn hình với 2 chế độ (Pill thu nhỏ & Card mở rộng).
6. `src/hooks/useAiScreening.ts`: Custom Hook quản lý selection state, select all, batch trigger và lọc theo điểm AI, tuân thủ nghiêm ngặt **Rule 14 (Tối đa 3 - 4 State trong 1 Component)**.

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

#### Wireframe 1: ApplicationsTab với Thanh Tác Vụ Hàng Loạt AI & AI Match Badge
```
+--------------------------------------------------------------------------------------------------------------------+
| [Clock] Hồ Sơ Đăng Ký Chờ Tiếp Nhận (12)                                                [ Refresh ]                |
| Xét duyệt các ứng viên đã ứng tuyển trực tiếp vào kỳ thực tập này.                                                |
+--------------------------------------------------------------------------------------------------------------------+
|  [✓] Đã chọn 3 ứng viên    [ ✦ Đánh giá AI đã chọn (3) ]   [ ✦ Quét AI toàn bộ (12) ]    Lọc AI: [ Tất cả điểm ▾ ] |
+--------------------------------------------------------------------------------------------------------------------+
| [ ] | Ứng Viên                     | Trường & Ngành          | GPA  | Ngày Nộp   | Đánh Giá AI        | Thao Tác     |
|-----+------------------------------+-------------------------+------+------------+--------------------+--------------|
| [✓] | (NV) Nguyễn Văn An           | ĐH Bách Khoa - CNTT     | 3.65 | 10/10/2026 | [ ✦ 88% Phù hợp ]  | [👁] [✓] [✗]  |
| [✓] | (TT) Trần Thị Bình           | ĐH KHTN - Phần mềm      | 3.10 | 11/10/2026 | [ ✦ 65% Cân nhắc ] | [👁] [✓] [✗]  |
| [✓] | (LV) Lê Văn Cường            | ĐH Sư Phạm Kỹ Thuật     | 2.45 | 11/10/2026 | [ ✦ 42% Chưa đạt ] | [👁] [✓] [✗]  |
| [ ] | (PH) Phạm Hoàng Dũng         | ĐH FPT - KTPM           | 3.30 | 12/10/2026 | [ -- Chưa quét ]   | [👁] [✓] [✗]  |
+--------------------------------------------------------------------------------------------------------------------+
```

#### Wireframe 2: FloatingProgressWidget (Thu Nhỏ Pill & Mở Rộng Card)
```
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

#### Wireframe 3: Tab "Đánh Giá Tuyển Dụng AI" Trong DetailInternModal
```
+-----------------------------------------------------------------------------------------------+
| Chi Tiết Hồ Sơ: Nguyễn Văn An (TTS-2026-0042)                                       [ PENDING ] [X] |
+-----------------------------------------------------------------------------------------------+
| [ Hồ Sơ & Tài Liệu ]  |  [ Lịch Sử Mentor ]  |  [✦ Đánh Giá Tuyển Dụng AI]                   |
+-----------------------------------------------------------------------------------------------+
| +-------------------------------------------------------------------------------------------+ |
| |  [ 88 / 100 ]     KHUYẾN NGHỊ: PHÙ HỢP CAO (RECOMMENDED APPROVE)                          | |
| |   (Vòng tròn)     Ứng viên đáp ứng xuất sắc các tiêu chí nền tảng Java & Spring Framework | |
| |                   Thời gian thẩm định: 12/10/2026 10:15                                   | |
| +-------------------------------------------------------------------------------------------+ |
|                                                                                               |
| ĐỐI SOÁT NĂNG LỰC:                                                                            |
| +---------------------------------------------+---------------------------------------------+ |
| | [✓] ĐIỂM MẠNH NỔI BẬT                       | [!] ĐIỂM CẦN LƯU Ý                          | |
| | • GPA 3.65, kiến thức nền vững vàng         | • Chưa có kinh nghiệm thực tế với Docker    | |
| | • Dự án thực chiến dùng Spring Boot + JPA   | • Cần rèn luyện thêm kỹ năng viết Unit Test | |
| | • Kỹ năng tư duy logic và thuật toán tốt    |                                             | |
| +---------------------------------------------+---------------------------------------------+ |
|                                                                                               |
| KỸ NĂNG ĐỐI CHIẾU VỚI KỲ THỰC TẬP:                                                            |
| [ Java Core ]  [ Spring Boot ]  [ MySQL ]  [ RESTful API ]  [ Git ]                           |
|                                                                                               |
| GỢI Ý CÂU HỎI PHỎNG VẤN CHUYÊN MÔN:                                                           |
| 1. Em hãy giải thích cơ chế Dependency Injection và IoC Container trong Spring Framework?    |
| 2. Trong dự án quản lý thư viện, em đã tối ưu truy vấn JPA/Hibernate như thế nào?            |
| 3. Em xử lý Exception handling toàn cục trong REST API bằng Annotation nào?                   |
|                                                                                               |
| [ ⚡ Áp dụng lý do từ chối mẫu của AI vào form ]                                              |
+-----------------------------------------------------------------------------------------------+
|                                [ Tiếp Nhận Hồ Sơ ]   [ Từ Chối Hồ Sơ ]   [ Đóng ]             |
+-----------------------------------------------------------------------------------------------+
```

---

## 5. Cấu Trúc Types & API Contracts (Types Definition)

Tạo file `src/types/ai.types.ts` ánh xạ chuẩn xác với Backend Java DTOs:

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

---

## 6. Quản Lý State & Giới Hạn Component (Rule 14 Compliance)

Tuân thủ nghiêm ngặt **Rule 14 (Tối đa 3 - 4 State trong 1 Component)**:

1. **`useAiScreening(applicants, programId)` Custom Hook:**
   - Quản lý 4 state cục bộ của luồng chọn lọc:
     1. `selectedIds`: `Set<number>` hoặc `number[]`
     2. `isSelectAll`: `boolean`
     3. `aiScoreFilter`: `'ALL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNRATED'`
     4. `isSubmittingBatch`: `boolean`
   - Cung cấp các action: `toggleSelect(id)`, `toggleSelectAll()`, `triggerBatch()`, `filterApplicants(list)`.
2. **`ApplicationsTab.tsx`:** Giữ nguyên các state cơ bản (applicants, isLoading, actionInternId, rejectingIntern), tiếp nhận kết quả từ `useAiScreening` mà không bị vượt ngưỡng 4 state.

---

## 7. Flow Tương Tác & Polling Tự Động (Interaction Architecture)

1. HR tick chọn danh sách ứng viên trong `ApplicationsTab` -> Bấm nút *"✦ Đánh giá AI đã chọn"*.
2. `useAiScreening` gọi `aiService.startBatchScreening({ programId, internIds })`.
3. Nhận về `jobId` -> Đưa vào `AiJobContext`. Bắn `toast.info("Đã bắt đầu thẩm định hồ sơ bằng AI...")`.
4. `FloatingProgressWidget` tự động xuất hiện ở góc phải dưới (`bottom: 24px; right: 24px`).
5. `AiJobContext` thiết lập timer polling ngầm mỗi `2500ms` gọi `aiService.getBatchJobStatus(jobId)`.
6. HR tự do di chuyển qua các trang khác (tạo chương trình, xem mentor, xem thống kê) mà không hề bị chặn giao diện hay mất tiến độ.
7. Khi `percent === 100` hoặc `status === 'COMPLETED'`:
   - Bắn `toast.success("AI đã hoàn tất thẩm định hồ sơ!")`.
   - Widget hiển thị nút *"Xem kết quả"* dẫn thẳng về Workspace chương trình.
   - Bảng `ApplicationsTab` tự động refetch để hiển thị huy hiệu điểm số mới nhất.

---

## 8. Test Matrix & Acceptance Criteria (Tiêu Chí Nghiệm Thu)

| Mã Test | Kịch Bản Kiểm Thử | Kết Quả Kỳ Vọng |
| :---: | :--- | :--- |
| **TC-F01** | Chọn 3 ứng viên và bấm "Đánh giá AI đã chọn" | Tiếp nhận thành công, FloatingProgressWidget xuất hiện hiển thị 0% -> 33% -> 66% -> 100% |
| **TC-F02** | Rời khỏi tab ApplicationsTab sang trang khác khi AI đang chạy | Floating Widget vẫn ghim cố định góc dưới, polling tiếp tục bình thường, không gián đoạn |
| **TC-F03** | AI hoàn tất phân tích batch | Bắn Toast thông báo thành công, cột "Đánh giá AI" hiển thị huy hiệu điểm số và màu sắc chuẩn |
| **TC-F04** | Mở Modal chi tiết ứng viên | Tab "✦ Đánh Giá Tuyển Dụng AI" hiển thị trọn vẹn điểm số, điểm mạnh, điểm yếu, câu hỏi phỏng vấn |
| **TC-F05** | Bấm nút "Áp dụng lý do từ chối mẫu" | Nội dung lý do mẫu từ AI được tự động điền vào form từ chối của TM-11 |
| **TC-F06** | Kiểm tra Dark Mode và Light Mode | 100% màu sắc và độ tương phản chữ đạt chuẩn WCAG AA (>= 4.5:1), không hardcode mã màu hex |
