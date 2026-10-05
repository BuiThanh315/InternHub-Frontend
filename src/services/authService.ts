import { apiClient, setInMemoryAccessToken } from './api';
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

export function extractPermissionsFromToken(token: string): string[] {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return [];
    const base64Url = parts[1];
    const base64 = base64Url.replaceAll('-', '+').replaceAll('_', '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + (c.codePointAt(0) ?? 0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return Array.isArray(parsed.permissions) ? parsed.permissions : [];
  } catch {
    return [];
  }
}

export const authService = {
  async login(username: string, password: string, rememberMe = false): Promise<AuthUser> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
        username,
        password,
        rememberMe,
      });
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
        permissions: extractPermissionsFromToken(data.accessToken),
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
        permissions: extractPermissionsFromToken(data.accessToken),
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

  async refreshToken(): Promise<string | null> {
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH_TOKEN || '/api/auth/refresh-token', {});
      const newAccessToken = response.data?.data?.accessToken;
      if (newAccessToken) {
        setInMemoryAccessToken(newAccessToken);
        return newAccessToken;
      }
      return null;
    } catch {
      return null;
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

  async getMyPermissions(
    signal?: AbortSignal
  ): Promise<{ username: string; role: string; permissions: string[] } | null> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.AUTH.ME_PERMISSIONS, { signal });
      return response.data?.data || null;
    } catch {
      return null;
    }
  },

  saveSession(authUser: AuthUser) {
    // Lưu Access Token an toàn vào RAM (In-Memory), tuyệt đối không lưu vào localStorage
    setInMemoryAccessToken(authUser.accessToken);
    // Chỉ lưu thông tin profile để render UI cơ bản, xóa token nhạy cảm
    const safeUser = { ...authUser, accessToken: '' };
    localStorage.setItem('internhub_user', JSON.stringify(safeUser));
    localStorage.removeItem('internhub_token'); // Dọn dẹp token cũ nếu có
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

  async logout(): Promise<void> {
    try {
      // Gửi request hủy Refresh Token tại DB và xóa HttpOnly Cookie khỏi trình duyệt
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, {});
    } catch (err) {
      console.warn('Lỗi khi gọi API đăng xuất phía máy chủ:', err);
    } finally {
      // Xóa Access Token trong RAM và profile trong LocalStorage
      setInMemoryAccessToken(null);
      localStorage.removeItem('internhub_token');
      localStorage.removeItem('internhub_user');
    }
  },
};

export default authService;
