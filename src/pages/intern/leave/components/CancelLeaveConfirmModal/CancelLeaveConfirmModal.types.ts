import type { LeaveRequestSummaryResponse } from '../../../../../types';

export interface CancelLeaveConfirmModalProps {
  item: LeaveRequestSummaryResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>;
  isSubmitting: boolean;
}
