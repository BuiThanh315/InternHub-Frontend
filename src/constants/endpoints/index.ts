import { AUTH_ENDPOINTS } from './auth.endpoints';
import { EMPLOYEE_ENDPOINTS } from './employee.endpoints';
import { INTERN_ENDPOINTS } from './intern.endpoints';
import { USER_ENDPOINTS } from './user.endpoints';
import { DOCUMENT_ENDPOINTS } from './document.endpoints';
import { SYSTEM_ENDPOINTS } from './system.endpoints';
import { CONTRACT_ENDPOINTS } from './contract.endpoints';
import { PROGRAM_ENDPOINTS } from './program.endpoints';
import { ATTENDANCE_ENDPOINTS } from './attendance.endpoints';

export const API_ENDPOINTS = {
  AUTH: AUTH_ENDPOINTS,
  EMPLOYEE: EMPLOYEE_ENDPOINTS,
  INTERN: INTERN_ENDPOINTS,
  USER: USER_ENDPOINTS,
  DOCUMENT: DOCUMENT_ENDPOINTS,
  SYSTEM: SYSTEM_ENDPOINTS,
  CONTRACT: CONTRACT_ENDPOINTS,
  PROGRAM: PROGRAM_ENDPOINTS,
  ATTENDANCE: ATTENDANCE_ENDPOINTS,
} as const;

export * from './auth.endpoints';
export * from './employee.endpoints';
export * from './intern.endpoints';
export * from './user.endpoints';
export * from './document.endpoints';
export * from './system.endpoints';
export * from './contract.endpoints';
export * from './program.endpoints';
export * from './attendance.endpoints';


