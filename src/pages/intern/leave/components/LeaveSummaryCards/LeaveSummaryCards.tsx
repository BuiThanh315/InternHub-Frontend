import React from 'react';
import { FileText, Clock, CheckCircle2, CalendarDays } from 'lucide-react';
import { Skeleton } from '../../../../../components/common';
import type { LeaveSummaryCardsProps } from './LeaveSummaryCards.types';
import styles from './LeaveSummaryCards.module.css';

export const LeaveSummaryCards: React.FC<LeaveSummaryCardsProps> = ({
  requests,
  totalElements,
  loading,
}) => {
  if (loading) {
    return (
      <div className={styles.cardsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.kpiCard}>
            <Skeleton variant="circular" width="48px" height="48px" />
            <div style={{ flex: 1 }}>
              <Skeleton variant="text" width="55%" height="16px" />
              <Skeleton variant="text" width="75%" height="24px" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalCount = totalElements ?? requests.length;
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const approvedDays = requests
    .filter((r) => r.status === 'APPROVED')
    .reduce((sum, r) => sum + (r.totalDays || 0), 0);

  return (
    <div className={styles.cardsGrid}>
      {/* Thẻ 1: Tổng số đơn */}
      <div className={styles.kpiCard}>
        <div className={`${styles.iconWrapper} ${styles.iconPrimary}`}>
          <FileText size={22} />
        </div>
        <div className={styles.contentWrapper}>
          <span className={styles.kpiLabel}>Tổng Số Đơn</span>
          <span className={styles.kpiValue}>{totalCount} đơn</span>
          <span className={styles.kpiSubtext}>Toàn bộ lịch sử nộp đơn</span>
        </div>
      </div>

      {/* Thẻ 2: Đang chờ duyệt */}
      <div className={styles.kpiCard}>
        <div className={`${styles.iconWrapper} ${styles.iconWarning}`}>
          <Clock size={22} />
        </div>
        <div className={styles.contentWrapper}>
          <span className={styles.kpiLabel}>Chờ Xét Duyệt</span>
          <span className={styles.kpiValue}>{pendingCount} đơn</span>
          <span className={styles.kpiSubtext}>Đang đợi Mentor phản hồi</span>
        </div>
      </div>

      {/* Thẻ 3: Đã được duyệt */}
      <div className={styles.kpiCard}>
        <div className={`${styles.iconWrapper} ${styles.iconSuccess}`}>
          <CheckCircle2 size={22} />
        </div>
        <div className={styles.contentWrapper}>
          <span className={styles.kpiLabel}>Đã Phê Duyệt</span>
          <span className={styles.kpiValue}>{approvedCount} đơn</span>
          <span className={styles.kpiSubtext}>Được chấp thuận chính thức</span>
        </div>
      </div>

      {/* Thẻ 4: Tổng số ngày đã nghỉ */}
      <div className={styles.kpiCard}>
        <div className={`${styles.iconWrapper} ${styles.iconInfo}`}>
          <CalendarDays size={22} />
        </div>
        <div className={styles.contentWrapper}>
          <span className={styles.kpiLabel}>Số Ngày Đã Nghỉ</span>
          <span className={styles.kpiValue}>{approvedDays.toFixed(1)} ngày</span>
          <span className={styles.kpiSubtext}>Tính theo ca làm việc tiêu chuẩn</span>
        </div>
      </div>
    </div>
  );
};
