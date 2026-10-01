import type { User } from '../../../../types';

export interface PersonalInfoTabProps {
  user: User | null;
  onOpenEditModal: () => void;
}
