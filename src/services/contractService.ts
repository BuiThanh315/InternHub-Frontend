import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
  ContractResponse,
  UploadContractRequest,
  ConfirmContractRequest,
  RejectContractRequest,
  ContractFeedbackRequest,
  TerminateContractRequest,
  ViewContractUrlResponse,
} from '../types';

export const contractService = {
  /**
   * Tải hợp đồng trực tiếp lên Object Storage (S3 / MinIO) qua Pre-signed URL
   * Không trung chuyển multipart qua backend -> tiết kiệm băng thông và tăng tốc độ.
   */
  async uploadContractDirectToS3(
    internCode: string,
    data: UploadContractRequest,
    file: File,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<ContractResponse> {
    // 1. Xin Presigned Upload URL từ Backend
    const requestUrlPayload = {
      fileName: file.name,
      contentType: file.type || 'application/pdf',
      fileSize: file.size,
    };

    const urlRes = await apiClient.post(
      API_ENDPOINTS.CONTRACT.UPLOAD_URL(internCode),
      requestUrlPayload,
      { signal }
    );
    const { tempKey, presignedUrl } = urlRes.data.data;

    // 2. Upload trực tiếp binary lên S3/MinIO bằng HTTP PUT
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', presignedUrl, true);
      xhr.setRequestHeader('Content-Type', file.type || 'application/pdf');

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

      xhr.onerror = () => reject(new Error('Lỗi kết nối mạng khi tải tệp lên máy chủ lưu trữ S3'));
      if (signal) {
        signal.addEventListener('abort', () => xhr.abort());
      }
      xhr.send(file);
    });

    // 3. Confirm upload với backend để chuyển file sang vị trí chính thức và lưu DB
    const confirmPayload = {
      tempKey,
      originalFileName: file.name,
      contractTitle: data.contractTitle,
      startDate: data.startDate,
      endDate: data.endDate,
      contractNumber: data.contractNumber,
      allowanceAmount: data.allowanceAmount,
      contractType: data.contractType,
      parentContractId: data.parentContractId,
      notes: data.notes,
    };

    const confirmRes = await apiClient.post(
      API_ENDPOINTS.CONTRACT.CONFIRM_UPLOAD(internCode),
      confirmPayload,
      { signal }
    );

    return confirmRes.data.data;
  },

  /**
   * Upload hợp đồng qua multipart (Fallback cho môi trường không có S3)
   */
  async uploadContract(
    internCode: string,
    data: UploadContractRequest,
    file: File,
    onProgress?: (progress: number) => void,
    signal?: AbortSignal
  ): Promise<ContractResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('contractTitle', data.contractTitle);
    formData.append('startDate', data.startDate);
    formData.append('endDate', data.endDate);
    if (data.contractNumber && data.contractNumber.trim()) {
      formData.append('contractNumber', data.contractNumber.trim());
    }
    if (data.allowanceAmount !== undefined && data.allowanceAmount !== null && !isNaN(data.allowanceAmount)) {
      formData.append('allowanceAmount', data.allowanceAmount.toString());
    }
    if (data.contractType) {
      formData.append('contractType', data.contractType);
    }
    if (data.parentContractId) {
      formData.append('parentContractId', data.parentContractId.toString());
    }
    if (data.notes && data.notes.trim()) {
      formData.append('notes', data.notes.trim());
    }

    const response = await apiClient.post(
      API_ENDPOINTS.CONTRACT.UPLOAD(internCode),
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
    return response.data.data;
  },

  /**
   * Lấy danh sách TOÀN BỘ hợp đồng trong công ty (Contract Management Hub cho HR)
   */
  async getAllContracts(signal?: AbortSignal): Promise<ContractResponse[]> {
    const response = await apiClient.get(API_ENDPOINTS.CONTRACT.ALL, { signal });
    return response.data?.data || [];
  },

  async getContractsByInternCode(
    internCode: string,
    signal?: AbortSignal
  ): Promise<ContractResponse[]> {
    const response = await apiClient.get(API_ENDPOINTS.CONTRACT.BY_INTERN(internCode), {
      signal,
    });
    return response.data?.data || [];
  },

  async getMyContracts(signal?: AbortSignal): Promise<ContractResponse[]> {
    const response = await apiClient.get(API_ENDPOINTS.CONTRACT.MY_CONTRACTS, {
      signal,
    });
    return response.data?.data || [];
  },

  async getMyActiveContract(signal?: AbortSignal): Promise<ContractResponse | null> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CONTRACT.MY_ACTIVE, {
        signal,
      });
      return response.data?.data || null;
    } catch {
      return null;
    }
  },

  async getContractById(
    contractId: number | string,
    signal?: AbortSignal
  ): Promise<ContractResponse> {
    const response = await apiClient.get(API_ENDPOINTS.CONTRACT.BY_ID(contractId), {
      signal,
    });
    return response.data?.data;
  },

  async confirmContract(
    contractId: number | string,
    data: ConfirmContractRequest,
    signal?: AbortSignal
  ): Promise<ContractResponse> {
    const response = await apiClient.post(
      API_ENDPOINTS.CONTRACT.CONFIRM(contractId),
      data,
      { signal }
    );
    return response.data?.data;
  },

  async submitFeedback(
    contractId: number | string,
    data: ContractFeedbackRequest,
    signal?: AbortSignal
  ): Promise<ContractResponse> {
    const response = await apiClient.post(
      API_ENDPOINTS.CONTRACT.FEEDBACK(contractId),
      data,
      { signal }
    );
    return response.data?.data;
  },

  async terminateContract(
    contractId: number | string,
    data: TerminateContractRequest,
    signal?: AbortSignal
  ): Promise<ContractResponse> {
    const response = await apiClient.post(
      API_ENDPOINTS.CONTRACT.TERMINATE(contractId),
      data,
      { signal }
    );
    return response.data?.data;
  },

  async sendReminder(
    contractId: number | string,
    signal?: AbortSignal
  ): Promise<void> {
    await apiClient.post(API_ENDPOINTS.CONTRACT.REMIND(contractId), {}, { signal });
  },

  async rejectContract(
    contractId: number | string,
    data: RejectContractRequest,
    signal?: AbortSignal
  ): Promise<ContractResponse> {
    const response = await apiClient.post(
      API_ENDPOINTS.CONTRACT.REJECT(contractId),
      data,
      { signal }
    );
    return response.data?.data;
  },

  /**
   * Lấy URL xem trực tiếp từ Object Storage qua Pre-signed URL (Loại bỏ lỗi 403 Forbidden)
   */
  async getContractPresignedViewUrl(contractId: number | string): Promise<string | null> {
    try {
      const res = await apiClient.get<ApiResponse<ViewContractUrlResponse>>(
        API_ENDPOINTS.CONTRACT.VIEW_URL(contractId)
      );
      return res.data?.data?.presignedUrl || null;
    } catch (e) {
      console.warn('Không thể tạo Presigned S3 URL cho hợp đồng, chuẩn bị fallback tải blob:', e);
      return null;
    }
  },

  getContractDownloadUrl(contractId: number | string, disposition: 'inline' | 'attachment' = 'inline'): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    return `${baseUrl}/api/interns/contracts/${contractId}/download?disposition=${disposition}`;
  },

  async previewContractFile(contractId: number | string) {
    try {
      // 1. Thử lấy Presigned URL trực tiếp từ S3 Object Storage
      const presignedUrl = await this.getContractPresignedViewUrl(contractId);
      if (presignedUrl) {
        window.open(presignedUrl, '_blank');
        return;
      }
    } catch (e) {
      console.warn('Lỗi xin presigned URL, chuyển sang tải Blob:', e);
    }

    try {
      // 2. Fallback: Tải file qua apiClient (có Bearer Token) và mở Blob URL
      const response = await apiClient.get(`/api/interns/contracts/${contractId}/download?disposition=inline`, {
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
      console.error('Lỗi khi xem hợp đồng:', err);
      alert(err.response?.data?.message || err.message || 'Không thể xem tệp hợp đồng này.');
    }
  },

  async downloadContractFile(contractId: number | string, fileName?: string) {
    try {
      // Tải file qua apiClient có kèm Bearer token để tránh bị 403 Forbidden
      const response = await apiClient.get(`/api/interns/contracts/${contractId}/download?disposition=attachment`, {
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
      console.error('Lỗi khi tải hợp đồng:', err);
      alert(err.response?.data?.message || err.message || 'Không thể tải tệp hợp đồng này.');
    }
  },
};

// ============================================================================
// DYNAMIC STRUCTURED CONTRACT & E-SIGNATURE SERVICE
// ============================================================================

import { DYNAMIC_CONTRACT_ENDPOINTS } from '../constants/endpoints/contract.endpoints';
import type {
  ContractTemplateResponse,
  DynamicContractResponse,
  ContractRevisionResponse,
  CreateContractDraftRequest,
  UpdateContractDraftRequest,
  RequestContractChangesRequest,
  ConfirmContractRevisionRequest,
  SignContractRevisionRequest,
  ContractSignatureResponse,
} from '../types';

export const dynamicContractService = {
  // Templates
  async getTemplates(): Promise<ContractTemplateResponse[]> {
    const res = await apiClient.get<ApiResponse<ContractTemplateResponse[]>>(DYNAMIC_CONTRACT_ENDPOINTS.TEMPLATES);
    return res.data.data;
  },

  async getTemplateById(id: number | string): Promise<ContractTemplateResponse> {
    const res = await apiClient.get<ApiResponse<ContractTemplateResponse>>(DYNAMIC_CONTRACT_ENDPOINTS.TEMPLATE_BY_ID(id));
    return res.data.data;
  },

  // HR Draft & Issue
  async getAllContracts(): Promise<DynamicContractResponse[]> {
    const res = await apiClient.get<ApiResponse<DynamicContractResponse[]>>(DYNAMIC_CONTRACT_ENDPOINTS.HR_CONTRACTS);
    return res.data.data;
  },

  async createDraft(payload: CreateContractDraftRequest): Promise<DynamicContractResponse> {
    const res = await apiClient.post<ApiResponse<DynamicContractResponse>>(DYNAMIC_CONTRACT_ENDPOINTS.HR_CREATE_DRAFT, payload);
    return res.data.data;
  },

  async getDraft(id: number | string): Promise<DynamicContractResponse> {
    const res = await apiClient.get<ApiResponse<DynamicContractResponse>>(DYNAMIC_CONTRACT_ENDPOINTS.HR_GET_DRAFT(id));
    return res.data.data;
  },

  async updateDraft(id: number | string, payload: UpdateContractDraftRequest): Promise<DynamicContractResponse> {
    const res = await apiClient.put<ApiResponse<DynamicContractResponse>>(DYNAMIC_CONTRACT_ENDPOINTS.HR_UPDATE_DRAFT(id), payload);
    return res.data.data;
  },

  async previewDraft(id: number | string): Promise<{ canonicalHtml: string }> {
    const res = await apiClient.get<ApiResponse<{ canonicalHtml: string }>>(DYNAMIC_CONTRACT_ENDPOINTS.HR_PREVIEW_DRAFT(id));
    return res.data.data;
  },

  async sendContract(id: number | string): Promise<DynamicContractResponse> {
    const res = await apiClient.post<ApiResponse<DynamicContractResponse>>(DYNAMIC_CONTRACT_ENDPOINTS.HR_SEND_CONTRACT(id));
    return res.data.data;
  },

  async createRevision(contractId: number | string, payload: UpdateContractDraftRequest): Promise<ContractRevisionResponse> {
    const res = await apiClient.post<ApiResponse<ContractRevisionResponse>>(DYNAMIC_CONTRACT_ENDPOINTS.HR_CREATE_REVISION(contractId), payload);
    return res.data.data;
  },

  async resendNotification(contractId: number | string): Promise<void> {
    await apiClient.post(DYNAMIC_CONTRACT_ENDPOINTS.HR_RESEND_NOTIFICATION(contractId));
  },

  async withdrawContract(contractId: number | string, reason?: string): Promise<void> {
    await apiClient.post(DYNAMIC_CONTRACT_ENDPOINTS.HR_WITHDRAW(contractId), { reason });
  },

  // Intern Actions
  async getMyContract(): Promise<DynamicContractResponse | null> {
    try {
      const res = await apiClient.get<ApiResponse<DynamicContractResponse>>(DYNAMIC_CONTRACT_ENDPOINTS.INTERN_MY_CONTRACT);
      return res.data.data;
    } catch (err: any) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  },

  async previewMyRevision(contractId: number | string, revisionId: number | string): Promise<{ canonicalHtml: string; hash: string }> {
    const res = await apiClient.get<ApiResponse<{ canonicalHtml: string; hash: string }>>(
      DYNAMIC_CONTRACT_ENDPOINTS.INTERN_PREVIEW_REVISION(contractId, revisionId)
    );
    return res.data.data;
  },

  async requestChanges(contractId: number | string, revisionId: number | string, payload: RequestContractChangesRequest): Promise<void> {
    await apiClient.post(DYNAMIC_CONTRACT_ENDPOINTS.INTERN_REQUEST_CHANGES(contractId, revisionId), payload);
  },

  async confirmRevision(contractId: number | string, revisionId: number | string, payload: ConfirmContractRevisionRequest): Promise<void> {
    await apiClient.post(DYNAMIC_CONTRACT_ENDPOINTS.INTERN_CONFIRM_REVISION(contractId, revisionId), payload);
  },

  async signRevision(contractId: number | string, revisionId: number | string, payload: SignContractRevisionRequest): Promise<ContractSignatureResponse> {
    const res = await apiClient.post<ApiResponse<ContractSignatureResponse>>(
      DYNAMIC_CONTRACT_ENDPOINTS.INTERN_SIGN_REVISION(contractId, revisionId),
      payload
    );
    return res.data.data;
  },

  async downloadSignedPdf(contractId?: number | string, revisionId?: number | string, fileName?: string): Promise<void> {
    const url = (contractId && revisionId)
      ? DYNAMIC_CONTRACT_ENDPOINTS.INTERN_DOWNLOAD_PDF(contractId, revisionId)
      : DYNAMIC_CONTRACT_ENDPOINTS.INTERN_MY_PDF;

    try {
      const response = await apiClient.get(url, {
        responseType: 'blob',
      });
      const fileBlob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(fileBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      if (fileName) a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
    } catch (err) {
      if (contractId && revisionId) {
        console.warn('Lỗi khi tải theo ID, đang thử lại qua endpoint /intern/me/pdf...');
        const fallbackRes = await apiClient.get(DYNAMIC_CONTRACT_ENDPOINTS.INTERN_MY_PDF, { responseType: 'blob' });
        const fileBlob = new Blob([fallbackRes.data], { type: 'application/pdf' });
        const blobUrl = window.URL.createObjectURL(fileBlob);
        const a = document.createElement('a');
        a.href = blobUrl;
        if (fileName) a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60000);
      } else {
        throw err;
      }
    }
  },
};

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export default contractService;
