import type { GenderType, RoleType } from './common.types';

export interface AuthUser {
  userId: number;
  username: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: GenderType;
  address?: string;
  avatarUrl?: string;
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
  maskedEmail?: string;
  role: string;
  status: string;
}

export interface ActivateAccountRequest {
  identifier: string;
  activationKey: string;
}

export interface ResendActivationRequest {
  identifier: string;
}

export interface ResendActivationResponse {
  maskedEmail: string;
  expiresInMinutes?: number;
  cooldownSeconds?: number;
}
