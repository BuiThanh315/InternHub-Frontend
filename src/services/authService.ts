import { apiClient } from './api';
import type { AuthUser, RoleType } from '../types';
import { MOCK_AUTH_ACCOUNTS } from './mockData';

export const authService = {
  async login(username: string, password: string): Promise<AuthUser> {
    try {
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
    } catch (error) {
      console.warn('Backend API login failed or unavailable, checking mock credentials...', error);
      // Fallback for demo / offline development
      const lowerUser = username.toLowerCase().trim();
      const mock = MOCK_AUTH_ACCOUNTS[lowerUser];
      if (mock && (password === '123456' || password === mock.username)) {
        this.saveSession(mock);
        return mock;
      }
      throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác!');
    }
  },

  demoLoginAs(role: 'admin' | 'hr' | 'mentor' | 'intern'): AuthUser {
    const mock = MOCK_AUTH_ACCOUNTS[role];
    if (!mock) throw new Error(`Role ${role} không tồn tại`);
    this.saveSession(mock);
    return mock;
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
