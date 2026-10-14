import type { InternGroup, QuizDetailResponse } from '../../../../../../../../../types';

export interface AiQuizGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: number;
  groups: InternGroup[];
  onGenerated: (quiz: QuizDetailResponse) => void;
}
