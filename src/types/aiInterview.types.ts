export type QuestionScope = 'PROGRAM' | 'CANDIDATE';

export type QuestionSetStatus = 'DRAFT' | 'FINALIZED';

export type QuestionCategory =
  | 'TECHNICAL_FOUNDATION'
  | 'PROJECT_DEEP_DIVE'
  | 'BEHAVIORAL_AND_CULTURE_FIT';

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface InterviewQuestionItem {
  id: number;
  category: QuestionCategory;
  difficulty: QuestionDifficulty;
  questionText: string;
  expectedAnswer?: string;
  evaluationCriteria?: string;
  suggestedScoreWeight?: number;
  displayOrder: number;
  focusArea?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InterviewQuestionSet {
  id: number;
  title: string;
  scope: QuestionScope;
  programId: number;
  internId?: number;
  targetRole?: string;
  status: QuestionSetStatus;
  totalQuestions: number;
  screeningResultId?: number;
  screeningMatchScore?: number;
  createdByUserId?: string;
  createdByName?: string;
  questions: InterviewQuestionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface GenerateInterviewQuestionsPayload {
  programId: number;
  internId?: number;
  targetRole?: string;
  totalQuestions?: number;
  includeScreeningDossier?: boolean;
  customRequirements?: string;
}

export interface UpdateInterviewQuestionSetPayload {
  title?: string;
  status?: QuestionSetStatus;
  questions?: {
    id?: number;
    questionText?: string;
    expectedAnswer?: string;
    evaluationCriteria?: string;
    suggestedScoreWeight?: number;
    displayOrder?: number;
  }[];
}

export type QuestionGenerationJobStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'NOT_FOUND';

export interface QuestionGenerationJobResponse {
  jobId: string;
  programId: number;
  internId?: number | null;
  targetRole?: string;
  status: QuestionGenerationJobStatus;
  percent: number;
  currentStage?: string;
  questionSetId?: number | null;
  result?: InterviewQuestionSet | null;
  errorMessage?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

