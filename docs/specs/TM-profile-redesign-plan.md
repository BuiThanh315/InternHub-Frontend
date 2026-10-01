# Kế Hoạch Triển Khai: Universal Profile Center (Hồ Sơ Cá Nhân Đa Phân Quyền)

> **Mã công việc:** PROFILE-REDESIGN  
> **Tài liệu đặc tả:** [docs/specs/TM-profile-redesign-spec.md](file:///c:/Users/Luong%20Anh%20Huy/InternHub-Workspace/InternHub-Frontend/docs/specs/TM-profile-redesign-spec.md)  
> **Đường dẫn:** `ROUTES.PROFILE` = `/profile`  
> **Mục tiêu:** Xây dựng cổng hồ sơ cá nhân hiện đại, module hóa cao, bảo mật chặt chẽ (Zero-Trust, Anti-IDOR, Modal-First UX) cho cả 4 vai trò: INTERN, HR, MENTOR, ADMIN.

---

## 1. Mục Đích & Phạm Vi Thay Đổi (Scope of Work)

1. **Hạ tầng Constants & Services (Trụ cột IV)**:
   - Bổ sung route `PROFILE: '/profile'` trong `src/constants/routes/`.
   - Bổ sung các API Endpoints trong `src/constants/endpoints/user.endpoints.ts` và `auth.endpoints.ts`.
   - Tạo service chuyên biệt `profileService.ts` tuân thủ Axios 4 tầng, tích hợp AbortSignal.
2. **Quản lý Định danh & Avatar Chuẩn Doanh Nghiệp (Identity & S3 Storage)**:
   - Tạo `ProfileHeader` với Fallback Avatar DiceBear collection `notionists` seed-based 100%.
   - Tạo `AvatarUploadModal` (Zoom/Pan slider, Magic bytes validation, Direct S3 PUT, Cache-Busting, Cleanup file cũ).
   - Tích hợp `updateUserAvatar` vào `AuthContext` để Header và Sidebar đồng bộ ngay lập tức.
3. **Quản lý Thông Tin Cá Nhân (Tab 1 - Dùng chung 4 Role)**:
   - Dựng `PersonalInfoTab` (Read-only view).
   - Dựng `EditProfileModal` (React Hook Form + Zod, Sticky Footer, gender optional, email khóa chết).
4. **Các Phân Hệ Nghiệp Vụ Phân Quyền (Tab 2)**:
   - Dựng `InternAcademicTab` & `EditAcademicModal` (Regex niên khóa, Tag kỹ năng, Safe URL scheme chống XSS).
   - Dựng `InternshipDetailTab` (Read-only 100%, tái sử dụng `InternProfileCard`).
   - Dựng `StaffProfessionalTab` (Read-only 100%, hiển thị department và position từ User DTO cho HR/Mentor/Admin).
5. **Bảo Mật Tài Khoản (Tab 3 - Dùng chung 4 Role)**:
   - Dựng `AccountSecurityTab` (Bắt buộc `currentPassword`, `newPassword` đo realtime với `PasswordStrengthMeter` 4 tiêu chí Backend Regex).
6. **Điều Phối Routing & Sidebar**:
   - Cập nhật `AppRoutes.tsx`: Khai báo route `/profile` trong `MainLayout` cho mọi tài khoản đã đăng nhập. Tự động điều hướng `/intern/profile` -> `/profile`.
   - Cập nhật User Card và Nav Links ở `Sidebar.tsx` và `Header.tsx` trỏ về `/profile`.

---

## 2. Kế Hoạch 6 Giai Đoạn Triển Khai Tuần Tự (Implementation Phases)

### 🚀 Giai Đoạn 1: Hạ Tầng Types, Constants & ProfileService
- [x] **T-1.1**: Tạo file `src/types/profile.types.ts` định nghĩa toàn bộ Zod Schemas (`PersonalInfoSchema`, `InternAcademicSchema`, `ChangePasswordSchema`, `SafeUrlSchema`) và Props Interfaces.
- [x] **T-1.2**: Bổ sung endpoint trong `src/constants/endpoints/user.endpoints.ts`:
  - `PROFILE_ME`: `/api/users/me`
  - `AVATAR_UPLOAD_URL`: `/api/users/me/avatar/upload-url`
  - `AVATAR_UPDATE`: `/api/users/me/avatar`
  - `CHANGE_PASSWORD`: `/api/auth/change-password`
- [x] **T-1.3**: Bổ sung route `PROFILE: '/profile'` trong `src/constants/routes/` và re-export tại `index.ts`.
- [x] **T-1.4**: Tạo service `src/services/profileService.ts` tuân thủ Axios 4 tầng, xử lý gọi API cập nhật hồ sơ, đổi mật khẩu và upload avatar S3 có kiểm tra Magic Bytes.

---

### 🚀 Giai Đoạn 2: Custom Hook & Khung Sườn Trang Profile
- [x] **T-2.1**: Tạo hook `src/pages/profile/hooks/useProfileData.ts` nạp song song `userService.getUserById` và `internService.getMyProfile` (cho TTS) với AbortController.
- [x] **T-2.2**: Xây dựng controller component `src/pages/profile/ProfilePage.tsx` và `ProfilePage.module.css`:
  - Hiển thị Skeleton Shimmer khi đang nạp (Quy tắc 32).
  - Thanh Tabs thích ứng linh hoạt theo role.
- [x] **T-2.3**: Đăng ký route `/profile` tại `src/routes/AppRoutes.tsx`, đặt alias redirect từ `/intern/profile` sang `/profile`.
- [x] **T-2.4**: Cập nhật click Avatar/Tên tại `src/components/layout/Sidebar.tsx` và Header dẫn về `/profile`.

---

### 🚀 Giai Đoạn 3: Phân Hệ Avatar Hoàn Chỉnh (Identity & S3)
- [x] **T-3.1**: Xây dựng helper `getAvatarUrl` dùng DiceBear collection `notionists` seed-based tại `src/utils/avatar.ts`.
- [x] **T-3.2**: Xây dựng `src/pages/profile/components/ProfileHeader/`:
  - Khung Avatar tròn 96x96px, hover hiện nút *Đổi ảnh*.
  - Tags định danh theo Role, Email, Username, Trạng thái.
- [x] **T-3.3**: Xây dựng `src/pages/profile/components/AvatarUploadModal/`:
  - Khung tròn preview, thanh trượt zoom/pan.
  - Client-side Magic Bytes validation.
  - Tải binary lên S3 qua Presigned URL, gọi PATCH xác nhận kèm Cache-Busting `?v={ts}`.
- [x] **T-3.4**: Bổ sung hàm cập nhật avatar vào `AuthContext` để Sidebar và Header cập nhật ảnh tức thì.

---

### 🚀 Giai Đoạn 4: Quản Lý Thông Tin Cá Nhân (Tab 1 - Dùng Chung)
- [x] **T-4.1**: Xây dựng `src/pages/profile/components/PersonalInfoTab/` hiển thị thông tin dạng read-only card trang nhã kèm nút *Chỉnh sửa thông tin*.
- [x] **T-4.2**: Xây dựng `src/pages/profile/components/EditProfileModal/`:
  - Áp dụng `react-hook-form` + `zod` (`PersonalInfoSchema`).
  - Trường Email khóa chết (Disabled/Read-only).
  - Sticky Footer có nút Hủy và Lưu (kèm loader). Giữ nguyên modal khi lỗi.

---

### 🚀 Giai Đoạn 5: Các Phân Hệ Nghiệp Vụ Phân Quyền (Tab 2)
- [x] **T-5.1**: Dựng `src/pages/profile/components/InternAcademicTab/` và `EditAcademicModal/` (Dành cho TTS):
  - Nhập trường, chuyên ngành, niên khóa (Regex `YYYY - YYYY`), GPA, Skill tags, LinkedIn, GitHub (`SafeUrlScheme`).
- [x] **T-5.2**: Dựng `src/pages/profile/components/InternshipDetailTab/` (Dành cho TTS):
  - Tái sử dụng component `InternProfileCard` ở chế độ Read-only 100%.
- [x] **T-5.3**: Dựng `src/pages/profile/components/StaffProfessionalTab/` (Dành cho HR, Mentor, Admin):
  - Read-only 100%, hiển thị department và position từ dữ liệu User.

---

### 🚀 Giai Đoạn 6: Phân Hệ Bảo Mật Tài Khoản & Kiểm Thử Toàn Diện
- [x] **T-6.1**: Dựng `src/pages/profile/components/AccountSecurityTab/`:
  - Form 3 trường: `currentPassword`, `newPassword`, `confirmPassword`.
  - Tích hợp realtime `PasswordStrengthMeter` hiện có (4 tiêu chí Regex).
  - Nút submit chỉ bật khi mật khẩu mạnh và trùng khớp. Xử lý lỗi sai mật khẩu cũ giữ nguyên form.
- [x] **T-6.2**: Chạy kiểm tra TypeScript (`npx tsc --noEmit`) và Linting không lỗi.
- [x] **T-6.3**: Kiểm thử nghiệm thu giao diện trên cả 4 vai trò và viết báo cáo nghiệm thu `walkthrough-profile-redesign.md`.

---

## 3. Checklist Kiểm Thử Nghiệm Thu (Acceptance Criteria)

| STT | Kịch bản kiểm thử | Kết quả kỳ vọng | Trạng thái |
| :---: | :--- | :--- | :---: |
| **AC-01** | Truy cập `/profile` với 4 Role khác nhau | Giao diện hiển thị đúng các Tab tương ứng với Role; không văng lỗi Runtime. | ✅ Đạt |
| **AC-02** | Redirect tương thích ngược | Truy cập `/intern/profile` tự động chuyển mượt sang `/profile`. | ✅ Đạt |
| **AC-03** | Fallback Avatar | Người dùng chưa có avatar hiển thị đúng hình hoạt hình DiceBear `notionists` seed theo ID, đồng nhất với Sidebar và Table. | ✅ Đạt |
| **AC-04** | Đổi Avatar S3 | Chọn ảnh hợp lệ -> Preview tròn -> Upload S3 -> Header và Sidebar đổi ảnh ngay lập tức. | ✅ Đạt |
| **AC-05** | Chống sửa Email | Ô Email ở Tab và trong Modal đều ở trạng thái Read-only/Disabled, không thể chỉnh sửa. | ✅ Đạt |
| **AC-06** | Validation Niên khóa & Skills | Niên khóa không đúng định dạng YYYY - YYYY báo lỗi đỏ; Skills rỗng vẫn cho phép lưu. | ✅ Đạt |
| **AC-07** | Chống XSS Link ngoài | Nhập `javascript:alert(1)` vào link LinkedIn/GitHub bị Zod chặn báo lỗi ngay. | ✅ Đạt |
| **AC-08** | Read-only Tab Thực tập & Mentor | TTS xem đầy đủ thông tin kỳ thực tập và Mentor, không có bất kỳ nút hay form sửa nào. | ✅ Đạt |
| **AC-09** | Đổi Mật khẩu An toàn | Nhập sai mật khẩu cũ báo lỗi đỏ dưới ô `currentPassword`, giữ nguyên mật khẩu mới; Nhập đúng đổi thành công. | ✅ Đạt |
