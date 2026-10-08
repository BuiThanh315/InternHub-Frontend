import type { LeaveType, LeaveDurationType } from './leave.types';

export type AttendanceStatus =
  | 'ON_TIME'
  | 'LATE'
  | 'EARLY_LEAVE'
  | 'LATE_AND_EARLY_LEAVE'
  | 'ABSENT';

export interface TodayAttendanceResponse {
  workDate: string;
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  checkInTime: string | null;
  checkOutTime: string | null;
  totalWorkingHours: number | null;
  status: AttendanceStatus | null;
  officeName: string;
  allowedRadiusMeters: number;
  officeLatitude?: number;
  officeLongitude?: number;
}

export interface CheckInRequest {
  latitude: number;
  longitude: number;
  notes?: string;
}

export interface CheckInInitiateRequest {
  latitude: number;
  longitude: number;
  clientBaseUrl?: string;
}

export interface CheckInQrResponse {
  qrToken: string;
  qrCodeDataUrl: string;
  confirmationUrl?: string;
  expiresInSeconds: number;
  expiresAt: string;
  distance: number;
  officeName: string;
  message?: string;
}

export interface CheckInConfirmRequest {
  qrToken: string;
  notes?: string;
}

export interface CheckOutRequest {
  latitude: number;
  longitude: number;
  notes?: string;
}

export interface AttendanceRecordResponse {
  id: number;
  internId?: number;
  workDate: string;
  checkInTime: string;
  checkOutTime: string | null;
  checkInDistance?: number;
  checkOutDistance?: number;
  totalWorkingHours: number | null;
  status: AttendanceStatus;
  distanceMeters?: number;
  notes?: string;
}

export interface MonthlyAttendanceSummaryResponse {
  month: number;
  year: number;
  totalWorkingDays: number;
  onTimeDays: number;
  presentDays?: number;
  lateDays: number;
  earlyLeaveDays: number;
  totalWorkingHours: number;
  attendances: AttendanceRecordResponse[];
}

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface GeolocationState {
  coords: GeolocationCoordinates | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
}

// ==========================================
// TM-26: Work Attendance & Leave Report Types
// ==========================================

export type DiligenceStatus =
  | 'EXCELLENT'  // Xuất sắc (Chuyên cần >= 95%, 0 muộn, 0 vắng K.phép)
  | 'GOOD'       // Tốt (Chuyên cần >= 85%, muộn <= 2, 0 vắng K.phép)
  | 'WARNING'    // Cảnh báo (70% <= Chuyên cần < 85%, hoặc muộn 3-5 lần, hoặc vắng 1 ngày)
  | 'CRITICAL';  // Báo động (Chuyên cần < 70%, hoặc muộn > 5 lần, hoặc vắng >= 2 ngày)

export type DailyDayStatus =
  | 'PRESENT_ON_TIME'              // Đi làm đúng giờ
  | 'PRESENT_LATE'                 // Đi làm muộn
  | 'PRESENT_EARLY_LEAVE'          // Về sớm
  | 'PRESENT_LATE_AND_EARLY_LEAVE' // Vừa đi muộn vừa về sớm
  | 'LEAVE_APPROVED'               // Nghỉ phép có duyệt
  | 'LEAVE_PENDING'                // Đơn xin nghỉ chờ duyệt
  | 'ABSENT_UNEXCUSED'             // Vắng mặt không phép
  | 'WEEKEND'                      // Ngày nghỉ cuối tuần
  | 'NOT_ENROLLED'                 // Chưa onboard / Đã kết thúc
  | 'FUTURE_DAY';                  // Ngày chưa diễn ra

export interface AttendanceReportFilterParams {
  month?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
  departmentId?: number;
  programId?: number;
  mentorId?: number;
  diligenceStatus?: DiligenceStatus | 'ALL';
  keyword?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AttendanceSummaryKpiResponse {
  month: number;
  year: number;
  startDate: string;
  endDate: string;
  totalInterns: number;
  overallDiligenceRate: number;
  totalExpectedWorkDays: number;
  totalActualWorkDays: number;
  totalOnTimeCount: number;
  totalLateCount: number;
  totalEarlyLeaveCount: number;
  totalApprovedLeaveDays: number;
  totalUnexcusedAbsenceDays: number;
  leaveReasonBreakdown: Record<LeaveType, number>;
  statusDistribution: Record<DiligenceStatus, number>;
  criticalInternsCount: number;
}

export interface InternDiligenceReportResponse {
  internId: number;
  internCode: string;
  fullName: string;
  email: string;
  departmentName: string;
  programTitle: string;
  mentorName: string;
  expectedWorkDays: number;
  actualWorkDays: number;
  onTimeCount: number;
  lateCount: number;
  earlyLeaveCount: number;
  totalWorkingHours: number;
  approvedLeaveDays: number;
  unexcusedAbsenceDays: number;
  diligenceRate: number;
  diligenceStatus: DiligenceStatus;
  diligenceStatusTitle: string;
  warningNotes: string;
}

export interface DailyAttendanceDetailItem {
  date: string;
  dayOfWeek: string;
  dayOfWeekVietnamese: string;
  isWeekend: boolean;
  dayStatus: DailyDayStatus;
  dayStatusDescription: string;
  attendance: {
    id: number;
    checkInTime: string | null;
    checkOutTime: string | null;
    totalWorkingHours: number | null;
    checkInDistance: number | null;
    notes: string | null;
  } | null;
  leaveRequest: {
    id: number;
    leaveType: LeaveType;
    leaveTypeDescription: string;
    durationType: LeaveDurationType;
    reason: string;
    approverName: string;
    attachmentUrl: string | null;
  } | null;
}

export interface InternAttendanceDetailReportResponse {
  internId: number;
  internCode: string;
  fullName: string;
  email: string;
  departmentName: string;
  programTitle: string;
  mentorName: string;
  month: number;
  year: number;
  summary: {
    expectedWorkDays: number;
    actualWorkDays: number;
    onTimeCount: number;
    lateCount: number;
    earlyLeaveCount: number;
    totalWorkingHours: number;
    approvedLeaveDays: number;
    unexcusedAbsenceDays: number;
    diligenceRate: number;
    diligenceStatus: DiligenceStatus;
  };
  dailyDetails: DailyAttendanceDetailItem[];
}

