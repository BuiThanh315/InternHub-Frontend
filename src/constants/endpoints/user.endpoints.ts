export const USER_ENDPOINTS = {
  BASE: '/api/users',
  LIST: '/api/users',
  DETAIL: (id: number | string) => `/api/users/${id}`,
  STATUS: (id: number | string) => `/api/users/${id}/status`,
  PROFILE_ME: '/api/users/me',
  UPDATE_PROFILE: '/api/users/me',
  AVATAR_UPLOAD_URL: '/api/users/me/avatar/upload-url',
  AVATAR_UPDATE: '/api/users/me/avatar',
} as const;

