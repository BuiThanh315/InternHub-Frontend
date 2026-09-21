import { apiClient } from './api';
import type { DocumentResponse, DocumentType, ReviewDocumentRequest } from '../types';
import { MOCK_DOCUMENTS } from './mockData';

let localDocuments = [...MOCK_DOCUMENTS];

export const documentService = {
  async uploadDocument(
    internCode: string,
    file: File,
    documentType: DocumentType
  ): Promise<DocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    try {
      const response = await apiClient.post(
        `/api/employees/interns/${internCode}/documents`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      return response.data.data;
    } catch (error) {
      console.warn('Backend API upload failed or offline, storing in local mock...', error);
      const ext = file.name.split('.').pop() || 'pdf';
      const newDoc: DocumentResponse = {
        id: localDocuments.length + 101,
        internCode,
        documentType,
        fileName: file.name,
        fileSize: file.size,
        fileExtension: ext,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      localDocuments.unshift(newDoc);
      return newDoc;
    }
  },

  async getDocumentsByInternCode(internCode: string): Promise<DocumentResponse[]> {
    try {
      const response = await apiClient.get(`/api/employees/interns/${internCode}/documents`);
      return response.data.data;
    } catch (error) {
      console.warn('Backend API getDocuments failed, using local mock...', error);
      return localDocuments.filter((d) => d.internCode === internCode);
    }
  },

  async getAllDocuments(): Promise<DocumentResponse[]> {
    return localDocuments;
  },

  async reviewDocument(
    documentId: number,
    request: ReviewDocumentRequest
  ): Promise<DocumentResponse> {
    try {
      const response = await apiClient.patch(
        `/api/employees/interns/documents/${documentId}/review`,
        request
      );
      return response.data.data;
    } catch (error) {
      console.warn('Backend API review failed or offline, updating local mock...', error);
      const index = localDocuments.findIndex((d) => d.id === documentId);
      if (index !== -1) {
        localDocuments[index] = {
          ...localDocuments[index],
          status: request.status,
          rejectionReason: request.status === 'REJECTED' ? request.rejectionReason : undefined,
          reviewedBy: 'Trần Thị Tuyển Dụng (HR)',
          reviewedAt: new Date().toISOString(),
        };
        return localDocuments[index];
      }
      throw new Error('Không tìm thấy tài liệu để xét duyệt');
    }
  },

  getDocumentDownloadUrl(documentId: number, disposition: 'inline' | 'attachment' = 'inline'): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
    return `${baseUrl}/api/employees/interns/documents/${documentId}/download?disposition=${disposition}`;
  },
};
