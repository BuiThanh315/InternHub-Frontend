import type { ProgramDetailResponse, InternProfile } from '../../../../../types';

export type WorkspaceTabId = 'applications' | 'interns' | 'mentors' | 'overview';

export interface WorkspaceTabConfig {
  id: WorkspaceTabId;
  label: string;
  iconName: string;
  badgeCount?: number;
}

export interface ProgramWorkspaceHeaderProps {
  program: ProgramDetailResponse;
  pendingCount: number;
  internsCount: number;
  mentorsCount: number;
  onBack: () => void;
  onOpenEnroll: () => void;
  onOpenEdit: () => void;
  onOpenStatus: () => void;
  onToggleRecruitment: () => void;
  isTogglingRecruitment?: boolean;
}

export interface ApplicationsTabProps {
  program: ProgramDetailResponse;
  onEnrollSuccess: () => void;
  onViewInternDetail: (intern: InternProfile) => void;
}

export interface InternsTabProps {
  program: ProgramDetailResponse;
  interns: InternProfile[];
  isLoading: boolean;
  onRefresh: () => void;
  onViewDetail: (intern: InternProfile, tab?: 'profile' | 'history') => void;
  onEditIntern: (intern: InternProfile) => void;
  onAssignMentor: (intern: InternProfile) => void;
  onUploadContract: (intern: InternProfile) => void;
  onStatusChange: (intern: InternProfile, newStatus: string) => void;
}

export interface MentorsTabProps {
  program: ProgramDetailResponse;
  mentors: any[];
  isLoading: boolean;
  onRefresh: () => void;
}

export interface OverviewTabProps {
  program: ProgramDetailResponse;
  interns: InternProfile[];
  pendingCount: number;
}
