import type {
  MissionItemResponse,
  AssigneeResponse,
  CreateMissionItemRequest,
} from '../../../../../types';

export type { CreateMissionItemRequest };

export interface MissionItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMissionItemRequest) => Promise<boolean>;
  programInterns: AssigneeResponse[];
  editingItem?: MissionItemResponse | null;
  defaultStatus?: string;
  isLoading?: boolean;
}
