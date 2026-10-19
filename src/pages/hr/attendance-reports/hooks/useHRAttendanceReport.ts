import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../../../contexts/AuthContext';
import { attendanceService, triggerBlobDownload } from '../../../../services/attendanceService';
import type {
  AttendanceReportFilterParams,
  AttendanceSummaryKpiResponse,
  InternDiligenceReportResponse,
  PageResponse,
  DiligenceStatus,
} from '../../../../types';

interface FilterState {
  month: number;
  year: number;
  departmentId?: number;
  programId?: number;
  mentorId?: number;
  diligenceStatus?: DiligenceStatus | 'ALL';
  keyword: string;
  page: number;
  size: number;
}

interface DataState {
  kpiData: AttendanceSummaryKpiResponse | null;
  pageData: PageResponse<InternDiligenceReportResponse> | null;
  isLoading: boolean;
  error: string | null;
}

const currentDate = new Date();
const initialFilters: FilterState = {
  month: currentDate.getMonth() + 1,
  year: currentDate.getFullYear(),
  departmentId: undefined,
  programId: undefined,
  mentorId: undefined,
  diligenceStatus: 'ALL',
  keyword: '',
  page: 0,
  size: 10,
};

export function useHRAttendanceReport() {
  const { user } = useAuth();
  const isMentor = user?.role === 'MENTOR';
  const canExport = user?.role === 'HR' || user?.role === 'ADMIN';

  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const [dataState, setDataState] = useState<DataState>({
    kpiData: null,
    pageData: null,
    isLoading: true,
    error: null,
  });
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setDataState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const apiParams: AttendanceReportFilterParams = {
        month: filters.month,
        year: filters.year,
        departmentId: filters.departmentId,
        programId: filters.programId,
        mentorId: filters.mentorId,
        diligenceStatus: filters.diligenceStatus === 'ALL' ? undefined : filters.diligenceStatus,
        keyword: filters.keyword.trim() || undefined,
        page: filters.page,
        size: filters.size,
      };

      const [kpiRes, listRes] = await Promise.all([
        attendanceService.getAttendanceSummaryKpi(
          {
            month: filters.month,
            year: filters.year,
            departmentId: filters.departmentId,
            programId: filters.programId,
            mentorId: filters.mentorId,
          },
          controller.signal
        ),
        attendanceService.getInternDiligenceReports(apiParams, controller.signal),
      ]);

      setDataState({
        kpiData: kpiRes,
        pageData: listRes,
        isLoading: false,
        error: null,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'CanceledError') {
        return;
      }
      const message = err instanceof Error ? err.message : 'Không thể tải báo cáo chuyên cần';
      setDataState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const handlePageChange = useCallback((newPage: number) => {
    // newPage là 1-indexed từ Pagination UI, chuyển thành 0-indexed
    setFilters((prev) => ({ ...prev, page: Math.max(0, newPage - 1) }));
  }, []);

  const handleFilterChange = useCallback((patch: Partial<FilterState>) => {
    setFilters((prev) => ({
      ...prev,
      ...patch,
      page: 0, // Reset về trang đầu khi thay đổi bộ lọc
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      ...initialFilters,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
  }, []);

  const handleExportCsv = useCallback(async () => {
    if (!canExport) {
      toast.error('Bạn không có quyền xuất dữ liệu báo cáo');
      return;
    }
    setIsExporting(true);
    try {
      const exportParams: AttendanceReportFilterParams = {
        month: filters.month,
        year: filters.year,
        departmentId: filters.departmentId,
        programId: filters.programId,
        mentorId: filters.mentorId,
        diligenceStatus: filters.diligenceStatus === 'ALL' ? undefined : filters.diligenceStatus,
        keyword: filters.keyword.trim() || undefined,
      };

      const blob = await attendanceService.exportAttendanceReportCsv(exportParams);
      const filename = `BaoCaoChuyenCan_InternHub_Thang${String(filters.month).padStart(2, '0')}_${filters.year}.csv`;
      triggerBlobDownload(blob, filename);

      toast.success(`Đã xuất báo cáo chuyên cần Tháng ${filters.month}/${filters.year} thành công`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Xuất file CSV thất bại';
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  }, [canExport, filters]);

  return {
    filters,
    kpiData: dataState.kpiData,
    pageData: dataState.pageData,
    isLoading: dataState.isLoading,
    error: dataState.error,
    isExporting,
    canExport,
    isMentor,
    refetch: fetchData,
    handlePageChange,
    handleFilterChange,
    handleResetFilters,
    handleExportCsv,
  };
}

