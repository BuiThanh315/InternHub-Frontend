import type { InternProfile } from '../../../../types';

export interface ApproveConfirmModalProps {
  intern: InternProfile | null;
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}
