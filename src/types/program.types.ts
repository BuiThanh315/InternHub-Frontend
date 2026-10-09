
export interface DepartmentResponse {
  id: number;
  name: string;
  code: string;
  description?: string;
  status: string;
  plannedCapacityQuota?: number;
  leadMentorName?: string;
}
export type Department = DepartmentResponse;

export interface MentorRosterItem {
  mentorId: number;
  mentorName: string;
  email: string;
  avatarUrl?: string | null;
  activeInternCount: number;
  workloadStatus: 'AVAILABLE' | 'STANDARD' | 'OVERLOAD';
}

export interface DepartmentCapacityItem {
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  description?: string;
  leadMentorName?: string;
  plannedCapacityQuota: number;
  activeInternCount: number;
  activeMentorCount: number;
  utilizationRate: number;
  qualityScoreAvg: number;
  activeProgramsCount: number;
  mentors: MentorRosterItem[];
}

export interface DepartmentCapacityOverview {
  companySummary: {
    totalDepartments: number;
    totalActiveInterns: number;
    totalPlannedQuota: number;
    totalActiveMentors: number;
    overallUtilizationRate: number;
  };
  departments: DepartmentCapacityItem[];
}


export type ProgramStatusType = 'PLANNING' | 'OPEN' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface ProgramDetailResponse {
  id: number;
  programCode: string;
  name: string;
  departmentId: number;
  departmentName: string;
  departmentCode: string;
  description?: string;
  maxInterns: number;
  currentInterns: number;
  availableSlots: number;
  pendingApplicationsCount?: number;
  startDate: string;
  endDate: string;
  durationWeeks: number;
  status: ProgramStatusType;
  statusDisplayName: string;
  isRecruitmentOpen: boolean;
  isHistorical: boolean;
  cancellationReason?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}
export type ProgramDetail = ProgramDetailResponse;

export interface ProgramSummaryResponse {
  id: number;
  programCode: string;
  name: string;
  departmentName: string;
  description?: string;
  startDate: string;
  endDate: string;
  durationWeeks: number;
  maxInterns?: number;
  currentInterns?: number;
  pendingApplicationsCount?: number;
  isRecruitmentOpen?: boolean;
  status: ProgramStatusType;
  statusDisplayName: string;
}

export type ProgramSummary = ProgramSummaryResponse;

export interface CreateProgramRequest {
  name: string;
  departmentId: number;
  description?: string;
  maxInterns?: number;
  currentInterns?: number;
  startDate: string;
  endDate: string;
  isHistorical?: boolean;
}
export type CreateProgramPayload = CreateProgramRequest;

export interface UpdateProgramRequest {
  name: string;
  departmentId: number;
  description?: string;
  maxInterns?: number;
  startDate?: string;
  endDate: string;
}
export type UpdateProgramPayload = UpdateProgramRequest;

export interface ProgramFilterRequest {
  keyword?: string;
  departmentId?: number;
  status?: string;
  isHistorical?: boolean;
  startDateFrom?: string;
  startDateTo?: string;
  page?: number;
  size?: number;
  sort?: string;
}
export type ProgramFilterParams = ProgramFilterRequest;

export interface ChangeProgramStatusRequest {
  targetStatus: ProgramStatusType;
  cancellationReason?: string;
}
export type ChangeProgramStatusPayload = ChangeProgramStatusRequest;

export interface ExcelRowError {
  rowNumber: number;
  fieldName: string;
  cellValue?: string;
  errorMessage: string;
}

export interface ExcelInternRow {
  rowNumber: number;
  fullName: string;
  email: string;
  phone: string;
  gender?: string;
  dateOfBirth?: string;
  university: string;
  major: string;
  academicYear?: string;
  address?: string;
  appliedPosition?: string;
  notes?: string;
}

export interface ExcelImportPreviewResponse {
  programId: number;
  programName: string;
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  availableSlots: number;
  isQuotaExceeded: boolean;
  errors: ExcelRowError[];
  previewRows: ExcelInternRow[];
}

export interface ExcelImportResultResponse {
  programId: number;
  programName: string;
  importedCount: number;
  currentInterns: number;
  maxInterns: number;
  importedInternCodes: string[];
  importedAt: string;
}

export interface AssignMentorToProgramRequest {
  mentorId: number;
  notes?: string;
}

export interface AssignMentorToProgramResponse {
  programId: number;
  programName: string;
  mentorId: number;
  mentorName: string;
  mentorEmail: string;
  totalAssignedInterns: number;
  replacedMentorsCount: number;
  affectedInternCodes: string[];
  assignedAt: string;
}

