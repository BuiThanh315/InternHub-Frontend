import React from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { HrDashboard } from '../pages/hr/HrDashboard';
import { HrProgramManagementPage } from '../pages/hr/programs/HrProgramManagementPage';
import { ProgramWorkspacePage } from '../pages/hr/programs/workspace';
import { HrMentorManagementPage } from '../pages/hr/mentors/HrMentorManagementPage';
import { HrContractManagementPage } from '../pages/hr/contracts/HrContractManagementPage';
import { HrEvaluationManagementPage } from '../pages/hr/evaluations/HrEvaluationManagementPage';
import { MentorDashboard } from '../pages/mentor/MentorDashboard';
import { MentorMissionPage } from '../pages/mentor/missions/MentorMissionPage';
import { InternDashboard } from '../pages/intern/InternDashboard';
import { InternDocumentsPage } from '../pages/intern/InternDocumentsPage';
import { InternMissionPage } from '../pages/intern/missions/InternMissionPage';
import { InternWeeklyReportPage } from '../pages/intern/reports';
import { ProfilePage } from '../pages/profile';
import { InternApplyPage } from '../pages/intern/InternApplyPage';
import { InternAttendancePage } from '../pages/intern/InternAttendancePage';
import { InternAttendanceConfirmPage } from '../pages/intern/InternAttendanceConfirmPage';
import { InternLeavePage } from '../pages/intern/leave';
import { MentorLeaveApprovalPage } from '../pages/mentor/leave';
import { InternContractSigningHub } from '../pages/intern/contract/InternContractSigningHub';
import { LandingPage } from '../pages/public/LandingPage';
import { OnboardingActivationPage } from '../pages/public/OnboardingActivationPage';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../constants/routes';

export const AppRoutes: React.FC = () => {
  const { isAuthenticated, isInitializing, role } = useAuth();
  const [searchParams] = useSearchParams();

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

  // Điều hướng Dashboard chuẩn TM-20 dựa trên vai trò trực tiếp (Role-Based)
  const getDashboardRedirect = () => {
    const redirectParam = searchParams.get('redirect');
    if (redirectParam?.startsWith('/') && redirectParam !== '/' && redirectParam !== '/login') {
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
      {/* Root route: Nếu đã đăng nhập -> chuyển sang Dashboard tương ứng theo vai trò, nếu chưa -> Landing Page */}
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

      {/* Chuyển hướng các route auth cũ sang Landing Page (Popup Modal) */}
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
          <Route path={ROUTES.HR.PROGRAM_WORKSPACE} element={<ProgramWorkspacePage />} />
          <Route path={ROUTES.HR.DEPARTMENTS} element={<Navigate to={ROUTES.HR.MENTORS} replace />} />
          <Route path={ROUTES.HR.MENTORS} element={<HrMentorManagementPage />} />
          <Route path={ROUTES.HR.INTERNS} element={<HrDashboard />} />
          <Route path={ROUTES.HR.CONTRACTS} element={<HrContractManagementPage />} />
          <Route path={ROUTES.HR.EVALUATIONS} element={<HrEvaluationManagementPage />} />
          <Route path={ROUTES.HR.REVIEW} element={<HrDashboard />} />
        </Route>

        {/* Mentor Area */}
        <Route element={<ProtectedRoute allowedRoles={['MENTOR', 'HR', 'ADMIN']} />}>
          <Route path={ROUTES.MENTOR.LEAVE_REQUESTS} element={<MentorLeaveApprovalPage />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['MENTOR', 'ADMIN']} />}>
          <Route path={ROUTES.MENTOR.DASHBOARD} element={<MentorDashboard />} />
          <Route path={ROUTES.MENTOR.MISSIONS} element={<MentorMissionPage />} />
          <Route path={ROUTES.MENTOR.INTERNS} element={<MentorDashboard />} />
          <Route path={ROUTES.MENTOR.DOCUMENTS} element={<MentorDashboard />} />
        </Route>

        {/* Intern Dedicated Area */}
        <Route element={<ProtectedRoute allowedRoles={['INTERN', 'USER', 'ADMIN']} />}>
          <Route path={ROUTES.INTERN.DASHBOARD} element={<InternDashboard />} />
          <Route path={ROUTES.INTERN.MISSIONS} element={<InternMissionPage />} />
          <Route path={ROUTES.INTERN.WEEKLY_REPORTS} element={<InternWeeklyReportPage />} />
          <Route path={ROUTES.INTERN.APPLY} element={<InternApplyPage />} />
          <Route path={ROUTES.INTERN.DOCUMENTS} element={<InternDocumentsPage />} />
          <Route path={ROUTES.INTERN.CONTRACT_SIGNING} element={<InternContractSigningHub />} />
          <Route path={ROUTES.INTERN.PROFILE} element={<Navigate to={ROUTES.PROFILE} replace />} />
          <Route path={ROUTES.INTERN.ATTENDANCE} element={<InternAttendancePage />} />
          <Route path={ROUTES.INTERN.LEAVE_REQUESTS} element={<InternLeavePage />} />
        </Route>

        {/* Universal Profile Route */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'HR', 'MENTOR', 'INTERN', 'USER']} />}>
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        </Route>
      </Route>

      {/* Route Xác Nhận Điểm Danh QR Độc Lập - Toàn màn hình */}
      <Route
        path={ROUTES.INTERN.ATTENDANCE_CONFIRM}
        element={<InternAttendanceConfirmPage />}
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to={ROUTES.ROOT} replace />} />
    </Routes>
  );
};

export default AppRoutes;
