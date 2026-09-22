import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type { BackupHistoryItem, PageResponse, ApiResponse } from '../types';

export interface BackupFilterParams {
  page?: number;
  size?: number;
  status?: string;
  backupType?: string;
  startDate?: string;
  endDate?: string;
}

export const backupService = {
  /**
   * Lấy danh sách lịch sử sao lưu dữ liệu phân trang và lọc từ Backend REST API (100% Real API)
   */
  async getBackups(
    params: BackupFilterParams = {},
    signal?: AbortSignal
  ): Promise<PageResponse<BackupHistoryItem>> {
    const response = await apiClient.get<ApiResponse<PageResponse<BackupHistoryItem>>>(
      API_ENDPOINTS.SYSTEM.BACKUPS,
      { params, signal }
    );
    if (response.data && response.data.data) {
      const data = response.data.data;
      return {
        content: data.items || data.content || [],
        items: data.items || data.content || [],
        pageNumber: data.currentPage ?? data.pageNumber ?? 0,
        currentPage: data.currentPage ?? data.pageNumber ?? 0,
        pageSize: data.pageSize ?? 10,
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
    throw new Error('Dữ liệu sao lưu trả về không hợp lệ từ máy chủ');
  },

  /**
   * Kích hoạt sao lưu tức thì (On-demand manual backup)
   */
  async triggerManualBackup(signal?: AbortSignal): Promise<BackupHistoryItem> {
    const response = await apiClient.post<ApiResponse<BackupHistoryItem>>(
      API_ENDPOINTS.SYSTEM.BACKUPS,
      {},
      { signal }
    );
    if (response.data && response.data.data) {
      return response.data.data;
    }
    throw new Error('Không thể kích hoạt sao lưu hệ thống trên máy chủ');
  },

  /**
   * Tải tệp sao lưu dữ liệu (.sql.gz)
   */
  async downloadBackup(id: number, fileName: string, signal?: AbortSignal): Promise<void> {
    const response = await apiClient.get(API_ENDPOINTS.SYSTEM.BACKUP_DOWNLOAD(id), {
      responseType: 'blob',
      signal,
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * Xóa bản sao lưu dữ liệu
   */
  async deleteBackup(id: number, signal?: AbortSignal): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.SYSTEM.BACKUP_DELETE(id), { signal });
  },
};

export default backupService;
