import type { MissionItemResponse } from '../../../../../types';

export interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MissionItemResponse | null;
  onStartProgress?: (item: MissionItemResponse) => void;
  onOpenSubmission?: (item: MissionItemResponse) => void;
  onReopen?: (item: MissionItemResponse) => void;
}
