import type { GenderType, RoleType } from './common.types';

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
  phoneNumber: string;
  dateOfBirth?: string;
  gender?: GenderType;
  address?: string;
  avatarUrl?: string;
}

export interface RegisterResponse {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
}
