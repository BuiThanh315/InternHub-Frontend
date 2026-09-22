import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { AuthUser, RoleType } from '../types';
import { authService } from '../services/authService';

export interface AuthContextType {
  user: AuthUser | null;
  role: RoleType | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  demoLogin: (role: 'admin' | 'hr' | 'mentor' | 'intern') => Promise<AuthUser>;
  logout: () => void;
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
    demoLogin: (role) => authService.demoLoginAs(role),
    logout: () => authService.logout(),
  };
};

export const AuthContext = createContext<AuthContextType>(getDefaultContextValue());

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getCurrentUser());

  useEffect(() => {
    const current = authService.getCurrentUser();
    setUser(current);
  }, []);

  const login = async (username: string, password: string): Promise<AuthUser> => {
    const authUser = await authService.login(username, password);
    setUser(authUser);
    return authUser;
  };

  const demoLogin = async (targetRole: 'admin' | 'hr' | 'mentor' | 'intern'): Promise<AuthUser> => {
    const authUser = await authService.demoLoginAs(targetRole);
    setUser(authUser);
    return authUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      role: user ? user.role : null,
      isAuthenticated: !!user,
      login,
      demoLogin,
      logout,
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
