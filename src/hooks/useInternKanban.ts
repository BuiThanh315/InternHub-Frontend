import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { missionService } from '../services/missionService';
import type {
  InternKanbanBoardResponse,
  MissionItemResponse,
  MissionItemStatus,
  MissionPriority,
  UpdateKanbanStatusRequest,
} from '../types';

export interface InternKanbanFilters {
  searchQuery: string;
  selectedPriority: MissionPriority | null;
  filterOverdueOnly: boolean;
}

export interface UseInternKanbanReturn {
  // Raw & Counts
  rawKanban: InternKanbanBoardResponse | null;
  totalCount: number;
  todoCount: number;
  inProgressCount: number;
  completedCount: number;

  // Filtered Items for 3 Kanban Columns
  todoItems: MissionItemResponse[];
  inProgressItems: MissionItemResponse[];
  completedItems: MissionItemResponse[];
  totalFilteredCount: number;

  // Filters State & Setters
  filters: InternKanbanFilters;
  setSearchQuery: (query: string) => void;
  setSelectedPriority: (priority: MissionPriority | null) => void;
  setFilterOverdueOnly: (overdueOnly: boolean) => void;
  resetFilters: () => void;

  // Async States
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;

  // Actions
  refreshKanban: () => Promise<void>;
  updateTaskStatus: (
    itemId: number,
    newStatus: MissionItemStatus,
    submissionUrl?: string | null,
    completionNote?: string | null
  ) => Promise<boolean>;
}

const isCancelError = (error: any): boolean =>
  axios.isCancel(error) ||
  error?.name === 'CanceledError' ||
  error?.name === 'AbortError' ||
  error?.code === 'ERR_CANCELED' ||
  error?.message === 'canceled';

