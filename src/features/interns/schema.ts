import { z } from 'zod';
import type { InternStatus } from '../../types';

// Normalized Status Keys based on docs/spec.md section 6.1
export type NormalizedStatusKey =
  | 'pending'
  | 'active'
  | 'on_hold'
  | 'completed'
  | 'rejected'
  | 'terminated';

export interface StatusMeta {
  key: NormalizedStatusKey;
  label: string;
  colorVar: string;
  bgVar: string;
  borderVar: string;
  description: string;
  allowedTransitions: NormalizedStatusKey[];
}

export const statusConfig: Record<NormalizedStatusKey, StatusMeta> = {
  pending: {
    key: 'pending',
    label: 'Chờ duyệt',
    colorVar: 'var(--warning)',
    bgVar: 'var(--warning-soft)',
    borderVar: 'transparent',
    description: 'Hồ sơ mới nộp/ứng tuyển, chưa được HR duyệt',
    allowedTransitions: ['active', 'rejected'],
  },
  active: {
    key: 'active',
    label: 'Đang thực tập',
    colorVar: 'var(--success)',
    bgVar: 'var(--success-soft)',
    borderVar: 'transparent',
    description: 'Đã ký, đang trong thời gian thực tập',
    allowedTransitions: ['on_hold', 'completed', 'terminated'],
  },
  on_hold: {
    key: 'on_hold',
    label: 'Tạm dừng',
    colorVar: 'var(--text-2)',
    bgVar: 'var(--border-soft)',
    borderVar: 'var(--border)',
    description: 'Nghỉ phép dài hạn, tạm ngưng có lý do',
    allowedTransitions: ['active', 'terminated'],
  },
  completed: {
    key: 'completed',
    label: 'Hoàn thành',
    colorVar: 'var(--info)',
    bgVar: 'var(--info-soft)',
    borderVar: 'transparent',
    description: 'Kết thúc đúng hạn, đã có đánh giá cuối kỳ',
    allowedTransitions: [],
  },
  rejected: {
    key: 'rejected',
    label: 'Từ chối',
    colorVar: 'var(--danger)',
    bgVar: 'var(--danger-soft)',
    borderVar: 'transparent',
    description: 'Hồ sơ không được duyệt',
    allowedTransitions: [],
  },
  terminated: {
    key: 'terminated',
    label: 'Chấm dứt sớm',
    colorVar: 'var(--danger)',
    bgVar: 'var(--danger-soft)',
    borderVar: 'transparent',
    description: 'Kết thúc trước hạn, có lý do',
    allowedTransitions: [],
  },
};

// Map backend InternStatus to normalized key
export function mapBackendStatusToKey(status?: InternStatus | string): NormalizedStatusKey {
  if (!status) return 'pending';
  switch (status.toUpperCase()) {
    case 'SUBMITTED':
    case 'DRAFT':
    case 'PENDING':
      return 'pending';
    case 'APPROVED':
    case 'INTERNING':
    case 'ACTIVE':
      return 'active';
    case 'COMPLETED':
      return 'completed';
    case 'DROPPED':
    case 'TERMINATED':
      return 'terminated';
    case 'REJECTED':
      return 'rejected';
    case 'ON_HOLD':
      return 'on_hold';
    default:
      return 'pending';
  }
}

/**
 * State Machine Helper conforming to TM-2:
 * PENDING -> APPROVED | REJECTED
 * APPROVED -> INTERNING | REJECTED
 * INTERNING -> COMPLETED | REJECTED
 * COMPLETED -> [] (Terminal State)
 * REJECTED -> PENDING
 */
