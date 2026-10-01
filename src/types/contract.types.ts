// Khớp 100% với backend ContractType enum
export type ContractType = 'OFFICIAL_INTERNSHIP' | 'EXTENSION_APPENDIX';

// Khớp 100% với backend ContractStatus enum
export type ContractStatus =
  | 'PENDING_SIGNATURE'
  | 'PENDING_INTERN_FEEDBACK'
  | 'SIGNED'
  | 'ACTIVE'
  | 'EXPIRED'
  | 'SUPERSEDED'
  | 'TERMINATED'
  | 'REJECTED_BY_INTERN';

export interface ContractResponse {
  id: number;
  parentContractId?: number | null;
  parentContractNumber?: string | null;
  contractType?: ContractType;
  internCode: string;
  internFullName?: string;
  internEmail?: string;
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
  signerFullName?: string | null;
  internConfirmationNote?: string | null;
  rejectionReason?: string | null;
  feedbackNotes?: string | null;
  feedbackAt?: string | null;
  terminationReason?: string | null;
  terminatedAt?: string | null;
  terminatedBy?: string | null;
  internProfileStatus?: string | null;
  daysRemaining?: number | null;
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
  contractType?: ContractType;
  parentContractId?: number;
  notes?: string;
}

export interface ConfirmContractUploadRequest extends UploadContractRequest {
  tempKey: string;
  originalFileName: string;
}

export interface ConfirmContractRequest {
  agreeTerms: boolean;
  signerFullName: string;
  confirmationNote?: string;
}

export interface RejectContractRequest {
  rejectionReason: string;
}

export interface ContractFeedbackRequest {
  feedbackNotes: string;
}

export interface TerminateContractRequest {
  terminationReason: string;
}

export interface ViewContractUrlResponse {
  contractId: number;
  contractNumber: string;
  originalFileName: string;
  presignedUrl?: string | null;
  expiresInSeconds: number;
}
