import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES, getValidatedRedirectRoute } from '../constants/routes';

// Lỗi 32 [P2] (PERF-02): Code Splitting & Lazy Loading các trang quản trị, dashboard và module nặng
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AiSettingsPage = lazy(() => import('../pages/admin/AiSettingsPage').then(m => ({ default: m.AiSettingsPage })));
const HrDashboard = lazy(() => import('../pages/hr/HrDashboard').then(m => ({ default: m.HrDashboard })));
const HrProgramManagementPage = lazy(() => import('../pages/hr/programs/HrProgramManagementPage').then(m => ({ default: m.HrProgramManagementPage })));
const ProgramWorkspacePage = lazy(() => import('../pages/hr/programs/workspace').then(m => ({ default: m.ProgramWorkspacePage })));
const HrMentorManagementPage = lazy(() => import('../pages/hr/mentors/HrMentorManagementPage').then(m => ({ default: m.HrMentorManagementPage })));
const HrContractManagementPage = lazy(() => import('../pages/hr/contracts/HrContractManagementPage').then(m => ({ default: m.HrContractManagementPage })));
const HrEvaluationManagementPage = lazy(() => import('../pages/hr/evaluations/HrEvaluationManagementPage').then(m => ({ default: m.HrEvaluationManagementPage })));
const HRAttendanceReportPage = lazy(() => import('../pages/hr/attendance-reports').then(m => ({ default: m.HRAttendanceReportPage })));
const HrAllowancePage = lazy(() => import('../pages/hr/allowance/HrAllowancePage').then(m => ({ default: m.HrAllowancePage })));
const HrSupportRequestsPage = lazy(() => import('../pages/hr/support/HrSupportRequestsPage').then(m => ({ default: m.HrSupportRequestsPage })));
const MentorDashboard = lazy(() => import('../pages/mentor/MentorDashboard').then(m => ({ default: m.MentorDashboard })));
const MentorMissionPage = lazy(() => import('../pages/mentor/missions/MentorMissionPage').then(m => ({ default: m.MentorMissionPage })));
const InternDashboard = lazy(() => import('../pages/intern/InternDashboard').then(m => ({ default: m.InternDashboard })));
const InternDocumentsPage = lazy(() => import('../pages/intern/InternDocumentsPage').then(m => ({ default: m.InternDocumentsPage })));
const InternMissionPage = lazy(() => import('../pages/intern/missions/InternMissionPage').then(m => ({ default: m.InternMissionPage })));
const InternWeeklyReportPage = lazy(() => import('../pages/intern/reports').then(m => ({ default: m.InternWeeklyReportPage })));
const InternAllowanceHistoryPage = lazy(() => import('../pages/intern/allowance/InternAllowanceHistoryPage').then(m => ({ default: m.InternAllowanceHistoryPage })));
const InternSupportRequestPage = lazy(() => import('../pages/intern/support/InternSupportRequestPage').then(m => ({ default: m.InternSupportRequestPage })));
const ProfilePage = lazy(() => import('../pages/profile').then(m => ({ default: m.ProfilePage })));
const InternApplyPage = lazy(() => import('../pages/intern/InternApplyPage').then(m => ({ default: m.InternApplyPage })));
const InternAttendancePage = lazy(() => import('../pages/intern/InternAttendancePage').then(m => ({ default: m.InternAttendancePage })));
const InternAttendanceConfirmPage = lazy(() => import('../pages/intern/InternAttendanceConfirmPage').then(m => ({ default: m.InternAttendanceConfirmPage })));
const InternLeavePage = lazy(() => import('../pages/intern/leave').then(m => ({ default: m.InternLeavePage })));
const MentorLeaveApprovalPage = lazy(() => import('../pages/mentor/leave').then(m => ({ default: m.MentorLeaveApprovalPage })));
const InternContractSigningHub = lazy(() => import('../pages/intern/contract/InternContractSigningHub').then(m => ({ default: m.InternContractSigningHub })));
const InternQuizListPage = lazy(() => import('../pages/intern/quiz').then(m => ({ default: m.InternQuizListPage })));
const InternQuizTakingPage = lazy(() => import('../pages/intern/quiz').then(m => ({ default: m.InternQuizTakingPage })));
const InternQuizResultPage = lazy(() => import('../pages/intern/quiz').then(m => ({ default: m.InternQuizResultPage })));
const LandingPage = lazy(() => import('../pages/public/LandingPage').then(m => ({ default: m.LandingPage })));
const OnboardingActivationPage = lazy(() => import('../pages/public/OnboardingActivationPage').then(m => ({ default: m.OnboardingActivationPage })));
const CandidateInterviewVerifyPage = lazy(() => import('../pages/public/CandidateInterviewVerifyPage').then(m => ({ default: m.CandidateInterviewVerifyPage })));
const CandidateInterviewRoomPage = lazy(() => import('../pages/public/CandidateInterviewRoomPage').then(m => ({ default: m.CandidateInterviewRoomPage })));
const CandidateInterviewCompletionPage = lazy(() => import('../pages/public/CandidateInterviewCompletionPage').then(m => ({ default: m.CandidateInterviewCompletionPage })));

