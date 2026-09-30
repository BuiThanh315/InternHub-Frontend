import React, { createContext, useContext, useState, useMemo } from 'react';
import type { AuthUser, RoleType } from '../types';
import { authService } from '../services/authService';

export interface AuthContextType {
  user: AuthUser | null;
  role: RoleType | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  updateUser: (updatedData: Partial<AuthUser>) => void;
  updateUserAvatar: (avatarUrl: string) => void;
}

// Fallback mặc định an toàn: đọc trực tiếp session hiện có từ localStorage
// Tránh crash cây component nếu HMR hoặc component render trước khi Provider bind
const getDefaultContextValue = (): AuthContextType => {
  const currentUser = authService.getCurrentUser();
  return {
    user: currentUser,
    role: currentUser?.role || null,
    isAuthenticated: !!currentUser,
    login: (username, password) => authService.login(username, password),
    logout: () => authService.logout(),
    updateUser: () => {},
    updateUserAvatar: () => {},
  };
};

export const AuthContext = createContext<AuthContextType>(getDefaultContextValue());

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  const login = async (username: string, password: string): Promise<AuthUser> => {
    const authUser = await authService.login(username, password);
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
        localStorage.setItem('auth_user', JSON.stringify(next));
      } catch (e) {
        console.warn('Lỗi lưu cập nhật auth_user vào localStorage:', e);
      }
      return next;
    });
  };

  const updateUserAvatar = (avatarUrl: string) => {
    updateUser({ avatarUrl });
  };

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      role: user ? user.role : null,
      isAuthenticated: !!user,
      login,
      logout,
      updateUser,
      updateUserAvatar,
    }),
    [user]
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

