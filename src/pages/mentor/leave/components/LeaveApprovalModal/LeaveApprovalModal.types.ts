import type { LeaveRequestSummaryResponse } from '../../../../../types';

export interface LeaveApprovalModalProps {
  item: LeaveRequestSummaryResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: number, approvalNote?: string) => Promise<boolean>;
  onReject: (id: number, rejectionReason: string) => Promise<boolean>;
  isSubmitting: boolean;
}
