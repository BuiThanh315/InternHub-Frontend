import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { AuthUser, RoleType } from '../types';
import { authService } from '../services/authService';

export interface AuthContextType {
  user: AuthUser | null;
  role: RoleType | null;
  permissions: string[];
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (username: string, password: string, rememberMe?: boolean) => Promise<AuthUser>;
  loginWithGoogle: (idToken: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateUser: (updatedData: Partial<AuthUser>) => void;
  updateUserAvatar: (avatarUrl: string) => void;
  hasPermission: (permissionCode: string) => boolean;
  hasAnyPermission: (...permissionCodes: string[]) => boolean;
  hasAllPermissions: (...permissionCodes: string[]) => boolean;
  refreshPermissions: () => Promise<void>;
  syncPermissionsWithRefreshToken: () => Promise<string[]>;
}

// Fallback mặc định an toàn
const getDefaultContextValue = (): AuthContextType => {
  const currentUser = authService.getCurrentUser();
  return {
    user: currentUser,
    role: currentUser?.role || null,
    permissions: currentUser?.permissions || [],
    isAuthenticated: !!currentUser,
    isInitializing: false,
    login: (username, password, rememberMe) => authService.login(username, password, rememberMe),
    loginWithGoogle: (idToken) => authService.loginWithGoogle(idToken),
    logout: () => authService.logout(),
    updateUser: () => {},
    updateUserAvatar: () => {},
    hasPermission: () => false,
    hasAnyPermission: () => false,
    hasAllPermissions: () => false,
    refreshPermissions: async () => {},
    syncPermissionsWithRefreshToken: async () => [],
  };
};

export const AuthContext = createContext<AuthContextType>(getDefaultContextValue());

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getCurrentUser());
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  const permissions = useMemo(() => user?.permissions || [], [user?.permissions]);

  // Khôi phục phiên ngầm (Silent Restoration) lúc khởi chạy ứng dụng qua HttpOnly Cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const token = await authService.refreshToken();
        if (token) {
          const profile = await authService.getMe();
          const permissionsData = await authService.getMyPermissions();
          const stored = authService.getCurrentUser();
          if (stored && profile) {
            const updatedUser: AuthUser = {
              ...stored,
              username: profile.username,
              permissions: permissionsData?.permissions || stored.permissions || [],
            };
            setUser(updatedUser);
            localStorage.setItem('internhub_user', JSON.stringify({ ...updatedUser, accessToken: '' }));
          }
        } else {
          // Phiên không tồn tại hoặc đã hết hạn
          setUser(null);
          localStorage.removeItem('internhub_user');
          localStorage.removeItem('internhub_token');
        }
      } catch {
        setUser(null);
        localStorage.removeItem('internhub_user');
        localStorage.removeItem('internhub_token');
      } finally {
        setIsInitializing(false);
      }
    };

    void restoreSession();
  }, []);

  const login = async (username: string, password: string, rememberMe = false): Promise<AuthUser> => {
    const authUser = await authService.login(username, password, rememberMe);
    setUser(authUser);
    return authUser;
  };

  const loginWithGoogle = async (idToken: string): Promise<AuthUser> => {
    const authUser = await authService.loginWithGoogle(idToken);
    setUser(authUser);
    return authUser;
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
  };

  const updateUser = (updatedData: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updatedData };
      try {
        localStorage.setItem('internhub_user', JSON.stringify({ ...next, accessToken: '' }));
      } catch (e) {
        console.warn('Lỗi lưu cập nhật auth_user vào localStorage:', e);
      }
      return next;
    });
  };

  const updateUserAvatar = (avatarUrl: string) => {
    updateUser({ avatarUrl });
  };

  const hasPermission = (permissionCode: string): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    return (user.permissions || []).includes(permissionCode);
  };

  const hasAnyPermission = (...permissionCodes: string[]): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    const current = user.permissions || [];
    return permissionCodes.some((code) => current.includes(code));
  };

  const hasAllPermissions = (...permissionCodes: string[]): boolean => {
    if (!user) return false;
    if (user.role === 'ADMIN') return true;
    const current = user.permissions || [];
    return permissionCodes.every((code) => current.includes(code));
  };

  const refreshPermissions = async (): Promise<void> => {
    if (!user) return;
    try {
      const data = await authService.getMyPermissions();
      if (data && Array.isArray(data.permissions)) {
        updateUser({ permissions: data.permissions });
      }
    } catch (e) {
      console.warn('Lỗi làm mới permissions:', e);
    }
  };

  /**
   * Đồng bộ phân quyền thời gian thực chuẩn Single-Source-of-Truth:
   * 1. Gọi POST /api/auth/refresh-token để lấy Access Token mới nhất từ server
   * 2. Giải mã claims permissions trong Token trả về và cập nhật RAM
   * 3. Trả về mảng permission mới để caller quyết định điều hướng nếu cần
   */
  const syncPermissionsWithRefreshToken = async (): Promise<string[]> => {
    try {
      const newToken = await authService.refreshToken();
      if (newToken) {
        const { extractPermissionsFromToken } = await import('../services/authService');
        const updatedPermissions = extractPermissionsFromToken(newToken);
        updateUser({ permissions: updatedPermissions });
        return updatedPermissions;
      }
      return user?.permissions || [];
    } catch (e) {
      console.warn('Lỗi đồng bộ token ngầm khi nhận tín hiệu thay đổi quyền:', e);
      return user?.permissions || [];
    }
  };

  // Tự động làm mới quyền khi phiên khởi động, khi chuyển tab, và khi nhận tín hiệu từ BroadcastChannel
  useEffect(() => {
    if (!user || isInitializing) return;

    void refreshPermissions();

    const handleSync = () => {
      if (document.visibilityState === 'visible') {
        void refreshPermissions();
      }
    };

    window.addEventListener('focus', handleSync);
    document.addEventListener('visibilitychange', handleSync);

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('internhub_rbac_sync');
      channel.onmessage = (event) => {
        if (event.data?.type === 'PERMISSIONS_UPDATED') {
          void refreshPermissions();
        }
      };
    } catch {
      // Môi trường không hỗ trợ BroadcastChannel
    }

    return () => {
      window.removeEventListener('focus', handleSync);
      document.removeEventListener('visibilitychange', handleSync);
      if (channel) {
        channel.close();
      }
    };
  }, [user?.username, isInitializing]);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      role: user ? user.role : null,
      permissions,
      isAuthenticated: !!user,
      isInitializing,
      login,
      loginWithGoogle,
      logout,
      updateUser,
      updateUserAvatar,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      refreshPermissions,
      syncPermissionsWithRefreshToken,
    }),
    [user, permissions, isInitializing]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    return getDefaultContextValue();
  }
  return context;
};
