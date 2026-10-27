export type AiJobType = 
  | 'INTERVIEW_REGRADE' 
  | 'CV_BATCH_SCREENING' 
  | 'WEEKLY_REPORT_REVIEW' 
  | 'INTERVIEW_QUESTION_GEN';

export type AiJobStatus = 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';

export interface AiJobProgressEvent {
  jobId: string;
  userId: number;
  jobType: AiJobType;
  referenceId?: string;
  status: AiJobStatus;
  progress: number;
  currentStep?: string;
  detail?: string;
  resultPayload?: Record<string, any>;
  errorMessage?: string;
  timestamp: string;
}
