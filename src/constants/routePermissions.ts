import { ROUTES } from './routes';

/**
 * Bảng ánh xạ quyền truy cập tối thiểu cho từng route trong toàn bộ ứng dụng.
 * Single Source of Truth cho:
 * 1. ProtectedRoute (khi duyệt route)
 * 2. NotificationContext (khi nhận tín hiệu PERMISSION_UPDATED để dọn route)
 * 3. Navigation / Breadcrumbs
 */
export const ROUTE_PERMISSION_REGISTRY: Record<string, string[]> = {
  // HR Module
  [ROUTES.HR.REVIEW]: ['DOCUMENT_REVIEW'],
  [ROUTES.HR.CONTRACTS]: ['CONTRACT_VIEW'],
  [ROUTES.HR.PROGRAMS]: ['PROGRAM_VIEW'],
  [ROUTES.HR.MENTORS]: ['MENTOR_VIEW'],
  [ROUTES.HR.INTERNS]: ['INTERN_VIEW_ALL'],
  [ROUTES.HR.EVALUATIONS]: ['INTERN_APPROVE'],
  [ROUTES.HR.DASHBOARD]: ['INTERN_VIEW_ALL', 'PROGRAM_MANAGE', 'CONTRACT_VIEW', 'DOCUMENT_REVIEW', 'MENTOR_VIEW'],

  // Admin Module
  [ROUTES.ADMIN.ROLES]: ['ROLE_VIEW'],
  [ROUTES.ADMIN.USERS]: ['USER_VIEW'],
  [ROUTES.ADMIN.SYSTEM]: ['SYSTEM_AUDIT_VIEW'],
  [ROUTES.ADMIN.DASHBOARD]: ['ROLE_VIEW', 'USER_VIEW', 'SYSTEM_AUDIT_VIEW'],

  // Mentor Module
  [ROUTES.MENTOR.DOCUMENTS]: ['MENTOR_VIEW_OWN_DOCS', 'INTERN_VIEW_OWN'],
  [ROUTES.MENTOR.INTERNS]: ['INTERN_VIEW_OWN'],
  [ROUTES.MENTOR.DASHBOARD]: ['INTERN_VIEW_OWN'],

  // Intern Module
  [ROUTES.INTERN.DOCUMENTS]: ['INTERN_VIEW_OWN_DOCUMENTS'],
  [ROUTES.INTERN.DASHBOARD]: ['INTERN_VIEW_OWN_PROFILE'],

  // Profile (Mặc định)
  [ROUTES.PROFILE]: ['PROFILE_VIEW_OWN'],
};

/**
 * Tra cứu danh sách quyền yêu cầu cho một URL path cụ thể
 */
export function getRequiredPermissionsForPath(pathname: string): string[] | undefined {
  for (const [routePath, perms] of Object.entries(ROUTE_PERMISSION_REGISTRY)) {
    if (pathname === routePath || (routePath !== '/' && pathname.startsWith(routePath + '/'))) {
      return perms;
    }
  }
  return undefined;
}
