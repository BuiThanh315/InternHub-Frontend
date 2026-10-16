export const ATTENDANCE_ENDPOINTS = {
  BASE: '/api/v1/attendances',
  TODAY: '/api/v1/attendances/today',
  CHECK_IN: '/api/v1/attendances/check-in',
  CHECK_IN_INITIATE: '/api/v1/attendances/check-in/initiate',
  CHECK_IN_CONFIRM: '/api/v1/attendances/check-in/confirm',
  CHECK_IN_STREAM: '/api/v1/attendances/check-in/stream',
  CHECK_OUT: '/api/v1/attendances/check-out',
  CHECK_OUT_QUICK: '/api/v1/attendances/check-out/quick',
  MY_HISTORY: '/api/v1/attendances/my-history',
  REPORTS: {
    SUMMARY: '/api/v1/attendances/reports/summary',
    INTERNS: '/api/v1/attendances/reports/interns',
    INTERN_DETAILS: (internId: number | string) => `/api/v1/attendances/reports/interns/${internId}/details`,
    EXPORT: '/api/v1/attendances/reports/export',
  },
} as const;

