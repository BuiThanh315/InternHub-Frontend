import { apiClient } from './api';
import type { ApiResponse } from '../types/common.types';

export interface AllowanceRecord {
  id: number;
  internUserId: number;
  internProfileId?: number;
  internFullName?: string;
  internEmail?: string;
  contractId?: number;
  contractNumber?: string;
  contractStatus?: string;
  periodMonth: string; // YYYY-MM
  standardWorkingDays: number;
  actualWorkingDays: number;
  paidLeaveDays?: number;
  autoCalculatedDays?: number;
  autoCalculatedAmount?: number;
  baseAllowance?: number;
  calculationType?: string;
  bonusAmount?: number;
  deductionAmount?: number;
  retroAdjustmentAmount?: number;
  retroRefPeriodMonth?: string;
  retroReason?: string;
  actualAmount?: number;
  status: 'DRAFT' | 'APPROVED' | 'PAID';
  isManuallyAdjusted?: boolean;
  isLocked?: boolean;
  paymentDate?: string;
  notes?: string;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdjustAllowanceRequest {
  actualWorkingDays: number;
  paidLeaveDays: number;
  bonusAmount: number;
  deductionAmount: number;
  adjustmentReason: string;
  notes?: string;
}

export interface BatchApproveAllowanceRequest {
  recordIds: number[];
  note?: string;
}

export interface BatchApproveResult {
  totalRequested: number;
  successCount: number;
  failedCount: number;
  successIds: number[];
  failures: Array<{
    recordId: number;
    reason: string;
  }>;
}

export interface UnlockPeriodRequest {
  reason: string;
}

export interface RetroAdjustmentRequest {
  internUserId: number;
  targetPeriodMonth: string; // YYYY-MM
  retroAdjustmentAmount: number;
  retroReason: string;
}

export interface AllowanceAuditLog {
  id: number;
  recordId: number;
  action: string;
  actorUsername: string;
  oldStatus?: string;
  newStatus?: string;
  oldNetAmount?: number;
  newNetAmount?: number;
  reason?: string;
  createdAt: string;
}

export const allowanceService = {
  // Tính toán preview bảng phụ cấp cho cả tháng
  calculateMonthly: async (month: string): Promise<AllowanceRecord[]> => {
    const res = await apiClient.post<ApiResponse<AllowanceRecord[]>>(`/api/v1/allowances/calculate-preview?month=${month}`);
    return res.data?.data || [];
  },

  // Lưu hàng loạt bản ghi DRAFT
  batchSave: async (month: string): Promise<AllowanceRecord[]> => {
    const res = await apiClient.post<ApiResponse<AllowanceRecord[]>>(`/api/v1/allowances/batch-save?month=${month}`);
    return res.data?.data || [];
  },

  // Lấy danh sách phụ cấp theo tháng hoặc trạng thái (HR)
  getRecords: async (params?: { month?: string; status?: string }): Promise<AllowanceRecord[]> => {
    const res = await apiClient.get<ApiResponse<AllowanceRecord[]>>('/api/v1/allowances', { params });
    return res.data?.data || [];
  },

  // TTS xem lịch sử phụ cấp của chính mình
  getMyHistory: async (): Promise<AllowanceRecord[]> => {
    const res = await apiClient.get<ApiResponse<AllowanceRecord[]>>('/api/v1/allowances/my-history');
    return res.data?.data || [];
  },

  // HR điều chỉnh thưởng/phạt/ghi chú
  adjustRecord: async (id: number, data: AdjustAllowanceRequest): Promise<AllowanceRecord> => {
    const res = await apiClient.put<ApiResponse<AllowanceRecord>>(`/api/v1/allowances/${id}/adjust`, data);
    return res.data?.data;
  },

  // HR Manager / Admin duyệt hàng loạt (Maker-Checker & Partial Failure tolerant)
  batchApprove: async (data: BatchApproveAllowanceRequest): Promise<BatchApproveResult> => {
    const res = await apiClient.patch<ApiResponse<BatchApproveResult>>('/api/v1/allowances/batch-approve', data);
    return res.data?.data;
  },

  // HR Manager / Admin mở khóa kỳ APPROVED quay về DRAFT (bắt buộc lý do)
  unlockPeriod: async (month: string, data: UnlockPeriodRequest): Promise<void> => {
    await apiClient.patch(`/api/v1/allowances/period/${month}/unlock`, data);
  },

  // HR tạo khoản điều chỉnh hồi tố (truy lĩnh / truy thu) cho kỳ đã PAID
  createRetroAdjustment: async (data: RetroAdjustmentRequest): Promise<AllowanceRecord> => {
    const res = await apiClient.post<ApiResponse<AllowanceRecord>>('/api/v1/allowances/retro-adjustment', data);
    return res.data?.data;
  },

  // Xem Audit Log vết chỉnh sửa / duyệt của một bản ghi
  getAuditLogs: async (id: number): Promise<AllowanceAuditLog[]> => {
    const res = await apiClient.get<ApiResponse<AllowanceAuditLog[]>>(`/api/v1/allowances/${id}/audit-logs`);
    return res.data?.data || [];
  },

  // Xuất bảng phụ cấp Excel (Blob stream)
  exportExcel: async (month: string): Promise<Blob> => {
    const res = await apiClient.get(`/api/v1/allowances/export?month=${month}`, {
      responseType: 'blob',
    });
    return res.data;
  },
};
