import type { MissionItemResponse, MissionItemStatus, TaskActorPresence } from '../../../../../types';

export interface InternKanbanColumnProps {
  status: MissionItemStatus;
  title: string;
  items: MissionItemResponse[];
  presenceMap?: Record<number, TaskActorPresence>;
  onViewDetail: (item: MissionItemResponse) => void;
  onStatusChange: (itemId: number, newStatus: MissionItemStatus) => void;
  onOpenSubmissionModal: (item: MissionItemResponse) => void;
  isMutating?: boolean;
  className?: string;
}
