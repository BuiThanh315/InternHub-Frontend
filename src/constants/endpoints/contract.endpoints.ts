export const CONTRACT_ENDPOINTS = {
  BASE: '/api/interns',
  UPLOAD: (internCode: string) => `/api/interns/${internCode}/contracts`,
  BY_INTERN: (internCode: string) => `/api/interns/${internCode}/contracts`,
  DOWNLOAD: (contractId: number | string) => `/api/interns/contracts/${contractId}/download`,
  MY_CONTRACTS: '/api/interns/contracts/my-contracts',
  MY_ACTIVE: '/api/interns/contracts/my-contracts/active',
  BY_ID: (contractId: number | string) => `/api/interns/contracts/${contractId}`,
  CONFIRM: (contractId: number | string) => `/api/interns/contracts/${contractId}/confirm`,
  REJECT: (contractId: number | string) => `/api/interns/contracts/${contractId}/reject`,
} as const;
