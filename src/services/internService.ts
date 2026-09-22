import { apiClient } from './api';
import type { CreateInternRequest, UpdateInternRequest, InternProfile, PageResponse } from '../types';

export const internService = {
  async getInterns(params?: {
    keyword?: string;
    university?: string;
    major?: string;
    department?: string;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<InternProfile>> {
    // Lọc bỏ param rỗng để tránh Backend Spring Boot parse lỗi enum status
    const cleanParams: Record<string, any> = {};
    if (params) {
      if (params.keyword && params.keyword.trim()) cleanParams.keyword = params.keyword.trim();
      if (params.university && params.university.trim()) cleanParams.university = params.university.trim();
      if (params.major && params.major.trim()) cleanParams.major = params.major.trim();
      if (params.department && params.department.trim()) cleanParams.department = params.department.trim();
      if (params.status && params.status.trim()) cleanParams.status = params.status.trim();
      if (params.page !== undefined) cleanParams.page = params.page;
      if (params.size !== undefined) cleanParams.size = params.size;
    }

    const response = await apiClient.get('/api/employees/interns', { params: cleanParams });
    const resData = response.data?.data;
    // Backend trả về data: { items: [...], currentPage, pageSize, totalItems, totalPages }
    return {
      content: resData?.items || resData?.content || [],
      pageNumber: resData?.currentPage ?? resData?.pageNumber ?? 0,
      pageSize: resData?.pageSize || 10,
      totalElements: resData?.totalItems ?? resData?.totalElements ?? 0,
      totalPages: resData?.totalPages || 1,
      last: resData?.last ?? true,
    };
  },

  async createIntern(request: CreateInternRequest): Promise<InternProfile> {
    const payload = {
      ...request,
      appliedPosition: request.appliedPosition || 'Thực tập sinh',
      startDate: request.startDate || new Date().toISOString().split('T')[0],
      academicYear: request.academicYear || '2022-2026',
    };

    const response = await apiClient.post('/api/employees/interns', payload);
    return response.data?.data;
  },

  async updateIntern(id: number, request: UpdateInternRequest): Promise<InternProfile> {
    const payload = {
      ...request,
      appliedPosition: request.appliedPosition || 'Thực tập sinh',
      startDate: request.startDate || new Date().toISOString().split('T')[0],
      academicYear: request.academicYear || '2022-2026',
    };

    const response = await apiClient.put(`/api/employees/interns/${id}`, payload);
    return response.data?.data;
  },
};
