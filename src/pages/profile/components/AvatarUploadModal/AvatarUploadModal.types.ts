export interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl?: string | null;
  userId?: number | string | null;
  onAvatarUpdated: (newAvatarUrl: string) => void;
}
