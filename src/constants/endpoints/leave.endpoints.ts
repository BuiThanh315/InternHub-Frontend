export const LEAVE_ENDPOINTS = {
  BASE: '/api/v1/leave-requests',
  MY_REQUESTS: '/api/v1/leave-requests/my-requests',
  PENDING: '/api/v1/leave-requests/pending',
  DETAIL: (id: number | string) => `/api/v1/leave-requests/${id}`,
  CANCEL: (id: number | string) => `/api/v1/leave-requests/${id}/cancel`,
  APPROVE: (id: number | string) => `/api/v1/leave-requests/${id}/approve`,
  REJECT: (id: number | string) => `/api/v1/leave-requests/${id}/reject`,
} as const;
