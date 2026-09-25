import type { GenderType } from './common.types';

// Khớp 100% với backend InternStatus enum
export type InternStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'INTERNING'
  | 'COMPLETED'
  | 'REJECTED';

export interface InternProfile {
  id: number;
  userId?: number | null;
  internCode: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: GenderType;
  address?: string;
  university: string;
  major: string;
  academicYear?: string;
  appliedPosition: string;
  startDate: string;
  endDate?: string;
  status: InternStatus;
  rejectionReason?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  emailStatus?: 'PENDING' | 'SENT' | 'FAILED' | null;
  emailSentAt?: string | null;
  emailRetryCount?: number | null;
  lastEmailSentAt?: string | null;
  notes?: string;
  gpa?: number;
  mentorId?: number;
  mentorName?: string;
  programId?: number | null;
  programCode?: string | null;
  programName?: string | null;
  needsReassignment?: boolean;
  reassignmentReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InternDecisionRequest {
  decision: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  programId?: number;
}

export interface CreateInternRequest {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: GenderType;
  address?: string;
  university: string;
  major: string;
  academicYear?: string;
  appliedPosition: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

export interface UpdateInternRequest {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: GenderType;
  address?: string;
  university: string;
  major: string;
  academicYear?: string;
  appliedPosition: string;
  startDate: string;
  endDate?: string;
  status: InternStatus;
  notes?: string;
}

export interface ApplyInternRequest {
  userId?: number;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  gender?: GenderType;
  address?: string;
  university: string;
  major: string;
  academicYear?: string;
  appliedPosition: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}
