import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { RoleType } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: RoleType[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, role, isInitializing } = useAuth();

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
    return <Navigate to="/?login=true" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Chuyển hướng về dashboard hợp lệ của role hiện tại
    switch (role) {
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      case 'HR':
        return <Navigate to="/hr/dashboard" replace />;
      case 'MENTOR':
        return <Navigate to="/mentor/dashboard" replace />;
      case 'INTERN':
      default:
        return <Navigate to="/intern/dashboard" replace />;
    }
  }

  return <Outlet />;
};
