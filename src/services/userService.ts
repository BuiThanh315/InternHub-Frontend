import { apiClient } from './api';
import type { User } from '../types';
import { MOCK_USERS } from './mockData';

let localUsers = [...MOCK_USERS];

export const userService = {
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get('/api/users');
      return response.data.data;
    } catch (error) {
      console.warn('Backend API getAllUsers failed or offline, using mock users...', error);
      return localUsers;
    }
  },

  async getUserById(id: number): Promise<User> {
    try {
      const response = await apiClient.get(`/api/users/${id}`);
      return response.data.data;
    } catch (error) {
      const found = localUsers.find((u) => u.id === id);
      if (found) return found;
      throw new Error('Không tìm thấy người dùng');
    }
  },

  async toggleUserStatus(id: number): Promise<User> {
    const index = localUsers.findIndex((u) => u.id === id);
    if (index !== -1) {
      localUsers[index].status = localUsers[index].status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      return localUsers[index];
    }
    throw new Error('Người dùng không tồn tại');
  },
};
