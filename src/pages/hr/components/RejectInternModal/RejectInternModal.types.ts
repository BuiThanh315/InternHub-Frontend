import type { InternProfile } from '../../../../types';

export interface RejectInternModalProps {
  intern: InternProfile | null;
  isOpen: boolean;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}
