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
import { toast } from 'sonner';
import { attendanceService } from '../../../../services/attendanceService';
import type { AttendanceHistoryTableProps } from './AttendanceHistoryTable.types';
import type { AttendanceStatus, AttendanceRecordResponse } from '../../../../types';
import styles from './AttendanceHistoryTable.module.css';

const PAGE_SIZE = 10;

export const AttendanceHistoryTable: React.FC<AttendanceHistoryTableProps> = ({
  attendances,
  loading,
  error,
  onRetry,
  onGoToCurrentMonth,
  onAppealSuccess,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecordResponse | null>(null);
  const [appealReason, setAppealReason] = useState<string>('');
  const [appealEvidenceUrl, setAppealEvidenceUrl] = useState<string>('');
  const [submittingAppeal, setSubmittingAppeal] = useState<boolean>(false);

  const handleOpenAppeal = (record: AttendanceRecordResponse) => {
    setSelectedRecord(record);
    setAppealReason('');
    setAppealEvidenceUrl('');
  };

  const handleSubmitAppeal = async () => {
    if (!selectedRecord || !appealReason.trim()) return;
    setSubmittingAppeal(true);
    try {
      await attendanceService.appealAttendance(selectedRecord.id, {
        reason: appealReason.trim(),
        evidenceUrl: appealEvidenceUrl.trim() || undefined,
      });
      toast.success('Đã gửi giải trình chấm công thành công. HR/Mentor sẽ xem xét duyệt lại.');
      setSelectedRecord(null);
      if (onAppealSuccess) {
        onAppealSuccess();
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Gửi giải trình thất bại');
    } finally {
      setSubmittingAppeal(false);
    }
  };

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
              <th>Kiểm Duyệt</th>
              <th>Ghi Chú</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((record) => {
              const canAppeal = record.reviewStatus === 'PENDING_REVIEW' || record.status === 'FORGOTTEN_CHECKOUT' || record.status === 'LATE' || record.status === 'EARLY_LEAVE' || record.status === 'ABSENT';
              return (
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
                <td>
                  {record.reviewStatus === 'PENDING_REVIEW' ? (
                    <span className={`${styles.statusBadge} ${styles.badgeReviewPending}`}>
                      <AlertTriangle size={11} />
                      Chờ duyệt
                    </span>
                  ) : (
                    <span className={`${styles.statusBadge} ${styles.badgeReviewApproved}`}>
                      <CheckCircle2 size={11} />
                      Đã duyệt
                    </span>
                  )}
                </td>
                <td title={record.notes}>
                  {record.notes ? record.notes : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                </td>
                <td>
                  {canAppeal && (
                    <button
                      type="button"
                      onClick={() => handleOpenAppeal(record)}
                      style={{
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)',
                        background: 'transparent',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                      title="Gửi đơn khiếu nại / giải trình cho ca làm việc này"
                    >
                      Khiếu nại
                    </button>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL GIẢI TRÌNH CHẤM CÔNG */}
      {selectedRecord && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            background: 'var(--bg-card, #ffffff)',
            borderRadius: '12px',
            maxWidth: '480px',
            width: '100%',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--border-default)',
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>
              Giải Trình Chấm Công Ngày {formatDate(selectedRecord.workDate)}
            </h3>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Nhập lý do chi tiết (ví dụ: GPS trôi, lỗi thiết bị, đi công tác) kèm đường dẫn ảnh minh chứng để HR/Mentor xét duyệt lại.
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Lý do giải trình (*):
              </label>
              <textarea
                value={appealReason}
                onChange={(e) => setAppealReason(e.target.value)}
                placeholder="Nhập lý do giải trình chi tiết..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-default)',
                  fontSize: '0.875rem',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Link ảnh / tài liệu minh chứng (tùy chọn):
              </label>
              <input
                type="text"
                value={appealEvidenceUrl}
                onChange={(e) => setAppealEvidenceUrl(e.target.value)}
                placeholder="https://drive.google.com/... hoặc link ảnh"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-default)',
                  fontSize: '0.875rem',
                  background: 'var(--bg-main)',
                  color: 'var(--text-main)',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                disabled={submittingAppeal}
                onClick={() => setSelectedRecord(null)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-default)',
                  background: 'transparent',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={submittingAppeal || !appealReason.trim()}
                onClick={handleSubmitAppeal}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: submittingAppeal || !appealReason.trim() ? 'not-allowed' : 'pointer',
                  opacity: submittingAppeal || !appealReason.trim() ? 0.6 : 1,
                }}
              >
                {submittingAppeal ? 'Đang gửi...' : 'Gửi Giải Trình'}
              </button>
            </div>
          </div>
        </div>
      )}

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
