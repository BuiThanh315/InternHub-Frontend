export const ATTENDANCE_ENDPOINTS = {
  BASE: '/api/v1/attendances',
  TODAY: '/api/v1/attendances/today',
  CHECK_IN: '/api/v1/attendances/check-in',
  CHECK_IN_INITIATE: '/api/v1/attendances/check-in/initiate',
  CHECK_IN_CONFIRM: '/api/v1/attendances/check-in/confirm',
  CHECK_OUT: '/api/v1/attendances/check-out',
  MY_HISTORY: '/api/v1/attendances/my-history',
} as const;
