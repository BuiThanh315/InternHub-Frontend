# Đặc Tả Kỹ Thuật: Trung Tâm Hồ Sơ Cá Nhân Đa Phân Quyền (Universal Profile Center)

> **Mã công việc:** PROFILE-REDESIGN  
> **Phiên bản:** 1.2-FINAL-SPEC  
> **Trạng thái:** Đã chuẩn hóa & Khóa thiết kế (Brainstorming Complete)  
> **Đường dẫn:** [ROUTES.PROFILE] = '/profile'  
> **Đối tượng sử dụng:** Toàn bộ 4 vai trò (INTERN, HR, MENTOR, ADMIN)  

---

## 1. Mục Tiêu & Nguyên Tắc Cốt Lõi

1. **Một Cổng Hồ Sơ Duy Nhất (Single Universal Portal):** Thay thế trang xem tĩnh cũ bằng trung tâm quản lý hồ sơ tại /profile cho cả 4 role. Route cũ /intern/profile tự động redirect về /profile.
2. **Quyền Hạn Rõ Ràng & Chống IDOR (Ownership, Least Privilege & IDOR Protection):** 
   - Thông tin cá nhân cơ bản (Họ tên, SĐT, Ngày sinh, Giới tính, Địa chỉ, Bio) và Đổi mật khẩu: Người dùng tự quản lý qua Modal.
   - Endpoint cập nhật thông tin: **Ưu tiên PUT /api/users/me** (tự động lấy userId từ JWT principal) thay vì PUT /api/users/{id} để triệt tiêu hoàn toàn nguy cơ IDOR. Nếu dùng path {id}, Backend bắt buộc xác thực currentUserId === id (trừ khi có quyền ROLE_ADMIN).
   - Email: **Khóa chết (Read-only 100%)** để bảo toàn JWT claim và identity link giữa các Microservices.
   - Thông tin Thực tập & Mentor (TTS): **Read-only 100%**, tái sử dụng trực tiếp component InternProfileCard có sẵn (nguyên tắc Reuse-First).
   - Thông tin Công tác & Phòng ban (Staff Tab 2C): **Read-only 100%**, lấy trực tiếp từ các trường department và position trên entity User (identity-service).
3. **Avatar Chuẩn Kiến Trúc S3 & Bảo Mật 3 Lớp (Identity Service & Secure Storage):**
   - Thuộc identity-service, không dính dáng intern-service.
   - **Chống IDOR Namespace Avatar**: vatarKey bắt buộc sinh theo prefix định danh: vatars/{userId}/{uuid}.webp. Khi gọi PATCH /api/users/me/avatar, Backend bắt buộc verify prefix vatarKey.startsWith(avatars/ + currentUserId + /).
   - **Bảo Vệ Dung Lượng 2 Lớp**: Client validate < 5MB. Khi xác nhận PATCH, Backend thực hiện lệnh HEAD Object tới S3 kiểm tra Content-Length <= 5MB thật; nếu vi phạm lập tức xóa file trên S3 và trả mã lỗi 400 Bad Request.
   - Access pattern dài hạn (Long-lived/Public Read URL có CDN/Cache) kết hợp **Cache-Busting query param (?v={timestamp})**.
   - Validate Magic Bytes thật phía client/server trước khi lưu trữ.
   - Cơ chế dọn dẹp (Storage Cleanup): Tự động xóa file ảnh cũ trên Object Storage khi cập nhật ảnh mới.
   - **Fallback Avatar:** Thống nhất 100% dùng DiceBear SVG **collection 
