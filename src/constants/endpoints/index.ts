import { AUTH_ENDPOINTS } from './auth.endpoints';
import { EMPLOYEE_ENDPOINTS } from './employee.endpoints';
import { DOCUMENT_ENDPOINTS } from './document.endpoints';

export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  EMPLOYEE: EMPLOYEE_ENDPOINTS,
  DOCUMENT: DOCUMENT_ENDPOINTS,
} as const;

export * from './auth.endpoints';
export * from './employee.endpoints';
export * from './document.endpoints';
