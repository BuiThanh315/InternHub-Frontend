export const CONTRACT_ENDPOINTS = {
  BASE: '/api/interns',
  ALL: '/api/interns/contracts/all',
  UPLOAD: (internCode: string) => `/api/interns/${internCode}/contracts`,
  UPLOAD_URL: (internCode: string) => `/api/interns/${internCode}/contracts/upload-url`,
  CONFIRM_UPLOAD: (internCode: string) => `/api/interns/${internCode}/contracts/confirm-upload`,
  VIEW_URL: (contractId: number | string) => `/api/interns/contracts/${contractId}/view-url`,
  BY_INTERN: (internCode: string) => `/api/interns/${internCode}/contracts`,
  DOWNLOAD: (contractId: number | string) => `/api/interns/contracts/${contractId}/download`,
  MY_CONTRACTS: '/api/interns/contracts/my-contracts',
  MY_ACTIVE: '/api/interns/contracts/my-contracts/active',
  BY_ID: (contractId: number | string) => `/api/interns/contracts/${contractId}`,
  CONFIRM: (contractId: number | string) => `/api/interns/contracts/${contractId}/confirm`,
  FEEDBACK: (contractId: number | string) => `/api/interns/contracts/${contractId}/feedback`,
  TERMINATE: (contractId: number | string) => `/api/interns/contracts/${contractId}/terminate`,
  REMIND: (contractId: number | string) => `/api/interns/contracts/${contractId}/remind`,
  REJECT: (contractId: number | string) => `/api/interns/contracts/${contractId}/reject`,
} as const;

export const DYNAMIC_CONTRACT_ENDPOINTS = {
  // Templates
  TEMPLATES: '/api/v1/contract-templates',
  TEMPLATE_BY_ID: (id: number | string) => `/api/v1/contract-templates/${id}`,
  TEMPLATE_VERSIONS: (id: number | string) => `/api/v1/contract-templates/${id}/versions`,

  // HR Contract Operations
  HR_CONTRACTS: '/api/v1/contracts',
  HR_CREATE_DRAFT: '/api/v1/contracts/drafts',
  HR_GET_DRAFT: (id: number | string) => `/api/v1/contracts/drafts/${id}`,
  HR_UPDATE_DRAFT: (id: number | string) => `/api/v1/contracts/drafts/${id}`,
  HR_PREVIEW_DRAFT: (id: number | string) => `/api/v1/contracts/drafts/${id}/preview`,
  HR_SEND_CONTRACT: (id: number | string) => `/api/v1/contracts/${id}/send`,
  HR_REVISIONS: (contractId: number | string) => `/api/v1/contracts/${contractId}/revisions`,
  HR_CREATE_REVISION: (contractId: number | string) => `/api/v1/contracts/${contractId}/revisions`,
  HR_RESEND_NOTIFICATION: (contractId: number | string) => `/api/v1/contracts/${contractId}/resend`,
  HR_WITHDRAW: (contractId: number | string) => `/api/v1/contracts/${contractId}/withdraw`,

  // Intern Operations
  INTERN_MY_CONTRACT: '/api/v1/contracts/intern/me',
  INTERN_PREVIEW_REVISION: (contractId: number | string, revisionId: number | string) =>
    `/api/v1/contracts/intern/${contractId}/revisions/${revisionId}/preview`,
  INTERN_REQUEST_CHANGES: (contractId: number | string, revisionId: number | string) =>
    `/api/v1/contracts/intern/${contractId}/revisions/${revisionId}/request-changes`,
  INTERN_CONFIRM_REVISION: (contractId: number | string, revisionId: number | string) =>
    `/api/v1/contracts/intern/${contractId}/revisions/${revisionId}/confirm`,
  INTERN_SIGN_REVISION: (contractId: number | string, revisionId: number | string) =>
    `/api/v1/contracts/intern/${contractId}/revisions/${revisionId}/sign`,
  INTERN_DOWNLOAD_PDF: (contractId: number | string, revisionId: number | string) =>
    `/api/v1/contracts/intern/${contractId}/revisions/${revisionId}/pdf`,
  INTERN_MY_PDF: '/api/v1/contracts/intern/me/pdf',
} as const;
