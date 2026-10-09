# Specification: Nhập Thực Tập Sinh Từ Tệp Excel Vào Chương Trình Thực Tập (TM-100 Frontend)

> **Tài liệu Đặc Tả Kỹ Thuật (Frontend Specification)**  
> **Dự án:** [InternHub-Frontend](file:///d:/codegym_final_project/InternHub-Frontend) (React 19, Vite, TypeScript, CSS Modules)  
> **Mã Jira Ticket:** [TM-100](https://robluccibn9935.atlassian.net/browse/TM-100) - *Thêm thực tập sinh vào chương trình thực tập bằng tệp Excel (Excel Batch Import UI)*  
> **Trạng thái:** IMPLEMENTED  
> **Lưu trữ tại:** `InternHub-Frontend/docs/specs/TM-100-import-interns-excel-frontend-spec.md`  
> **Change Level:** **L3** (Mở rộng `EnrollInternModal` với Tab Excel, tạo sub-component `ExcelImportTab`, tải template file Blob, upload MultipartFile, xử lý Preview & Bảng lỗi chi tiết, tích hợp Design Tokens và tuân thủ 34 nguyên tắc Frontend).  
> **Tiêu chuẩn tuân thủ:** 34 Nguyên tắc bất biến ([`AGENTS.md`](file:///d:/codegym_final_project/InternHub-Frontend/AGENTS.md)), Quy chuẩn UX/UI ([`08-ui-ux-guidelines.md`](file:///d:/codegym_final_project/InternHub-Frontend/.agents/08-ui-ux-guidelines.md)) & Kỹ năng Thiết kế Giao diện Độc bản ([`frontend-design`](file:///d:/codegym_final_project/InternHub-Frontend/.agents/skills/frontend-design/SKILL.md)).

---

## 0. Nhật Ký Thay Đổi & Giải Trình Kỹ Thuật (Revision History & Change Rationale)

| Phiên bản | Ngày | Người thực hiện | Task / Jira | Loại thay đổi | Lý do & Giải trình kỹ thuật (Rationale) |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **v1.0** | 2026-10-09 | AI Senior Frontend Pair-Programmer | `TM-100` | Tạo mới Đặc Tả | Xây dựng đặc tả chi tiết cho phân hệ Frontend của tính năng nhập thực tập sinh hàng loạt từ tệp Excel trong `EnrollInternModal`, kết nối đồng bộ với 3 endpoints Backend TM-100. |
| **v1.1** | 2026-10-09 | AI Senior Frontend Pair-Programmer | `TM-100` | Hoàn thành Triển Khai | Đã hoàn thành 100% triển khai: Constants, Types, Service, ExcelImportTab (Live Ingestion Ledger, Discrepancy Inspector), tích hợp EnrollInternModal, build và lint kiểm tra thành công. |


---

## 1. Feature Overview (Tổng Quan Tính Năng)

- **Tên tính năng:** Giao diện Nhập Danh Sách Thực Tập Sinh Hàng Loạt Từ Tệp Excel (Excel Intern Batch Import UI).
- **Hệ thống liên quan:**
  - **Frontend:** `InternHub-Frontend` (React 19, TypeScript, Vite, CSS Modules, Lucide React, Axios client).
  - **Backend API:** `intern-and-program-service` (Port `8082`) qua API Gateway (Port `8080`).
- **Điểm truy cập trên giao diện (Entry Points):**
  1. Trang Quản Trị Chương Trình HR (`/hr/programs`): Nút *"Tiếp nhận"* trên mỗi dòng chương trình ➔ Mở `EnrollInternModal`.
  2. Trang Workspace Chương Trình (`/hr/programs/:id`): Nút *"Tiếp nhận TTS"* trên Header ➔ Mở `EnrollInternModal`.
- **Đối tượng người dùng & Phân quyền:** `HR`, `ADMIN` (Người có thẩm quyền quản lý chương trình thực tập).

---

## 2. Business Goal & Core Objectives (Mục Tiêu Nghiệp Vụ)

1. **Nâng cao năng suất làm việc của HR:** Giảm thời gian nhập liệu từ 30-45 phút (khi nhập thủ công 30-50 sinh viên) xuống dưới 1 phút chỉ bằng thao tác tải tệp Excel lên.
2. **Minh bạch hóa lỗi & Tự phục vụ (Self-service Validation):** Khi tệp Excel có lỗi (thiếu trường, sai format SĐT/email, trùng lặp, vượt chỉ tiêu), giao diện hiển thị bảng kê chi tiết từng dòng bị lỗi và nguyên nhân cụ thể để HR mở file sửa lại ngay mà không phải đoán mò.
3. **Trải nghiệm Preview an toàn (Preview Before Commit):** Không ghi trực tiếp mù quáng vào CSDL. Hệ thống hiển thị bản tóm tắt phân tích (số dòng hợp lệ, số dòng lỗi, số slot còn lại) kèm bảng xem trước dữ liệu mẫu trước khi người dùng bấm xác nhận.
4. **Bảo toàn ngữ cảnh (Modal-First UX):** Toàn bộ quy trình diễn ra ngay trong `EnrollInternModal`, bảo tồn 100% bộ lọc và vị trí trang hiện tại của HR.

---

## 3. Scope of Work (Phạm Vi Tính Năng)

### 3.1. Trong phạm vi (In Scope)
1. **Hạ tầng Constants & Types (Trụ cột IV & Rule 19, 20):**
   - Khai báo 3 endpoints trong `src/constants/endpoints/program.endpoints.ts`:
     - `IMPORT_TEMPLATE`: `GET /api/programs/import-template`
     - `IMPORT_PREVIEW`: `POST /api/programs/:id/import-interns/preview`
     - `IMPORT_EXCEL`: `POST /api/programs/:id/import-interns`
   - Bổ sung các Types trong `src/types/program.types.ts`: `ExcelRowError`, `ExcelInternRow`, `ExcelImportPreviewResponse`, `ExcelImportResultResponse`.
2. **Domain Service (`src/services/programService.ts`):**
   - `downloadImportTemplate(signal?: AbortSignal): Promise<Blob>`: Nhận Blob và kích hoạt tải tệp trình duyệt tự động.
   - `previewImportExcel(programId: number, file: File, signal?: AbortSignal): Promise<ExcelImportPreviewResponse>`.
   - `importInternsFromExcel(programId: number, file: File, status?: 'APPROVED' | 'PENDING', signal?: AbortSignal): Promise<ExcelImportResultResponse>`.
3. **Mở rộng `EnrollInternModal.tsx` & Tách Sub-component `ExcelImportTab.tsx`:**
   - Thêm tab thứ 3: `'excel'` (Nhập từ File Excel) bên cạnh `'pending'` và `'create'`.
   - Xây dựng component `ExcelImportTab.tsx` tách biệt (chống God File, giới hạn state <= 4):
     - Vùng kéo thả file (Drag & Drop Zone) hỗ trợ `.xlsx`, `.xls` (tối đa 5MB).
     - Nút *"Tải tệp mẫu Excel"* kèm icon và hiệu ứng tải xuống.
     - Vùng hiển thị thông tin tệp đã chọn kèm nút gỡ bỏ.
     - Skeleton Loader khi đang phân tích tệp.
     - Thống kê tóm tắt bằng các Badge trực quan: Tổng số dòng, Hợp lệ (Xanh), Lỗi (Đỏ), Slot còn trống.
     - Bảng chi tiết lỗi (Hiển thị số dòng, tên trường, dữ liệu nhập, thông báo lỗi).
     - Bảng xem trước dữ liệu hợp lệ (tối đa 10 dòng đầu).
     - Chọn trạng thái tiếp nhận: `APPROVED` (Tiếp nhận ngay) hoặc `PENDING` (Chờ duyệt).
     - Nút xác nhận nạp dữ liệu vào chương trình với hiệu ứng loading.
4. **Xử lý phản hồi (Mutation UX) & Feedback:**
   - Toast thông báo thành công khi hoàn tất, đóng modal và kích hoạt callback `onSuccess()` để làm mới bảng.
   - Giữ nguyên dữ liệu khi xảy ra lỗi mạng hoặc lỗi API server.

### 3.2. Ngoài phạm vi (Out of Scope)
- Không chỉnh sửa backend Java (Backend TM-100 đã hoàn tất và kiểm thử 100%).
- Không xử lý parse file client-side bằng thư viện JS nặng (như `xlsx`) để tránh làm phình bundle frontend; toàn bộ validation và preview được thực hiện đồng bộ qua API Backend để đảm bảo đối soát đúng dữ liệu DB.

---

## 4. Potential Edge Cases & Frontend Mitigations (Tối thiểu 5 Edge Cases)

### 4.1. Case 1: Người Dùng Chọn Tệp Sai Định Dạng Hoặc Quá Dung Lượng (Client-side Pre-check)
- **Vấn đề:** Người dùng kéo nhầm tệp `.pdf`, `.csv`, `.docx` hoặc tệp `.xlsx` có dung lượng > 5MB.
- **Giải pháp:** Kiểm tra ngay tại sự kiện `onDrop` hoặc `onChange` của input file:
  - Kiểm tra đuôi mở rộng: nếu không phải `.xlsx`, `.xls` ➔ Toast error: *"Chỉ chấp nhận tệp bảng tính Excel định dạng .xlsx hoặc .xls"*.
  - Kiểm tra kích thước: nếu `file.size > 5 * 1024 * 1024` ➔ Toast error: *"Dung lượng tệp vượt quá giới hạn 5MB"*.
  - Từ chối nhận tệp và không gửi request lên Backend.

### 4.2. Case 2: Vượt Quá Chỉ Tiêu Còn Lại Của Chương Trình (`isQuotaExceeded = true`)
- **Vấn đề:** Chương trình chỉ còn 3 slot trống, nhưng file Excel có 10 dòng hợp lệ.
- **Giải pháp:** 
  - Preview API trả về `isQuotaExceeded = true` và `availableSlots = 3`.
  - Frontend hiển thị Alert cảnh báo màu vàng đậm:
    > *"Chương trình chỉ còn 3 chỉ tiêu tiếp nhận trống, nhưng tệp có 10 ứng viên. Bạn không thể tiếp nhận toàn bộ vào kỳ này."*
  - Vô hiệu hóa nút *"Xác nhận tiếp nhận"* (`disabled = true`).

### 4.3. Case 3: Chống Double-Click Và Race Condition Khi Đang Upload
- **Vấn đề:** HR bấm nút xác nhận liên tục nhiều lần trong khi mạng chậm.
- **Giải pháp:** Khóa nút submit bằng cờ `isSubmitting`, thêm hiệu ứng xoay Spinner và đổi nhãn nút sang *"Đang tiếp nhận... (Vui lòng đợi)"*. Khóa tương tác của toàn bộ form.

### 4.4. Case 4: Mạng Bị Ngắt Hoặc Lỗi Server 500 Giữa Chừng
- **Vấn đề:** Mất mạng hoặc API Gateway timeout trong quá trình gửi MultipartRequest.
- **Giải pháp:** 
  - Bắt lỗi thông qua `try/catch` chuẩn hóa với `AppError`.
  - Hiển thị Toast thông báo lỗi rõ ràng.
  - **Tuyệt đối không đóng Modal và không xóa tệp đã chọn** để HR có thể bấm *"Thử lại"* ngay khi kết nối ổn định (Rule 24).

### 4.5. Case 5: Hủy Request Khi Đóng Modal Đột Ngột (AbortController)
- **Vấn đề:** HR chọn file lớn, trong lúc đang preview thì bấm nút X đóng modal.
- **Giải pháp:** Sử dụng `AbortController` gắn với lifecycle của component. Khi component unmount hoặc modal đóng, gọi `abortController.abort()` để hủy request ngầm, tránh rò rỉ bộ nhớ (Memory Leak) và lỗi cập nhật state unmounted.

---

## 5. UI/UX Workflow & Component Structure

### 5.1. Sơ Đồ Khối Component
```text
EnrollInternModal (Modal Container)
  ├── ModalHeader (Tiêu đề + Đóng)
  ├── ProgramBanner (Mã CT, Tên, Phòng ban, Chỉ tiêu còn lại)
  ├── TabsNav (Đơn chờ tuyển | Thêm thủ công | [MỚI] Nhập từ File Excel)
  └── Tab Content:
       ├── activeTab === 'pending'  -> ApplicantList
       ├── activeTab === 'create'   -> ManualCreateForm
       └── activeTab === 'excel'    -> ExcelImportTab (Sub-component Mới)
            ├── TemplateBanner (Hướng dẫn + Nút Tải Template .xlsx)
            ├── DropZone (Kéo thả hoặc Chọn file)
            ├── PreviewSection (Thống kê Badge, Bảng lỗi, Bảng dữ liệu)
            └── StickyFooter (Tùy chọn APPROVED/PENDING + Nút Xác nhận)
```

### 5.2. Tuân Thủ Hệ Thống Design Tokens (Rule 28):
- Màu chủ đạo: `var(--primary)`, `var(--primary-hover)`, `var(--primary-light)`.
- Trạng thái thành công: `var(--success)`, `var(--success-bg)`.
- Trạng thái cảnh báo: `var(--warning)`, `var(--warning-bg)`.
- Trạng thái lỗi: `var(--danger)`, `var(--danger-bg)`, `var(--danger-border)`.
- Nền và viền: `var(--bg-surface)`, `var(--bg-card)`, `var(--border-default)`.
- Chữ: `var(--text-main)`, `var(--text-secondary)`, `var(--text-muted)`.
- **Cấm 100% việc viết mã màu Hex trong file CSS Modules.**

### 5.3. Ứng Dụng Kỹ Năng Frontend Design (Distinctive & Intentional Design):
Tuân thủ chỉ dẫn chuyên sâu từ [frontend-design](file:///d:/codegym_final_project/InternHub-Frontend/.agents/skills/frontend-design/SKILL.md):
1. **Dành sự nổi bật vào đúng một vị trí (Spend boldness in one place):**
   - Không lạm dụng hiệu ứng trang trí hay các card bo tròn chung chung (tránh bẫy SaaS-card kit cliché).
   - Điểm nhấn thị giác trung tâm là **Khối Ledger Đối Soát Sống (Live Ingestion Ledger)**:
     - Khi chưa chọn tệp: Dropzone tinh giản, đường viền nét đứt thanh mảnh (`border: 1.5px dashed var(--border-default)`), phản hồi trạng thái kéo thả (`drag-over`) bằng viền `var(--primary)` và hào quang sáng nhẹ.
     - Khi đã chọn tệp: Dropzone thu gọn nhường chỗ cho **Bảng kiểm toán đối soát** với 2 luồng rõ ràng:
       - *Luồng xanh (Clear Passage):* Hiển thị bảng dữ liệu xem trước tối đa 10 dòng đầu với typography tinh tế, đường kẻ mờ phân tách hàng và số thứ tự rõ ràng.
       - *Luồng đỏ (Discrepancy Inspector):* Bảng tra cứu lỗi trực quan, hiển thị tag Dòng màu đỏ tươi, tên cột và câu giải thích lý do cụ thể, giúp HR sửa ngay mà không bối rối.
2. **Microcopy hành động và có chủ đích (Intentional Functional Copywriting):**
   - Loại bỏ các nhãn chung chung như *"Xác nhận"* hay *"Submit"*.
   - Sử dụng động từ hành động trực diện: *"Tiếp nhận {N} thực tập sinh vào chương trình"*, *"Tải bảng tính mẫu .xlsx"*, *"Chọn lại tệp khác"*.
   - Văn phong thông báo lỗi rõ ràng, không xin lỗi rườm rà, tập trung vào cách khắc phục.
3. **Tiết chế chuyển động (Restrained & Purposeful Motion):**
   - Không dùng animation bay lượn phân tán sự chú ý.
   - Chỉ dùng transition mượt mà (150ms - 200ms) để phản hồi hành động trực tiếp của người dùng (hover nút bấm, drag-drop vào vùng nhận tệp, hiển thị danh sách lỗi).

---

## 6. Acceptance Criteria Checklist (Tiêu Chí Chấp Nhận Frontend)

- [ ] **AC-FE-01:** Mở `EnrollInternModal` hiển thị tab thứ 3 *"Nhập từ File Excel"* với icon bảng tính trực quan.
- [ ] **AC-FE-02:** Nhấn nút *"Tải tệp mẫu"* tải về máy tính file `mau_nhap_thuc_tap_sinh.xlsx` thành công.
- [ ] **AC-FE-03:** Chọn file không đúng định dạng (vd `.pdf`) hoặc > 5MB bị chặn ngay tại Client kèm Toast cảnh báo.
- [ ] **AC-FE-04:** Kéo thả/chọn file `.xlsx` hợp lệ: tự động gọi preview, hiển thị Skeleton loader, và render bản tóm tắt phân tích (Tổng dòng, Hợp lệ, Slot còn trống).
- [ ] **AC-FE-05:** Khi file có dòng bị lỗi: hiển thị bảng lỗi chi tiết theo từng dòng màu đỏ; nút xác nhận bị vô hiệu hóa.
- [ ] **AC-FE-06:** Khi số lượng ứng viên vượt quá chỉ tiêu còn lại của chương trình: hiển thị banner cảnh báo và khóa nút xác nhận.
- [ ] **AC-FE-07:** Khi 100% dòng hợp lệ: nút xác nhận sáng lên, bấm nút gửi request import thành công, hiển thị Toast success, đóng modal và làm mới bảng danh sách chương trình/TTS.
- [ ] **AC-FE-08:** Giao diện hoàn toàn tương thích và đẹp mắt trên cả Light Mode và Dark Mode.
