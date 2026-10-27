import type { MissionItemResponse, MissionItemStatus, TaskActorPresence } from '../../../../../types';

export interface MissionKanbanBoardProps {
  todoItems: MissionItemResponse[];
  inProgressItems: MissionItemResponse[];
  completedItems: MissionItemResponse[];
  presenceMap?: Record<number, TaskActorPresence>;
  onAddNewItem: (defaultStatus?: MissionItemStatus) => void;
  onEditItem: (item: MissionItemResponse) => void;
  onDeleteItem: (item: MissionItemResponse) => void;
  onStatusChange: (itemId: number, newStatus: MissionItemStatus) => void;
  onDropItem?: (itemId: number, targetStatus: MissionItemStatus) => void;
  onQuickAdd?: (title: string) => Promise<boolean>;
  onViewQuizDetail?: (item: MissionItemResponse) => void;
  className?: string;
}
