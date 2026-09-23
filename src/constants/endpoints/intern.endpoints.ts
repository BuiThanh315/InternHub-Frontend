export const INTERN_ENDPOINTS = {
  BASE: '/api/interns',
  LIST: '/api/interns',
  CREATE: '/api/interns',
  DETAIL: (id: number | string) => `/api/interns/${id}`,
  UPDATE: (id: number | string) => `/api/interns/${id}`,
  STATUS: (id: number | string) => `/api/interns/${id}/status`,
  DECISION: (id: number | string) => `/api/interns/${id}/decision`,
  DOCUMENTS: (internCode: string) => `/api/interns/${internCode}/documents`,
} as const;
