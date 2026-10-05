import { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '../../../services/attendanceService';
import type { MonthlyAttendanceSummaryResponse } from '../../../types';

export interface UseAttendanceHistoryReturn {
  month: number;
  year: number;
  summaryData: MonthlyAttendanceSummaryResponse | null;
  loading: boolean;
  error: string | null;
  setMonth: (month: number) => void;
  setYear: (year: number) => void;
  goToCurrentMonth: () => void;
  refetch: () => Promise<void>;
}

export const useAttendanceHistory = (): UseAttendanceHistoryReturn => {
  const now = new Date();
  const [selectedFilter, setSelectedFilter] = useState<{ month: number; year: number }>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
  const [summaryData, setSummaryData] = useState<MonthlyAttendanceSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(
    async (m: number, y: number, signal?: AbortSignal) => {
      try {
        setLoading(true);
        setError(null);
        const data = await attendanceService.getMyAttendanceHistory(
          { month: m, year: y },
          signal
        );
        setSummaryData(data);
      } catch (err: any) {
        if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
          const message =
            err.response?.data?.message ||
            err.message ||
            'Không thể tải lịch sử chấm công.';
          setError(message);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchHistory(selectedFilter.month, selectedFilter.year, controller.signal);
    return () => controller.abort();
  }, [selectedFilter.month, selectedFilter.year, fetchHistory]);

  const setMonth = useCallback((m: number) => {
    setSelectedFilter((prev) => ({ ...prev, month: m }));
  }, []);

  const setYear = useCallback((y: number) => {
    setSelectedFilter((prev) => ({ ...prev, year: y }));
  }, []);

  const goToCurrentMonth = useCallback(() => {
    const currentDate = new Date();
    setSelectedFilter({
      month: currentDate.getMonth() + 1,
      year: currentDate.getFullYear(),
    });
  }, []);

  const refetch = useCallback(async () => {
    await fetchHistory(selectedFilter.month, selectedFilter.year);
  }, [fetchHistory, selectedFilter.month, selectedFilter.year]);

  return {
    month: selectedFilter.month,
    year: selectedFilter.year,
    summaryData,
    loading,
    error,
    setMonth,
    setYear,
    goToCurrentMonth,
    refetch,
  };
};
