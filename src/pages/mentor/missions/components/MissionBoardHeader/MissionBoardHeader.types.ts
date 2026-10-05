import type {
  MentorProgramResponse,
  MissionBoardResponse,
  AssigneeResponse,
  MissionPriority,
} from '../../../../../types';

export interface MissionBoardHeaderProps {
  programs: MentorProgramResponse[];
  selectedProgramId: number | null;
  onSelectProgram: (programId: number) => void;

  boards: MissionBoardResponse[];
  activeBoardId: number | null;
  onSelectBoard: (boardId: number) => void;

  completionPercentage: number;
  totalItems: number;
  completedItems: number;

  searchQuery: string;
  onSearchChange: (query: string) => void;

  programInterns: AssigneeResponse[];
  selectedAssigneeId: number | null;
  onSelectAssignee: (assigneeId: number | null) => void;

  selectedPriority: MissionPriority | null;
  onSelectPriority: (priority: MissionPriority | null) => void;

  onCreateBoard: () => void;
  onEditBoard: () => void;
  onDeleteBoard: () => void;
  onCreateItem: () => void;

  className?: string;
}
