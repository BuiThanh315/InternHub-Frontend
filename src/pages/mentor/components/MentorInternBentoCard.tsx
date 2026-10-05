import React from 'react';
import { MoreVertical } from 'lucide-react';
import type { MentorInternTriageItem } from '../../../types';
import styles from './MentorInternBentoCard.module.css';

interface MentorInternBentoCardProps {
  intern: MentorInternTriageItem;
  onClick: () => void;
}

export const MentorInternBentoCard: React.FC<MentorInternBentoCardProps> = ({ intern, onClick }) => {
  const {
    fullName,
    internCode,
    programName,
    currentWeek,
    totalWeeks,
    progressPercent,
    weeklyStatus,
    lastAverageScore,
  } = intern;

  // Tính toán badge hành động theo chuẩn mockup
  const renderStatusBadge = () => {
    switch (weeklyStatus) {
      case 'NEEDS_ASSESSMENT':
        return (
          <span className={styles.badgeWarning}>
            <span className={styles.dotWarning} /> Chưa đánh giá tuần {currentWeek}
          </span>
        );
      case 'OVERDUE_MIDTERM':
        return (
          <span className={styles.badgeDanger}>
            <span className={styles.dotDanger} /> Quá hạn Midterm
          </span>
        );
      case 'COMPLETED':
        return (
          <span className={styles.badgeSuccess}>
            <span className={styles.dotSuccess} /> Hoàn thành
          </span>
        );
      case 'ASSESSED':
      default:
        return (
          <span className={styles.badgeSuccess}>
            <span className={styles.dotSuccess} /> Đã đánh giá tuần {currentWeek}
          </span>
        );
    }
  };

  return (
    <div 
      className={`${styles.card} ${weeklyStatus === 'NEEDS_ASSESSMENT' ? styles.cardBorderWarning : ''} ${weeklyStatus === 'OVERDUE_MIDTERM' ? styles.cardBorderDanger : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* 1. Header: Avatar + Tên + Mã + Menu */}
      <div className={styles.cardHeader}>
        <div className={styles.avatarRow}>
          <div className={styles.avatar}>
            {fullName.charAt(0).toUpperCase()}
          </div>
          <div className={styles.nameBlock}>
            <h4 className={styles.fullName}>{fullName}</h4>
            <span className={styles.internCode}>{internCode}</span>
          </div>
        </div>

        <button 
          type="button" 
          className={styles.menuBtn} 
          onClick={(e) => {
            e.stopPropagation();
          }}
          aria-label="Tác vụ"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      {/* 2. Program Name */}
      <p className={styles.programName}>{programName || 'Chương trình thực tập tiêu chuẩn'}</p>

      {/* 3. Progress Info */}
      <div className={styles.progressRow}>
        <span className={styles.weekLabel}>
          Tuần {currentWeek}/{totalWeeks || 13}
        </span>
        <span className={styles.percentLabel}>{progressPercent}%</span>
      </div>

      {/* 4. Progress Bar (Neon Purple Glow) */}
      <div className={styles.progressBarBg}>
        <div 
          className={styles.progressBarFill} 
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }} 
        />
      </div>

      {/* 5. Bottom Action Row: Status Badge + Average Score */}
      <div className={styles.bottomRow}>
        {renderStatusBadge()}

        {lastAverageScore !== undefined && lastAverageScore > 0 ? (
          <div className={styles.scoreBadge}>
            <span className={styles.scoreNumber}>{lastAverageScore.toFixed(1)}</span>
            <span className={styles.scoreMax}>/5</span>
          </div>
        ) : (
          <span className={styles.scorePlaceholder}>—/5</span>
        )}
      </div>
    </div>
  );
};
