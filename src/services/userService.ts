import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type { User, ApiResponse } from '../types';

interface RawUserPayload {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  address?: string;
  avatarUrl?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  role?: 'ADMIN' | 'HR' | 'MENTOR' | 'INTERN' | 'USER';
  department?: string;
  position?: string;
  createdAt?: string;
  updatedAt?: string;
}

const normalizeUser = (u: RawUserPayload): User => ({
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
   * Lấy danh sách toàn bộ người dùng từ Backend REST API (100% Real API)
   */
  async getAllUsers(signal?: AbortSignal): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<RawUserPayload[]>>(
      API_ENDPOINTS.EMPLOYEE.USERS,
      { signal }
    );
    const list = response.data?.data || [];
    return list.map(normalizeUser);
  },

  /**
   * Lấy thông tin người dùng theo ID từ Backend REST API
   */
  async getUserById(id: number, signal?: AbortSignal): Promise<User> {
    const response = await apiClient.get<ApiResponse<RawUserPayload>>(
      API_ENDPOINTS.EMPLOYEE.USER_DETAIL(id),
      { signal }
    );
    if (response.data && response.data.data) {
      return normalizeUser(response.data.data);
    }
    throw new Error('Không tìm thấy thông tin người dùng trên máy chủ');
  },

  /**
   * Khóa hoặc mở khóa trạng thái tài khoản người dùng trực tiếp trên Backend
   */
  async toggleUserStatus(id: number, signal?: AbortSignal): Promise<User> {
    const response = await apiClient.put<ApiResponse<RawUserPayload>>(
      API_ENDPOINTS.EMPLOYEE.USER_STATUS(id),
      {},
      { signal }
    );
    if (response.data && response.data.data) {
      return normalizeUser(response.data.data);
    }
    throw new Error('Không thể thay đổi trạng thái người dùng trên máy chủ');
  },
};

export default userService;
