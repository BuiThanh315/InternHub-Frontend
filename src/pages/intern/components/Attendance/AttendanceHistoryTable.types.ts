import type { AttendanceRecordResponse } from '../../../../types';

export interface AttendanceHistoryTableProps {
  attendances: AttendanceRecordResponse[];
  loading: boolean;
  error: string | null;
  onRetry?: () => void;
  onGoToCurrentMonth?: () => void;
}
