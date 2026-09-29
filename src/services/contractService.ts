import { apiClient } from './api';
import { API_ENDPOINTS } from '../constants/endpoints';
import type {
  ContractResponse,
  UploadContractRequest,
  ConfirmContractRequest,
  RejectContractRequest,
} from '../types';

export const contractService = {
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

  getContractDownloadUrl(contractId: number | string, disposition: 'inline' | 'attachment' = 'inline'): string {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    return `${baseUrl}/api/interns/contracts/${contractId}/download?disposition=${disposition}`;
  },

  previewContractFile(contractId: number | string) {
    const url = this.getContractDownloadUrl(contractId, 'inline');
    window.open(url, '_blank');
  },

  downloadContractFile(contractId: number | string, fileName?: string) {
    const url = this.getContractDownloadUrl(contractId, 'attachment');
    const a = document.createElement('a');
    a.href = url;
    if (fileName) a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
};

export default contractService;
