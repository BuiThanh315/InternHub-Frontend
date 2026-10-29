export interface QuizSubmissionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: number | null;
  internName?: string;
  internCode?: string;
  groupName?: string;
}
