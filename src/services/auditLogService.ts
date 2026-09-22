import { apiClient } from './api';
import type {
  AuditLogItem,
  AuditLogDetail,
  AuditLogStats,
  AuditLogFilterParams,
  PageResponse,
  ApiResponse,
} from '../types';

export const auditLogService = {
  /**
   * Truy vấn danh sách nhật ký hoạt động có phân trang và bộ lọc đa tiêu chí
   * Gọi trực tiếp Backend REST API (KHÔNG sử dụng Mock API)
   */
  async getAuditLogs(params: AuditLogFilterParams = {}): Promise<PageResponse<AuditLogItem>> {
    const response = await apiClient.get<ApiResponse<PageResponse<AuditLogItem>>>(
      '/api/system/audit-logs',
      { params }
    );

    if (response.data && response.data.data) {
      const data = response.data.data;
      return {
        content: data.items || data.content || [],
        items: data.items || data.content || [],
        pageNumber: data.currentPage ?? data.pageNumber ?? 0,
        currentPage: data.currentPage ?? data.pageNumber ?? 0,
        pageSize: data.pageSize ?? 20,
        totalElements: data.totalItems ?? data.totalElements ?? 0,
        totalItems: data.totalItems ?? data.totalElements ?? 0,
        totalPages: data.totalPages ?? 1,
        last: data.isLast ?? data.last ?? true,
        isLast: data.isLast ?? data.last ?? true,
        isFirst: data.isFirst ?? true,
        hasNext: data.hasNext ?? false,
        hasPrevious: data.hasPrevious ?? false,
      };
    }

    throw new Error('Dữ liệu nhật ký trả về không hợp lệ từ máy chủ');
  },

  /**
   * Lấy thông tin chi tiết một bản ghi nhật ký hoạt động kèm Request Payload
   */
  async getAuditLogById(id: number): Promise<AuditLogDetail> {
    const response = await apiClient.get<ApiResponse<AuditLogDetail>>(
      `/api/system/audit-logs/${id}`
    );

    if (response.data && response.data.data) {
      return response.data.data;
    }

    throw new Error(`Không thể lấy chi tiết nhật ký với ID: ${id}`);
  },

  /**
   * Lấy số liệu thống kê hoạt động trong ngày hôm nay
   */
  async getAuditStatistics(): Promise<AuditLogStats> {
    const response = await apiClient.get<ApiResponse<AuditLogStats>>(
      '/api/system/audit-logs/statistics'
    );

    if (response.data && response.data.data) {
      return response.data.data;
    }

    throw new Error('Không thể lấy dữ liệu thống kê hoạt động từ máy chủ');
  },

  /**
   * Xuất danh sách nhật ký hoạt động ra tệp CSV và tự động tải về
   */
  async exportAuditLogsCsv(params: AuditLogFilterParams = {}): Promise<void> {
    const response = await apiClient.get('/api/system/audit-logs/export', {
      params,
      responseType: 'blob',
    });

    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;

    const now = new Date();
    const dateStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
    link.setAttribute('download', `audit_logs_${dateStr}.csv`);

    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
