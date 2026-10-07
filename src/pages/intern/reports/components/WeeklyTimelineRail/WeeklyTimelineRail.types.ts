import type { WeeklyReportTimelineItem } from '../../../../../types';

export interface WeeklyTimelineRailProps {
  timeline: WeeklyReportTimelineItem[];
  selectedWeekNumber: number | null;
  onSelectWeek: (weekNumber: number) => void;
  isLoading?: boolean;
}
