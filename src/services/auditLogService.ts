import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
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
  async getAuditLogs(
    params: AuditLogFilterParams = {},
    signal?: AbortSignal
  ): Promise<PageResponse<AuditLogItem>> {
    const response = await apiClient.get<ApiResponse<PageResponse<AuditLogItem>>>(
      API_ENDPOINTS.SYSTEM.AUDIT_LOGS,
      { params, signal }
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
  async getAuditLogById(id: number, signal?: AbortSignal): Promise<AuditLogDetail> {
    const response = await apiClient.get<ApiResponse<AuditLogDetail>>(
      API_ENDPOINTS.SYSTEM.AUDIT_LOG_DETAIL(id),
      { signal }
    );

    if (response.data && response.data.data) {
      return response.data.data;
    }

    throw new Error(`Không thể lấy chi tiết nhật ký với ID: ${id}`);
  },

  /**
   * Lấy số liệu thống kê hoạt động trong ngày hôm nay
   */
  async getAuditStatistics(signal?: AbortSignal): Promise<AuditLogStats> {
    const response = await apiClient.get<ApiResponse<AuditLogStats>>(
      API_ENDPOINTS.SYSTEM.AUDIT_LOG_STATS,
      { signal }
    );

    if (response.data && response.data.data) {
      return response.data.data;
    }

    throw new Error('Không thể lấy dữ liệu thống kê hoạt động từ máy chủ');
  },

  /**
   * Xuất danh sách nhật ký hoạt động ra tệp CSV và tự động tải về
   */
  async exportAuditLogsCsv(params: AuditLogFilterParams = {}, signal?: AbortSignal): Promise<void> {
    const response = await apiClient.get(API_ENDPOINTS.SYSTEM.AUDIT_LOG_EXPORT, {
      params,
      responseType: 'blob',
      signal,
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

export default auditLogService;
