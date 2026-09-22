import type { GenderType, RoleType } from './common.types';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: GenderType;
  address?: string;
  avatarUrl?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  role?: RoleType;
  department?: string;
  position?: string;
  createdAt?: string;
  updatedAt?: string;
}
