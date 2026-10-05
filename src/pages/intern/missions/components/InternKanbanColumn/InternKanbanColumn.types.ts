import type { MissionItemResponse, MissionItemStatus } from '../../../../../types';

export interface InternKanbanColumnProps {
  status: MissionItemStatus;
  title: string;
  items: MissionItemResponse[];
  onViewDetail: (item: MissionItemResponse) => void;
  onStatusChange: (itemId: number, newStatus: MissionItemStatus) => void;
  onOpenSubmissionModal: (item: MissionItemResponse) => void;
  isMutating?: boolean;
  className?: string;
}
