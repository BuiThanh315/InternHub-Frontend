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
  content: T[];
  items?: T[];
  pageNumber: number;
  currentPage?: number;
  pageSize: number;
  totalElements: number;
  totalItems?: number;
  totalPages: number;
  last: boolean;
  isLast?: boolean;
  isFirst?: boolean;
  hasNext?: boolean;
  hasPrevious?: boolean;
}
