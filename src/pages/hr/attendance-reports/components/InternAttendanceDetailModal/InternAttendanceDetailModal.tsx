import React from 'react';
import { CalendarDays, AlertCircle, ExternalLink } from 'lucide-react';
import { Modal, Button, Skeleton } from '../../../../../components/common';

import { formatDate } from '../../../../../utils/formatters';
import type { InternAttendanceDetailModalProps } from './InternAttendanceDetailModal.types';
import type { DailyDayStatus, DiligenceStatus } from '../../../../../types';
import styles from './InternAttendanceDetailModal.module.css';

function formatTimeOnly(isoString?: string | null): string {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '—';
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return '—';
  }
}

const getDayStatusBadge = (status: DailyDayStatus, desc?: string) => {
  let badgeStyle = styles.badgeOther;
  switch (status) {
    case 'PRESENT_ON_TIME':
      badgeStyle = styles.badgePresentOnTime;
      break;
    case 'PRESENT_LATE':
      badgeStyle = styles.badgePresentLate;
      break;
    case 'PRESENT_EARLY_LEAVE':
      badgeStyle = styles.badgePresentEarlyLeave;
      break;
    case 'PRESENT_LATE_AND_EARLY_LEAVE':
      badgeStyle = styles.badgePresentLateAndEarly;
      break;
    case 'LEAVE_APPROVED':
      badgeStyle = styles.badgeLeaveApproved;
      break;
    case 'LEAVE_PENDING':
      badgeStyle = styles.badgeLeavePending;
      break;
    case 'ABSENT_UNEXCUSED':
      badgeStyle = styles.badgeAbsentUnexcused;
      break;
    case 'WEEKEND':
      badgeStyle = styles.badgeWeekend;
      break;
    default:
      badgeStyle = styles.badgeOther;
  }

  return <span className={`${styles.dayBadge} ${badgeStyle}`}>{desc || status}</span>;
};

const getDiligenceStatusTitle = (status?: DiligenceStatus) => {
  switch (status) {
    case 'EXCELLENT':
      return 'Xuất sắc';
    case 'GOOD':
      return 'Tốt';
    case 'WARNING':
      return 'Cảnh báo';
    case 'CRITICAL':
      return 'Báo động';
    default:
      return status || '';
  }
};

