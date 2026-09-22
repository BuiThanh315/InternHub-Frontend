# Specification: Tích Hợp Frontend Quản Lý Thực Tập Sinh (TM-1 đến TM-5)

> **Tài liệu Đặc Tả Yêu Cầu Kỹ Thuật (Frontend Specification)**  
> **Dự án:** `InternHub-Frontend`  
> **Mã Epic / Jira Tickets:** [TM-1](https://robluccibn9935.atlassian.net/browse/TM-1), [TM-2](https://robluccibn9935.atlassian.net/browse/TM-2), [TM-3](https://robluccibn9935.atlassian.net/browse/TM-3), [TM-4](https://robluccibn9935.atlassian.net/browse/TM-4), [TM-5](https://robluccibn9935.atlassian.net/browse/TM-5)  
> **Nhánh Git:** `feature/TM-1-to-TM-5/intern-management-core` (rẽ từ `develop`)  
> **Change Level:** **L3** (Ảnh hưởng UI Form, Table, REST Client, Schema Validation Zod, Modal duyệt/từ chối, Multipart File Upload)

---

## 1. Feature Overview (Tổng Quan Tính Năng)

- **Tên tính năng:** Bộ tính năng cốt lõi quản trị Thực tập sinh (Core Intern Management Module)
- **Hệ thống liên quan:** 
  - Frontend: `InternHub-Frontend` (React 19 + TypeScript + Vite + Tailwind CSS v4)
  - Backend API: `employee-service` thông qua `api-gateway` (Port `8080`)
- **Đối tượng người dùng:**
  - **HR / Admin:** Quản lý toàn diện (Thêm mới, sửa hồ sơ, tìm kiếm nâng cao, lọc trạng thái, duyệt/từ chối tài liệu CV).
  - **Mentor:** Xem danh sách thực tập sinh, tra cứu hồ sơ và tài liệu hướng dẫn.
  - **Ứng viên / Thực tập sinh:** Nộp CV và Đơn xin thực tập trực tuyến (Public Upload).

---

## 2. Business Goal & Core Objectives (Mục Tiêu Nghiệp Vụ)

Số hóa và tự động hóa toàn bộ vòng đời thực tập sinh từ bước nộp hồ sơ đến xét duyệt trên giao diện Web hiện đại:
1. **Tiếp nhận hồ sơ chuẩn hóa (TM-1):** Cung cấp giao diện biểu mẫu thêm mới thực tập sinh với Client-side validation chặt chẽ bằng React Hook Form + Zod, hỗ trợ tự động nhận diện mã sinh viên/thực tập sinh.
2. **Chỉnh sửa & Kiểm soát State Machine (TM-2):** Cho phép HR cập nhật thông tin cá nhân, liên lạc, phân bổ mentor và chuyển đổi trạng thái thực tập sinh theo đúng quy tắc luồng vòng đời (`PENDING` → `APPROVED` / `REJECTED` → `INTERNING` → `COMPLETED`).
3. **Tìm kiếm & Phân loại đa tiêu chí (TM-3):** Tìm kiếm tức thời (Debounced 300ms) theo từ khóa (tên, mã, email, SĐT), lọc theo trường, ngành, trạng thái kèm phân trang mượt mà (TanStack Query Server-state).
4. **Tải lên tài liệu không rào cản (TM-4):** Hỗ trợ kéo thả / chọn file CV và Application Letter (PDF, DOCX <= 5MB) với thanh tiến trình và phản hồi trạng thái rõ ràng.
5. **Xét duyệt tài liệu trực quan (TM-5):** Widget "Việc Cần Xử Lý" ưu tiên cao nhất, cho phép HR xem trước (preview), tải về (download), phê duyệt 1-click hoặc từ chối bắt buộc nhập lý do qua Confirm Modal.

---

## 3. Scope of Work (Phạm Vi Tính Năng)

### 3.1. Trong phạm vi (In Scope)
- **TM-1: Modal Thêm Mới TTS (`InternFormDialog.tsx`)**:
  - Form trường: `fullName`, `email`, `phone`, `university`, `major`, `appliedPosition`, `startDate`, `academicYear`, `notes`.
  - Validate theo Zod Schema, thông báo lỗi ngay dưới từng field.
  - Gọi API `POST /api/employees/interns`, hiển thị toast thông báo thành công kèm mã TTS tự sinh.
- **TM-2: Modal Chỉnh Sửa TTS (`InternEditDialog.tsx`)**:
  - Mở từ action menu `⋮` trên từng dòng bảng.
  - Hiển thị dữ liệu hiện tại, cho phép cập nhật thông tin và trạng thái theo đúng luồng State Machine.
  - Gọi API `PUT /api/employees/interns/{id}`.
- **TM-3: Thanh Tìm Kiếm & Quick Filter (`FilterBar.tsx` & `HrDashboard.tsx`)**:
  - Ô tìm kiếm debounce 300ms gọi API với query param `keyword`.
  - Quick filter chips: Tất cả, Đang thực tập (`INTERNING`), Chờ duyệt (`SUBMITTED`), Hoàn thành (`COMPLETED`), Từ chối (`REJECTED`) hiển thị số lượng bản ghi trên từng chip.
  - Đồng bộ số lượng kết quả (`Danh sách thực tập sinh (N kết quả)`).
- **TM-4: Modal / Trang Nộp CV & Tài Liệu (`UploadDocumentDialog.tsx`)**:
  - Cho phép nhập/chọn mã TTS (`internCode`), chọn loại tài liệu (`CV`, `INTERNSHIP_APPLICATION`, `RECOMMENDATION_LETTER`).
  - Kéo thả file, kiểm tra dung lượng (< 5MB) và định dạng (.pdf, .doc, .docx).
  - Gọi API `POST /api/employees/interns/{internCode}/documents` dạng `multipart/form-data`.
- **TM-5: Widget Phê Duyệt & Tải Tài Liệu (`HrDashboard.tsx` & `ConfirmReasonDialog.tsx`)**:
  - Widget "Việc Cần Xử Lý": Danh sách tài liệu trạng thái chờ duyệt.
  - Nút **Phê duyệt**: Gọi API `PATCH /api/employees/interns/documents/{id}/review` với `status: APPROVED`.
  - Nút **Từ chối**: Mở dialog bắt buộc nhập lý do (`rejectionReason`), gửi `status: REJECTED`.
  - Tải về / Xem trước: Tải file từ endpoint `GET /api/employees/interns/documents/{id}/download`.

### 3.2. Ngoài phạm vi (Out of Scope)
- Không can thiệp sửa đổi cấu trúc bảng cơ sở dữ liệu MySQL ở Backend.
- Không tự động sinh tài khoản Keycloak (thuộc ticket TM-6).
- Không cấu hình dịch vụ gửi mail SMTP tự động ở Frontend.

---

## 4. Potential Logic Loopholes & Mitigations (Edge Cases)

1. **Trùng lặp Email hoặc Số điện thoại (409 Conflict)**:
   - *Rủi ro:* Backend trả về HTTP 409 khi email hoặc SĐT đã tồn tại.
   - *Xử lý:* Interceptor / React Query `onError` bắt lỗi 409, ánh xạ thông báo lỗi trực tiếp vào trường `email` hoặc `phone` thông qua React Hook Form `setError()`.
2. **Double Submit khi tạo/sửa hồ sơ**:
   - *Rủi ro:* Người dùng click liên tiếp nhiều lần vào nút "Lưu hồ sơ".
   - *Xử lý:* Disable nút Submit khi `isPending / isSubmitting = true`, đổi nhãn thành *"Đang lưu..."* kèm spinner.
3. **Upload File sai định dạng hoặc vượt quá 5MB**:
   - *Rủi ro:* Người dùng tải lên file .exe hoặc file dung lượng quá lớn gây lỗi server.
   - *Xử lý:* Validate kích thước `< 5 * 1024 * 1024` bytes và kiểm tra MIME type ngay tại client trước khi gọi API; hiển thị toast lỗi cụ thể nếu không hợp lệ.
4. **Từ chối tài liệu nhưng bỏ trống lý do**:
   - *Rủi ro:* HR từ chối hồ sơ nhưng không giải thích lý do khiến ứng viên không biết cách khắc phục.
   - *Xử lý:* Validate modal từ chối bắt buộc `reason.trim().length >= 5`. Nút "Xác nhận từ chối" bị vô hiệu hóa nếu chưa điền lý do.
5. **Mất kết nối mạng / Backend Server Offline**:
   - *Rủi ro:* Gateway hoặc Microservices đang khởi động hoặc rớt mạng.
   - *Xử lý:* Áp dụng cơ chế fallback thông minh (Graceful Degradation) hiển thị trạng thái Error banner với nút "Thử lại", không để màn hình bị crash trắng (White Screen of Death).

---

## 5. Functional Requirements (Yêu Cầu Chức Năng)

- **FR-FE-1 (Tạo hồ sơ TTS):** Người dùng có role `HR` hoặc `ADMIN` có thể bấm "Thêm Thực Tập Sinh" để nhập và lưu hồ sơ.
- **FR-FE-2 (Sửa hồ sơ TTS):** Cho phép mở dialog chỉnh sửa hồ sơ thực tập sinh từ menu hành động `⋮`.
- **FR-FE-3 (Tìm kiếm tức thời):** Gõ từ khóa tìm kiếm trong ô search sẽ tự động debounce 300ms và cập nhật danh sách bảng.
- **FR-FE-4 (Lọc theo trạng thái):** Bấm vào chip trạng thái (Quick filter) để lọc danh sách tương ứng.
- **FR-FE-5 (Nộp tài liệu CV):** Cho phép tải lên tệp tin tài liệu kèm mã TTS và loại tài liệu.
- **FR-FE-6 (Duyệt tài liệu):** Cho phép HR phê duyệt hoặc từ chối (kèm lý do) các tài liệu đang chờ trong widget việc cần xử lý.
- **FR-FE-7 (Tải tài liệu):** Cho phép bấm tải về file CV/tài liệu của thực tập sinh.

---

## 6. Business Rules (Quy Tắc Nghiệp Vụ)

- **BR-1 (Định dạng số điện thoại):** Bắt buộc chuỗi 10 chữ số bắt đầu bằng đầu số viễn thông Việt Nam hợp lệ (`03, 05, 07, 08, 09`).
- **BR-2 (Ràng buộc ngày tháng):** `startDate` không được để trống; nếu có `endDate` thì bắt buộc `endDate >= startDate`.
- **BR-3 (Luồng trạng thái hợp lệ):** Trạng thái tuân thủ nghiêm ngặt State Machine:
  - `SUBMITTED / PENDING` → `APPROVED` / `REJECTED`
  - `APPROVED` → `INTERNING`
  - `INTERNING` → `COMPLETED` / `DROPPED`
- **BR-4 (Quyền hạn thao tác):** Nút Thêm mới, Sửa và Duyệt tài liệu chỉ hiển thị khi `canEditIntern(role)` hoặc `canApprove(role)` trả về `true`.

---

## 7. API Contracts (Đặc Tả Kết Nối Backend)

### 7.1. Tạo mới thực tập sinh (TM-1)
- **Endpoint:** `POST /api/employees/interns`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
```json
{
  "fullName": "Nguyễn Văn An",
  "email": "an.nv@example.com",
  "phone": "0987654321",
  "university": "Đại học Bách Khoa",
  "major": "Công nghệ thông tin",
  "appliedPosition": "Backend Intern",
  "startDate": "2026-10-01",
  "academicYear": "Năm 4",
  "notes": "Ứng viên có nền tảng Java tốt"
}
```
- **Response 201 Created:**
```json
{
  "code": 201,
  "status": "CREATED",
  "message": "Tạo hồ sơ thực tập sinh thành công",
  "data": {
    "id": 12,
    "internCode": "INT-202609-0012",
    "fullName": "Nguyễn Văn An",
    "email": "an.nv@example.com",
    "phone": "0987654321",
    "university": "Đại học Bách Khoa",
    "major": "Công nghệ thông tin",
    "appliedPosition": "Backend Intern",
    "startDate": "2026-10-01",
    "status": "PENDING",
    "createdAt": "2026-09-21T16:30:00"
  }
}
```

### 7.2. Cập nhật thực tập sinh (TM-2)
- **Endpoint:** `PUT /api/employees/interns/{id}`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:** Tương tự create, kèm `status` cập nhật.
- **Response 200 OK:** `ApiResponse<InternProfile>`

### 7.3. Tìm kiếm & Lọc thực tập sinh (TM-3)
- **Endpoint:** `GET /api/employees/interns`
- **Query Params:** `keyword`, `university`, `major`, `status`, `page`, `size`, `sort`
- **Response 200 OK:** `ApiResponse<PageResponse<InternProfile>>`

### 7.4. Tải lên tài liệu (TM-4)
- **Endpoint:** `POST /api/employees/interns/{internCode}/documents`
- **Content-Type:** `multipart/form-data`
- **Form Data:**
  - `file`: File nhị phân (PDF/DOCX)
  - `documentType`: `CV` | `INTERNSHIP_APPLICATION` | `RECOMMENDATION_LETTER`
- **Response 201 Created:** `ApiResponse<DocumentResponse>`

### 7.5. Xét duyệt tài liệu (TM-5)
- **Endpoint:** `PATCH /api/employees/interns/documents/{id}/review`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body:**
```json
{
  "status": "APPROVED", // hoặc "REJECTED"
  "rejectionReason": "Lý do từ chối nếu status là REJECTED"
}
```
- **Response 200 OK:** `ApiResponse<DocumentResponse>`

---

## 8. Acceptance Criteria Checklist (Tiêu Chí Chấp Nhận)

- [ ] **AC-1 (TM-1):** Mở form "Thêm Thực Tập Sinh", validate rỗng / sai định dạng email & phone hiển thị lỗi rõ ràng. Submit dữ liệu hợp lệ gọi đúng API `POST /api/employees/interns`, đóng modal và bảng tự động cập nhật bản ghi mới.
- [ ] **AC-2 (TM-2):** Bấm action "Chỉnh sửa" từ menu `⋮` trên dòng, hiển thị đầy đủ thông tin cũ. Cập nhật thành công gọi API `PUT /api/employees/interns/{id}` và hiển thị toast thông báo.
- [ ] **AC-3 (TM-3):** Nhập từ khóa vào ô tìm kiếm, sau 300ms danh sách được lọc chính xác. Bấm các tab trạng thái (Tất cả, Đang thực tập, Chờ duyệt...) lọc theo đúng `status`.
- [ ] **AC-4 (TM-4):** Hỗ trợ upload file CV / Application letter cho thực tập sinh, chặn file > 5MB hoặc file không phải PDF/Word.
- [ ] **AC-5 (TM-5):** Widget "Việc Cần Xử Lý" hiển thị danh sách tài liệu chờ duyệt. Bấm "Phê duyệt" cập nhật trạng thái ngay lập tức; bấm "Từ chối" mở popup bắt buộc nhập lý do, gửi thành công loại bỏ tài liệu khỏi danh sách chờ.

---

## 9. Implementation File Structure Checklist

- [x] Nhánh Git: `feature/TM-1-to-TM-5/intern-management-core`
- [ ] Cấu hình API Service: `src/services/internService.ts` & `src/services/documentService.ts`
- [ ] Custom Hooks TanStack Query: `src/features/interns/hooks/useInterns.ts`
- [ ] Dialog Thêm TTS: `src/features/interns/components/InternFormDialog.tsx`
- [ ] Dialog Sửa TTS: `src/features/interns/components/InternEditDialog.tsx`
- [ ] Dialog Nộp Tài Liệu: `src/features/interns/components/UploadDocumentDialog.tsx`
- [ ] Modal Xác Nhận Từ Chối: `src/components/shared/ConfirmReasonDialog.tsx`
- [ ] Tích hợp trọn vẹn màn hình: `src/pages/hr/HrDashboard.tsx`
