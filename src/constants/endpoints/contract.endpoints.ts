export const CONTRACT_ENDPOINTS = {
  BASE: '/api/interns',
  UPLOAD: (internCode: string) => `/api/interns/${internCode}/contracts`,
  BY_INTERN: (internCode: string) => `/api/interns/${internCode}/contracts`,
  DOWNLOAD: (contractId: number | string) => `/api/interns/contracts/${contractId}/download`,
} as const;
