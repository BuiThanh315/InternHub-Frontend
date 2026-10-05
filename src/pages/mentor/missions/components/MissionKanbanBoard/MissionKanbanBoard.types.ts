import type { MissionItemResponse, MissionItemStatus } from '../../../../../types';

export interface MissionKanbanBoardProps {
  todoItems: MissionItemResponse[];
  inProgressItems: MissionItemResponse[];
  completedItems: MissionItemResponse[];
  onAddNewItem: (defaultStatus?: MissionItemStatus) => void;
  onEditItem: (item: MissionItemResponse) => void;
  onDeleteItem: (item: MissionItemResponse) => void;
  onStatusChange: (itemId: number, newStatus: MissionItemStatus) => void;
  className?: string;
}
