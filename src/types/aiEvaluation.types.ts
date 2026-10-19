export type GradingStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED_RETRYABLE';
export type AiRecommendation = 'PASSED' | 'REVIEW_NEEDED' | 'FAILED' | 'DISQUALIFIED';
export type ProctoringStatus = 'CLEAN' | 'SUSPICIOUS' | 'DISQUALIFIED';
export type HrEvaluationStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';

export interface RubricScores {
  technicalAccuracy: number;
  optimization: number;
  articulation: number;
  edgeCases: number;
}

export interface AnswerEvaluationDetail {
  questionId: number;
  questionText: string;
  category: string;
  scoreWeight: number;
  candidateAnswer: string;
  score: number;
  hrOverrideScore?: number | null;
  hrNotes?: string | null;
  rubric: RubricScores;
  evidenceQuote: string;
  rationale: string;
  suggestedSolution: string;
  isFlaggedSuspicious: boolean;
  securityNote?: string | null;
}

export interface AntiCheatInfo {
  blurCount: number;
  pasteCount: number;
  isViolated: boolean;
  proctoringStatus: ProctoringStatus;
  details?: string | null;
}

export interface HrReviewInfo {
  status: HrEvaluationStatus;
  hrFinalTotalScore?: number | null;
  notes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
}

export interface EvaluationDossier {
  evaluationId: number;
  sessionId: number;
  version: number;
  isActive: boolean;
  candidateName: string;
  candidateEmail: string;
  scheduleTitle: string;
  gradingStatus: GradingStatus;
  totalScore: number;
  hrFinalTotalScore?: number | null;
  aiRecommendation: AiRecommendation;
  proctoringStatus: ProctoringStatus;
  aiSummary: string;
  strengthsSummary: string;
  weaknessesSummary: string;
  modelName: string;
  regradeReason?: string | null;
  retryCount: number;
  errorMessage?: string | null;
  antiCheatInfo: AntiCheatInfo;
  hrReview: HrReviewInfo;
  answers: AnswerEvaluationDetail[];
}

export interface QuestionOverrideItem {
  questionId: number;
  overrideScore?: number;
  hrNotes?: string;
}

export interface HrReviewPayload {
  hrStatus: HrEvaluationStatus;
  notes?: string;
  questionOverrides?: QuestionOverrideItem[];
}

export interface RegradePayload {
  reason: string;
}
