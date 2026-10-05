import React from 'react';
import { CalendarCheck, CheckCircle2, Clock, Award } from 'lucide-react';
import { Skeleton } from '../../../../components/common';
import type { MonthlyAttendanceSummaryResponse } from '../../../../types';
import styles from './AttendanceSummaryCards.module.css';

interface AttendanceSummaryCardsProps {
  summary: MonthlyAttendanceSummaryResponse | null;
  loading: boolean;
}

export const AttendanceSummaryCards: React.FC<AttendanceSummaryCardsProps> = ({
  summary,
  loading,
}) => {
  if (loading) {
    return (
      <div className={styles.cardsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.kpiCard}>
            <Skeleton variant="circular" width="44px" height="44px" />
            <div style={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height="16px" />
              <Skeleton variant="text" width="80%" height="24px" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const totalWorkingDays = summary?.totalWorkingDays ?? 0;
  const onTimeDays = summary?.onTimeDays ?? 0;
  const lateDays = summary?.lateDays ?? 0;
  const earlyLeaveDays = summary?.earlyLeaveDays ?? 0;
  const totalWorkingHours = summary?.totalWorkingHours ?? 0;
  const presentDays = summary?.presentDays ?? totalWorkingDays;

  const attendanceRate =
    presentDays > 0 ? Math.round((onTimeDays / presentDays) * 100) : 100;

  return (
    <div className={styles.cardsGrid}>
      {/* KPI 1: Ngày công thực tế */}
      <div className={styles.kpiCard}>
        <div className={`${styles.iconWrapper} ${styles.iconPrimary}`}>
          <CalendarCheck size={22} />
        </div>
        <div className={styles.contentWrapper}>
          <span className={styles.kpiLabel}>Ngày Công Thực Tế</span>
          <span className={styles.kpiValue}>
            {presentDays} ngày
          </span>
          <span className={styles.kpiSubtext}>
            Tỷ lệ đúng giờ: {attendanceRate}%
          </span>
        </div>
      </div>

      {/* KPI 2: Đi làm đúng giờ */}
      <div className={styles.kpiCard}>
        <div className={`${styles.iconWrapper} ${styles.iconSuccess}`}>
          <CheckCircle2 size={22} />
        </div>
        <div className={styles.contentWrapper}>
          <span className={styles.kpiLabel}>Đúng Giờ Tuyệt Đối</span>
          <span className={styles.kpiValue}>{onTimeDays} ngày</span>
          <span className={styles.kpiSubtext}>
            {presentDays > 0
              ? `${Math.round((onTimeDays / presentDays) * 100)}% số ngày đi làm`
              : 'Chưa có ngày công'}
          </span>
        </div>
      </div>

      {/* KPI 3: Đi muộn / Về sớm */}
      <div className={styles.kpiCard}>
        <div className={`${styles.iconWrapper} ${styles.iconWarning}`}>
          <Clock size={22} />
        </div>
        <div className={styles.contentWrapper}>
          <span className={styles.kpiLabel}>Đi Muộn & Về Sớm</span>
          <span className={styles.kpiValue}>
            {lateDays}M / {earlyLeaveDays}S
          </span>
          <span className={styles.kpiSubtext}>
            {lateDays} lần đi muộn, {earlyLeaveDays} lần về sớm
          </span>
        </div>
      </div>

      {/* KPI 4: Tổng giờ tích lũy */}
      <div className={styles.kpiCard}>
        <div className={`${styles.iconWrapper} ${styles.iconInfo}`}>
          <Award size={22} />
        </div>
        <div className={styles.contentWrapper}>
          <span className={styles.kpiLabel}>Tổng Giờ Tích Lũy</span>
          <span className={styles.kpiValue}>{totalWorkingHours.toFixed(1)} h</span>
          <span className={styles.kpiSubtext}>
            {presentDays > 0
              ? `Trung bình ${(totalWorkingHours / presentDays).toFixed(1)} h/ngày`
              : '0 giờ trung bình'}
          </span>
        </div>
      </div>
    </div>
  );
};
