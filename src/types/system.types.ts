// ==========================================
// Backup Types
// ==========================================
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

// ==========================================
// Audit Log Types
// ==========================================
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
