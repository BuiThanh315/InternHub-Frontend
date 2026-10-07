import React from 'react';
import {
  CalendarOff,
  Eye,
  Trash2,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { Button, Pagination, Skeleton, Alert } from '../../../../../components/common';
import { formatDate } from '../../../../../utils/formatters';
import type { LeaveRequestTableProps } from './LeaveRequestTable.types';
import type { LeaveStatus } from '../../../../../types';
import styles from './LeaveRequestTable.module.css';

const getStatusBadge = (status: LeaveStatus, desc: string) => {
  switch (status) {
    case 'PENDING':
      return (
        <span className={`${styles.badge} ${styles.badgePending}`}>
          <Clock size={12} />
          {desc || 'Chờ xét duyệt'}
        </span>
      );
    case 'APPROVED':
      return (
        <span className={`${styles.badge} ${styles.badgeApproved}`}>
          <CheckCircle2 size={12} />
          {desc || 'Đã phê duyệt'}
        </span>
      );
    case 'REJECTED':
      return (
        <span className={`${styles.badge} ${styles.badgeRejected}`}>
          <XCircle size={12} />
          {desc || 'Bị từ chối'}
        </span>
      );
    case 'CANCELLED':
      return (
        <span className={`${styles.badge} ${styles.badgeCancelled}`}>
          <AlertCircle size={12} />
          {desc || 'Đã hủy bỏ'}
        </span>
      );
    default:
      return <span className={styles.badge}>{desc || status}</span>;
  }
};

export const LeaveRequestTable: React.FC<LeaveRequestTableProps> = ({
  requests,
  loading,
  error,
  page,
  totalPages,
  totalElements,
  onPageChange,
  onViewDetail,
  onCancelRequest,
  onCreateNew,
  onResetFilters,
  onRetry,
}) => {
  // Trạng thái 1: Loading State - Shimmer Skeleton (Rule 32)
  if (loading) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.tableResponsive}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mã Đơn</th>
                <th>Loại Nghỉ Phép</th>
                <th>Khung Thời Gian</th>
                <th>Thời Gian Nghỉ</th>
                <th>Số Ngày</th>
                <th>Trạng Thái</th>
                <th className={styles.stickyRight}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td><Skeleton variant="text" width="60px" height="20px" /></td>
                  <td><Skeleton variant="text" width="130px" height="20px" /></td>
                  <td><Skeleton variant="text" width="90px" height="20px" /></td>
                  <td><Skeleton variant="text" width="160px" height="20px" /></td>
                  <td><Skeleton variant="text" width="50px" height="20px" /></td>
                  <td><Skeleton variant="text" width="100px" height="24px" /></td>
                  <td className={styles.stickyRight}><Skeleton variant="text" width="80px" height="32px" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Trạng thái 2: Error State (Rule 32)
  if (error) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.errorState}>
          <Alert type="error" title="Không thể tải danh sách đơn">
            {error}
          </Alert>
          {onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              <RotateCcw size={14} style={{ marginRight: 6 }} />
              Thử lại
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Trạng thái 3: Empty State (Rule 32)
  if (requests.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <CalendarOff size={28} />
          </div>
          <h3 className={styles.emptyTitle}>Chưa có đơn xin nghỉ phép nào</h3>
          <p className={styles.emptyDesc}>
            Khi bạn có nhu cầu nghỉ ốm, thi cử hoặc việc riêng chính đáng, hãy
            tạo đơn tại đây để gửi tới Mentor phụ trách xét duyệt.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {onCreateNew && (
              <Button variant="primary" onClick={onCreateNew}>
                <Plus size={16} style={{ marginRight: 6 }} />
                Tạo Đơn Xin Nghỉ Mới
              </Button>
            )}
            {onResetFilters && (
              <Button variant="outline" onClick={onResetFilters}>
                Đặt lại bộ lọc
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      {/* Desktop & Tablet Table */}
      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>MÃ ĐƠN</th>
              <th>LOẠI NGHỈ PHÉP</th>
              <th>KHUNG THỜI GIAN</th>
              <th>THỜI GIAN NGHỈ</th>
              <th>SỐ CÔNG</th>
              <th>TRẠNG THÁI</th>
              <th className={styles.stickyRight} style={{ textAlign: 'right' }}>
                THAO TÁC
              </th>
            </tr>
          </thead>
          <tbody>
            {requests.map((item) => {
              const isPending = item.status === 'PENDING';
              return (
                <tr key={item.id}>
                  <td className={styles.codeCell}>#LR-{item.id}</td>
                  <td>
                    <strong>{item.leaveTypeDescription || item.leaveType}</strong>
                  </td>
                  <td>{item.durationTypeDescription || item.durationType}</td>
                  <td>
                    <div className={styles.dateRange}>
                      <span>{formatDate(item.startDate)}</span>
                      <ArrowRight size={13} className={styles.arrowIcon} />
                      <span>{formatDate(item.endDate)}</span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.daysTag}>
                      {item.totalDays?.toFixed(1)} ngày
                    </span>
                  </td>
                  <td>
                    {getStatusBadge(
                      item.status,
                      item.statusDescription
                    )}
                  </td>
                  <td className={styles.stickyRight}>
                    <div className={styles.actionsGroup}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetail(item.id)}
                        title="Xem chi tiết đơn"
                        aria-label="Xem chi tiết đơn"
                      >
                        <Eye size={15} style={{ marginRight: 4 }} />
                        Xem
                      </Button>
                      {isPending && (
                        <Button
                          variant="outline"
                          size="sm"
                          style={{
                            color: 'var(--danger)',
                            borderColor: 'rgba(239, 68, 68, 0.3)',
                          }}
                          onClick={() => onCancelRequest(item)}
                          title="Hủy đơn xin nghỉ này"
                          aria-label="Hủy đơn xin nghỉ"
                        >
                          <Trash2 size={14} style={{ marginRight: 4 }} />
                          Hủy
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List (Rule 34) */}
      <div className={styles.mobileCardList}>
        {requests.map((item) => (
          <div key={item.id} className={styles.mobileCard}>
            <div className={styles.mobileCardHeader}>
              <span className={styles.codeCell}>#LR-{item.id}</span>
              {getStatusBadge(item.status, item.statusDescription)}
            </div>
            <div className={styles.mobileCardRow}>
              <span className={styles.mobileCardLabel}>Loại nghỉ:</span>
              <strong>{item.leaveTypeDescription || item.leaveType}</strong>
            </div>
            <div className={styles.mobileCardRow}>
              <span className={styles.mobileCardLabel}>Khung giờ:</span>
              <span>{item.durationTypeDescription || item.durationType}</span>
            </div>
            <div className={styles.mobileCardRow}>
              <span className={styles.mobileCardLabel}>Thời gian:</span>
              <span>
                {formatDate(item.startDate)} - {formatDate(item.endDate)}
              </span>
            </div>
            <div className={styles.mobileCardRow}>
              <span className={styles.mobileCardLabel}>Số ngày công:</span>
              <span className={styles.daysTag}>
                {item.totalDays?.toFixed(1)} ngày
              </span>
            </div>
            <div className={styles.mobileCardActions}>
              <Button
                variant="outline"
                size="sm"
                style={{ flex: 1 }}
                onClick={() => onViewDetail(item.id)}
              >
                <Eye size={15} style={{ marginRight: 4 }} />
                Xem chi tiết
              </Button>
              {item.status === 'PENDING' && (
                <Button
                  variant="outline"
                  size="sm"
                  style={{
                    color: 'var(--danger)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                  }}
                  onClick={() => onCancelRequest(item)}
                >
                  <Trash2 size={14} style={{ marginRight: 4 }} />
                  Hủy đơn
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Phân trang tự động ẩn khi <= 10 dòng (Rule 31) */}
      {totalElements > 10 && totalPages > 1 && (
        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-default)' }}>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalElements}
            pageSize={10}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};
