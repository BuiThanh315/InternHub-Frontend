import React from 'react';
import { Users, Briefcase, Clock, CalendarDays, AlertTriangle } from 'lucide-react';
import { Skeleton } from '../../../../../components/common';
import type { AttendanceReportKpiCardsProps } from './AttendanceReportKpiCards.types';
import styles from './AttendanceReportKpiCards.module.css';

export const AttendanceReportKpiCards: React.FC<AttendanceReportKpiCardsProps> = ({
  data,
  isLoading = false,
}) => {
  if (isLoading || !data) {
    return (
      <div className={styles.container}>
        <div className={styles.cardsGrid}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.kpiCard}>
              <div className={styles.cardHeader}>
                <Skeleton width="90px" height="14px" />
                <Skeleton width="36px" height="36px" style={{ borderRadius: '8px' }} />
              </div>
              <Skeleton width="70px" height="28px" />
              <Skeleton width="120px" height="14px" />
            </div>
          ))}
        </div>
        <div className={styles.distributionCard}>
          <Skeleton width="180px" height="16px" />
          <Skeleton width="100%" height="10px" style={{ borderRadius: '9999px' }} />
        </div>
      </div>
    );
  }


  const {
    totalInterns = 0,
    overallDiligenceRate = 0,
    totalActualWorkDays = 0,
    totalExpectedWorkDays = 0,
    totalLateCount = 0,
    totalEarlyLeaveCount = 0,
    totalApprovedLeaveDays = 0,
    criticalInternsCount = 0,
    totalUnexcusedAbsenceDays = 0,
    statusDistribution = { EXCELLENT: 0, GOOD: 0, WARNING: 0, CRITICAL: 0 },
    leaveReasonBreakdown = {
      SICK: 0,
      PERSONAL: 0,
      ACADEMIC_EXAM: 0,
      BEREAVEMENT: 0,
      OTHER: 0,
    },
  } = data;

  const actualWorkPercent =
    totalExpectedWorkDays > 0
      ? Math.round((totalActualWorkDays / totalExpectedWorkDays) * 1000) / 10
      : 100;

  // Tính phần trăm phân bổ kỷ luật
  const totalInDist = totalInterns || 1;
  const pExcellent = Math.round(((statusDistribution.EXCELLENT || 0) / totalInDist) * 100);
  const pGood = Math.round(((statusDistribution.GOOD || 0) / totalInDist) * 100);
  const pWarning = Math.round(((statusDistribution.WARNING || 0) / totalInDist) * 100);
  const pCritical = Math.round(((statusDistribution.CRITICAL || 0) / totalInDist) * 100);

  // Tính phần trăm cơ cấu lý do nghỉ phép
  const totalLeavesInSum =
    Object.values(leaveReasonBreakdown).reduce((sum, count) => sum + (count || 0), 0) ||
    totalApprovedLeaveDays ||
    1;
  const sickDays = leaveReasonBreakdown?.SICK || 0;
  const personalDays = leaveReasonBreakdown?.PERSONAL || 0;
  const examDays = leaveReasonBreakdown?.ACADEMIC_EXAM || 0;
  const bereavementDays = leaveReasonBreakdown?.BEREAVEMENT || 0;
  const otherDays = leaveReasonBreakdown?.OTHER || 0;

  const pSick = Math.round((sickDays / totalLeavesInSum) * 100);
  const pPersonal = Math.round((personalDays / totalLeavesInSum) * 100);
  const pExam = Math.round((examDays / totalLeavesInSum) * 100);
  const pBereavement = Math.round((bereavementDays / totalLeavesInSum) * 100);
  const pOther = Math.round((otherDays / totalLeavesInSum) * 100);

  return (
    <div className={styles.container}>
      <div className={styles.cardsGrid}>
        {/* Card 1: Tổng Quân Số & Tỷ lệ chuyên cần */}
        <div className={styles.kpiCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Tổng Quân Số</span>
            <div className={`${styles.iconWrapper} ${styles.iconPrimary}`}>
              <Users size={20} />
            </div>
          </div>
          <div className={styles.cardValueRow}>
            <span className={styles.cardValue}>{totalInterns}</span>
            <span className={styles.cardUnit}>thực tập sinh</span>
          </div>
          <div className={styles.cardSubtext}>
            Chuyên cần TB:{' '}
            <span className={styles.badgeSubtext}>{overallDiligenceRate.toFixed(1)}%</span>
          </div>
        </div>

        {/* Card 2: Ngày Công Thực Tế */}
        <div className={styles.kpiCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Ngày Công Thực Tế</span>
            <div className={`${styles.iconWrapper} ${styles.iconSuccess}`}>
              <Briefcase size={20} />
            </div>
          </div>
          <div className={styles.cardValueRow}>
            <span className={styles.cardValue}>{totalActualWorkDays.toFixed(1)}</span>
            <span className={styles.cardUnit}>/ {totalExpectedWorkDays} ngày</span>
          </div>
          <div className={styles.cardSubtext}>
            Đạt <span className={styles.badgeSubtext}>{actualWorkPercent}%</span> kế hoạch
          </div>
        </div>

        {/* Card 3: Đi Muộn & Về Sớm */}
        <div className={styles.kpiCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Đi Muộn / Về Sớm</span>
            <div className={`${styles.iconWrapper} ${styles.iconWarning}`}>
              <Clock size={20} />
            </div>
          </div>
          <div className={styles.cardValueRow}>
            <span className={styles.cardValue}>{totalLateCount}</span>
            <span className={styles.cardUnit}>lượt muộn</span>
          </div>
          <div className={styles.cardSubtext}>
            <span>{totalEarlyLeaveCount} lượt về sớm</span>
          </div>
        </div>

        {/* Card 4: Nghỉ Phép Hợp Lệ */}
        <div className={styles.kpiCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Nghỉ Có Phép</span>
            <div className={`${styles.iconWrapper} ${styles.iconInfo}`}>
              <CalendarDays size={20} />
            </div>
          </div>
          <div className={styles.cardValueRow}>
            <span className={styles.cardValue}>{totalApprovedLeaveDays.toFixed(1)}</span>
            <span className={styles.cardUnit}>ngày công</span>
          </div>
          <div className={styles.cardSubtext}>
            <span>Đơn đã được phê duyệt</span>
          </div>
        </div>

        {/* Card 5: Cảnh Báo Kỷ Luật */}
        <div className={`${styles.kpiCard} ${criticalInternsCount > 0 ? styles.cardCritical : ''}`}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Cảnh Báo Kỷ Luật</span>
            <div className={`${styles.iconWrapper} ${styles.iconDanger}`}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className={styles.cardValueRow}>
            <span className={styles.cardValue}>{criticalInternsCount}</span>
            <span className={styles.cardUnit}>TTS báo động</span>
          </div>
          <div className={styles.cardSubtext}>
            <span className={styles.badgeDanger}>{totalUnexcusedAbsenceDays.toFixed(1)}</span>{' '}
            ngày vắng không phép
          </div>
        </div>
      </div>

      {/* Lưới Phân Bổ Kép (Phân Bổ Kỷ Luật & Cơ Cấu Lý Do Nghỉ Phép) */}
      <div className={styles.metricsDualGrid}>
        {/* 1. Thanh Phân Bổ Kỷ Luật (Diligence Distribution Bar) */}
        <div className={styles.distributionCard}>
          <div className={styles.distributionHeader}>
            <span className={styles.distributionTitle}>Phân Bổ Kỷ Luật Toàn Quân Số</span>
            <div className={styles.distributionLegend}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.dotExcellent}`} />
                <span>Xuất sắc: {statusDistribution.EXCELLENT || 0} ({pExcellent}%)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.dotGood}`} />
                <span>Tốt: {statusDistribution.GOOD || 0} ({pGood}%)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.dotWarning}`} />
                <span>Cảnh báo: {statusDistribution.WARNING || 0} ({pWarning}%)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.dotCritical}`} />
                <span>Báo động: {statusDistribution.CRITICAL || 0} ({pCritical}%)</span>
              </div>
            </div>
          </div>

          <div className={styles.progressBarTrack} title="Tỷ lệ phân bổ kỷ luật">
            <div
              className={`${styles.barSegment} ${styles.segExcellent}`}
              style={{ width: `${pExcellent}%` }}
            />
            <div
              className={`${styles.barSegment} ${styles.segGood}`}
              style={{ width: `${pGood}%` }}
            />
            <div
              className={`${styles.barSegment} ${styles.segWarning}`}
              style={{ width: `${pWarning}%` }}
            />
            <div
              className={`${styles.barSegment} ${styles.segCritical}`}
              style={{ width: `${pCritical}%` }}
            />
          </div>
        </div>

        {/* 2. Thanh Cơ Cấu Lý Do Nghỉ Phép (Leave Reason Breakdown) */}
        <div className={styles.distributionCard}>
          <div className={styles.distributionHeader}>
            <span className={styles.distributionTitle}>
              Cơ Cấu Lý Do Nghỉ Phép ({totalApprovedLeaveDays.toFixed(1)} ngày)
            </span>
            <div className={styles.distributionLegend}>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.dotSick}`} />
                <span>Ốm đau: {sickDays.toFixed(1)}n ({pSick}%)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.dotPersonal}`} />
                <span>Việc riêng: {personalDays.toFixed(1)}n ({pPersonal}%)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.dotExam}`} />
                <span>Thi cử: {examDays.toFixed(1)}n ({pExam}%)</span>
              </div>
              <div className={styles.legendItem}>
                <span className={`${styles.legendDot} ${styles.dotBereavement}`} />
                <span>Tang lễ: {bereavementDays.toFixed(1)}n ({pBereavement}%)</span>
              </div>
              {otherDays > 0 && (
                <div className={styles.legendItem}>
                  <span className={`${styles.legendDot} ${styles.dotOther}`} />
                  <span>Khác: {otherDays.toFixed(1)}n ({pOther}%)</span>
                </div>
              )}
            </div>
          </div>

          <div className={styles.progressBarTrack} title="Cơ cấu lý do nghỉ phép">
            <div
              className={`${styles.barSegment} ${styles.segSick}`}
              style={{ width: `${pSick}%` }}
            />
            <div
              className={`${styles.barSegment} ${styles.segPersonal}`}
              style={{ width: `${pPersonal}%` }}
            />
            <div
              className={`${styles.barSegment} ${styles.segExam}`}
              style={{ width: `${pExam}%` }}
            />
            <div
              className={`${styles.barSegment} ${styles.segBereavement}`}
              style={{ width: `${pBereavement}%` }}
            />
            <div
              className={`${styles.barSegment} ${styles.segOther}`}
              style={{ width: `${pOther}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

