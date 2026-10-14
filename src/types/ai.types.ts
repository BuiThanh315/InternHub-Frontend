export type AiRecommendation =
  | 'RECOMMENDED_APPROVE'
  | 'CONSIDER'
  | 'RECOMMENDED_REJECT'
  | 'ERROR';

export type BatchJobStatus = 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface BatchScreeningRequest {
  programId: number;
  internIds: number[];
  forceReevaluate?: boolean;
}

export interface BatchJobCreatedResponse {
  jobId: string;
  programId: number;
  totalCandidates: number;
  status: string;
  createdAt: string;
}

export interface ScreeningResultDto {
  internId: number;
  programId: number;
  overallScore: number; // 0 - 100
  recommendation: AiRecommendation;
  matchSummary: string;
  strengths: string[];
  weaknesses: string[];
  skillsMatched: string[];
  draftRejectionReason?: string;
  suggestedInterviewQuestions: string[];
  evaluatedAt: string;
  fromCache: boolean;
  errorMessage?: string;
}

export interface BatchJobStatusResponse {
  jobId: string;
  programId: number;
  status: BatchJobStatus;
  totalCount: number;
  processedCount: number;
  percent: number; // 0 - 100
  results: ScreeningResultDto[];
  createdAt: string;
  updatedAt: string;
}
