export const EMPLOYEE_ENDPOINTS = {
  BASE: '/api/employees',
  INTERNS: '/api/employees/interns',
  INTERN_DETAIL: (id: number | string) => `/api/employees/interns/${id}`,
  INTERN_STATUS: (id: number | string) => `/api/employees/interns/${id}/status`,
  DEPARTMENTS: '/api/employees/departments',
  POSITIONS: '/api/employees/positions',
  USERS: '/api/employees/users',
  USER_DETAIL: (id: number | string) => `/api/employees/users/${id}`,
  USER_STATUS: (id: number | string) => `/api/employees/users/${id}/status`,
} as const;
