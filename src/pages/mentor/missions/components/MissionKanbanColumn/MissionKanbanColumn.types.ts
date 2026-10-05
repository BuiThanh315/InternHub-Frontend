import type { MissionItemResponse, MissionItemStatus } from '../../../../../types';

export interface MissionKanbanColumnProps {
  status: MissionItemStatus;
  title: string;
  items: MissionItemResponse[];
  onAddNewItem?: () => void;
  onEditItem: (item: MissionItemResponse) => void;
  onDeleteItem: (item: MissionItemResponse) => void;
  onStatusChange: (itemId: number, newStatus: MissionItemStatus) => void;
  className?: string;
}
