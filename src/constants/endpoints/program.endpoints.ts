export const PROGRAM_ENDPOINTS = {
  LIST: '/api/programs',
  GET_BY_ID: (id: string | number) => `/api/programs/${id}`,
  CREATE: '/api/programs',
  UPDATE: (id: string | number) => `/api/programs/${id}`,
  CHANGE_STATUS: (id: string | number) => `/api/programs/${id}/status`,
  TOGGLE_RECRUITMENT: (id: string | number) => `/api/programs/${id}/recruitment-toggle`,
  DELETE: (id: string | number) => `/api/programs/${id}`,
  DEPARTMENTS: '/api/departments',
  CAPACITY_OVERVIEW: '/api/departments/capacity-overview',
  UPDATE_QUOTA: (id: string | number) => `/api/departments/${id}/quota`,
  OPEN_LIST: '/api/programs/open',
  INTERNS: (id: string | number) => `/api/programs/${id}/interns`,
  MENTORS: (id: string | number) => `/api/programs/${id}/mentors`,
  ENROLL: (id: string | number) => `/api/programs/${id}/enroll`,
  IMPORT_TEMPLATE: '/api/programs/import-template',
  IMPORT_PREVIEW: (id: string | number) => `/api/programs/${id}/import-interns/preview`,
  IMPORT_EXCEL: (id: string | number) => `/api/programs/${id}/import-interns`,
  ASSIGN_MENTOR: (id: string | number) => `/api/programs/${id}/assign-mentor`,
} as const;



