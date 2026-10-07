import type {
  SuggestedKanbanTasksResponse,
  SuggestedKanbanTaskItem,
} from '../../../../../types';

export interface SuggestedTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedTasks: SuggestedKanbanTasksResponse | null;
  isLoading: boolean;
  onApply: (
    selectedCompleted: SuggestedKanbanTaskItem[],
    selectedUnfinished: SuggestedKanbanTaskItem[]
  ) => void;
}
