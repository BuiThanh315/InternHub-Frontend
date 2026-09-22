import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type { DocumentResponse, DocumentType, ReviewDocumentRequest } from '../types';

const normalizeDoc = (doc: any): DocumentResponse => ({
  id: doc.id,
  internCode: doc.internCode,
  documentType: doc.documentType,
  originalFileName: doc.originalFileName || doc.fileName || 'document.pdf',
  fileName: doc.originalFileName || doc.fileName || 'document.pdf',
  fileSize: doc.fileSize || 0,
  contentType: doc.contentType || doc.fileExtension || 'application/pdf',
  fileExtension: doc.contentType || doc.fileExtension || 'application/pdf',
  status: doc.status || 'PENDING_REVIEW',
  rejectionReason: doc.rejectionReason,
  reviewedBy: doc.reviewedBy,
  reviewedAt: doc.reviewedAt,
  createdAt: doc.createdAt || new Date().toISOString(),
  updatedAt: doc.updatedAt,
});

export const documentService = {
  async uploadDocument(
    internCode: string,
    file: File,
    documentType: DocumentType,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<DocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const response = await apiClient.post(
      `/api/employees/interns/${internCode}/documents`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        signal,
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );
    return normalizeDoc(response.data.data);
  },

  async getDocumentsByInternCode(
    internCode: string,
    signal?: AbortSignal
  ): Promise<DocumentResponse[]> {
    const response = await apiClient.get(`/api/employees/interns/${internCode}/documents`, {
      signal,
    });
    const list = response.data.data || [];
    return list.map(normalizeDoc);
  },

  async getAllDocuments(internCodes?: string[], signal?: AbortSignal): Promise<DocumentResponse[]> {
    if (!internCodes || internCodes.length === 0) {
      return [];
    }
    const docPromises = internCodes.map((code) =>
      apiClient
        .get(`/api/employees/interns/${code}/documents`, { signal })
        .catch(() => null)
    );
    const results = await Promise.all(docPromises);
    const allDocs: DocumentResponse[] = [];
    for (const res of results) {
      if (res?.data?.data && Array.isArray(res.data.data)) {
        allDocs.push(...res.data.data.map(normalizeDoc));
      }
    }
    return allDocs;
  },

  async reviewDocument(
    documentId: number,
    request: ReviewDocumentRequest,
    signal?: AbortSignal
  ): Promise<DocumentResponse> {
    const response = await apiClient.put(
      API_ENDPOINTS.DOCUMENT.REVIEW(documentId),
      request,
      { signal }
    );
    return normalizeDoc(response.data.data);
  },

  getDocumentDownloadUrl(documentId: number, disposition: 'inline' | 'attachment' = 'inline'): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    return `${baseUrl}/api/employees/interns/documents/${documentId}/download?disposition=${disposition}`;
  },

  previewDocumentFile(documentId: number) {
    const url = this.getDocumentDownloadUrl(documentId, 'inline');
    window.open(url, '_blank');
  },

  downloadDocumentFile(documentId: number, fileName?: string) {
    const url = this.getDocumentDownloadUrl(documentId, 'attachment');
    const a = document.createElement('a');
    a.href = url;
    if (fileName) a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
};
export default documentService;
