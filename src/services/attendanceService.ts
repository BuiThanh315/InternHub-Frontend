import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
  TodayAttendanceResponse,
  CheckInRequest,
  CheckInInitiateRequest,
  CheckInQrResponse,
  CheckInConfirmRequest,
  CheckOutRequest,
  QuickCheckOutRequest,
  AttendanceRecordResponse,
  MonthlyAttendanceSummaryResponse,
  AttendanceReportFilterParams,
  AttendanceSummaryKpiResponse,
  InternDiligenceReportResponse,
  InternAttendanceDetailReportResponse,
  ApiResponse,
  PageResponse,
} from '../types';

/**
 * Tiện ích tải file Blob an toàn trên trình duyệt (chống rò rỉ bộ nhớ)
 */
export function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.URL.revokeObjectURL(url);
}

/**
 * Tính khoảng cách giữa hai toạ độ GPS (theo mét) sử dụng công thức Haversine
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Bán kính Trái Đất (mét)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100; // Làm tròn 2 chữ số thập phân
}

export const attendanceService = {
  /**
   * Lấy trạng thái chấm công của TTS trong ngày hôm nay
   */
  async getTodayAttendance(signal?: AbortSignal): Promise<TodayAttendanceResponse> {
    const response = await apiClient.get<ApiResponse<TodayAttendanceResponse>>(
      API_ENDPOINTS.ATTENDANCE.TODAY,
      { signal }
    );
    return response.data.data;
  },

  /**
   * Khởi tạo Check-in & nhận mã QR xác thực phiên (hiệu lực 60s)
   */
  async initiateCheckIn(
    data: CheckInInitiateRequest,
    signal?: AbortSignal
  ): Promise<CheckInQrResponse> {
    const response = await apiClient.post<ApiResponse<CheckInQrResponse>>(
      API_ENDPOINTS.ATTENDANCE.CHECK_IN_INITIATE,
      data,
      { signal }
    );
    return response.data.data;
  },

  /**
   * Xác nhận Check-in bằng qrToken và ghi chú (2-step check-in)
   */
  async confirmCheckIn(
    data: CheckInConfirmRequest,
    signal?: AbortSignal
  ): Promise<AttendanceRecordResponse> {
    const response = await apiClient.post<ApiResponse<AttendanceRecordResponse>>(
      API_ENDPOINTS.ATTENDANCE.CHECK_IN_CONFIRM,
      data,
      { signal }
    );
    return response.data.data;
  },

  /**
   * Thực hiện Check-in vào ca làm việc (phương thức trực tiếp)
   */
  async checkIn(
    data: CheckInRequest,
    signal?: AbortSignal
  ): Promise<AttendanceRecordResponse> {
    const response = await apiClient.post<ApiResponse<AttendanceRecordResponse>>(
      API_ENDPOINTS.ATTENDANCE.CHECK_IN,
      data,
      { signal }
    );
    return response.data.data;
  },

  /**
   * Thực hiện Check-out tan ca làm việc (phương thức chuẩn qua quét QR hoặc toạ độ)
   */
  async checkOut(
    data: CheckOutRequest,
    signal?: AbortSignal
  ): Promise<AttendanceRecordResponse> {
    const response = await apiClient.post<ApiResponse<AttendanceRecordResponse>>(
      API_ENDPOINTS.ATTENDANCE.CHECK_OUT,
      data,
      { signal }
    );
    return response.data.data;
  },

  /**
   * Thực hiện Check-out tan ca nhanh 1-chạm (Mobile Quick Check-out khi thỏa mãn Trust Level)
   */
  async quickCheckOut(
    data: QuickCheckOutRequest,
    signal?: AbortSignal
  ): Promise<AttendanceRecordResponse> {
    const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE.CHECK_OUT_QUICK, data, {
      signal,
    });
    return response.data.data;
  },

  /**
   * Lấy lịch sử chấm công cá nhân theo tháng và năm
   */
  async getMyAttendanceHistory(
    params?: { month?: number; year?: number },
    signal?: AbortSignal
  ): Promise<MonthlyAttendanceSummaryResponse> {
    const response = await apiClient.get<ApiResponse<MonthlyAttendanceSummaryResponse>>(
      API_ENDPOINTS.ATTENDANCE.MY_HISTORY,
      { params, signal }
    );
    return response.data.data;
  },

  // ==========================================
  // Phân hệ Báo cáo chuyên cần HR (TM-26)
  // ==========================================

  /**
   * Lấy Dashboard KPI tổng quan toàn công ty về chuyên cần (TM-26)
   */
  async getAttendanceSummaryKpi(
    filter?: AttendanceReportFilterParams,
    signal?: AbortSignal
  ): Promise<AttendanceSummaryKpiResponse> {
    const response = await apiClient.get<ApiResponse<AttendanceSummaryKpiResponse>>(
      API_ENDPOINTS.ATTENDANCE.REPORTS.SUMMARY,
      { params: filter, signal }
    );
    return response.data.data;
  },

  /**
   * Lấy danh sách bảng tổng hợp chuyên cần của các TTS (phân trang 0-indexed - TM-26)
   */
  async getInternDiligenceReports(
    filter?: AttendanceReportFilterParams,
    signal?: AbortSignal
  ): Promise<PageResponse<InternDiligenceReportResponse>> {
    const response = await apiClient.get<ApiResponse<PageResponse<InternDiligenceReportResponse>>>(
      API_ENDPOINTS.ATTENDANCE.REPORTS.INTERNS,
      { params: filter, signal }
    );
    return response.data.data;
  },

  /**
   * Lấy chi tiết bảng công và các ngày nghỉ phép của 1 TTS trong tháng (TM-26)
   */
  async getInternAttendanceDetailReport(
    internId: number,
    month?: number,
    year?: number,
    signal?: AbortSignal
  ): Promise<InternAttendanceDetailReportResponse> {
    const response = await apiClient.get<ApiResponse<InternAttendanceDetailReportResponse>>(
      API_ENDPOINTS.ATTENDANCE.REPORTS.INTERN_DETAILS(internId),
      { params: { month, year }, signal }
    );
    return response.data.data;
  },

  /**
   * Xuất báo cáo chuyên cần ra file CSV UTF-8 BOM chuẩn tiếng Việt (TM-26)
   */
  async exportAttendanceReportCsv(
    filter?: AttendanceReportFilterParams,
    signal?: AbortSignal
  ): Promise<Blob> {
    const response = await apiClient.get(
      API_ENDPOINTS.ATTENDANCE.REPORTS.EXPORT,
      {
        params: filter,
        responseType: 'blob',
        signal,
      }
    );
    return response.data;
  },
};

