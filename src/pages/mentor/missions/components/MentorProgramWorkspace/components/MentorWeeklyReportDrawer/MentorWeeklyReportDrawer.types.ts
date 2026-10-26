import type { AssigneeResponse } from '../../../../../../../types';

export interface MentorWeeklyReportModalProps {
  intern: AssigneeResponse | null;
  isOpen: boolean;
  onClose: () => void;
  currentWeekNumber?: number;
  onAssessmentSaved?: () => void;
}

export type MentorWeeklyReportDrawerProps = MentorWeeklyReportModalProps;
