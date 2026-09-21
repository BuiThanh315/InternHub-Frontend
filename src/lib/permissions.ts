import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  GraduationCap,
  FileCheck2,
  FolderGit2,
  FileText,
} from 'lucide-react';
import type { RoleType } from '../types';

export type Role = 'ADMIN' | 'HR' | 'MENTOR' | 'INTERN' | 'USER';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number | string;
}

export const navConfig: Record<Role, NavItem[]> = {
  ADMIN: [
    { to: '/admin/dashboard', label: 'Bảng Điều Khiển', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Quản Lý Người Dùng', icon: Users },
    { to: '/admin/system', label: 'Giám Sát Hệ Thống', icon: ShieldCheck },
  ],
  HR: [
    { to: '/hr/dashboard', label: 'Bảng Điều Khiển HR', icon: LayoutDashboard },
    { to: '/hr/interns', label: 'Hồ Sơ Thực Tập Sinh', icon: GraduationCap },
    { to: '/hr/review', label: 'Duyệt Tài Liệu & CV', icon: FileCheck2 },
  ],
  MENTOR: [
    { to: '/mentor/dashboard', label: 'Bảng Điều Khiển Mentor', icon: LayoutDashboard },
    { to: '/mentor/interns', label: 'TTS Phụ Trách', icon: Users },
    { to: '/mentor/documents', label: 'Tài Liệu Hướng Dẫn', icon: FolderGit2 },
  ],
  INTERN: [
    { to: '/intern/dashboard', label: 'Trang Của Tôi', icon: LayoutDashboard },
    { to: '/intern/documents', label: 'Hồ Sơ & Tài Liệu', icon: FileText },
  ],
  USER: [
    { to: '/login', label: 'Đăng Nhập', icon: Users },
  ],
};

// Pure permission helper functions as required by docs/spec.md
export const canEditIntern = (role?: RoleType | null): boolean => {
  return role === 'ADMIN' || role === 'HR';
};

export const canApprove = (role?: RoleType | null): boolean => {
  return role === 'ADMIN' || role === 'HR';
};

export const canEvaluate = (role?: RoleType | null): boolean => {
  return role === 'MENTOR';
};

export const canDeleteIntern = (role?: RoleType | null): boolean => {
  return role === 'ADMIN';
};

export const canReviewDocument = (role?: RoleType | null): boolean => {
  return role === 'ADMIN' || role === 'HR';
};
