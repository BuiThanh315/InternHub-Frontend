import type { User, InternProfile } from '../../../../types';

export interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  internProfile?: InternProfile | null;
  onSuccess: (updatedUser: User) => void;
}
