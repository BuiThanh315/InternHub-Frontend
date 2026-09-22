// Khớp với backend DocumentType enum
export type DocumentType = 'CV' | 'APPLICATION_LETTER';

// Khớp với backend DocumentStatus enum
export type DocumentStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface DocumentResponse {
  id: number;
  internCode: string;
  documentType: DocumentType;
  originalFileName: string;
  fileName?: string; // alias
  fileSize: number;
  contentType?: string;
  fileExtension?: string; // alias
  status: DocumentStatus;
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewDocumentRequest {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}
