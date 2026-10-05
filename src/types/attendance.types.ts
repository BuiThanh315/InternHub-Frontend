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
