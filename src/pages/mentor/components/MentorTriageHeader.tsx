import React from 'react';
import { Users, AlertCircle, Clock, Star } from 'lucide-react';
import styles from './MentorTriageHeader.module.css';

interface MentorTriageHeaderProps {
  totalAssigned: number;
  needsWeeklyAssessmentCount: number;
  overdueMidtermCount: number;
  groupAverageScore: number;
  onFilterBadgeClick?: (filterType: 'all' | 'needs-attention' | 'overdue') => void;
}

export const MentorTriageHeader: React.FC<MentorTriageHeaderProps> = ({
  totalAssigned,
  needsWeeklyAssessmentCount,
  overdueMidtermCount,
  groupAverageScore,
  onFilterBadgeClick,
}) => {
  return (
    <div className={styles.triageGrid}>
      {/* 1. Tổng phụ trách */}
      <div 
        className={styles.triageCard}
        onClick={() => onFilterBadgeClick?.('all')}
        role="button"
        tabIndex={0}
      >
        <div className={styles.cardHeader}>
          <span className={styles.label}>Tổng phụ trách</span>
          <Users size={16} className={styles.iconMuted} />
        </div>
        <div className={styles.valueRow}>
          <span className={styles.number}>{totalAssigned}</span>
        </div>
      </div>

      {/* 2. Cần đánh giá tuần này (Có border cam nổi bật cảnh báo) */}
      <div 
        className={`${styles.triageCard} ${needsWeeklyAssessmentCount > 0 ? styles.alertCardWarning : ''}`}
        onClick={() => onFilterBadgeClick?.('needs-attention')}
        role="button"
        tabIndex={0}
      >
        <div className={styles.cardHeader}>
          <span className={`${styles.label} ${needsWeeklyAssessmentCount > 0 ? styles.labelWarning : ''}`}>
            Cần đánh giá tuần này
          </span>
          <Clock size={16} className={needsWeeklyAssessmentCount > 0 ? styles.iconWarning : styles.iconMuted} />
        </div>
        <div className={styles.valueRow}>
          <span className={`${styles.number} ${needsWeeklyAssessmentCount > 0 ? styles.numberWarning : ''}`}>
            {needsWeeklyAssessmentCount}
          </span>
          {needsWeeklyAssessmentCount > 0 && (
            <span className={styles.badgePulse}>Cần xử lý</span>
          )}
        </div>
      </div>

      {/* 3. Quá hạn Midterm */}
      <div 
        className={`${styles.triageCard} ${overdueMidtermCount > 0 ? styles.alertCardDanger : ''}`}
        onClick={() => onFilterBadgeClick?.('overdue')}
        role="button"
        tabIndex={0}
      >
        <div className={styles.cardHeader}>
          <span className={`${styles.label} ${overdueMidtermCount > 0 ? styles.labelDanger : ''}`}>
            Quá hạn Midterm
          </span>
          <AlertCircle size={16} className={overdueMidtermCount > 0 ? styles.iconDanger : styles.iconMuted} />
        </div>
        <div className={styles.valueRow}>
          <span className={`${styles.number} ${overdueMidtermCount > 0 ? styles.numberDanger : ''}`}>
            {overdueMidtermCount}
          </span>
        </div>
      </div>

      {/* 4. Điểm TB nhóm */}
      <div className={styles.triageCard}>
        <div className={styles.cardHeader}>
          <span className={styles.label}>Điểm TB nhóm</span>
          <Star size={16} className={styles.iconGold} />
        </div>
        <div className={styles.valueRow}>
          <span className={styles.number}>{groupAverageScore > 0 ? groupAverageScore.toFixed(1) : '—'}</span>
          <span className={styles.subtext}>/ 5</span>
        </div>
      </div>
    </div>
  );
};
