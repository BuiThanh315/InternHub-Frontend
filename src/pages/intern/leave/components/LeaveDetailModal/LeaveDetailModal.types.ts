import type { LeaveRequestSummaryResponse } from '../../../../../types';

export interface LeaveDetailModalProps {
  id: number | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelRequest?: (item: LeaveRequestSummaryResponse) => void;
}
