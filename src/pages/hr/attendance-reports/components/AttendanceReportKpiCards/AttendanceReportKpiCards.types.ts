import type { AttendanceSummaryKpiResponse } from '../../../../../types';

export interface AttendanceReportKpiCardsProps {
  data: AttendanceSummaryKpiResponse | null;
  isLoading?: boolean;
}
