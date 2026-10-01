export const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  GOOGLE_LOGIN: '/api/auth/oauth2/google',
  ACTIVATE: '/api/auth/activate',
  RESEND_ACTIVATION: '/api/auth/resend-activation',
  ME: '/api/auth/me',
  REFRESH: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
  ME_PERMISSIONS: '/api/auth/me/permissions',
} as const;
