import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type { AuthUser, RoleType } from '../types';

export const authService = {
  async login(username: string, password: string): Promise<AuthUser> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { username, password });
      const data = response.data.data;
      const roleRaw = data.role ? data.role.toUpperCase().replace('ROLE_', '') : 'INTERN';
      const authUser: AuthUser = {
        userId: data.userId,
        username: data.username,
        role: (roleRaw as RoleType) || 'INTERN',
        accessToken: data.accessToken,
        tokenType: data.tokenType || 'Bearer',
        expiresIn: data.expiresIn,
      };
      this.saveSession(authUser);
      return authUser;
    } catch (error: any) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác!');
    }
  },

  async getMe(): Promise<{ username: string; authorities: any[] } | null> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
      return response.data.data;
    } catch {
      return null;
    }
  },

  saveSession(authUser: AuthUser) {
    localStorage.setItem('internhub_token', authUser.accessToken);
    localStorage.setItem('internhub_user', JSON.stringify(authUser));
  },

  getCurrentUser(): AuthUser | null {
    const stored = localStorage.getItem('internhub_user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('internhub_token');
    localStorage.removeItem('internhub_user');
  },
};
export default authService;
