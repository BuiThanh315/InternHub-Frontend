# Specification: Nhập Thực Tập Sinh Từ Tệp Excel Vào Chương Trình Thực Tập (TM-100 Frontend)

> **Tài liệu Đặc Tả Kỹ Thuật (Frontend Specification)**  
> **Dự án:** [InternHub-Frontend](file:///d:/codegym_final_project/InternHub-Frontend) (React 19, Vite, TypeScript, CSS Modules)  
> **Mã Jira Ticket:** [TM-100](https://robluccibn9935.atlassian.net/browse/TM-100) - *Thêm thực tập sinh vào chương trình thực tập bằng tệp Excel (Excel Batch Import & Multi-Program Enrollment UI)*  
> **Trạng thái:** SPECIFICATION APPROVED (v2.0)  
> **Lưu trữ tại:** [TM-100-import-interns-excel-frontend-spec.md](file:///d:/codegym_final_project/InternHub-Frontend/docs/specs/TM-100-import-interns-excel-frontend-spec.md)  
> **Change Level:** **L3** (Mở rộng `EnrollInternModal` với Tab Excel, hoàn thiện sub-component `ExcelImportTab`, tải template file Blob, upload MultipartFile, xử lý Preview & Bảng lỗi chi tiết, tích hợp Live Ingestion Ledger, Discrepancy Inspector, hiển thị thống kê phân loại ứng viên mới vs đã có tài khoản, tuân thủ 35 nguyên tắc Frontend và triết lý thiết kế độc bản).  
> **Tiêu chuẩn tuân thủ:** 35 Nguyên tắc bất biến ([`AGENTS.md`](file:///d:/codegym_final_project/InternHub-Frontend/AGENTS.md)), Quy chuẩn UX/UI ([`08-ui-ux-guidelines.md`](file:///d:/codegym_final_project/InternHub-Frontend/.agents/08-ui-ux-guidelines.md)) & Kỹ năng Thiết kế Giao diện Độc bản ([`frontend-design`](file:///d:/codegym_final_project/InternHub-Frontend/.agents/skills/frontend-design/SKILL.md)).

---

## 0. Nhật Ký Thay Đổi & Giải Trình Kỹ Thuật (Revision History & Change Rationale)

| Phiên bản | Ngày | Người thực hiện | Task / Jira | Loại thay đổi | Lý do & Giải trình kỹ thuật (Rationale) |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **v1.0** | 2026-10-09 | AI Senior Frontend Pair-Programmer | `TM-100` | Tạo mới Đặc Tả | Xây dựng đặc tả chi tiết cho phân hệ Frontend của tính năng nhập thực tập sinh hàng loạt từ tệp Excel trong `EnrollInternModal`, kết nối đồng bộ với 3 endpoints Backend TM-100. |
| **v1.1** | 2026-10-09 | AI Senior Frontend Pair-Programmer | `TM-100` | Hoàn thành Triển Khai | Đã hoàn thành triển khai ban đầu: Constants, Types, Service, ExcelImportTab (Live Ingestion Ledger, Discrepancy Inspector), tích hợp EnrollInternModal, build và lint kiểm tra thành công. |
| **v2.0** | 2026-10-13 | AI Senior Frontend Pair-Programmer & User | `TM-100` | Nâng Cấp Toàn Diện (Multi-Program & Frontend Design) | **Nâng cấp đặc tả đồng bộ với logic Backend v2.0 và triết lý `frontend-design`:**<br>1. *Hỗ trợ Tái Ghi Danh Đa Chương Trình (Multi-Program Enrollment):* Cho phép 1 TTS tham gia nhiều chương trình đồng thời. Backend chuyển cơ chế kiểm tra trùng lặp email/phone sang phạm vi chương trình (`Program-Scoped Duplicate Check`).<br>2. *Đồng bộ Hợp đồng Dữ liệu (Contracts):* Bổ sung `newCandidatesCount`, `existingCandidatesCount` vào `ExcelImportPreviewResponse` & `ExcelImportResultResponse`; bổ sung `isExistingUser`, `existingUserId` vào `ExcelInternRow`.<br>3. *Ứng dụng Triết Lý `frontend-design`:* Trọng tâm thị giác **Khối Ledger Đối Soát Sống (Live Ingestion Ledger)** với 2 luồng: Luồng Xanh (Clear Passage) và Luồng Đỏ (Discrepancy Inspector). Chống bẫy SaaS-card cliché, dùng typography và microcopy hành động có chủ đích.<br>4. *Phân Loại Minh Bạch:* Bổ sung các Metrics Pills phân loại và Tag trực quan `[Mới]` (`var(--success)`) vs `[Đã có tài khoản]` (`var(--info)`) trên từng dòng xem trước dữ liệu.<br>5. *Tuân thủ 100% 35 Quy Chuẩn Frontend:* Modal-First UX, 8pt Grid, Sleek Scrollbar, 0 mã Hex trong CSS Modules, và giới hạn state component $\le 4$. |

---

## 1. Feature Overview (Tổng Quan Tính Năng)

- **Tên tính năng:** Giao diện Nhập Danh Sách Thực Tập Sinh Hàng Loạt Từ Tệp Excel (Excel Intern Batch Import UI & Multi-Program Enrollment).
- **Hệ thống liên quan:**
  - **Frontend:** [InternHub-Frontend](file:///d:/codegym_final_project/InternHub-Frontend) (React 19, TypeScript, Vite, CSS Modules, Lucide React, Axios client).
  - **Backend API:** `intern-and-program-service` (Port `8082`) định tuyến qua API Gateway (Port `8080`) tại prefix `/api/programs/**`.
- **Điểm truy cập trên giao diện (Entry Points):**
  1. Trang Quản Trị Chương Trình HR (`/hr/programs`): Nút *"Tiếp nhận"* trên mỗi dòng chương trình ➔ Mở [EnrollInternModal](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/programs/components/EnrollInternModal/EnrollInternModal.tsx) -> Chọn Tab *"Nhập từ File Excel"*.
  2. Trang Workspace Chương Trình (`/hr/programs/:id`): Nút *"Tiếp nhận TTS"* trên Header ➔ Mở [EnrollInternModal](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/programs/components/EnrollInternModal/EnrollInternModal.tsx) -> Chọn Tab *"Nhập từ File Excel"*.
- **Đối tượng người dùng & Phân quyền:** `ROLE_HR`, `ROLE_ADMIN` (Người có thẩm quyền quản trị chương trình thực tập và tiếp nhận ứng viên).

---

## 2. Business Goals & Core Objectives (Mục Tiêu Nghiệp Vụ)

1. **Tối Ưu Hóa Năng Suất Nhập Liệu Của HR (High-Volume Ingestion):**
   - Giảm thời gian nhập liệu từ 30-45 phút (nhập thủ công từng ứng viên) xuống dưới 1 phút khi tiếp nhận 30-100 sinh viên từ các trường đại học đối tác.
2. **Minh Bạch Hóa Trạng Thái Tái Ghi Danh (Multi-Program Re-enrollment Transparency):**
   - Thực tập sinh xuất sắc có thể tham gia nhiều dự án hoặc kỳ thực tập khác nhau. Khi tải lên tệp Excel chứa ứng viên đã có tài khoản, hệ thống không báo lỗi trùng lặp email/SĐT toàn cục, mà ghi nhận hợp lệ và hiển thị rõ ràng nhãn `[Đã có tài khoản]`.
   - Ngăn chặn triệt để việc thêm trùng 1 ứng viên vào cùng một chương trình (`Program-Scoped Duplicate Check`).
3. **Cơ Chế Kiểm Tra Toàn Vẹn Tự Phục Vụ (Self-Service Validation & All-or-Nothing Safety):**
   - Hiển thị bảng kê chi tiết toàn bộ các dòng bị lỗi dữ liệu (thiếu cột, sai định dạng email, SĐT không hợp lệ, ngày sinh sai chuẩn, trùng trong cùng kỳ thực tập) kèm hướng dẫn khắc phục cụ thể để HR mở file chỉnh sửa ngay.
   - Nguyên tắc **All-or-Nothing**: Chỉ cho phép tiếp nhận khi 100% dòng dữ liệu hợp lệ và không vượt chỉ tiêu kỳ thực tập.
4. **Bảo Toàn Ngữ Cảnh Tuyệt Đối (Modal-First UX & Zero Context-Switching):**
   - Toàn bộ thao tác (Tải template, Upload, Xem preview phân loại, Duyệt lỗi, Xác nhận tiếp nhận) diễn ra ngay trong `EnrollInternModal`. Không điều hướng sang trang khác, bảo tồn 100% bộ lọc và vị trí phân trang của HR.

---

## 3. Khảo Sát Hiện Trạng & Đánh Giá Tái Sử Dụng Mã Nguồn (Rule 16 Compliance)

Tuân thủ nghiêm ngặt chỉ thị cốt lõi: *"Đảm bảo sẽ quét dự án, tránh việc tạo thêm code mới không cần thiết, sử dụng tối đa những gì đã có để phát triển"*:

### 3.1. Các thành phần Frontend hiện hữu được tái sử dụng 100%:
- **[EnrollInternModal.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/programs/components/EnrollInternModal/EnrollInternModal.tsx):** Tái sử dụng Modal Container chuẩn 3 khối, thanh Tab navigation (`pending` | `create` | `excel`), Program Banner hiển thị thông tin chương trình và chỉ tiêu.
- **[Common UI Components](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/):**
  - [Button](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Button/Button.tsx): Tái sử dụng các biến thể `variant="primary"`, `variant="secondary"`, hỗ trợ icon và trạng thái `isLoading`.
  - [Skeleton](file:///d:/codegym_final_project/InternHub-Frontend/src/components/common/Skeleton/Skeleton.tsx): Tái sử dụng hiệu ứng sóng Shimmer khi đang gửi request phân tích tệp preview.
- **Hạ tầng Mạng & Xử Lý Lỗi:** Tái sử dụng [api.ts](file:///d:/codegym_final_project/InternHub-Frontend/src/services/api.ts) và lớp `AppError` chuẩn hóa của dự án.
- **Hàm Tiện Ích (Utility Formatters):** Tái sử dụng hàm [formatFileSize](file:///d:/codegym_final_project/InternHub-Frontend/src/utils/formatters.ts) từ `src/utils/formatters.ts` để định dạng dung lượng tệp tin (KB, MB).
- **Hệ Thống Toast Notification:** Tái sử dụng thư viện `sonner` (`toast.success`, `toast.warning`, `toast.error`).
- **Design Tokens:** Tái sử dụng 100% CSS Variables từ [src/index.css](file:///d:/codegym_final_project/InternHub-Frontend/src/index.css).

### 3.2. Các thành phần nâng cấp / mở rộng theo chuẩn Domain-Driven:
1. **[program.types.ts](file:///d:/codegym_final_project/InternHub-Frontend/src/types/program.types.ts):**
   - Mở rộng `ExcelInternRow`: thêm `isExistingUser?: boolean`, `existingUserId?: number`.
   - Mở rộng `ExcelImportPreviewResponse`: thêm `newCandidatesCount?: number`, `existingCandidatesCount?: number`.
   - Mở rộng `ExcelImportResultResponse`: thêm `newCandidatesCount?: number`, `existingCandidatesCount?: number`.
2. **[ExcelImportTab.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/programs/components/EnrollInternModal/tabs/ExcelImportTab.tsx):**
   - Bổ sung các Metrics Pills phân loại ứng viên (`Mới: {X}`, `Đã có tài khoản: {Y}`).
   - Gắn nhãn Tag phân biệt `[Mới]` vs `[Đã có tài khoản]` trên từng dòng của bảng xem trước Live Ingestion Ledger.
   - Nâng cấp dynamic copywriting cho nút bấm tiếp nhận và thông điệp tóm tắt.
3. **[ExcelImportTab.module.css](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/programs/components/EnrollInternModal/tabs/ExcelImportTab.module.css):**
   - Bổ sung class styles cho Tag phân loại ứng viên (`candidateTagNew`, `candidateTagExisting`), tuân thủ 100% CSS Variables, không có mã Hex.

---

## 4. Ngôn Ngữ Thiết Kế Độc Bản (Bespoke Visual Design theo `frontend-design`)

Áp dụng phương châm cốt lõi của kỹ năng `frontend-design`: **"Spend your boldness in one place"**, **"Ground your designs in the subject matter"** và **"Writing in design"**:

### 4.1. Triết Lý Thị Giác & Bối Cảnh Nghiệp Vụ (Subject Matter Grounding)
- **Bối cảnh nghiệp vụ:** Phân hệ tuyển dụng và quản lý nhân sự thực tập sinh (Enterprise Talent Acquisition). HR làm việc với các bảng tính dữ liệu hàng chục đến hàng trăm ứng viên, đòi hỏi sự chuẩn xác, rõ ràng và giảm thiểu căng thẳng thị giác khi kiểm tra đối soát lỗi.
- **Trọng tâm thị giác duy nhất (Spend Boldness in One Place):** Toàn bộ giao diện tab Excel tập trung vào **Khối Ledger Đối Soát Sống (Live Ingestion Ledger)**:
  - Khi chưa chọn tệp: Dropzone tinh giản, đường viền nét đứt thanh mảnh (`border: 1.5px dashed var(--border-default)`), hover chuyển màu dịu mát, không phô trương.
  - Khi đã chọn tệp: Dropzone thu gọn lại thành một File Chip nhỏ gọn trên đầu, nhường toàn bộ không gian cho Ledger với 2 luồng phản hồi phân tách rành mạch:
    - **Luồng Xanh (Clear Passage):** Bảng dữ liệu xem trước tối đa 10 dòng đầu, đường kẻ phân tách vi mô, số thứ tự rõ ràng và Tag phân biệt loại ứng viên.
    - **Luồng Đỏ (Discrepancy Inspector):** Bảng tra cứu lỗi chi tiết từng dòng, định danh Dòng, Cột và câu chỉ dẫn khắc phục cụ thể.

### 4.2. Chống Các Bẫy Mòn Của Thiết Kế Mặc Định (Anti-Cliché Checklist)
Bảng kiểm soát các dấu hiệu thiết kế mặc định theo chuẩn `frontend-design`:
- [x] **Không sử dụng SaaS-card kit cliché:** Không chia cắt nội dung thành các card bo tròn lặp lại vô nghĩa với cùng một viền và bóng đổ nhạt. Sử dụng cấu trúc đường phân cách thanh mảnh (`border: 1px solid var(--border-default)`) và outline có thứ bậc.
- [x] **Không viết ALL-CAPS cho nhãn và tag:** Toàn bộ tiêu đề cột, tag trạng thái và nút bấm sử dụng Sentence case (`Họ và tên`, `Ứng viên mới`, `Đã có tài khoản`).
- [x] **Không dùng ký tự nối vô nghĩa (Middle dots `·`, Spaced em dashes `—`):** Bố cục dùng Flexbox gap có khoảng cách chuẩn (`0.5rem`, `0.75rem`).
- [x] **Không gắn mũi tên `→` tùy tiện vào nút bấm:** Nút bấm sử dụng icon trực diện theo hành động (`<Download size={14} />`, `<CheckCircle2 size={16} />`).
- [x] **Tiết chế chuyển động (Restrained Motion):** Chỉ sử dụng micro-transition mượt mà (150ms - 200ms) để phản hồi hành động của người dùng (hover nút bấm, kéo thả vào dropzone, chuyển đổi trạng thái). Không có animation bay lượn phân tán sự tập trung.

### 4.3. Bản Đồ Token & Bảng Màu Ngữ Nghĩa (Semantic Design Tokens - Rule 29)
*Tuyệt đối cấm sử dụng mã màu Hex trong file `.module.css`*:

| Nhóm Màu | CSS Variable | Light Mode | Dark Mode | Mục Đích Sử Dụng Trong Giao Diện |
| :--- | :--- | :--- | :--- | :--- |
| **Brand Accent** | `var(--primary)` | `#4f46e5` | `#6366f1` | Nút hành động chính, viền focus, icon dropzone |
| **Brand Glow** | `var(--primary-glow)` | `rgba(79, 70, 229, 0.25)` | `rgba(99, 102, 241, 0.35)` | Hào quang phát sáng khi kéo thả tệp (`drag-over`) |
| **Brand Surface** | `var(--primary-light)` | `#eef2ff` | `rgba(99, 102, 241, 0.12)` | Nền banner hướng dẫn template, nền dropzone hover |
| **Ứng Viên Mới** | `var(--success)` | `#10b981` | `#10b981` | Tag `[Mới]`, Pill hợp lệ, thông báo sẵn sàng nhập |
| **Nền Xanh Mới** | `var(--success-bg)` | `#ecfdf5` | `rgba(16, 185, 129, 0.12)` | Nền Tag `[Mới]`, nền Pill hợp lệ |
| **Viền Xanh Mới** | `var(--success-border)` | `#a7f3d0` | `rgba(16, 185, 129, 0.25)` | Đường viền Tag `[Mới]` |
| **Đã Có Tài Khoản**| `var(--info)` | `#3b82f6` | `#60a5fa` | Tag `[Đã có tài khoản]`, Pill tái ghi danh |
| **Nền Đã Có TK** | `var(--info-bg)` | `#eff6ff` | `rgba(59, 130, 246, 0.12)` | Nền Tag `[Đã có tài khoản]` |
| **Viền Đã Có TK** | `var(--info-border)` | `#bfdbfe` | `rgba(59, 130, 246, 0.25)` | Viền Tag `[Đã có tài khoản]` |
| **Lỗi & Cảnh Báo** | `var(--danger)` | `#ef4444` | `#f87171` | Discrepancy header, số lỗi, Dòng lỗi |
| **Nền Khối Lỗi** | `var(--danger-bg)` | `#fef2f2` | `rgba(239, 68, 68, 0.12)` | Nền khối Discrepancy Inspector |
| **Viền Khối Lỗi** | `var(--danger-border)` | `#fecaca` | `rgba(239, 68, 68, 0.25)` | Viền khối Discrepancy Inspector |
| **Văn Bản Chính** | `var(--text-main)` | `#0f172a` | `#f8fafc` | Tiêu đề, dữ liệu xem trước trong bảng |
| **Văn Bản Phụ** | `var(--text-secondary)`| `#475569` | `#cbd5e1` | Nhãn trường, mô tả hướng dẫn, header bảng |
| **Văn Bản Mờ** | `var(--text-muted)` | `#94a3b8` | `#64748b` | Ghi chú số lượng, số thứ tự `#` |
| **Nền Bảng / Card**| `var(--bg-surface)` | `#ffffff` | `#131d33` | Nền modal, nền bảng xem trước, nền file chip |
| **Nền Khung** | `var(--bg-body)` | `#f8fafc` | `#090d16` | Nền vùng dropzone, nền header bảng th |
| **Đường Phân Tách**| `var(--border-default)`| `#e2e8f0` | `#26354a` | Viền bao bảng, viền các khối chức năng |

### 4.4. Nghệ Thuật Viết Trong Thiết Kế (Writing in Design & Intentional Microcopy)
Mọi câu từ trên giao diện đều có chủ đích, trực diện và đặt theo góc nhìn của người dùng:
- **Nút tải tệp mẫu:** `"Tải bảng tính mẫu .xlsx"` (chỉ rõ định dạng).
- **Trạng thái sẵn sàng tiếp nhận:**
  - Nút Submit: `"Tiếp nhận {N} thực tập sinh vào chương trình"`.
  - Thông điệp tóm tắt: `"Sẵn sàng nhập {N} thực tập sinh ({X} ứng viên mới, {Y} đã có tài khoản)."`.
- **Trạng thái có lỗi trong file:**
  - Nút Submit: Bị vô hiệu hóa (`disabled`).
  - Thông điệp tóm tắt: `"Chưa thể tiếp nhận: Cần sửa {N} lỗi trong file Excel trước."`.
- **Trạng thái vượt chỉ tiêu:**
  - Thông điệp tóm tắt: `"Chưa thể tiếp nhận: Số lượng ứng viên vượt quá chỉ tiêu còn lại của chương trình."`.
- **Nguyên tắc thông báo lỗi:** Không xin lỗi rườm rà (`Xin lỗi vì sự bất tiện...`), chỉ ra thẳng nguyên nhân và cách khắc phục:
  - *Ví dụ:* `"Số điện thoại không đúng định dạng (cần 10 chữ số, ví dụ 0912345678 hoặc +84912345678)"`.
  - *Ví dụ:* `"Email [abc@xyz.com] đã ghi danh trong kỳ thực tập này"`.

---

### 4.5. ASCII Wireframes & Bố Cục Chi Tiết

#### Wireframe 1: Trạng Thái Ban Đầu (Dropzone & Nút Tải Template)
```
+--------------------------------------------------------------------------------------------------------------------+
| [FileSpreadsheet] Nhập danh sách từ tệp tin Excel (.xlsx)                           [ Download ] Tải tệp mẫu .xlsx |
| Sử dụng bảng tính mẫu chuẩn để nhập hàng loạt thực tập sinh vào chương trình.                                      |
| Hệ thống tự động kiểm tra số điện thoại, ngày sinh và hỗ trợ tái ghi danh đa chương trình an toàn (All-or-Nothing).|
+--------------------------------------------------------------------------------------------------------------------+
|                                                                                                                    |
|   . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .    |
|   .                                                                                                           .    |
|   .                                           [ UploadCloud Icon ]                                            .    |
|   .                               Kéo thả file Excel vào đây hoặc click để chọn tệp                           .    |
|   .                     Hỗ trợ tệp Excel tối đa 5MB. Định dạng SĐT: +84... hoặc 0..., ngày sinh: dd/MM/yyyy   .    |
|   .                                            [ Định dạng .xlsx, .xls ]                                      .    |
|   .                                                                                                           .    |
|   . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .    |
|                                                                                                                    |
+--------------------------------------------------------------------------------------------------------------------+
```

#### Wireframe 2: Live Ingestion Ledger (Hợp Lệ & Phân Loại Ứng Viên Mới vs Đã Có Tài Khoản)
```
+--------------------------------------------------------------------------------------------------------------------+
| [FileSpreadsheet] Danh_Sach_Thuc_Tap_Sinh_K8.xlsx   (24.5 KB)                                        [ Trash2 / Hủy ]|
+--------------------------------------------------------------------------------------------------------------------+
| [CheckCircle2] Danh Sách Thực Tập Sinh Hợp Lệ     [ Users ] Hợp lệ: 15 / 15 dòng   [ Info ] Slot trống: 20         |
|                                                   [ ✦ Mới: 10 ]   [ ✦ Đã có tài khoản: 5 ]                         |
+--------------------------------------------------------------------------------------------------------------------+
| #  | Họ và tên           | Email                    | Số ĐT        | Phân Loại        | Trường ĐH       | Vị Trí     |
|----+---------------------+--------------------------+--------------+------------------+-----------------+------------|
| 1  | Trần Bảo Anh        | baoanh.tran@gmail.com    | 0901234567   | [ Mới ]          | ĐH Bách Khoa    | Backend    |
| 2  | Lê Quốc Cường       | cuong.le@gmail.com       | 0912345678   | [ Đã có TK ]     | ĐH FPT          | Frontend   |
| 3  | Nguyễn Minh Đạt     | dat.nguyen@gmail.com     | 0987654321   | [ Mới ]          | ĐH Quốc Gia     | Fullstack  |
| 4  | Phạm Thu Trang      | trang.pham@gmail.com     | 0933445566   | [ Đã có TK ]     | ĐH Kinh Tế      | QA Tester  |
| ...| ...                 | ...                      | ...          | ...              | ...             | ...        |
+--------------------------------------------------------------------------------------------------------------------+
| * Hiển thị tối đa 10 dòng đầu tiên xem trước trên giao diện.                                                       |
+--------------------------------------------------------------------------------------------------------------------+
| Tùy chọn trạng thái tiếp nhận vào chương trình:                                                                    |
|   (o) Tiếp nhận chính thức ngay (APPROVED) — Tự động cập nhật số lượng TTS kỳ thực tập                             |
|   ( ) Lưu vào danh sách chờ xét duyệt (PENDING) — HR phê duyệt thủ công từng ứng viên sau                          |
+--------------------------------------------------------------------------------------------------------------------+
| Sẵn sàng nhập 15 thực tập sinh (10 ứng viên mới, 5 đã có tài khoản).    [ Hủy / Chọn lại ]  [✓ Tiếp nhận 15 TTS]   |
+--------------------------------------------------------------------------------------------------------------------+
```

#### Wireframe 3: Discrepancy Inspector (Khi Phát Hiện Dòng Lỗi Dữ Liệu)
```
+--------------------------------------------------------------------------------------------------------------------+
| [FileSpreadsheet] Danh_Sach_Loi_K8.xlsx   (18.2 KB)                                          [ Trash2 / Hủy ]|
+--------------------------------------------------------------------------------------------------------------------+
| [AlertTriangle] Phát hiện lỗi không hợp lệ trong tệp dữ liệu                              [ 3 lỗi cần khắc phục ]  |
| Hệ thống áp dụng cơ chế All-or-Nothing. Toàn bộ các dòng lỗi dưới đây phải được chỉnh sửa trong file Excel:        |
+--------------------------------------------------------------------------------------------------------------------+
| Dòng      | Thuộc tính       | Giá trị trong file          | Nguyên nhân & Hướng dẫn sửa                           |
|-----------+------------------+-----------------------------+-------------------------------------------------------|
| [Dòng 4]  | Email            | <Để trống>                  | Email bắt buộc không được để trống                    |
| [Dòng 7]  | Số điện thoại    | 12345                       | Số điện thoại không hợp lệ (cần 10 chữ số)            |
| [Dòng 12] | Email            | van.hoang@company.com       | Email này đã ghi danh trong chính chương trình này    |
+--------------------------------------------------------------------------------------------------------------------+
| Chưa thể tiếp nhận: Cần sửa 3 lỗi trong file Excel trước.                 [ Hủy / Chọn lại ]  [ Vô hiệu hóa Submit ] |
+--------------------------------------------------------------------------------------------------------------------+
```

---

## 5. Cấu Trúc Types & API Contracts (Data Architecture)

### 5.1. Cập Nhật Types Trong `src/types/program.types.ts`
Khớp 100% với Backend Spring Boot DTOs (TM-100 v2.0):

```typescript
export interface ExcelRowError {
  rowNumber: number;
  fieldName: string;
  cellValue?: string;
  errorMessage: string;
}

export interface ExcelInternRow {
  rowNumber: number;
  fullName: string;
  email: string;
  phone: string;
  gender?: string;
  dateOfBirth?: string;
  university: string;
  major: string;
  academicYear?: string;
  address?: string;
  appliedPosition?: string;
  notes?: string;
  isExistingUser?: boolean;     // [MỚI v2.0] true nếu ứng viên đã có tài khoản hệ thống (IAM)
  existingUserId?: number;      // [MỚI v2.0] ID tài khoản IAM của ứng viên
}

export interface ExcelImportPreviewResponse {
  programId: number;
  programName: string;
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  availableSlots: number;
  isQuotaExceeded: boolean;
  errors: ExcelRowError[];
  previewRows: ExcelInternRow[];
  newCandidatesCount?: number;      // [MỚI v2.0] Số ứng viên mới hoàn toàn
  existingCandidatesCount?: number; // [MỚI v2.0] Số ứng viên đã có tài khoản (tái ghi danh)
}

export interface ExcelImportResultResponse {
  programId: number;
  programName: string;
  importedCount: number;
  currentInterns: number;
  maxInterns: number;
  importedInternCodes: string[];
  importedAt: string;
  newCandidatesCount?: number;      // [MỚI v2.0] Số ứng viên mới được tạo tài khoản
  existingCandidatesCount?: number; // [MỚI v2.0] Số ứng viên đã có tài khoản được thêm vào chương trình
}
```

### 5.2. Khai Báo API Endpoints (`src/constants/endpoints/program.endpoints.ts`)
```typescript
export const PROGRAM_ENDPOINTS = {
  // ... endpoints hiện hữu ...
  IMPORT_TEMPLATE: '/api/programs/import-template',
  IMPORT_PREVIEW: (programId: number | string) => `/api/programs/${programId}/import-interns/preview`,
  IMPORT_EXCEL: (programId: number | string) => `/api/programs/${programId}/import-interns`,
} as const;
```

### 5.3. Service Signatures (`src/services/programService.ts`)
Tất cả các hàm gọi API đều hỗ trợ `signal?: AbortSignal` (Rule 19):
```typescript
downloadImportTemplate(signal?: AbortSignal): Promise<Blob>;
previewImportExcel(programId: number, file: File, signal?: AbortSignal): Promise<ExcelImportPreviewResponse>;
importInternsFromExcel(programId: number, file: File, status?: 'APPROVED' | 'PENDING', signal?: AbortSignal): Promise<ExcelImportResultResponse>;
```

---

## 6. Quản Lý State & Giới Hạn Component (Rule 15 Compliance)

Tuân thủ nghiêm ngặt **Rule 15 (Giới hạn tối đa 3-4 state trong một Component)**:
Thay vì khai báo 7-8 `useState` rời rạc gây re-render phân mảnh, gom toàn bộ vòng đời tương tác của `ExcelImportTab` vào một **State Object duy nhất (`ImportState`)**:

```typescript
interface ImportState {
  file: File | null;                           // Tệp Excel người dùng đã chọn
  preview: ExcelImportPreviewResponse | null;  // Kết quả đối soát từ API
  isDownloadingTemplate: boolean;              // Trạng thái đang tải tệp mẫu
  isLoadingPreview: boolean;                   // Trạng thái đang phân tích tệp
  isSubmitting: boolean;                       // Trạng thái đang gửi lệnh tiếp nhận
  status: 'APPROVED' | 'PENDING';              // Lựa chọn trạng thái tiếp nhận
  isDragOver: boolean;                         // Trạng thái drag & drop hover
}

const [state, setState] = useState<ImportState>(INITIAL_STATE);
const fileInputRef = useRef<HTMLInputElement>(null);
```

**Lợi ích kiến trúc:**
- Component chỉ tiêu thụ đúng **1 `useState`** duy nhất.
- Reset toàn bộ trạng thái về ban đầu chỉ bằng 1 thao tác: `setState(INITIAL_STATE)`.
- Tránh triệt để race condition khi cập nhật nhiều biến độc lập.

---

## 7. Luồng Trải Nghiệm Người Dùng (Modal-First UX & Mutation Feedback)

```text
[HR mở EnrollInternModal] ➔ [Chọn Tab 'Nhập từ File Excel']
             │
             ├─► [Chưa có file mẫu] ➔ Bấm "Tải bảng tính mẫu .xlsx" ➔ Trình duyệt tải Blob file
             │
             └─► [Đã có file Excel điền sẵn]
                      │
                      ▼
             [Kéo thả / Chọn file .xlsx]
                      │
                      ▼ (Client validation: đúng đuôi .xlsx/.xls và size <= 5MB)
             [Skeleton Loader xuất hiện] ➔ Gọi POST /preview
                      │
        ┌─────────────┴────────────────────────────────┐
        ▼                                              ▼
[File có dòng lỗi]                           [100% dòng hợp lệ]
        │                                              │
        ▼                                              ▼
[Discrepancy Inspector]                       [Live Ingestion Ledger]
- Bôi đỏ danh sách lỗi từng dòng               - Hiển thị Pills: Hợp lệ, Slot trống, Mới, Đã có TK
- Nêu rõ nguyên nhân & cách sửa                - Bảng xem trước tối đa 10 dòng
- Vô hiệu hóa nút Xác nhận                     - Gắn Tag [Mới] (Green) vs [Đã có TK] (Blue)
- HR mở file sửa lại ➔ Chọn lại file           - Chọn trạng thái: APPROVED hoặc PENDING
                                                       │
                                                       ▼
                                              [Bấm "Tiếp nhận {N} thực tập sinh"]
                                                       │
                                                       ▼
                                              [POST /import-interns]
                                                       │
                                                       ▼
                                              [Toast Thành Công]
                                              - Thông báo số lượng TTS đã tiếp nhận
                                              - Đóng EnrollInternModal
                                              - Kích hoạt refetch() làm mới danh sách
```

---

## 8. Xử Lý Các Trường Hợp Biên & Phòng Ngừa Sự Cố (Edge Cases & Frontend Mitigations)

| Mã Case | Trường Hợp Biên (Edge Case) | Cơ Chế Xử Lý Frontend (Mitigation) |
| :---: | :--- | :--- |
| **EC-01** | Người dùng chọn tệp sai định dạng (vd `.pdf`, `.csv`, `.docx`) | Chặn ngay tại `onDrop`/`onChange`. Bắn Toast cảnh báo: *"Chỉ hỗ trợ tệp tin định dạng Microsoft Excel (.xlsx, .xls)"*. Không gửi request lên server. |
| **EC-02** | Tệp Excel có dung lượng vượt quá 5MB | Chặn ngay tại Client. Bắn Toast: *"Dung lượng tệp vượt quá giới hạn tối đa cho phép (5MB)"*. Reset input file. |
| **EC-03** | Số lượng ứng viên hợp lệ vượt quá chỉ tiêu kỳ thực tập (`isQuotaExceeded = true`) | Hiển thị Warning Card màu vàng đậm cảnh báo chi tiết số dòng hợp lệ vs chỉ tiêu trống còn lại. Vô hiệu hóa nút Submit (`disabled = true`). |
| **EC-04** | Người dùng bấm nút tiếp nhận nhiều lần (Double-click / Rapid fire) | Khóa nút submit bằng cờ `isSubmitting = true`, đổi nhãn nút sang *"Đang tiếp nhận..."* kèm Spinner. Vô hiệu hóa toàn bộ tương tác form. |
| **EC-05** | Mạng bị ngắt hoặc lỗi server 500 / timeout giữa chừng | Bắt lỗi qua `try/catch` với `AppError`, hiển thị Toast lỗi rõ ràng. **Bảo toàn dữ liệu: Tuyệt đối không đóng modal và không xóa tệp đã chọn**, để HR có thể bấm *"Thử lại"* ngay khi có mạng (Rule 25). |
| **EC-06** | HR đóng modal đột ngột khi đang gửi request preview/import | Tích hợp `AbortController` gắn với lifecycle của component. Khi unmount, gọi `abortController.abort()` để hủy request ngầm, chống rò rỉ bộ nhớ (Memory Leak) và lỗi cập nhật state unmounted. |
| **EC-07** | Tệp chứa ứng viên đã từng thực tập kỳ trước (Multi-Program Re-enrollment) | Giao diện ghi nhận hợp lệ, hiển thị Tag xanh dương `[Đã có tài khoản]`, Badge `Đã có tài khoản: {Y}`. Thông báo xác nhận nêu rõ số lượng ứng viên tái ghi danh, không nhầm lẫn với lỗi trùng lặp. |
| **EC-08** | Tệp chứa 2 dòng trùng email/SĐT với nhau, hoặc trùng với ứng viên đã có trong CHÍNH KỲ NÀY | Giao diện hiển thị trong bảng Discrepancy Inspector: Dòng bị lỗi, thuộc tính `Email` hoặc `Số điện thoại`, ghi rõ *"Đã ghi danh trong chính kỳ thực tập này"*. Khóa nút xác nhận. |

---

## 9. Tiêu Chuẩn Thiết Kế UX/UI Chi Tiết (UI/UX Guidelines Compliance)

1. **Chuẩn Nhịp Thở Không Gian 8pt Grid (Rule 1.2):**
   - Khoảng cách giữa các thành phần (`gap: 1.25rem` = 20px, `padding: 1rem 1.25rem` = 16px/20px).
   - Padding trong bảng dữ liệu: `0.55rem 0.75rem` (9px/12px) tạo cảm giác thoáng đãng, dễ quét.
2. **Sleek Custom Scrollbar (Rule 35):**
   - Thanh cuộn bảng xem trước và bảng lỗi siêu mảnh: `width: 6px`, `height: 6px`.
   - Bo góc `border-radius: var(--radius-full)`.
   - Màu thanh cuộn sử dụng `var(--border-default)` và tự đậm lên `var(--text-muted)` khi hover.
3. **Quy Chuẩn Bảng Dữ Liệu Tối Đa 10 Dòng (Rule 32):**
   - Bảng xem trước dữ liệu hiển thị tối đa **10 dòng đầu tiên** (`max-height: 250px` kèm thanh cuộn cục bộ).
   - Có ghi chú rõ ràng ở đáy bảng: `* Hiển thị tối đa 10 dòng đầu tiên xem trước trên giao diện.`
4. **Hiệu Ứng Trọng Tâm Thị Giác (Focus Glow - Rule 31):**
   - Dropzone khi kéo tệp vào (`drag-over`) lập tức hiển thị viền `var(--primary)` và hào quang sáng nhẹ: `box-shadow: 0 0 0 4px var(--primary-glow)`.
5. **Tương Thích Tuyệt Đối 2 Chiều Dark/Light Mode (Rule 29):**
   - 100% thuộc tính CSS trong `ExcelImportTab.module.css` sử dụng CSS Variables. Không có bất kỳ mã Hex nào. Tự động chuyển đổi màu sắc mượt mà khi người dùng đổi giao diện sang Dark Mode.

---

## 10. Ma Trận Kiểm Thử Giao Diện (Frontend Test Matrix)

| Mã Test | Kịch Bản Kiểm Thử | Dữ Liệu Đầu Vào | Kết Quả Kỳ Vọng |
| :---: | :--- | :--- | :--- |
| **TC-FE-01** | Tải tệp template Excel mẫu | Bấm nút *"Tải bảng tính mẫu .xlsx"* | Trình duyệt kích hoạt tải tệp `Mau_Nhap_Thuc_Tap_Sinh_{CODE}.xlsx`, Toast thông báo thành công |
| **TC-FE-02** | Kéo thả tệp sai định dạng | Kéo tệp `danh_sach.pdf` hoặc `.csv` | Chặn ngay tại Client, Toast thông báo: *"Chỉ hỗ trợ tệp tin định dạng Microsoft Excel (.xlsx, .xls)"* |
| **TC-FE-03** | Kéo thả tệp dung lượng > 5MB | Tệp Excel có kích thước 6.2MB | Chặn tại Client, Toast thông báo: *"Dung lượng tệp vượt quá giới hạn tối đa cho phép (5MB)"* |
| **TC-FE-04** | Tải lên file có dữ liệu lỗi | Tệp có dòng thiếu email, SĐT sai | Skeleton hiển thị trong lúc gọi API, sau đó render bảng Discrepancy Inspector màu đỏ, nút submit bị vô hiệu hóa |
| **TC-FE-05** | Tải lên file vượt chỉ tiêu còn lại | File có 15 ứng viên, chỉ tiêu còn 5 | Render cảnh báo chỉ tiêu không đủ, nút submit bị vô hiệu hóa |
| **TC-FE-06** | Tải lên file chứa TTS đã có tài khoản (Re-enrollment) | File có 3 TTS mới + 2 TTS đã có trong hệ thống | Bảng Live Ingestion Ledger hiển thị 5 dòng hợp lệ; 3 dòng gắn Tag `[Mới]` (Green) và 2 dòng gắn Tag `[Đã có tài khoản]` (Blue); Pills thống kê chuẩn; Nút submit mở |
| **TC-FE-07** | Tiếp nhận thành công vào chương trình | Bấm nút *"Tiếp nhận 5 thực tập sinh"* | Hiệu ứng loading trên nút, gọi API thành công ➔ Toast success ➔ Reset tab ➔ Đóng modal ➔ Danh sách chương trình được refetch |
| **TC-FE-08** | Kiểm tra chế độ Dark Mode | Kích hoạt giao diện Dark Mode | Nền card, màu chữ, viền bảng, và các tag màu xanh/đỏ chuyển đổi tương phản hoàn hảo theo CSS Tokens |

---

## 11. Tiêu Chí Nghiệm Thu (Acceptance Criteria Checklist)

- [ ] **AC-FE-01:** Mở `EnrollInternModal` hiển thị tab thứ 3 *"Nhập từ File Excel"* với icon bảng tính trực quan.
- [ ] **AC-FE-02:** Nhấn nút *"Tải bảng tính mẫu .xlsx"* tải về máy tính file Excel template thành công với định dạng chuẩn.
- [ ] **AC-FE-03:** Chọn file không đúng định dạng (vd `.pdf`) hoặc > 5MB bị chặn ngay tại Client kèm Toast cảnh báo, không gửi request lên backend.
- [ ] **AC-FE-04:** Kéo thả/chọn file `.xlsx` hợp lệ: tự động gọi preview, hiển thị Skeleton loader, và render bản tóm tắt phân tích với các Metrics Pills trực quan.
- [ ] **AC-FE-05:** Khi file có dòng bị lỗi: hiển thị bảng Discrepancy Inspector chi tiết theo từng dòng màu đỏ; nút xác nhận bị vô hiệu hóa.
- [ ] **AC-FE-06:** Khi số lượng ứng viên vượt quá chỉ tiêu còn lại của chương trình: hiển thị banner cảnh báo vượt chỉ tiêu và khóa nút xác nhận.
- [ ] **AC-FE-07:** Khi tải lên file chứa các TTS đã từng tham gia kỳ khác, giao diện preview hiển thị hợp lệ (không bị chặn lỗi), tổng kết rõ ràng số lượng `[Mới: X]` và `[Đã có tài khoản: Y]` bằng các Metrics Pills trực quan.
- [ ] **AC-FE-08:** Trên bảng xem trước dữ liệu (Live Ingestion Ledger), mỗi ứng viên hiển thị Tag nhận diện rõ ràng: Tag xanh lá `[Mới]` nếu ứng viên chưa có trong hệ thống, và Tag xanh dương `[Đã có tài khoản]` nếu ứng viên đã có tài khoản IAM.
- [ ] **AC-FE-09:** Hỗ trợ lựa chọn trạng thái tiếp nhận: Radio button `APPROVED` (Tiếp nhận chính thức ngay) hoặc `PENDING` (Lưu vào danh sách chờ xét duyệt).
- [ ] **AC-FE-10:** Khi 100% dòng hợp lệ: nút xác nhận sáng lên với dynamic text *"Tiếp nhận {N} thực tập sinh"*, bấm nút gửi request import thành công, hiển thị Toast success, đóng modal và làm mới bảng danh sách chương trình/TTS.
- [ ] **AC-FE-11:** Khi xảy ra lỗi mạng hoặc lỗi API server 500, Modal và tệp tin đã chọn được giữ nguyên vẹn để HR có thể bấm thử lại, không làm mất ngữ cảnh.
- [ ] **AC-FE-12:** Giao diện hoàn toàn tương thích và đẹp mắt trên cả Light Mode và Dark Mode, 100% màu sắc sử dụng CSS Variables, không có mã Hex hardcode.

