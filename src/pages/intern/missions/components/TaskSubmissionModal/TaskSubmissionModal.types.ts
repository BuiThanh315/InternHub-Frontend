import type { MissionItemResponse } from '../../../../../types';

export interface TaskSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MissionItemResponse | null;
  onSubmit: (
    itemId: number,
    submissionUrl: string | null,
    completionNote: string | null
  ) => Promise<boolean>;
  isSubmitting?: boolean;
}
