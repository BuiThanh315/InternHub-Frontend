import { apiClient } from './api';
import type { AuthUser, RoleType } from '../types';

export const authService = {
  async login(username: string, password: string): Promise<AuthUser> {
    const response = await apiClient.post('/api/auth/login', { username, password });
    const data = response.data.data;
    const authUser: AuthUser = {
      userId: data.userId,
      username: data.username,
      role: (data.role?.replace('ROLE_', '') as RoleType) || 'INTERN',
      accessToken: data.accessToken,
      tokenType: data.tokenType || 'Bearer',
      expiresIn: data.expiresIn,
    };
    this.saveSession(authUser);
    return authUser;
  },

  async demoLoginAs(role: 'admin' | 'hr' | 'mentor' | 'intern'): Promise<AuthUser> {
    // Đăng nhập trực tiếp vào Backend để lấy JWT token thật từ DB MySQL
    return await this.login(role, '123456');
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
