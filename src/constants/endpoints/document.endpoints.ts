export const DOCUMENT_ENDPOINTS = {
  BASE: '/api/interns',
  UPLOAD: (internCode: string) => `/api/interns/${internCode}/documents`,
  BY_INTERN: (internCode: string) => `/api/interns/${internCode}/documents`,
  DOWNLOAD: (id: number | string) => `/api/interns/documents/${id}/download`,
  REVIEW: (id: number | string) => `/api/interns/documents/${id}/review`,
  PENDING: '/api/interns/documents/pending',
} as const;

