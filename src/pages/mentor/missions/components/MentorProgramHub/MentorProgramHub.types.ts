import type { MentorProgramResponse } from '../../../../../types';

export interface MentorProgramHubProps {
  programs: MentorProgramResponse[];
  isLoading: boolean;
  onSelectProgram: (programId: number) => void;
  onRefresh?: () => void;
  className?: string;
}
