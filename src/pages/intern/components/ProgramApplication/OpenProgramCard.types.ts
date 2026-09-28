import type { ProgramSummaryResponse } from '../../../../types';

export interface OpenProgramCardProps {
  program: ProgramSummaryResponse;
  onApply: (program: ProgramSummaryResponse) => void;
  isApplied?: boolean;
}
