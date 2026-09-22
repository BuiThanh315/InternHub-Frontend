# Tasks Checklist: Triển Khai Frontend TM-1 đến TM-5

> **Trạng thái:** Sẵn sàng thực thi (Ready for Execution)  
> **Nhánh Git:** `feature/TM-1-to-TM-5/intern-management-core`  
> **Tài liệu đặc tả liên kết:** [TM-1-to-TM-5-intern-management-spec.md](file:///c:/Users/Luong%20Anh%20Huy/InternHub-Workspace/InternHub-Frontend/docs/specs/TM-1-to-TM-5-intern-management-spec.md)  
> **Kế hoạch kỹ thuật liên kết:** [TM-1-to-TM-5-plan.md](file:///c:/Users/Luong%20Anh%20Huy/InternHub-Workspace/InternHub-Frontend/docs/specs/TM-1-to-TM-5-plan.md)

---

## 1. Chuẩn Hóa Types, DTO & State Machine Schema
- [x] **Task 1.1:** Cập nhật `src/types/index.ts`:
  - Thêm `UpdateInternRequest` interface.
  - Chuẩn hóa các type liên quan đến Document và InternStatus.
- [x] **Task 1.2:** Cập nhật `src/features/interns/schema.ts`:
  - Thêm `updateInternFormSchema` (React Hook Form + Zod).
  - Thêm hàm helper `getAllowedNextStatuses(currentStatus)` tuân thủ đúng State Machine của TM-2.

## 2. Nâng Cấp Tầng Dịch Vụ API (Services & TanStack Query Hooks)
- [x] **Task 2.1:** Hoàn thiện `src/services/internService.ts`:
  - Tích hợp `updateIntern(id, request)` gọi `PUT /api/employees/interns/{id}`.
  - Đảm bảo cơ chế Dual-Mode (ưu tiên API thật, tự động fallback local mock khi offline).
- [x] **Task 2.2:** Hoàn thiện `src/services/documentService.ts`:
  - Tích hợp `uploadDocument` (Multipart/form-data) gửi lên `/api/employees/interns/{internCode}/documents`.
  - Tích hợp `downloadDocument(id, fileName)` tải tệp tin nhị phân.
  - Tích hợp `reviewDocument(id, request)` gọi `PATCH /api/employees/interns/documents/{id}/review`.
- [x] **Task 2.3:** Bổ sung Mutation Hooks trong `src/features/interns/hooks/useInterns.ts`:
  - Tạo hook `useUpdateIntern()`.
  - Tạo hook `useUploadDocument()`.

## 3. Xây Dựng & Tích Hợp Component Giao Diện
- [x] **Task 3.1 (TM-2):** Xây dựng `src/features/interns/components/InternEditDialog.tsx`:
  - Form dialog chỉnh sửa thông tin thực tập sinh.
  - Áp dụng `getAllowedNextStatuses()` vào dropdown trạng thái.
- [x] **Task 3.2 (TM-4):** Nâng cấp giao diện nộp CV của Thực tập sinh tại `src/pages/intern/InternDashboard.tsx`:
  - Kéo thả file, kiểm tra định dạng PDF/Word, dung lượng < 5MB.
  - Hiển thị danh sách tài liệu cá nhân kèm badge trạng thái duyệt và lý do từ chối nếu có.
- [x] **Task 3.3 (TM-1, TM-3, TM-5):** Hoàn thiện tích hợp tại `src/pages/hr/HrDashboard.tsx`:
  - Menu `⋮` và nút sửa trên từng dòng: Mở `InternEditDialog`.
  - Widget "Việc Cần Xử Lý": Bấm tải/xem tài liệu, phê duyệt, từ chối (bắt buộc nhập lý do qua `ConfirmReasonDialog`).
  - Thanh tìm kiếm và Quick Filter kết nối chuẩn API.

## 4. Kiểm Thử & Xác Thực Toàn Diện
- [x] **Task 4.1:** Chạy `npm.cmd run build` kiểm tra biên dịch TypeScript và đóng gói bundle (Thành công 100%).
- [x] **Task 4.2:** Chạy `tsc --noEmit` kiểm tra type safety nghiêm ngặt (0 lỗi).
- [x] **Task 4.3:** Xác thực luồng chạy thực tế trên trình duyệt (`http://localhost:5173`) với cả 2 role HR và Intern (Đã chụp ảnh kiểm chứng).
- [x] **Task 4.4:** Tạo commit chuẩn Conventional Commits: `feat(TM-1-to-TM-5): tich hop module quan ly thuc tap sinh core va hoan thien UI theo spec`.
