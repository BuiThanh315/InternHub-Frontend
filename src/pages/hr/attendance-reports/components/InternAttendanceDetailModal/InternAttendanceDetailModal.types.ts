import type { InternAttendanceDetailReportResponse } from '../../../../../types';

export interface InternAttendanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: InternAttendanceDetailReportResponse | null;
  isLoading?: boolean;
  error?: string | null;
}
