import { useState, useCallback, useRef } from 'react';
import { attendanceService } from '../../../../services/attendanceService';
import type { InternAttendanceDetailReportResponse } from '../../../../types';

interface DetailState {
  isOpen: boolean;
  data: InternAttendanceDetailReportResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function useInternAttendanceDetail(month: number, year: number) {
  const [selectedInternId, setSelectedInternId] = useState<number | null>(null);
  const [detailState, setDetailState] = useState<DetailState>({
    isOpen: false,
    data: null,
    isLoading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const openDetail = useCallback(
    async (internId: number) => {
      setSelectedInternId(internId);
      setDetailState({
        isOpen: true,
        data: null,
        isLoading: true,
        error: null,
      });

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const detail = await attendanceService.getInternAttendanceDetailReport(
          internId,
          month,
          year,
          controller.signal
        );
        setDetailState({
          isOpen: true,
          data: detail,
          isLoading: false,
          error: null,
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'CanceledError') {
          return;
        }
        const message =
          err instanceof Error
            ? err.message
            : 'Không thể tải chi tiết bảng công của thực tập sinh';
        setDetailState((prev) => ({
          ...prev,
          isLoading: false,
          error: message,
        }));
      }
    },
    [month, year]
  );

  const closeDetail = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setSelectedInternId(null);
    setDetailState({
      isOpen: false,
      data: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    selectedInternId,
    isOpen: detailState.isOpen,
    detailData: detailState.data,
    isLoading: detailState.isLoading,
    error: detailState.error,
    openDetail,
    closeDetail,
  };
}
