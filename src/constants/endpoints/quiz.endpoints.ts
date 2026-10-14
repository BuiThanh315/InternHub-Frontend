export const QUIZ_ENDPOINTS = {
  // Mentor endpoints
  GENERATE_AI: '/api/quizzes/generate-ai',
  CREATE: '/api/quizzes',
  UPDATE: (id: number | string) => `/api/quizzes/${id}`,
  DETAIL: (id: number | string) => `/api/quizzes/${id}`,
  BY_PROGRAM: (programId: number | string) => `/api/quizzes/program/${programId}`,
  ASSIGN: (id: number | string) => `/api/quizzes/${id}/assign`,
  REPORT: (id: number | string) => `/api/quizzes/${id}/report`,

  // Intern endpoints
  MY_ASSIGNMENTS: '/api/interns/me/quizzes/assignments',
  START_ATTEMPT: (assignmentId: number | string) => `/api/interns/me/quizzes/assignments/${assignmentId}/start`,
  SUBMIT_ATTEMPT: (submissionId: number | string) => `/api/interns/me/quizzes/submissions/${submissionId}/submit`,
  SUBMISSION_RESULT: (submissionId: number | string) => `/api/interns/me/quizzes/submissions/${submissionId}`,
} as const;
