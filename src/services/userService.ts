import { apiClient } from './api';
import type { User } from '../types';

export const userService = {
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get('/api/users');
    return response.data.data;
  },

  async getUserById(id: number): Promise<User> {
    const response = await apiClient.get(`/api/users/${id}`);
    return response.data.data;
  },

  async toggleUserStatus(id: number): Promise<User> {
    const response = await apiClient.patch(`/api/users/${id}/status`);
    return response.data.data;
  },
};
