export interface WeeklyAssessment {
  id: number;
  internCode: string;
  mentorId: number;
  mentorName?: string;
  weekNumber: number;
  assessmentDate: string;
  technicalScore: number;     // 1 - 5
  attitudeScore: number;      // 1 - 5
  teamworkScore: number;      // 1 - 5
  productivityScore: number;  // 1 - 5
  averageScore: number;       // 1.0 - 5.0
  feedback: string;
  nextWeekGoals?: string;
  status: 'DRAFT' | 'PUBLISHED';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWeeklyAssessmentPayload {
  weekNumber: number;
  technicalScore: number;
  attitudeScore: number;
  teamworkScore: number;
  productivityScore: number;
  feedback: string;
  nextWeekGoals?: string;
  isPublish: boolean;
}

export type WeeklyAssessmentStatus = 'NEEDS_ASSESSMENT' | 'ASSESSED' | 'OVERDUE_MIDTERM' | 'COMPLETED';

export interface MentorInternTriageItem {
  internCode: string;
  fullName: string;
  programName?: string;
  appliedPosition?: string;
  avatarUrl?: string;
  currentWeek: number;
  totalWeeks: number;
  progressPercent: number;
  weeklyStatus: WeeklyAssessmentStatus;
  lastAverageScore?: number;
  overdueMidterm: boolean;
  status: string;
}

export interface MentorTriageSummary {
  totalAssigned: number;
  needsWeeklyAssessmentCount: number;
  overdueMidtermCount: number;
  groupAverageScore: number;
  interns: MentorInternTriageItem[];
}

export type MentorTriageOverview = MentorTriageSummary;

export type RecommendationType = 'HIRE_FULLTIME' | 'EXTEND_INTERNSHIP' | 'PASS' | 'FAIL';
export type EvaluationStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED';

export interface InternEvaluation {
  id?: number;
  internCode: string;
  mentorId?: number;
  mentorName?: string;
  evaluationType: 'MIDTERM' | 'FINAL';
  technicalScore: number;       // 1.0 - 10.0
  technicalComments: string;
  attitudeScore: number;        // 1.0 - 10.0
  attitudeComments: string;
  softSkillsScore: number;      // 1.0 - 10.0
  finalScore: number;           // 1.0 - 10.0
  weeklyAssessmentAvgScore?: number;
  strengths?: string;
  areasForImprovement?: string;
  recommendation: RecommendationType;
  recommendationNote?: string;
  status: EvaluationStatus;
  submittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInternEvaluationPayload {
  evaluationType: 'MIDTERM' | 'FINAL';
  technicalScore: number;
  technicalComments: string;
  attitudeScore: number;
  attitudeComments: string;
  softSkillsScore: number;
  strengths?: string;
  areasForImprovement?: string;
  recommendation: RecommendationType;
  recommendationNote?: string;
  isSubmit?: boolean;
}

export interface HrApproveEvaluationPayload {
  hrComments?: string;
  internshipResult: 'PASSED' | 'EXCELLENT' | 'FAILED';
}

export interface HrEvaluationSummaryItem {
  evaluationId?: number;
  internId: number;
  internCode: string;
  internName: string;
  email: string;
  university?: string;
  appliedPosition?: string;
  programId?: number;
  programName?: string;
  departmentId?: number;
  departmentName?: string;
  mentorId?: number;
  mentorName?: string;
  evaluationStatus: 'NOT_STARTED' | 'DRAFT' | 'SUBMITTED' | 'APPROVED';
  technicalScore?: number;
  attitudeScore?: number;
  softSkillsScore?: number;
  weeklyAssessmentAvgScore?: number;
  finalScore?: number;
  recommendation?: RecommendationType;
  recommendationNote?: string;
  strengths?: string;
  areasForImprovement?: string;
  hrComments?: string;
  hrApprovedBy?: string;
  hrApprovedAt?: string;
  internshipResult?: 'PASSED' | 'EXCELLENT' | 'FAILED';
  internStatus?: string;
}
