export type MissionItemStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export type MissionPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type BoardStatus = 'ACTIVE' | 'ARCHIVED';

export interface AssigneeResponse {
  id: number;
  userId?: number;
  internCode: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
}

export interface MissionItemResponse {
  id: number;
  boardId: number;
  title: string;
  description?: string | null;
  status: MissionItemStatus;
  priority: MissionPriority;
  dueDate?: string | null;
  assignees: AssigneeResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface MissionBoardResponse {
  id: number;
  programId: number;
  programName: string;
  mentorId: number;
  mentorName: string;
  title: string;
  description?: string | null;
  status: BoardStatus;
  dueDate?: string | null;
  totalItems: number;
  todoCount?: number;
  inProgressCount?: number;
  completedCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MissionBoardDetailResponse extends MissionBoardResponse {
  items?: MissionItemResponse[];
  todoItems?: MissionItemResponse[];
  inProgressItems?: MissionItemResponse[];
  completedItems?: MissionItemResponse[];
}

export interface MentorProgramResponse {
  id?: number;
  programId: number;
  programCode: string;
  name: string;
  departmentId?: number;
  departmentName?: string;
  startDate: string;
  endDate: string;
  status: string;
  totalInterns?: number;
  activeInterns?: number;
}

export interface CreateMissionBoardRequest {
  programId: number;
  title: string;
  description?: string;
  dueDate?: string;
}

export interface UpdateMissionBoardRequest {
  title?: string;
  description?: string;
  dueDate?: string;
}

export interface CreateMissionItemRequest {
  title: string;
  description?: string;
  priority?: MissionPriority;
  dueDate?: string;
  assigneeInternIds?: number[];
}

export interface UpdateMissionItemRequest {
  title?: string;
  description?: string;
  priority?: MissionPriority;
  dueDate?: string;
  assigneeInternIds?: number[];
}

export interface UpdateItemStatusRequest {
  status: MissionItemStatus;
}
