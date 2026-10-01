import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import type { AuthUser, RoleType } from '../types';
import { authService } from '../services/authService';

export interface AuthContextType {
  user: AuthUser | null;
  role: RoleType | null;
  permissions: string[];
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  loginWithGoogle: (idToken: string) => Promise<AuthUser>;
  logout: () => void;
  updateUser: (updatedData: Partial<AuthUser>) => void;
  updateUserAvatar: (avatarUrl: string) => void;
  hasPermission: (permissionCode: string) => boolean;
  hasAnyPermission: (...permissionCodes: string[]) => boolean;
  hasAllPermissions: (...permissionCodes: string[]) => boolean;
  refreshPermissions: () => Promise<void>;
}

// Fallback mặc định an toàn: đọc trực tiếp session hiện có từ localStorage
// Tránh crash cây component nếu HMR hoặc component render trước khi Provider bind
const getDefaultContextValue = (): AuthContextType => {
  const currentUser = authService.getCurrentUser();
  return {
    user: currentUser,
    role: currentUser?.role || null,
    permissions: currentUser?.permissions || [],
    isAuthenticated: !!currentUser,
    login: (username, password) => authService.login(username, password),
    loginWithGoogle: (idToken) => authService.loginWithGoogle(idToken),
    logout: () => authService.logout(),
    updateUser: () => {},
    updateUserAvatar: () => {},
    hasPermission: () => false,
    hasAnyPermission: () => false,
    hasAllPermissions: () => false,
    refreshPermissions: async () => {},
  };
};

export const AuthContext = createContext<AuthContextType>(getDefaultContextValue());

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  const permissions = useMemo(() => user?.permissions || [], [user?.permissions]);

  const login = async (username: string, password: string): Promise<AuthUser> => {
    const authUser = await authService.login(username, password);
    setUser(authUser);
    return authUser;
  };

  const loginWithGoogle = async (idToken: string): Promise<AuthUser> => {
    const authUser = await authService.loginWithGoogle(idToken);
    setUser(authUser);
    return authUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateUser = (updatedData: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updatedData };
      try {
        localStorage.setItem('internhub_user', JSON.stringify(next));
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

  // Tự động làm mới quyền khi phiên khởi động, khi chuyển tab, và khi nhận tín hiệu từ BroadcastChannel
  useEffect(() => {
    if (!user) return;

    // 1. Làm mới quyền ngay khi tải session
    void refreshPermissions();

    // 2. Lắng nghe window focus / visibility change
    const handleSync = () => {
      if (document.visibilityState === 'visible') {
        void refreshPermissions();
      }
    };

    window.addEventListener('focus', handleSync);
    document.addEventListener('visibilitychange', handleSync);

    // 3. Lắng nghe BroadcastChannel để nhận tín hiệu cập nhật thời gian thực từ tab Admin
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
  }, [user?.username]);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      role: user ? user.role : null,
      permissions,
      isAuthenticated: !!user,
      login,
      loginWithGoogle,
      logout,
      updateUser,
      updateUserAvatar,
      hasPermission,
      hasAnyPermission,
      hasAllPermissions,
      refreshPermissions,
    }),
    [user, permissions]
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

