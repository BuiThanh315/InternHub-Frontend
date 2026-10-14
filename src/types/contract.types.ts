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

// ============================================================================
// DYNAMIC STRUCTURED CONTRACT & E-SIGNATURE (ENTERPRISE EXTENSION)
// ============================================================================

export type DynamicContractStatus =
  | 'DRAFT'
  | 'READY_TO_SEND'
  | 'SENT'
  | 'CHANGES_REQUESTED'
  | 'HR_REVISING'
  | 'INTERN_CONFIRMED'
  | 'SIGNED'
  | 'WAITING_EFFECTIVE_DATE'
  | 'ACTIVE'
  | 'WITHDRAWN'
  | 'EXPIRED';

export type TemplateVersionStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

export interface ContractTemplateVersionResponse {
  id: number;
  templateId: number;
  versionNumber: number;
  contentTemplate: string;
  status: TemplateVersionStatus;
  createdBy: string;
  createdAt: string;
}

export interface ContractTemplateResponse {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  isActive: boolean;
  currentVersionNumber: number;
  latestVersion?: ContractTemplateVersionResponse | null;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ContractVariablesPayload {
  internFullName: string;
  internCccd: string;
  internUniversity: string;
  internEmail: string;
  internPhone?: string;
  allowanceAmount: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  position: string;
  department: string;
  supervisorName: string;
  customTerms?: string;
}

export interface ContractRevisionResponse {
  id: number;
  contractId: number;
  revisionNumber: number;
  templateVersionId: number;
  variablesPayload: ContractVariablesPayload;
  canonicalSnapshotContent: string;
  snapshotHash: string;
  pdfStorageKey?: string | null;
  pdfHash?: string | null;
  status: DynamicContractStatus;
  changeRequestReason?: string | null;
  consentTextVersion?: string | null;
  consentTextSnapshot?: string | null;
  confirmedAt?: string | null;
  signedAt?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  version: number;
}

export interface DynamicContractResponse {
  id: number;
  contractNumber: string;
  internId: number;
  internCode?: string;
  internFullName: string;
  internEmail?: string;
  programId: number;
  programName?: string;
  status: DynamicContractStatus;
  currentRevisionId?: number | null;
  currentRevision?: ContractRevisionResponse | null;
  snapshotHash?: string | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  allowanceAmount?: number | null;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  version: number;
}

export interface CreateContractDraftRequest {
  internId: number;
  programId: number;
  templateId: number;
  templateVersionNumber?: number;
  position?: string;
  department?: string;
  supervisorName?: string;
  allowanceAmount?: number;
  startDate?: string;
  endDate?: string;
  customTerms?: string;
  variables?: Partial<ContractVariablesPayload>;
}

export interface UpdateContractDraftRequest {
  templateVersionNumber?: number;
  position?: string;
  department?: string;
  supervisorName?: string;
  allowanceAmount?: number;
  startDate?: string;
  endDate?: string;
  customTerms?: string;
  variables?: Partial<ContractVariablesPayload>;
}

export interface RequestContractChangesRequest {
  reason: string;
}

export interface ConfirmContractRevisionRequest {
  consentTextVersion: string;
  consentTextSnapshot: string;
}

export interface SignContractRevisionRequest {
  signatureData: string; // Vector/SVG/Base64 từ Canvas
  authMethod: 'JWT_SESSION' | 'RE_AUTH_OTP';
  otpCode?: string;
  clientIp?: string;
  clientUserAgent?: string;
}

export interface ContractSignatureResponse {
  id: number;
  contractRevisionId: number;
  signerUserId: number;
  signatureData: string;
  signedAt: string;
  ipAddress: string;
  userAgent: string;
  authMethod: string;
  documentHash: string;
  signatureHash: string;
  consentTextVersion: string;
}

export interface ContractAuditLogResponse {
  id: number;
  contractId: number;
  contractRevisionId?: number | null;
  actorUserId: number;
  actorRole: string;
  action: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
}
