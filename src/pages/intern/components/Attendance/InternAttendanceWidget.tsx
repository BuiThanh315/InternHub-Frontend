import React, { useState, useEffect } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Skeleton } from '../../../../components/common';
import {
  formatTime,
  getAttendanceStatusLabel,
} from '../../../../utils/formatters';
import type { InternAttendanceWidgetProps } from './InternAttendanceWidget.types';
import styles from './InternAttendanceWidget.module.css';

const DAYS_OF_WEEK = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
];

export const InternAttendanceWidget: React.FC<InternAttendanceWidgetProps> = ({
  todayData,
  loading,
  onCheckInClick,
  onCheckOutClick,
  onQuickCheckOut,
  onViewHistoryClick,
}) => {
  const [internalTime, setInternalTime] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setInternalTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className={styles.widgetContainer}>
        <div className={styles.widgetGrid}>
          <div className={styles.leftColumn}>
            <Skeleton variant="text" width="200px" height="20px" />
            <Skeleton variant="rectangular" width="240px" height="48px" />
            <Skeleton variant="text" width="320px" height="18px" />
          </div>
          <div className={styles.rightColumn}>
            <Skeleton variant="rectangular" width="180px" height="42px" />
            <Skeleton variant="text" width="120px" height="16px" />
          </div>
        </div>
      </div>
    );
  }

  // Format ngày hiện tại
  const dayOfWeek = DAYS_OF_WEEK[internalTime.getDay()];
  const day = String(internalTime.getDate()).padStart(2, '0');
  const month = String(internalTime.getMonth() + 1).padStart(2, '0');
  const year = internalTime.getFullYear();
  const dateString = `${dayOfWeek}, ${day}/${month}/${year}`;

  const clockString = formatTime(internalTime, true);

  const hasCheckedIn = Boolean(todayData?.hasCheckedIn);
  const hasCheckedOut = Boolean(todayData?.hasCheckedOut);
  const status = todayData?.status;

  const renderStatusBadge = () => {
    if (!hasCheckedIn) {
      return (
        <span className={`${styles.statusPill} ${styles.statusNotCheckedIn}`}>
          <Clock size={14} />
          {getAttendanceStatusLabel(null)}
        </span>
      );
    }

    if (hasCheckedOut) {
      return (
        <span className={`${styles.statusPill} ${styles.statusCompleted}`}>
          <CheckCircle2 size={14} />
          Hoàn thành ca ({todayData?.totalWorkingHours ?? 0} giờ)
        </span>
      );
    }

    if (status === 'LATE') {
      return (
        <span className={`${styles.statusPill} ${styles.statusLate}`}>
          <AlertTriangle size={14} />
          Đã vào ca (Đi muộn)
        </span>
      );
    }

    return (
      <span className={`${styles.statusPill} ${styles.statusOnTime}`}>
        <CheckCircle2 size={14} />
        Đã vào ca (Đúng giờ)
      </span>
    );
  };

  return (
    <div className={styles.widgetContainer}>
      <div className={styles.widgetGrid}>
        {/* Cột trái: Đồng hồ, trạng thái và chi tiết */}
        <div className={styles.leftColumn}>
          <div className={styles.headerRow}>
            <span className={styles.badgeHeader}>
              <ShieldCheck size={13} />
              Điểm Danh & Chấm Công GPS
            </span>
            <span className={styles.dateDisplay}>
              <Calendar size={13} style={{ display: 'inline', marginRight: 4 }} />
              {dateString}
            </span>
          </div>

          <div className={clockRowStyle()}>
            <span className={styles.clockText}>{clockString}</span>
            {renderStatusBadge()}
          </div>

          <div className={styles.detailsRow}>
            {hasCheckedIn && todayData?.checkInTime && (
              <span className={styles.detailItem}>
                <LogIn size={14} />
                Giờ vào:{' '}
                <strong className={styles.detailHighlight}>
                  {formatTime(todayData.checkInTime, false)}
                </strong>
              </span>
            )}

            {hasCheckedOut && todayData?.checkOutTime && (
              <span className={styles.detailItem}>
                <LogOut size={14} />
                Giờ ra:{' '}
                <strong className={styles.detailHighlight}>
                  {formatTime(todayData.checkOutTime, false)}
                </strong>
              </span>
            )}

            <span className={styles.detailItem}>
              <MapPin size={14} />
              Địa điểm:{' '}
              <span className={styles.detailHighlight}>
                {todayData?.officeName || 'Trụ sở chính InternHub'}
              </span>
              {' '}(Bán kính {todayData?.allowedRadiusMeters || 25}m)
            </span>
          </div>
        </div>

        {/* Cột phải: Các nút hành động CTA */}
        <div className={styles.rightColumn}>
          {!hasCheckedIn ? (
            <button
              type="button"
              onClick={onCheckInClick}
              className={`${styles.actionButton} ${styles.actionButtonCheckIn}`}
            >
              <LogIn size={18} />
              <span>Điểm Danh Vào Ca</span>
            </button>
          ) : !hasCheckedOut ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
              <button
                type="button"
                onClick={onCheckOutClick}
                className={`${styles.actionButton} ${styles.actionButtonCheckOut}`}
              >
                <LogOut size={18} />
                <span>Điểm Danh Tan Ca (QR)</span>
              </button>

              {onQuickCheckOut && (
                <button
                  type="button"
                  onClick={onQuickCheckOut}
                  className={styles.actionButton}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    boxShadow: 'none',
                  }}
                  title="Tan ca nhanh 1-chạm nếu máy đang kết nối Wi-Fi văn phòng"
                >
                  <CheckCircle2 size={16} />
                  <span>Tan Ca Nhanh 1-Chạm</span>
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              disabled
              className={`${styles.actionButton} ${styles.actionButtonCompleted}`}
            >
              <CheckCircle2 size={18} />
              <span>Đã Xong Ca Hôm Nay</span>
            </button>
          )}

          {onViewHistoryClick && (
            <button
              type="button"
              onClick={onViewHistoryClick}
              className={styles.historyLink}
            >
              <span>Xem bảng chấm công tháng</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

function clockRowStyle() {
  return styles.clockRow;
}
