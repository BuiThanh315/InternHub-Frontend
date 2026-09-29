# Specification: Xác Nhận & Ký Hợp Đồng Thực Tập Sinh (TM-14)

> **Tài liệu Đặc Tả Kỹ Thuật Giao Diện (Frontend Specification)**  
> **Dự án:** `InternHub-Frontend`  
> **Mã Jira Ticket:** [TM-14](https://robluccibn9935.atlassian.net/browse/TM-14) - Xác nhận & Ký kết hợp đồng thực tập sinh (Intern Contract Confirmation & Signature Flow)  
> **Backend Service:** `intern-and-program-service` (Port `8082` qua API Gateway `8080`)  
> **Nhánh Git dự kiến:** `feat/TM-14-contract-confirm`  
> **Change Level:** **L3** (Tạo mới Model & DTOs, Endpoints, Service Layer, Trang quản lý hợp đồng cá nhân `InternContractsPage`, Widget hợp đồng trên Dashboard, Modal Ký Hợp Đồng chuẩn 3 khối, Modal Từ Chối nguy hiểm chuẩn WCAG AA)  
> **Tiêu chuẩn tuân thủ:** 34 Nguyên tắc bất biến ([`AGENTS.md`](file:///d:/Module_6/InternHub-Frontend/AGENTS.md)) & Bộ Quy chuẩn Thiết kế UX/UI ([`08-ui-ux-guidelines.md`](file:///d:/Module_6/InternHub-Frontend/.agents/08-ui-ux-guidelines.md))

---

## 1. Feature Overview (Tổng Quan Tính Năng)

- **Tên tính năng:** Xác nhận & Ký kết Hợp đồng Thực tập sinh trực tuyến (Intern Contract Confirmation & Signature Flow).
- **Hệ thống liên quan:**
  - **Frontend:** `InternHub-Frontend` (React 19, TypeScript, Vite, CSS Modules, Lucide React, Axios client).
  - **Backend API:** `intern-and-program-service` (Spring Boot 3.x, Spring Security JWT, MySQL, JPA).
- **Đối tượng người dùng & Phân quyền:**
  - **Thực tập sinh (`ROLE_INTERN`):**
    - Xem danh sách hợp đồng cá nhân đã được phòng Nhân sự (HR) phát hành qua ticket TM-13.
    - Xem trước (preview inline PDF) và tải xuống (download attachment) tệp văn bản hợp đồng pháp lý.
    - Kiểm tra các điều khoản, thời hạn thực tập (`startDate`, `endDate`), mức phụ cấp hàng tháng (`allowanceAmount`).
    - Thực hiện **Xác nhận ký điện tử (`confirmContract`)**: Tick xác nhận đồng ý điều khoản, nhập/xác nhận họ tên pháp lý (`signerFullName`), ghi chú lời nhắn bổ sung (`confirmationNote`).
    - Thực hiện **Từ chối hợp đồng (`rejectContract`)**: Nhập lý do từ chối chi tiết ($\ge 10$ ký tự) để gửi thông báo lại cho HR.
  - **HR / Admin / Mentor (`ROLE_HR`, `ROLE_ADMIN`, `ROLE_MENTOR`):**
    - Tra cứu và xem được thông tin ký kết của thực tập sinh (ngày ký `signedAt`, người ký `signerFullName`, lời nhắn hoặc lý do từ chối) trong Modal Chi Tiết TTS (`DetailInternModal`).

---

## 2. Business Goal & Core Objectives (Mục Tiêu Nghiệp Vụ)

1. **Khép kín quy trình Onboarding số hóa:**
   - Cung cấp bước pháp lý then chốt chuyển giao ứng viên từ trạng thái *"Đã duyệt hồ sơ"* (`APPROVED` ở TM-11) sang *"Đang thực tập chính thức"* (`INTERNING`).
   - Loại bỏ hoàn toàn sự chậm trễ của quy trình in ấn ký giấy tờ thủ công, hỗ trợ thực tập sinh xác nhận tức thì trên máy tính hoặc điện thoại di động.
2. **Bảo đảm giá trị cam kết & Pháp lý điện tử:**
   - Bắt buộc thực tập sinh đọc văn bản hợp đồng trước khi ký.
   - Ghi nhận định danh người ký (`signerFullName`), thời điểm ký do hệ thống tự sinh (`signedAt`), và cam kết điều khoản (`agreeTerms: true`).
3. **Trải nghiệm Modal-First & Bảo toàn ngữ cảnh (Zero Context-Switching):**
   - Thao tác xem trước, xác nhận ký kết hoặc từ chối diễn ra hoàn toàn trong Modal chuẩn 3 khối (Header cố định, Body cuộn độc lập, Sticky Footer cố định nút ở đáy) ngay trên trang, không làm gián đoạn ngữ cảnh của người dùng.
4. **Kiểm soát chặt chẽ điều kiện tiên quyết & Phòng chống thao tác sai:**
   - Ngăn chặn ký lại hợp đồng đã ký (`SIGNED`), đã hết hạn (`EXPIRED`) hoặc đã bị từ chối (`REJECTED_BY_INTERN` / `TERMINATED`).
   - Cảnh báo rõ ràng và bắt buộc nhập lý do chi tiết khi từ chối hợp đồng thông qua Confirmation Modal nguy hiểm (Destructive Modal).
5. **Đồng bộ trạng thái hồ sơ thời gian thực:**
   - Khi ký thành công: Tự động cập nhật trạng thái hợp đồng thành `SIGNED`, trạng thái hồ sơ TTS thành `INTERNING`, bước lộ trình (Stepper) tiến thẳng tới *"Đang Thực Tập"*.
   - Hiển thị Toast thông báo chúc mừng gia nhập doanh nghiệp ấn tượng.

---

## 3. Scope of Work (Phạm Vi Công Việc)

### 3.1. Trong phạm vi (In Scope)

1. **Hạ tầng Constants & TypeScript Types:**
   - Cập nhật `src/constants/endpoints/contract.endpoints.ts`:
     - `MY_CONTRACTS`: `/api/interns/contracts/my-contracts` (Lấy danh sách HĐ của tôi).
     - `MY_ACTIVE`: `/api/interns/contracts/my-contracts/active` (Lấy HĐ đang hiệu lực/chờ ký).
     - `BY_ID(contractId)`: `/api/interns/contracts/{contractId}` (Chi tiết HĐ).
     - `CONFIRM(contractId)`: `/api/interns/contracts/{contractId}/confirm` (Xác nhận ký HĐ).
     - `REJECT(contractId)`: `/api/interns/contracts/{contractId}/reject` (Từ chối HĐ).
   - **Routes:** Không tạo thêm route mới; Hợp đồng được tích hợp trực tiếp tại giao diện `intern/documents` (`InternDocumentsPage.tsx`).
   - Cập nhật `src/types/contract.types.ts`:
     - Cập nhật `ContractStatus`: `'PENDING_SIGNATURE' | 'SIGNED' | 'EXPIRED' | 'TERMINATED' | 'REJECTED_BY_INTERN'`.
     - Cập nhật `ContractResponse`: Thêm `signerFullName`, `internConfirmationNote`, `rejectionReason`, `internProfileStatus`.
     - Thêm `ConfirmContractRequest`: `{ agreeTerms: boolean; signerFullName: string; confirmationNote?: string; }`.
     - Thêm `RejectContractRequest`: `{ rejectionReason: string; }`.
2. **Service Layer (`contractService.ts`):**
   - Bổ sung các phương thức:
     - `getMyContracts(signal?: AbortSignal): Promise<ContractResponse[]>`
     - `getMyActiveContract(signal?: AbortSignal): Promise<ContractResponse | null>`
     - `getContractById(contractId: number | string, signal?: AbortSignal): Promise<ContractResponse>`
     - `confirmContract(contractId: number | string, data: ConfirmContractRequest): Promise<ContractResponse>`
     - `rejectContract(contractId: number | string, data: RejectContractRequest): Promise<ContractResponse>`
3. **Tích hợp Khối Quản Lý Hợp Đồng Vào `InternDocumentsPage` (`src/pages/intern/InternDocumentsPage.tsx`):**
   - Xây dựng component `InternContractSection` (`src/pages/intern/components/InternContractSection/`):
     - Hiển thị danh sách/thẻ hợp đồng của TTS.
     - Callout Banner nổi bật khi có hợp đồng ở trạng thái `PENDING_SIGNATURE` đang chờ ký.
     - Bảng / danh sách thẻ hợp đồng: Mã HĐ, tiêu đề, thời hạn thực tập, phụ cấp VND, badge trạng thái, nút Xem trước, Tải về, Ký ngay, Từ chối hoặc Xem chi tiết chữ ký.
     - Trạng thái 5 pha Zero-Jank: Skeleton Shimmer, Empty State, Error Retry, Toast Success.
4. **Widget Thông Báo Hợp Đồng Trên `InternDashboard.tsx`:**
   - Hiển thị Card cảnh báo / nhắc nhở ký hợp đồng ngay vị trí ưu tiên khi hồ sơ ở trạng thái `APPROVED` và hợp đồng đang `PENDING_SIGNATURE`.
   - Cập nhật `InternStepper.tsx` phản ánh trạng thái chuẩn bị vào kỳ thực tập.
5. **Modal Ký Hợp Đồng Chuẩn 3 Khối (`ConfirmContractModal`):**
   - Tạo `src/pages/intern/components/ConfirmContractModal/`:
     - `ConfirmContractModal.tsx`, `ConfirmContractModal.types.ts`, `ConfirmContractModal.module.css`.
   - Cấu trúc 3 khối: Header cố định có huy hiệu trạng thái, Body cuộn độc lập chứa preview và form cam kết, Sticky Footer ghim nút hành động cố định ở đáy.
   - Tóm tắt thông tin hợp đồng: Tiêu đề, số hiệu, ngày bắt đầu - kết thúc, phụ cấp (format VND), phòng ban.
   - Nút Xem trước tài liệu PDF trong tab mới hoặc nhúng khung xem trực tiếp.
   - Checkbox cam kết bắt buộc: *"Tôi đã đọc, hiểu rõ và đồng ý với tất cả điều khoản trong hợp đồng thực tập."*
   - Ô nhập Họ tên người ký xác nhận (`signerFullName`, bắt buộc 2-100 ký tự, tự động điền họ tên thật của TTS).
   - Ô ghi chú / lời nhắn gửi đến phòng Nhân sự (`confirmationNote`, tùy chọn, tối đa 1000 ký tự).
   - Nút hành động: "Từ chối hợp đồng" (mở modal từ chối), "Hủy bỏ", "Xác Nhận Ký Hợp Đồng" (chống double-click).
6. **Modal Từ Chối Hợp Đồng Nguy Hiểm (`RejectContractModal`):**
   - Tạo `src/pages/intern/components/RejectContractModal/`:
     - `RejectContractModal.tsx`, `RejectContractModal.types.ts`, `RejectContractModal.module.css`.
   - Tuân thủ Quy chuẩn Nguyên tắc 33: Modal nền đỏ nhạt, cảnh báo rõ hậu quả pháp lý.
   - Ô nhập `rejectionReason` bắt buộc từ 10 đến 1000 ký tự có đếm ký tự realtime.
   - Nút xác nhận `variant="danger"`: "Xác Nhận Từ Chối Hợp Đồng".
7. **Modal Xem Chi Tiết & Lịch Sử Hợp Đồng (`ViewContractDetailModal`):**
   - Cho phép xem lại toàn bộ thông tin hợp đồng đã ký hoặc đã từ chối, tải file văn bản, xem chữ ký điện tử và mốc thời gian.
8. **Điều hướng Menu Sidebar:**
   - Bổ sung menu item *"Hợp Đồng Của Tôi"* (Icon `FileSignature`) cho vai trò `INTERN` trong `src/components/layout/Sidebar.tsx`.
   - Khai báo route bảo vệ trong `src/routes/AppRoutes.tsx`.

### 3.2. Ngoài phạm vi (Out of Scope)

- Ký số bằng chứng thư số USB Token / SmartCA / VNPT-CA (hệ thống sử dụng cơ chế xác nhận điện tử Click-to-Sign có giá trị pháp lý nội bộ theo thỏa thuận tuyển dụng).
- Chỉnh sửa backend code Java Spring Boot (tuân thủ Nguyên tắc 7).

---

## 4. Potential Logic Loopholes & Mitigations (Lỗ Hổng Logic & Giải Pháp Frontend)

| STT | Tình huống ngoại lệ (Edge Case) | Rủi ro kỹ thuật / UX | Giải pháp thiết kế & Xử lý Frontend |
| :---: | :--- | :--- | :--- |
| **1** | Hợp đồng đã quá hạn ngày kết thúc (`now > endDate`) nhưng TTS mới mở modal ký | Backend kiểm tra và trả về HTTP `400 Bad Request` ("Hợp đồng đã quá hạn") | Client tự động kiểm tra `isPast(parseISO(contract.endDate))` $\rightarrow$ Hiển thị badge `Hết Hạn (EXPIRED)` màu xám, hiển thị banner cảnh báo và vô hiệu hóa nút Ký, hướng dẫn TTS liên hệ HR để phát hành hợp đồng mới. |
| **2** | Hợp đồng đã ở trạng thái `SIGNED` hoặc `TERMINATED` / `REJECTED_BY_INTERN` | Trùng lặp ký hoặc thay đổi trạng thái bất hợp lệ | Khóa hoàn toàn các nút hành động "Ký" và "Từ chối". Thay thế bằng nút "Xem chi tiết" và "Tải hợp đồng đã ký". |
| **3** | Người dùng nhấn liên tiếp nhiều lần vào nút "Xác Nhận Ký" (Double-Click / Race Condition) | Gửi nhiều request song song, gây xung đột giao dịch ở Backend | Khóa tương tác (`isSubmitting = true`), vô hiệu hóa nút bấm và backdrop (`pointer-events: none`), hiển thị hiệu ứng xoay spinner và text *"Đang xác nhận ký..."*. |
| **4** | TTS chưa tick vào ô Checkbox cam kết nhưng bấm Ký | Gửi request lỗi hoặc người dùng chưa thực sự đọc thỏa thuận | Validate client-side: Nút "Xác Nhận Ký" chỉ bật (`disabled = !agreeTerms || !signerFullName.trim()`) khi checkbox đã được tick và tên người ký hợp lệ. Bôi đỏ lỗi nếu cố tình submit. |
| **5** | TTS bấm từ chối nhưng nhập lý do sơ sài (ví dụ: "ko thích", trống, < 10 ký tự) | Vi phạm Bean Validation Backend (`@Size(min = 10, max = 1000)`), trả về lỗi 400 | Bắt buộc kiểm tra client-side: Báo lỗi đỏ dưới ô nhập *"Vui lòng cung cấp lý do từ chối cụ thể (tối thiểu 10 ký tự)"*. Nút xác nhận từ chối chỉ kích hoạt khi $\ge 10$ ký tự. |
| **6** | Lỗi đường truyền mạng hoặc server 500 khi submit | TTS bị đóng modal và mất dữ liệu lý do/lời nhắn đã nhập | **Tuân thủ Nguyên tắc 24 (Safe Mutation UX)**: Tuyệt đối giữ nguyên modal, giữ nguyên text đã gõ, hiển thị Alert Banner đỏ thông báo lỗi từ Spring Boot kèm nút *"Thử lại"*. |
| **7** | TTS không mở được file PDF trên trình duyệt bị chặn pop-up | Không đọc được hợp đồng trước khi ký | Hỗ trợ cả 2 phương thức: Nút xem trước mở tab mới, và nút "Tải xuống máy (Download)" trực tiếp qua disposition attachment để mở bằng phần mềm đọc PDF trên máy tính. |
| **8** | Chữ hiển thị mờ, khó đọc trong điều kiện Dark Mode | Vi phạm chuẩn tương phản WCAG AA | Sử dụng biến CSS Tokens `var(--text-main)`, `var(--text-muted)`, nền `var(--bg-card)`, bo viền đổi màu `var(--primary)` kèm `box-shadow: 0 0 0 3px var(--primary-glow)`. |

---

## 5. Functional Requirements (Yêu Cầu Chức Năng Chi Tiết)

### FR-1: Danh Sách Hợp Đồng Của Tôi (`GET /api/interns/contracts/my-contracts`)
- Khi TTS truy cập trang `/intern/contracts`, hệ thống tự động tải danh sách hợp đồng của chính tài khoản đang đăng nhập.
- Hiển thị danh sách sắp xếp theo thời gian tạo mới nhất.
- Bảng hiển thị gồm các cột:
  1. Mã & Tên Hợp Đồng (`contractNumber`, `contractTitle`).
  2. Thời Gian Thực Tập (`startDate` $\rightarrow$ `endDate`, kèm số ngày/tháng).
  3. Mức Phụ Cấp (Định dạng VND: `formatCurrency(allowanceAmount)`).
  4. Trạng Thái Hợp Đồng (Badge màu chuẩn UX).
  5. Ngày Ký / Ngày Phát Hành.
  6. Thao Tác (Xem trước, Tải về, Ký ngay / Chi tiết).

### FR-2: Banner Cảnh Báo Hợp Đồng Chờ Ký
- Nếu tồn tại hợp đồng ở trạng thái `PENDING_SIGNATURE`, hiển thị Callout Hero Banner nổi bật trên đầu trang Dashboard và trang Danh Sách Hợp Đồng:
  - Icon chuông báo / bút ký hiệu ứng rung nhẹ (micro-animation).
  - Tiêu đề: *"Bạn có 01 hợp đồng thực tập đang chờ ký xác nhận!"*.
  - Tóm tắt: Số HĐ, thời hạn thực tập, phụ cấp.
  - Nút CTA nổi bật: *"Xem & Ký Hợp Đồng Ngay"* $\rightarrow$ Mở thẳng `ConfirmContractModal`.

### FR-3: Modal Xem Trước & Ký Kết Hợp Đồng (`ConfirmContractModal`)
- **Khối 1 (Fixed Header):**
  - Tiêu đề: *"Xác Nhận Ký Hợp Đồng Thực Tập"*.
  - Mã HĐ + Badge trạng thái `Chờ Ký (PENDING_SIGNATURE)`.
  - Nút Đóng `X` (kèm phím tắt `Esc`).
- **Khối 2 (Scrollable Body):**
  - Card tóm tắt pháp lý: Tên thực tập sinh, Tên công ty/dự án, Ngày bắt đầu - Ngày kết thúc, Mức phụ cấp hàng tháng, Người phát hành (HR).
  - Vùng xem tệp văn bản hợp đồng:
    - Hiển thị tên file gốc, dung lượng, icon PDF.
    - Nút *"Mở xem toàn màn hình (Preview)"* và *"Tải tệp về máy"*.
  - Vùng cam kết điện tử:
    - Checkbox: *"Tôi cam kết đã đọc toàn bộ điều khoản và đồng ý với nội dung hợp đồng này."*
    - Ô nhập `signerFullName`: Gợi ý điền sẵn họ tên thật của TTS từ Profile. Bắt buộc 2-100 ký tự.
    - Ô nhập `confirmationNote`: Lời nhắn gửi HR (tối đa 1000 ký tự).
- **Khối 3 (Sticky Footer):**
  - Bên trái: Nút *"Từ chối hợp đồng"* (Màu đỏ nhạt / ghost danger) $\rightarrow$ Mở `RejectContractModal`.
  - Bên phải:
    - Nút *"Hủy"* $\rightarrow$ Đóng modal.
    - Nút *"Xác Nhận Ký Điện Tử"* (`variant="primary"`, có icon `FileSignature`, trạng thái loading và disabled).

### FR-4: Modal Từ Chối Hợp Đồng (`RejectContractModal`)
- Modal cảnh báo nguy hiểm (Destructive Confirmation Modal):
  - Tiêu đề màu đỏ: *"Từ Chối Ký Hợp Đồng Thực Tập"*.
  - Cảnh báo: *"Hành động này sẽ gửi phản hồi từ chối tiếp nhận đến phòng Nhân sự. Hợp đồng sẽ không còn giá trị hiệu lực."*
  - Ô nhập `rejectionReason` (Bắt buộc, `textarea`, 10 - 1000 ký tự, có đếm ký tự realtime).
  - Nút hành động:
    - Nút *"Quay lại"*.
    - Nút *"Xác Nhận Từ Chối"* (`variant="danger"`).

### FR-5: Xử Lý Phản Hồi Sau Khi Ký Hoặc Từ Chối (Mutation UX)
- **Khi Ký thành công:**
  - Hiển thị Toast thông báo thành công: *"Ký hợp đồng thành công! Chào mừng bạn chính thức gia nhập chương trình thực tập."*
  - Đóng Modal Ký Hợp Đồng.
  - Tự động gọi `refetch()` làm mới danh sách hợp đồng và trạng thái Profile TTS (`INTERNING`).
  - Cập nhật tức thời tiến độ Stepper sang bước 3.
- **Khi Từ chối thành công:**
  - Hiển thị Toast thông báo: *"Đã ghi nhận phản hồi từ chối hợp đồng thực tập."*
  - Đóng Modal Từ Chối và Modal Ký.
  - Làm mới danh sách hợp đồng (chuyển sang trạng thái `REJECTED_BY_INTERN`).
- **Khi Thất bại:**
  - Giữ nguyên Modal và nội dung đã nhập.
  - Hiển thị thông báo lỗi chi tiết từ Backend (HTTP 400, 403, 404, 500).

---

## 6. API Contract Specification (Chi Tiết Hợp Đồng API)

### 6.1. Danh Sách Hợp Đồng Của Tôi
- **Method & Path:** `GET /api/interns/contracts/my-contracts`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Response 200 OK:**
```json
{
  "success": true,
  "message": "Lấy danh sách hợp đồng cá nhân thành công",
  "data": [
    {
      "id": 1,
      "internCode": "INT-202609-0001",
      "internFullName": "Nguyễn Văn A",
      "contractNumber": "HDTT-202609-0001",
      "contractTitle": "Hợp đồng thực tập kỹ thuật phần mềm",
      "startDate": "2026-10-01",
      "endDate": "2026-12-31",
      "allowanceAmount": 3000000.00,
      "status": "PENDING_SIGNATURE",
      "originalFileName": "hop_dong_thuc_tap_nguyen_van_a.pdf",
      "fileSize": 245120,
      "contentType": "application/pdf",
      "uploadedBy": "hr_manager",
      "signedAt": null,
      "signerFullName": null,
      "internConfirmationNote": null,
      "rejectionReason": null,
      "notes": "Đợt thực tập quý 4/2026",
      "createdAt": "2026-09-23T16:30:00",
      "updatedAt": "2026-09-23T16:30:00"
    }
  ],
  "timestamp": "2026-09-29T10:00:00"
}
```

### 6.2. Lấy Chi Tiết Hợp Đồng
- **Method & Path:** `GET /api/interns/contracts/{contractId}`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`
- **Response 200 OK:** Tương tự như đối tượng đơn lẻ trong mảng `data` ở trên.

### 6.3. Xác Nhận Ký Hợp Đồng
- **Method & Path:** `POST /api/interns/contracts/{contractId}/confirm`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
- **Request Body:**
```json
{
  "agreeTerms": true,
  "signerFullName": "Nguyễn Văn A",
  "confirmationNote": "Em đã đọc kỹ và đồng ý với tất cả điều khoản hợp đồng."
}
```
- **Response 200 OK:**
```json
{
  "success": true,
  "message": "Xác nhận ký hợp đồng thực tập thành công",
  "data": {
    "id": 1,
    "status": "SIGNED",
    "signedAt": "2026-09-29T10:15:00",
    "signerFullName": "Nguyễn Văn A",
    "internConfirmationNote": "Em đã đọc kỹ và đồng ý với tất cả điều khoản hợp đồng.",
    "internProfileStatus": "INTERNING"
  },
  "timestamp": "2026-09-29T10:15:00"
}
```
- **Mã lỗi Backend:**
  - `400 Bad Request`: Hợp đồng không ở trạng thái chờ ký hoặc đã quá hạn `endDate`.
  - `403 Forbidden`: Hợp đồng không thuộc quyền sở hữu của TTS đang đăng nhập.
  - `404 Not Found`: Không tìm thấy hợp đồng với ID tương ứng.

### 6.4. Từ Chối Hợp Đồng
- **Method & Path:** `POST /api/interns/contracts/{contractId}/reject`
- **Headers:** `Authorization: Bearer <JWT_TOKEN>`, `Content-Type: application/json`
- **Request Body:**
```json
{
  "rejectionReason": "Do lịch học kỳ mới tại trường bị thay đổi nên em không sắp xếp được thời gian thực tập."
}
```
- **Response 200 OK:**
```json
{
  "success": true,
  "message": "Đã ghi nhận từ chối hợp đồng thực tập",
  "data": {
    "id": 1,
    "status": "REJECTED_BY_INTERN",
    "rejectionReason": "Do lịch học kỳ mới tại trường bị thay đổi nên em không sắp xếp được thời gian thực tập."
  },
  "timestamp": "2026-09-29T10:20:00"
}
```
- **Mã lỗi Backend:**
  - `400 Bad Request`: Lý do từ chối dưới 10 ký tự hoặc hợp đồng không ở trạng thái `PENDING_SIGNATURE`.

---

## 7. Design Tokens & Visual Specs (Quy Chuẩn Giao Diện)

| Yếu tố giao diện | CSS Variables áp dụng | Mục đích & Tiêu chuẩn |
| :--- | :--- | :--- |
| **Màu chữ chính (Heading/Label)** | `var(--text-main)` (`#f8fafc` / `#0f172a`) | Chuẩn WCAG AA tương phản $\ge 7:1$, `font-weight: 600` |
| **Màu chữ phụ (Mô tả, ngày tháng)** | `var(--text-muted)` | Độ tương phản đạt chuẩn $\ge 4.5:1$ |
| **Nền Thẻ / Modal** | `var(--bg-card)` | Nền sang trọng, tương thích hoàn toàn 2 chiều Dark/Light |
| **Viền Thường** | `var(--border-default)` | Đường viền mảnh `1px solid var(--border-default)` |
| **Viền Khi Focus / Select** | `var(--primary)` + `box-shadow: 0 0 0 3px var(--primary-glow)` | Hiệu ứng hào quang viền phát sáng mượt mà khi focus ô nhập liệu |
| **Badge Chờ Ký (Pending)** | Nền `var(--warning-light)`, Chữ `var(--warning)` | Màu hổ phách ấm, nổi bật cảnh báo hành động cần làm |
| **Badge Đã Ký (Signed)** | Nền `var(--success-light)`, Chữ `var(--success)` | Màu xanh lục thành công, trạng thái an tâm |
| **Badge Hết Hạn (Expired)** | Nền `rgba(148, 163, 184, 0.15)`, Chữ `#94a3b8` | Màu xám trung tính, biểu thị trạng thái vô hiệu |
| **Badge Từ Chối (Rejected)** | Nền `var(--danger-light)`, Chữ `var(--danger)` | Màu đỏ cảnh báo, biểu thị trạng thái hủy bỏ |
| **Thanh cuộn bảng & Modal** | Custom Sleek Scrollbar (6px - 8px, `border-radius: 9999px`) | Cuộn êm ái, thẩm mỹ hiện đại không bị thô |

---

## 8. Acceptance Criteria Checklist (Tiêu Chí Nghiệm Thu)

- [ ] **AC-1 (Hiển thị Hợp đồng tại Intern Documents):** TTS đăng nhập truy cập `/intern/documents` thấy khối quản lý hợp đồng thực tập sinh và các hành động tương ứng.
- [ ] **AC-2 (Hiển thị Banner nhắc việc):** TTS có hợp đồng `PENDING_SIGNATURE` thấy Callout Banner màu tím/vàng nổi bật trên Dashboard và trang Hợp đồng với nút *"Xem & Ký Ngay"*.
- [ ] **AC-3 (Bảng danh sách hợp đồng):** Hiển thị đầy đủ thông tin hợp đồng, phân trang tự ẩn khi $\le 10$ dòng, cuộn ngang an toàn trên Desktop, chuyển sang Card trên Mobile.
- [ ] **AC-4 (Xem trước & Tải file):** Click nút *"Xem trước"* mở file PDF inline trên tab mới; click *"Tải về"* kích hoạt tải file đính kèm.
- [ ] **AC-5 (Mở Modal Ký Hợp Đồng):** Modal hiển thị chuẩn 3 khối, tự động điền họ tên thật của TTS vào ô ký, hiển thị tóm tắt phụ cấp VND và thời hạn.
- [ ] **AC-6 (Xác thực Form Ký):** Nút *"Xác Nhận Ký"* bị khóa khi chưa tick checkbox cam kết hoặc ô tên bị xóa rỗng. Có hiệu ứng viền phát sáng `primary-glow` khi focus.
- [ ] **AC-7 (Chống Double-Click):** Khi nhấn Ký, nút chuyển sang trạng thái Loading (Spinner), khóa toàn bộ click chuột cho tới khi nhận kết quả.
- [ ] **AC-8 (Ký thành công & Cập nhật trạng thái):** Nhận HTTP 200 $\rightarrow$ Hiện Toast xanh, đóng Modal, bảng chuyển trạng thái sang `SIGNED`, Stepper trên Dashboard tiến tới `INTERNING`.
- [ ] **AC-9 (Từ chối hợp đồng):** Mở Modal nguy hiểm nền đỏ nhạt, nhập lý do $\ge 10$ ký tự $\rightarrow$ Gửi từ chối thành công, hợp đồng chuyển sang `REJECTED_BY_INTERN`.
- [ ] **AC-10 (Bảo toàn dữ liệu khi có lỗi):** Nếu mạng lỗi hoặc server trả 400/500, Modal không được tự động đóng, giữ nguyên dữ liệu đã gõ và hiển thị thông báo lỗi rõ ràng.
