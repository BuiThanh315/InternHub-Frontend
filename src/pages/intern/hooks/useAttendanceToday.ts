import { useState, useEffect, useCallback, useRef } from 'react';
import { attendanceService } from '../../../services/attendanceService';
import type { TodayAttendanceResponse } from '../../../types';

export interface UseAttendanceTodayReturn {
  todayData: TodayAttendanceResponse | null;
  loading: boolean;
  error: string | null;
  currentTime: Date;
  refetch: () => Promise<void>;
}

export const useAttendanceToday = (): UseAttendanceTodayReturn => {
  const [todayData, setTodayData] = useState<TodayAttendanceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const lastWorkDateRef = useRef<string>(new Date().toISOString().split('T')[0]);

  // Fetch trạng thái chấm công hôm nay
  const fetchTodayAttendance = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const data = await attendanceService.getTodayAttendance(signal);
      setTodayData(data);
      if (data?.workDate) {
        lastWorkDateRef.current = data.workDate;
      }
    } catch (err: any) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        const message =
          err.response?.data?.message ||
          err.message ||
          'Không thể tải trạng thái điểm danh hôm nay.';
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    const controller = new AbortController();
    fetchTodayAttendance(controller.signal);
    return () => controller.abort();
  }, [fetchTodayAttendance]);

  // Đồng hồ chạy từng giây & Midnight Watcher
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      // Kiểm tra chuyển ngày (Midnight Watcher)
      const currentDateStr = now.toISOString().split('T')[0];
      if (currentDateStr !== lastWorkDateRef.current) {
        lastWorkDateRef.current = currentDateStr;
        fetchTodayAttendance();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchTodayAttendance]);

  const refetch = useCallback(async () => {
    await fetchTodayAttendance();
  }, [fetchTodayAttendance]);

  return {
    todayData,
    loading,
    error,
    currentTime,
    refetch,
  };
};
