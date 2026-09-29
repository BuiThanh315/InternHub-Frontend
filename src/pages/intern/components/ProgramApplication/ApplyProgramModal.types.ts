import type { ProgramSummaryResponse } from '../../../../types';

export interface ApplyProgramModalProps {
  isOpen: boolean;
  program: ProgramSummaryResponse | null;
  onClose: () => void;
  onSuccess: (internCode: string, program: ProgramSummaryResponse) => void;
}
