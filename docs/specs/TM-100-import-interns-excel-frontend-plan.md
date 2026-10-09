# Implementation Plan: TM-100 Nhập Thực Tập Sinh Từ Tệp Excel (Frontend Implementation)

> **Mã công việc:** TM-100  
> **Nhánh Git:** `feature/TM-100/add-excel-intern-frontend`  
> **Tài liệu đặc tả:** [TM-100 Frontend Spec v1.0](file:///d:/codegym_final_project/InternHub-Frontend/docs/specs/TM-100-import-interns-excel-frontend-spec.md)  
> **Phạm vi tác động:** `InternHub-Frontend` (React 19 + TypeScript + Vite)  
> **Tuân thủ quy chuẩn:** Tuân thủ 100% [AGENTS.md](file:///d:/codegym_final_project/InternHub-Frontend/AGENTS.md) và thư mục [`.agents/`](file:///d:/codegym_final_project/InternHub-Frontend/.agents/).

---

## 1. Khảo Sát Hiện Trạng & Đánh Giá Tái Sử Dụng Mã Nguồn (Mandatory Reuse Audit)

> [!IMPORTANT]
> **Tuân thủ triệt để Quy tắc 15 & Chỉ thị bắt buộc:** *"ĐẢM BẢO SẼ QUÉT DỰ ÁN, TRÁNH VIỆC TẠO THÊM CODE MỚI KHÔNG CẦN THIẾT, SỬ DỤNG TỐI ĐA NHỮNG GÌ ĐÃ CÓ ĐỂ PHÁT TRIỂN"*.

| Thành phần giao diện / mã nguồn | Hiện trạng quét được trong dự án Frontend | Đánh giá & Quyết định tái sử dụng | Lý do kỹ thuật & Giải trình |
| :--- | :--- | :--- | :--- |
| **Modal Container** | Đã có [EnrollInternModal.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/programs/components/EnrollInternModal/EnrollInternModal.tsx). | **TÁI SỬ DỤNG & MỞ RỘNG** | Mở rộng thêm tab thứ 3 `'excel'`, tái sử dụng toàn bộ Header, Banner thông tin chương trình và logic chỉ tiêu. |
| **Common UI Components** | `Modal`, `Button`, `Skeleton`, `Badge` trong `src/components/common/`. | **TÁI SỬ DỤNG 100%** | Sử dụng toàn bộ nút bấm, khung tải skeleton từ thư mục dùng chung, không viết thẻ `<button>` trần. |
| **Icons** | Thư viện `lucide-react` đã cài sẵn (`FileSpreadsheet`, `UploadCloud`, `CheckCircle2`, `AlertTriangle`, `Download`, `Trash2`...). | **TÁI SỬ DỤNG 100%** | Dùng icon chuẩn mực của dự án, đồng bộ ngôn ngữ thiết kế. |
| **API Client & Endpoints** | Đã có `apiClient` Axios và cấu trúc [program.endpoints.ts](file:///d:/codegym_final_project/InternHub-Frontend/src/constants/endpoints/program.endpoints.ts). | **MỞ RỘNG TẬP TRUNG** | Bổ sung 3 constant endpoints vào `program.endpoints.ts` và 3 hàm vào `programService.ts`. |
| **Toast & Formatters** | `sonner` toast và tiện ích format ngày tháng `formatDate` trong `src/utils/formatters.ts`. | **TÁI SỬ DỤNG 100%** | Phản hồi thông báo trực quan theo đúng quy chuẩn dự án. |
| **Design Tokens** | Toàn bộ biến CSS Variables trong `src/index.css` (`var(--primary)`, `var(--bg-card)`, `var(--danger)`,...). | **TUÂN THỦ 100%** | Tuyệt đối không dùng mã màu Hex `#...` trong file `.module.css`. |

---

## 2. Mục Tiêu & Định Hướng Thiết Kế (Objectives & Design Direction)

1. **Áp dụng triết lý Thiết kế Độc bản ([frontend-design](file:///d:/codegym_final_project/InternHub-Frontend/.agents/skills/frontend-design/SKILL.md)):**
   - **Tập trung điểm nhấn thị giác vào đúng một chỗ:** Khối **Live Ingestion Ledger** đóng vai trò bảng đối soát kiểm toán trực quan, tránh các card tròn lặp lại vô nghĩa (SaaS-card kit cliché).
   - **Microcopy chức năng & dứt khoát:** Nhãn nút bấm hành động cụ thể (*"Tiếp nhận {N} thực tập sinh vào chương trình"*, *"Tải bảng tính mẫu .xlsx"*), văn phong lỗi chính xác, hướng dẫn khắc phục thẳng thắn.
   - **Tiết chế chuyển động:** Chỉ dùng transition viền và hào quang ánh sáng (150ms-200ms) để phản hồi tương tác kéo thả và hover của người dùng.
2. Tích hợp tính năng nhập Excel mượt mà vào `EnrollInternModal` với cấu trúc **Domain-Driven Modular** (tách sub-component `ExcelImportTab` riêng để chống God-file, giữ state <= 4).
3. Kết nối đồng bộ với 3 endpoints Backend TM-100 vừa triển khai (`import-template`, `import-interns/preview`, `import-interns`).
4. Đảm bảo hỗ trợ đầy đủ 5 trạng thái giao diện: Trống (Empty Dropzone), Đang tải (Skeleton/Spinner), Lỗi (Bảng lỗi đỏ chi tiết), Cảnh báo vượt chỉ tiêu (Quota Alert), và Thành công (Toast + Reload).
5. Đảm bảo `oxlint` và TypeScript kiểm tra biên dịch (`tsc -b`) đạt 100% không có lỗi.

---

## 3. Danh Sách Tệp Tác Động (Impacted Files)

### 3.1. Constants & Types:
- `[MODIFY]` [src/constants/endpoints/program.endpoints.ts](file:///d:/codegym_final_project/InternHub-Frontend/src/constants/endpoints/program.endpoints.ts): Thêm `IMPORT_TEMPLATE`, `IMPORT_PREVIEW`, `IMPORT_EXCEL`.
- `[MODIFY]` [src/types/program.types.ts](file:///d:/codegym_final_project/InternHub-Frontend/src/types/program.types.ts): Thêm các interfaces: `ExcelRowError`, `ExcelInternRow`, `ExcelImportPreviewResponse`, `ExcelImportResultResponse`.

### 3.2. Service Layer:
- `[MODIFY]` [src/services/programService.ts](file:///d:/codegym_final_project/InternHub-Frontend/src/services/programService.ts): Bổ sung 3 hàm:
  - `downloadImportTemplate(signal?: AbortSignal): Promise<Blob>`
  - `previewImportExcel(programId: number, file: File, signal?: AbortSignal): Promise<ExcelImportPreviewResponse>`
  - `importInternsFromExcel(programId: number, file: File, status?: 'APPROVED' | 'PENDING', signal?: AbortSignal): Promise<ExcelImportResultResponse>`

### 3.3. Sub-Component Mới (Module-first & Clean State):
- `[NEW]` `src/pages/hr/programs/components/EnrollInternModal/tabs/ExcelImportTab.types.ts`: Định nghĩa props cho `ExcelImportTab`.
- `[NEW]` `src/pages/hr/programs/components/EnrollInternModal/tabs/ExcelImportTab.module.css`: CSS Modules sử dụng 100% CSS Variables semantic tokens.
- `[NEW]` `src/pages/hr/programs/components/EnrollInternModal/tabs/ExcelImportTab.tsx`: Component quản lý luồng kéo thả file, preview bảng lỗi/dữ liệu và xác nhận import.

### 3.4. Cập Nhật Container Modal:
- `[MODIFY]` [src/pages/hr/programs/components/EnrollInternModal/EnrollInternModal.tsx](file:///d:/codegym_final_project/InternHub-Frontend/src/pages/hr/programs/components/EnrollInternModal/EnrollInternModal.tsx):
  - Mở rộng state `activeTab`: `'pending' | 'create' | 'excel'`.
  - Thêm tab button *"Nhập từ File Excel"* với icon `<FileSpreadsheet size={15} />`.
  - Nhúng `<ExcelImportTab program={program} onSuccess={...} />`.

---

## 4. Kế Hoạch Triển Khai Chi Tiết (Implementation Steps)

### Bước 1: Khai Báo Endpoints & Cập Nhật Types
1. Trong `src/constants/endpoints/program.endpoints.ts`:
   - `IMPORT_TEMPLATE: '/api/programs/import-template'`
   - `IMPORT_PREVIEW: (id: string | number) => '/api/programs/' + id + '/import-interns/preview'`
   - `IMPORT_EXCEL: (id: string | number) => '/api/programs/' + id + '/import-interns'`
2. Trong `src/types/program.types.ts`: Khai báo 4 interfaces DTO khớp chính xác với cấu trúc JSON của Backend TM-100.

### Bước 2: Bổ Sung API Service Trong `programService.ts`
1. Viết hàm `downloadImportTemplate`: Gọi `GET` nhận `blob`, tự động tạo thẻ `<a>` ảo để kích hoạt trình duyệt download file `mau_nhap_thuc_tap_sinh.xlsx`.
2. Viết hàm `previewImportExcel`: Đóng gói `FormData`, gọi `POST` lên endpoint preview, trả về DTO preview.
3. Viết hàm `importInternsFromExcel`: Đóng gói `FormData` kèm tham số `status`, gọi `POST` import, trả về kết quả tiếp nhận.

### Bước 3: Xây Dựng Sub-Component `ExcelImportTab`
1. Tạo file types `ExcelImportTab.types.ts` (`program`, `onSuccess`).
2. Tạo file style `ExcelImportTab.module.css`:
   - Dropzone viền nét đứt `var(--border-default)`, tự động đổi viền sang `var(--primary)` và nền `var(--primary-light)` khi drag-over.
   - Badge thống kê tròn trịa, tương phản cao.
   - Bảng lỗi cuộn dọc cục bộ với thanh cuộn sleek scrollbar siêu mảnh, các dòng lỗi nổi bật với text màu `var(--danger)`.
   - Bảng preview tối đa 10 dòng gọn gàng, bo góc tinh tế.
3. Tạo file component `ExcelImportTab.tsx`:
   - State quản lý gọn gàng (<= 4 states): `selectedFile`, `previewData`, `isLoadingPreview`, `isSubmitting`, `targetStatus`.
   - Tự động gọi preview ngay khi người dùng chọn/thả file hợp lệ.
   - Nút xác nhận tự động khóa (`disabled`) nếu `isQuotaExceeded` hoặc `invalidRowsCount > 0`.
   - Hỗ trợ `AbortController` hủy request nếu unmount.

### Bước 4: Tích Hợp Vào `EnrollInternModal.tsx`
1. Thêm Tab thứ 3 trong navigation header:
   ```tsx
   <button
     type="button"
     className={clsx(styles.tabBtn, activeTab === 'excel' && styles.tabBtnActive)}
     onClick={() => setActiveTab('excel')}
   >
     <FileSpreadsheet size={15} />
     <span>Nhập từ File Excel</span>
   </button>
   ```
2. Render `ExcelImportTab` khi `activeTab === 'excel'`.

### Bước 5: Kiểm Tra Lint & TypeScript Build
Chạy kiểm tra tĩnh để bảo đảm không có lỗi cú pháp hoặc type mismatch:
```powershell
npm run lint
npm run build
```

---

## 5. Tiêu Chuẩn Nghiệm Thu & Kiểm Chứng (Verification Criteria)

1. **Giao diện & Trải nghiệm:**
   - Tab "Nhập từ File Excel" hiển thị đẹp mắt, tương thích cả Dark Mode và Light Mode.
   - Tải file template mẫu `.xlsx` mượt mà chỉ với 1 click.
   - Kéo thả file hiển thị preview tức thì kèm số dòng hợp lệ và số slot còn lại.
   - Hiển thị danh sách lỗi rõ ràng khi file có lỗi format, và khóa nút submit.
   - Nạp file chuẩn thành công: Toast báo thành công, đóng modal và làm mới bảng dữ liệu.
2. **Kỹ thuật & Clean Code:**
   - `npm run lint` chạy 0 lỗi.
   - `npm run build` (`tsc -b && vite build`) biên dịch thành công 100%.
   - Không có file nào vượt quá 300 dòng code.
