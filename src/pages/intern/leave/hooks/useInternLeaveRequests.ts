import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { leaveService } from '../../../../services/leaveService';
import type {
  LeaveRequestSummaryResponse,
  LeaveStatus,
  CreateLeaveRequest,
} from '../../../../types';

interface FilterState {
  status?: LeaveStatus;
  year?: number;
  page: number; // 1-indexed for UI
  size: number;
}

interface DataState {
  requests: LeaveRequestSummaryResponse[];
  totalElements: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

interface ModalState {
  isCreateOpen: boolean;
  detailId: number | null;
  cancellingItem: LeaveRequestSummaryResponse | null;
  isSubmitting: boolean;
}

export interface UseInternLeaveRequestsReturn {
  // Data & Status
  requests: LeaveRequestSummaryResponse[];
  totalElements: number;
  totalPages: number;
  loading: boolean;
  error: string | null;

  // Filters & Pagination (1-indexed)
  status?: LeaveStatus;
  year?: number;
  page: number;
  size: number;
  setStatus: (status?: LeaveStatus) => void;
  setYear: (year?: number) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;

  // Modals state
  isCreateOpen: boolean;
  detailId: number | null;
  cancellingItem: LeaveRequestSummaryResponse | null;
  isSubmitting: boolean;

  // Modal actions
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openDetailModal: (id: number) => void;
  closeDetailModal: () => void;
  openCancelModal: (item: LeaveRequestSummaryResponse) => void;
  closeCancelModal: () => void;

  // Mutations
  handleCreateLeave: (data: CreateLeaveRequest) => Promise<boolean>;
  handleCancelLeave: () => Promise<boolean>;
  refetch: () => Promise<void>;
}

export const useInternLeaveRequests = (): UseInternLeaveRequestsReturn => {
  const currentYear = new Date().getFullYear();

  // State 1: Filters & Pagination
  const [filter, setFilter] = useState<FilterState>({
    status: undefined,
    year: currentYear,
    page: 1, // 1-indexed
    size: 10, // Chuẩn tối đa 10 dòng theo Rule 31
  });

  // State 2: Dữ liệu tải từ Backend
  const [dataState, setDataState] = useState<DataState>({
    requests: [],
    totalElements: 0,
    totalPages: 0,
    loading: true,
    error: null,
  });

  // State 3: Quản lý trạng thái các Modals
  const [modalState, setModalState] = useState<ModalState>({
    isCreateOpen: false,
    detailId: null,
    cancellingItem: null,
    isSubmitting: false,
  });

  // Gọi API tải danh sách đơn (chuyển đổi 1-indexed UI ➔ 0-indexed Spring Boot)
  const fetchRequests = useCallback(
    async (currentFilter: FilterState, signal?: AbortSignal) => {
      try {
        setDataState((prev) => ({ ...prev, loading: true, error: null }));
        const response = await leaveService.getMyLeaveRequests(
          {
            status: currentFilter.status,
            year: currentFilter.year,
            page: currentFilter.page - 1, // 0-indexed backend
            size: currentFilter.size,
          },
          signal
        );

        setDataState({
          requests: response.content || response.items || [],
          totalElements: response.totalElements ?? response.totalItems ?? 0,
          totalPages: response.totalPages ?? 0,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          const message =
            err.response?.data?.message ||
            err.message ||
            'Không thể tải danh sách đơn xin nghỉ phép.';
          setDataState((prev) => ({
            ...prev,
            loading: false,
            error: message,
          }));
        }
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchRequests(filter, controller.signal);
    return () => controller.abort();
  }, [filter, fetchRequests]);

  // Bộ lọc
  const setStatus = useCallback((status?: LeaveStatus) => {
    setFilter((prev) => ({ ...prev, status, page: 1 }));
  }, []);

  const setYear = useCallback((year?: number) => {
    setFilter((prev) => ({ ...prev, year, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setFilter((prev) => ({ ...prev, page }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilter({
      status: undefined,
      year: currentYear,
      page: 1,
      size: 10,
    });
  }, [currentYear]);

  // Modal controls
  const openCreateModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isCreateOpen: true }));
  }, []);

  const closeCreateModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, isCreateOpen: false }));
  }, []);

  const openDetailModal = useCallback((id: number) => {
    setModalState((prev) => ({ ...prev, detailId: id }));
  }, []);

  const closeDetailModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, detailId: null }));
  }, []);

  const openCancelModal = useCallback((item: LeaveRequestSummaryResponse) => {
    setModalState((prev) => ({ ...prev, cancellingItem: item }));
  }, []);

  const closeCancelModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, cancellingItem: null }));
  }, []);

  const refetch = useCallback(async () => {
    await fetchRequests(filter);
  }, [fetchRequests, filter]);

  // Thao tác nộp đơn mới (Mutation UX - Rule 24)
  const handleCreateLeave = useCallback(
    async (payload: CreateLeaveRequest): Promise<boolean> => {
      try {
        setModalState((prev) => ({ ...prev, isSubmitting: true }));
        await leaveService.createLeaveRequest(payload);
        toast.success(
          'Nộp đơn xin nghỉ phép thành công. Đơn của bạn đã được gửi tới Mentor phụ trách!'
        );
        closeCreateModal();
        await fetchRequests(filter);
        return true;
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          'Không thể nộp đơn xin nghỉ phép. Vui lòng kiểm tra lại.';
        toast.error(errorMsg);
        return false;
      } finally {
        setModalState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
    [closeCreateModal, fetchRequests, filter]
  );

  // Thao tác hủy đơn khi còn PENDING
  const handleCancelLeave = useCallback(async (): Promise<boolean> => {
    if (!modalState.cancellingItem) return false;
    try {
      setModalState((prev) => ({ ...prev, isSubmitting: true }));
      await leaveService.cancelLeaveRequest(modalState.cancellingItem.id);
      toast.success('Đã hủy đơn xin nghỉ phép thành công.');
      closeCancelModal();
      // Nếu modal chi tiết đang mở đúng đơn đó thì đóng luôn
      if (modalState.detailId === modalState.cancellingItem.id) {
        closeDetailModal();
      }
      await fetchRequests(filter);
      return true;
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Không thể hủy đơn xin nghỉ phép.';
      toast.error(errorMsg);
      return false;
    } finally {
      setModalState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [
    modalState.cancellingItem,
    modalState.detailId,
    closeCancelModal,
    closeDetailModal,
    fetchRequests,
    filter,
  ]);

  return {
    requests: dataState.requests,
    totalElements: dataState.totalElements,
    totalPages: dataState.totalPages,
    loading: dataState.loading,
    error: dataState.error,

    status: filter.status,
    year: filter.year,
    page: filter.page,
    size: filter.size,
    setStatus,
    setYear,
    setPage,
    resetFilters,

    isCreateOpen: modalState.isCreateOpen,
    detailId: modalState.detailId,
    cancellingItem: modalState.cancellingItem,
    isSubmitting: modalState.isSubmitting,

    openCreateModal,
    closeCreateModal,
    openDetailModal,
    closeDetailModal,
    openCancelModal,
    closeCancelModal,

    handleCreateLeave,
    handleCancelLeave,
    refetch,
  };
};
