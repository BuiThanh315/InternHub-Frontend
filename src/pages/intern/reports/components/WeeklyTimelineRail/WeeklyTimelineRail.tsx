import React from 'react';
import { Calendar, CheckCircle2, Clock, FileText, Star, Award } from 'lucide-react';
import { formatDate } from '../../../../../utils/formatters';
import type { WeeklyTimelineRailProps } from './WeeklyTimelineRail.types';
import type { WeeklyReportStatus } from '../../../../../types';
import styles from './WeeklyTimelineRail.module.css';

export const WeeklyTimelineRail: React.FC<WeeklyTimelineRailProps> = ({
  timeline,
  selectedWeekNumber,
  onSelectWeek,
}) => {
  const getStatusLabel = (status: WeeklyReportStatus): string => {
    switch (status) {
      case 'REVIEWED':
        return 'Đã đánh giá';
      case 'SUBMITTED':
        return 'Đã nộp';
      case 'DRAFT':
        return 'Bản nháp';
      case 'NOT_SUBMITTED':
      default:
        return 'Chưa nộp';
    }
  };

  const getStatusClass = (status: WeeklyReportStatus): string => {
    switch (status) {
      case 'REVIEWED':
        return styles.statusReviewed;
      case 'SUBMITTED':
        return styles.statusSubmitted;
      case 'DRAFT':
        return styles.statusDraft;
      case 'NOT_SUBMITTED':
      default:
        return styles.statusNotSubmitted;
    }
  };

  const getDotClass = (status: WeeklyReportStatus): string => {
    switch (status) {
      case 'REVIEWED':
        return styles.dotReviewed;
      case 'SUBMITTED':
        return styles.dotSubmitted;
      case 'DRAFT':
        return styles.dotDraft;
      case 'NOT_SUBMITTED':
      default:
        return styles.dotNotSubmitted;
    }
  };

  const getStatusIcon = (status: WeeklyReportStatus) => {
    switch (status) {
      case 'REVIEWED':
        return <Award size={12} />;
      case 'SUBMITTED':
        return <CheckCircle2 size={12} />;
      case 'DRAFT':
        return <Clock size={12} />;
      case 'NOT_SUBMITTED':
      default:
        return <FileText size={12} />;
    }
  };

  return (
    <aside className={styles.timelineContainer} aria-label="Trục thời gian các tuần">
      <div className={styles.railHeader}>
        <div className={styles.railTitle}>
          <Calendar size={18} className="text-primary" />
          <span>Trục Tiến Độ Tuần</span>
        </div>
        <span className={styles.railBadge}>
          {timeline.length} tuần
        </span>
      </div>

      <nav className={styles.timelineList}>
        {timeline.map((item) => {
          const isSelected = item.weekNumber === selectedWeekNumber;

          return (
            <button
              key={item.weekNumber}
              type="button"
              className={`${styles.timelineItem} ${
                isSelected ? styles.timelineItemActive : ''
              } ${item.isCurrentWeek ? styles.timelineItemCurrent : ''}`}
              onClick={() => onSelectWeek(item.weekNumber)}
              aria-current={isSelected ? 'true' : undefined}
            >
              <div className={styles.nodeWrapper}>
                <div className={`${styles.nodeDot} ${getDotClass(item.status)}`} />
              </div>

              <div className={styles.itemContent}>
                <div className={styles.weekTitleRow}>
                  <span className={styles.weekTitle}>Tuần {item.weekNumber}</span>
                  {item.isCurrentWeek && (
                    <span className={styles.currentBadge}>Tuần này</span>
                  )}
                </div>

                <div className={styles.dateRange}>
                  {formatDate(item.startDate)} - {formatDate(item.endDate)}
                </div>

                <div className={styles.statusRow}>
                  <span className={`${styles.statusPill} ${getStatusClass(item.status)}`}>
                    {getStatusIcon(item.status)}
                    <span>{getStatusLabel(item.status)}</span>
                  </span>

                  {item.score !== null && item.score !== undefined && (
                    <span className={styles.scoreBadge} title="Điểm đánh giá của Mentor">
                      <Star size={11} fill="currentColor" />
                      <span>{item.score}</span>
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
