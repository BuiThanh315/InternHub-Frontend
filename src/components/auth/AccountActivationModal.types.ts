export interface AccountActivationModalProps {
  isOpen: boolean;
  onClose: () => void;
  identifier: string;
  maskedEmail?: string;
  onActivationSuccess?: (identifier: string) => void;
  onBackToRegister?: () => void;
}
