import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
  TodayAttendanceResponse,
  CheckInRequest,
  CheckInInitiateRequest,
  CheckInQrResponse,
  CheckInConfirmRequest,
  CheckOutRequest,
  AttendanceRecordResponse,
  MonthlyAttendanceSummaryResponse,
} from '../types';

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
    const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE.TODAY, {
      signal,
    });
    return response.data.data;
  },

  /**
   * Khởi tạo Check-in & nhận mã QR xác thực phiên (hiệu lực 60s)
   */
  async initiateCheckIn(
    data: CheckInInitiateRequest,
    signal?: AbortSignal
  ): Promise<CheckInQrResponse> {
    const response = await apiClient.post(
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
    const response = await apiClient.post(
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
    const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE.CHECK_IN, data, {
      signal,
    });
    return response.data.data;
  },

  /**
   * Thực hiện Check-out tan ca làm việc
   */
  async checkOut(
    data: CheckOutRequest,
    signal?: AbortSignal
  ): Promise<AttendanceRecordResponse> {
    const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE.CHECK_OUT, data, {
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
    const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE.MY_HISTORY, {
      params,
      signal,
    });
    return response.data.data;
  },
};
