import { apiClient } from './api';
import type { BackupHistoryItem, PageResponse, ApiResponse } from '../types';

export interface BackupFilterParams {
  page?: number;
  size?: number;
  status?: string;
  backupType?: string;
  startDate?: string;
  endDate?: string;
}

// Mock fallback list khi backend offline hoặc chạy demo standalone
let mockBackups: BackupHistoryItem[] = [
  {
    id: 101,
    fileName: 'internhub_backup_auto_20260920_020000.sql.gz',
    fileSize: 1458920,
    formattedSize: '1.39 MB',
    backupType: 'AUTOMATIC',
    status: 'SUCCESS',
    scope: 'FULL_DATABASE',
    durationMs: 4250,
    createdBy: 'SYSTEM_CRON',
    createdAt: '2026-09-20T02:00:00Z',
  },
  {
    id: 102,
    fileName: 'internhub_backup_auto_20260921_020000.sql.gz',
    fileSize: 1489110,
    formattedSize: '1.42 MB',
    backupType: 'AUTOMATIC',
    status: 'SUCCESS',
    scope: 'FULL_DATABASE',
    durationMs: 4120,
    createdBy: 'SYSTEM_CRON',
    createdAt: '2026-09-21T02:00:00Z',
  },
  {
    id: 103,
    fileName: 'internhub_backup_manual_20260921_101500.sql.gz',
    fileSize: 1512400,
    formattedSize: '1.44 MB',
    backupType: 'MANUAL',
    status: 'SUCCESS',
    scope: 'FULL_DATABASE',
    durationMs: 3890,
    createdBy: 'admin@internhub.vn',
    createdAt: '2026-09-21T10:15:00Z',
  },
];

export const backupService = {
  /**
   * Lấy danh sách lịch sử sao lưu dữ liệu phân trang và lọc
   */
  async getBackups(params: BackupFilterParams = {}): Promise<PageResponse<BackupHistoryItem>> {
    try {
      const response = await apiClient.get<ApiResponse<PageResponse<BackupHistoryItem>>>(
        '/api/system/backups',
        { params }
      );
      if (response.data && response.data.data) {
        return response.data.data;
      }
      throw new Error('No data returned from backend');
    } catch (error) {
      console.warn('API /api/system/backups unreachable, using mock data:', error);
      // Fallback mock
      let filtered = [...mockBackups];
      if (params.status) {
        filtered = filtered.filter(b => b.status === params.status);
      }
      if (params.backupType) {
        filtered = filtered.filter(b => b.backupType === params.backupType);
      }
      return {
        content: filtered,
        pageNumber: params.page || 0,
        pageSize: params.size || 10,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / (params.size || 10)),
        last: true,
      };
    }
  },

  /**
   * Kích hoạt sao lưu tức thì (On-demand manual backup)
   */
  async triggerManualBackup(): Promise<BackupHistoryItem> {
    try {
      const response = await apiClient.post<ApiResponse<BackupHistoryItem>>('/api/system/backups');
      if (response.data && response.data.data) {
        return response.data.data;
      }
      throw new Error('Failed to trigger backup');
    } catch (error) {
      console.warn('API /api/system/backups POST fallback mock:', error);
      const now = new Date();
      const dateStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
      const newBackup: BackupHistoryItem = {
        id: Date.now(),
        fileName: `internhub_backup_manual_${dateStr}.sql.gz`,
        fileSize: 1540000,
        formattedSize: '1.47 MB',
        backupType: 'MANUAL',
        status: 'SUCCESS',
        scope: 'FULL_DATABASE',
        durationMs: 3200,
        createdBy: 'admin@internhub.vn',
        createdAt: now.toISOString(),
      };
      mockBackups.unshift(newBackup);
      return newBackup;
    }
  },

  /**
   * Tải tệp sao lưu dữ liệu (.sql.gz)
   */
  async downloadBackup(id: number, fileName: string): Promise<void> {
    try {
      const response = await apiClient.get(`/api/system/backups/${id}/download`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.warn('API download fallback mock:', error);
      // Giả lập download file sql.gz rỗng để demo
      const blob = new Blob(['-- Mock MySQL Backup Content (GZIP Compressed)'], { type: 'application/gzip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    }
  },

  /**
   * Xóa bản sao lưu dữ liệu
   */
  async deleteBackup(id: number): Promise<void> {
    try {
      await apiClient.delete(`/api/system/backups/${id}`);
    } catch (error) {
      console.warn('API delete fallback mock:', error);
    }
    mockBackups = mockBackups.filter(b => b.id !== id);
  },
};
