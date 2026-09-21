export type RoleType = 'ADMIN' | 'HR' | 'MENTOR' | 'INTERN' | 'USER';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  status: 'ACTIVE' | 'INACTIVE';
  role: RoleType;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser {
  userId: number;
  username: string;
  fullName?: string;
  role: RoleType;
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
}

export interface ApiResponse<T> {
  code?: number;
  status?: string;
  message: string;
  data: T;
  timestamp?: string;
}

export interface PageResponse<T> {
  content: T[];
  items?: T[];
  pageNumber: number;
  currentPage?: number;
  pageSize: number;
  totalElements: number;
  totalItems?: number;
  totalPages: number;
  last: boolean;
  isLast?: boolean;
  isFirst?: boolean;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export type InternStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'INTERNING'
  | 'COMPLETED'
  | 'DROPPED';

export interface InternProfile {
  id: number;
  internCode: string;
  fullName: string;
  email: string;
  phone: string;
  university: string;
  major: string;
  gpa?: number;
  startDate?: string;
  endDate?: string;
  department?: string;
  mentorId?: number;
  mentorName?: string;
  status: InternStatus;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType =
  | 'CV'
  | 'INTERNSHIP_APPLICATION'
  | 'RECOMMENDATION_LETTER'
  | 'TRANSCRIPT'
  | 'OTHER';

export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DocumentResponse {
  id: number;
  internCode: string;
  documentType: DocumentType;
  fileName: string;
  fileSize: number;
  fileExtension?: string;
  status: DocumentStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface CreateInternRequest {
  fullName: string;
  email: string;
  phone: string;
  university: string;
  major: string;
  gpa?: number;
  startDate?: string;
  endDate?: string;
  department?: string;
}

export interface ReviewDocumentRequest {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export type BackupType = 'AUTOMATIC' | 'MANUAL';
export type BackupStatus = 'IN_PROGRESS' | 'SUCCESS' | 'FAILED';

export interface BackupHistoryItem {
  id: number;
  fileName: string;
  fileSize: number;
  formattedSize: string;
  backupType: BackupType;
  status: BackupStatus;
  scope?: string;
  durationMs?: number;
  errorMessage?: string;
  createdBy: string;
  createdAt: string;
}

export type AuditModule = 'AUTH' | 'INTERN' | 'DOCUMENT' | 'SYSTEM' | 'USER';

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'CREATE_INTERN'
  | 'UPDATE_INTERN'
  | 'CHANGE_INTERN_STATUS'
  | 'UPLOAD_DOCUMENT'
  | 'REVIEW_DOCUMENT'
  | 'DOWNLOAD_DOCUMENT'
  | 'TRIGGER_BACKUP'
  | 'DELETE_BACKUP'
  | 'DOWNLOAD_BACKUP'
  | 'TOGGLE_USER_STATUS'
  | 'CREATE_USER'
  | 'UPDATE_USER';

export type AuditStatus = 'SUCCESS' | 'FAILED';

export interface AuditLogItem {
  id: number;
  userId?: number;
  username: string;
  userRole?: string;
  action: AuditAction;
  module: AuditModule;
  description: string;
  endpoint: string;
  httpMethod: string;
  clientIp?: string;
  status: AuditStatus;
  executionTimeMs?: number;
  createdAt: string;
}

export interface AuditLogDetail extends AuditLogItem {
  userAgent?: string;
  errorMessage?: string;
  requestPayload?: string;
}

export interface AuditLogStats {
  totalToday: number;
  totalSuccess: number;
  totalFailed: number;
  successRate: number;
  moduleBreakdown: Record<string, number>;
}

export interface AuditLogFilterParams {
  keyword?: string;
  module?: string;
  action?: string;
  status?: string;
  username?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
  sort?: string;
}

