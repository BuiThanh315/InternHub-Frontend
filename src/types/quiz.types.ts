export type QuizStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE';

export type QuizDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type AssignmentTargetType = 'INDIVIDUAL' | 'GROUP';

export type AssignmentStatus = 'ACTIVE' | 'CLOSED' | 'CANCELLED';

export type SubmissionStatus = 'IN_PROGRESS' | 'SUBMITTED' | 'TIMED_OUT';

// --- Requests ---

export interface CreateOptionDto {
  optionLabel: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex?: number;
}

export interface CreateQuestionDto {
  questionText: string;
  questionType: QuestionType;
  orderIndex?: number;
  points?: number;
  explanation?: string;
  options: CreateOptionDto[];
}

export interface GenerateAiQuizRequest {
  programId: number;
  groupId?: number;
  weekNumber?: number;
  topic?: string;
  questionCount?: number;
  difficulty?: QuizDifficulty;
}

export interface CreateQuizRequest {
  programId: number;
  title: string;
  description?: string;
  topic?: string;
  difficulty?: QuizDifficulty;
  timeLimitMinutes?: number;
  passingScore?: number;
  maxAttempts?: number;
  questions?: CreateQuestionDto[];
}

export interface UpdateQuizRequest {
  title?: string;
  description?: string;
  topic?: string;
  difficulty?: QuizDifficulty;
  timeLimitMinutes?: number;
  passingScore?: number;
  maxAttempts?: number;
  questions?: CreateQuestionDto[];
}

export interface AssignQuizRequest {
  targetType: AssignmentTargetType;
  targetId: number;
  dueDate: string; // YYYY-MM-DD
  timeLimitMinutes?: number;
  passingScore?: number;
  maxAttempts?: number;
  createKanbanTask?: boolean;
}

export interface SubmitAnswerDto {
  questionId: number;
  selectedOptionIds: number[];
}

export interface SubmitQuizRequest {
  answers: SubmitAnswerDto[];
}

// --- Responses ---

export interface QuizOptionResponse {
  id: number;
  optionLabel: string;
  optionText: string;
  isCorrect?: boolean | null;
  orderIndex: number;
}

export interface QuizQuestionResponse {
  id: number;
  questionText: string;
  questionType: QuestionType;
  orderIndex: number;
  points: number;
  explanation?: string;
  options: QuizOptionResponse[];
}

export interface QuizDetailResponse {
  id: number;
  programId: number;
  programName?: string;
  mentorId: number;
  title: string;
  description?: string;
  topic?: string;
  difficulty: QuizDifficulty;
  timeLimitMinutes: number;
  passingScore: number;
  totalQuestions: number;
  totalPoints: number;
  maxAttempts: number;
  status: QuizStatus;
  createdAt?: string;
  updatedAt?: string;
  questions: QuizQuestionResponse[];
}

export interface QuizSummaryResponse {
  id: number;
  programId: number;
  programName?: string;
  title: string;
  topic?: string;
  difficulty: QuizDifficulty;
  timeLimitMinutes: number;
  passingScore: number;
  totalQuestions: number;
  totalPoints: number;
  maxAttempts: number;
  status: QuizStatus;
  assignedCount?: number;
  completedCount?: number;
  createdAt?: string;
}

export interface QuizTakingOptionResponse {
  id: number;
  optionLabel: string;
  optionText: string;
  orderIndex: number;
}

export interface QuizTakingQuestionResponse {
  id: number;
  questionText: string;
  questionType: QuestionType;
  orderIndex: number;
  points: number;
  options: QuizTakingOptionResponse[];
}

export interface QuizTakingResponse {
  submissionId: number;
  assignmentId: number;
  quizId: number;
  quizTitle: string;
  topic?: string;
  timeLimitMinutes: number;
  totalQuestions: number;
  totalPoints: number;
  passingScore: number;
  attemptNumber: number;
  maxAttempts: number;
  startedAt: string;
  remainingSeconds?: number;
  questions: QuizTakingQuestionResponse[];
}

export interface QuizAnswerResultResponse {
  questionId: number;
  questionText: string;
  questionType: QuestionType;
  orderIndex: number;
  points: number;
  isCorrect: boolean;
  scoreAwarded: number;
  explanation?: string;
  selectedOptionIds: number[];
  correctOptionIds: number[];
  options: QuizOptionResponse[];
}

export interface QuizResultResponse {
  submissionId: number;
  assignmentId: number;
  quizId: number;
  quizTitle: string;
  attemptNumber: number;
  maxAttempts: number;
  score: number;
  totalPoints: number;
  percentageScore: number;
  passingScore: number;
  passed: boolean;
  status: SubmissionStatus;
  startedAt: string;
  submittedAt?: string;
  answerResults: QuizAnswerResultResponse[];
}

export interface QuizAssignmentResponse {
  assignmentId: number;
  quizId: number;
  quizTitle: string;
  description?: string;
  topic?: string;
  difficulty: QuizDifficulty;
  timeLimitMinutes: number;
  passingScore: number;
  totalQuestions: number;
  totalPoints: number;
  maxAttempts: number;
  attemptsUsed?: number;
  attemptsTaken?: number;
  highestScore?: number | null;
  passed?: boolean | null;
  dueDate: string;
  status: AssignmentStatus;
  missionItemId?: number | null;
  latestSubmissionId?: number | null;
}

export interface QuizInternReportDto {
  internId: number;
  internCode: string;
  fullName: string;
  email: string;
  groupName?: string;
  attemptsCount: number;
  highestScore?: number | null;
  totalPoints: number;
  passed: boolean;
  latestSubmittedAt?: string | null;
}

export interface QuizReportResponse {
  quizId: number;
  quizTitle: string;
  totalAssigned: number;
  completedCount: number;
  passedCount: number;
  averageScore: number;
  internReports: QuizInternReportDto[];
}

export interface QuizGenerationJobResponse {
  jobId: string;
  programId: number;
  topic?: string;
  difficulty?: string;
  questionCount?: number;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'NOT_FOUND';
  percent: number;
  currentStage?: string;
  quizId?: number;
  result?: QuizDetailResponse;
  errorMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

