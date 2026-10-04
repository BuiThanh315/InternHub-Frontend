import type { MissionItemResponse, MissionItemStatus } from '../../../../../types';

export interface InternKanbanBoardProps {
  todoItems: MissionItemResponse[];
  inProgressItems: MissionItemResponse[];
  completedItems: MissionItemResponse[];
  onViewDetail: (item: MissionItemResponse) => void;
  onStatusChange: (itemId: number, newStatus: MissionItemStatus) => void;
  onOpenSubmissionModal: (item: MissionItemResponse) => void;
  isMutating?: boolean;
  className?: string;
}
