import type { CreateLeaveRequest } from '../../../../../types';

export interface CreateLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeaveRequest) => Promise<boolean>;
  isSubmitting: boolean;
}
