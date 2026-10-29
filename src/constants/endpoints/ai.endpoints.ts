export const AI_ENDPOINTS = {
  BASE: '/api/ai/screening',
  BATCH: '/api/ai/screening/batch',
  JOB_STATUS: (jobId: string) => `/api/ai/screening/jobs/${jobId}`,
  INTERN_EVALUATION: (internId: number | string) => `/api/ai/screening/interns/${internId}`,
  INTERVIEW_GENERATE: '/api/ai/interview-questions/generate',
  INTERVIEW_GENERATE_ASYNC: '/api/ai/interview-questions/generate-async',
  INTERVIEW_JOB_STATUS: (jobId: string) => `/api/ai/interview-questions/jobs/${jobId}`,
  INTERVIEW_SET_DETAIL: (id: number | string) => `/api/ai/interview-questions/sets/${id}`,
  INTERVIEW_SETS: '/api/ai/interview-questions/sets',
  INTERVIEW_REGENERATE_QUESTION: (setId: number | string, questionId: number | string) =>
    `/api/ai/interview-questions/sets/${setId}/questions/${questionId}/regenerate`,
  INTERVIEW_EXPORT_PDF: (id: number | string) => `/api/ai/interview-questions/sets/${id}/export-pdf`,
  // Module AI-01: Quản lý lịch phỏng vấn và Buồng thi ứng viên
  INTERVIEW_SCHEDULES: '/api/v1/ai/interviews/schedules',
  INTERVIEW_SCHEDULE_DETAIL: (id: number | string) => `/api/v1/ai/interviews/schedules/${id}`,
  INTERVIEW_RESEND_INVITE: (scheduleId: number | string, sessionId: number | string) =>
    `/api/v1/ai/interviews/schedules/${scheduleId}/sessions/${sessionId}/resend-invite`,
  INTERVIEW_REVOKE_SESSION: (sessionId: number | string) =>
    `/api/v1/ai/interviews/schedules/sessions/${sessionId}/revoke`,
  // Candidate Room endpoints
  CANDIDATE_EXCHANGE_TOKEN: '/api/v1/ai/interviews/candidate/exchange-token',
  CANDIDATE_SESSION_START: (sessionId: number | string) =>
    `/api/v1/ai/interviews/candidate/sessions/${sessionId}/start`,
  CANDIDATE_SESSION_SAVE_ANSWER: (sessionId: number | string, questionId: number | string) =>
    `/api/v1/ai/interviews/candidate/sessions/${sessionId}/answers/${questionId}`,
  CANDIDATE_SESSION_RECOVERY: (sessionId: number | string) =>
    `/api/v1/ai/interviews/candidate/sessions/${sessionId}/recovery`,
  CANDIDATE_SESSION_EVIDENCE: (sessionId: number | string) =>
    `/api/v1/ai/interviews/candidate/sessions/${sessionId}/evidence`,
  CANDIDATE_SESSION_SUBMIT: (sessionId: number | string) =>
    `/api/v1/ai/interviews/candidate/sessions/${sessionId}/submit`,
  CANDIDATE_MY_INTERVIEWS: '/api/v1/ai/interviews/candidate/my-interviews',
  // Module AI-02: AI Interview Grader & Ranking Engine
  EVALUATION_DOSSIER: (sessionId: number | string) =>
    `/api/v1/ai/interviews/schedules/sessions/${sessionId}/evaluation`,
  EVALUATION_REVIEW: (sessionId: number | string) =>
    `/api/v1/ai/interviews/schedules/sessions/${sessionId}/evaluation/review`,
  EVALUATION_REVOKE: (sessionId: number | string) =>
    `/api/v1/ai/interviews/schedules/sessions/${sessionId}/evaluation/revoke-approval`,
  EVALUATION_REGRADE: (sessionId: number | string) =>
    `/api/v1/ai/interviews/schedules/sessions/${sessionId}/evaluation/regrade`,
  EVALUATION_EXPORT_PDF: (sessionId: number | string) =>
    `/api/v1/ai/interviews/schedules/sessions/${sessionId}/evaluation/export-pdf`,
  CANDIDATE_INTERVIEW_SESSION: '/api/v1/ai/interviews/schedules/candidate-session',
  // Module AI-10: Multi-Key & Provider Vault
  VAULT: '/api/v1/ai/admin/vault',
  VAULT_TEST: (id: number | string) => `/api/v1/ai/admin/vault/${id}/test`,
  VAULT_DETAIL: (id: number | string) => `/api/v1/ai/admin/vault/${id}`,
  // Module AI-18: Bookmark & History
  BOOKMARK_TOGGLE: '/api/ai/screening/bookmarks/toggle',
  BOOKMARKS_BY_PROGRAM: (programId: number | string) => `/api/ai/screening/bookmarks/programs/${programId}`,
  // Module AI-19: Prompt Management Engine & Versioning
  PROMPT_TEMPLATES: '/api/v1/ai/admin/prompt-templates',
  PROMPT_TEMPLATE_DETAIL: (code: string) => `/api/v1/ai/admin/prompt-templates/${code}`,
  PROMPT_TEMPLATE_ACTIVATE: (code: string, version: number | string) =>
    `/api/v1/ai/admin/prompt-templates/${code}/versions/${version}/activate`,
  PROMPT_TEMPLATE_PREVIEW: '/api/v1/ai/admin/prompt-templates/preview',
} as const;

