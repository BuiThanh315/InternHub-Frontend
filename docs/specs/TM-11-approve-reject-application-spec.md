# Specification: Phê Duyệt / Từ Chối Hồ Sơ Thực Tập Sinh (TM-11)

> **Tài liệu Đặc Tả Yêu Cầu Kỹ Thuật (Frontend Specification)**  
> **Dự án:** `InternHub-Frontend`  
> **Mã Jira Ticket:** [TM-11](https://robluccibn9935.atlassian.net/browse/TM-11) - Xét duyệt / Từ chối hồ sơ thực tập sinh (Application Decision)  
> **Nhánh Git:** `feature/TM-11/approve-reject-application` (tách từ `main` commit `cc756b9`)  
> **Change Level:** **L3** (Ảnh hưởng UI Table Actions, Decision Confirmation Modals, Rejection Form Validation, REST API Contract PATCH, State Management & Optimistic UI/Refetch)  
> **Tiêu chuẩn tuân thủ:** 34 Nguyên tắc bất biến ([`AGENTS.md`](file:///c:/Users/Luong%20Anh%20Huy/InternHub-Workspace/InternHub-Frontend/AGENTS.md)) & Quy chuẩn UX/UI ([`08-ui-ux-guidelines.md`](file:///c:/Users/Luong%20Anh%20Huy/InternHub-Workspace/InternHub-Frontend/.agents/08-ui-ux-guidelines.md))

---

## 1. Feature Overview (Tổng Quan Tính Năng)

- **Tên tính năng:** Xét duyệt & Từ chối hồ sơ ứng tuyển Thực tập sinh (Intern Application Decision Flow)
- **Hệ thống liên quan:**
  - **Frontend:** `InternHub-Frontend` (React 19, TypeScript, Vite, CSS Modules, Lucide React, Axios client).
  - **Backend API:** `intern-service` (hoặc `employee-service`) qua API Gateway (Port `8080`).
- **Đối tượng người dùng:**
  - **HR / Admin:** Người có thẩm quyền (`ROLE_HR`, `ROLE_ADMIN`) xem xét hồ sơ ứng viên ở trạng thái `PENDING` (hoặc `APPROVED`) để đưa ra quyết định tiếp nhận (`APPROVED`) hoặc từ chối (`REJECTED`) kèm lý do cụ thể.
  - **Thực tập sinh (Intern):** Nhận được kết quả cập nhật trạng thái hồ sơ (và chuẩn bị cho thông báo email ở TM-12).

---

## 2. Business Goal & Core Objectives (Mục Tiêu Nghiệp Vụ)

Số hóa quy trình tuyển dụng và phê duyệt đầu vào của thực tập sinh:
1. **Chuẩn hóa thao tác ra quyết định:** Cung cấp trải nghiệm xét duyệt 1-click có xác nhận an toàn (Confirmation Modal) và quy trình từ chối nghiêm ngặt có nhập lý do giải trình.
2. **Minh bạch hóa & Không làm mất bối cảnh (Zero Context-Switching):** Mọi thao tác duyệt/từ chối đều diễn ra trực tiếp qua Modal ngay trên trang HR Dashboard hoặc trong Modal Chi Tiết Hồ Sơ mà không bị chuyển trang (bảo lưu 100% bộ lọc và vị trí phân trang).
3. **Bảo toàn dữ liệu khi có lỗi (Safe Mutation UX):** Nếu API Backend trả về lỗi (400, 403, 500), modal từ chối không bị đóng đột ngột, giữ nguyên lý do đã nhập và hiển thị banner thông báo lỗi từ server để HR điều chỉnh.
4. **Đồng bộ hóa tức thời (Optimistic UI & Table Refetch):** Sau khi xét duyệt thành công, hiển thị Toast thông báo trạng thái, đóng modal và làm mới bảng dữ liệu ngay lập tức.

---

## 3. Scope of Work (Phạm Vi Tính Năng)

### 3.1. Trong phạm vi (In Scope)

1. **Cập nhật Constant Endpoint & Contract Types:**
   - Khai báo endpoint: `INTERN_ENDPOINTS.DECISION: (id: number | string) => \`/api/interns/\${id}/decision\``.
   - Định nghĩa DTO Request: `InternDecisionRequest` (`decision: 'APPROVED' | 'REJECTED'`, `rejectionReason?: string`).
   - Mở rộng model `InternProfile`: thêm các trường `rejectionReason?: string | null`, `reviewedBy?: string | null`, `reviewedAt?: string | null`.
2. **Cập nhật Service Layer (`internService.ts`):**
   - Bổ sung hàm `submitDecision(id: number, request: InternDecisionRequest, signal?: AbortSignal): Promise<InternProfile>`.
   - Chuẩn hóa lỗi thông qua `AppError` và interceptor.
3. **Xây dựng Component Modal Xét Duyệt Chuẩn 3 Khối:**
   - **`ApproveConfirmModal.tsx`**: Modal xác nhận tiếp nhận hồ sơ (`decision: 'APPROVED'`). Header cố định, Body tóm tắt thông tin ứng viên (Mã TTS, Tên, Vị trí, Trường, Đã nộp bao nhiêu tài liệu), Sticky Footer với nút "Hủy" và nút "Xác Nhận Tiếp Nhận" (`variant="primary"`).
   - **`RejectInternModal.tsx`**: Modal từ chối hồ sơ (`decision: 'REJECTED'`). Cấu trúc cảnh báo nguy hiểm (`variant="danger"`), có textarea nhập lý do từ chối (ràng buộc từ 5 - 1000 ký tự, hiển thị bộ đếm ký tự, autofocus, viền đổi màu glow khi focus). Nút "Xác Nhận Từ Chối" khóa tương tác khi đang gửi hoặc khi lý do chưa đủ 5 ký tự.
4. **Tích hợp Vào Bảng Quản Trị & Chi Tiết:**
   - **`HrInternTable.tsx`**: Nút "Tiếp Nhận" và "Từ Chối" cho các dòng có trạng thái `PENDING` (và nút "Hủy Tiếp Nhận" nếu đang `APPROVED`) khi click sẽ mở đúng Modal xác nhận tương ứng thay vì gọi đổi trạng thái ngầm.
   - **`DetailInternModal.tsx`**: Bổ sung khu vực hiển thị trạng thái xét duyệt (`reviewedBy`, `reviewedAt`, `rejectionReason` nếu có). Nếu hồ sơ đang `PENDING`, hiển thị 2 nút hành động nhanh "Tiếp Nhận" và "Từ Chối" ngay tại Footer của modal chi tiết.
5. **Hiển thị Badge & Tooltip Lý Do Từ Chối:**
   - Đối với các hồ sơ có trạng thái `REJECTED`, hiển thị icon info hoặc click vào xem được `rejectionReason` đã lưu.

### 3.2. Ngoài phạm vi (Out of Scope)
- Không gửi email tự động từ Frontend (Backend và service TM-12 phụ trách gửi mail).
- Không phân bổ Mentor cho thực tập sinh (thuộc ticket TM-16).
- Không ký hợp đồng thực tập (thuộc ticket TM-13 / TM-14).
- Không sửa đổi mã nguồn Backend Java (tuân thủ Trụ cột II, Nguyên tắc 7).

---

## 4. Potential Logic Loopholes & Mitigations (Các Lỗ Hổng Logic & Giải Pháp)

| STT | Tình huống ngoại lệ (Edge Case) | Rủi ro kỹ thuật / UX | Giải pháp thiết kế & Xử lý Frontend |
| :---: | :--- | :--- | :--- |
| **1** | HR bấm "Từ Chối" nhưng không nhập hoặc nhập lý do quá ngắn (< 5 ký tự) | Backend trả về lỗi 400 `Lý do từ chối là bắt buộc...`, gây gián đoạn luồng | Validate trực tiếp client-side: Báo lỗi đỏ ngay dưới textarea, vô hiệu hóa (disable) nút "Xác nhận từ chối" nếu `rejectionReason.trim().length < 5`. |
| **2** | Double-click khi bấm Duyệt / Từ chối hồ sơ | Gửi 2 request đồng thời gây lỗi race condition hoặc duplicate audit log | Sử dụng state `submitting = true`, khóa toàn bộ tương tác (`pointer-events: none`, nút hiển thị spinner loading). |
| **3** | Hồ sơ chưa có tài liệu/CV nào được nộp nhưng HR bấm Tiếp nhận | Ứng viên chưa hoàn thiện hồ sơ đã được duyệt vào vòng trong | Hiển thị thông tin cảnh báo nhẹ (Badge cảnh báo vàng: *"Hồ sơ chưa có CV đính kèm"*) trong `ApproveConfirmModal` để HR cân nhắc trước khi ấn Tiếp nhận. |
| **4** | Lỗi mạng hoặc máy chủ trả về 500 khi submit từ chối | Nếu đóng modal, người dùng sẽ mất đoạn văn bản lý do đã gõ | **Tuân thủ Nguyên tắc 24**: Giữ nguyên modal, không reset form, hiển thị alert lỗi đỏ ở đầu modal để người dùng thử lại. |
| **5** | Hồ sơ đã bị HR khác duyệt trên tab khác (Conflict state) | Backend trả về lỗi trạng thái không hợp lệ do không còn là `PENDING` | Bắt lỗi 400/409, hiển thị Toast cảnh báo chi tiết: *"Hồ sơ đã được thay đổi bởi người khác"*, tự động đóng modal và kích hoạt `loadData()` để cập nhật dữ liệu mới nhất. |

---

## 5. Functional Requirements (Yêu Cầu Chức Năng)

- **FR-1 (Trigger Approval):** Cho phép HR mở modal xác nhận phê duyệt từ bảng danh sách (`HrInternTable`) hoặc từ modal xem chi tiết (`DetailInternModal`) đối với các hồ sơ trạng thái `PENDING`.
- **FR-2 (Trigger Rejection):** Cho phép HR mở modal từ chối hồ sơ từ bảng danh sách hoặc từ modal xem chi tiết đối với hồ sơ `PENDING` (hoặc hủy tiếp nhận từ `APPROVED`).
- **FR-3 (Mandatory Rejection Reason Form):** Modal từ chối bắt buộc có trường nhập lý do với độ dài từ 5 đến 1000 ký tự. Có hiển thị số ký tự đếm ngược và thông báo lỗi realtime.
- **FR-4 (API Integration):** Gọi API `PATCH /api/interns/{id}/decision` với payload chuẩn theo spec backend:
  - Phê duyệt: `{ "decision": "APPROVED" }`
  - Từ chối: `{ "decision": "REJECTED", "rejectionReason": "..." }`
- **FR-5 (Review Audit Information Display):** Modal chi tiết hồ sơ (`DetailInternModal`) hiển thị rõ thông tin xét duyệt: Trạng thái hiện tại, Người duyệt (`reviewedBy`), Thời gian duyệt (`reviewedAt`), và Lý do từ chối (`rejectionReason` nếu có).
- **FR-6 (Feedback & Refetch):** Sau khi API trả về kết quả thành công:
  - Hiển thị Toast thông báo thành công (màu xanh cho Approved, thông báo ghi nhận cho Rejected).
  - Tự động đóng modal quyết định.
  - Làm mới bảng dữ liệu (`loadData()`) để cập nhật trạng thái mới nhất của ứng viên mà không làm mất trang hiện tại.

---

## 6. Business Rules (Quy Tắc Nghiệp Vụ)

- **BR-1:** Chỉ các hồ sơ có trạng thái `PENDING` mới được phép duyệt chuyển sang `APPROVED`.
- **BR-2:** Cho phép chuyển từ `PENDING` hoặc `APPROVED` sang `REJECTED`. Bắt buộc phải có lý do từ chối (`rejectionReason`) tối thiểu 5 ký tự và tối đa 1000 ký tự.
- **BR-3:** Khi duyệt `APPROVED`, backend tự động xóa bỏ `rejectionReason` cũ. Frontend cập nhật lại trạng thái tương ứng.
- **BR-4:** Không cho phép thực hiện thao tác duyệt/từ chối đối với hồ sơ đã kết thúc (`COMPLETED`) hoặc đang thực tập (`INTERNING`).
- **BR-5:** Chỉ người dùng có vai trò `ROLE_HR` hoặc `ROLE_ADMIN` mới thấy và tương tác được với các nút duyệt/từ chối.

---

## 7. Data Models & API Contract (Giao Thức Dữ Liệu)

### 7.1. TypeScript Interface (`src/types/intern.types.ts`)

```typescript
export interface InternDecisionRequest {
  decision: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

// Bổ sung vào InternProfile:
export interface InternProfile {
  id: number;
  internCode: string;
  fullName: string;
  email: string;
  phone: string;
  // ... các trường hiện có
  status: InternStatus;
  rejectionReason?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### 7.2. API REST Contract

- **Endpoint:** `PATCH /api/interns/{id}/decision`
- **Headers:** `Authorization: Bearer <TOKEN>`, `Content-Type: application/json`
- **Request Body (Approve):**
```json
{
  "decision": "APPROVED"
}
```
- **Request Body (Reject):**
```json
{
  "decision": "REJECTED",
  "rejectionReason": "Hồ sơ chưa đạt yêu cầu về chứng chỉ ngoại ngữ và thời gian thực tập cam kết tối thiểu dưới 3 tháng."
}
```
- **Response 200 OK:**
```json
{
  "code": 200,
  "message": "Duyệt hồ sơ thực tập sinh thành công",
  "data": {
    "id": 1,
    "internCode": "INT-202609-0001",
    "fullName": "Nguyễn Văn A",
    "status": "APPROVED",
    "rejectionReason": null,
    "reviewedBy": "hr_manager",
    "reviewedAt": "2026-09-23T10:30:00"
  }
}
```
- **Response 400 Bad Request:**
```json
{
  "code": 400,
  "message": "Lý do từ chối là bắt buộc và phải có ít nhất 5 ký tự khi từ chối hồ sơ"
}
```

---

## 8. UI/UX Design Specifications (Tuân Thủ 08-ui-ux-guidelines)

### 8.1. Modal Cấu Trúc 3 Khối
- **Kích thước:** `size="md"` (chiều rộng tối đa 560px), bo góc `--radius-lg` (14px), nền `--bg-surface`.
- **Khối 1 (Fixed Header):** Tiêu đề trang trọng kèm icon đại diện (CheckCircle xanh cho Duyệt, AlertTriangle đỏ cho Từ chối), nút đóng `X` ở góc phải.
- **Khối 2 (Scrollable Body):** 
  - Khối tóm tắt thông tin ứng viên (Card nhỏ nền `--bg-body` viền `--border-default`): Mã TTS, Họ tên, Vị trí ứng tuyển, Trường ĐH, Trạng thái tài liệu.
  - Đối với Từ chối: Ô `<textarea>` nhãn rõ ràng, placeholder gợi ý mẫu lý do, hiển thị số ký tự `x / 1000`. Khi focus có hiệu ứng đổi viền tím sang `var(--primary)` và hào quang ánh sáng `var(--primary-glow)`.
- **Khối 3 (Sticky Footer):** Ghim cố định chân modal với nút *"Hủy"* bên trái và nút hành động chính bên phải (*"Xác Nhận Tiếp Nhận"* màu Primary / *"Xác Nhận Từ Chối"* màu Danger).

### 8.2. Tiêu chuẩn Tokens & Màu sắc
- Sử dụng 100% biến CSS Variables (`var(--bg-surface)`, `var(--text-main)`, `var(--text-muted)`, `var(--border-default)`, `var(--primary)`, `var(--danger)`).
- Không chứa bất kỳ mã màu HEX nào trong file CSS Module.

---

## 9. Acceptance Criteria Checklist (Tiêu Chí Nghiệm Thu)

- [ ] **AC-1:** Nút "Tiếp Nhận" trên bảng hoặc trong modal chi tiết mở ra `ApproveConfirmModal` với đầy đủ thông tin tóm tắt của TTS.
- [ ] **AC-2:** Bấm xác nhận trên `ApproveConfirmModal` gửi request `PATCH /api/interns/{id}/decision` với `{ decision: 'APPROVED' }`.
- [ ] **AC-3:** Nút "Từ Chối" mở ra `RejectInternModal`. Nút "Xác Nhận Từ Chối" bị disable nếu lý do dưới 5 ký tự.
- [ ] **AC-4:** Nhập lý do hợp lệ ($\ge 5$ ký tự) và bấm xác nhận gửi request `{ decision: 'REJECTED', rejectionReason: '...' }`.
- [ ] **AC-5:** Khi đang gửi request, các nút bấm hiển thị trạng thái loading / spinner và khóa tương tác chống double-click.
- [ ] **AC-6:** Khi API thành công, hiển thị Toast thông báo, đóng modal và bảng dữ liệu tự động refetch mà không mất trang hay bộ lọc hiện tại.
- [x] **AC-7:** Khi API thất bại (400, 500), modal vẫn mở, dữ liệu lý do đã nhập được giữ nguyên, hiển thị thông báo lỗi rõ ràng cho người dùng.
- [x] **AC-8:** Modal xem chi tiết (`DetailInternModal`) hiển thị thông tin `reviewedBy`, `reviewedAt`, `rejectionReason` chuẩn xác và đẹp mắt.
- [x] **AC-9:** Toàn bộ component mới và chỉnh sửa tuân thủ CSS Modules, semantic tokens, hỗ trợ mượt mà cả Dark/Light mode.

---

## 10. Implementation Plan & File Checklist

1. [x] Tạo nhánh `feature/TM-11/approve-reject-application` & mở rộng trên `feature/update-chuc-nang-xet-duyet-ho-so`.
2. [x] Cập nhật endpoint trong `src/constants/endpoints/intern.endpoints.ts` và `src/constants/endpoints/program.endpoints.ts`.
3. [x] Cập nhật Types trong `src/types/intern.types.ts` và `src/types/program.types.ts` (`pendingApplicationsCount`, `EnrollInternsRequest`).
4. [x] Bổ sung hàm API trong `src/services/internService.ts` và `src/services/programService.ts` (`enrollInterns`, `getProgramInterns`).
5. [x] Tạo component `ApproveConfirmModal` (`ApproveConfirmModal.tsx`, `ApproveConfirmModal.types.ts`, `ApproveConfirmModal.module.css`).
6. [x] Tạo component `RejectInternModal` (`RejectInternModal.tsx`, `RejectInternModal.types.ts`, `RejectInternModal.module.css`).
7. [x] Tạo component `EnrollInternModal` trong `src/pages/hr/programs/components/EnrollInternModal.tsx` phục vụ tiếp nhận theo kỳ.
8. [x] Cập nhật `ProgramTable.tsx` tích hợp nút Workspace (`LayoutDashboard`), nút tiếp nhận (`UserPlus`), nút chia nhóm (`Users`) và cột hiển thị số lượng đơn chờ.
9. [x] Cập nhật `HrProgramManagementPage.tsx` điều phối state các modal và tự động làm mới `fetchPendingCounts`.
10. [x] Kiểm tra build `npx tsc --noEmit` & `npm run build` thành công không lỗi.

---

## 11. Program Workspace & Direct Enrollment Extension (Phương Án 1: Chuyển Đổi Vào Program)

> [!IMPORTANT]
> **Cải tiến Trải nghiệm Người dùng (UX Enhancement - Phương án 1):**
> Nhằm khắc phục tình trạng phân mảnh khi HR phải duyệt hồ sơ riêng rẽ trên Dashboard rồi mới gán vào chương trình thực tập, hệ thống nâng cấp giao diện quản lý chương trình (`HrProgramManagementPage` & `ProgramTable`) thành trung tâm điều phối tiếp nhận ứng viên.

### 11.1. Luồng Giao Diện Mới trên Program Management

1. **Thanh Hiển Thị Hồ Sơ Ứng Tuyển Chờ Duyệt (`pendingApplicationsCount`):**
   - Tại cột *"Tiếp Nhận & Đơn Chờ"* trên mỗi dòng chương trình trong `ProgramTable`, giao diện hiển thị đồng thời:
     - Tỷ lệ tiếp nhận hiện tại: `currentParticipants / maxParticipants`.
     - Huy hiệu cảnh báo hồ sơ chờ xét duyệt: Badge màu vàng/cam thể hiện số lượng ứng viên `PENDING` đang đăng ký vào kỳ.
2. **Nút Điều Hướng Không Gian Làm Việc (Workspace Button):**
   - Icon `<LayoutDashboard size={15} />`: Bấm để chuyển hướng sang `/hr/programs/{id}`, mở ra toàn bộ không gian làm việc chuyên sâu của riêng kỳ thực tập đó (danh sách thành viên, nhóm, nhiệm vụ, mentor).
3. **Nút Tiếp Nhận & Xét Duyệt Vào Kỳ (Enroll Button):**
   - Icon `<UserPlus size={15} />`: Mở trực tiếp `EnrollInternModal` với ngữ cảnh đã chọn sẵn chương trình mục tiêu.

### 11.2. Component `EnrollInternModal`
- **Chức năng:**
  - Tải danh sách các ứng viên có trạng thái `PENDING` có nguyện vọng ứng tuyển vào phòng ban của chương trình hoặc chưa có chương trình.
  - Cho phép lọc, tìm kiếm theo tên/email/trường, chọn checkbox từng ứng viên hoặc chọn tất cả.
  - Hiển thị sức chứa còn lại của chương trình để cảnh báo không chọn quá chỉ tiêu.
  - Nút *"Xác Nhận Tiếp Nhận Vào Kỳ"*: Gọi `programService.enrollInterns(program.id, { internIds })`.
  - Khi hoàn tất: Hiển thị Toast thông báo thành công, đóng modal, gọi `fetchPrograms()` và `fetchPendingCounts()` để đồng bộ tức thì.

### 11.3. Tiêu Chí Nghiệm Thu Bổ Sung (Acceptance Criteria - Frontend Extension)

- [x] **AC-10:** Mỗi dòng chương trình trong `ProgramTable` hiển thị rõ ràng số lượng hồ sơ đang chờ xét duyệt (`pendingApplicationsCount`).
- [x] **AC-11:** Nút Workspace `<LayoutDashboard />` điều hướng chính xác đến trang Workspace của chương trình `/hr/programs/{id}`.
- [x] **AC-12:** Nút `<UserPlus />` mở đúng `EnrollInternModal` với thông tin chương trình tương ứng.
- [x] **AC-13:** Trong `EnrollInternModal`, HR có thể chọn nhiều ứng viên cùng lúc và tiếp nhận hàng loạt thành công.
- [x] **AC-14:** Xử lý đầy đủ trạng thái loading, khóa tương tác khi submit, và xử lý an toàn lỗi mạng/server.
- [x] **AC-15:** Sau khi tiếp nhận thành công, số lượng đơn chờ và số lượng thực tập sinh của chương trình được cập nhật lại realtime mà không cần F5 trình duyệt.

