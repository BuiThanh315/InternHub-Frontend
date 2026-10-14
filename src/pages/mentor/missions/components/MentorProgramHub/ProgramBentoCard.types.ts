import type { MentorProgramResponse } from '../../../../../types';

export interface ProgramBentoCardProps {
  program: MentorProgramResponse;
  onEnterWorkspace: (programId: number) => void;
  groupCount?: number;
  taskCompletedCount?: number;
  taskTotalCount?: number;
  className?: string;
}
