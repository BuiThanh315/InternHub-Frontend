import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser, RoleType } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  role: RoleType | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<AuthUser>;
  demoLogin: (role: 'admin' | 'hr' | 'mentor' | 'intern') => AuthUser;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const demoLogin = (targetRole: 'admin' | 'hr' | 'mentor' | 'intern'): AuthUser => {
    const authUser = authService.demoLoginAs(targetRole);
    setUser(authUser);
    return authUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        login,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