export function getAllowedNextStatuses(currentStatus: InternStatus): { status: InternStatus; label: string }[] {
  switch (currentStatus) {
    case 'PENDING':
    case 'SUBMITTED':
      return [
        { status: 'APPROVED', label: 'Duyệt tiếp nhận (APPROVED)' },
        { status: 'REJECTED', label: 'Từ chối hồ sơ (REJECTED)' },
      ];
    case 'APPROVED':
      return [
        { status: 'INTERNING', label: 'Bắt đầu thực tập (INTERNING)' },
        { status: 'REJECTED', label: 'Hủy/Từ chối tiếp nhận (REJECTED)' },
      ];
    case 'INTERNING':
      return [
        { status: 'COMPLETED', label: 'Hoàn thành kỳ thực tập (COMPLETED)' },
        { status: 'DROPPED', label: 'Chấm dứt sớm / Bỏ dở (DROPPED)' },
        { status: 'REJECTED', label: 'Từ chối / Hủy (REJECTED)' },
      ];
    case 'REJECTED':
      return [
        { status: 'PENDING', label: 'Mở lại xét duyệt (PENDING)' },
      ];
    case 'COMPLETED':
    default:
      return [];
  }
}

/**
 * Helper to determine step status for stepper/progress timeline (DRY)
 */
export function getInternStepProgress(
  currentStatus?: InternStatus | string,
  stepNumber?: number
): 'completed' | 'active' | 'pending' {
  if (!currentStatus || stepNumber === undefined) return 'pending';

  const statusStepMap: Record<string, number> = {
    SUBMITTED: 1,
    PENDING: 1,
    APPROVED: 2,
    INTERNING: 3,
    ACTIVE: 3,
    COMPLETED: 4,
  };

  const currentStep = statusStepMap[currentStatus.toUpperCase()] || 1;
  if (stepNumber < currentStep) return 'completed';
  if (stepNumber === currentStep) return 'active';
  return 'pending';
}

// Zod Schema for Intern Creation (docs/spec.md section 7.2 & BR-2)
export const internFormSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
      .max(100, 'Họ và tên không quá 100 ký tự'),
    email: z.string().email('Địa chỉ email không hợp lệ'),
    phone: z
      .string()
      .regex(/^(03|05|07|08|09)\d{8}$/, 'Số điện thoại phải gồm 10 chữ số (đầu 03, 05, 07, 08, 09)'),
    university: z.string().min(2, 'Vui lòng nhập tên trường đại học'),
    major: z.string().min(2, 'Vui lòng nhập chuyên ngành học'),
    appliedPosition: z.string().optional(),
    academicYear: z.string().optional(),
    notes: z.string().optional(),
    gpa: z
      .number()
      .min(0, 'GPA tối thiểu 0.0')
      .max(4.0, 'GPA tối đa 4.0')
      .optional(),
    department: z.string().optional(),
    startDate: z.string().min(1, 'Ngày bắt đầu không được để trống'),
    endDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu',
      path: ['endDate'],
    }
  );

export type InternFormValues = z.infer<typeof internFormSchema>;

// Zod Schema for Intern Editing (TM-2 & BR-2)
export const updateInternFormSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Họ và tên phải có ít nhất 2 ký tự')
      .max(100, 'Họ và tên không quá 100 ký tự'),
    email: z.string().email('Địa chỉ email không hợp lệ'),
    phone: z
      .string()
      .regex(/^(03|05|07|08|09)\d{8}$/, 'Số điện thoại phải gồm 10 chữ số (đầu 03, 05, 07, 08, 09)'),
    university: z.string().min(2, 'Vui lòng nhập tên trường đại học'),
    major: z.string().min(2, 'Vui lòng nhập chuyên ngành học'),
    appliedPosition: z.string().optional(),
    academicYear: z.string().optional(),
    notes: z.string().optional(),
    gpa: z
      .number()
      .min(0, 'GPA tối thiểu 0.0')
      .max(4.0, 'GPA tối đa 4.0')
      .optional(),
    department: z.string().optional(),
    startDate: z.string().min(1, 'Ngày bắt đầu không được để trống'),
    endDate: z.string().optional(),
    status: z.custom<InternStatus>(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu',
      path: ['endDate'],
    }
  );

export type UpdateInternFormValues = z.infer<typeof updateInternFormSchema>;
