export const AI_ENDPOINTS = {
  BASE: '/api/ai/screening',
  BATCH: '/api/ai/screening/batch',
  JOB_STATUS: (jobId: string) => `/api/ai/screening/jobs/${jobId}`,
  INTERN_EVALUATION: (internId: number | string) => `/api/ai/screening/interns/${internId}`,
} as const;
