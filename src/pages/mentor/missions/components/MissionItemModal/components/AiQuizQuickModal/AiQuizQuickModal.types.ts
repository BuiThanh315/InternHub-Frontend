import type { QuizDetailResponse, QuizDifficulty } from '../../../../../../../types/quiz.types';

export interface AiQuizQuickModalProps {
  isOpen: boolean;
  onClose: () => void;
  programId?: number;
  initialTopic?: string;
  onQuizAttached: (quiz: QuizDetailResponse) => void;
}

export interface QuizQuickConfig {
  topic: string;
  questionCount: number;
  difficulty: QuizDifficulty;
  passScore: number;
  timeLimitMinutes: number;
}
