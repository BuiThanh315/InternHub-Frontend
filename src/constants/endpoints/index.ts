import { AUTH_ENDPOINTS } from './auth.endpoints';
import { EMPLOYEE_ENDPOINTS } from './employee.endpoints';
import { INTERN_ENDPOINTS } from './intern.endpoints';
import { USER_ENDPOINTS } from './user.endpoints';
import { DOCUMENT_ENDPOINTS } from './document.endpoints';
import { SYSTEM_ENDPOINTS } from './system.endpoints';

export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  EMPLOYEE: EMPLOYEE_ENDPOINTS,
  INTERN: INTERN_ENDPOINTS,
  USER: USER_ENDPOINTS,
  DOCUMENT: DOCUMENT_ENDPOINTS,
  SYSTEM: SYSTEM_ENDPOINTS,
} as const;

export * from './auth.endpoints';
export * from './employee.endpoints';
export * from './intern.endpoints';
export * from './user.endpoints';
export * from './document.endpoints';
export * from './system.endpoints';


