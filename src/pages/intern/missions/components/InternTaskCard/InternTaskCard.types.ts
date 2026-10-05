import type { MissionItemResponse, MissionItemStatus } from '../../../../../types';

export interface InternTaskCardProps {
  item: MissionItemResponse;
  onViewDetail: (item: MissionItemResponse) => void;
  onStatusChange: (itemId: number, newStatus: MissionItemStatus) => void;
  onOpenSubmissionModal: (item: MissionItemResponse) => void;
  isMutating?: boolean;
  className?: string;
}
