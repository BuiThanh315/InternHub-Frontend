import type { QuizDetailResponse } from '../../../../../../../types/quiz.types';

export interface ProgramQuizPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId: number;
  onSelectQuiz: (quiz: QuizDetailResponse) => void;
}
