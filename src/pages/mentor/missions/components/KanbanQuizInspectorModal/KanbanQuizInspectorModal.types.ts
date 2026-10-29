import type { MissionItemResponse, MentorProgramResponse } from '../../../../../types';

export interface KanbanQuizInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MissionItemResponse | null;
  program: MentorProgramResponse;
}

export type QuizInspectorTab = 'questions' | 'evaluation';
