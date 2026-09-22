import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  RefreshCw,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { Button } from '../../../components/common/Button/Button';
import { Alert } from '../../../components/common/Alert/Alert';
import { AdminAuditDetailModal } from './AdminAuditDetailModal';
import { auditLogService } from '../../../services/auditLogService';
import { formatDateTime } from '../../../utils/formatters';
import type {
  AuditLogItem,
  AuditLogDetail,
  AuditLogStats,
} from '../../../types';
import styles from './AdminAuditTab.module.css';

interface FilterState {
  keyword: string;
  module: string;
  status: string;
  fromDate: string;
  toDate: string;
}

export const AdminAuditTab: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stats, setStats] = useState<AuditLogStats | null>(null);

  const [filters, setFilters] = useState<FilterState>({
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

  // Debounced search khi người dùng gõ từ khóa hoặc chọn ngày
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

  const getModuleBadgeClass = (module: string) => {
    switch (module) {
      case 'AUTH':
        return 'badge-warning';
      case 'INTERN':
        return 'badge-primary';
      case 'DOCUMENT':
        return 'badge-info';
      case 'SYSTEM':
        return 'badge-danger';
      case 'USER':
        return 'badge-success';
      default:
        return 'badge-secondary';
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

      {/* Main Audit Log Card */}
      <div className="card">
        <div className={styles.headerRow}>
          <div>
            <h3 className={styles.titleWithIcon}>
              <FileText size={20} color="var(--primary)" />
              Nhật Ký Hoạt Động Hệ Thống (Audit Logs - TM-9)
            </h3>
            <p className={styles.subtitle}>
              Ghi vết tự động toàn bộ thao tác người dùng và hệ thống theo thời gian thực (Real-time DB)
            </p>
          </div>

          <div className={styles.actionGroup}>
            <Button
              variant="outline"
              size="sm"
              onClick={loadAuditLogs}
              disabled={loading}
              title="Tải lại dữ liệu"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              Làm mới
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleExportCsv}
              disabled={exportingCsv || auditLogs.length === 0}
            >
              <FileSpreadsheet size={16} />
              {exportingCsv ? 'Đang xuất CSV...' : 'Xuất CSV'}
            </Button>
          </div>
        </div>

        {/* Advanced Filter Bar */}
        <div className={styles.filterBar}>
          <div className={styles.searchBox}>
            <Search size={15} color="var(--text-muted)" className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Tìm username, mô tả, URL..."
              value={filters.keyword}
              onChange={(e) => setFilters((prev) => ({ ...prev, keyword: e.target.value }))}
              className={styles.filterInput}
            />
          </div>

          <select
            value={filters.module}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, module: e.target.value }));
              setPage(0);
            }}
            className={styles.filterSelect}
          >
            <option value="ALL">Tất cả Phân hệ</option>
            <option value="AUTH">AUTH (Xác thực)</option>
            <option value="INTERN">INTERN (Thực tập sinh)</option>
            <option value="DOCUMENT">DOCUMENT (Tài liệu/CV)</option>
            <option value="SYSTEM">SYSTEM (Hệ thống & Backup)</option>
            <option value="USER">USER (Người dùng)</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, status: e.target.value }));
              setPage(0);
            }}
            className={styles.filterSelect}
          >
            <option value="ALL">Tất cả Trạng thái</option>
            <option value="SUCCESS">SUCCESS (Thành công)</option>
            <option value="FAILED">FAILED (Thất bại)</option>
          </select>

          <input
            type="date"
            value={filters.fromDate}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, fromDate: e.target.value }));
              setPage(0);
            }}
            title="Từ ngày"
            className={styles.filterDate}
          />

          <input
            type="date"
            value={filters.toDate}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, toDate: e.target.value }));
              setPage(0);
            }}
            title="Đến ngày"
            className={styles.filterDate}
          />
        </div>

        {errorMessage && (
          <Alert
            type="error"
            message={errorMessage}
            onClose={() => setErrorMessage(null)}
          />
        )}

        {/* Audit Logs Data Table */}
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Thời Gian</th>
                <th>Người Thực Hiện</th>
                <th>Phân Hệ</th>
                <th>Hành Động</th>
                <th>Mô Tả Chi Tiết</th>
                <th>IP Máy Trạm</th>
                <th>Trạng Thái</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className={styles.tableMessage}>
                    <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                    <p style={{ margin: 0 }}>Đang tải dữ liệu nhật ký hoạt động từ Backend...</p>
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.tableMessage}>
                    Không tìm thấy bản ghi nhật ký nào phù hợp với bộ lọc hiện tại
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className={styles.dateCell}>{formatDateTime(log.createdAt)}</td>
                    <td>
                      <div className={styles.userCell}>{log.username}</div>
                      {log.userRole && <span className={styles.roleSub}>({log.userRole})</span>}
                    </td>
                    <td>
                      <span className={`badge ${getModuleBadgeClass(log.module)}`}>
                        {log.module}
                      </span>
                    </td>
                    <td>
                      <span className={styles.actionMono}>{log.action}</span>
                    </td>
                    <td className={styles.descCell}>
                      <div className={styles.descText} title={log.description}>
                        {log.description}
                      </div>
                      <span className={styles.endpointSub}>
                        {log.httpMethod} {log.endpoint}
                      </span>
                    </td>
                    <td className={styles.ipCell}>{log.clientIp || '127.0.0.1'}</td>
                    <td>
                      {log.status === 'SUCCESS' ? (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} /> Thành Công
                        </span>
                      ) : (
                        <span className="badge badge-danger">
                          <AlertCircle size={12} /> Thất Bại
                        </span>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenLogDetail(log.id)}
                        title="Xem chi tiết sự kiện"
                      >
                        <Eye size={14} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
