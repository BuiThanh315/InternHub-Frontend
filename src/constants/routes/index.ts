import { AUTH_ROUTES } from './auth.routes';
import { ADMIN_ROUTES } from './admin.routes';
import { HR_ROUTES } from './hr.routes';
import { MENTOR_ROUTES } from './mentor.routes';
import { INTERN_ROUTES } from './intern.routes';

export const ROUTES = {
  ROOT: '/',
  AUTH: AUTH_ROUTES,
  ADMIN: ADMIN_ROUTES,
  HR: HR_ROUTES,
  MENTOR: MENTOR_ROUTES,
  INTERN: INTERN_ROUTES,
} as const;

export * from './auth.routes';
export * from './admin.routes';
export * from './hr.routes';
export * from './mentor.routes';
export * from './intern.routes';