export const useInternKanban = (): UseInternKanbanReturn => {
  const [kanbanData, setKanbanData] = useState<InternKanbanBoardResponse | null>(null);

  // Grouped Filters State
  const [filters, setFilters] = useState<InternKanbanFilters>({
    searchQuery: '',
    selectedPriority: null,
    filterOverdueOnly: false,
  });

  // Grouped Async Status
  const [asyncState, setAsyncState] = useState<{
    isLoading: boolean;
    isMutating: boolean;
    error: string | null;
  }>({
    isLoading: true,
    isMutating: false,
    error: null,
  });

  // Tải dữ liệu Kanban từ Backend
  const fetchKanban = useCallback(async (signal?: AbortSignal) => {
    try {
      setAsyncState((prev) => ({ ...prev, isLoading: true, error: null }));
      const data = await missionService.getMyMissionKanban(signal);
      setKanbanData(data);
    } catch (err: any) {
      if (isCancelError(err)) return;
      const errorMsg =
        err.response?.data?.message || err.message || 'Không thể tải bảng nhiệm vụ cá nhân';
      setAsyncState((prev) => ({ ...prev, error: errorMsg }));
      toast.error(errorMsg);
    } finally {
      setAsyncState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchKanban(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchKanban]);

  // Cập nhật trạng thái nhiệm vụ (TODO <-> IN_PROGRESS <-> COMPLETED)
  const updateTaskStatus = useCallback(
    async (
      itemId: number,
      newStatus: MissionItemStatus,
      submissionUrl?: string | null,
      completionNote?: string | null
    ): Promise<boolean> => {
      setAsyncState((prev) => ({ ...prev, isMutating: true }));

      try {
        const payload: UpdateKanbanStatusRequest = {
          status: newStatus,
          submissionUrl: submissionUrl?.trim() || null,
          completionNote: completionNote?.trim() || null,
        };

        const updatedItem = await missionService.updateMyMissionStatus(itemId, payload);

        // Cập nhật State tức thì (Optimistic-style state update)
        setKanbanData((prev) => {
          if (!prev) return prev;

          // Loại bỏ item khỏi cả 3 danh sách
          const filterOut = (list: MissionItemResponse[]) =>
            list.filter((it) => it.id !== itemId);

          const nextTodo = filterOut(prev.todoItems);
          const nextInProgress = filterOut(prev.inProgressItems);
          const nextCompleted = filterOut(prev.completedItems);

          // Thêm item đã cập nhật vào danh sách tương ứng
          if (newStatus === 'TODO') nextTodo.unshift(updatedItem);
          else if (newStatus === 'IN_PROGRESS') nextInProgress.unshift(updatedItem);
          else if (newStatus === 'COMPLETED') nextCompleted.unshift(updatedItem);

          return {
            ...prev,
            todoItems: nextTodo,
            inProgressItems: nextInProgress,
            completedItems: nextCompleted,
            todoCount: nextTodo.length,
            inProgressCount: nextInProgress.length,
            completedCount: nextCompleted.length,
          };
        });

        // Thông báo phản hồi người dùng
        if (newStatus === 'IN_PROGRESS') {
          toast.success('Đã bắt đầu thực hiện nhiệm vụ!');
        } else if (newStatus === 'COMPLETED') {
          toast.success('Đã hoàn thành và nộp kết quả cho Mentor nghiệm thu!');
        } else {
          toast.success('Đã chuyển nhiệm vụ về trạng thái Chưa làm.');
        }

        return true;
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || err.message || 'Cập nhật trạng thái nhiệm vụ thất bại';
        toast.error(errorMsg);
        return false;
      } finally {
        setAsyncState((prev) => ({ ...prev, isMutating: false }));
      }
    },
    []
  );

  // Setters cho bộ lọc
  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const setSelectedPriority = useCallback((priority: MissionPriority | null) => {
    setFilters((prev) => ({ ...prev, selectedPriority: priority }));
  }, []);

  const setFilterOverdueOnly = useCallback((overdueOnly: boolean) => {
    setFilters((prev) => ({ ...prev, filterOverdueOnly: overdueOnly }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      selectedPriority: null,
      filterOverdueOnly: false,
    });
  }, []);

  // Hàm lọc từng item theo tiêu chí
  const isItemMatchingFilters = useCallback(
    (item: MissionItemResponse): boolean => {
      // 1. Lọc theo từ khóa tìm kiếm (Title, Description, BoardTitle)
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.trim().toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query);
        const matchBoard = item.boardTitle?.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchBoard) return false;
      }

      // 2. Lọc theo độ ưu tiên
      if (filters.selectedPriority && item.priority !== filters.selectedPriority) {
        return false;
      }

      // 3. Lọc chỉ xem việc quá hạn
      if (filters.filterOverdueOnly) {
        if (!item.dueDate || item.status === 'COMPLETED') return false;
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const due = new Date(item.dueDate);
        due.setHours(0, 0, 0, 0);
        if (due.getTime() >= now.getTime()) return false;
      }

      return true;
    },
    [filters]
  );

  // Lọc dữ liệu cho 3 cột Kanban
  const filteredTodoItems = useMemo(
    () => (kanbanData?.todoItems ?? []).filter(isItemMatchingFilters),
    [kanbanData?.todoItems, isItemMatchingFilters]
  );

  const filteredInProgressItems = useMemo(
    () => (kanbanData?.inProgressItems ?? []).filter(isItemMatchingFilters),
    [kanbanData?.inProgressItems, isItemMatchingFilters]
  );

  const filteredCompletedItems = useMemo(
    () => (kanbanData?.completedItems ?? []).filter(isItemMatchingFilters),
    [kanbanData?.completedItems, isItemMatchingFilters]
  );

  const totalFilteredCount = useMemo(
    () =>
      filteredTodoItems.length +
      filteredInProgressItems.length +
      filteredCompletedItems.length,
    [filteredTodoItems, filteredInProgressItems, filteredCompletedItems]
  );

  return {
    rawKanban: kanbanData,
    totalCount: kanbanData?.totalCount ?? 0,
    todoCount: kanbanData?.todoCount ?? 0,
    inProgressCount: kanbanData?.inProgressCount ?? 0,
    completedCount: kanbanData?.completedCount ?? 0,

    todoItems: filteredTodoItems,
    inProgressItems: filteredInProgressItems,
    completedItems: filteredCompletedItems,
    totalFilteredCount,

    filters,
    setSearchQuery,
    setSelectedPriority,
    setFilterOverdueOnly,
    resetFilters,

    isLoading: asyncState.isLoading,
    isMutating: asyncState.isMutating,
    error: asyncState.error,

    refreshKanban: () => fetchKanban(),
    updateTaskStatus,
  };
};
