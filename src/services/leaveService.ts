import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
  CreateLeaveRequest,
  ApproveLeaveRequest,
  RejectLeaveRequest,
  LeaveRequestResponse,
  LeaveRequestSummaryResponse,
  LeaveRequestFilterParams,
  LeaveDurationType,
  PageResponse,
} from '../types';

/**
 * Tính số ngày làm việc thực tế giữa hai ngày (loại trừ Thứ Bảy và Chủ Nhật).
 * Hỗ trợ xem trước (Live Preview) số ngày công dự kiến nghỉ của Thực tập sinh.
 */
export function calculateWorkingDays(
  startDateStr?: string,
  endDateStr?: string,
  durationType?: LeaveDurationType
): number {
  if (!startDateStr || !endDateStr) return 0;

  if (durationType === 'MORNING' || durationType === 'AFTERNOON') {
    return 0.5;
  }

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return 0;
  }

  let workingDays = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay(); // 0: Sunday, 6: Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays += 1.0;
    }
    current.setDate(current.getDate() + 1);
  }

  return workingDays;
}

export const leaveService = {
  /**
   * Thực tập sinh nộp đơn xin nghỉ phép mới (POST /api/v1/leave-requests)
   */
  async createLeaveRequest(
    data: CreateLeaveRequest,
    signal?: AbortSignal
  ): Promise<LeaveRequestResponse> {
    const response = await apiClient.post(API_ENDPOINTS.LEAVE.BASE, data, {
      signal,
    });
    return response.data.data;
  },

  /**
   * Thực tập sinh lấy lịch sử đơn xin nghỉ phép của bản thân (GET /api/v1/leave-requests/my-requests)
   */
  async getMyLeaveRequests(
    params?: LeaveRequestFilterParams,
    signal?: AbortSignal
  ): Promise<PageResponse<LeaveRequestSummaryResponse>> {
    const response = await apiClient.get(API_ENDPOINTS.LEAVE.MY_REQUESTS, {
      params,
      signal,
    });
    return response.data.data;
  },

  /**
   * Thực tập sinh chủ động hủy đơn khi còn PENDING (PATCH /api/v1/leave-requests/{id}/cancel)
   */
  async cancelLeaveRequest(
    id: number | string,
    signal?: AbortSignal
  ): Promise<LeaveRequestResponse> {
    const response = await apiClient.patch(
      API_ENDPOINTS.LEAVE.CANCEL(id),
      {},
      { signal }
    );
    return response.data.data;
  },

  /**
   * Xem chi tiết một đơn xin nghỉ phép cụ thể (GET /api/v1/leave-requests/{id})
   */
  async getLeaveRequestDetail(
    id: number | string,
    signal?: AbortSignal
  ): Promise<LeaveRequestResponse> {
    const response = await apiClient.get(API_ENDPOINTS.LEAVE.DETAIL(id), {
      signal,
    });
    return response.data.data;
  },

  /**
   * Mentor / HR lấy danh sách đơn xin nghỉ phép chờ xét duyệt (GET /api/v1/leave-requests/pending)
   */
  async getPendingRequests(
    page: number = 0,
    size: number = 10,
    signal?: AbortSignal
  ): Promise<PageResponse<LeaveRequestSummaryResponse>> {
    const response = await apiClient.get(API_ENDPOINTS.LEAVE.PENDING, {
      params: { page, size },
      signal,
    });
    return response.data.data;
  },

  /**
   * Mentor / HR phê duyệt đơn xin nghỉ phép (PATCH /api/v1/leave-requests/{id}/approve)
   */
  async approveLeaveRequest(
    id: number | string,
    data?: ApproveLeaveRequest,
    signal?: AbortSignal
  ): Promise<LeaveRequestResponse> {
    const response = await apiClient.patch(
      API_ENDPOINTS.LEAVE.APPROVE(id),
      data || {},
      { signal }
    );
    return response.data.data;
  },

  /**
   * Mentor / HR từ chối đơn xin nghỉ phép (PATCH /api/v1/leave-requests/{id}/reject)
   */
  async rejectLeaveRequest(
    id: number | string,
    data: RejectLeaveRequest,
    signal?: AbortSignal
  ): Promise<LeaveRequestResponse> {
    const response = await apiClient.patch(
      API_ENDPOINTS.LEAVE.REJECT(id),
      data,
      { signal }
    );
    return response.data.data;
  },
};
