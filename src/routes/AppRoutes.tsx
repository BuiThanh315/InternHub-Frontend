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
import { LandingPage } from '../pages/public/LandingPage';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants/routes';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, role } = useAuth();

  const getDashboardRedirect = () => {
    switch (role) {
      case 'ADMIN':
        return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
      case 'HR':
        return <Navigate to={ROUTES.HR.DASHBOARD} replace />;
      case 'MENTOR':
        return <Navigate to={ROUTES.MENTOR.DASHBOARD} replace />;
      case 'INTERN':
      default:
        return <Navigate to={ROUTES.INTERN.DASHBOARD} replace />;
    }
  };

  return (
    <Routes>
      {/* Root route: Nếu đã đăng nhập -> chuyển sang Dashboard tương ứng, nếu chưa -> Landing Page */}
      <Route
        path={ROUTES.ROOT}
        element={isAuthenticated ? getDashboardRedirect() : <LandingPage />}
      />
      <Route path="/apply" element={<LandingPage />} />

      {/* Public Auth Routes */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.AUTH.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.AUTH.REGISTER} element={<RegisterPage />} />
      </Route>

      {/* Authenticated Dashboard Routes */}
      <Route element={<MainLayout />}>
        {/* Admin Area */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard />} />
          <Route path={ROUTES.ADMIN.USERS} element={<AdminDashboard />} />
          <Route path={ROUTES.ADMIN.SYSTEM} element={<AdminDashboard />} />
        </Route>

        {/* HR Area */}
        <Route element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']} />}>
          <Route path={ROUTES.HR.DASHBOARD} element={<HrDashboard />} />
          <Route path={ROUTES.HR.INTERNS} element={<HrDashboard />} />
          <Route path={ROUTES.HR.REVIEW} element={<HrDashboard />} />
        </Route>

        {/* Mentor Area */}
        <Route element={<ProtectedRoute allowedRoles={['MENTOR', 'ADMIN']} />}>
          <Route path={ROUTES.MENTOR.DASHBOARD} element={<MentorDashboard />} />
          <Route path={ROUTES.MENTOR.INTERNS} element={<MentorDashboard />} />
          <Route path={ROUTES.MENTOR.DOCUMENTS} element={<MentorDashboard />} />
        </Route>

        {/* Intern Area */}
        <Route element={<ProtectedRoute allowedRoles={['INTERN', 'ADMIN', 'HR', 'MENTOR']} />}>
          <Route path={ROUTES.INTERN.DASHBOARD} element={<InternDashboard />} />
          <Route path={ROUTES.INTERN.DOCUMENTS} element={<InternDashboard />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={ROUTES.AUTH.LOGIN} replace />} />
    </Routes>
  );
};

export default AppRoutes;
