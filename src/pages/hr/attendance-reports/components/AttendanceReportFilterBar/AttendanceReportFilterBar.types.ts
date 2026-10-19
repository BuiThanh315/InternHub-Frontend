import type { DiligenceStatus } from '../../../../../types';

export interface AttendanceReportFilterBarProps {
  month: number;
  year: number;
  departmentId?: number;
  programId?: number;
  mentorId?: number;
  diligenceStatus?: DiligenceStatus | 'ALL';
  keyword: string;
  isMentorRole?: boolean;
  onFilterChange: (patch: {
    month?: number;
    year?: number;
    departmentId?: number;
    programId?: number;
    mentorId?: number;
    diligenceStatus?: DiligenceStatus | 'ALL';
    keyword?: string;
  }) => void;
  onResetFilters: () => void;
  isLoading?: boolean;
}

