import type { MentorReportDetail } from '../../../types';

export interface MentorWeeklyReportInspectionViewProps {
  report: MentorReportDetail | null;
  weekNumber: number;
  startDate?: string;
  endDate?: string;
  loading?: boolean;
  onRequestRevisionClick: () => void;
}
