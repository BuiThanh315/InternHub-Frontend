import type { MissionBoardResponse } from '../../../../../../types';

export interface MentorAnalyticsTabProps {
  boards: MissionBoardResponse[];
  activeBoardId: number | null;
  completionPercentage: number;
  totalTasks: number;
  completedTasks: number;
  className?: string;
}
