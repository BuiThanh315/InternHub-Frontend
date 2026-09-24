import React from 'react';
import {
  FileText,
  RefreshCw,
  FileSpreadsheet,
  Search,
} from 'lucide-react';

import { Button } from '../../../components/common/Button/Button';
import styles from './AdminAuditFilterBar.module.css';

export interface AuditFilterState {
  keyword: string;
  module: string;
  status: string;
  fromDate: string;
  toDate: string;
}

interface AdminAuditFilterBarProps {
  filters: AuditFilterState;
  onFilterChange: (updater: (prev: AuditFilterState) => AuditFilterState) => void;
  onResetPage: () => void;
  onRefresh: () => void;
  onExportCsv: () => void;
  loading: boolean;
  exportingCsv: boolean;
  canExport: boolean;
}

export const AdminAuditFilterBar: React.FC<AdminAuditFilterBarProps> = ({
  filters,
  onFilterChange,
  onResetPage,
  onRefresh,
  onExportCsv,
  loading,
  exportingCsv,
  canExport,
}) => {
  return (
    <>
      <div className={styles.headerRow}>
        <div>
          <h3 className={styles.titleWithIcon}>
            <FileText size={20} color="var(--primary)" />
            Nhật Ký Hoạt Động Hệ Thống (Audit Logs)
          </h3>
          <p className={styles.subtitle}>
            Ghi vết tự động toàn bộ thao tác người dùng và hệ thống theo thời gian thực (Real-time DB)
          </p>
        </div>

        <div className={styles.actionGroup}>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            title="Tải lại dữ liệu"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Làm mới
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={onExportCsv}
            disabled={exportingCsv || !canExport}
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
            onChange={(e) => onFilterChange((prev) => ({ ...prev, keyword: e.target.value }))}
            className={styles.filterInput}
          />
        </div>

        <select
          value={filters.module}
          onChange={(e) => {
            onFilterChange((prev) => ({ ...prev, module: e.target.value }));
            onResetPage();
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
            onFilterChange((prev) => ({ ...prev, status: e.target.value }));
            onResetPage();
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
            onFilterChange((prev) => ({ ...prev, fromDate: e.target.value }));
            onResetPage();
          }}
          title="Từ ngày"
          className={styles.filterDate}
        />

        <input
          type="date"
          value={filters.toDate}
          onChange={(e) => {
            onFilterChange((prev) => ({ ...prev, toDate: e.target.value }));
            onResetPage();
          }}
          title="Đến ngày"
          className={styles.filterDate}
        />
      </div>
    </>
  );
};

export default AdminAuditFilterBar;
