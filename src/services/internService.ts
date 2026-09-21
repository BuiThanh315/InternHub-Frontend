import { apiClient } from './api';
import type { CreateInternRequest, InternProfile, PageResponse } from '../types';
import { MOCK_INTERN_PROFILES } from './mockData';

let localInterns = [...MOCK_INTERN_PROFILES];

export const internService = {
  async getInterns(params?: {
    keyword?: string;
    university?: string;
    major?: string;
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<InternProfile>> {
    try {
      const response = await apiClient.get('/api/employees/interns', { params });
      return response.data.data;
    } catch (error) {
      console.warn('Backend API interns failed or offline, using local mock data...', error);
      let filtered = [...localInterns];

      if (params?.keyword) {
        const kw = params.keyword.toLowerCase();
        filtered = filtered.filter(
          (i) =>
            i.fullName.toLowerCase().includes(kw) ||
            i.email.toLowerCase().includes(kw) ||
            i.internCode.toLowerCase().includes(kw) ||
            i.phone.includes(kw)
        );
      }
      if (params?.university) {
        filtered = filtered.filter((i) => i.university === params.university);
      }
      if (params?.status) {
        filtered = filtered.filter((i) => i.status === params.status);
      }

      return {
        content: filtered,
        pageNumber: params?.page || 0,
        pageSize: params?.size || 10,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / (params?.size || 10)) || 1,
        last: true,
      };
    }
  },

  async createIntern(request: CreateInternRequest): Promise<InternProfile> {
    try {
      const response = await apiClient.post('/api/employees/interns', request);
      return response.data.data;
    } catch (error) {
      console.warn('Backend API createIntern failed or offline, saving to local mock...', error);
      const newIntern: InternProfile = {
        id: localInterns.length + 1,
        internCode: `INT-2026-${String(localInterns.length + 1).padStart(3, '0')}`,
        fullName: request.fullName,
        email: request.email,
        phone: request.phone,
        university: request.university,
        major: request.major,
        gpa: request.gpa,
        startDate: request.startDate,
        endDate: request.endDate,
        department: request.department,
        status: 'SUBMITTED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localInterns.unshift(newIntern);
      return newIntern;
    }
  },

  async updateIntern(id: number, request: Partial<InternProfile>): Promise<InternProfile> {
    try {
      const response = await apiClient.put(`/api/employees/interns/${id}`, request);
      return response.data.data;
    } catch (error) {
      console.warn('Backend API updateIntern failed or offline, updating local mock...', error);
      const index = localInterns.findIndex((i) => i.id === id);
      if (index !== -1) {
        localInterns[index] = {
          ...localInterns[index],
          ...request,
          updatedAt: new Date().toISOString(),
        };
        return localInterns[index];
      }
      throw new Error('Không tìm thấy thực tập sinh');
    }
  },
};
