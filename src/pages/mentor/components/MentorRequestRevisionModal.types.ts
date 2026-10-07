export interface MentorRequestRevisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  internName: string;
  internCode: string;
  weekNumber: number;
  onSubmit: (revisionNote: string) => Promise<void>;
  loading?: boolean;
}
