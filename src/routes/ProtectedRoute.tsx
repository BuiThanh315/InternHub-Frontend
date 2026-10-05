import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants/routes';

interface ProtectedRouteProps {
  /**
   * Danh sách mã đặc quyền tối thiểu cần để truy cập route này.
   * Ví dụ: ['INTERN_VIEW_ALL'] hoặc ['PROGRAM_VIEW', 'PROGRAM_MANAGE']
   */
  requiredPermissions?: string[];
  /**
   * Chế độ kiểm tra đặc quyền:
   * 'ANY': Chỉ cần sở hữu ít nhất 1 quyền trong danh sách (Mặc định)
   * 'ALL': Bắt buộc phải sở hữu đầy đủ tất cả các quyền
   */
  permissionMode?: 'ANY' | 'ALL';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredPermissions,
  permissionMode = 'ANY',
}) => {
  const { isAuthenticated, role, isInitializing, hasAnyPermission, hasAllPermissions, hasPermission } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="text-sm text-slate-400">Đang khôi phục phiên làm việc...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    const redirectTarget = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/?login=true&redirect=${redirectTarget}`} replace />;
  }

  // 1. Vai trò ADMIN luôn sở hữu đặc quyền tối thượng, bypass an toàn
  if (role === 'ADMIN') {
    return <Outlet />;
  }

  // 2. Kiểm tra thẩm định Permission-First (Single Source of Truth)
  if (requiredPermissions && requiredPermissions.length > 0) {
    const isAuthorized =
      permissionMode === 'ALL'
        ? hasAllPermissions(...requiredPermissions)
        : hasAnyPermission(...requiredPermissions);

    if (!isAuthorized) {
      // Smart Redirection thuần túy dựa trên Permission
      if (hasPermission('ROLE_VIEW') || hasPermission('USER_VIEW') || hasPermission('SYSTEM_AUDIT_VIEW')) {
        return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
      }
      if (hasPermission('INTERN_VIEW_ALL') || hasPermission('PROGRAM_MANAGE') || hasPermission('PROGRAM_VIEW')) {
        return <Navigate to={ROUTES.HR.DASHBOARD} replace />;
      }
      if (hasPermission('INTERN_VIEW_OWN')) {
        return <Navigate to={ROUTES.MENTOR.DASHBOARD} replace />;
      }
      if (hasPermission('INTERN_VIEW_OWN_PROFILE')) {
        return <Navigate to={ROUTES.INTERN.DASHBOARD} replace />;
      }
      return <Navigate to={ROUTES.PROFILE} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
