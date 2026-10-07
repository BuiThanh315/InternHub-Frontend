export type WeeklyReportStatus = 'NOT_STARTED' | 'NOT_SUBMITTED' | 'DRAFT' | 'SUBMITTED' | 'REVIEWED';

export interface WeeklyReportTimelineBackendResponse {
  currentWeek: number;
  totalWeeks: number;
  reports: WeeklyReportItemBackend[];
}

export interface WeeklyReportItemBackend {
  weekNumber: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: string; // NOT_STARTED, DRAFT, SUBMITTED, REVIEWED
  statusDisplayName?: string;
  submittedAt: string | null;
  mentorAverageScore?: number | null;
  mentorFeedback?: string | null;
}

export interface WeeklyReportTimelineItem {
  weekNumber: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  status: WeeklyReportStatus;
  statusDisplayName?: string;
  submittedAt: string | null;
  isCurrentWeek: boolean;
  isEditable: boolean;
  score: number | null;
  mentorFeedback?: string | null;
  hasAssessment: boolean;
}

export interface WeeklyReportTaskItem {
  id?: number;
  missionItemId: number;
  taskTitle: string;
  taskStatus: string;
  taskType?: string;
  submissionUrl?: string | null;
  completionNote?: string | null;
  note?: string | null;
  isCompleted?: boolean;
}

export interface SuggestedKanbanTaskItem {
  missionItemId: number;
  title: string;
  status: string;
  statusDisplayName?: string;
  dueDate?: string | null;
  isOverdue?: boolean;
  submissionUrl?: string | null;
  completionNote?: string | null;
  submittedAt?: string | null;
}

export interface SuggestedKanbanTasksResponse {
  weekNumber?: number;
  completedTasks: SuggestedKanbanTaskItem[];
  unfinishedTasks: SuggestedKanbanTaskItem[];
}

export interface MentorAssessmentSummary {
  id?: number;
  technicalScore?: number;
  attitudeScore?: number;
  teamworkScore?: number;
  productivityScore?: number;
  averageScore?: number;
  feedback?: string;
  nextWeekGoals?: string;
  status?: string;
  publishedAt?: string;
}

export interface WeeklyReportDetail {
  id: number | null;
  internCode?: string;
  mentorId?: number | null;
  mentorName?: string | null;
  weekNumber: number;
  reportDate?: string;
  startDate?: string;
  endDate?: string;
  status: WeeklyReportStatus;
  statusDisplayName?: string;
  completedTasksSummary: string;
  unfinishedTasksSummary: string;
  difficultiesAndChallenges: string;
  learningsAndKnowledge: string;
  nextWeekPlan?: string;
  reportAttachmentUrl?: string;
  submittedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
  tasks: WeeklyReportTaskItem[];
  mentorAssessment?: MentorAssessmentSummary | null;
  mentorFeedback?: string | null;
  mentorScore?: number | null;
  reviewedAt?: string | null;
  isEditable?: boolean;
}

export interface SaveWeeklyReportPayload {
  weekNumber?: number;
  reportDate?: string;
  completedTasksSummary: string;
  unfinishedTasksSummary: string;
  difficultiesAndChallenges: string;
  learningsAndKnowledge: string;
  nextWeekPlan?: string;
  reportAttachmentUrl?: string;
  isSubmit?: boolean;
  tasks?: Array<{
    missionItemId: number;
    taskTitle: string;
    taskStatus: string;
    submissionUrl?: string | null;
    note?: string | null;
    isCompleted?: boolean;
  }>;
}
