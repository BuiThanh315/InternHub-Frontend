import { apiClient } from './api';
import type { CreateInternRequest, UpdateInternRequest, InternProfile, PageResponse } from '../types';
import { MOCK_INTERN_PROFILES } from './mockData';

const STORAGE_KEY = 'internhub_local_interns';

function loadStoredInterns(): InternProfile[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load interns from localStorage', e);
  }
  return [...MOCK_INTERN_PROFILES];
}

function saveStoredInterns(interns: InternProfile[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(interns));
  } catch (e) {
    console.warn('Failed to save interns to localStorage', e);
  }
}

let localInterns = loadStoredInterns();

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
            i.phone.includes(kw) ||
            i.university.toLowerCase().includes(kw) ||
            i.major.toLowerCase().includes(kw) ||
            (i.department && i.department.toLowerCase().includes(kw))
        );
      }
      if (params?.university) {
        filtered = filtered.filter((i) => i.university.toLowerCase().includes(params.university!.toLowerCase()));
      }
      if (params?.major) {
        filtered = filtered.filter((i) => i.major.toLowerCase().includes(params.major!.toLowerCase()));
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
      saveStoredInterns(localInterns);
      return newIntern;
    }
  },

  async updateIntern(id: number, request: UpdateInternRequest): Promise<InternProfile> {
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
        saveStoredInterns(localInterns);
        return localInterns[index];
      }
      throw new Error('Không tìm thấy thực tập sinh');
    }
  },
};
