# Kế Hoạch Triển Khai (Implementation Plan) - TM-13: Tải Lên & Quản Lý Hợp Đồng Thực Tập Sinh

> **Ticket:** [TM-13](https://robluccibn9935.atlassian.net/browse/TM-13) - Tải lên & Quản lý hợp đồng thực tập sinh (Intern Contract Upload & Management)  
> **Change Level:** **L3**  
> **Tài liệu đặc tả liên quan:** [`docs/specs/TM-13-contract-upload-spec.md`](file:///d:/Module_6/InternHub-Frontend/docs/specs/TM-13-contract-upload-spec.md)  
> **Tuân thủ:** 34 Nguyên tắc bất biến ([`AGENTS.md`](file:///d:/Module_6/InternHub-Frontend/AGENTS.md)) & UX/UI Guidelines ([`08-ui-ux-guidelines.md`](file:///d:/Module_6/InternHub-Frontend/.agents/08-ui-ux-guidelines.md))

---

## 1. Mục Tiêu & Kiến Trúc Dự Kiến (Architecture & Goals)

Xây dựng hoàn chỉnh giao diện và luồng nghiệp vụ phía Frontend cho tính năng **TM-13**, kết nối trực tiếp với Microservice Backend `intern-and-program-service` (Port `8082`) qua API Gateway (Port `8080`).

### Phê duyệt Endpoint & Route (Theo Nguyên tắc 17):
- **API Endpoints:**
  1. `POST /api/interns/{internCode}/contracts` (Multipart/form-data: file + metadata)
  2. `GET /api/interns/{internCode}/contracts` (Lấy danh sách hợp đồng theo mã TTS)
  3. `GET /api/interns/contracts/{contractId}/download?disposition=inline|attachment` (Xem trước / Tải file)
- **Routes:** Không tạo thêm route mới; tính năng tuân thủ quy chuẩn **Modal-First UX (Nguyên tắc 29)**, hoạt động trực tiếp trên trang HR Dashboard hiện tại.

---

## 2. Các Bước Triển Khai Chi Tiết (Implementation Steps)

### Bước 1: Khai Báo Endpoints & Types
1. Tạo [`src/constants/endpoints/contract.endpoints.ts`](file:///d:/Module_6/InternHub-Frontend/src/constants/endpoints/contract.endpoints.ts):
   - `CONTRACT_ENDPOINTS.UPLOAD: (internCode: string) => /api/interns/${internCode}/contracts`
   - `CONTRACT_ENDPOINTS.BY_INTERN: (internCode: string) => /api/interns/${internCode}/contracts`
   - `CONTRACT_ENDPOINTS.DOWNLOAD: (id: number | string) => /api/interns/contracts/${id}/download`
2. Cập nhật [`src/constants/endpoints/index.ts`](file:///d:/Module_6/InternHub-Frontend/src/constants/endpoints/index.ts) để export `CONTRACT_ENDPOINTS`.
3. Tạo [`src/types/contract.types.ts`](file:///d:/Module_6/InternHub-Frontend/src/types/contract.types.ts):
   - `ContractStatus = 'PENDING_SIGNATURE' | 'SIGNED' | 'EXPIRED' | 'TERMINATED'`
   - `ContractResponse`: DTO dữ liệu hợp đồng trả về từ Backend.
   - `UploadContractRequest`: Payload thông tin hợp đồng (`contractTitle`, `startDate`, `endDate`, `contractNumber?`, `allowanceAmount?`, `notes?`).
4. Cập nhật [`src/types/index.ts`](file:///d:/Module_6/InternHub-Frontend/src/types/index.ts) để export các types hợp đồng.

### Bước 2: Tầng Dịch Vụ API (`contractService.ts`)
1. Tạo [`src/services/contractService.ts`](file:///d:/Module_6/InternHub-Frontend/src/services/contractService.ts):
   - `uploadContract(internCode, data, file, onProgress?, signal?)`: Đóng gói `FormData`, gọi `apiClient.post`, bắt lỗi qua `AppError`.
   - `getContractsByInternCode(internCode, signal?)`: Gọi `apiClient.get` lấy danh sách hợp đồng.
   - `previewContractFile(contractId)`: Mở URL `disposition=inline` trong tab mới (`window.open`).
   - `downloadContractFile(contractId, fileName)`: Mở / tải URL `disposition=attachment`.
2. Cập nhật [`src/services/index.ts`](file:///d:/Module_6/InternHub-Frontend/src/services/index.ts) export `contractService`.

### Bước 3: Xây Dựng Component `UploadContractModal` Chuẩn 3 Khối
Tạo thư mục [`src/pages/hr/components/UploadContractModal/`](file:///d:/Module_6/InternHub-Frontend/src/pages/hr/components/UploadContractModal/):
1. **`UploadContractModal.types.ts`**: Định nghĩa props (`intern`, `isOpen`, `onClose`, `onSuccess`).
2. **`UploadContractModal.module.css`**: Áp dụng 100% Design Tokens CSS Variables, không hardcode HEX, hỗ trợ cả Dark/Light Mode.
3. **`UploadContractModal.tsx`**:
   - **Header cố định:** Icon `FileSignature`, Tiêu đề *"Tải Lên Hợp Đồng Thực Tập Sinh"*, Subtitle hiển thị `[Mã TTS] - [Họ tên]`.
   - **Body cuộn độc lập:**
     - *Vùng kéo thả tệp (Dropzone):* Chấp nhận `.pdf, .docx, .doc` $\le$ 10MB; hiển thị tên file, dung lượng, nút gỡ file; thanh progress bar khi tải lên.
     - *Form nhập liệu:*
       - `contractTitle` (bắt buộc, 3-200 ký tự)
       - `startDate` & `endDate` (bắt buộc, kiểm tra `endDate > startDate`)
       - `contractNumber` (tùy chọn, placeholder tự sinh)
       - `allowanceAmount` (tùy chọn, tự động format tiền tệ VND)
       - `notes` (tùy chọn, đếm ký tự $\le$ 1000)
     - Viền focus đổi màu tím `var(--primary)` + glow theo **Nguyên tắc 30**.
   - **Sticky Footer:** Nút *"Hủy"* và nút *"Tải Lên Hợp Đồng"* (khóa tương tác chống double-click, spinner khi submitting).
   - **Xử lý lỗi (Nguyên tắc 24):** Giữ nguyên modal và dữ liệu khi gặp lỗi mạng/500/409, báo lỗi chi tiết.
4. Export qua [`src/pages/hr/components/index.ts`](file:///d:/Module_6/InternHub-Frontend/src/pages/hr/components/index.ts).

### Bước 4: Nâng Cấp `DetailInternModal.tsx` (Tab Hợp Đồng & Pháp Lý)
1. Thêm tab **"Hợp đồng"** bên cạnh các tab hiện tại.
2. Tự động tải danh sách hợp đồng qua `contractService.getContractsByInternCode(intern.internCode)`.
3. Hiển thị:
   - Trạng thái rỗng (Empty State) với minh họa và nút CTA *"Tải lên hợp đồng đầu tiên"* (khi TTS ở trạng thái `APPROVED` / `INTERNING`).
   - Danh sách thẻ hợp đồng: Số HĐ, Tiêu đề, Thời hạn thực tập, Mức phụ cấp, Badge trạng thái, Người tải & Ngày tạo.
   - Nút hành động nhanh: **Xem trước (Preview)** & **Tải về (Download)**.
   - Nút CTA góc trên: *"+ Tải lên hợp đồng mới"*.

### Bước 5: Nâng Cấp `HrInternTable.tsx` (Thao Tác Nhanh Trên Bảng)
1. Bổ sung nút **"Hợp đồng"** (icon `FileSignature`) trong cột *Thao Tác Hồ Sơ*.
2. Logic phân quyền & điều kiện:
   - Trạng thái `APPROVED` hoặc `INTERNING`: Nút sáng rõ, click mở `UploadContractModal`.
   - Trạng thái `PENDING`: Nút mờ (disabled), tooltip *"Cần phê duyệt tiếp nhận hồ sơ trước khi ký hợp đồng"*.
   - Trạng thái `REJECTED`: Disabled kèm tooltip giải thích.

### Bước 6: Tích Hợp Trên `HrDashboard.tsx`
1. Khai báo state `selectedInternForContract: InternProfile | null`.
2. Kết nối prop `onOpenContractModal` từ `HrInternTable` và `DetailInternModal`.
3. Khi upload thành công: Hiển thị Toast thông báo, đóng modal, gọi `refetch()` làm mới dữ liệu.

### Bước 7: Kiểm Thử & Nghiệm Thu
1. Chạy `npm run build` để kiểm tra TypeScript type check và cú pháp.
2. Kiểm tra giao diện trên trình duyệt với các trường hợp:
   - Hồ sơ `PENDING`: Nút bị disable.
   - Hồ sơ `APPROVED`: Mở modal tải lên thành công.
   - Validate lỗi `endDate <= startDate` và file sai định dạng.
   - Xem trước file PDF và tải file về máy.

---

## 3. Danh Sách Tệp Tác Động (Impacted Files)

| Thao tác | Đường dẫn file | Mô tả |
| :---: | :--- | :--- |
| **Tạo mới** | `src/constants/endpoints/contract.endpoints.ts` | Định nghĩa endpoints hợp đồng |
| **Cập nhật** | `src/constants/endpoints/index.ts` | Barrel export endpoints |
| **Tạo mới** | `src/types/contract.types.ts` | Khai báo types và DTOs hợp đồng |
| **Cập nhật** | `src/types/index.ts` | Barrel export contract types |
| **Tạo mới** | `src/services/contractService.ts` | Service gọi API hợp đồng |
| **Cập nhật** | `src/services/index.ts` | Barrel export contractService |
| **Tạo mới** | `src/pages/hr/components/UploadContractModal/UploadContractModal.types.ts` | Interface props cho Modal |
| **Tạo mới** | `src/pages/hr/components/UploadContractModal/UploadContractModal.module.css` | Styles CSS Module (Tokens) |
| **Tạo mới** | `src/pages/hr/components/UploadContractModal/UploadContractModal.tsx` | Component modal tải lên HĐ chuẩn 3 khối |
| **Cập nhật** | `src/pages/hr/components/index.ts` | Export component modal |
| **Cập nhật** | `src/pages/hr/components/DetailInternModal.tsx` | Bổ sung tab Quản lý Hợp đồng |
| **Cập nhật** | `src/pages/hr/components/HrInternTable.tsx` | Thêm nút Hợp đồng có điều kiện trạng thái |
| **Cập nhật** | `src/pages/hr/HrDashboard.tsx` | Điều phối state modal hợp đồng |
| **Tạo mới** | `docs/specs/TM-13-contract-upload-plan.md` | Lưu bản kế hoạch vào kho mã nguồn |

---

## 4. Kế Hoạch Kiểm Thử (Verification Plan)

- **Manual Testing Scenarios:**
  1. Kiểm tra hiển thị nút Hợp đồng trên từng trạng thái (`PENDING`, `APPROVED`, `INTERNING`, `REJECTED`).
  2. Kiểm tra kéo thả file `.pdf`, kiểm tra chặn file `.exe` hoặc file > 10MB.
  3. Kiểm tra kiểm tra hợp lệ ngày tháng: Chọn `endDate <= startDate` $\rightarrow$ Hiện lỗi đỏ, nút submit bị khóa.
  4. Thực hiện upload hợp đồng với tài khoản HR $\rightarrow$ Đảm bảo Backend trả về HTTP 201 Created.
  5. Mở Modal Chi tiết TTS $\rightarrow$ Chuyển sang tab "Hợp đồng" $\rightarrow$ Kiểm tra danh sách hiển thị đầy đủ thông tin hợp đồng vừa tạo.
  6. Click nút "Xem trước" $\rightarrow$ Mở file hợp đồng trong tab mới.
  7. Click nút "Tải về" $\rightarrow$ Trình duyệt tải file hợp đồng về máy.
- **Automated Verification:**
  - Chạy lệnh build: `npm run build` không phát sinh lỗi TypeScript.
