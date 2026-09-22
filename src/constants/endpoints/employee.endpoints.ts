export const EMPLOYEE_ENDPOINTS = {
  BASE: '/api/employees',
  
  // Intern & Program Service (/api/interns)
  INTERNS: '/api/interns',
  INTERN_DETAIL: (id: number | string) => `/api/interns/${id}`,
  INTERN_STATUS: (id: number | string) => `/api/interns/${id}/status`,
  INTERN_DOCUMENTS: (internCode: string) => `/api/interns/${internCode}/documents`,
  
  // Identity & Access Service (/api/users)
  USERS: '/api/users',
  USER_DETAIL: (id: number | string) => `/api/users/${id}`,
  USER_STATUS: (id: number | string) => `/api/users/${id}/status`,

  // Metadata / Legacy
  DEPARTMENTS: '/api/employees/departments',
  POSITIONS: '/api/employees/positions',
} as const;

