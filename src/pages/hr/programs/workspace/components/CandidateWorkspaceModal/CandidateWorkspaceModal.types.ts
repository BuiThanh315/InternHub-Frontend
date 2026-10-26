import type { InternProfile, ProgramDetailResponse, ScreeningResultDto } from '../../../../../../types';

export type CandidateWorkspaceTab = 'profile' | 'screening' | 'interview';

export interface CandidateWorkspaceModalProps {
  candidate: InternProfile | null;
  isOpen: boolean;
  onClose: () => void;
  program: ProgramDetailResponse;
  evaluation?: ScreeningResultDto | null;
  isBookmarked: boolean;
  onToggleBookmark: (candidateId: number) => void;
  isCompared: boolean;
  onToggleCompare: (candidateId: number) => void;
  onApprove: (candidate: InternProfile) => void;
  onReject: (candidate: InternProfile, reason?: string) => Promise<void> | void;
  onTriggerAiScreening: (candidateId: number) => Promise<void>;
  isAiScreeningSubmitting?: boolean;
  onOpenScheduleModal?: (candidate: { candidateId: number; email: string; fullName: string }) => void;
  onOpenAiDossier?: (intern: InternProfile) => void;
  initialTab?: CandidateWorkspaceTab;
  isFull?: boolean;
}

export type CandidateWorkspaceDrawerProps = CandidateWorkspaceModalProps;
