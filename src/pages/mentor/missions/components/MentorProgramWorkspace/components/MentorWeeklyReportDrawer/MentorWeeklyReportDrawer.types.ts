import type { AssigneeResponse } from '../../../../../../../types';

export interface MentorWeeklyReportDrawerProps {
  intern: AssigneeResponse | null;
  isOpen: boolean;
  onClose: () => void;
  currentWeekNumber?: number;
  onAssessmentSaved?: () => void;
}
