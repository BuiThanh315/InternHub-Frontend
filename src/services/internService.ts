import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
  ApplyInternRequest,
  CreateInternRequest,
  InternDecisionRequest,
  InternProfile,
  PageResponse,
  UpdateInternRequest,
} from '../types';

export const internService = {
  async getInterns(
    params?: {
      keyword?: string;
      university?: string;
      major?: string;
      department?: string;
      appliedPosition?: string;
      status?: string;
      page?: number; // 0-indexed Backend
      size?: number;
      sort?: string;
    },
    signal?: AbortSignal
  ): Promise<PageResponse<InternProfile>> {
    // Lọc bỏ param rỗng để tránh Backend Spring Boot parse lỗi enum status hoặc query
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.keyword && params.keyword.trim()) cleanParams.keyword = params.keyword.trim();
      if (params.university && params.university.trim()) cleanParams.university = params.university.trim();
      if (params.major && params.major.trim()) cleanParams.major = params.major.trim();
      if (params.department && params.department.trim()) cleanParams.department = params.department.trim();
      if (params.appliedPosition && params.appliedPosition.trim()) cleanParams.appliedPosition = params.appliedPosition.trim();
      if (params.status && params.status.trim()) cleanParams.status = params.status.trim();
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.size !== undefined) cleanParams.size = params.size;
      if (params.sort && params.sort.trim()) cleanParams.sort = params.sort.trim();
    }

    const response = await apiClient.get(API_ENDPOINTS.INTERN.LIST, { params: cleanParams, signal });
    const raw = response.data?.data;
    const items: InternProfile[] = raw?.items || raw?.content || [];

    return {
      items,
      content: items,
      currentPage: raw?.currentPage ?? raw?.pageNumber ?? 0,
      pageNumber: raw?.currentPage ?? raw?.pageNumber ?? 0,
      pageSize: raw?.pageSize ?? 10,
      totalItems: raw?.totalItems ?? raw?.totalElements ?? items.length,
      totalElements: raw?.totalItems ?? raw?.totalElements ?? items.length,
      totalPages: raw?.totalPages ?? 1,
      isFirst: raw?.isFirst ?? true,
      isLast: raw?.isLast ?? raw?.last ?? true,
      last: raw?.isLast ?? raw?.last ?? true,
      hasNext: raw?.hasNext ?? false,
      hasPrevious: raw?.hasPrevious ?? false,
    };
  },

  async createIntern(request: CreateInternRequest): Promise<InternProfile> {
    const payload = {
      ...request,
      appliedPosition: request.appliedPosition || 'Thực tập sinh',
      startDate: request.startDate || new Date().toISOString().split('T')[0],
      academicYear: request.academicYear,
    };

    const response = await apiClient.post(API_ENDPOINTS.INTERN.CREATE, payload);
    return response.data?.data;
  },

  async applyOnline(request: ApplyInternRequest): Promise<InternProfile> {
    const payload = {
      ...request,
      appliedPosition: request.appliedPosition || 'Thực tập sinh',
      startDate: request.startDate || new Date().toISOString().split('T')[0],
      academicYear: request.academicYear,
    };

    const response = await apiClient.post(API_ENDPOINTS.INTERN.APPLY, payload);
    const profile: InternProfile = response.data?.data;
    if (profile) {
      this.saveLocalProfile(request.userId, profile);
    }
    return profile;
  },

  // === CÁC HÀM HỖ TRỢ LƯU TRỮ VÀ TRUY VẤN HỒ SƠ CỦA INTERN MÀ KHÔNG CẦN GỌI GET /api/interns (BỊ 403 FORBIDDEN) ===
  saveLocalProfile(userId: number | string | undefined, profile: InternProfile): void {
    try {
      const key = userId ? `intern_profile_${userId}` : 'intern_profile_guest';
      localStorage.setItem(key, JSON.stringify(profile));
      localStorage.setItem('intern_profile_latest', JSON.stringify(profile));
    } catch (e) {
      console.warn('Không thể lưu hồ sơ vào localStorage:', e);
    }
  },

  getLocalProfile(userId?: number | string): InternProfile | null {
    try {
      if (userId) {
        const stored = localStorage.getItem(`intern_profile_${userId}`);
        if (stored) return JSON.parse(stored);
      }
      const latest = localStorage.getItem('intern_profile_latest');
      if (latest) {
        const parsed = JSON.parse(latest);
        if (!userId || parsed.userId === userId) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Không thể đọc hồ sơ từ localStorage:', e);
    }
    return null;
  },

  clearLocalProfile(userId?: number | string): void {
    try {
      if (userId) localStorage.removeItem(`intern_profile_${userId}`);
      localStorage.removeItem('intern_profile_latest');
    } catch (e) {
      console.warn('Lỗi xóa hồ sơ localStorage:', e);
    }
  },

  saveLocalDocument(internCode: string, doc: any): void {
    if (!internCode) return;
    try {
      const existing = this.getLocalDocuments(internCode);
      const filtered = existing.filter((d: any) => d.id !== doc.id);
      filtered.unshift(doc);
      localStorage.setItem(`intern_docs_${internCode}`, JSON.stringify(filtered));
    } catch (e) {
      console.warn('Không thể lưu tài liệu vào localStorage:', e);
    }
  },

  getLocalDocuments(internCode: string): any[] {
    if (!internCode) return [];
    try {
      const stored = localStorage.getItem(`intern_docs_${internCode}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Không thể đọc tài liệu từ localStorage:', e);
    }
    return [];
  },

  async updateIntern(id: number, request: UpdateInternRequest): Promise<InternProfile> {
    const payload = {
      ...request,
      appliedPosition: request.appliedPosition || 'Thực tập sinh',
      startDate: request.startDate || new Date().toISOString().split('T')[0],
      academicYear: request.academicYear,
    };

    const response = await apiClient.put(API_ENDPOINTS.INTERN.DETAIL(id), payload);
    return response.data?.data;
  },

  async updateStatus(
    id: number,
    newStatus: string,
    existing?: Partial<UpdateInternRequest>
  ): Promise<InternProfile> {
    const payload: UpdateInternRequest = {
      fullName: existing?.fullName || '',
      email: existing?.email || '',
      phone: existing?.phone || '',
      university: existing?.university || '',
      major: existing?.major || '',
      appliedPosition: existing?.appliedPosition || 'Thực tập sinh',
      startDate: existing?.startDate || new Date().toISOString().split('T')[0],
      status: newStatus as any,
      ...existing,
    };
    return this.updateIntern(id, payload);
  },
  
  async submitDecision(
    id: number,
    request: InternDecisionRequest,
    signal?: AbortSignal
  ): Promise<InternProfile> {
    const response = await apiClient.patch(API_ENDPOINTS.INTERN.DECISION(id), request, { signal });
    return response.data?.data;
  },

  async resendDecisionEmail(id: number, signal?: AbortSignal): Promise<InternProfile> {
    const response = await apiClient.post(API_ENDPOINTS.INTERN.RESEND_DECISION_EMAIL(id), {}, { signal });
    return response.data?.data;
  },
};

export default internService;
