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
      API_ENDPOINTS.DOCUMENT.UPLOAD(internCode),
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
    const response = await apiClient.get(API_ENDPOINTS.DOCUMENT.BY_INTERN(internCode), {
      signal,
    });
    const list = response.data?.data || [];
    return list.map(normalizeDoc);
  },

  async getAllDocuments(internCodes?: string[], signal?: AbortSignal): Promise<DocumentResponse[]> {
    if (!internCodes || internCodes.length === 0) {
      return [];
    }
    const docPromises = internCodes.map((code) =>
      apiClient
        .get(API_ENDPOINTS.DOCUMENT.BY_INTERN(code), { signal })
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
    const response = await apiClient.patch(
      API_ENDPOINTS.DOCUMENT.REVIEW(documentId),
      request,
      { signal }
    );
    return normalizeDoc(response.data?.data);
  },

  getDocumentDownloadUrl(documentId: number, disposition: 'inline' | 'attachment' = 'inline'): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    return `${baseUrl}/api/interns/documents/${documentId}/download?disposition=${disposition}`;
  },

  /**
   * Tải file trực tiếp lên Object Storage (S3 / MinIO) qua Pre-signed URL (Không qua backend)
   */
  async uploadDocumentDirectToS3(
    internCode: string,
    file: File,
    documentType: DocumentType,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<DocumentResponse> {
    // 1. Xin Presigned Upload URL từ Backend
    const requestUrlPayload = {
      fileName: file.name,
      contentType: file.type || 'application/pdf',
      documentType: documentType,
      fileSize: file.size,
    };

    const urlRes = await apiClient.post(
      `/api/interns/${internCode}/documents/upload-url`,
      requestUrlPayload,
      { signal }
    );
    const { tempKey, presignedUrl } = urlRes.data.data;

    // 2. Upload trực tiếp binary lên S3/MinIO bằng HTTP PUT
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', presignedUrl, true);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded * 100) / e.total);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Tải lên S3 thất bại với mã trạng thái: ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Lỗi kết nối mạng khi tải tệp lên máy chủ lưu trữ'));
      if (signal) {
        signal.addEventListener('abort', () => xhr.abort());
      }
      xhr.send(file);
    });

    // 3. Xác nhận upload thành công về backend để ghi nhận bản ghi nghiệp vụ
    const confirmPayload = {
      tempKey,
      originalFileName: file.name,
      documentType,
    };

    const confirmRes = await apiClient.post(
      `/api/interns/${internCode}/documents/confirm-upload`,
      confirmPayload,
      { signal }
    );

    return normalizeDoc(confirmRes.data.data);
  },

  /**
   * Lấy URL xem/tải trực tiếp từ Object Storage qua Pre-signed URL
   */
  async getDocumentPresignedViewUrl(documentId: number): Promise<string> {
    const res = await apiClient.get(`/api/interns/documents/${documentId}/view-url`);
    return res.data.data.presignedUrl;
  },

  async previewDocumentFile(documentId: number) {
    try {
      // 1. Thử lấy Presigned URL trực tiếp từ S3 Object Storage
      const presignedUrl = await this.getDocumentPresignedViewUrl(documentId);
      if (presignedUrl) {
        window.open(presignedUrl, '_blank');
        return;
      }
    } catch (e) {
      console.warn('Không thể tạo Presigned S3 URL, chuyển sang tải Blob qua Backend API:', e);
    }

    try {
      // 2. Fallback: Tải file qua apiClient (có Bearer Token) và tạo Blob URL để mở tab mới
      const response = await apiClient.get(`/api/interns/documents/${documentId}/download?disposition=inline`, {
        responseType: 'blob',
      });
      const contentType = (response.headers && response.headers['content-type'])
        ? String(response.headers['content-type'])
        : 'application/pdf';

      const fileBlob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(fileBlob);
      window.open(blobUrl, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
    } catch (err: any) {
      console.error('Lỗi khi xem tài liệu:', err);
      alert(err.response?.data?.message || err.message || 'Không thể xem tài liệu này.');
    }
  },

  async downloadDocumentFile(documentId: number, fileName?: string) {
    try {
      // Tải file qua apiClient có kèm Bearer token để tránh bị 403
      const response = await apiClient.get(`/api/interns/documents/${documentId}/download?disposition=attachment`, {
        responseType: 'blob',
      });
      const contentType = (response.headers && response.headers['content-type'])
        ? String(response.headers['content-type'])
        : 'application/octet-stream';

      const fileBlob = new Blob([response.data], { type: contentType });
      const blobUrl = window.URL.createObjectURL(fileBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      if (fileName) a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
    } catch (err: any) {
      console.error('Lỗi khi tải tài liệu:', err);
      alert(err.response?.data?.message || err.message || 'Không thể tải tài liệu này.');
    }
  },

};

export default documentService;


