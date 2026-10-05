import React, { useState, useMemo } from 'react';
import {
  CalendarX,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Skeleton } from '../../../../components/common';
import {
  formatDate,
  formatTime,
  getAttendanceStatusLabel,
} from '../../../../utils/formatters';
import type { AttendanceHistoryTableProps } from './AttendanceHistoryTable.types';
import type { AttendanceStatus } from '../../../../types';
import styles from './AttendanceHistoryTable.module.css';

const PAGE_SIZE = 10;

export const AttendanceHistoryTable: React.FC<AttendanceHistoryTableProps> = ({
  attendances,
  loading,
  error,
  onRetry,
  onGoToCurrentMonth,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Tính toán dữ liệu hiển thị trên trang hiện tại
  const totalItems = attendances.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return attendances.slice(startIndex, startIndex + PAGE_SIZE);
  }, [attendances, currentPage]);

  const renderStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'ON_TIME':
        return (
          <span className={`${styles.statusBadge} ${styles.badgeOnTime}`}>
            <CheckCircle2 size={12} />
            {getAttendanceStatusLabel(status)}
          </span>
        );
      case 'LATE':
        return (
          <span className={`${styles.statusBadge} ${styles.badgeLate}`}>
            <AlertTriangle size={12} />
            {getAttendanceStatusLabel(status)}
          </span>
        );
      case 'EARLY_LEAVE':
      case 'LATE_AND_EARLY_LEAVE':
        return (
          <span className={`${styles.statusBadge} ${styles.badgeEarlyLeave}`}>
            <Clock size={12} />
            {getAttendanceStatusLabel(status)}
          </span>
        );
      default:
        return (
          <span className={`${styles.statusBadge} ${styles.badgeAbsent}`}>
            {getAttendanceStatusLabel(status)}
          </span>
        );
    }
  };

  // 1. Loading State (Skeleton Shimmer)
  if (loading) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.stickyColumn}>Ngày Làm Việc</th>
                <th>Giờ Check-in</th>
                <th>Giờ Check-out</th>
                <th>Tổng Giờ Làm</th>
                <th>Trạng Thái</th>
                <th>Ghi Chú</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className={styles.stickyColumn}>
                    <Skeleton variant="text" width="100px" height="18px" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="70px" height="18px" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="70px" height="18px" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="60px" height="18px" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="80px" height="22px" />
                  </td>
                  <td>
                    <Skeleton variant="text" width="140px" height="18px" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // 2. Error State (Retry)
  if (error) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.stateContainer}>
          <div className={styles.errorIconWrapper}>
            <AlertCircle size={28} />
          </div>
          <h3 className={styles.emptyTitle}>Đã xảy ra lỗi tải dữ liệu</h3>
          <p className={styles.emptyDesc}>{error}</p>
          {onRetry && (
            <button type="button" onClick={onRetry} className={styles.retryBtn}>
              <RefreshCw size={14} />
              <span>Thử lại</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Empty State (Có CTA)
  if (attendances.length === 0) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.stateContainer}>
          <div className={styles.emptyIconWrapper}>
            <CalendarX size={28} />
          </div>
          <h3 className={styles.emptyTitle}>Chưa có dữ liệu chấm công</h3>
          <p className={styles.emptyDesc}>
            Trong tháng được chọn chưa phát sinh bản ghi điểm danh nào. Dữ liệu sẽ tự động ghi nhận mỗi khi bạn check-in/check-out.
          </p>
          {onGoToCurrentMonth && (
            <button
              type="button"
              onClick={onGoToCurrentMonth}
              className={styles.emptyActionBtn}
            >
              Về tháng hiện tại
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.stickyColumn}>Ngày Làm Việc</th>
              <th>Giờ Check-in</th>
              <th>Giờ Check-out</th>
              <th>Tổng Giờ Làm</th>
              <th>Trạng Thái</th>
              <th>Ghi Chú</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((record) => (
              <tr key={record.id || record.workDate}>
                <td className={styles.stickyColumn}>
                  <strong>{formatDate(record.workDate)}</strong>
                </td>
                <td>
                  <div>{formatTime(record.checkInTime, false)}</div>
                  {record.checkInDistance !== undefined && record.checkInDistance !== null && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {record.checkInDistance}m
                    </div>
                  )}
                </td>
                <td>
                  {record.checkOutTime ? (
                    <div>
                      <div>{formatTime(record.checkOutTime, false)}</div>
                      {record.checkOutDistance !== undefined && record.checkOutDistance !== null && (
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {record.checkOutDistance}m
                        </div>
                      )}
                    </div>
                  ) : (
                    '—'
                  )}
                </td>
                <td>
                  {record.totalWorkingHours !== null &&
                  record.totalWorkingHours !== undefined
                    ? `${record.totalWorkingHours.toFixed(2)} h`
                    : '—'}
                </td>
                <td>{renderStatusBadge(record.status)}</td>
                <td title={record.notes}>
                  {record.notes ? record.notes : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PHÂN TRANG: Tự động ẩn khi <= 10 dòng (Nguyên tắc 31) */}
      {totalItems > PAGE_SIZE && (
        <div className={styles.paginationBar}>
          <span>
            Hiển thị{' '}
            <strong>
              {(currentPage - 1) * PAGE_SIZE + 1} -{' '}
              {Math.min(currentPage * PAGE_SIZE, totalItems)}
            </strong>{' '}
            trong tổng số <strong>{totalItems}</strong> ngày công
          </span>

          <div className={styles.pageButtonGroup}>
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={styles.pageBtn}
              title="Trang trước"
            >
              <ChevronLeft size={16} />
              <span>Trước</span>
            </button>
            <span>
              Trang {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className={styles.pageBtn}
              title="Trang tiếp"
            >
              <span>Sau</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
