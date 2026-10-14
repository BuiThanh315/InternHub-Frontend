import type { AssigneeResponse } from '../../../../../../../types';
import type { InternGroup } from '../../../../../../../types/group.types';

export interface MentorQuizzesTabProps {
  programId: number;
  programName: string;
  programInterns: AssigneeResponse[];
  groups: InternGroup[];
  className?: string;
}