export const InternAttendanceDetailModal: React.FC<InternAttendanceDetailModalProps> = ({
  isOpen,
  onClose,
  data,
  isLoading = false,
  error = null,
}) => {
  // Title for Modal Header
  const modalTitle = (
    <div className={styles.modalHeaderContent}>
      <div>
        <div className={styles.headerTitleWrapper}>
          <CalendarDays size={20} className={styles.headerIcon} />
          <span className={styles.headerTitle}>
            Bảng Công Tháng {data?.month || '—'}/{data?.year || '—'}{' '}
            {data ? `• ${data.fullName}` : ''}
          </span>
          {data?.internCode && (
            <span className={styles.internCodeBadge}>{data.internCode}</span>
          )}
        </div>
        {data && (
          <div className={styles.headerSubtitle}>
            {data.departmentName} • {data.programTitle || 'Chương trình thực tập'}
            {data.mentorName ? ` • Mentor: ${data.mentorName}` : ''}
          </div>
        )}
      </div>

      {data?.summary && (
        <div className={styles.headerBadges}>
          <span
            className={styles.dayBadge}
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              color: 'var(--primary)',
              fontWeight: 700,
            }}
          >
            {getDiligenceStatusTitle(data.summary.diligenceStatus)} ({data.summary.diligenceRate.toFixed(1)}%)
          </span>
        </div>
      )}
    </div>
  );

  // Footer for Modal (Sticky Footer - Rule 29)
  const modalFooter = (
    <Button variant="outline" size="sm" onClick={onClose}>
      Đóng
    </Button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={modalTitle}
      footer={modalFooter}
      size="xl"
      closeOnBackdrop
    >
      <div className={styles.modalBody}>
        {isLoading && (
          <div className={styles.loadingSkeleton}>
            <Skeleton width="100%" height="54px" style={{ borderRadius: '8px' }} />
            <Skeleton width="100%" height="320px" style={{ borderRadius: '8px' }} />
          </div>
        )}


        {!isLoading && error && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--danger)' }}>
            <AlertCircle size={28} style={{ margin: '0 auto 8px auto' }} />
            <div style={{ fontWeight: 600 }}>{error}</div>
          </div>
        )}

        {!isLoading && !error && data && (
          <>
            {/* 1. Mini Summary Strip */}
            <div className={styles.miniStrip}>
              <div className={styles.miniStripItem}>
                <span className={styles.miniStripLabel}>Ngày công</span>
                <span className={styles.miniStripValue}>
                  {data.summary.actualWorkDays.toFixed(1)} / {data.summary.expectedWorkDays} ngày
                </span>
              </div>
              <div className={styles.miniStripItem}>
                <span className={styles.miniStripLabel}>Đi muộn / Về sớm</span>
                <span className={styles.miniStripValue}>
                  {data.summary.lateCount} muộn • {data.summary.earlyLeaveCount} sớm
                </span>
              </div>
              <div className={styles.miniStripItem}>
                <span className={styles.miniStripLabel}>Nghỉ có phép</span>
                <span className={styles.miniStripValue}>
                  {data.summary.approvedLeaveDays.toFixed(1)} ngày
                </span>
              </div>
              <div className={styles.miniStripItem}>
                <span className={styles.miniStripLabel}>Vắng không phép</span>
                <span
                  className={styles.miniStripValue}
                  style={{
                    color:
                      data.summary.unexcusedAbsenceDays > 0 ? 'var(--danger)' : 'inherit',
                  }}
                >
                  {data.summary.unexcusedAbsenceDays.toFixed(1)} ngày ({data.summary.diligenceRate.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* 2. Bảng Ma Trận Ngày Công Chi Tiết (dailyDetails) */}
            <div className={styles.matrixWrapper}>
              <table className={styles.matrixTable}>
                <thead>
                  <tr>
                    <th className={styles.mTh}>Ngày</th>
                    <th className={styles.mTh}>Trạng thái</th>
                    <th className={styles.mTh}>Check-in</th>
                    <th className={styles.mTh}>Check-out</th>
                    <th className={styles.mTh}>Giờ làm</th>
                    <th className={styles.mTh}>GPS</th>
                    <th className={styles.mTh}>Ghi chú / Đơn nghỉ</th>
                  </tr>
                </thead>
                <tbody>
                  {data.dailyDetails.map((day) => {
                    const isWk = day.isWeekend;
                    return (
                      <tr
                        key={day.date}
                        className={`${styles.mTr} ${isWk ? styles.rowWeekend : ''}`}
                      >
                        {/* Cột Ngày */}
                        <td className={styles.mTd}>
                          <div className={styles.dateCell}>
                            <span className={styles.dateText}>{formatDate(day.date)}</span>
                            <span className={styles.dayOfWeekText}>
                              {day.dayOfWeekVietnamese}
                            </span>
                          </div>
                        </td>

                        {/* Cột Trạng thái */}
                        <td className={styles.mTd}>
                          {getDayStatusBadge(day.dayStatus, day.dayStatusDescription)}
                        </td>

                        {/* Cột Check-in */}
                        <td className={styles.mTd}>
                          <span className={styles.timeCell}>
                            {day.attendance?.checkInTime
                              ? formatTimeOnly(day.attendance.checkInTime)
                              : '—'}
                          </span>
                        </td>

                        {/* Cột Check-out */}
                        <td className={styles.mTd}>
                          <span className={styles.timeCell}>
                            {day.attendance?.checkOutTime
                              ? formatTimeOnly(day.attendance.checkOutTime)
                              : '—'}
                          </span>
                        </td>

                        {/* Cột Giờ làm */}
                        <td className={styles.mTd}>
                          {day.attendance?.totalWorkingHours !== null &&
                          day.attendance?.totalWorkingHours !== undefined ? (
                            <span style={{ fontWeight: 600 }}>
                              {day.attendance.totalWorkingHours.toFixed(1)}h
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>

                        {/* Cột GPS */}
                        <td className={styles.mTd}>
                          {day.attendance?.checkInDistance !== null &&
                          day.attendance?.checkInDistance !== undefined ? (
                            <span className={styles.distanceBadge}>
                              {day.attendance.checkInDistance.toFixed(1)}m
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>

                        {/* Cột Ghi chú / Đơn nghỉ liên kết */}
                        <td className={styles.mTd}>
                          {day.leaveRequest ? (
                            <div className={styles.leaveInfoWrapper}>
                              <span className={styles.leaveTypeBadge}>
                                {day.leaveRequest.leaveTypeDescription} (
                                {day.leaveRequest.durationType === 'FULL_DAY'
                                  ? 'Cả ngày'
                                  : day.leaveRequest.durationType === 'MORNING'
                                    ? 'Sáng'
                                    : 'Chiều'}
                                )
                              </span>
                              <span
                                className={styles.leaveReasonText}
                                title={day.leaveRequest.reason}
                              >
                                {day.leaveRequest.reason}
                              </span>
                              {day.leaveRequest.approverName && (
                                <span className={styles.leaveApproverText}>
                                  Duyệt bởi: {day.leaveRequest.approverName}
                                </span>
                              )}
                              {day.leaveRequest.attachmentUrl && (

                                <a
                                  href={day.leaveRequest.attachmentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.leaveLink}
                                >
                                  Minh chứng <ExternalLink size={11} />
                                </a>
                              )}
                            </div>
                          ) : day.attendance?.notes ? (
                            <span style={{ color: 'var(--text-secondary)' }}>
                              {day.attendance.notes}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
