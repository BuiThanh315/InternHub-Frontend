import type {
  MentorProgramResponse,
  AssigneeResponse,
  MissionBoardResponse,
  MissionBoardDetailResponse,
  MissionItemResponse,
  MissionItemStatus,
  MissionPriority,
} from '../../../../../types';
import type { InternGroup } from '../../../../../types/group.types';

export type WorkspaceTabKey = 'kanban' | 'interns' | 'reviews' | 'analytics';

export interface MentorProgramWorkspaceProps {
  program: MentorProgramResponse;
  onBackToHub: () => void;

  // Boards & Kanban
  boards: MissionBoardResponse[];
  activeBoardId: number | null;
  onSelectBoard: (boardId: number) => void;
  onCreateBoard: () => void;
  onEditBoard: () => void;
  onDeleteBoard: () => void;

  // Kanban Items
  todoItems: MissionItemResponse[];
  inProgressItems: MissionItemResponse[];
  completedItems: MissionItemResponse[];
  onCreateItem: (defaultStatus?: MissionItemStatus) => void;
  onEditItem: (item: MissionItemResponse) => void;
  onDeleteItem: (item: MissionItemResponse) => void;
  onStatusChange: (itemId: number, newStatus: MissionItemStatus) => void;
  onDropItem: (itemId: number, targetStatus: MissionItemStatus) => void;
  onQuickAdd: (title: string) => Promise<boolean>;

  // Filters
  searchQuery: string;
  onSearchChange: (val: string) => void;
  selectedAssigneeId: number | null;
  onSelectAssignee: (id: number | null) => void;
  selectedPriority: MissionPriority | null;
  onSelectPriority: (priority: MissionPriority | null) => void;

  // Interns & Groups
  programInterns: AssigneeResponse[];
  groups: InternGroup[];
  internWorkloadMap: Record<number, number>;
  onOpenGroupModal: () => void;
  onAssignTaskToIntern: (internId: number) => void;

  // Status & Detail
  activeBoardDetail: MissionBoardDetailResponse | null;
  completionPercentage: number;
  isLoadingBoard: boolean;
  className?: string;
}
