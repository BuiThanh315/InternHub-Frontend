# Specification: Tải Lên & Quản Lý Hợp Đồng Thực Tập Sinh (TM-13)

> **Tài liệu Đặc Tả Yêu Cầu Kỹ Thuật Giao Diện (Frontend Specification)**  
> **Dự án:** `InternHub-Frontend`  
> **Mã Jira Ticket:** [TM-13](https://robluccibn9935.atlassian.net/browse/TM-13) - Tải lên & Quản lý hợp đồng thực tập sinh (Intern Contract Upload & Management)  
> **Nhánh Git dự kiến:** `feature/TM-13/contract-upload`  
> **Change Level:** **L3** (Tạo mới Model & Contract Types, Endpoint, Service Layer, Component Modal Upload Hợp Đồng chuẩn 3 khối, Tab quản lý hợp đồng trong DetailInternModal, Action button trên bảng quản trị TTS)  
> **Tiêu chuẩn tuân thủ:** 34 Nguyên tắc bất biến ([`AGENTS.md`](file:///d:/Module_6/InternHub-Frontend/AGENTS.md)) & Quy chuẩn UX/UI ([`08-ui-ux-guidelines.md`](file:///d:/Module_6/InternHub-Frontend/.agents/08-ui-ux-guidelines.md))

---

## 1. Feature Overview (Tổng Quan Tính Năng)

- **Tên tính năng:** Tải lên & Quản lý Hợp đồng Thực tập sinh (Intern Contract Upload & Management Flow).
- **Hệ thống liên quan:**
  - **Frontend:** `InternHub-Frontend` (React 19, TypeScript, Vite, CSS Modules, Lucide React, Axios client).
  - **Backend API:** `intern-and-program-service` (Port `8082`) kết nối qua API Gateway (Port `8080`).
- **Đối tượng người dùng & Phân quyền:**
  - **HR / Admin (`ROLE_HR`, `ROLE_ADMIN`):** Có toàn quyền tạo mới, tải lên file hợp đồng, điền thông tin pháp lý (tiêu đề, số HĐ, thời hạn thực tập, phụ cấp) cho thực tập sinh đủ điều kiện; xem danh sách, xem trước và tải xuống các hợp đồng đã lưu.
  - **Mentor (`ROLE_MENTOR`):** Được xem danh sách và xem trước/tải xuống hợp đồng của thực tập sinh thuộc quyền hướng dẫn.
  - **Thực tập sinh (`ROLE_INTERN`):** Được xem danh sách và tải về bản sao hợp đồng của chính mình.

---

## 2. Business Goal & Core Objectives (Mục Tiêu Nghiệp Vụ)

1. **Số hóa thủ tục tiếp nhận sau phê duyệt:** Cung cấp cầu nối giữa khâu duyệt hồ sơ (`APPROVED` ở TM-11) và khâu chính thức bắt đầu thực tập (`INTERNING`). Giúp HR dễ dàng phát hành và lưu trữ hợp đồng thực tập có giá trị pháp lý.
2. **Trải nghiệm Modal-First & Bảo toàn ngữ cảnh (Zero Context-Switching):** Mọi thao tác tải lên hợp đồng diễn ra qua Modal chuẩn 3 khối ngay trên trang Quản lý TTS hoặc từ Modal Xem Chi Tiết Hồ Sơ, không chuyển trang gây mất bộ lọc hay vị trí phân trang.
3. **Kiểm soát chặt chẽ điều kiện tiên quyết (Eligibility Guardrails):** Ngăn chặn HR tải hợp đồng cho ứng viên chưa được duyệt (`PENDING`) hoặc đã bị từ chối (`REJECTED`) bằng cả cảnh báo UX trực quan ở Client và xử lý lỗi chuẩn xác từ Backend.
4. **Bảo toàn dữ liệu biểu mẫu khi có lỗi (Safe Mutation UX):** Nếu upload thất bại (lỗi mạng, máy chủ 500, trùng số hợp đồng 409), modal vẫn giữ nguyên toàn bộ file và thông tin đã nhập, hiển thị thông báo lỗi rõ ràng để người dùng hiệu chỉnh.
5. **Hỗ trợ định dạng tiền tệ & thời gian trực quan:** Tự động định dạng phụ cấp theo chuẩn tiền tệ VND (`3.000.000 ₫`), kiểm tra tính hợp lệ của khoảng thời gian (`endDate > startDate`).

---

## 3. Scope of Work (Phạm Vi Công Việc)

### 3.1. Trong phạm vi (In Scope)

1. **Hạ tầng Constants & TypeScript Types:**
   - Khai báo file `src/constants/endpoints/contract.endpoints.ts` và export qua `src/constants/endpoints/index.ts`.
   - Khai báo file `src/types/contract.types.ts`: Enum `ContractStatus`, DTOs `ContractResponse`, `UploadContractRequest`.
2. **Service Layer (`contractService.ts`):**
   - Xây dựng `src/services/contractService.ts` với các phương thức:
     - `uploadContract(internCode: string, data: UploadContractRequest, file: File, onProgress?: (percent: number) => void, signal?: AbortSignal): Promise<ContractResponse>`
     - `getContractsByInternCode(internCode: string, signal?: AbortSignal): Promise<ContractResponse[]>`
     - `getContractDownloadUrl(contractId: number, disposition: 'inline' | 'attachment'): string`
     - `previewContractFile(contractId: number): void`
     - `downloadContractFile(contractId: number, fileName?: string): void`
3. **Component Modal Upload Hợp Đồng Chuẩn 3 Khối (`UploadContractModal`):**
   - Tạo `src/pages/hr/components/UploadContractModal/`:
     - `UploadContractModal.tsx`
     - `UploadContractModal.types.ts`
     - `UploadContractModal.module.css`
   - Form nhập liệu gồm:
     - Vùng kéo thả tệp (Drag & Drop zone) hỗ trợ `.pdf`, `.docx`, `.doc` $\le$ 10MB. Hiển thị tiến trình tải lên (Progress Bar).
     - Tiêu đề hợp đồng (`contractTitle`, bắt buộc, 3 - 200 ký tự).
     - Ngày bắt đầu (`startDate`) & Ngày kết thúc (`endDate`) (bắt buộc, validate `endDate > startDate`).
     - Số hiệu hợp đồng (`contractNumber`, tùy chọn, có gợi ý *"Hệ thống sẽ tự sinh nếu để trống"*).
     - Mức phụ cấp hàng tháng (`allowanceAmount`, tùy chọn, tự format số VND).
     - Ghi chú (`notes`, tùy chọn, đếm ký tự $\le$ 1000).
4. **Tích hợp Quản Lý Hợp Đồng Vào Modal Chi Tiết (`DetailInternModal.tsx`):**
   - Bổ sung Tab hoặc Khối **"Hợp đồng & Pháp lý"**:
     - Hiển thị danh sách các hợp đồng của thực tập sinh theo thứ tự mới nhất.
     - Badge trạng thái hợp đồng (`PENDING_SIGNATURE`, `SIGNED`, `EXPIRED`, `TERMINATED`).
     - Nút hành động nhanh trên mỗi hợp đồng: **Xem trước (Preview)** trong tab mới và **Tải về (Download)**.
     - Nút CTA **"Tải lên hợp đồng mới"** (chỉ hiển thị khi TTS ở trạng thái `APPROVED` hoặc `INTERNING`).
5. **Tích hợp Nút Hành Động Trên Bảng Quản Trị TTS (`HrInternTable.tsx`):**
   - Thêm nút / icon **"Tạo hợp đồng"** (FileSignature hoặc FilePlus) ở cột Thao tác.
   - Nút chỉ kích hoạt (enabled) khi hồ sơ ở trạng thái `APPROVED` hoặc `INTERNING`. Nếu hồ sơ `PENDING` hoặc `REJECTED`, hiển thị tooltip giải thích lý do không thể tạo hợp đồng.

### 3.2. Ngoài phạm vi (Out of Scope)

- Chức năng ký số / xác nhận điện tử từ phía ứng viên (thuộc ticket TM-14: Intern Contract Signature Flow).
- Gửi email thông báo đính kèm hợp đồng (Backend và microservice `reporting-and-integration-service` phụ trách qua RabbitMQ / Mail Service).
- Can thiệp hoặc chỉnh sửa mã nguồn Backend Java (tuân thủ Trụ cột II, Nguyên tắc 7).

---

## 4. Potential Logic Loopholes & Mitigations (Lỗ Hổng Logic & Giải Pháp Frontend)

| STT | Tình huống ngoại lệ (Edge Case) | Rủi ro kỹ thuật / UX | Giải pháp thiết kế & Xử lý Frontend |
| :---: | :--- | :--- | :--- |
| **1** | HR chọn tạo hợp đồng cho TTS đang ở trạng thái `PENDING` hoặc `REJECTED` | Backend trả lỗi 400: *"Chỉ có thể tải lên hợp đồng cho thực tập sinh đã được phê duyệt..."* | Chặn ngay tại UI: Vô hiệu hóa nút trên Table, hiển thị tooltip *"Hồ sơ chưa được phê duyệt tiếp nhận"*. Trong Modal nếu mở ra thì hiển thị cảnh báo đỏ và khóa nút gửi. |
| **2** | HR chọn Ngày kết thúc nhỏ hơn hoặc bằng Ngày bắt đầu (`endDate <= startDate`) | Backend trả lỗi 400 validation, gây gián đoạn quá trình nộp | Validate realtime ở Client: Báo lỗi đỏ dưới ô `endDate`: *"Ngày kết thúc thực tập phải sau ngày bắt đầu"*. Vô hiệu hóa nút Submit cho đến khi sửa hợp lệ. |
| **3** | Tải lên file sai định dạng (ảnh `.png`, file nén `.zip`, mã độc `.exe`) hoặc file quá 10MB | Gây lỗi 400 Bad Request từ API Gateway hoặc Service, tốn băng thông | Validate ngay khi chọn tệp: Kiểm tra MIME type và extension thuộc whitelist (`.pdf`, `.docx`, `.doc`), kiểm tra `file.size <= 10 * 1024 * 1024`. Nếu sai, hiển thị Toast cảnh báo và không đưa vào hàng đợi tải lên. |
| **4** | HR nhập trùng `contractNumber` đã có trong hệ thống | Backend trả về HTTP 409 Conflict | Bắt lỗi 409 từ API, giữ nguyên modal và toàn bộ form, bôi đỏ trường `contractNumber` kèm thông báo: *"Mã hợp đồng này đã tồn tại, vui lòng nhập mã khác hoặc để trống để hệ thống tự sinh"*. |
| **5** | Mạng chập chờn hoặc upload file lớn bị timeout / lỗi 500 | HR mất công nhập lại các trường thông tin | **Tuân thủ Nguyên tắc 24**: Giữ nguyên Modal, giữ nguyên file và dữ liệu đã điền, hiển thị alert banner lỗi màu đỏ có nút *"Thử lại"* (Retry). |
| **6** | Double-click nút "Xác Nhận Tải Lên" khi đang upload file | Gửi 2 multipart request đồng thời, gây trùng lặp file và lỗi xung đột mã HĐ | Khóa tương tác (`isSubmitting = true`), vô hiệu hóa nút bấm và backdrop, hiển thị thanh tiến trình % tải lên và hiệu ứng spinner. |
| **7** | Người dùng nhập số tiền phụ cấp dạng text hoặc số âm | Lỗi định dạng dữ liệu DTO | Sử dụng ô nhập số định dạng tiền tệ chuyên dụng: Tự động format dấu chấm phân tách hàng nghìn (`1.000.000 ₫`), chỉ cho phép nhập ký tự số nguyên dương $\ge 0$. |

---

## 5. Functional Requirements (Yêu Cầu Chức Năng)

- **FR-1 (Kích hoạt Modal Upload):**
  - Cho phép mở `UploadContractModal` từ nút hành động trên từng dòng của `HrInternTable` (đối với dòng có trạng thái `APPROVED` hoặc `INTERNING`).
  - Cho phép mở `UploadContractModal` từ Tab "Hợp đồng" trong `DetailInternModal`.
- **FR-2 (Kéo thả & Chọn tệp văn bản hợp đồng):**
  - Hỗ trợ kéo thả file hoặc click để duyệt file từ máy tính.
  - Hiển thị tên file gốc, dung lượng file (tính theo KB/MB), icon tương ứng với loại file (PDF / DOCX). Có nút "Xóa / Chọn lại file".
- **FR-3 (Form Nhập Liệu Hợp Đồng):**
  - `contractTitle` (Bắt buộc, input text, 3 - 200 ký tự).
  - `startDate` & `endDate` (Bắt buộc, input date theo định dạng YYYY-MM-DD, kiểm tra logic `endDate > startDate`).
  - `contractNumber` (Không bắt buộc, input text, 3 - 50 ký tự, có placeholder *"Bỏ trống để tự sinh (HDTT-YYYYMM-XXXX)"*).
  - `allowanceAmount` (Không bắt buộc, input number có auto format VNĐ).
  - `notes` (Không bắt buộc, textarea tối đa 1000 ký tự, có đếm ký tự realtime).
- **FR-4 (Gửi Multipart Request & Theo Dõi Tiến Trình):**
  - Gửi dữ liệu qua `POST /api/interns/{internCode}/contracts` với header `multipart/form-data`.
  - Hiển thị phần trăm upload tiến trình (`onUploadProgress`) nếu file dung lượng lớn.
- **FR-5 (Phản hồi sau khi tải lên thành công):**
  - Hiển thị thông báo Toast thành công: *"Tải lên hợp đồng thành công (Mã HĐ: [contractNumber])"*.
  - Tự động đóng modal tải lên.
  - Làm mới dữ liệu danh sách hợp đồng trong `DetailInternModal` hoặc cập nhật bảng `HrInternTable`.
- **FR-6 (Xem Danh Sách & Xem Trước Hợp Đồng):**
  - Gọi API `GET /api/interns/{internCode}/contracts` để hiển thị danh sách lịch sử hợp đồng của ứng viên trong `DetailInternModal`.
  - Click icon mắt (Preview) để mở xem trực tiếp file PDF trong tab mới qua URL `/api/interns/contracts/{id}/download?disposition=inline`.
  - Click icon tải về (Download) để tải file về máy qua URL `/api/interns/contracts/{id}/download?disposition=attachment`.

---

## 6. Business Rules (Quy Tắc Nghiệp Vụ)

- **BR-1 (Điều kiện hồ sơ):** Chỉ thực tập sinh ở trạng thái `APPROVED` (Đã tiếp nhận) hoặc `INTERNING` (Đang thực tập) mới được phép tạo hợp đồng. Hồ sơ `PENDING`, `REJECTED`, `COMPLETED` không được phép tạo hợp đồng mới.
- **BR-2 (Định dạng file cho phép):** Chỉ chấp nhận định dạng `.pdf`, `.docx`, `.doc`. Định dạng ưu tiên khuyến nghị là `.pdf`. Dung lượng tối đa không quá **10MB** (10,485,760 bytes).
- **BR-3 (Thời hạn hợp đồng):** Ngày bắt đầu (`startDate`) và Ngày kết thúc (`endDate`) bắt buộc phải có giá trị và thỏa mãn điều kiện `endDate > startDate`.
- **BR-4 (Mã số hợp đồng):** Nếu HR không nhập `contractNumber`, hệ thống Backend sẽ tự động sinh mã dạng `HDTT-YYYYMM-XXXX`. Nếu nhập thủ công, mã không được trùng lặp với bất kỳ hợp đồng nào đã có trong hệ thống (Unique Constraint).
- **BR-5 (Trạng thái vòng đời hợp đồng):**
  - `PENDING_SIGNATURE` (Chờ ký): Mặc định khi HR vừa tải lên.
  - `SIGNED` (Đã ký): Đã hoàn tất thủ tục ký.
  - `EXPIRED` (Hết hạn): Đã qua ngày `endDate`.
  - `TERMINATED` (Chấm dứt): Bị hủy bỏ/chấm dứt trước thời hạn.
- **BR-6 (Lịch sử phiên bản):** Cho phép một thực tập sinh có nhiều hợp đồng theo thời gian (HĐ ban đầu, Phụ lục gia hạn, HĐ tái ký). Không ghi đè bản ghi cũ mà lưu thành bản ghi mới.
- **BR-7 (Bảo mật & Phân quyền):** Thao tác tải lên hợp đồng yêu cầu quyền `ROLE_HR` hoặc `ROLE_ADMIN`. Quyền `ROLE_MENTOR` và `ROLE_INTERN` chỉ được xem và tải về.

---

## 7. Data Models & API Contract (Giao Thức Dữ Liệu)

### 7.1. TypeScript Interface (`src/types/contract.types.ts`)

```typescript
// Trạng thái hợp đồng khớp 100% với Backend enum ContractStatus
export type ContractStatus =
  | 'PENDING_SIGNATURE'
  | 'SIGNED'
  | 'EXPIRED'
  | 'TERMINATED';

// DTO phản hồi chi tiết hợp đồng từ Backend
export interface ContractResponse {
  id: number;
  internCode: string;
  internFullName?: string;
  contractNumber: string;
  contractTitle: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  allowanceAmount?: number | null;
  status: ContractStatus;
  originalFileName: string;
  fileSize: number;
  contentType: string;
  uploadedBy: string;
  signedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
}

// Request payload gửi lên từ form
export interface UploadContractRequest {
  contractTitle: string;
  startDate: string;
  endDate: string;
  contractNumber?: string;
  allowanceAmount?: number;
  notes?: string;
}
```

### 7.2. Endpoints Definition (`src/constants/endpoints/contract.endpoints.ts`)

```typescript
export const CONTRACT_ENDPOINTS = {
  BASE: '/api/interns',
  UPLOAD: (internCode: string) => `/api/interns/${internCode}/contracts`,
  BY_INTERN: (internCode: string) => `/api/interns/${internCode}/contracts`,
  DOWNLOAD: (contractId: number | string) => `/api/interns/contracts/${contractId}/download`,
} as const;
```

### 7.3. REST API Contracts

#### API 1: Tải Lên Hợp Đồng Mới
- **Endpoint:** `POST /api/interns/{internCode}/contracts`
- **Content-Type:** `multipart/form-data`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Form Data Fields:**
  - `file`: `File` (Binary, Bắt buộc, `.pdf`, `.docx`, `.doc` $\le$ 10MB)
  - `contractTitle`: `string` (Bắt buộc, 3 - 200 ký tự)
  - `startDate`: `string` (Bắt buộc, `YYYY-MM-DD`)
  - `endDate`: `string` (Bắt buộc, `YYYY-MM-DD`)
  - `contractNumber`: `string` (Không bắt buộc, 3 - 50 ký tự)
  - `allowanceAmount`: `number` (Không bắt buộc, $\ge 0$)
  - `notes`: `string` (Không bắt buộc, $\le 1000$ ký tự)
- **Response 201 Created:**
```json
{
  "success": true,
  "message": "Tải lên hợp đồng thực tập thành công",
  "data": {
    "id": 1,
    "internCode": "INT-202609-0001",
    "internFullName": "Nguyễn Văn A",
    "contractNumber": "HDTT-202609-0001",
    "contractTitle": "Hợp đồng thực tập kỹ thuật phần mềm",
    "startDate": "2026-10-01",
    "endDate": "2026-12-31",
    "allowanceAmount": 3000000.0,
    "status": "PENDING_SIGNATURE",
    "originalFileName": "hop_dong_thuc_tap.pdf",
    "fileSize": 245120,
    "contentType": "application/pdf",
    "uploadedBy": "hr_manager",
    "signedAt": null,
    "notes": "Hợp đồng thực tập 3 tháng đợt 2",
    "createdAt": "2026-09-25T09:00:00",
    "updatedAt": "2026-09-25T09:00:00"
  }
}
```
- **Response 400 Bad Request:**
```json
{
  "success": false,
  "message": "Chỉ có thể tải lên hợp đồng cho thực tập sinh đã được phê duyệt tiếp nhận (APPROVED) hoặc đang thực tập (INTERNING)",
  "errors": ["Hồ sơ thực tập sinh INT-202609-0002 đang ở trạng thái PENDING, không đủ điều kiện tạo hợp đồng"]
}
```
- **Response 409 Conflict:**
```json
{
  "success": false,
  "message": "Mã hợp đồng 'HDTT-202609-0001' đã tồn tại trên hệ thống",
  "errors": ["Trùng lặp dữ liệu duy nhất"]
}
```

#### API 2: Lấy Danh Sách Hợp Đồng Của Thực Tập Sinh
- **Endpoint:** `GET /api/interns/{internCode}/contracts`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Response 200 OK:**
```json
{
  "success": true,
  "message": "Lấy danh sách hợp đồng thành công",
  "data": [
    {
      "id": 1,
      "internCode": "INT-202609-0001",
      "contractNumber": "HDTT-202609-0001",
      "contractTitle": "Hợp đồng thực tập kỹ thuật phần mềm",
      "startDate": "2026-10-01",
      "endDate": "2026-12-31",
      "allowanceAmount": 3000000.0,
      "status": "PENDING_SIGNATURE",
      "originalFileName": "hop_dong_thuc_tap.pdf",
      "fileSize": 245120,
      "uploadedBy": "hr_manager",
      "createdAt": "2026-09-25T09:00:00"
    }
  ]
}
```

#### API 3: Tải / Xem Trực Tiếp Hợp Đồng
- **Endpoint:** `GET /api/interns/contracts/{contractId}/download?disposition=inline|attachment`
- **Query Params:** `disposition` (`inline` xem trên tab mới, `attachment` tải về máy)
- **Response:** Nhị phân file stream (`Resource`), `Content-Type: application/pdf`, `Content-Disposition: inline; filename="hop_dong.pdf"`.

---

## 8. UI/UX Design Specifications (Tuân Thủ 08-ui-ux-guidelines)

### 8.1. Modal Upload Hợp Đồng Chuẩn 3 Khối (`UploadContractModal`)

Cấu trúc tuân thủ nghiêm ngặt **Trụ cột VI, Nguyên tắc 29** (Modal-First UX & Cấu trúc 3 khối bảo toàn ngữ cảnh):

1. **Khối 1: Header Cố Định (Fixed Header)**
   - Biểu tượng `FileSignature` hoặc `Scroll` kết hợp tiêu đề trang trọng: *"Tải Lên Hợp Đồng Thực Tập Sinh"*.
   - Subtitle hiển thị thông tin ứng viên: `[Mã TTS] - [Họ và tên]` (ví dụ: `INT-202609-0001 - Nguyễn Văn A`).
   - Nút `X` đóng modal ở góc trên bên phải.
2. **Khối 2: Body Cuộn Độc Lập (Scrollable Body, `max-height: 70vh`)**
   - **Khu vực tải file (Dropzone):**
     - Hỗ trợ kéo thả tệp hoặc click chọn file.
     - Giới hạn chấp nhận: `.pdf, .docx, .doc`, dung lượng tối đa 10MB.
     - Khi đã chọn file: Hiển thị Card tệp gồm Icon loại tệp, Tên tệp gốc, Kích thước (MB), nút "Chọn lại / Xóa".
     - Thanh tiến trình Shimmer/Progress khi đang upload.
   - **Lưới trường thông tin hợp đồng (Form Controls):**
     - *Tiêu đề hợp đồng* (`<Input>`): Bắt buộc, autofocus, placeholder *"VD: Hợp đồng thực tập kỹ thuật phần mềm đợt 2"*.
     - *Thời hạn thực tập*: Bố trí 2 cột ngang gồm *Ngày bắt đầu* và *Ngày kết thúc* (`<Input type="date">`). Tự động so sánh và hiển thị lỗi viền đỏ nếu `endDate <= startDate`.
     - *Số hiệu hợp đồng* (`<Input>`): Tùy chọn, placeholder *"Tự động sinh (HDTT-YYYYMM-XXXX) nếu để trống"*.
     - *Mức phụ cấp hàng tháng* (`<Input>`): Tùy chọn, tự động định dạng tiền tệ VND, có ký hiệu đơn vị `₫` ở đuôi.
     - *Ghi chú bổ sung* (`<textarea>`): Tùy chọn, có bộ đếm ký tự (`x / 1000`).
   - **Tương tác Focus / Error (Tuân thủ Nguyên tắc 30):**
     - Khi focus vào bất kỳ ô nhập nào: Viền chuyển sang màu `var(--primary)` kèm hào quang ánh sáng `box-shadow: 0 0 0 3px var(--primary-glow)`.
     - Chữ hiển thị đậm nét, dễ đọc, tương phản cao (font-weight: 500, font-size: 15px).
3. **Khối 3: Sticky Footer Ghim Cố Định**
   - Nền `var(--bg-surface)`, viền trên phân cách nhẹ `var(--border-soft)`.
   - Nút *"Hủy Bỏ"* bên trái (`variant="secondary"`).
   - Nút *"Tải Lên Hợp Đồng"* bên phải (`variant="primary"`, icon `Upload`), hiển thị spinner và khóa tương tác khi đang submit.

### 8.2. Tab Quản Lý Hợp Đồng Trong `DetailInternModal.tsx`

- Thêm tab **"Hợp đồng"** bên cạnh các tab thông tin hiện tại (Thông tin cá nhân, Tài liệu, Đánh giá).
- **Trạng thái rỗng (Empty State):** Khi TTS chưa có hợp đồng nào:
  - Hiển thị hình minh họa icon `FileQuestion`, tiêu đề *"Chưa có hợp đồng nào được lưu trữ"*.
  - Nút CTA lớn: *"Tải Lên Hợp Đồng Đầu Tiên"* (nếu hồ sơ `APPROVED` / `INTERNING`).
- **Trạng thái có dữ liệu:** Danh sách thẻ hợp đồng hoặc bảng thu gọn:
  - Cột/Mục: Số hiệu HĐ, Tiêu đề, Thời hạn thực tập (Từ ngày - Đến ngày), Mức phụ cấp, Trạng thái (`Badge`), Người tải lên & Ngày tạo.
  - Các nút thao tác trên từng hợp đồng:
    - Nút icon `Eye` (Xem trước trong tab mới).
    - Nút icon `Download` (Tải file về máy).
- Nút CTA ở góc trên tab: `+ Tải lên hợp đồng mới`.

### 8.3. Tích Hợp Nút Hành Động Trên Bảng `HrInternTable.tsx`

- Bổ sung nút **"Hợp đồng"** (icon `FileSignature`) tại cột Thao tác.
- Logic phân quyền & trạng thái:
  - Nếu `status === 'APPROVED' || status === 'INTERNING'`: Nút sáng màu, hover hiển thị tooltip *"Tải lên hợp đồng thực tập"*, click mở `UploadContractModal`.
  - Nếu `status === 'PENDING'`: Nút bị làm mờ (opacity 0.4), disabled, tooltip *"Cần phê duyệt tiếp nhận hồ sơ trước khi ký hợp đồng"*.
  - Nếu `status === 'REJECTED'`: Ẩn hoặc disable nút.

### 8.4. Tiêu Chuẩn Design Tokens (Nguyên Tắc 28)

- Toàn bộ màu sắc và style bắt buộc dùng CSS Variables ngữ nghĩa trong `src/index.css`:
  - Nền: `var(--bg-card)`, `var(--bg-body)`, `var(--bg-surface)`
  - Màu chữ: `var(--text-main)`, `var(--text-muted)`, `var(--text-dim)`
  - Viền: `var(--border-default)`, `var(--border-focus)`
  - Màu hành động & trạng thái: `var(--primary)`, `var(--primary-glow)`, `var(--success)`, `var(--warning)`, `var(--danger)`
- Không hardcode bất kỳ mã màu Hex nào trong CSS Modules.

---

## 9. Acceptance Criteria Checklist (Tiêu Chí Nghiệm Thu)

- [ ] **AC-1 (Hiển thị nút theo trạng thái):** Trên `HrInternTable`, nút "Hợp đồng" chỉ kích hoạt khi thực tập sinh có trạng thái `APPROVED` hoặc `INTERNING`; nếu trạng thái `PENDING` thì bị disable kèm tooltip giải thích.
- [ ] **AC-2 (Mở modal chuẩn 3 khối):** Click nút hành động mở `UploadContractModal` với thông tin mã TTS và họ tên được gắn sẵn vào Header.
- [ ] **AC-3 (Validate file phía client):** Kéo thả hoặc chọn file không đúng định dạng (`.pdf, .docx, .doc`) hoặc vượt quá `10MB` bị từ chối ngay lập tức kèm thông báo lỗi rõ ràng.
- [ ] **AC-4 (Validate khoảng thời gian):** Nếu `endDate <= startDate`, hiển thị lỗi đỏ cảnh báo và vô hiệu hóa nút submit.
- [ ] **AC-5 (Upload thành công):** Điền đủ thông tin hợp lệ và upload file $\rightarrow$ Gửi multipart request thành công, hiện Toast thông báo, tự động đóng modal và làm mới dữ liệu.
- [ ] **AC-6 (Xử lý mã trùng 409):** Nếu Backend trả lỗi 409 do trùng `contractNumber`, giữ nguyên modal và dữ liệu, hiển thị cảnh báo đỏ tại ô số hợp đồng.
- [ ] **AC-7 (Chống double-click & hiển thị loader):** Khi đang gửi dữ liệu, nút submit hiển thị spinner và khóa toàn bộ tương tác.
- [ ] **AC-8 (Tab hợp đồng trong Modal Chi Tiết):** Tab "Hợp đồng" trong `DetailInternModal` tải và hiển thị chính xác danh sách các hợp đồng của TTS kèm badge trạng thái hợp đồng.
- [ ] **AC-9 (Xem trước & Tải về):** Bấm xem trước mở trực tiếp file PDF trên tab mới; bấm tải về kích hoạt download tệp với tên file gốc.
- [ ] **AC-10 (Tương thích giao diện):** Giao diện hiển thị sắc nét, mượt mà trên cả Dark Mode và Light Mode, chuẩn WCAG AA.

---

## 10. Implementation Plan & File Checklist (Kế Hoạch Triển Khai)

1. **Bước 1: Khai báo Endpoints & Models**
   - [ ] Tạo file `src/constants/endpoints/contract.endpoints.ts`.
   - [ ] Cập nhật file `src/constants/endpoints/index.ts`.
   - [ ] Tạo file `src/types/contract.types.ts`.
   - [ ] Cập nhật file `src/types/index.ts`.
2. **Bước 2: Xây dựng Service Layer**
   - [ ] Tạo file `src/services/contractService.ts` (upload, get list, preview, download).
   - [ ] Export qua `src/services/index.ts`.
3. **Bước 3: Xây dựng Component Modal Upload Hợp Đồng**
   - [ ] Tạo thư mục `src/pages/hr/components/UploadContractModal/`.
   - [ ] Viết `UploadContractModal.types.ts`.
   - [ ] Viết `UploadContractModal.module.css` (100% design tokens, CSS Modules).
   - [ ] Viết `UploadContractModal.tsx` (cấu trúc 3 khối, dropzone, form validate).
   - [ ] Export qua `src/pages/hr/components/index.ts`.
4. **Bước 4: Nâng cấp Modal Chi Tiết TTS (`DetailInternModal.tsx`)**
   - [ ] Bổ sung tab/khối "Hợp đồng & Pháp lý".
   - [ ] Hiển thị danh sách hợp đồng, trạng thái rỗng và các nút xem trước/tải về.
   - [ ] Tích hợp nút mở `UploadContractModal` ngay tại tab.
5. **Bước 5: Nâng cấp Bảng TTS (`HrInternTable.tsx`)**
   - [ ] Thêm nút/icon hành động "Hợp đồng" với tooltip và điều kiện kích hoạt.
   - [ ] Kết nối sự kiện mở `UploadContractModal`.
6. **Bước 6: Tích hợp State Management trên `HrDashboard.tsx`**
   - [ ] Khai báo state quản lý việc mở modal upload hợp đồng (`selectedInternForContract`).
   - [ ] Kích hoạt refetch sau khi upload thành công.
7. **Bước 7: Kiểm thử & Nghiệm thu**
   - [ ] Chạy kiểm tra TypeScript type check: `npm run build`.
   - [ ] Kiểm thử luồng thực tế với dữ liệu và tài khoản HR trên trình duyệt.
