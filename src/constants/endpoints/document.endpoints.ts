export const DOCUMENT_ENDPOINTS = {
  BASE: '/api/documents',
  UPLOAD: '/api/documents/upload',
  BY_INTERN: (internCode: string) => `/api/documents/intern/${internCode}`,
  DOWNLOAD: (id: number | string) => `/api/documents/${id}/download`,
  REVIEW: (id: number | string) => `/api/documents/${id}/review`,
  PENDING: '/api/documents/pending',
} as const;
