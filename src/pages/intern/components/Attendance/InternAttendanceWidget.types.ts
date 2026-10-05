import type { TodayAttendanceResponse } from '../../../../types';

export interface InternAttendanceWidgetProps {
  todayData: TodayAttendanceResponse | null;
  loading: boolean;
  currentTime: Date;
  onCheckInClick: () => void;
  onCheckOutClick: () => void;
  onViewHistoryClick?: () => void;
}
