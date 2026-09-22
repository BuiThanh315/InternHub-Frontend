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

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root route: Luôn là Trang Chủ / Landing Page công khai */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/apply" element={<LandingPage />} />

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
