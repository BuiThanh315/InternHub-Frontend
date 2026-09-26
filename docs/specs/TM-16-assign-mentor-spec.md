# Specification: Phân Công & Quản Lý Người Hướng Dẫn Thực Tập Sinh (TM-16) - Frontend

> **Tài liệu Đặc Tả Giao Diện & Tương Tác Frontend (UI/UX Specification)**  
> **Dự án:** [InternHub-Frontend](file:///c:/Users/Luong%20Anh%20Huy/InternHub-Workspace/InternHub-Frontend) (React + Vite + TypeScript)  
> **Mã Jira Ticket:** [TM-16](https://robluccibn9935.atlassian.net/browse/TM-16)  
> **Tiêu đề Jira:** *Phân công thực tập sinh cho mentor*  
> **Nhánh Git:** `feature/TM-16/assign-mentor-to-intern`  
> **Tuân thủ quy chuẩn:** Tuân thủ 100% tài liệu [`.agents/`](file:///c:/Users/Luong%20Anh%20Huy/InternHub-Workspace/InternHub-Frontend/.agents/).

---

## 1. UI Components Cần Xây Dựng & Cập Nhật

1. **`AssignMentorModal.tsx` (`src/pages/hr/components/AssignMentorModal.tsx`)**:
   - Modal phân công / đổi người hướng dẫn.
   - Tiêu đề động:
     - Chưa có Mentor: *"Phân Công Người Hướng Dẫn (Mentor)"*.
     - Đã có Mentor: *"Thay Đổi Người Hướng Dẫn (Mentor)"* (hiển thị thẻ Mentor hiện tại).
   - Kiểm tra ràng buộc tiên quyết: Nếu `needsProgramReassignment === true`, hiển thị cảnh báo đỏ tĩnh và disable form: *"TTS đang chờ xếp lại chương trình thực tập. Cần hoàn tất chuyển chương trình trước khi gán Mentor"*.
   - Select box chọn Mentor: hiển thị Họ tên, Email, Phòng ban chuẩn hóa (`departmentName`), số lượng TTS đang hướng dẫn.
   - Dynamic Alerts:
     - Cảnh báo vàng nếu Mentor đang có `>= 5 TTS` (vượt định mức khuyến nghị).
     - Thông báo nhắc nhở nếu `mentor.departmentId !== intern.program?.departmentId`.
   - Textarea lý do thay đổi (`replaceReason`): Chỉ hiển thị và bắt buộc nhập khi `intern.mentorId != null`.
   - Textarea ghi chú phân công (`notes`).
   - Nút hành động: `Hủy`, `Xác nhận phân công` / `Lưu thay đổi` (kèm trạng thái loading).

2. **`RevokeMentorModal.tsx` (`src/pages/hr/components/RevokeMentorModal.tsx`)**:
   - Modal xác nhận thu hồi (gỡ trắng) Mentor phụ trách khi chưa có người thay thế.
   - Nhập lý do thu hồi bắt buộc (`reason`).
   - Cảnh báo: *"Sau khi thu hồi, hồ sơ sẽ được gắn cờ cần phân công lại người hướng dẫn"*.

3. **Cập nhật `HrInternTable.tsx`**:
   - Thêm cột "Mentor phụ trách" vào bảng:
     - Đã có: Tên + avatar/icon mentor.
     - Cờ `needsMentorReassignment === true`: Badge đỏ tĩnh (không nhấp nháy, dot + label) **"Cần đổi Mentor"**.
     - Chưa có mà program đã ONGOING: Badge cam tĩnh **"Chưa có Mentor"**.
   - Menu hành động trên từng dòng: `Phân công Mentor`, `Đổi Mentor`, `Thu hồi Mentor`.

4. **Cập nhật `DetailInternModal.tsx`**:
   - Khối thông tin Mentor hiện tại kèm nút `Đổi Mentor` và `Gỡ Mentor`.
   - Bổ sung timeline/tab hiển thị lịch sử phân công Mentor (`GET /api/interns/{id}/mentor-history`).

5. **Service & Types (`src/types/intern.types.ts`, `src/services/internService.ts`)**:
   - Interface `MentorOption` (`id`, `fullName`, `email`, `phone`, `departmentId`, `departmentName`, `departmentCode`, `activeInternCount`).
   - Interface `MentorAssignmentResponse`.
   - API methods: `getAvailableMentors()`, `assignMentor(internId, data)`, `revokeMentor(internId, data)`, `getMentorHistory(internId)`.
