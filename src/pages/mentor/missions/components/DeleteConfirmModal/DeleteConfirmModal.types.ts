export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  targetName: string;
  description?: string;
  isLoading?: boolean;
}
