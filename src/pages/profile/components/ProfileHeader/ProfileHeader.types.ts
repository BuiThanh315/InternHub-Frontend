import type { User, RoleType } from '../../../../types';

export interface ProfileHeaderProps {
  user: User | null;
  role: RoleType | null;
  onOpenAvatarUpload: () => void;
}
