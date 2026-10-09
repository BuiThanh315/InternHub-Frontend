import type {
  MentorProgramResponse,
  AssigneeResponse,
  MissionBoardResponse,
} from '../../../../../../types';
import type { InternGroup } from '../../../../../../types/group.types';

export interface MentorWeeklyReportsTabProps {
  program: MentorProgramResponse;
  programInterns: AssigneeResponse[];
  groups: InternGroup[];
  boards?: MissionBoardResponse[];
  activeBoardId?: number | null;
  onSelectBoard?: (boardId: number) => void;
  internWorkloadMap?: Record<number, number>;
  className?: string;
}
