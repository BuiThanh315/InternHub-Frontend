import type { GenderType } from './common.types';

// Khớp 100% với backend InternStatus enum (7 trạng thái chuẩn hóa)
export type InternStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'INTERNING'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'REJECTED'
  | 'TERMINATED';

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
  gpa?: number | null;
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
  mentorId?: number | null;
  mentorName?: string | null;
  mentorEmail?: string | null;
  programId?: number | null;
  programCode?: string | null;
  programName?: string | null;
  candidateType?: 'UNIVERSITY' | 'FREE_APPLICANT' | null;
  desiredDepartmentId?: number | null;
  desiredDepartmentName?: string | null;
  needsReassignment?: boolean;
  reassignmentReason?: string | null;
  needsMentorReassignment?: boolean;
  mentorReassignmentReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type InternResponse = InternProfile;

export type MentorAssignmentStatus = 'ACTIVE' | 'REPLACED' | 'REVOKED';

export interface MentorOption {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  departmentId?: number;
  departmentName?: string;
  departmentCode?: string;
  status: string;
  activeInternCount: number;
  interningCount?: number;
  assignedPendingStartCount?: number;
}

export interface AssignMentorRequest {
  mentorId: number;
  notes?: string;
  replaceReason?: string;
}

export interface CreateMentorRequest {
  fullName: string;
  email: string;
  phone: string;
  departmentId: number;
}

export interface RevokeMentorRequest {
  reason: string;
}

export interface MentorAssignmentResponse {
  id: number;
  internId: number;
  mentorId: number;
  mentorName: string;
  mentorEmail: string;
  assignedBy: string;
  assignedAt: string;
  status: MentorAssignmentStatus;
  notes?: string;
  revokedAt?: string | null;
  revocationReason?: string | null;
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
