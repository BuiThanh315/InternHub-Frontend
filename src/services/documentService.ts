import { apiClient } from './api';
import type { DocumentResponse, DocumentType, ReviewDocumentRequest } from '../types';

export const documentService = {
  async uploadDocument(
    internCode: string,
    file: File,
    documentType: DocumentType
  ): Promise<DocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const response = await apiClient.post(
      `/api/employees/interns/${internCode}/documents`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data.data;
  },

  async getDocumentsByInternCode(internCode: string): Promise<DocumentResponse[]> {
    const response = await apiClient.get(`/api/employees/interns/${internCode}/documents`);
    return response.data.data || [];
  },

  async getAllDocuments(): Promise<DocumentResponse[]> {
    // Gọi API lấy tài liệu qua Backend (hoặc trả rỗng nếu chưa có endpoint tổng hợp)
    try {
      const response = await apiClient.get('/api/employees/interns/documents');
      return response.data.data || [];
    } catch {
      return [];
    }
  },

  async reviewDocument(
    documentId: number,
    request: ReviewDocumentRequest
  ): Promise<DocumentResponse> {
    const response = await apiClient.patch(
      `/api/employees/interns/documents/${documentId}/review`,
      request
    );
    return response.data.data;
  },

  async downloadDocumentFile(documentId: number, fileName: string): Promise<void> {
    const response = await apiClient.get(
      `/api/employees/interns/documents/${documentId}/download?disposition=attachment`,
      { responseType: 'blob' }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async previewDocumentFile(documentId: number): Promise<void> {
    const response = await apiClient.get(
      `/api/employees/interns/documents/${documentId}/download?disposition=inline`,
      { responseType: 'blob' }
    );
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    window.open(url, '_blank');
  },

  getDocumentDownloadUrl(documentId: number, disposition: 'inline' | 'attachment' = 'inline'): string {
    return `/api/employees/interns/documents/${documentId}/download?disposition=${disposition}`;
  },
};
