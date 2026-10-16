import type { InternDiligenceReportResponse, PageResponse } from '../../../../../types';

export interface InternDiligenceTableProps {
  data: PageResponse<InternDiligenceReportResponse> | null;
  isLoading?: boolean;
  error?: string | null;
  onPageChange: (page: number) => void;
  onViewDetail: (internId: number) => void;
  onRetry?: () => void;
  onResetFilters?: () => void;
}
