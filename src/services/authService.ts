import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
  AuthUser,
  RegisterRequest,
  RegisterResponse,
  ActivateAccountRequest,
  ResendActivationRequest,
  ResendActivationResponse,
  RoleType,
} from '../types';

export const authService = {
  async login(username: string, password: string): Promise<AuthUser> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, { username, password });
      const data = response.data.data;
      const roleRaw = data.role ? data.role.toUpperCase().replace('ROLE_', '') : 'INTERN';
      const authUser: AuthUser = {
        userId: data.userId,
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber || data.phone,
        phone: data.phoneNumber || data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        role: (roleRaw === 'USER' || roleRaw === 'INTERN') ? 'INTERN' : ((roleRaw as RoleType) || 'INTERN'),
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

  async loginWithGoogle(idToken: string): Promise<AuthUser> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.GOOGLE_LOGIN, { idToken });
      const data = response.data?.data;
      if (!data) {
        throw new Error('Không nhận được dữ liệu xác thực từ hệ thống');
      }
      const roleRaw = data.role ? data.role.toUpperCase().replace('ROLE_', '') : 'INTERN';
      const authUser: AuthUser = {
        userId: data.userId,
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber || data.phone,
        phone: data.phoneNumber || data.phone,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        role: (roleRaw === 'USER' || roleRaw === 'INTERN') ? 'INTERN' : ((roleRaw as RoleType) || 'INTERN'),
        accessToken: data.accessToken,
        tokenType: data.tokenType || 'Bearer',
        expiresIn: data.expiresIn,
      };
      this.saveSession(authUser);
      return authUser;
    } catch (error: any) {
      if (error?.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Đăng nhập bằng tài khoản Google không thành công. Vui lòng thử lại.');
    }
  },

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data?.data;
  },

  async activateAccount(data: ActivateAccountRequest, signal?: AbortSignal): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.ACTIVATE, data, { signal });
  },

  async resendActivation(
    data: ResendActivationRequest,
    signal?: AbortSignal
  ): Promise<ResendActivationResponse> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.RESEND_ACTIVATION, data, { signal });
    return response.data?.data;
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
