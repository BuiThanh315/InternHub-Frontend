import type { RoleType } from './common.types';

export interface AuthUser {
  userId: number;
  username: string;
  fullName?: string;
  role: RoleType;
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone?: string;
  role?: RoleType;
}
