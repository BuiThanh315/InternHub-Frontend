import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { leaveService } from '../../../../services/leaveService';
import type { LeaveRequestSummaryResponse } from '../../../../types';

interface ApprovalDataState {
  pendingRequests: LeaveRequestSummaryResponse[];
  totalElements: number;
  totalPages: number;
  page: number; // 1-indexed
  size: number;
  loading: boolean;
  error: string | null;
}

interface ApprovalModalState {
  selectedItem: LeaveRequestSummaryResponse | null;
  isActionSubmitting: boolean;
}

export interface UseLeaveApprovalReturn {
  pendingRequests: LeaveRequestSummaryResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  loading: boolean;
  error: string | null;

  selectedItem: LeaveRequestSummaryResponse | null;
  isActionSubmitting: boolean;

  setPage: (page: number) => void;
  openApprovalModal: (item: LeaveRequestSummaryResponse) => void;
  closeApprovalModal: () => void;

  handleApprove: (id: number, approvalNote?: string) => Promise<boolean>;
  handleReject: (id: number, rejectionReason: string) => Promise<boolean>;
  refetch: () => Promise<void>;
}

export const useLeaveApproval = (): UseLeaveApprovalReturn => {
  const [dataState, setDataState] = useState<ApprovalDataState>({
    pendingRequests: [],
    totalElements: 0,
    totalPages: 0,
    page: 1, // 1-indexed
    size: 10,
    loading: true,
    error: null,
  });

  const [modalState, setModalState] = useState<ApprovalModalState>({
    selectedItem: null,
    isActionSubmitting: false,
  });

  const fetchPending = useCallback(
    async (pageIndex: number, pageSize: number, signal?: AbortSignal) => {
      try {
        setDataState((prev) => ({ ...prev, loading: true, error: null }));
        const response = await leaveService.getPendingRequests(
          pageIndex - 1, // 0-indexed backend
          pageSize,
          signal
        );

        setDataState((prev) => ({
          ...prev,
          pendingRequests: response.content || response.items || [],
          totalElements: response.totalElements ?? response.totalItems ?? 0,
          totalPages: response.totalPages ?? 0,
          loading: false,
          error: null,
        }));
      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          const message =
            err.response?.data?.message ||
            err.message ||
            'Không thể tải danh sách đơn chờ duyệt.';
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
    fetchPending(dataState.page, dataState.size, controller.signal);
    return () => controller.abort();
  }, [dataState.page, dataState.size, fetchPending]);

  const setPage = useCallback((newPage: number) => {
    setDataState((prev) => ({ ...prev, page: newPage }));
  }, []);

  const openApprovalModal = useCallback((item: LeaveRequestSummaryResponse) => {
    setModalState((prev) => ({ ...prev, selectedItem: item }));
  }, []);

  const closeApprovalModal = useCallback(() => {
    setModalState((prev) => ({ ...prev, selectedItem: null }));
  }, []);

  const refetch = useCallback(async () => {
    await fetchPending(dataState.page, dataState.size);
  }, [fetchPending, dataState.page, dataState.size]);

  const handleApprove = useCallback(
    async (id: number, approvalNote?: string): Promise<boolean> => {
      try {
        setModalState((prev) => ({ ...prev, isActionSubmitting: true }));
        await leaveService.approveLeaveRequest(id, { approvalNote });
        toast.success('Phê duyệt đơn xin nghỉ phép thành công.');
        closeApprovalModal();
        await fetchPending(dataState.page, dataState.size);
        return true;
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          'Không thể phê duyệt đơn xin nghỉ phép.';
        toast.error(errorMsg);
        return false;
      } finally {
        setModalState((prev) => ({ ...prev, isActionSubmitting: false }));
      }
    },
    [closeApprovalModal, fetchPending, dataState.page, dataState.size]
  );

  const handleReject = useCallback(
    async (id: number, rejectionReason: string): Promise<boolean> => {
      try {
        setModalState((prev) => ({ ...prev, isActionSubmitting: true }));
        await leaveService.rejectLeaveRequest(id, { rejectionReason });
        toast.success('Đã từ chối đơn xin nghỉ phép thành công.');
        closeApprovalModal();
        await fetchPending(dataState.page, dataState.size);
        return true;
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          'Không thể từ chối đơn xin nghỉ phép.';
        toast.error(errorMsg);
        return false;
      } finally {
        setModalState((prev) => ({ ...prev, isActionSubmitting: false }));
      }
    },
    [closeApprovalModal, fetchPending, dataState.page, dataState.size]
  );

  return {
    pendingRequests: dataState.pendingRequests,
    totalElements: dataState.totalElements,
    totalPages: dataState.totalPages,
    page: dataState.page,
    size: dataState.size,
    loading: dataState.loading,
    error: dataState.error,

    selectedItem: modalState.selectedItem,
    isActionSubmitting: modalState.isActionSubmitting,

    setPage,
    openApprovalModal,
    closeApprovalModal,
    handleApprove,
    handleReject,
    refetch,
  };
};
