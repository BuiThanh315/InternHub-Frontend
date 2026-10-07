import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants/routes';
import type { RoleType } from '../types';

interface ProtectedRouteProps {
  /**
   * Danh sách vai trò được phép truy cập route này (Role-Based Access Control).
   * Ví dụ: ['HR', 'ADMIN'] hoặc ['INTERN', 'USER']
   */
  allowedRoles?: RoleType[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, role, isInitializing } = useAuth();
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

  // 1. Quản trị viên ADMIN luôn sở hữu quyền truy cập toàn hệ thống
  if (role === 'ADMIN') {
    return <Outlet />;
  }

  // 2. Kiểm tra vai trò trực tiếp theo Domain Boundary (Chuẩn TM-20 ổn định)
  if (allowedRoles && allowedRoles.length > 0) {
    if (!role || !allowedRoles.includes(role)) {
      switch (role) {
        case 'HR':
          return <Navigate to={ROUTES.HR.DASHBOARD} replace />;
        case 'MENTOR':
          return <Navigate to={ROUTES.MENTOR.DASHBOARD} replace />;
        case 'INTERN':
        case 'USER':
        default:
          return <Navigate to={ROUTES.INTERN.DASHBOARD} replace />;
      }
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
