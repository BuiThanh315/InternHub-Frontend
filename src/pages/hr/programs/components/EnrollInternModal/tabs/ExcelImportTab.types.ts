import type { ProgramDetailResponse } from '../../../../../../types';

export interface ExcelImportTabProps {
  program: ProgramDetailResponse;
  onSuccess: () => void;
}
