import type { QuizDetailResponse } from '../../../../../../../../../types/quiz.types';

export interface QuizEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: QuizDetailResponse | null;
  onSaved: (savedQuiz: QuizDetailResponse) => void;
  onProceedToAssign?: (savedQuiz: QuizDetailResponse) => void;
}
