import { apiClient } from './api';
import type { User, ApiResponse } from '../types';

const normalizeUser = (u: any): User => ({
  id: u.id,
  fullName: u.fullName,
  email: u.email,
  phone: u.phoneNumber || u.phone || '',
  phoneNumber: u.phoneNumber || u.phone || '',
  dateOfBirth: u.dateOfBirth,
  gender: u.gender,
  address: u.address,
  avatarUrl: u.avatarUrl,
  status: u.status || 'ACTIVE',
  role: u.role || 'USER',
  department: u.department || 'Bộ phận Kỹ thuật',
  position: u.position || 'Nhân sự',
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
});

export const userService = {
  /**
   * Lấy danh sách toàn bộ người dùng từ Backend REST API (Không dùng Mock)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>('/api/employees/users');
      const list = response.data?.data || [];
      return list.map(normalizeUser);
    } catch (error) {
      console.error('Lỗi khi gọi API /api/employees/users:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin người dùng theo ID từ Backend REST API
   */
  async getUserById(id: number): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<any>>(`/api/employees/users/${id}`);
      if (response.data && response.data.data) {
        return normalizeUser(response.data.data);
      }
      throw new Error('Không tìm thấy thông tin người dùng');
    } catch (error) {
      console.error(`Lỗi khi gọi API /api/employees/users/${id}:`, error);
      throw error;
    }
  },

  /**
   * Khóa hoặc mở khóa trạng thái tài khoản người dùng trực tiếp trên Backend
   */
  async toggleUserStatus(id: number): Promise<User> {
    try {
      const response = await apiClient.put<ApiResponse<any>>(`/api/employees/users/${id}/status`);
      if (response.data && response.data.data) {
        return normalizeUser(response.data.data);
      }
      throw new Error('Không thể thay đổi trạng thái người dùng trên máy chủ');
    } catch (error) {
      console.error(`Lỗi khi gọi API toggle status /api/employees/users/${id}/status:`, error);
      throw error;
    }
  },
};

export default userService;
