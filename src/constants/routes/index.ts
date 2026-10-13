import { AUTH_ROUTES } from './auth.routes';
import { ADMIN_ROUTES } from './admin.routes';
import { HR_ROUTES } from './hr.routes';
import { MENTOR_ROUTES } from './mentor.routes';
import { INTERN_ROUTES } from './intern.routes';
import { COMMON_ROUTES } from './common.routes';

export const ROUTES = {
  ROOT: '/',
  PROFILE: COMMON_ROUTES.PROFILE,
  COMMON: COMMON_ROUTES,
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
export * from './common.routes';

/**
 * Xác thực và phân giải đường dẫn điều hướng an toàn dựa trên vai trò người dùng (TM-20 / TM-32).
 * Ngăn chặn tuyệt đối việc chuyển hướng mù quáng theo tham số redirect của tài khoản trước đó.
 */
export const getValidatedRedirectRoute = (
  role: string | null | undefined,
  redirectParam: string | null
): string => {
  const normalizedRole = role ? role.toUpperCase().replace('ROLE_', '') : 'INTERN';

  const defaultRoute = (() => {
    switch (normalizedRole) {
      case 'ADMIN':
        return ROUTES.ADMIN.DASHBOARD;
      case 'HR':
        return ROUTES.HR.DASHBOARD;
      case 'MENTOR':
        return ROUTES.MENTOR.DASHBOARD;
      case 'INTERN':
      case 'USER':
      default:
        return ROUTES.INTERN.DASHBOARD;
    }
  })();

  if (!redirectParam || !redirectParam.startsWith('/') || redirectParam === '/' || redirectParam === '/login') {
    return defaultRoute;
  }

  // Cho phép trang hồ sơ cá nhân chung
  if (redirectParam === ROUTES.PROFILE || redirectParam.startsWith('/profile')) {
    return redirectParam;
  }

  // Kiểm tra tính tương thích giữa vai trò và tiền tố đường dẫn
  if (normalizedRole === 'ADMIN') {
    return redirectParam.startsWith('/admin') ? redirectParam : defaultRoute;
  }
  if (normalizedRole === 'HR') {
    return redirectParam.startsWith('/hr') ? redirectParam : defaultRoute;
  }
  if (normalizedRole === 'MENTOR') {
    return redirectParam.startsWith('/mentor') ? redirectParam : defaultRoute;
  }
  if (normalizedRole === 'INTERN' || normalizedRole === 'USER') {
    return (redirectParam.startsWith('/intern') || redirectParam.startsWith('/apply'))
      ? redirectParam
      : defaultRoute;
  }

  return defaultRoute;
};
