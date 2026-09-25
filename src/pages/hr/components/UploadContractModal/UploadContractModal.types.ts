import type { InternProfile } from '../../../../types';

export interface UploadContractModalProps {
  intern: InternProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
