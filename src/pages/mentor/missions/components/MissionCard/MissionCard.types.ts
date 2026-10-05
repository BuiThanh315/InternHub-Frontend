import type { MissionItemResponse, MissionItemStatus } from '../../../../../types';

export interface MissionCardProps {
  item: MissionItemResponse;
  onEdit: (item: MissionItemResponse) => void;
  onDelete: (item: MissionItemResponse) => void;
  onStatusChange: (itemId: number, newStatus: MissionItemStatus) => void;
  className?: string;
}
