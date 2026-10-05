import type { MissionBoardResponse } from '../../../../../types';

export interface MissionBoardFormData {
  title: string;
  description: string;
  dueDate: string;
}

export interface MissionBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MissionBoardFormData) => Promise<boolean>;
  editingBoard?: MissionBoardResponse | null;
  isLoading?: boolean;
}
