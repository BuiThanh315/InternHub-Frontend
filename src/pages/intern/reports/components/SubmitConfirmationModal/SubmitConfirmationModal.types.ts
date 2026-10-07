export interface SubmitConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  weekNumber: number;
  isAlreadySubmitted?: boolean;
}
