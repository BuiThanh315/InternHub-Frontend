import { apiClient } from './api';
import type { User, ApiResponse } from '../types';

export const userService = {
  /**
   * Lấy danh sách toàn bộ người dùng từ Backend REST API (Không dùng Mock)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get<ApiResponse<User[]>>('/api/system/users');
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Lỗi khi gọi API /api/system/users:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin người dùng theo ID từ Backend REST API
   */
  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>(`/api/system/users/${id}`);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    throw new Error('Không tìm thấy thông tin người dùng');
  },

  /**
   * Khóa hoặc mở khóa trạng thái tài khoản người dùng trực tiếp trên Backend
   */
  async toggleUserStatus(id: number): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>(`/api/system/users/${id}/status`);
    if (response.data && response.data.data) {
      return response.data.data;
    }
    throw new Error('Không thể thay đổi trạng thái người dùng trên máy chủ');
  },
};
