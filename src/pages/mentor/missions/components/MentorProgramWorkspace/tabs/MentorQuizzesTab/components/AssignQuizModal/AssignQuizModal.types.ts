import type { InternGroup, AssigneeResponse } from '../../../../../../../../../types';
import type { QuizDetailResponse, QuizSummaryResponse } from '../../../../../../../../../types/quiz.types';

export interface AssignQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizDetailResponse | QuizSummaryResponse | null;
  groups: InternGroup[];
  programInterns: AssigneeResponse[];
  onAssigned: () => void;
}
