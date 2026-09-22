import { apiClient } from './api';
import type { User } from '../types';

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
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get('/api/employees/users');
    const list = response.data.data || [];
    return list.map(normalizeUser);
  },

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get(`/api/employees/users/${id}`);
    return normalizeUser(response.data.data);
  },

  async toggleUserStatus(id: number): Promise<User> {
    const response = await apiClient.put(`/api/employees/users/${id}/status`);
    return normalizeUser(response.data.data);
  },
};
export default userService;
