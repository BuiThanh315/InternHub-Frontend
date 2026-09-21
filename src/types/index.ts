export type RoleType = 'ADMIN' | 'HR' | 'MENTOR' | 'INTERN' | 'USER';

export interface User {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  status: 'ACTIVE' | 'INACTIVE';
  role: RoleType;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser {
  userId: number;
  username: string;
  fullName?: string;
  role: RoleType;
  accessToken: string;
  tokenType: string;
  expiresIn?: number;
}

export interface ApiResponse<T> {
  code?: number;
  status?: string;
  message: string;
  data: T;
  timestamp?: string;
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export type InternStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'APPROVED'
  | 'INTERNING'
  | 'COMPLETED'
  | 'DROPPED';

export interface InternProfile {
  id: number;
  internCode: string;
  fullName: string;
  email: string;
  phone: string;
  university: string;
  major: string;
  gpa?: number;
  startDate?: string;
  endDate?: string;
  department?: string;
  mentorId?: number;
  mentorName?: string;
  status: InternStatus;
  createdAt: string;
  updatedAt: string;
}

export type DocumentType =
  | 'CV'
  | 'INTERNSHIP_APPLICATION'
  | 'RECOMMENDATION_LETTER'
  | 'TRANSCRIPT'
  | 'OTHER';

export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface DocumentResponse {
  id: number;
  internCode: string;
  documentType: DocumentType;
  fileName: string;
  fileSize: number;
  fileExtension?: string;
  status: DocumentStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface CreateInternRequest {
  fullName: string;
  email: string;
  phone: string;
  university: string;
  major: string;
  gpa?: number;
  startDate?: string;
  endDate?: string;
  department?: string;
}

export interface ReviewDocumentRequest {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}
