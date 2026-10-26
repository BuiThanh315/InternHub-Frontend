import type { MissionItemResponse, MissionItemStatus, TaskActorPresence } from '../../../../../types';

export interface MissionCardProps {
  item: MissionItemResponse;
  presence?: TaskActorPresence;
  onEdit: (item: MissionItemResponse) => void;
  onDelete: (item: MissionItemResponse) => void;
  onStatusChange: (itemId: number, newStatus: MissionItemStatus) => void;
  className?: string;
}
