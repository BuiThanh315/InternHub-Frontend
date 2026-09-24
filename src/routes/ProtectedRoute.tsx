import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { RoleType } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: RoleType[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, role } = useAuth();

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
