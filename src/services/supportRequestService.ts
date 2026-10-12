import { apiClient } from './api';
import type { ApiResponse } from '../types/common.types';

export type SupportRequestType =
  | 'INTERNSHIP_CONFIRMATION'
  | 'COMPLETION_CERTIFICATE'
  | 'RECOMMENDATION_LETTER'
  | 'UNIVERSITY_CONFIRMATION'
  | 'ALLOWANCE_INQUIRY'
  | 'OTHER';

export type SupportRequestStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'RESOLVED'
  | 'REJECTED'
  | 'CANCELLED';

export interface SupportRequestResponse {
  id: number;
  internUserId: number;
  internProfileId?: number;
  internFullName?: string;
  internEmail?: string;
  internName?: string;
  internCode?: string;
  requestType: SupportRequestType;
  title: string;
  content: string;
  hasAttachment?: boolean;
  attachmentFilename?: string;
  attachmentFileName?: string;
  attachmentContentType?: string;
  attachmentFileSize?: number;
  status: SupportRequestStatus;
  hrResponse?: string;
  responseNote?: string;
  hasResponseAttachment?: boolean;
  responseFilename?: string;
  responseAttachmentFileName?: string;
  responseAttachmentContentType?: string;
  responseAttachmentFileSize?: number;
  handlerId?: number;
  handlerName?: string;
  handledBy?: string;
  handledAt?: string;
  overrideReason?: string;
  slaDueDate?: string;
  isOverdueSla?: boolean;
  isOverdue?: boolean;
  expectedResolutionDate?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupportRequestDto {
  requestType: SupportRequestType;
  title: string;
  content: string;
}

export interface RespondSupportRequestDto {
  status: 'RESOLVED' | 'REJECTED' | 'PROCESSING';
  hrResponse: string;
  overrideReason?: string;
}

export const supportRequestService = {
  // TTS tạo yêu cầu hỗ trợ mới (multipart form data nếu kèm file)
  createRequest: async (data: CreateSupportRequestDto, file?: File): Promise<SupportRequestResponse> => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (file) {
      formData.append('attachment', file);
    }
    const res = await apiClient.post<ApiResponse<SupportRequestResponse>>('/api/v1/support-requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data?.data;
  },

  // TTS xem các yêu cầu của bản thân
  getMyRequests: async (): Promise<SupportRequestResponse[]> => {
    const res = await apiClient.get<ApiResponse<SupportRequestResponse[]>>('/api/v1/support-requests/my-requests');
    return res.data?.data || [];
  },

  // HR xem toàn bộ danh sách ticket hỗ trợ (có filter theo trạng thái & loại)
  getAllRequests: async (params?: { status?: string; requestType?: string }): Promise<SupportRequestResponse[]> => {
    const cleanParams: Record<string, string> = {};
    if (params?.status && params.status.trim()) {
      cleanParams.status = params.status.trim();
    }
    if (params?.requestType && params.requestType.trim()) {
      cleanParams.requestType = params.requestType.trim();
    }
    const res = await apiClient.get<ApiResponse<SupportRequestResponse[]>>('/api/v1/support-requests', {
      params: Object.keys(cleanParams).length > 0 ? cleanParams : undefined,
    });
    return res.data?.data || [];
  },

  // Xem chi tiết một ticket
  getRequestById: async (id: number): Promise<SupportRequestResponse> => {
    const res = await apiClient.get<ApiResponse<SupportRequestResponse>>(`/api/v1/support-requests/${id}`);
    return res.data?.data;
  },

  // TTS hủy yêu cầu khi đang PENDING
  cancelRequest: async (id: number): Promise<SupportRequestResponse> => {
    const res = await apiClient.patch<ApiResponse<SupportRequestResponse>>(`/api/v1/support-requests/${id}/cancel`);
    return res.data?.data;
  },

  // HR xử lý / phản hồi ticket kèm file ký duyệt scan
  respondRequest: async (id: number, data: RespondSupportRequestDto, file?: File): Promise<SupportRequestResponse> => {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (file) {
      formData.append('responseAttachment', file);
    }
    const res = await apiClient.patch<ApiResponse<SupportRequestResponse>>(`/api/v1/support-requests/${id}/respond`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data?.data;
  },

  // Tải file đính kèm của yêu cầu (bảo mật qua backend stream, chống IDOR)
  downloadAttachment: async (id: number): Promise<Blob> => {
    const res = await apiClient.get(`/api/v1/support-requests/${id}/attachment`, {
      responseType: 'blob',
    });
    return res.data;
  },

  // Tải file kết quả phản hồi của HR
  downloadResponseAttachment: async (id: number): Promise<Blob> => {
    const res = await apiClient.get(`/api/v1/support-requests/${id}/response-attachment`, {
      responseType: 'blob',
    });
    return res.data;
  },
};
