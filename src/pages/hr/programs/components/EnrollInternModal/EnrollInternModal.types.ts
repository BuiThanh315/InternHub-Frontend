import type { ProgramDetailResponse } from '../../../../../types';

export interface EnrollInternModalProps {
  isOpen: boolean;
  program: ProgramDetailResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}
