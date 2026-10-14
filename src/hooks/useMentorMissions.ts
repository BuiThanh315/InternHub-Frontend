import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { missionService } from '../services/missionService';
import { groupService } from '../services/groupService';
import type {
  MentorProgramResponse,
  AssigneeResponse,
  MissionBoardResponse,
  MissionBoardDetailResponse,
  MissionItemResponse,
  MissionItemStatus,
  MissionPriority,
  CreateMissionBoardRequest,
  UpdateMissionBoardRequest,
  CreateMissionItemRequest,
  UpdateMissionItemRequest,
} from '../types';
import type { InternGroup, BatchGroupItem } from '../types/group.types';

export interface UseMentorMissionsReturn {
  // Programs & Interns
  programs: MentorProgramResponse[];
  selectedProgramId: number | null;
  setSelectedProgramId: (id: number | null) => void;
  programInterns: AssigneeResponse[];

  // Groups
  groups: InternGroup[];
  isLoadingGroups: boolean;
  loadGroups: (programId: number) => Promise<void>;
  batchApplyGroups: (payloadGroups: BatchGroupItem[]) => Promise<boolean>;
  disbandGroup: (groupId: number) => Promise<boolean>;

  // Workload Matrix
  internWorkloadMap: Record<number, number>;

  // Boards
  boards: MissionBoardResponse[];
  activeBoardId: number | null;
  setActiveBoardId: (id: number | null) => void;
  activeBoardDetail: MissionBoardDetailResponse | null;

  // Filter & Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedAssigneeId: number | null;
  setSelectedAssigneeId: (id: number | null) => void;
  selectedPriority: MissionPriority | null;
  setSelectedPriority: (priority: MissionPriority | null) => void;

  // Categorized Items
  todoItems: MissionItemResponse[];
  inProgressItems: MissionItemResponse[];
  completedItems: MissionItemResponse[];
  totalFilteredCount: number;
  completionPercentage: number;

  // States
  isLoadingPrograms: boolean;
  isLoadingBoard: boolean;
  isMutating: boolean;
  error: string | null;

  // Actions
  refreshAll: () => Promise<void>;
  createBoard: (payload: Omit<CreateMissionBoardRequest, 'programId'>) => Promise<boolean>;
  updateBoard: (boardId: number, payload: UpdateMissionBoardRequest) => Promise<boolean>;
  deleteBoard: (boardId: number) => Promise<boolean>;
  createItem: (payload: CreateMissionItemRequest) => Promise<boolean>;
  quickCreateItem: (title: string) => Promise<boolean>;
  updateItem: (itemId: number, payload: UpdateMissionItemRequest) => Promise<boolean>;
  updateItemStatus: (itemId: number, status: MissionItemStatus) => Promise<boolean>;
  deleteItem: (itemId: number) => Promise<boolean>;
}

