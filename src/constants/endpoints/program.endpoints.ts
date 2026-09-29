export const PROGRAM_ENDPOINTS = {
  LIST: '/api/programs',
  GET_BY_ID: (id: string | number) => `/api/programs/${id}`,
  CREATE: '/api/programs',
  UPDATE: (id: string | number) => `/api/programs/${id}`,
  CHANGE_STATUS: (id: string | number) => `/api/programs/${id}/status`,
  TOGGLE_RECRUITMENT: (id: string | number) => `/api/programs/${id}/recruitment-toggle`,
  DELETE: (id: string | number) => `/api/programs/${id}`,
  DEPARTMENTS: '/api/departments',
  OPEN_LIST: '/api/programs/open',
} as const;

