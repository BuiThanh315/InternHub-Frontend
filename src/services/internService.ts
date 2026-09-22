import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type { CreateInternRequest, InternProfile, PageResponse, UpdateInternRequest } from '../types';

export const internService = {
  async getInterns(
    params?: {
      keyword?: string;
      university?: string;
      major?: string;
      appliedPosition?: string;
      status?: string;
      page?: number; // 0-indexed Backend
      size?: number;
      sort?: string;
    },
    signal?: AbortSignal
  ): Promise<PageResponse<InternProfile>> {
    const response = await apiClient.get(API_ENDPOINTS.EMPLOYEE.INTERNS, { params, signal });
    const raw = response.data.data;
    const items: InternProfile[] = raw.items || raw.content || [];

    return {
      items,
      content: items,
      currentPage: raw.currentPage ?? raw.pageNumber ?? 0,
      pageNumber: raw.currentPage ?? raw.pageNumber ?? 0,
      pageSize: raw.pageSize ?? 10,
      totalItems: raw.totalItems ?? raw.totalElements ?? items.length,
      totalElements: raw.totalItems ?? raw.totalElements ?? items.length,
      totalPages: raw.totalPages ?? 1,
      isFirst: raw.isFirst ?? true,
      isLast: raw.isLast ?? raw.last ?? true,
      last: raw.isLast ?? raw.last ?? true,
      hasNext: raw.hasNext ?? false,
      hasPrevious: raw.hasPrevious ?? false,
    };
  },

  async createIntern(request: CreateInternRequest): Promise<InternProfile> {
    const response = await apiClient.post(API_ENDPOINTS.EMPLOYEE.INTERNS, request);
    return response.data.data;
  },

  async updateIntern(id: number, request: UpdateInternRequest): Promise<InternProfile> {
    const response = await apiClient.put(API_ENDPOINTS.EMPLOYEE.INTERN_DETAIL(id), request);
    return response.data.data;
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
      appliedPosition: existing?.appliedPosition || '',
      startDate: existing?.startDate || new Date().toISOString().split('T')[0],
      status: newStatus as any,
      ...existing,
    };
    return this.updateIntern(id, payload);
  },
};
export default internService;
