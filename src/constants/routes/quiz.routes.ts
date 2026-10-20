export const QUIZ_ROUTES = {
  LIST: '/intern/quizzes',
  TAKE: (assignmentId: number | string) => `/intern/quizzes/${assignmentId}/take`,
  RESULT: (submissionId: number | string) => `/intern/quizzes/submissions/${submissionId}`,
} as const;
