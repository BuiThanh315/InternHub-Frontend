import type { AssigneeResponse } from '../../../../../../types';
import type { InternGroup } from '../../../../../../types/group.types';

export interface MentorInternsAndGroupsTabProps {
  programId: number;
  programName: string;
  programInterns: AssigneeResponse[];
  groups: InternGroup[];
  internWorkloadMap: Record<number, number>;
  onOpenGroupModal: () => void;
  onAssignTaskToIntern: (internId: number) => void;
  isLoading?: boolean;
  className?: string;
}
