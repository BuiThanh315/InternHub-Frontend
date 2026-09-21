import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { HrDashboard } from '../pages/hr/HrDashboard';
import { MentorDashboard } from '../pages/mentor/MentorDashboard';
import { InternDashboard } from '../pages/intern/InternDashboard';
import { useAuth } from '../contexts/AuthContext';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  const getDefaultRedirect = () => {
    if (!isAuthenticated) return <Navigate to="/login" replace />;
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
  };

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={getDefaultRedirect()} />

      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Authenticated Dashboard Routes */}
      <Route element={<MainLayout />}>
        {/* Admin Area */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminDashboard />} />
          <Route path="/admin/system" element={<AdminDashboard />} />
        </Route>

        {/* HR Area */}
        <Route element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']} />}>
          <Route path="/hr/dashboard" element={<HrDashboard />} />
          <Route path="/hr/interns" element={<HrDashboard />} />
          <Route path="/hr/review" element={<HrDashboard />} />
        </Route>

        {/* Mentor Area */}
        <Route element={<ProtectedRoute allowedRoles={['MENTOR', 'ADMIN']} />}>
          <Route path="/mentor/dashboard" element={<MentorDashboard />} />
          <Route path="/mentor/interns" element={<MentorDashboard />} />
          <Route path="/mentor/documents" element={<MentorDashboard />} />
        </Route>

        {/* Intern Area */}
        <Route element={<ProtectedRoute allowedRoles={['INTERN', 'ADMIN', 'HR', 'MENTOR']} />}>
          <Route path="/intern/dashboard" element={<InternDashboard />} />
          <Route path="/intern/documents" element={<InternDashboard />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
