export const USER_ENDPOINTS = {
  BASE: '/api/users',
  LIST: '/api/users',
  DETAIL: (id: number | string) => `/api/users/${id}`,
  STATUS: (id: number | string) => `/api/users/${id}/status`,
} as const;
