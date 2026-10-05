import type { LeaveRequestSummaryResponse } from '../../../../../types';

export interface LeaveSummaryCardsProps {
  requests: LeaveRequestSummaryResponse[];
  totalElements?: number;
  loading: boolean;
}
