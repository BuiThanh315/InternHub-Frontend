import type { MentorAssessmentSummary } from '../../../../../types';

export interface MentorAssessmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekNumber: number;
  assessment?: MentorAssessmentSummary | null;
  fallbackScore?: number | null;
  fallbackFeedback?: string | null;
  fallbackMentorName?: string | null;
  fallbackReviewedAt?: string | null;
}
