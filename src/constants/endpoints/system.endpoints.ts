export const SYSTEM_ENDPOINTS = {
  BACKUPS: '/api/system/backups',
  BACKUP_DOWNLOAD: (id: number) => `/api/system/backups/${id}/download`,
  BACKUP_DELETE: (id: number) => `/api/system/backups/${id}`,
  AUDIT_LOGS: '/api/system/audit-logs',
  AUDIT_LOG_DETAIL: (id: number) => `/api/system/audit-logs/${id}`,
  AUDIT_LOG_STATS: '/api/system/audit-logs/statistics',
  AUDIT_LOG_EXPORT: '/api/system/audit-logs/export',
} as const;
