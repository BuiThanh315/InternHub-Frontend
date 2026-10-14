import type { MissionItemResponse, MissionItemStatus } from '../../../../../types';

export interface MissionKanbanColumnProps {
  status: MissionItemStatus;
  title: string;
  items: MissionItemResponse[];
  onAddNewItem?: () => void;
  onEditItem: (item: MissionItemResponse) => void;
  onDeleteItem: (item: MissionItemResponse) => void;
  onStatusChange: (itemId: number, newStatus: MissionItemStatus) => void;
  onDropItem?: (itemId: number, targetStatus: MissionItemStatus) => void;
  onQuickAdd?: (title: string) => Promise<boolean>;
  className?: string;
}
