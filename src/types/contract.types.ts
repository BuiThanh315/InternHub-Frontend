// Khớp 100% với backend ContractStatus enum
export type ContractStatus =
  | 'PENDING_SIGNATURE'
  | 'SIGNED'
  | 'EXPIRED'
  | 'TERMINATED';

export interface ContractResponse {
  id: number;
  internCode: string;
  internFullName?: string;
  contractNumber: string;
  contractTitle: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  allowanceAmount?: number | null;
  status: ContractStatus;
  originalFileName: string;
  fileSize: number;
  contentType?: string;
  uploadedBy: string;
  signedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface UploadContractRequest {
  contractTitle: string;
  startDate: string;
  endDate: string;
  contractNumber?: string;
  allowanceAmount?: number;
  notes?: string;
}
