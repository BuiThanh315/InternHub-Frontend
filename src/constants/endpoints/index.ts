import { AUTH_ENDPOINTS } from './auth.endpoints';
import { EMPLOYEE_ENDPOINTS } from './employee.endpoints';
import { DOCUMENT_ENDPOINTS } from './document.endpoints';
import { SYSTEM_ENDPOINTS } from './system.endpoints';

export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  EMPLOYEE: EMPLOYEE_ENDPOINTS,
  DOCUMENT: DOCUMENT_ENDPOINTS,
  SYSTEM: SYSTEM_ENDPOINTS,
} as const;

export * from './auth.endpoints';
export * from './employee.endpoints';
export * from './document.endpoints';
export * from './system.endpoints';