export const useMentorMissions = (): UseMentorMissionsReturn => {
  // Programs
  const [programs, setPrograms] = useState<MentorProgramResponse[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [programInterns, setProgramInterns] = useState<AssigneeResponse[]>([]);

  // Groups
  const [groups, setGroups] = useState<InternGroup[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  // Boards
  const [boards, setBoards] = useState<MissionBoardResponse[]>([]);
  const [activeBoardId, setActiveBoardId] = useState<number | null>(null);
  const [activeBoardDetail, setActiveBoardDetail] = useState<MissionBoardDetailResponse | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssigneeId, setSelectedAssigneeId] = useState<number | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<MissionPriority | null>(null);

  // Loaders
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(true);
  const [isLoadingBoard, setIsLoadingBoard] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper kiểm tra request bị cancel/abort do React Strict Mode hoặc đổi tab
  const isAbortOrCancelError = (err: any): boolean =>
    axios.isCancel(err) ||
    err?.name === 'CanceledError' ||
    err?.name === 'AbortError' ||
    err?.code === 'ERR_CANCELED' ||
    err?.message === 'canceled' ||
    Boolean(err?.originalError && isAbortOrCancelError(err.originalError));

  // Tải danh sách nhóm riêng lẻ
  const loadGroups = useCallback(async (programId: number) => {
    try {
      setIsLoadingGroups(true);
      const data = await groupService.getGroups(programId);
      setGroups(data || []);
    } catch (err: any) {
      if (!isAbortOrCancelError(err)) {
        toast.error('Không thể tải danh sách nhóm của chương trình');
      }
    } finally {
      setIsLoadingGroups(false);
    }
  }, []);

  // 1. Tải danh sách Programs mà Mentor phụ trách
  const loadPrograms = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoadingPrograms(true);
      setError(null);
      const data = await missionService.getMyMentoredPrograms(signal);
      setPrograms(data);
    } catch (err: any) {
      if (isAbortOrCancelError(err)) {
        return;
      }
      setError(err.message || 'Lỗi khi tải danh sách chương trình');
      toast.error('Không thể tải danh sách chương trình phụ trách');
    } finally {
      setIsLoadingPrograms(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadPrograms(controller.signal);
    return () => controller.abort();
  }, [loadPrograms]);

  // 2. Khi selectedProgramId thay đổi: Tải danh sách TTS, Boards và Groups trong Program
  const loadProgramData = useCallback(async (programId: number, signal?: AbortSignal) => {
    try {
      setIsLoadingBoard(true);
      setIsLoadingGroups(true);
      setError(null);

      const [internsRes, boardsRes, groupsRes] = await Promise.all([
        missionService.getProgramInterns(programId, signal),
        missionService.getBoardsByProgram(programId, signal),
        groupService.getGroups(programId).catch(() => [] as InternGroup[]),
      ]);

      setProgramInterns(internsRes);
      setBoards(boardsRes);
      setGroups(groupsRes || []);

      // Tự động chọn board đầu tiên nếu có
      if (boardsRes.length > 0) {
        setActiveBoardId(boardsRes[0].id);
      } else {
        setActiveBoardId(null);
        setActiveBoardDetail(null);
      }
    } catch (err: any) {
      if (isAbortOrCancelError(err)) {
        return;
      }
      setError(err.message || 'Lỗi khi tải dữ liệu chương trình');
      toast.error('Không thể tải danh sách bảng nhiệm vụ');
    } finally {
      setIsLoadingBoard(false);
      setIsLoadingGroups(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedProgramId) return;
    const controller = new AbortController();
    void loadProgramData(selectedProgramId, controller.signal);
    return () => controller.abort();
  }, [selectedProgramId, loadProgramData]);

  // Helper trích xuất toàn bộ items từ activeBoardDetail (hỗ trợ cả items hoặc 3 mảng riêng lẻ)
  const extractAllItems = useCallback((detail: MissionBoardDetailResponse | null): MissionItemResponse[] => {
    if (!detail) return [];
    if (Array.isArray(detail.items) && detail.items.length > 0) {
      return detail.items;
    }
    const todo = Array.isArray(detail.todoItems) ? detail.todoItems : [];
    const inProgress = Array.isArray(detail.inProgressItems) ? detail.inProgressItems : [];
    const completed = Array.isArray(detail.completedItems) ? detail.completedItems : [];
    return [...todo, ...inProgress, ...completed];
  }, []);

  // 3. Khi activeBoardId thay đổi: Tải chi tiết Board kèm Items
  const loadBoardDetail = useCallback(async (boardId: number, signal?: AbortSignal) => {
    try {
      setIsLoadingBoard(true);
      const detail = await missionService.getBoardDetail(boardId, signal);
      const allItems = extractAllItems(detail);
      setActiveBoardDetail({
        ...detail,
        items: allItems,
      });
    } catch (err: any) {
      if (isAbortOrCancelError(err)) {
        return;
      }
      toast.error('Không thể tải chi tiết bảng nhiệm vụ');
    } finally {
      setIsLoadingBoard(false);
    }
  }, [extractAllItems]);

  useEffect(() => {
    if (!activeBoardId) {
      setActiveBoardDetail(null);
      return;
    }
    const controller = new AbortController();
    void loadBoardDetail(activeBoardId, controller.signal);
    return () => controller.abort();
  }, [activeBoardId, loadBoardDetail]);

  // 4. Lọc items theo Search, Assignee và Priority
  const allCurrentItems = useMemo(() => {
    return extractAllItems(activeBoardDetail);
  }, [activeBoardDetail, extractAllItems]);

  const filteredItems = useMemo(() => {
    return allCurrentItems.filter((item) => {
      // Tìm kiếm theo tiêu đề hoặc mô tả
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      // Lọc theo Thực tập sinh
      const matchesAssignee =
        selectedAssigneeId === null ||
        (Array.isArray(item.assignees) && item.assignees.some((a) => a.id === selectedAssigneeId));

      // Lọc theo Độ ưu tiên
      const matchesPriority =
        selectedPriority === null || item.priority === selectedPriority;

      return matchesSearch && matchesAssignee && matchesPriority;
    });
  }, [allCurrentItems, searchQuery, selectedAssigneeId, selectedPriority]);

  // Phân loại items theo 3 cột Kanban
  const todoItems = useMemo(
    () => filteredItems.filter((i) => i.status === 'TODO'),
    [filteredItems]
  );
  const inProgressItems = useMemo(
    () => filteredItems.filter((i) => i.status === 'IN_PROGRESS'),
    [filteredItems]
  );
  const completedItems = useMemo(
    () => filteredItems.filter((i) => i.status === 'COMPLETED'),
    [filteredItems]
  );

  // Tính phần trăm hoàn thành
  const completionPercentage = useMemo(() => {
    const total = allCurrentItems.length;
    if (total === 0) return 0;
    const completed = allCurrentItems.filter((i) => i.status === 'COMPLETED').length;
    return Math.round((completed / total) * 100);
  }, [allCurrentItems]);

  // Ma trận tải trọng học viên: Đếm số lượng task chưa hoàn thành (TODO + IN_PROGRESS)
  const internWorkloadMap = useMemo(() => {
    const map: Record<number, number> = {};
    allCurrentItems.forEach((item) => {
      if (item.status !== 'COMPLETED' && Array.isArray(item.assignees)) {
        item.assignees.forEach((a) => {
          map[a.id] = (map[a.id] || 0) + 1;
        });
      }
    });
    return map;
  }, [allCurrentItems]);

  // Actions quản lý nhóm
  const batchApplyGroups = async (payloadGroups: BatchGroupItem[]): Promise<boolean> => {
    if (!selectedProgramId) {
      toast.error('Vui lòng chọn chương trình thực tập');
      return false;
    }
    try {
      setIsMutating(true);
      const res = await groupService.batchApplyGroups(selectedProgramId, { groups: payloadGroups });
      setGroups(res);
      toast.success('Lưu và áp dụng danh sách nhóm thành công!');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu và áp dụng nhóm');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const disbandGroup = async (groupId: number): Promise<boolean> => {
    if (!selectedProgramId) return false;
    try {
      setIsMutating(true);
      await groupService.disbandGroup(selectedProgramId, groupId);
      toast.success('Đã giải tán nhóm thành công!');
      await loadGroups(selectedProgramId);
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi giải tán nhóm');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  // Tạo nhanh công việc ở chân cột TODO
  const quickCreateItem = async (title: string): Promise<boolean> => {
    if (!title.trim()) return false;
    return await createItem({
      title: title.trim(),
      priority: 'MEDIUM',
      assigneeInternIds: [],
      internIds: [],
    });
  };

  // Refresh toàn bộ dữ liệu
  const refreshAll = async () => {
    if (selectedProgramId) {
      await loadProgramData(selectedProgramId);
      if (activeBoardId) {
        await loadBoardDetail(activeBoardId);
      }
    }
  };

  // 5. Actions / Mutations

  // Tạo Board
  const createBoard = async (payload: Omit<CreateMissionBoardRequest, 'programId'>): Promise<boolean> => {
    if (!selectedProgramId) {
      toast.error('Vui lòng chọn chương trình thực tập trước');
      return false;
    }
    try {
      setIsMutating(true);
      const newBoard = await missionService.createBoard({
        ...payload,
        programId: selectedProgramId,
      });
      toast.success(`Tạo bảng nhiệm vụ "${newBoard.title}" thành công!`);
      const updatedBoards = await missionService.getBoardsByProgram(selectedProgramId);
      setBoards(updatedBoards);
      setActiveBoardId(newBoard.id);
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tạo bảng nhiệm vụ');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  // Cập nhật Board
  const updateBoard = async (boardId: number, payload: UpdateMissionBoardRequest): Promise<boolean> => {
    try {
      setIsMutating(true);
      const updated = await missionService.updateBoard(boardId, payload);
      toast.success(`Cập nhật bảng "${updated.title}" thành công!`);
      if (selectedProgramId) {
        const updatedBoards = await missionService.getBoardsByProgram(selectedProgramId);
        setBoards(updatedBoards);
      }
      if (activeBoardId === boardId) {
        await loadBoardDetail(boardId);
      }
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật bảng');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  // Xóa Board
  const deleteBoard = async (boardId: number): Promise<boolean> => {
    try {
      setIsMutating(true);
      await missionService.deleteBoard(boardId);
      toast.success('Đã xóa bảng nhiệm vụ thành công!');
      if (selectedProgramId) {
        const updatedBoards = await missionService.getBoardsByProgram(selectedProgramId);
        setBoards(updatedBoards);
        if (updatedBoards.length > 0) {
          setActiveBoardId(updatedBoards[0].id);
        } else {
          setActiveBoardId(null);
          setActiveBoardDetail(null);
        }
      }
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa bảng');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  // Tạo công việc
  const createItem = async (payload: CreateMissionItemRequest): Promise<boolean> => {
    if (!activeBoardId) {
      toast.error('Chưa có bảng nhiệm vụ nào được chọn');
      return false;
    }
    try {
      setIsMutating(true);
      await missionService.createItem(activeBoardId, payload);
      toast.success('Giao công việc mới thành công!');
      await loadBoardDetail(activeBoardId);
      if (selectedProgramId) {
        const updatedBoards = await missionService.getBoardsByProgram(selectedProgramId);
        setBoards(updatedBoards);
      }
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi giao việc');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  // Cập nhật công việc
  const updateItem = async (itemId: number, payload: UpdateMissionItemRequest): Promise<boolean> => {
    try {
      setIsMutating(true);
      await missionService.updateItem(itemId, payload);
      toast.success('Cập nhật công việc thành công!');
      if (activeBoardId) {
        await loadBoardDetail(activeBoardId);
      }
      if (selectedProgramId) {
        const updatedBoards = await missionService.getBoardsByProgram(selectedProgramId);
        setBoards(updatedBoards);
      }
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật công việc');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  // Cập nhật trạng thái nhanh (Quick transition)
  const updateItemStatus = async (itemId: number, status: MissionItemStatus): Promise<boolean> => {
    try {
      // Optimistic update an toàn với extractAllItems
      if (activeBoardDetail) {
        setActiveBoardDetail((prev) => {
          if (!prev) return prev;
          const currentItems = extractAllItems(prev);
          const updatedItems = currentItems.map((i) => (i.id === itemId ? { ...i, status } : i));
          return {
            ...prev,
            items: updatedItems,
            todoItems: updatedItems.filter((i) => i.status === 'TODO'),
            inProgressItems: updatedItems.filter((i) => i.status === 'IN_PROGRESS'),
            completedItems: updatedItems.filter((i) => i.status === 'COMPLETED'),
          };
        });
      }

      await missionService.updateItemStatus(itemId, { status });
      const statusLabels: Record<MissionItemStatus, string> = {
        TODO: 'Chưa làm',
        IN_PROGRESS: 'Đang làm',
        COMPLETED: 'Hoàn thiện',
      };
      toast.success(`Đã chuyển công việc sang trạng thái "${statusLabels[status]}"`);
      if (activeBoardId) {
        await loadBoardDetail(activeBoardId);
      }
      if (selectedProgramId) {
        const updatedBoards = await missionService.getBoardsByProgram(selectedProgramId);
        setBoards(updatedBoards);
      }
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi cập nhật trạng thái');
      if (activeBoardId) {
        await loadBoardDetail(activeBoardId);
      }
      return false;
    }
  };

  // Xóa công việc
  const deleteItem = async (itemId: number): Promise<boolean> => {
    try {
      setIsMutating(true);
      await missionService.deleteItem(itemId);
      toast.success('Đã xóa công việc thành công!');
      if (activeBoardId) {
        await loadBoardDetail(activeBoardId);
      }
      if (selectedProgramId) {
        const updatedBoards = await missionService.getBoardsByProgram(selectedProgramId);
        setBoards(updatedBoards);
      }
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa công việc');
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    programs,
    selectedProgramId,
    setSelectedProgramId,
    programInterns,
    groups,
    isLoadingGroups,
    loadGroups,
    batchApplyGroups,
    disbandGroup,
    internWorkloadMap,
    boards,
    activeBoardId,
    setActiveBoardId,
    activeBoardDetail,
    searchQuery,
    setSearchQuery,
    selectedAssigneeId,
    setSelectedAssigneeId,
    selectedPriority,
    setSelectedPriority,
    todoItems,
    inProgressItems,
    completedItems,
    totalFilteredCount: filteredItems.length,
    completionPercentage,
    isLoadingPrograms,
    isLoadingBoard,
    isMutating,
    error,
    refreshAll,
    createBoard,
    updateBoard,
    deleteBoard,
    createItem,
    quickCreateItem,
    updateItem,
    updateItemStatus,
    deleteItem,
  };
};
