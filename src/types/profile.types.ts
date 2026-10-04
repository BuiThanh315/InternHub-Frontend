import { z } from 'zod';

// 1. Niên khóa: YYYY - YYYY, năm sau > năm trước, khoảng cách 1 đến 8 năm
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
      message: 'Năm kết thúc phải sau năm bắt đầu và khoảng cách niên khóa từ 1 đến 8 năm',
    }
  );

// 2. Chặn Scheme XSS (javascript:) cho External URLs
export const SafeUrlSchema = z
  .string()
  .trim()
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
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(), // Optional, thông tin nhạy cảm
  address: z.string().trim().max(255, 'Địa chỉ tối đa 255 ký tự').optional().or(z.literal('')),
  bio: z.string().trim().max(500, 'Giới thiệu tối đa 500 ký tự').optional().or(z.literal('')),
});

// 4. Form Học vấn & Kỹ năng (Chỉ TTS)
export const InternAcademicSchema = z.object({
  university: z.string().trim().min(2, 'Vui lòng nhập tên trường ĐH/CĐ').max(150, 'Tối đa 150 ký tự'),
  major: z.string().trim().min(2, 'Vui lòng nhập chuyên ngành đào tạo').max(100, 'Tối đa 100 ký tự'),
  academicYear: AcademicYearSchema,
  gpa: z
    .number({ message: 'GPA phải là số' })
    .min(0, 'GPA tối thiểu là 0.0')
    .max(4.0, 'GPA hệ 4 tối đa là 4.0')
    .optional()
    .nullable(),
  skills: z.array(z.string().trim()).default([]),
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

export interface UpdateUserProfileRequest {
  fullName: string;
  phone?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  bio?: string;
}

export interface UpdateInternAcademicRequest {
  university: string;
  major: string;
  academicYear?: string;
  gpa?: number | null;
  skills?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
}

export interface AvatarUploadUrlResponse {
  presignedUrl: string;
  avatarKey: string;
  publicUrl: string;
}

export interface AvatarUpdateResponse {
  avatarUrl: string;
}
