import type { InternProfile } from '../../../../types';

export interface EditAcademicModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: InternProfile | null;
  onSuccess: (updatedProfile: InternProfile) => void;
}
