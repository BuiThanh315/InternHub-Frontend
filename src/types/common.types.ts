export type RoleType = 'ADMIN' | 'HR' | 'MENTOR' | 'INTERN' | 'USER';

export type GenderType = 'MALE' | 'FEMALE' | 'OTHER';

export interface ApiResponse<T> {
  code?: number;
  status?: string;
  message: string;
  data: T;
  timestamp?: string;
  errors?: Record<string, string>;
}

export interface PageResponse<T> {
  items: T[];
  content: T[]; // alias backward compatibility
  currentPage: number;
  pageNumber: number; // alias
  pageSize: number;
  totalItems: number;
  totalElements: number; // alias
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
  last: boolean; // alias
  hasNext: boolean;
  hasPrevious: boolean;
}
