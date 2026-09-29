# Kế Hoạch Triển Khai (Implementation Plan) - TM-14: Xác Nhận & Ký Hợp Đồng Thực Tập Sinh

> **Ticket:** [TM-14](https://robluccibn9935.atlassian.net/browse/TM-14) - Xác nhận & Ký kết hợp đồng thực tập sinh (Intern Contract Confirmation & Signature Flow)  
> **Change Level:** **L3**  
> **Tài liệu đặc tả liên quan:** [`docs/specs/TM-14-contract-confirm-spec.md`](file:///d:/Module_6/InternHub-Frontend/docs/specs/TM-14-contract-confirm-spec.md)  
> **Tuân thủ:** 34 Nguyên tắc bất biến ([`AGENTS.md`](file:///d:/Module_6/InternHub-Frontend/AGENTS.md)) & Bộ Quy chuẩn Thiết kế UX/UI ([`08-ui-ux-guidelines.md`](file:///d:/Module_6/InternHub-Frontend/.agents/08-ui-ux-guidelines.md))

---

## 1. Mục Tiêu & Kiến Trúc Dự Kiến (Architecture & Goals)

Xây dựng trọn vẹn giao diện và luồng nghiệp vụ phía Frontend cho tính năng **TM-14 (Intern Contract Confirmation Flow)**:
- Cho phép Thực tập sinh (`ROLE_INTERN`) xem danh sách hợp đồng cá nhân, xem trước file văn bản PDF, xác nhận ký kết điện tử (`confirmContract`) hoặc từ chối hợp đồng kèm lý do (`rejectContract`).
- Cập nhật thời gian thực trạng thái hợp đồng (`SIGNED`) và hồ sơ TTS (`INTERNING`).
- Kết nối trực tiếp với Microservice Backend `intern-and-program-service` (Port `8082`) qua API Gateway (Port `8080`).

### Phê duyệt Endpoint & Route (Bắt buộc theo Nguyên tắc 11 & 17):
- **API Endpoints:**
  1. `GET /api/interns/contracts/my-contracts` (Lấy danh sách hợp đồng của TTS đang đăng nhập)
  2. `GET /api/interns/contracts/my-contracts/active` (Lấy hợp đồng đang kích hoạt / chờ ký)
  3. `GET /api/interns/contracts/{contractId}` (Lấy chi tiết hợp đồng theo ID)
  4. `POST /api/interns/contracts/{contractId}/confirm` (Xác nhận ký hợp đồng - payload: `{ agreeTerms, signerFullName, confirmationNote }`)
  5. `POST /api/interns/contracts/{contractId}/reject` (Từ chối hợp đồng - payload: `{ rejectionReason }`)
- **Route:** Không tạo thêm route mới; Hợp đồng được hiển thị và thao tác trực tiếp tại giao diện `intern/documents` (`InternDocumentsPage.tsx`).

---

## 2. Các Bước Triển Khai Chi Tiết (Implementation Steps)

### Bước 1: Khai Báo Endpoints & Types
1. Cập nhật [`src/constants/endpoints/contract.endpoints.ts`](file:///d:/Module_6/InternHub-Frontend/src/constants/endpoints/contract.endpoints.ts):
   - Thêm `MY_CONTRACTS`, `MY_ACTIVE`, `BY_ID`, `CONFIRM`, `REJECT`.
2. Cập nhật [`src/types/contract.types.ts`](file:///d:/Module_6/InternHub-Frontend/src/types/contract.types.ts):
   - Bổ sung `REJECTED_BY_INTERN` vào `ContractStatus`.
   - Bổ sung các trường `signerFullName`, `internConfirmationNote`, `rejectionReason`, `internProfileStatus` vào `ContractResponse`.
   - Tạo mới `ConfirmContractRequest` và `RejectContractRequest`.

### Bước 2: Tầng Dịch Vụ API (`contractService.ts`)
1. Cập nhật [`src/services/contractService.ts`](file:///d:/Module_6/InternHub-Frontend/src/services/contractService.ts):
   - `getMyContracts(signal?: AbortSignal): Promise<ContractResponse[]>`
   - `getMyActiveContract(signal?: AbortSignal): Promise<ContractResponse | null>`
   - `getContractById(contractId: number | string, signal?: AbortSignal): Promise<ContractResponse>`
   - `confirmContract(contractId: number | string, data: ConfirmContractRequest): Promise<ContractResponse>`
   - `rejectContract(contractId: number | string, data: RejectContractRequest): Promise<ContractResponse>`

### Bước 3: Modal Ký Hợp Đồng Chuẩn 3 Khối (`ConfirmContractModal`)
Tạo thư mục [`src/pages/intern/components/ConfirmContractModal/`](file:///d:/Module_6/InternHub-Frontend/src/pages/intern/components/ConfirmContractModal/):
1. `ConfirmContractModal.types.ts`: Props gồm `contract`, `isOpen`, `onClose`, `onSuccess`, `onOpenReject`.
2. `ConfirmContractModal.module.css`: 100% CSS Tokens, dark/light mode, focus glow.
3. `ConfirmContractModal.tsx`:
   - **Header cố định:** Tiêu đề *"Xác Nhận Ký Hợp Đồng Thực Tập"*, huy hiệu mã HĐ + trạng thái `PENDING_SIGNATURE`.
   - **Body cuộn độc lập:**
     - Tóm tắt thông tin: Thời hạn thực tập, mức phụ cấp (format VND), người phát hành.
     - Nút Xem trước PDF / Tải về.
     - Checkbox cam kết điều khoản (Bắt buộc).
     - Ô nhập Họ tên người ký `signerFullName` (Bắt buộc 2-100 ký tự, điền sẵn tên thật).
     - Ô nhập `confirmationNote` (Tùy chọn, tối đa 1000 ký tự).
   - **Sticky Footer:** Nút *"Từ chối hợp đồng"* (ghost danger), nút *"Hủy"* và nút *"Xác Nhận Ký"* (chống double-click, spinner loader).
   - **Xử lý lỗi (Safe Mutation UX):** Giữ nguyên dữ liệu khi gặp lỗi mạng/API 400/500, báo lỗi chi tiết.

### Bước 4: Modal Từ Chối Hợp Đồng Nguy Hiểm (`RejectContractModal`)
Tạo thư mục [`src/pages/intern/components/RejectContractModal/`](file:///d:/Module_6/InternHub-Frontend/src/pages/intern/components/RejectContractModal/):
1. `RejectContractModal.types.ts`: Props gồm `contract`, `isOpen`, `onClose`, `onSuccess`.
2. `RejectContractModal.module.css`: Nền đỏ nhạt cảnh báo, tương phản WCAG AA.
3. `RejectContractModal.tsx`:
   - Cảnh báo rõ hậu quả pháp lý khi từ chối tiếp nhận.
   - Textarea `rejectionReason` bắt buộc từ 10 đến 1000 ký tự, đếm ký tự realtime.
   - Nút *"Quay lại"* và nút *"Xác Nhận Từ Chối"* (`variant="danger"`).

### Bước 5: Modal Chi Tiết Hợp Đồng (`ViewContractDetailModal`)
Tạo thư mục [`src/pages/intern/components/ViewContractDetailModal/`](file:///d:/Module_6/InternHub-Frontend/src/pages/intern/components/ViewContractDetailModal/):
1. Hiển thị lại toàn văn thông tin hợp đồng đã ký hoặc đã từ chối.
2. Hiển thị chữ ký điện tử, thời gian ký `signedAt`, họ tên người ký `signerFullName`, lời nhắn hoặc lý do từ chối.
3. Các nút xem trước và tải văn bản PDF.

### Bước 6: Component `InternContractSection` trên `InternDocumentsPage`
Tạo thư mục [`src/pages/intern/components/InternContractSection/`](file:///d:/Module_6/InternHub-Frontend/src/pages/intern/components/InternContractSection/):
1. `InternContractSection.types.ts`: Props gồm `contracts`, `loading`, `onRefetch`, `onSignContract`, `onViewContract`.
2. `InternContractSection.module.css`: Thiết kế chuẩn UI/UX, hỗ trợ Dark/Light mode, callout hero banner màu tím khi có hợp đồng chờ ký.
3. `InternContractSection.tsx`:
   - Banner cảnh báo nổi bật khi có hợp đồng `PENDING_SIGNATURE`.
   - Danh sách thẻ Card / Bảng hợp đồng cá nhân: Mã HĐ, Tiêu đề, Thời gian thực tập, Phụ cấp, Trạng thái.
   - Các nút hành động: Xem trước PDF, Tải xuống, Ký ngay (nếu PENDING_SIGNATURE), Xem chi tiết chữ ký (nếu đã ký / từ chối).
4. Tích hợp trực tiếp vào [`src/pages/intern/InternDocumentsPage.tsx`](file:///d:/Module_6/InternHub-Frontend/src/pages/intern/InternDocumentsPage.tsx).

### Bước 7: Widget Nhắc Ký Hợp Đồng Trên `InternDashboard.tsx`
1. Khi hồ sơ TTS ở trạng thái `APPROVED` hoặc có hợp đồng `PENDING_SIGNATURE`, hiển thị thẻ Card nổi bật:
   - *"Hợp đồng thực tập đang chờ ký xác nhận"*.
   - Nút mở thẳng `ConfirmContractModal` hoặc chuyển hướng sang tab Tài Liệu & Hợp Đồng.
2. Cập nhật `InternStepper.tsx` hiển thị rõ thông tin chuẩn bị ký kết trước khi vào kỳ thực tập `INTERNING`.

### Bước 8: Kiểm Thử & Nghiệm Thu
1. Chạy `npm run build` để kiểm tra TypeScript type check và cú pháp.
2. Kiểm tra với tài khoản thực tế (`INTERN`):
   - Xem danh sách hợp đồng cá nhân trên trang `intern/documents`.
   - Mở xem trước PDF.
   - Thử nghiệm ký hợp đồng $\rightarrow$ Chuyển trạng thái `SIGNED` và `INTERNING`.
   - Thử nghiệm từ chối hợp đồng $\rightarrow$ Chuyển trạng thái `REJECTED_BY_INTERN`.
   - Kiểm tra các edge cases: mạng lỗi giữ nguyên form, checkbox chưa tick bị khóa nút submit, đếm ký tự lý do từ chối.

---

## 3. Danh Sách Tệp Tác Động (Impacted Files)

| Thao tác | Đường dẫn file | Mô tả |
| :---: | :--- | :--- |
| **Cập nhật** | `src/constants/endpoints/contract.endpoints.ts` | Thêm các endpoints TM-14 |
| **Cập nhật** | `src/types/contract.types.ts` | Bổ sung DTOs & Enum ContractStatus |
| **Cập nhật** | `src/services/contractService.ts` | Bổ sung các hàm gọi API TM-14 |
| **Tạo mới** | `src/pages/intern/components/ConfirmContractModal/` | Modal Ký Hợp Đồng chuẩn 3 khối |
| **Tạo mới** | `src/pages/intern/components/RejectContractModal/` | Modal Từ Chối Hợp Đồng chuẩn WCAG AA |
| **Tạo mới** | `src/pages/intern/components/ViewContractDetailModal/` | Modal Chi Tiết Hợp Đồng |
| **Tạo mới** | `src/pages/intern/components/InternContractSection/` | Khối Hợp Đồng tại InternDocumentsPage |
| **Cập nhật** | `src/pages/intern/InternDocumentsPage.tsx` | Nhúng khối InternContractSection |
| **Cập nhật** | `src/pages/intern/InternDashboard.tsx` | Tích hợp Banner/Card ký hợp đồng |
