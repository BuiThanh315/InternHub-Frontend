import type {
  MissionItemResponse,
  AssigneeResponse,
  CreateMissionItemRequest,
} from '../../../../../types';
import type { InternGroup } from '../../../../../types/group.types';

export type { CreateMissionItemRequest };

export interface MissionItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMissionItemRequest) => Promise<boolean>;
  programInterns: AssigneeResponse[];
  groups?: InternGroup[];
  internWorkloadMap?: Record<number, number>;
  initialAssigneeId?: number | null;
  initialTitle?: string;
  editingItem?: MissionItemResponse | null;
  defaultStatus?: string;
  isLoading?: boolean;
}
