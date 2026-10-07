/**
 * Phân loại lý do xin nghỉ phép (Khớp LeaveType trong Java Spring Boot)
 */
export type LeaveType =
  | 'SICK'           // Nghỉ ốm đau / Khám bệnh
  | 'PERSONAL'       // Nghỉ việc riêng cá nhân
  | 'ACADEMIC_EXAM'  // Nghỉ thi cử / Đồ án tốt nghiệp
  | 'BEREAVEMENT'    // Nghỉ việc gia đình / Tang lễ
  | 'OTHER';         // Lý do chính đáng khác

/**
 * Khung thời gian xin nghỉ phép (Khớp LeaveDurationType trong Java Spring Boot)
 */
export type LeaveDurationType =
  | 'FULL_DAY'       // Cả ngày (08:00 - 17:30)
  | 'MORNING'        // Nửa ngày buổi sáng (08:00 - 12:00)
  | 'AFTERNOON';     // Nửa ngày buổi chiều (13:30 - 17:30)

/**
 * Trạng thái xét duyệt đơn xin nghỉ phép (Khớp LeaveStatus trong Java Spring Boot)
 */
export type LeaveStatus =
  | 'PENDING'        // Chờ xét duyệt
  | 'APPROVED'       // Đã phê duyệt
  | 'REJECTED'       // Bị từ chối
  | 'CANCELLED';     // Đã hủy bỏ

/**
 * Request DTO khi Thực tập sinh nộp đơn mới (POST /api/v1/leave-requests)
 */
export interface CreateLeaveRequest {
  leaveType: LeaveType;
  durationType: LeaveDurationType;
  startDate: string;         // YYYY-MM-DD
  endDate: string;           // YYYY-MM-DD
  reason: string;            // 10 - 500 ký tự
  attachmentUrl?: string;    // Tùy chọn, tối đa 500 ký tự
}

/**
 * Request DTO khi Mentor / HR duyệt đơn (PATCH /api/v1/leave-requests/{id}/approve)
 */
export interface ApproveLeaveRequest {
  approvalNote?: string;     // Tùy chọn, tối đa 500 ký tự
}

/**
 * Request DTO khi Mentor / HR từ chối đơn (PATCH /api/v1/leave-requests/{id}/reject)
 */
export interface RejectLeaveRequest {
  rejectionReason: string;   // Bắt buộc, 5 - 500 ký tự
}

/**
 * Response DTO rút gọn cho danh sách bảng (LeaveRequestSummaryResponse)
 */
export interface LeaveRequestSummaryResponse {
  id: number;
  internId: number;
  internCode: string;
  internName: string;
  leaveType: LeaveType;
  leaveTypeDescription: string;
  durationType: LeaveDurationType;
  durationTypeDescription: string;
  startDate: string;
  endDate: string;
  totalDays: number;         // 0.5, 1.0, 2.0...
  reason: string;
  status: LeaveStatus;
  statusDescription: string;
  approverName?: string | null;
  approvedAt?: string | null;
  createdAt: string;
}

/**
 * Response DTO chi tiết đầy đủ của đơn xin nghỉ phép (LeaveRequestResponse)
 */
export interface LeaveRequestResponse extends LeaveRequestSummaryResponse {
  internEmail?: string;
  internPhone?: string;
  attachmentUrl?: string | null;
  approverId?: number | null;
  rejectionReason?: string | null;
  approvalNote?: string | null;
  cancelledAt?: string | null;
  updatedAt: string;
}

/**
 * Thông số lọc danh sách đơn của Thực tập sinh
 */
export interface LeaveRequestFilterParams {
  status?: LeaveStatus;
  year?: number;
  page?: number;
  size?: number;
}
