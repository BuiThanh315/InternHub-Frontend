import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '../../../components/common/Button/Button';
import { Alert } from '../../../components/common/Alert/Alert';
import { AdminAuditDetailModal } from './AdminAuditDetailModal';
import { AdminAuditFilterBar, type AuditFilterState } from './AdminAuditFilterBar';
import { AdminAuditTable } from './AdminAuditTable';
import { auditLogService } from '../../../services/auditLogService';
import type {
  AuditLogItem,
  AuditLogDetail,
  AuditLogStats,
} from '../../../types';
import styles from './AdminAuditTab.module.css';

export const AdminAuditTab: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stats, setStats] = useState<AuditLogStats | null>(null);

  const [filters, setFilters] = useState<AuditFilterState>({
    keyword: '',
    module: 'ALL',
    status: 'ALL',
    fromDate: '',
    toDate: '',
  });

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedLogDetail, setSelectedLogDetail] = useState<AuditLogDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await auditLogService.getAuditLogs({
        page,
        size,
        keyword: filters.keyword || undefined,
        module: filters.module !== 'ALL' ? filters.module : undefined,
        status: filters.status !== 'ALL' ? filters.status : undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
      });

      setAuditLogs(res.items || res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalItems(res.totalItems || res.totalElements || 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể kết nối đến dịch vụ nhật ký kiểm toán';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }, [page, size, filters]);

  const loadAuditStats = useCallback(async () => {
    try {
      const data = await auditLogService.getAuditStatistics();
      setStats(data);
    } catch (err) {
      console.warn('Không thể tải dữ liệu thống kê audit log:', err);
    }
  }, []);

  useEffect(() => {
    loadAuditLogs();
    loadAuditStats();
  }, [loadAuditLogs, loadAuditStats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.keyword, filters.fromDate, filters.toDate]);

  const handleOpenLogDetail = async (id: number) => {
    try {
      setErrorMessage(null);
      const detail = await auditLogService.getAuditLogById(id);
      setSelectedLogDetail(detail);
      setIsModalOpen(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lấy thông tin chi tiết nhật ký';
      setErrorMessage(msg);
    }
  };

  const handleExportCsv = async () => {
    try {
      setExportingCsv(true);
      setErrorMessage(null);
      await auditLogService.exportAuditLogsCsv({
        keyword: filters.keyword || undefined,
        module: filters.module !== 'ALL' ? filters.module : undefined,
        status: filters.status !== 'ALL' ? filters.status : undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xuất tệp CSV từ máy chủ';
      setErrorMessage(msg);
    } finally {
      setExportingCsv(false);
    }
  };

  return (
    <div>
      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={`card ${styles.kpiCard}`}>
          <span className={styles.kpiLabel}>Sự Kiện Hôm Nay</span>
          <h3 className={styles.kpiValuePrimary}>{stats ? stats.totalToday : '--'}</h3>
        </div>

        <div className={`card ${styles.kpiCard}`}>
          <span className={styles.kpiLabel}>Thành Công (Tỷ Lệ)</span>
          <h3 className={styles.kpiValueSuccess}>
            {stats ? `${stats.totalSuccess} (${stats.successRate}%)` : '--'}
          </h3>
        </div>

        <div className={`card ${styles.kpiCard}`}>
          <span className={styles.kpiLabel}>Thất Bại / Lỗi</span>
          <h3 className={styles.kpiValueDanger}>{stats ? stats.totalFailed : '--'}</h3>
        </div>

        <div className={`card ${styles.kpiCard}`}>
          <span className={styles.kpiLabel}>Phân Hệ Hoạt Động</span>
          <p className={styles.kpiSubText}>INTERN, AUTH, SYSTEM, DOC</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="card">
        <AdminAuditFilterBar
          filters={filters}
          onFilterChange={setFilters}
          onResetPage={() => setPage(0)}
          onRefresh={loadAuditLogs}
          onExportCsv={handleExportCsv}
          loading={loading}
          exportingCsv={exportingCsv}
          canExport={auditLogs.length > 0}
        />

        {errorMessage && (
          <Alert
            type="error"
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        )}

        {/* Audit Table */}
        <AdminAuditTable
          logs={auditLogs}
          loading={loading}
          onOpenDetail={handleOpenLogDetail}
        />

        {/* Server-side Pagination Bar */}
        <div className={styles.paginationRow}>
          <div className={styles.paginationInfo}>
            Hiển thị {auditLogs.length} / tổng số <strong>{totalItems}</strong> bản ghi (Trang{' '}
            {page + 1}/{totalPages})
          </div>

          <div className={styles.paginationControls}>
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              className={styles.sizeSelect}
            >
              <option value={10}>10 dòng/trang</option>
              <option value={15}>15 dòng/trang</option>
              <option value={20}>20 dòng/trang</option>
              <option value={50}>50 dòng/trang</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
            >
              <ChevronLeft size={14} /> Trước
            </Button>

            <span className={styles.pageNum}>{page + 1}</span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
            >
              Tiếp <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* Audit Detail Modal */}
      <AdminAuditDetailModal
        logDetail={selectedLogDetail}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLogDetail(null);
        }}
      />
    </div>
  );
};

export default AdminAuditTab;
