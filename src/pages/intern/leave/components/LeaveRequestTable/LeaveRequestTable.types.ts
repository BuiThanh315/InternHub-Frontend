import type { LeaveRequestSummaryResponse } from '../../../../../types';

export interface LeaveRequestTableProps {
  requests: LeaveRequestSummaryResponse[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onViewDetail: (id: number) => void;
  onCancelRequest: (item: LeaveRequestSummaryResponse) => void;
  onCreateNew?: () => void;
  onResetFilters?: () => void;
  onRetry?: () => void;
}
