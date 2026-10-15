export const AI_ENDPOINTS = {
  BASE: '/api/ai/screening',
  BATCH: '/api/ai/screening/batch',
  JOB_STATUS: (jobId: string) => `/api/ai/screening/jobs/${jobId}`,
  INTERN_EVALUATION: (internId: number | string) => `/api/ai/screening/interns/${internId}`,
  INTERVIEW_GENERATE: '/api/ai/interview-questions/generate',
  INTERVIEW_SET_DETAIL: (id: number | string) => `/api/ai/interview-questions/sets/${id}`,
  INTERVIEW_SETS: '/api/ai/interview-questions/sets',
  INTERVIEW_REGENERATE_QUESTION: (setId: number | string, questionId: number | string) =>
    `/api/ai/interview-questions/sets/${setId}/questions/${questionId}/regenerate`,
  INTERVIEW_EXPORT_PDF: (id: number | string) => `/api/ai/interview-questions/sets/${id}/export-pdf`,
} as const;