otionists** seed-based (https://api.dicebear.com/7.x/notionists/svg?seed={userId}&backgroundColor=eef0ff) theo mục 1.4 Design Spec. Tuyệt đối không dùng chữ cái hay collection initials.
4. **Đổi Mật Khẩu An Toàn (Zero-Trust Password Flow):**
   - Bắt buộc nhập currentPassword để chống hijack session mở sẵn.
   - PasswordStrengthMeter tái sử dụng đúng component hiện có, đo realtime đúng 4 tiêu chí Regex của Backend Spring Boot (Single Source of Truth), không dùng thư viện entropy rời rạc.
5. **Mô Hình Tương Tác Đồng Nhất (Modal-First UX):**
   - Loại bỏ hoàn toàn Inline Edit rải rác. Mọi chỉnh sửa đều qua Modal Form độc lập (EditProfileModal, EditAcademicModal, AvatarUploadModal).

---

## 2. Cấu Trúc Thư Mục Chuẩn Domain-Driven Modular

`	ext
src/
├── constants/
│   ├── routes/common.routes.ts          # PROFILE: '/profile'
│   └── endpoints/user.endpoints.ts      # UPDATE_PROFILE, CHANGE_PASSWORD, AVATAR_URL
├── types/
│   └── profile.types.ts                 # Schemas Zod & Props Interfaces
├── services/
│   └── profileService.ts                # Service 4 tầng Axios quản lý Profile, Avatar & Password
├── pages/
│   └── profile/
│       ├── ProfilePage.tsx              # Component điều phối (~150 dòng)
│       ├── ProfilePage.module.css       # Stylesheet tổng thể
│       ├── hooks/
│       │   └── useProfileData.ts        # Hook nạp song song User & InternProfile (AbortController)
│       └── components/
│           ├── ProfileHeader/           # Banner định danh + Avatar tròn Dicebear notionists/Custom
│           │   ├── ProfileHeader.tsx
│           │   ├── ProfileHeader.types.ts
│           │   └── ProfileHeader.module.css
│           ├── AvatarUploadModal/       # Modal căn chỉnh tròn & Upload S3
│           │   ├── AvatarUploadModal.tsx
│           │   ├── AvatarUploadModal.types.ts
│           │   └── AvatarUploadModal.module.css
│           ├── EditProfileModal/        # Modal sửa thông tin cá nhân chung
│           │   ├── EditProfileModal.tsx
│           │   ├── EditProfileModal.types.ts
│           │   └── EditProfileModal.module.css
│           ├── EditAcademicModal/       # Modal sửa học vấn & kỹ năng (TTS)
│           │   ├── EditAcademicModal.tsx
│           │   ├── EditAcademicModal.types.ts
│           │   └── EditAcademicModal.module.css
│           ├── PersonalInfoTab/         # Tab 1: Hiển thị thông tin cá nhân tĩnh + Nút mở Modal
│           │   ├── PersonalInfoTab.tsx
│           │   ├── PersonalInfoTab.types.ts
│           │   └── PersonalInfoTab.module.css
│           ├── InternAcademicTab/       # Tab 2A: Hiển thị học vấn & skills (Chỉ TTS)
│           │   ├── InternAcademicTab.tsx
│           │   ├── InternAcademicTab.types.ts
│           │   └── InternAcademicTab.module.css
│           ├── InternshipDetailTab/     # Tab 2B: Tái sử dụng InternProfileCard (Read-only 100%)
│           │   ├── InternshipDetailTab.tsx
│           │   └── InternshipDetailTab.types.ts
│           ├── StaffProfessionalTab/    # Tab 2C: Chức vụ, Phòng ban công tác (Read-only 100% via User)
│           │   ├── StaffProfessionalTab.tsx
│           │   └── StaffProfessionalTab.types.ts
│           └── AccountSecurityTab/      # Tab 3: Đổi mật khẩu 3 trường + PasswordStrengthMeter
│               ├── AccountSecurityTab.tsx
│               ├── AccountSecurityTab.types.ts
│               └── AccountSecurityTab.module.css
`

---

## 3. Zod Schemas & Validation Contracts

`	ypescript
import { z } from 'zod';

// 1. Niên khóa: YYYY - YYYY, năm sau > năm trước, cách nhau <= 8 năm
export const AcademicYearSchema = z
  .string()
  .regex(/^\d{4}\s*-\s*\d{4}$/, 'Định dạng niên khóa: YYYY - YYYY (Ví dụ: 2022 - 2026)')
  .refine(
    (val) => {
      const parts = val.split('-').map((s) => parseInt(s.trim(), 10));
      if (parts.length !== 2 || isNaN(parts[0]) || isNaN(parts[1])) return false;
      const [start, end] = parts;
      return end > start && end - start >= 1 && end - start <= 8;
    },
    {
      message: 'Năm kết thúc phải sau năm bắt đầu và khoảng cách niên khóa tối đa 8 năm',
    }
  );

// 2. Chặn Scheme XSS (javascript:) cho External URLs
const SafeUrlSchema = z
  .string()
  .trim()
  .url('Đường dẫn URL không hợp lệ')
  .refine((val) => !val || /^https?:\/\//i.test(val), 'Chỉ chấp nhận liên kết bảo mật bắt đầu bằng http:// hoặc https://')
  .optional()
  .or(z.literal(''));

// 3. Form Thông tin cá nhân cơ bản (Dùng chung 4 role)
export const PersonalInfoSchema = z.object({
  fullName: z.string().trim().min(2, 'Họ và tên tối thiểu 2 ký tự').max(100, 'Tối đa 100 ký tự'),
  email: z.string().email(), // Read-only khóa chết trên UI
  phoneNumber: z
    .string()
    .trim()
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại không đúng định dạng VN')
    .optional()
    .or(z.literal('')),
  dateOfBirth: z.string().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(), // Optional, thông tin nhạy cảm không ép buộc
  address: z.string().trim().max(255, 'Địa chỉ tối đa 255 ký tự').optional().or(z.literal('')),
  bio: z.string().trim().max(500, 'Giới thiệu tối đa 500 ký tự').optional().or(z.literal('')),
});

// 4. Form Học vấn & Kỹ năng (Chỉ TTS)
export const InternAcademicSchema = z.object({
  university: z.string().trim().min(2, 'Vui lòng nhập tên trường ĐH/CĐ').max(150, 'Tối đa 150 ký tự'),
  major: z.string().trim().min(2, 'Vui lòng nhập chuyên ngành đào tạo').max(100, 'Tối đa 100 ký tự'),
  academicYear: AcademicYearSchema,
  gpa: z
    .number()
    .min(0, 'GPA tối thiểu là 0.0')
    .max(4.0, 'GPA hệ 4 tối đa là 4.0')
    .optional()
    .nullable(),
  skills: z.array(z.string().trim()).optional().default([]), // Optional, không ép buộc TTS mới
  linkedinUrl: SafeUrlSchema,
  githubUrl: SafeUrlSchema,
});

// 5. Form Đổi Mật Khẩu (Bắt buộc currentPassword + 4 tiêu chí Regex)
export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z.string().regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
      'Mật khẩu phải chứa ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
    ),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận lại mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không trùng khớp',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'Mật khẩu mới không được trùng với mật khẩu hiện tại',
    path: ['newPassword'],
  });

export type PersonalInfoFormData = z.infer<typeof PersonalInfoSchema>;
export type InternAcademicFormData = z.infer<typeof InternAcademicSchema>;
export type ChangePasswordFormData = z.infer<typeof ChangePasswordSchema>;
`

---

## 4. Chi Tiết API Contracts (4 Tầng Axios & Chống IDOR)

| Nghiệp vụ | Method & Endpoint | Payload Request | Response Kỳ Vọng (ApiResponse<T>) | Ghi chú bảo mật |
| :--- | :--- | :--- | :--- | :--- |
| **Lấy Profile Tài Khoản** | GET /api/users/me *(hoặc GET /api/users/{id})* | *(None)* | { success: true, data: User } | Lấy theo JWT principal, trả về cả department, position cho Staff |
| **Lấy Profile TTS** *(INTERN)* | GET /api/interns/my-profile | *(None)* | { success: true, data: InternProfile } | Lấy theo JWT principal của TTS |
| **Cập Nhật Thông Tin Cá Nhân** | PUT /api/users/me *(hoặc PUT /api/users/{id})* | { fullName, phone, address, gender, dateOfBirth, bio } | { success: true, data: User, message: Cập nhật thành công } | **Chống IDOR**: Backend ép buộc currentUserId === id (trừ ROLE_ADMIN). KHÔNG cho sửa email. |
| **Cập Nhật Học Vấn TTS** | PUT /api/interns/my-profile/academic | { university, major, academicYear, gpa, skills, linkedinUrl, githubUrl } | { success: true, data: InternProfile } | Thuộc thẩm quyền TTS cập nhật thông tin học vấn |
| **Xin Presigned URL Avatar** | POST /api/users/me/avatar/upload-url | { fileName, contentType, fileSize } | { success: true, data: { presignedUrl, avatarKey, publicUrl } } | Server sinh key: vatars/{currentUserId}/{uuid}.webp |
| **Xác Nhận Đổi Avatar** | PATCH /api/users/me/avatar | { avatarKey } | { success: true, data: { avatarUrl }, message: Đã đổi ảnh đại diện } | **Bảo mật kép**: Verify prefix vatars/{currentUserId}/ + HEAD S3 Object <= 5MB |
| **Đổi Mật Khẩu** | POST /api/auth/change-password | { currentPassword, newPassword, confirmPassword } | { success: true, message: Mật khẩu đã được cập nhật an toàn } | Lấy userId từ JWT context, verify currentPassword qua PasswordEncoder |

---

## 5. Chiến Lược Xử Lý Lỗi & Phản Hồi Mutation UX

1. **Lỗi 400 Bad Request (Validation / Business Violation)**:
   - **Đổi mật khẩu sai currentPassword**: Không đóng modal/tab, giữ nguyên 
ewPassword và confirmPassword, hiển thị viền đỏ và text lỗi trực tiếp dưới ô currentPassword: *Mật khẩu hiện tại không chính xác*.
   - **Lỗi ieldErrors từ Backend**: Ánh xạ tự động vào React Hook Form qua setError(field, { message }), bôi đỏ ô lỗi kèm thông báo theo chuẩn WCAG AA (Quy tắc 30).
2. **Lỗi 401 Unauthorized / Hết Hạn Token**:
   - piClient tự động kích hoạt luồng Silent Refresh Token. Nếu thất bại, xóa session sạch sẽ và chuyển hướng về trang chủ/đăng nhập.
3. **Lỗi 403 Forbidden**:
   - Hiển thị Toast cảnh báo: *Bạn không có quyền thực hiện thao tác này*.
4. **Lỗi Upload Avatar S3**:
   - Nếu kết nối mạng gián đoạn khi PUT binary lên S3: Báo lỗi *Không thể tải ảnh lên máy chủ lưu trữ, vui lòng thử lại*, giữ nguyên ảnh đã chọn trong Modal để người dùng bấm thử lại mà không phải chọn file từ đầu.
5. **Thao tác Thành công (Success Mutation)**:
   - Hiện Toast xanh thông báo thành công.
   - Đóng Modal tương ứng.
   - Tự động gọi efetch() làm mới dữ liệu trên Tab.
   - Đồng bộ ngay lập tức vào AuthContext (với Avatar và Họ tên) để Header và Sidebar đổi ảnh/tên tức thì.

---

## 6. Phân Luồng Dữ Liệu & Vòng Đời Lưu Trữ (Data Flows)

### 6.1 Luồng Tải Dữ Liệu Đa Role
1. Người dùng vào /profile.
2. useProfileData kích hoạt song song qua Promise.allSettled:
   - userService.getUserById(userId): Lấy thông tin tài khoản cơ bản (bao gồm cả department, position).
   - Nếu ole === 'INTERN' hoặc 'USER': Gọi internService.getMyProfile() lấy dữ liệu học vấn và kỳ thực tập.
3. Skeleton Shimmer hiển thị trong lúc chờ tải dữ liệu (chống CLS).

### 6.2 Luồng Upload Avatar, Xác Thực Kép & Dọn Dẹp File Cũ
1. Mở AvatarUploadModal ➔ Chọn file (.jpg, .png, .webp, < 5MB).
2. Client kiểm tra Magic Bytes (JPEG: FF D8 FF, PNG: 89 50 4E 47, WEBP: 52 49 46 46).
3. Xem trước khung tròn (Zoom & Pan).
4. Bấm *Lưu ảnh*:
   - Xin Presigned URL: POST /api/users/me/avatar/upload-url ➔ Server sinh vatars/{userId}/{uuid}.webp.
   - Upload trực tiếp binary lên S3 Bucket công khai bằng HTTP PUT.
   - Xác nhận: PATCH /api/users/me/avatar kèm { avatarKey }.
   - Backend xác thực:
     1. vatarKey phải có tiền tố vatars/{currentUserId}/ (Chống IDOR).
     2. Gọi S3 HEAD Object xác thực dung lượng thực tế <= 5MB (Chống bypass client limit).
   - Backend xóa file ảnh avatar cũ trên S3 và lưu URL dài hạn mới vào Database kèm Cache-Busting: https://storage.internhub.io/avatars/{userId}/{uuid}.webp?v={timestamp}.
   - Cập nhật tức thì vào AuthContext ➔ Header và Sidebar tự render avatar mới không cần F5.

### 6.3 Luồng Đổi Mật Khẩu
1. Người dùng nhập currentPassword, 
ewPassword (realtime check với PasswordStrengthMeter), confirmPassword.
2. Nút submit chỉ active khi cả 4 tiêu chí đạt VÀ xác nhận khớp.
3. Gửi POST /api/auth/change-password:
   - Lỗi sai mật khẩu cũ: Giữ nguyên form, hiển thị lỗi đỏ tại trường currentPassword.
   - Thành công: Toast báo thành công, reset form sạch sẽ.

---

## 7. Kế Hoạch Triển Khai Tuần Tự (6 Giai Đoạn)

`mermaid
graph TD
    A[Giai đoạn 1: Hạ Tầng Endpoints, Types & ProfileService] --> B[Giai đoạn 2: Hook useProfileData & Setup Route /profile]
    B --> C[Giai đoạn 3: ProfileHeader & AvatarUploadModal S3]
    C --> D[Giai đoạn 4: PersonalInfoTab & EditProfileModal]
    D --> E[Giai đoạn 5: InternAcademicTab, InternshipDetailTab & StaffProfessionalTab]
    E --> F[Giai đoạn 6: AccountSecurityTab & Kiểm Thử Toàn Diện 4 Role]
`

1. **Giai đoạn 1: Khởi tạo hạ tầng Types, Endpoints & Services**:
   - Tạo src/types/profile.types.ts (Zod schemas, Form types).
   - Bổ sung endpoints vào src/constants/endpoints/user.endpoints.ts và uth.endpoints.ts.
   - Bổ sung route PROFILE: '/profile' vào src/constants/routes/.
   - Tạo src/services/profileService.ts tuân thủ Axios 4 tầng, tích hợp AbortSignal.
2. **Giai đoạn 2: Custom Hook & Khung sườn Trang Profile**:
   - Viết useProfileData.ts nạp song song dữ liệu an toàn.
   - Dựng ProfilePage.tsx dạng Tab-Based thích ứng theo ole.
   - Cấu hình route tại AppRoutes.tsx và điều hướng Sidebar/Header về /profile.
3. **Giai đoạn 3: Phân hệ Avatar Hoàn Chỉnh**:
   - Xây dựng ProfileHeader.tsx dùng fallback DiceBear SVG collection 
otionists 100%.
   - Xây dựng AvatarUploadModal.tsx (Zoom slider, Preview tròn, Magic bytes check, Cache-busting, Upload S3 trực tiếp, dọn dẹp file cũ).
   - Tích hợp hàm updateUserAvatar vào AuthContext.
4. **Giai đoạn 4: Quản lý Thông tin cá nhân (Tab 1)**:
   - Dựng PersonalInfoTab.tsx (View-only đẹp mắt).
   - Dựng EditProfileModal.tsx (React Hook Form + Zod, Sticky Footer, bôi đỏ lỗi, gender optional).
5. **Giai đoạn 5: Các Tab Nghiệp Vụ Phân Quyền**:
   - Dựng InternAcademicTab.tsx + EditAcademicModal.tsx (Regex niên khóa, Tag kỹ năng, SafeUrl XSS check).
   - Dựng InternshipDetailTab.tsx (Tái sử dụng InternProfileCard ở chế độ Read-only 100%).
   - Dựng StaffProfessionalTab.tsx (Read-only 100% hiển thị department và position từ User DTO cho HR, Mentor, Admin).
6. **Giai đoạn 6: Phân hệ Đổi Mật Khẩu & Nghiệm Thu**:
   - Dựng AccountSecurityTab.tsx tích hợp PasswordStrengthMeter (4 tiêu chí Regex) và currentPassword bắt buộc.
   - Kiểm thử thủ công và tự động trên cả 4 vai trò (ADMIN, HR, MENTOR, INTERN).

---

## 8. Danh Sách Quyết Định Đã Chốt (Final Decision Log)

| STT | Vấn đề | Quyết định cuối cùng | Căn cứ kỹ thuật |
| :---: | :--- | :--- | :--- |
| **D-01** | Routing | Tuyến đường dùng chung /profile cho cả 4 role | Đồng nhất User Card từ Header & Sidebar, tương thích ngược /intern/profile. |
| **D-02** | Mô hình chỉnh sửa | Modal-First UX (EditProfileModal, EditAcademicModal) | Nhất quán với toàn bộ hệ thống, validate 1 lần qua Zod, không dùng Inline Edit. |
| **D-03** | Ranh giới dữ liệu TTS | Tab Thực tập & Mentor là Read-only 100% | TTS không có quyền ghi; HR/Admin quản lý độc quyền qua canEditIntern(role). Tái sử dụng InternProfileCard. |
| **D-04** | Email | Read-only vĩnh viễn (Khóa chết) | Bảo toàn JWT claim và identity link giữa các Microservices, chống rủi ro account-hijack. |
| **D-05** | Fallback Avatar | DiceBear SVG **collection 
otionists** seed-based (/7.x/notionists/svg?seed={userId}) | Nhất quán 100% với mục 1.4 Design Spec và các mockup có sẵn, xóa bỏ hoàn toàn chữ cái và collection initials. |
| **D-06** | Password Meter | Tái sử dụng PasswordStrengthMeter hiện có | Khớp đúng 4 tiêu chí Regex của Backend Spring Boot (Single Source of Truth). |
| **D-07** | Bảo mật Đổi Pass | Bắt buộc nhập currentPassword | Tiêu chuẩn chống chiếm quyền phiên mở sẵn. |
| **D-08** | Vòng đời Avatar & Storage | Public Read URL + Dọn dẹp xóa avatar cũ trên S3 + Magic Bytes check + Cache-Busting (?v=ts) | Chống vỡ ảnh sau 15–30 phút, chống rác Object Storage, chống giả mạo file và chống stale browser cache. |
| **D-09** | Kỹ năng (skills) | Chuyển thành .optional().default([]) | Không ép buộc TTS mới kích hoạt tài khoản phải có ngay kỹ năng. |
| **D-10** | Niên khóa | Regex YYYY - YYYY + Cross-field check khoảng cách <= 8 năm | Loại bỏ hoàn toàn dữ liệu chuỗi vô nghĩa hoặc năm ngược. |
| **D-11** | Giới tính (gender) | Chuyển thành .optional() | Thông tin nhạy cảm cá nhân, không mang tính ràng buộc bắt buộc. |
| **D-12** | Chống XSS Links | Validate Safe URL Scheme (/^https?:\/\//i) cho GitHub/LinkedIn | Chặn đứng tấn công Cross-Site Scripting qua pseudo-protocol javascript:. |
| **D-13** | Nguồn dữ liệu Tab 2C (Staff) | StaffProfessionalTab Read-only 100%, lấy từ trường department và position trên entity User | Entity User của identity-service đã có sẵn 2 trường này; không sinh thêm entity thừa thãi hay gọi API chưa tồn tại. |
| **D-14** | Chống IDOR Avatar Key | Key sinh theo pattern vatars/{userId}/{uuid}.webp, Backend verify prefix vatars/{currentUserId}/ | Chặn đứng hoàn toàn nguy cơ gán nhầm hoặc chiếm dụng vatarKey của tài khoản khác. |
| **D-15** | Bảo vệ Dung lượng S3 2 lớp | Client validate < 5MB + Backend gọi HEAD Object S3 kiểm tra Content-Length <= 5MB | Ngăn chặn bypass client-side upload file rác làm tràn bộ nhớ S3/MinIO. |
| **D-16** | Chống IDOR Cập Nhật Hồ Sơ | Ưu tiên dùng PUT /api/users/me hoặc Backend bắt buộc check currentUserId === id | Ngăn chặn việc thay đổi ID trong URL để chỉnh sửa trái phép hồ sơ người dùng khác. |
