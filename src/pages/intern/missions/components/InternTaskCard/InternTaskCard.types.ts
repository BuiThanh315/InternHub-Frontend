import type { MissionItemResponse, MissionItemStatus, TaskActorPresence } from '../../../../../types';

export interface InternTaskCardProps {
  item: MissionItemResponse;
  presence?: TaskActorPresence;
  onViewDetail: (item: MissionItemResponse) => void;
  onStatusChange: (itemId: number, newStatus: MissionItemStatus) => void;
  onOpenSubmissionModal: (item: MissionItemResponse) => void;
  isMutating?: boolean;
  className?: string;
}
