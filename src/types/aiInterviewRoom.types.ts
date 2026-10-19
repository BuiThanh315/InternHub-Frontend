export type InterviewMode = 'PER_QUESTION' | 'OVERALL_ASSESSMENT';
export type SessionStatus = 'INVITED' | 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED' | 'CANCELLED';
export type SubmissionReason = 'MANUAL' | 'TIMEOUT' | 'STRIKE_LIMIT_EXCEEDED';
export type InputMethod = 'TYPING' | 'VOICE_STT' | 'HYBRID';
export type AuditEventType = 'TAB_BLUR' | 'TAB_FOCUS' | 'PASTE_DETECTED' | 'REVISION_CONFLICT' | 'TIMEOUT_REJECTED';

export interface CandidateInviteItem {
  candidateId?: number;
  email: string;
  fullName: string;
}

export interface CreateInterviewSchedulePayload {
  title: string;
  questionSetId: number;
  programId?: number;
  interviewMode: InterviewMode;
  durationPerQuestionSec?: number;
  totalDurationMinutes?: number;
  allowRevisitQuestions: boolean;
  maxBlurStrikes: number;
  autoSubmitOnExceed: boolean;
  expireHours?: number;
  candidateList: CandidateInviteItem[];
}

export interface CandidateSessionSummary {
  sessionId: number;
  candidateId?: number;
  candidateEmail: string;
  candidateName: string;
  status: SessionStatus;
  blurCount: number;
  pasteCount: number;
  sessionStartedAt?: string;
  submittedAt?: string;
  submissionReason?: SubmissionReason;
  manualInviteLink?: string;
}

export interface InterviewScheduleDetail {
  scheduleId: number;
  title: string;
  questionSetId: number;
  questionSetTitle: string;
  programId?: number;
  interviewMode: InterviewMode;
  durationPerQuestionSec?: number;
  totalDurationMinutes?: number;
  allowRevisitQuestions: boolean;
  maxBlurStrikes: number;
  autoSubmitOnExceed: boolean;
  expireAt: string;
  createdByHrId: string;
  createdAt: string;
  sessions: CandidateSessionSummary[];
}

export interface CandidateSessionAccessData {
  candidateSessionToken: string;
  sessionId: number;
  candidateName: string;
  candidateEmail: string;
  interviewTitle: string;
  status: SessionStatus;
  interviewMode: InterviewMode;
  totalQuestions: number;
  durationPerQuestionSec?: number;
  totalDurationMinutes?: number;
  maxBlurStrikes: number;
  allowRevisitQuestions: boolean;
  autoSubmitOnExceed: boolean;
}

export interface CandidateQuestionData {
  questionId: number;
  displayOrder: number;
  category: string;
  difficulty: string;
  questionText: string;
  focusArea?: string;
  suggestedScoreWeight: number;
  serverDeadline?: string;
  remainingSeconds: number;
  savedAnswerText?: string;
  currentRevision?: number;
  isSubmitted?: boolean;
  questionStatus: 'COMPLETED' | 'ACTIVE' | 'PENDING';
}

export interface CandidateRecoveryStateData {
  sessionId: number;
  interviewTitle?: string;
  candidateName?: string;
  candidateEmail?: string;
  status: SessionStatus;
  interviewMode: InterviewMode;
  totalQuestions: number;
  currentQuestionIndex: number;
  serverNow: string;
  sessionDeadline?: string;
  remainingSecondsOverall: number;
  blurCount: number;
  maxBlurStrikes: number;
  allowRevisitQuestions: boolean;
  questions: CandidateQuestionData[];
}

export interface CandidateEvidencePayload {
  eventType: AuditEventType;
  metadata?: string;
  clientTimestamp?: string;
}

export interface CandidateEvidenceResponse {
  recorded: boolean;
  currentBlurCount: number;
  maxStrikes: number;
  isTerminated: boolean;
  warningMessage?: string;
}

export interface SubmitSessionResponse {
  sessionId: number;
  status: SessionStatus;
  submittedAt: string;
  submissionReason: SubmissionReason;
  message: string;
}

export interface InternInterviewItem {
  sessionId: number;
  scheduleId: number;
  interviewTitle: string;
  programName?: string;
  status: SessionStatus;
  interviewMode: InterviewMode;
  totalQuestions: number;
  durationPerQuestionSec?: number;
  totalDurationMinutes?: number;
  expireAt: string;
  startedAt?: string;
  submittedAt?: string;
  directRoomToken?: string;
}

