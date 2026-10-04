import React from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { HrDashboard } from '../pages/hr/HrDashboard';
import { HrProgramManagementPage } from '../pages/hr/programs/HrProgramManagementPage';
import { HrMentorManagementPage } from '../pages/hr/mentors/HrMentorManagementPage';
import { HrContractManagementPage } from '../pages/hr/contracts/HrContractManagementPage';
import { MentorDashboard } from '../pages/mentor/MentorDashboard';
import { MentorMissionPage } from '../pages/mentor/missions/MentorMissionPage';
import { InternDashboard } from '../pages/intern/InternDashboard';
import { InternApplyPage } from '../pages/intern/InternApplyPage';
import { InternDocumentsPage } from '../pages/intern/InternDocumentsPage';
import { InternMissionPage } from '../pages/intern/missions/InternMissionPage';
import { ProfilePage } from '../pages/profile';
import { LandingPage } from '../pages/public/LandingPage';
import { OnboardingActivationPage } from '../pages/public/OnboardingActivationPage';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants/routes';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, role, isInitializing } = useAuth();

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="text-sm text-slate-400">Đang khởi tạo phiên làm việc...</span>
        </div>
      </div>
    );
  }

  const [searchParams] = useSearchParams();

  const getDashboardRedirect = () => {
    const redirectParam = searchParams.get('redirect');
    if (redirectParam?.startsWith('/')) {
      return <Navigate to={redirectParam} replace />;
    }

    switch (role) {
      case 'ADMIN':
        return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
      case 'HR':
        return <Navigate to={ROUTES.HR.DASHBOARD} replace />;
      case 'MENTOR':
        return <Navigate to={ROUTES.MENTOR.DASHBOARD} replace />;
      case 'INTERN':
      case 'USER':
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
      <Route
        path="/apply"
        element={
          isAuthenticated ? (
            <Navigate to={ROUTES.INTERN.APPLY} replace />
          ) : (
            <Navigate to="/?register=true" replace />
          )
        }
      />
      <Route path="/onboarding/activate" element={<OnboardingActivationPage />} />

      {/* Chuyển hướng các route auth cũ sang Landing Page (Popup Modal & Form nộp CV) */}
      <Route path="/login" element={<Navigate to="/?login=true" replace />} />
      <Route path="/register" element={<Navigate to="/?register=true" replace />} />
      <Route path="/activate" element={<Navigate to="/?activate=true" replace />} />

      {/* Authenticated Dashboard Routes */}
      <Route element={<MainLayout />}>
        {/* Admin Area */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard />} />
          <Route path={ROUTES.ADMIN.USERS} element={<AdminDashboard />} />
          <Route path={ROUTES.ADMIN.ROLES} element={<AdminDashboard />} />
          <Route path={ROUTES.ADMIN.SYSTEM} element={<AdminDashboard />} />
        </Route>

        {/* HR Area */}
        <Route element={<ProtectedRoute allowedRoles={['HR', 'ADMIN']} />}>
          <Route path={ROUTES.HR.DASHBOARD} element={<HrDashboard />} />
          <Route path={ROUTES.HR.PROGRAMS} element={<HrProgramManagementPage />} />
          <Route path={ROUTES.HR.MENTORS} element={<HrMentorManagementPage />} />
          <Route path={ROUTES.HR.INTERNS} element={<HrDashboard />} />
          <Route path={ROUTES.HR.CONTRACTS} element={<HrContractManagementPage />} />
          <Route path={ROUTES.HR.REVIEW} element={<HrDashboard />} />
        </Route>

        {/* Mentor Area */}
        <Route element={<ProtectedRoute allowedRoles={['MENTOR', 'ADMIN']} />}>
          <Route path={ROUTES.MENTOR.DASHBOARD} element={<MentorDashboard />} />
          <Route path={ROUTES.MENTOR.MISSIONS} element={<MentorMissionPage />} />
          <Route path={ROUTES.MENTOR.INTERNS} element={<MentorDashboard />} />
          <Route path={ROUTES.MENTOR.DOCUMENTS} element={<MentorDashboard />} />
        </Route>

        {/* Universal Profile Route (Dành cho tất cả các Role) */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MENTOR', 'INTERN', 'USER']} />}>
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        </Route>

        {/* Intern Dedicated Area (Khu vực độc lập cho Thực Tập Sinh) */}
        <Route element={<ProtectedRoute allowedRoles={['INTERN', 'USER', 'ADMIN']} />}>
          <Route path={ROUTES.INTERN.DASHBOARD} element={<InternDashboard />} />
          <Route path={ROUTES.INTERN.MISSIONS} element={<InternMissionPage />} />
          <Route path={ROUTES.INTERN.APPLY} element={<InternApplyPage />} />
          <Route path={ROUTES.INTERN.DOCUMENTS} element={<InternDocumentsPage />} />
          {/* Chuyển tiếp route xem profile cũ sang Universal Profile mới */}
          <Route path={ROUTES.INTERN.PROFILE} element={<Navigate to={ROUTES.PROFILE} replace />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to={ROUTES.ROOT} replace />} />
    </Routes>
  );
};

export default AppRoutes;