const SuspenseLoading: React.FC = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs text-slate-400">Đang tải trang...</span>
    </div>
  </div>
);

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
    const targetRoute = getValidatedRedirectRoute(role, redirectParam);
    return <Navigate to={targetRoute} replace />;
  };

  return (
    <Suspense fallback={<SuspenseLoading />}>
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
        {/* Module AI-01: Candidate Interview Verification, Room & Completion */}
        <Route path="/interview/verify" element={<CandidateInterviewVerifyPage />} />
        <Route path="/interview/room/:sessionId" element={<CandidateInterviewRoomPage />} />
        <Route path="/interview/complete/:sessionId" element={<CandidateInterviewCompletionPage />} />

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
            <Route path={ROUTES.ADMIN.AI_SETTINGS} element={<AiSettingsPage />} />
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
            <Route path={ROUTES.HR.ALLOWANCES} element={<HrAllowancePage />} />
            <Route path={ROUTES.HR.SUPPORT_REQUESTS} element={<HrSupportRequestsPage />} />
            <Route path={ROUTES.HR.REVIEW} element={<HrDashboard />} />
          </Route>

          {/* Attendance Reports - Phân hệ chuyên cần cho HR, ADMIN và MENTOR (TM-26) */}
          <Route element={<ProtectedRoute allowedRoles={['HR', 'ADMIN', 'MENTOR']} />}>
            <Route path={ROUTES.HR.ATTENDANCE_REPORTS} element={<HRAttendanceReportPage />} />
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
            <Route path={ROUTES.INTERN.ALLOWANCES} element={<InternAllowanceHistoryPage />} />
            <Route path={ROUTES.INTERN.SUPPORT_REQUESTS} element={<InternSupportRequestPage />} />
            <Route path={ROUTES.INTERN.PROFILE} element={<Navigate to={ROUTES.PROFILE} replace />} />
            <Route path={ROUTES.INTERN.ATTENDANCE} element={<InternAttendancePage />} />
            <Route path={ROUTES.INTERN.LEAVE_REQUESTS} element={<InternLeavePage />} />
            <Route path={ROUTES.INTERN.QUIZZES} element={<InternQuizListPage />} />
            <Route path="/intern/quizzes/submissions/:submissionId" element={<InternQuizResultPage />} />
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

        {/* Route Phòng Thi Focus Exam Room - Toàn màn hình độc lập */}
        <Route element={<ProtectedRoute allowedRoles={['INTERN', 'USER', 'ADMIN']} />}>
          <Route
            path="/intern/quizzes/:assignmentId/take"
            element={<InternQuizTakingPage />}
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to={ROUTES.ROOT} replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
