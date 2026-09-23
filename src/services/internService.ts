import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
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
      academicYear: request.academicYear || '2022-2026',
    };

    const response = await apiClient.post(API_ENDPOINTS.INTERN.CREATE, payload);
    return response.data?.data;
  },

  async updateIntern(id: number, request: UpdateInternRequest): Promise<InternProfile> {
    const payload = {
      ...request,
      appliedPosition: request.appliedPosition || 'Thực tập sinh',
      startDate: request.startDate || new Date().toISOString().split('T')[0],
      academicYear: request.academicYear || '2022-2026',
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
};

export default internService;
